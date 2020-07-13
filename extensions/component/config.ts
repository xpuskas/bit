import { ExtensionDataList } from 'bit-bin/consumer/config/extension-data';
import { Compilers, Testers } from 'bit-bin/consumer/config/abstract-config';
import { ComponentOverridesData } from 'bit-bin/consumer/config/component-overrides';
// import CompilerExtension from 'bit-bin/legacy-extensions/compiler-extension';
// import TesterExtension from 'bit-bin/legacy-extensions/tester-extension';
// import { CustomResolvedPath } from 'bit-bin/consumer/component/consumer-component';
// import { ComponentOverridesData } from 'bit-bin/consumer/config/component-overrides';

type LegacyConfigProps = {
  lang?: string;
  compiler?: string | Compilers;
  tester?: string | Testers;
  bindingPrefix: string;
  extensions?: ExtensionDataList;
  overrides?: ComponentOverridesData;
};

/**
 * in-memory representation of the component configuration.
 */
export default class Config {
  constructor(
    /**
     * configured extensions
     */
    readonly extensions: ExtensionDataList,

    readonly legacyProperties?: LegacyConfigProps
  ) {}
}
