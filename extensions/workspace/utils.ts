import fs from 'fs-extra';
import path from 'path';
import componentIdToPackageName from 'bit-bin/utils/bit/component-id-to-package-name';
import { ResolvedComponent } from '@bit/bit.core.utils';

export async function symlinkCapsulesInNodeModules(isolatedEnvs: ResolvedComponent[]) {
  await Promise.all(
    isolatedEnvs.map(async e => {
      const componentPackageName = componentIdToPackageName(e.component.state._consumer);
      const linkPath = path.join(process.cwd(), 'node_modules', componentPackageName);
      await fs.mkdirp(path.dirname(linkPath));
      await fs.symlink(e.capsule.wrkDir, linkPath);
    })
  );
}

export async function removeExistingLinksInNodeModules(isolatedEnvs: ResolvedComponent[]) {
  await Promise.all(
    isolatedEnvs.map(async e => {
      const componentPackageName = componentIdToPackageName(e.component.state._consumer);
      try {
        await fs.unlink(path.join(process.cwd(), 'node_modules', componentPackageName));
      } catch (err) {
        // if the symlink does not exist - no problem
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    })
  );
}
