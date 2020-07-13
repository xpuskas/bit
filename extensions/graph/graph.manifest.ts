import { ExtensionManifest } from '@teambit/harmony';
import { provide } from './graph.provider';
import { WorkspaceExt } from '@bit/bit.core.workspace';
import { ScopeExtension } from '@bit/bit.core.scope';
import { ComponentFactoryExt } from '@bit/bit.core.component';

export default {
  name: 'graph',
  dependencies: [WorkspaceExt, ScopeExtension, ComponentFactoryExt],
  provider: provide
} as ExtensionManifest;
