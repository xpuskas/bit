import { EnvService, ExecutionContext } from '../environments';

export class ComposerService implements EnvService {
  async run(context: ExecutionContext) {
    const devServer = context.env.dev(context.workspace, context.components);
    // devServer.listen(3000);
  }
}
