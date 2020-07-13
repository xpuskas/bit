import { WorkspaceExt } from '@bit/bit.core.workspace';
import { CompileExt } from '@bit/bit.core.compiler';
import { provideWatch } from './watch.provider';
import { CLIExtension } from '@bit/bit.core.cli';

export default {
  name: 'Watch',
  dependencies: [CLIExtension, CompileExt, WorkspaceExt],
  provider: provideWatch
};
