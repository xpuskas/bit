import { WorkspaceUI } from '@bit/bit.core.workspace';

export class DocsUI {
  static dependencies = [WorkspaceUI];

  static async provider([workspace]: [WorkspaceUI]) {
    workspace.registerMenuItem({
      label: 'Overview',
      onClick: () => {}
    });
    return new DocsUI();
  }
}
