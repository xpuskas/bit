import { BuildTask, BuildContext, BuildResults } from '../builder';

export class ScreenshotTask implements BuildTask {
  constructor(readonly extensionId: string) {}
  async execute(context: BuildContext): Promise<BuildResults | any> {
    const capsules = context.capsuleGraph.capsules;
    capsules.map(({ id, capsule }) => {
      //TODO: create screenshot and save file
    });

    const components = [{ id: 'asd', data: 'asdasd', errors: ['asdasd'] }];
    return {
      components,
      artifacts: [],
    };
  }
}
