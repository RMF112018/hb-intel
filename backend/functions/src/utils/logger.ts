import type { InvocationContext } from '@azure/functions';

/**
 * D-PH6-14 structured logger contract for Application Insights-compatible telemetry.
 * Traceability: docs/architecture/plans/PH6.14-Observability.md §6.14.1
 */
export interface ILogger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  trackEvent(name: string, properties: Record<string, unknown>): void;
  trackMetric(name: string, value: number, properties?: Record<string, unknown>): void;
}

function toStructuredLog(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>,
): string {
  return JSON.stringify({
    level,
    message,
    ...(data ?? {}),
  });
}

/**
 * D-PH6-14 logger factory that emits JSON payloads so correlation IDs and dimensions
 * remain queryable in Application Insights customEvents/customMetrics.
 */
export function createLogger(context: InvocationContext): ILogger {
  return {
    info(message: string, data?: Record<string, unknown>) {
      context.log(toStructuredLog('info', message, data));
    },
    warn(message: string, data?: Record<string, unknown>) {
      context.warn(toStructuredLog('warn', message, data));
    },
    error(message: string, data?: Record<string, unknown>) {
      context.error(toStructuredLog('error', message, data));
    },
    trackEvent(name: string, properties: Record<string, unknown>) {
      // D-PH6-14 custom-event envelope used by Kusto queries and alert rules.
      context.log(
        JSON.stringify({
          level: 'info',
          _telemetryType: 'customEvent',
          name,
          ...properties,
        }),
      );
    },
    trackMetric(name: string, value: number, properties?: Record<string, unknown>) {
      // D-PH6-14 custom-metric envelope supports value + dimension queries.
      context.log(
        JSON.stringify({
          level: 'info',
          _telemetryType: 'customMetric',
          name,
          value,
          ...(properties ?? {}),
        }),
      );
    },
  };
}
