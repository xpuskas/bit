import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import { CLIExtension } from '@bit/bit.core.cli';
import { StartCmd } from './start.cmd';
import { Environments } from '@bit/bit.core.environments';
import { Workspace, WorkspaceExt } from '@bit/bit.core.workspace';
import { GraphQLExtension } from '@bit/bit.core.graphql';
import { Component } from '@bit/bit.core.component';
import createWebpackConfig from './webpack/webpack.config';

export class UIExtension {
  static dependencies = [CLIExtension, Environments, WorkspaceExt, GraphQLExtension];

  constructor(
    /**
     * envs extension.
     */
    private envs: Environments,

    /**
     * graphql extension.
     */
    private graphql: GraphQLExtension,

    /**
     * workspace extension.
     */
    private workspace: Workspace
  ) {}

  static runtimes = {
    ui: '',
    cli: ''
  };

  private createDevServer() {}

  private selectPort() {
    return 3000;
  }

  async createRuntime(components?: Component[]) {
    const server = this.graphql.listen();
    components;
    const config = createWebpackConfig(this.workspace.path, [require.resolve('./ui.runtime')]);
    const compiler = webpack(config);
    const devServer = new WebpackDevServer(compiler);
    devServer.listen(this.selectPort());
    return server;
  }

  static async provider([cli, envs, workspace, graphql]: [CLIExtension, Environments, Workspace, GraphQLExtension]) {
    const ui = new UIExtension(envs, graphql, workspace);
    cli.register(new StartCmd(ui, workspace));
    return ui;
  }
}
