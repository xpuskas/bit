import { ExtensionManifest } from '@teambit/harmony';
import { WorkspaceExt } from '@bit/bit.core.workspace';
import { Environments } from '@bit/bit.core.environments';
import { Workspace } from '@bit/bit.core.workspace';
import { CLIExtension } from '@bit/bit.core.cli';
import { CompileCmd } from './compiler.cmd';
import { Compile } from './compile';
import { CompilerTask } from './compiler.task';

const name = 'compile';

export default {
  name,
  dependencies: [CLIExtension, WorkspaceExt, Environments],
  provider: provideCompile
} as ExtensionManifest;

export type CompileDeps = [CLIExtension, Workspace, Environments];

export async function provideCompile([cli, workspace, envs]: CompileDeps) {
  const compilerTask = new CompilerTask(name);
  const compile = new Compile(workspace, envs, compilerTask);
  cli.register(new CompileCmd(compile));
  return compile;
}
