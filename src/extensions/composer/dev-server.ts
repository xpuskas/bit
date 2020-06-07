import { ExecutionContext } from '../environments';

export interface DevServer {
  listen(port: number): Promise<void>;
}

export interface DevServerContext extends ExecutionContext {}
