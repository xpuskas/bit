import { Environments } from '../environments';
import { BitCliExt, BitCli } from '../cli';
import { Component } from '../component';
import { StartCmd } from './start.cmd';
import { Workspace, WorkspaceExt } from '../workspace';
import { ComposerService } from './composer.service';

/**
 * Composer is the Bit dev-server.
 */
export class Composer {
  static dependencies = [Environments, BitCliExt, WorkspaceExt];

  constructor(
    /**
     * environments extension api.
     */
    private envs: Environments,

    /**
     * composer service
     */
    readonly service: ComposerService
  ) {}

  /**
   * start an instance of composer.
   */
  async start(components: Component[]) {
    const envRuntime = await this.envs.createEnvironment(components);
    const devServers = envRuntime.run(this.service);
    return devServers;
  }

  static async provider([envs, cli, workspace]: [Environments, BitCli, Workspace]) {
    const composerService = new ComposerService();
    const composer = new Composer(envs, composerService);
    cli.register(new StartCmd(composer, workspace));
    return composer;
  }
}
