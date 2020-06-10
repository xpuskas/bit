import { GraphQLModule } from '@graphql-modules/core';

export interface Schema {
  /**
   * returns the graphql module
   */
  getModule: GraphQLModule;
}
