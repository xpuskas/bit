import { GraphQLModule } from '@graphql-modules/core';
import Component from './component';

export default () => {
  return new GraphQLModule({
    typeDefs: `
      type Component {
        id: string
      }
    `,
    resolvers: {
      Component: {
        id: (component: Component) => component.id.toString()
      }
    }
  });
};
