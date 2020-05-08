import { Scope } from './scope';
import { loadScopeIfExist } from 'bit-bin/scope/scope-loader';

export type ScopeConfig = {};

export async function provideScope() {
  const legacyScope = await loadScopeIfExist();
  if (!legacyScope) {
    return undefined;
  }

  return new Scope(legacyScope);
}
