/**
 * useSaveStateTrust — reduce the Publisher's save-state signals into
 * a single named phase the readiness rail can render truthfully.
 *
 * Inputs flow from existing controllers so this hook is a selector,
 * not a new source of truth:
 *   - `isDirty`         — in-memory draft diverges from the durable
 *                         baseline (captured when a draft loads and
 *                         after every successful durable save).
 *   - `isCachePending`  — local-cache debounce is in flight.
 *   - `hasLocalCache`   — a local working-copy cache exists for the
 *                         current articleId.
 *   - `busy`            — durable save / publish / transition in
 *                         flight (from `useDraftLifecycle`).
 *   - `statusTone`      — tone of the last status-channel message
 *                         (from `useStatusChannel`); `danger` flags
 *                         a failed durable save.
 *
 * The derived `SaveStatePhase` is the only signal the UI renders —
 * no downstream consumer reads the raw inputs, so the rules below
 * are the single point of truth for how the Publisher talks about
 * save state.
 *
 *   busy                                     → 'saving'
 *   last tone is danger and not dirty        → 'failed'
 *   isDirty && isCachePending                → 'caching'
 *   isDirty && hasLocalCache                 → 'cached'
 *   isDirty                                  → 'dirty'
 *   !isDirty && hasLocalCache                → 'saved' (durable commit
 *                                               advanced the baseline;
 *                                               the cache will clear
 *                                               next cycle)
 *   otherwise                                → 'saved' when a
 *                                               successful save has
 *                                               happened in-session;
 *                                               'clean' otherwise
 *
 * `clean` is the initial phase on a freshly loaded (never edited)
 * draft; `saved` is reserved for "you edited, then committed".
 */

import * as React from 'react';

export type SaveStatePhase =
  | 'clean'
  | 'dirty'
  | 'caching'
  | 'cached'
  | 'saving'
  | 'saved'
  | 'failed';

export interface SaveStateTrustInputs {
  readonly hasDraft: boolean;
  readonly isDirty: boolean;
  readonly hasLocalCache: boolean;
  readonly isCachePending: boolean;
  readonly busy: boolean;
  readonly lastStatusTone: 'info' | 'success' | 'warn' | 'danger' | 'error';
  readonly lastCachedAtIso: string | null;
}

export interface SaveStateTrust {
  readonly phase: SaveStatePhase;
  readonly headline: string;
  readonly detail?: string;
  readonly isBlockingNavigation: boolean;
}

export function useSaveStateTrust(inputs: SaveStateTrustInputs): SaveStateTrust {
  const {
    hasDraft,
    isDirty,
    hasLocalCache,
    isCachePending,
    busy,
    lastStatusTone,
    lastCachedAtIso,
  } = inputs;

  const hasCommittedThisSessionRef = React.useRef(false);
  // The moment busy flips from true → false with no failure tone, treat
  // it as a successful commit for phrasing purposes.
  const prevBusyRef = React.useRef(busy);
  React.useEffect(() => {
    if (prevBusyRef.current && !busy && lastStatusTone !== 'danger') {
      hasCommittedThisSessionRef.current = true;
    }
    prevBusyRef.current = busy;
  }, [busy, lastStatusTone]);

  if (!hasDraft) {
    return {
      phase: 'clean',
      headline: 'No draft selected',
      isBlockingNavigation: false,
    };
  }
  if (busy) {
    return {
      phase: 'saving',
      headline: 'Saving to SharePoint…',
      isBlockingNavigation: true,
    };
  }
  if (!isDirty && isFailureTone(lastStatusTone)) {
    return {
      phase: 'failed',
      headline: 'Last save failed',
      detail: 'Retry the save from the Ship panel.',
      isBlockingNavigation: false,
    };
  }
  if (isDirty && isFailureTone(lastStatusTone)) {
    return {
      phase: 'failed',
      headline: 'Last save failed — unsaved changes remain',
      detail: 'Retry the save from the Ship panel.',
      isBlockingNavigation: true,
    };
  }
  if (isDirty && isCachePending) {
    return {
      phase: 'caching',
      headline: 'Caching working copy locally…',
      isBlockingNavigation: true,
    };
  }
  if (isDirty && hasLocalCache) {
    const rel = lastCachedAtIso ? relativeFromNow(lastCachedAtIso) : null;
    return {
      phase: 'cached',
      headline: `Unsaved · cached locally${rel ? ` ${rel}` : ''}`,
      detail: 'Save to commit to SharePoint.',
      isBlockingNavigation: true,
    };
  }
  if (isDirty) {
    return {
      phase: 'dirty',
      headline: 'Unsaved changes',
      detail: 'Save to commit to SharePoint.',
      isBlockingNavigation: true,
    };
  }
  if (hasCommittedThisSessionRef.current) {
    return {
      phase: 'saved',
      headline: 'Saved to SharePoint',
      isBlockingNavigation: false,
    };
  }
  return {
    phase: 'clean',
    headline: 'Up to date',
    isBlockingNavigation: false,
  };
}

function isFailureTone(
  tone: SaveStateTrustInputs['lastStatusTone'],
): boolean {
  return tone === 'danger' || tone === 'error';
}

function relativeFromNow(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const deltaSec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (deltaSec < 10) return 'just now';
  if (deltaSec < 60) return `${deltaSec}s ago`;
  if (deltaSec < 3600) return `${Math.round(deltaSec / 60)}m ago`;
  return `${Math.round(deltaSec / 3600)}h ago`;
}
