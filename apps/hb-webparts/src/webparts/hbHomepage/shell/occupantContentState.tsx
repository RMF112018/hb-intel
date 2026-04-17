// =============================================================================
// Occupant content-state contract (Wave-01 Prompt-04)
// -----------------------------------------------------------------------------
// This is the shell-safe seam by which an early-lane occupant can tell the
// shell what its *content* state currently is. It is intentionally separate
// from layout-comfort state (slotComfortResolver) and from static eligibility
// state (occupantRegistry). Those three are the three independent axes the
// shell may consult when composing the first screen:
//
//   - static eligibility   → occupantRegistry.ts        (may this occupant
//                                                        live here at all?)
//   - layout comfort       → slotComfortResolver.ts      (does it fit here
//                                                        at this width?)
//   - content state        → this file                   (is it actually
//                                                        carrying current
//                                                        value right now?)
//
// This prompt defines the contract and integration seam only. The shell
// *reads* whatever is reported and exposes it as inspectable data attributes
// for diagnostics and the future promotion/demotion resolver (Prompt-05).
// It does not yet reorder anything based on reports.
//
// Reporting seam: zone wrappers (or shell-adjacent adapters) call
// `useReportOccupantContentState` with a report for their occupantId. The
// reporter lives *outside* the child module internals; child modules may
// expose signals but must not directly reorder the shell.
// =============================================================================

import * as React from 'react';
import type { OccupantId } from './shellTypes.js';

/**
 * Content-state vocabulary. Deliberately small. Layout fit is NOT part of
 * this vocabulary — that lives in `slotComfortResolver`.
 *
 * - `strong`      — occupant is rendering meaningful, current-value content.
 * - `low-signal`  — renderable, but unlikely to earn a premium early slot
 *                   (stale, minimal, placeholder-like).
 * - `empty`       — occupant has no current data to show; would render a
 *                   shell fallback or an empty-state surface.
 * - `invalid`     — occupant cannot render the authored configuration
 *                   (schema/contract error).
 * - `loading`     — occupant is in flight; state is transient.
 * - `unknown`     — occupant has not yet reported, or the zone has no
 *                   signal wired up.
 */
export type OccupantContentStateKind =
  | 'strong'
  | 'low-signal'
  | 'empty'
  | 'invalid'
  | 'loading'
  | 'unknown';

export interface OccupantContentStateReport {
  readonly occupantId: OccupantId;
  readonly kind: OccupantContentStateKind;
  /** Short diagnostic summary (ascii-safe, inspectable as data attribute). */
  readonly summary?: string;
  /** Optional longer-form detail for dev tooling/harness logs only. */
  readonly detail?: string;
  /** Count of renderable items when the concept applies (feed length, entry count, etc.). */
  readonly itemCount?: number;
  /** ISO 8601 timestamp of when the underlying content was last known current, if known. */
  readonly lastUpdated?: string;
  /** Epoch ms at which this report was produced. */
  readonly reportedAt: number;
}

export type OccupantContentStateMap = ReadonlyMap<OccupantId, OccupantContentStateReport>;

interface ContentStateStore {
  readonly reports: OccupantContentStateMap;
  readonly publish: (report: OccupantContentStateReport) => void;
}

const UNSET_STORE: ContentStateStore = {
  reports: new Map(),
  publish: () => undefined,
};

const OccupantContentStateContext = React.createContext<ContentStateStore>(UNSET_STORE);

/**
 * Shell-side provider. Wrap the render subtree so zones can report content
 * state and the shell (or a resolver) can read it.
 */
export function OccupantContentStateProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [reports, setReports] = React.useState<ReadonlyMap<OccupantId, OccupantContentStateReport>>(
    () => new Map(),
  );

  const publish = React.useCallback((report: OccupantContentStateReport): void => {
    setReports((prev) => {
      const existing = prev.get(report.occupantId);
      if (
        existing &&
        existing.kind === report.kind &&
        existing.summary === report.summary &&
        existing.itemCount === report.itemCount &&
        existing.lastUpdated === report.lastUpdated
      ) {
        return prev;
      }
      const next = new Map(prev);
      next.set(report.occupantId, report);
      return next;
    });
  }, []);

  const store = React.useMemo<ContentStateStore>(() => ({ reports, publish }), [reports, publish]);

  return (
    <OccupantContentStateContext.Provider value={store}>
      {children}
    </OccupantContentStateContext.Provider>
  );
}

/**
 * Reader hook for shell-internal consumers (slot renderer, resolver, harness).
 * Returns the current report map. The map identity changes when any report
 * actually changes, so memoized downstream consumers will see updates.
 */
export function useOccupantContentStateReports(): OccupantContentStateMap {
  return React.useContext(OccupantContentStateContext).reports;
}

/**
 * Reader hook for a single occupant.
 */
export function useOccupantContentStateReport(
  occupantId: OccupantId,
): OccupantContentStateReport | undefined {
  const reports = useOccupantContentStateReports();
  return reports.get(occupantId);
}

/**
 * Reporter hook. Zone wrappers pass a derived (stable) report; it is
 * published to the shell on each effective change. The report must name
 * its own occupantId — there is no implicit binding.
 */
export function useReportOccupantContentState(
  report: OccupantContentStateReport | undefined,
): void {
  const { publish } = React.useContext(OccupantContentStateContext);
  const signature =
    report === undefined
      ? 'none'
      : `${report.occupantId}|${report.kind}|${report.summary ?? ''}|${report.itemCount ?? ''}|${report.lastUpdated ?? ''}`;

  React.useEffect(() => {
    if (report !== undefined) {
      publish(report);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, publish]);
}

/**
 * Pure helper: distill a report into the two shell-safe data attributes
 * used by the slot renderer. Returned object is spread-safe into JSX.
 */
export function toOccupantContentStateDataAttributes(
  report: OccupantContentStateReport | undefined,
): { 'data-shell-occupant-content-state': OccupantContentStateKind; 'data-shell-occupant-content-summary'?: string } {
  if (!report) {
    return { 'data-shell-occupant-content-state': 'unknown' };
  }
  return {
    'data-shell-occupant-content-state': report.kind,
    ...(report.summary ? { 'data-shell-occupant-content-summary': report.summary } : {}),
  };
}
