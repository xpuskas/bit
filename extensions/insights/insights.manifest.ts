import { ExtensionManifest } from '@teambit/harmony';
import { provide } from './insight.provider';
import { ComponentGraphExt } from '@bit/bit.core.graph';
import { CLIExtension } from '@bit/bit.core.cli';

export default {
  name: 'insights',
  dependencies: [ComponentGraphExt, CLIExtension],
  config: {
    silence: false
  },
  provider: provide
} as ExtensionManifest;
