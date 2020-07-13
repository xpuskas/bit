import { ExtensionManifest } from '@teambit/harmony';
import componentResolverProvider from './component-resolver.provider';
import { WorkspaceExt } from '@bit/bit.core.workspace';
import { ScopeExtension } from '@bit/bit.core.scope';

export const ComponentResolverExt: ExtensionManifest = {
  name: 'ComponentResolver',
  dependencies: [WorkspaceExt, ScopeExtension],
  provider: componentResolverProvider
};
