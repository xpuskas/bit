import path from 'path';
import { Harmony } from '@teambit/harmony';
import { Workspace } from '../workspace';
import ConsumerComponent from '../../consumer/component';
import { BitId } from '../../bit-id';
import { ResolvedComponent } from '../workspace/resolved-component';
import buildComponent from '../../consumer/component-ops/build-component';
import { Component } from '../component';
import { Capsule } from '../isolator/capsule';
import DataToPersist from '../../consumer/component/sources/data-to-persist';
import { Scope } from '../scope';
import { Flows } from '../flows';
import { IdsAndFlows } from '../flows/flows';
import GeneralError from '../../error/general-error';

export type ComponentAndCapsule = {
  consumerComponent: ConsumerComponent;
  component: Component;
  capsule: Capsule;
};

type buildHookResult = { id: BitId; dists?: Array<{ path: string; content: string }> };

export class Compile {
  constructor(private workspace: Workspace, private flows: Flows, private scope: Scope, private harmony: Harmony) {
    const func = this.compileDuringBuild.bind(this);
    if (this.scope?.onBuild) this.scope.onBuild.push(func);
  }

  async compileDuringBuild(ids: BitId[]): Promise<buildHookResult[]> {
    const reportResults = await this.compile(ids.map(id => id.toString()));
    /**
     * {
    result: {
      type: 'flow:result',
      id: [BitId],
      capsule: [Capsule],
      value: [],
      endTime: 2020-04-01T19:48:13.041Z,
      duration: 2
    },
    visited: true
  },

  value can be:
result.value [
  {
    type: 'task:result',
    id: 'help:#@bit/bit.evangalist.extensions.react-ts:transpile',
    value: { dir: 'dist' },
    endTime: 2020-04-01T19:48:18.830Z,
    duration: 5785,
    code: 0
  }
]
     */
    // @ts-ignore please fix once flows.run() get types
    const resultsP: buildHookResult[] = Object.values(reportResults.value).map((reportResult: any) => {
      const result = reportResult.result;
      const id: BitId = result.id;
      if (!result.value || !result.value.length) return { id };
      // @todo: check why this is an array and values are needed
      const distDir = result.value[0].value.dir;
      if (!distDir) {
        throw new Error(
          `compile extension failed on ${id.toString()}, it expects to get "dir" as a result of executing the compilers`
        );
      }
      const distFiles = result.capsule.fs.readdirSync(distDir);
      const distFilesObjects = distFiles.map(distFilePath => {
        const distPath = path.join(distDir, distFilePath);
        return {
          path: distFilePath,
          content: result.capsule.fs.readFileSync(distPath).toString()
        };
      });
      return { id, dists: distFilesObjects };
    });
    return Promise.all(resultsP);
  }

  // @todo: what is the return type here?
  async compile(componentsIds: string[]) {
    const componentAndCapsules = await getComponentsAndCapsules(componentsIds, this.workspace);
    const idsAndTasksArr = componentAndCapsules
      .map(c => {
        const compileConfig = c.component.config.extensions.findCoreExtension('compile')?.config;
        // const compiler = compileConfig ? [compileConfig.compiler] : [];
        const taskName = this.getTaskNameFromCompiler(compileConfig);
        const value = taskName ? [taskName] : [];
        return { id: c.consumerComponent.id, value };
      })
      .filter(i => i.value);
    const idsAndFlows = new IdsAndFlows(...idsAndTasksArr);

    const result = await this.flows.runMultiple(idsAndFlows, { traverse: 'only' });
    return result;
  }

  getTaskNameFromCompiler(compileConfig): string | null {
    if (!compileConfig || !compileConfig.compiler) return null;
    const compiler = compileConfig.compiler as string;
    const compilerExtension = this.harmony.get(compiler);
    if (!compilerExtension)
      throw new Error(`failed to get "${compiler}" extension from Harmony.
the following extensions are available: ${this.harmony.extensionsIds.join(', ')}`);
    const compilerInstance = compilerExtension.instance as any;
    if (!compilerInstance) {
      throw new GeneralError(`failed to get the instance of the compiler "${compiler}".
please make sure the compiler provider returns anything`);
    }
    const defineCompiler = compilerInstance.defineCompiler;
    if (!defineCompiler || typeof defineCompiler !== 'function') {
      throw new GeneralError(`the compiler "${compiler}" instance doesn't have "defineCompiler" function`);
    }
    const compilerDefinition = defineCompiler();
    const taskFile = compilerDefinition.taskFile;
    if (!taskFile) {
      throw new GeneralError(`the "defineCompiler" function of "${compiler}" doesn't return taskFile definition`);
    }
    return taskFile;
  }

  async legacyCompile(componentsIds: string[], params: { verbose: boolean; noCache: boolean }) {
    const populateDistTask = this.populateComponentDist.bind(this, params);
    const writeDistTask = this.writeComponentDist.bind(this);
    await pipeRunTask(componentsIds, populateDistTask, this.workspace);
    return pipeRunTask(componentsIds, writeDistTask, this.workspace);
  }

  populateComponentDist(params: { verbose: boolean; noCache: boolean }, component: ComponentAndCapsule) {
    return buildComponent({
      component: component.consumerComponent,
      scope: this.workspace.consumer.scope,
      consumer: this.workspace.consumer,
      verbose: params.verbose,
      noCache: params.noCache
    });
  }

  async writeComponentDist(componentAndCapsule: ComponentAndCapsule) {
    const dataToPersist = new DataToPersist();
    const distsFiles = componentAndCapsule.consumerComponent.dists.get();
    distsFiles.map(d => d.updatePaths({ newBase: 'dist' }));
    dataToPersist.addManyFiles(distsFiles);
    await dataToPersist.persistAllToCapsule(componentAndCapsule.capsule);
    return distsFiles.map(d => d.path);
  }
}

function getBitIds(componentsIds: string[], workspace: Workspace): BitId[] {
  if (componentsIds.length) {
    return componentsIds.map(idStr => workspace.consumer.getParsedId(idStr));
  }
  return workspace.consumer.bitMap.getAuthoredAndImportedBitIds();
}

async function getResolvedComponents(componentsIds: string[], workspace: Workspace): Promise<ResolvedComponent[]> {
  const bitIds = getBitIds(componentsIds, workspace);
  return workspace.load(bitIds.map(id => id.toString()));
}

async function getComponentsAndCapsules(componentsIds: string[], workspace: Workspace): Promise<ComponentAndCapsule[]> {
  const resolvedComponents = await getResolvedComponents(componentsIds, workspace);
  return Promise.all(
    resolvedComponents.map(async (resolvedComponent: ResolvedComponent) => {
      // @todo: it says id._legacy "do not use this", do I have a better option to get the id?
      const consumerComponent = await workspace.consumer.loadComponent(resolvedComponent.component.id._legacy);
      return {
        consumerComponent,
        component: resolvedComponent.component,
        capsule: resolvedComponent.capsule
      };
    })
  );
}

async function pipeRunTask(ids: string[], task: Function, workspace: Workspace) {
  const components = await getComponentsAndCapsules(ids, workspace);
  const results = await Promise.all(components.map(component => task(component)));
  return { results, components };
}
