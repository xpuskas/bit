import React from 'react';
import ReactDOM from 'react-dom';
import { Slot } from '@teambit/harmony';
import { WorkspaceUI } from '@bit/bit.core.workspace';
import { GraphQlUI } from '@bit/bit.core.graphql';
// import * as serviceWorker from './serviceWorker';

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
/**
 * extension
 */
export class UIRuntimeExtension {
  static dependencies = [WorkspaceUI, GraphQlUI];

  static slots = [Slot.withType()];

  constructor(
    /**
     * workspace UI extension.
     */
    private workspace: WorkspaceUI,

    /**
     * GraphQL extension.
     */
    private graphql: GraphQlUI
  ) {}

  render() {
    ReactDOM.render(
      <React.StrictMode>{this.graphql.getProvider(this.workspace.getMain())}</React.StrictMode>,
      document.getElementById('root')
    );
  }

  static async provider([workspace, graphql]: [WorkspaceUI, GraphQlUI]) {
    return new UIRuntimeExtension(workspace, graphql);
  }
}
