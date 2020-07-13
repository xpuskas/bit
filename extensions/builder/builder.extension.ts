import { Environments } from '@bit/bit.core.environments';
import { WorkspaceExt, Workspace } from '@bit/bit.core.workspace';
import { BuilderCmd } from './run.cmd';
import { Component } from '@bit/bit.core.component';
import { BuilderService } from './builder.service';
import { BitId } from 'bit-bin/bit-id';
import { ScopeExtension } from '@bit/bit.core.scope';
import { IsolatorExtension } from '@bit/bit.core.isolator';
import { CLIExtension } from '@bit/bit.core.cli';
import { ReporterExt, Reporter } from '@bit/bit.core.reporter';
import { LoggerExt, Logger } from '@bit/bit.core.logger';

/**
 * extension config type.
 */
export type BuilderConfig = {
  /**
   * number of components to build in parallel.
   */
  parallel: 10;
};

export class BuilderExtension {
  static id = '@teambit/builder';
  /**
   * extension dependencies
   */
  static dependencies = [
    CLIExtension,
    Environments,
    WorkspaceExt,
    ScopeExtension,
    IsolatorExtension,
    ReporterExt,
    LoggerExt
  ];

  constructor(
    /**
     * environments extension.
     */
    private envs: Environments,

    /**
     * workspace extension.
     */
    private workspace: Workspace,

    /**
     * builder service.
     */
    private service: BuilderService
  ) {}

  async tagListener(ids: BitId[]) {
    // @todo: some processes needs dependencies/dependents of the given ids
    const components = await this.workspace.getMany(ids);
    return this.build(components);
  }

  /**
   * build given components for release.
   */
  async build(components: Component[]) {
    const envs = await this.envs.createEnvironment(components);
    const buildResult = await envs.run(this.service);
    return buildResult;
  }

  static async provider([cli, envs, workspace, scope, isolator, reporter, logger]: [
    CLIExtension,
    Environments,
    Workspace,
    ScopeExtension,
    IsolatorExtension,
    Reporter,
    Logger
  ]) {
    const logPublisher = logger.createLogPublisher(BuilderExtension.id);
    const builderService = new BuilderService(isolator, workspace, logPublisher);
    const builder = new BuilderExtension(envs, workspace, builderService);
    const func = builder.tagListener.bind(builder);
    if (scope) scope.onTag(func);

    cli.register(new BuilderCmd(builder, workspace, reporter));
    return builder;
  }
}
