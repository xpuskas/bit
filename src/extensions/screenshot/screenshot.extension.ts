import { LoggerExt, Logger, LogPublisher } from '../logger';
import { CLIExtension } from '../cli';
import { ScreenshotTask } from './screenshot.task';
import { ScreenshotCmd } from './screenshot.cmd';

export type ScreenshotConfig = {
  screenWidth: number;
  screenHeight: number;
  omitBackground: boolean;
};

export class ScreenshotExtension {
  constructor(
    /**
     * extension config
     */
    readonly config: ScreenshotConfig,

    /**
     * extension config
     */
    readonly screenshotTask: ScreenshotTask,

    /**
     * logger extension.
     */
    readonly logger: LogPublisher
  ) {}

  static id = '@teambit/screenshot';

  static defaultConfig = {
    screenWidth: 1024,
    screenHeight: 768,
    omitBackground: true,
  };

  static dependencies = [CLIExtension, LoggerExt];

  static async provider([cli, loggerFactory]: [CLIExtension, Logger], config: ScreenshotConfig) {
    const logger = loggerFactory.createLogPublisher(ScreenshotExtension.id);
    const screenshotTask = new ScreenshotTask(ScreenshotExtension.id);
    cli.register(new ScreenshotCmd());
    return new ScreenshotExtension(config, screenshotTask, logger);
  }
}
