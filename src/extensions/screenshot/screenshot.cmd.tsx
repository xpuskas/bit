// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Color } from 'ink';
import { CommandOptions, Command } from '../cli';

type ScreenshotCmdArgs = [string];

export class ScreenshotCmd implements Command {
  name = 'screenshot <componentId>';
  description = 'Create screenshot';
  options = [] as CommandOptions;
  shortDescription = '';
  alias = '';
  group = '';

  constructor() {}

  async render(args: ScreenshotCmdArgs, options: any) {
    return <Color green>tar path: url</Color>;
  }

  async json([componentId]: ScreenshotCmdArgs) {
    return {
      data: 'screenshot',
      code: 0,
    };
  }
}
