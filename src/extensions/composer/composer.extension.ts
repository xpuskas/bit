import { Environments } from '../environments';
import { BitCliExt, BitCli } from '../cli';
import { Component } from '../component';
import { StartCmd } from './start.cmd';
import { Workspace, WorkspaceExt } from '../workspace';
import { ComposerService } from './composer.service';
import { GraphQLExtension } from '../graphql';

/**
 * Composer is the Bit dev-server.
 */
export class Composer {
  static dependencies = [Environments, BitCliExt, WorkspaceExt, GraphQLExtension];

  constructor(
    /**
     * environments extension api.
     */
    private envs: Environments,

    /**
     * workspace extension api.
     */
    private workspace: Workspace,

    /**
     * graphql extension api.
     */
    private graphql: GraphQLExtension,

    /**
     * composer service
     */
    readonly service: ComposerService
  ) {}

  /**
   * start an instance of composer.
   */
  async start(components?: Component[]) {
    this.graphql.listen();

    // const envRuntime = await this.envs.createEnvironment(components || (await this.workspace.list()));
    // const devServers = envRuntime.run(this.service);
    // return devServers;
  }

  static async provider([envs, cli, workspace, graphql]: [Environments, BitCli, Workspace, GraphQLExtension]) {
    const composerService = new ComposerService();
    const composer = new Composer(envs, workspace, graphql, composerService);
    cli.register(new StartCmd(composer, workspace));
    return composer;
  }
}
