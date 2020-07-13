import { ExtensionManifest } from '@teambit/harmony';
import workspaceProvider from './workspace.provider';
import { ScopeExtension } from '@bit/bit.core.scope';
import { ComponentFactoryExt } from '@bit/bit.core.component';
import { IsolatorExtension } from '@bit/bit.core.isolator';
import { LoggerExt } from '@bit/bit.core.logger';
import { DependencyResolverExtension } from '@bit/bit.core.dependency-resolver';
import { VariantsExt } from '@bit/bit.core.variants';
import { EXT_NAME } from './constants';
import { GraphQLExtension } from '@bit/bit.core.graphql';
import { CLIExtension } from '@bit/bit.core.cli';

export default {
  name: EXT_NAME,
  dependencies: [
    CLIExtension,
    ScopeExtension,
    ComponentFactoryExt,
    IsolatorExtension,
    DependencyResolverExtension,
    VariantsExt,
    LoggerExt,
    GraphQLExtension
  ],
  provider: workspaceProvider,
  defineRuntime: 'browser'
} as ExtensionManifest;
