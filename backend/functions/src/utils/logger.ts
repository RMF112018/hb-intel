import type { InvocationContext } from '@azure/functions';

export interface ILogger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

export function createLogger(context: InvocationContext): ILogger {
  return {
    info(message: string, data?: Record<string, unknown>) {
      context.log(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
    },
    warn(message: string, data?: Record<string, unknown>) {
      context.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
    },
    error(message: string, data?: Record<string, unknown>) {
      context.error(`[ERROR] ${message}`, data ? JSON.stringify(data) : '');
    },
  };
}
