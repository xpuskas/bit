// import { PaperError } from './paper-error';

import { PaperError } from '@bit/bit.core.cli';

export class AlreadyExistsError extends PaperError {
  constructor(filePath: string) {
    super(`config file at ${filePath} already exist. use override in case you want to override it`);
  }
  report() {
    return this.message;
  }
}
