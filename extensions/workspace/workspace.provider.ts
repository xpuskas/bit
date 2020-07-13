import { Harmony } from '@teambit/harmony';
import { ScopeExtension } from '@bit/bit.core.scope';
import Workspace from './workspace';
import { ComponentFactory } from '@bit/bit.core.component';
import { loadConsumerIfExist } from 'bit-bin/consumer';
import { IsolatorExtension } from '@bit/bit.core.isolator';
import { Logger } from '@bit/bit.core.logger';
import ConsumerComponent from 'bit-bin/consumer/component';
import { DependencyResolverExtension } from '@bit/bit.core.dependency-resolver';
import { Variants } from '@bit/bit.core.variants';
import { WorkspaceExtConfig } from './types';
import { GraphQLExtension } from '@bit/bit.core.graphql';
import workspaceSchema from './workspace.graphql';
import InstallCmd from './install.cmd';
import { CLIExtension } from '@bit/bit.core.cli';
import EjectConfCmd from './eject-conf.cmd';

export type WorkspaceDeps = [
  CLIExtension,
  ScopeExtension,
  ComponentFactory,
  IsolatorExtension,
  DependencyResolverExtension,
  Variants,
  Logger,
  GraphQLExtension
];

export type WorkspaceCoreConfig = {
  /**
   * sets the default location of components.
   */
  componentsDefaultDirectory: string;

  /**
   * default scope for components to be exported to. absolute require paths for components
   * will be generated accordingly.
   */
  defaultScope: string;

  defaultOwner: string;
};

export default async function provideWorkspace(
  [cli, scope, component, isolator, dependencyResolver, variants, logger, graphql]: WorkspaceDeps,
  config: WorkspaceExtConfig,
  _slots,
  harmony: Harmony
) {
  // don't use loadConsumer() here because the consumer might not be available.
  // also, this loadConsumerIfExist() is wrapped with try/catch in order not to break when the
  // consumer can't be loaded due to .bitmap or bit.json issues which are fixed on a later phase
  // open bit init --reset.
  // keep in mind that here is the first place where the consumer is loaded.
  // an unresolved issue here is when running tasks, such as "bit run build" outside of a consumer.
  // we'll have to fix this asap.
  try {
    const consumer = await loadConsumerIfExist();

    if (consumer) {
      const workspace = new Workspace(
        config,
        consumer,
        scope,
        component,
        isolator,
        dependencyResolver,
        variants,
        logger.createLogPublisher('workspace'), // TODO: get the 'worksacpe' name in a better way
        undefined,
        harmony
      );
      // ConsumerComponent.registerOnComponentConfigLegacyLoading(
      //   'workspace',
      //   async (id, componentConfig: ComponentConfig) => {
      //     return workspace.loadExtensions(componentConfig.extensions);
      //   }
      // );
      ConsumerComponent.registerOnComponentConfigLoading('workspace', async id => {
        const wsComponentConfig = await workspace.workspaceComponentConfig(id);
        await workspace.loadExtensions(wsComponentConfig.componentExtensions);
        return wsComponentConfig;
      });

      graphql.register(workspaceSchema(workspace));
      cli.register(new InstallCmd(workspace));
      cli.register(new EjectConfCmd(workspace));

      return workspace;
    }

    return undefined;
  } catch (err) {
    return undefined;
  }
}
