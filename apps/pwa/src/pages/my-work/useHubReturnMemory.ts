/**
 * useHubReturnMemory — P2-B2 §5, §7.
 * Captures return state on leave, restores on return, triggers feed refresh.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@tanstack/react-router';
import type { IAutoSaveDraftResult, IUseDraftResult } from '@hbc/session-state';
import type { IMyWorkReturnState, IMyWorkQuerySeedDraft } from './hubStateTypes.js';

/**
 * P2-B2 §4.2: Module-level bridge for route onLeave → captureReturnState.
 * Updated by useHubReturnMemory when mounted; cleared on unmount.
 * This bridges the non-React route lifecycle with the React hook state.
 */
let _onLeaveCapture: (() => void) | null = null;

/** Called by myWorkRoute's onLeave handler to trigger return-state capture. */
export function triggerOnLeaveCapture(): void {
  _onLeaveCapture?.();
}

interface UseHubReturnMemoryOptions {
  returnState: IUseDraftResult<IMyWorkReturnState>;
  querySeed: IAutoSaveDraftResult<IMyWorkQuerySeedDraft>;
  onReturn: () => void;
}

export interface IHubReturnMemoryResult {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  captureReturnState: (expandedGroupKeys: string[]) => void;
  restoredQuerySeed: IMyWorkQuerySeedDraft | null;
}

export function useHubReturnMemory({
  returnState,
  querySeed,
  onReturn,
}: UseHubReturnMemoryOptions): IHubReturnMemoryResult {
  const router = useRouter();
  const wasOnHubRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const isOnHub = router.state.location.pathname === '/my-work';

  // P2-B2 §7.2: Detect return to hub — trigger feed refresh
  useEffect(() => {
    if (isOnHub && !wasOnHubRef.current) {
      onReturn();
    }
    wasOnHubRef.current = isOnHub;
  }, [isOnHub, onReturn]);

  // P2-B2 §5: Restore scroll position after render on return
  useEffect(() => {
    if (!isOnHub || !returnState.value) return;
    const { scrollPosition } = returnState.value;
    const timer = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (container && scrollPosition > 0) {
        container.scrollTop = scrollPosition;
      }
      returnState.clear();
    }, 100);
    return () => clearTimeout(timer);
  }, [isOnHub, returnState]);

  // P2-B2 §7.1: Capture return state on leave
  const captureReturnState = useCallback(
    (expandedGroupKeys: string[]) => {
      const container = scrollContainerRef.current;
      const scrollPosition = container?.scrollTop ?? 0;
      returnState.save({
        scrollPosition,
        expandedGroupKeys,
        capturedAt: new Date().toISOString(),
      });
    },
    [returnState],
  );

  // P2-B2 §4.2: Register capture callback for route onLeave (primary trigger).
  useEffect(() => {
    _onLeaveCapture = () => captureReturnState([]);
    return () => { _onLeaveCapture = null; };
  }, [captureReturnState]);

  // P2-B2 §5.2: Secondary resilience — capture on visibilitychange
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'hidden' && isOnHub) {
        captureReturnState([]);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [captureReturnState, isOnHub]);

  return {
    scrollContainerRef,
    captureReturnState,
    restoredQuerySeed: querySeed.value,
  };
}
