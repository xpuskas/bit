import { ExtensionManifest } from '@teambit/harmony';
import { BitCliExt } from '@bit/bit.core.cli';
import { WorkspaceExt } from '@bit/bit.core.workspace';
import { FlowsExt } from '@bit/bit.core.flows';
import { provideCompile } from './compile.provider';
import { ScopeExt } from '@bit/bit.core.scope';

export default {
  name: 'bit.core/compile',
  dependencies: [BitCliExt, WorkspaceExt, FlowsExt, ScopeExt],
  provider: provideCompile
} as ExtensionManifest;