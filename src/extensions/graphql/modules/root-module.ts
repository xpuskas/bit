import { GraphQLModule } from '@graphql-modules/core';

export function createRootModule(modules: GraphQLModule[]) {
  return new GraphQLModule({
    imports: modules
  });
}
