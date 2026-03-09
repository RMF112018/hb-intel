import { useEffect, useRef, useState } from 'react';
import { getSnapshot, recordPhase } from './startupTiming.js';
import type {
  ShellEnvironmentAdapter,
  ShellExperienceState,
  ShellRouteEnforcementDecision,
  StartupTimingSnapshot,
} from './types.js';

/**
 * Private utility — co-located per PH7.3 §7.3.8.
 * Used exclusively by the startup timing effect to compute elapsed mount time.
 */
function resolveMonotonicNowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }

  return Date.now();
}

/**
 * Determine when first protected shell render is eligible to be marked complete.
 *
 * Moved from ShellCore.tsx per PH7.3 D2.
 * Public export — re-exported from index.ts.
 */
export function canCompleteFirstProtectedShellRender(params: {
  lifecyclePhase: string;
  experienceState: ShellExperienceState;
  routeDecision: ShellRouteEnforcementDecision | null;
}): boolean {
  return (
    params.lifecyclePhase === 'authenticated' &&
    params.experienceState === 'ready' &&
    params.routeDecision?.allow === true
  );
}

/**
 * First protected render timing and snapshot callback hook.
 *
 * Extracted from ShellCore.tsx per PH7.3 §7.3.8.
 * Records 'first-protected-shell-render' phase once conditions are met,
 * then calls onStartupTimingSnapshot with the full snapshot.
 */
export function useStartupTimingCompletion(params: {
  lifecyclePhase: string;
  experienceState: ShellExperienceState;
  routeDecision: ShellRouteEnforcementDecision | null;
  adapter: ShellEnvironmentAdapter;
  onStartupTimingSnapshot?: (snapshot: StartupTimingSnapshot) => void;
}): void {
  const { lifecyclePhase, experienceState, routeDecision, adapter, onStartupTimingSnapshot } =
    params;

  const [firstProtectedRenderRecorded, setFirstProtectedRenderRecorded] = useState(false);
  const startupMountTimeMs = useRef<number>(resolveMonotonicNowMs());

  useEffect(() => {
    if (
      firstProtectedRenderRecorded ||
      !canCompleteFirstProtectedShellRender({
        lifecyclePhase,
        experienceState,
        routeDecision,
      })
    ) {
      return;
    }

    const elapsedMs = Math.max(resolveMonotonicNowMs() - startupMountTimeMs.current, 0);
    recordPhase('first-protected-shell-render', elapsedMs, {
      source: 'shell-core',
      environment: adapter.environment,
      outcome: 'success',
      details: {
        lifecyclePhase,
      },
    });
    setFirstProtectedRenderRecorded(true);
    onStartupTimingSnapshot?.(getSnapshot());
  }, [
    adapter.environment,
    experienceState,
    firstProtectedRenderRecorded,
    lifecyclePhase,
    onStartupTimingSnapshot,
    routeDecision,
  ]);
}
