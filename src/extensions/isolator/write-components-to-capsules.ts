import path from 'path';
import ConsumerComponent from '../../consumer/component';
import { getComponentLinks } from '../../links/link-generator';
import { getManipulateDirForComponentWithDependencies } from '../../consumer/component-ops/manipulate-dir';

import { ComponentWithDependencies } from '../../scope';
import ManyComponentsWriter, { ManyComponentsWriterParams } from '../../consumer/component-ops/many-components-writer';

import CapsuleList from './capsule-list';
import Graph from '../../scope/graph/graph'; // TODO: use graph extension?
import { BitId, BitIds } from '../../bit-id';
import { Dependencies } from '../../consumer/component/dependencies';
import Symlink from '../../links/symlink';
import ComponentMap from '../../consumer/bit-map/component-map';
import PackageJsonFile from '../../consumer/component/package-json-file';
import componentIdToPackageName from '../../utils/bit/component-id-to-package-name';
import { Capsule } from './capsule';

const CAPSULE_SOURCE_DIR = 'src';

type WriteCompsResult = { component: ConsumerComponent; packageJsonWithBitDeps: PackageJsonFile };

export default async function writeComponentsToCapsules(
  components: ConsumerComponent[],
  graph: Graph,
  capsuleList: CapsuleList,
  packageManager: string,
  workspaceDir?: string
): Promise<WriteCompsResult[]> {
  components = components.map(c => c.clone());
  const componentsWithDependencies = components.map(component => {
    const getClonedFromGraph = (id: BitId): ConsumerComponent => {
      const consumerComponent = graph.node(id.toString());
      if (!consumerComponent) {
        throw new Error(
          `unable to find the dependency "${id.toString()}" of "${component.id.toString()}" in the graph`
        );
      }
      return consumerComponent.clone();
    };
    const getDeps = (dependencies: Dependencies) => dependencies.get().map(dep => getClonedFromGraph(dep.id));
    const dependencies = getDeps(component.dependencies);
    const devDependencies = getDeps(component.devDependencies);
    const extensionDependencies = component.extensions.extensionsBitIds.map(getClonedFromGraph);
    return new ComponentWithDependencies({
      component,
      dependencies,
      devDependencies,
      extensionDependencies
    });
  });
  componentsWithDependencies.map(cmp => normalizeComponentDir(cmp));
  const componentsExistingOnTheFs: ComponentWithDependencies[] = [];
  const componentsNotExistingOnTheFs: ComponentWithDependencies[] = [];
  componentsWithDependencies.forEach(c => {
    if (c.component.componentMap && workspaceDir) componentsExistingOnTheFs.push(c);
    else componentsNotExistingOnTheFs.push(c);
  });
  const results: WriteCompsResult[] = [];
  if (componentsNotExistingOnTheFs.length) {
    const scopeResults = await writeScopeComponents(componentsNotExistingOnTheFs, capsuleList, packageManager);
    results.push(...scopeResults);
  }
  if (componentsExistingOnTheFs.length) {
    const consumerResults = await writeConsumerComponents(
      componentsExistingOnTheFs,
      capsuleList,
      workspaceDir as string
    );
    results.push(...consumerResults);
  }
  return results;
}

async function writeConsumerComponents(
  compsWithDeps: ComponentWithDependencies[],
  capsuleList: CapsuleList,
  workspaceDir: string
): Promise<WriteCompsResult[]> {
  return Promise.all(
    compsWithDeps.map(async componentWithDependencies => {
      const componentToWrite = componentWithDependencies.component;
      const capsule = capsuleList.getCapsule(componentToWrite.id);
      if (!capsule) throw new Error(`capsule is missing for ${componentToWrite.id.toString()}`);
      const componentMap = componentToWrite.componentMap as ComponentMap;
      componentToWrite.files;
      componentToWrite.files.forEach(file => file.updatePaths({ newBase: CAPSULE_SOURCE_DIR }));
      componentToWrite.mainFile = path.join(CAPSULE_SOURCE_DIR, componentToWrite.mainFile);
      if (componentMap.hasRootDir()) {
        const componentOnWorkspace = path.join(workspaceDir as string, componentMap.rootDir as string);
        const componentOnCapsule = path.join(capsule?.wrkDir as string, CAPSULE_SOURCE_DIR);
        const symlink = new Symlink(componentOnWorkspace, componentOnCapsule, componentToWrite.id);
        symlink.write();
      } else {
        throw new Error('not implemented yet');
      }
      const packageJson = getCurrentPackageJson(componentToWrite);
      packageJson.workspaceDir = capsule?.wrkDir;
      // const previousPackageJson = await getPreviousPackageJson(capsule);
      // console.log("previousPackageJson", previousPackageJson.main)
      // if (previousPackageJson && previousPackageJson.main) {
      //   packageJson.addOrUpdateProperty('main', previousPackageJson.main as string);
      // }
      await packageJson.write();
      return { component: componentToWrite, packageJsonWithBitDeps: getCurrentPackageJson(componentToWrite, true) };
    })
  );
}

async function getPreviousPackageJson(capsule: Capsule) {
  try {
    const previousPackageJson = await capsule.fs.promises.readFile('package.json', { encoding: 'utf8' });
    return JSON.parse(previousPackageJson);
  } catch (e) {
    // package-json doesn't exist in the capsule, that's fine, it'll be considered as a cache miss
  }
}

async function writeScopeComponents(
  componentsWithDependencies: ComponentWithDependencies[],
  capsuleList: CapsuleList,
  packageManager: string
): Promise<WriteCompsResult[]> {
  const writeToPath = '.';
  const concreteOpts: ManyComponentsWriterParams = {
    componentsWithDependencies,
    writeToPath,
    override: false,
    writePackageJson: true,
    writeConfig: false,
    writeBitDependencies: false,
    createNpmLinkFiles: false,
    saveDependenciesAsComponents: false,
    writeDists: false,
    installNpmPackages: false,
    installPeerDependencies: false,
    addToRootPackageJson: false,
    verbose: false,
    excludeRegistryPrefix: false,
    silentPackageManagerResult: false,
    isolated: true,
    packageManager,
    applyExtensionsAddedConfig: true
  };
  const manyComponentsWriter = new ManyComponentsWriter(concreteOpts);
  await manyComponentsWriter._populateComponentsFilesToWrite();
  componentsWithDependencies.forEach(componentWithDependencies => {
    const links = getComponentLinks({
      component: componentWithDependencies.component,
      dependencies: componentWithDependencies.allDependencies,
      createNpmLinkFiles: false,
      bitMap: manyComponentsWriter.bitMap
    });
    componentWithDependencies.component.dataToPersist.addManyFiles(links.files);
  });
  // write data to capsule
  await Promise.all(
    manyComponentsWriter.writtenComponents.map(async componentToWrite => {
      const capsule = capsuleList.getCapsule(componentToWrite.id);
      if (!capsule) return;
      await componentToWrite.dataToPersist.persistAllToCapsule(capsule, { keepExistingCapsule: true });
    })
  );
  const writtenComponents = manyComponentsWriter.writtenComponents;
  return writtenComponents.map(component => ({
    component,
    packageJsonWithBitDeps: getCurrentPackageJson(component, true)
  }));
}

function normalizeComponentDir(componentWithDependencies: ComponentWithDependencies) {
  const allComponents = [componentWithDependencies.component, ...componentWithDependencies.allDependencies];
  const manipulateDirData = getManipulateDirForComponentWithDependencies(componentWithDependencies);
  allComponents.forEach(component => {
    component.stripOriginallySharedDir(manipulateDirData);
  });
}

export function getCurrentPackageJson(component: ConsumerComponent, writeBitDependencies = false): PackageJsonFile {
  const newVersion = '0.0.1-new';
  const packageJson = PackageJsonFile.createFromComponent('.', component, false);
  if (writeBitDependencies) {
    const getBitDependencies = (dependencies: BitIds) => {
      return dependencies.reduce((acc, depId: BitId) => {
        const packageDependency = depId.hasVersion() ? depId.version : newVersion;
        const packageName = componentIdToPackageName(depId, component.bindingPrefix, component.defaultScope);
        acc[packageName] = packageDependency;
        return acc;
      }, {});
    };
    const bitDependencies = getBitDependencies(component.dependencies.getAllIds());
    const bitDevDependencies = getBitDependencies(component.devDependencies.getAllIds());
    const bitExtensionDependencies = getBitDependencies(component.extensions.extensionsBitIds);
    const addDependencies = (packageJsonFile: PackageJsonFile) => {
      packageJsonFile.addDependencies(bitDependencies);
      packageJsonFile.addDevDependencies({
        ...bitDevDependencies,
        ...bitExtensionDependencies
      });
    };
    addDependencies(packageJson);
  }

  packageJson.addOrUpdateProperty('version', component.id.hasVersion() ? component.id.version : newVersion);
  packageJson.removeDependency('bit-bin');
  return packageJson;
}
