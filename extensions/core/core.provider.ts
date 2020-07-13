import { Harmony } from '@teambit/harmony';
import { Workspace } from '@bit/bit.core.workspace';
import { ScopeExtension } from '@bit/bit.core.scope';
import { Config } from '@bit/bit.core.config';
import { Logger } from '@bit/bit.core.logger';

import Core from './core';

export type CoreDeps = [Config, Logger, Workspace, ScopeExtension];

export type CoreConfig = {};

export default async function provideCore(
  [config, logger, workspace, scope]: CoreDeps,
  _config,
  _slots,
  harmony: Harmony
) {
  // TODO: change to get the maybe value
  const actualConfig = config.type ? config : undefined;
  const core = new Core(harmony, actualConfig, logger.createLogPublisher('core'), scope, workspace);
  await core.init();
  return core;
}
