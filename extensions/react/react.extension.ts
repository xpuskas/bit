import { Environments } from '@bit/bit.core.environments';
import { ReactEnv } from './react.env';
import { Logger, LoggerExt } from '@bit/bit.core.logger';
import { JestExtension } from '@bit/bit.core.jest';
import { TypescriptExtension } from '@bit/bit.core.typescript';
import { Compile, CompileExt } from '@bit/bit.core.compiler';
import { TesterExtension } from '@bit/bit.core.tester';
import { PkgExtension } from '@bit/bit.core.pkg';

export type ReactConfig = {
  writeDist: boolean;
  compiler: {};
};

export class React {
  static id = '@teambit/react';
  static dependencies = [
    Environments,
    LoggerExt,
    JestExtension,
    TypescriptExtension,
    CompileExt,
    TesterExtension,
    PkgExtension
  ];

  // createTsCompiler(tsconfig: {}) {}

  setTsConfig() {}

  // @typescript-eslint/no-unused-vars
  static provider([envs, logger, jest, ts, compile, tester, pkg]: [
    Environments,
    Logger,
    JestExtension,
    TypescriptExtension,
    Compile,
    TesterExtension,
    PkgExtension
  ]) {
    // support factories from harmony?
    envs.registerEnv(new ReactEnv(logger.createLogPublisher(this.id), jest, ts, compile, tester, pkg));
    return {};
  }
}
