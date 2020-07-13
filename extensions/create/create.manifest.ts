import { ExtensionManifest } from '@teambit/harmony';
import { WorkspaceExt } from '@bit/bit.core.workspace';
import { provideCreate } from './create.provider';
import { CLIExtension } from '@bit/bit.core.cli';

export default {
  name: '@teambit/create',
  dependencies: [CLIExtension, WorkspaceExt],
  provider: provideCreate
} as ExtensionManifest;
