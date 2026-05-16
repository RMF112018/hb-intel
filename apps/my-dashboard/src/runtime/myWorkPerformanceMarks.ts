/**
 * My Dashboard User Timing instrumentation helper — B05.8 Prompt 03.
 *
 * Privacy-safe wrappers around `performance.mark` / `performance.measure`.
 * Callers MUST pass only safe primitive `detail` values (route IDs, module
 * IDs, status classes, durations) — never user names, UPN/email, project
 * names/numbers, agreement titles, URLs, tokens, or raw vendor payload.
 *
 * Both wrappers no-op silently when `globalThis.performance` (or the
 * specific API) is unavailable, and swallow any throw the underlying API
 * raises. Instrumentation must never crash a render or a backend call.
 *
 * @module runtime/myWorkPerformanceMarks
 */

export type MyWorkPerformanceDetail = Record<string, string | number | boolean | undefined>;

function getPerformance(): Performance | undefined {
  try {
    const candidate: unknown = (globalThis as { performance?: unknown }).performance;
    if (candidate && typeof (candidate as Performance).mark === 'function') {
      return candidate as Performance;
    }
  } catch {
    // Defensive: some sandboxes throw on cross-realm property access.
    return undefined;
  }
  return undefined;
}

export function markMyWork(name: string, detail?: MyWorkPerformanceDetail): void {
  const perf = getPerformance();
  if (!perf) return;
  try {
    perf.mark(name, detail ? { detail } : undefined);
  } catch {
    // Swallow — instrumentation must never crash callers.
  }
}

export function measureMyWork(
  name: string,
  startMark: string,
  endMark: string,
  detail?: MyWorkPerformanceDetail,
): void {
  const perf = getPerformance();
  if (!perf || typeof perf.measure !== 'function') return;
  try {
    perf.measure(name, { start: startMark, end: endMark, ...(detail ? { detail } : {}) });
  } catch {
    // Swallow — instrumentation must never crash callers.
  }
}

export const MY_WORK_MARK = {
  shellMounted: 'my-dashboard:shell:mounted',
  requestStart: (routeId: string) => `my-dashboard:request:${routeId}:start`,
  requestEnd: (routeId: string) => `my-dashboard:request:${routeId}:end`,
  requestDuration: (routeId: string) => `my-dashboard:request:${routeId}:duration`,
  moduleUseful: (moduleId: string) => `my-dashboard:module:${moduleId}:useful`,
} as const;
