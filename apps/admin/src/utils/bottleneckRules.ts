import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';

/**
 * G6-T03: Bottleneck rules for queue overview.
 * Derived from docs/maintenance/provisioning-runbook.md alert thresholds.
 */

/** Number of Failed requests that triggers a bottleneck indicator. */
export const FAILED_THRESHOLD = 1;

/** Hours after clarification request before aging indicator appears. */
export const CLARIFICATION_AGING_HOURS = 48;

/** Business days after submission before AwaitingExternalSetup ages. */
export const EXTERNAL_SETUP_AGING_DAYS = 5;

/** Days of recent completions to display. */
export const RECENT_COMPLETED_DAYS = 7;

const ACTIVE_STATES: ReadonlySet<ProjectSetupRequestState> = new Set([
  'Submitted',
  'UnderReview',
  'ReadyToProvision',
  'Provisioning',
]);

const NEEDS_ATTENTION_STATES: ReadonlySet<ProjectSetupRequestState> = new Set([
  'NeedsClarification',
  'AwaitingExternalSetup',
  'Failed',
]);

const ALL_STATES: readonly ProjectSetupRequestState[] = [
  'Submitted',
  'UnderReview',
  'NeedsClarification',
  'AwaitingExternalSetup',
  'ReadyToProvision',
  'Provisioning',
  'Completed',
  'Failed',
];

export interface QueueHealthSummary {
  readonly activeCount: number;
  readonly needsAttentionCount: number;
  readonly completedRecentCount: number;
  readonly overallHealth: 'healthy' | 'degraded';
}

export interface BottleneckIndicator {
  readonly state: ProjectSetupRequestState;
  readonly type: 'count' | 'aging';
  readonly message: string;
}

/**
 * Count requests per ProjectSetupRequestState.
 */
export function computeStateCounts(
  requests: readonly IProjectSetupRequest[],
): Record<ProjectSetupRequestState, number> {
  const counts = {} as Record<ProjectSetupRequestState, number>;
  for (const state of ALL_STATES) {
    counts[state] = 0;
  }
  for (const req of requests) {
    if (req.state in counts) {
      counts[req.state]++;
    }
  }
  return counts;
}

/**
 * Compute aggregated health summary for business-ops view.
 */
export function computeQueueHealthSummary(
  requests: readonly IProjectSetupRequest[],
  nowIso: string,
): QueueHealthSummary {
  const counts = computeStateCounts(requests);

  let activeCount = 0;
  for (const state of ACTIVE_STATES) {
    activeCount += counts[state];
  }

  let needsAttentionCount = 0;
  for (const state of NEEDS_ATTENTION_STATES) {
    needsAttentionCount += counts[state];
  }

  const sevenDaysAgo = Date.parse(nowIso) - RECENT_COMPLETED_DAYS * 24 * 60 * 60 * 1000;
  const completedRecentCount = requests.filter(
    (r) =>
      r.state === 'Completed' &&
      r.completedAt !== undefined &&
      Date.parse(r.completedAt) >= sevenDaysAgo,
  ).length;

  const overallHealth: 'healthy' | 'degraded' =
    counts['Failed'] === 0 && needsAttentionCount === 0 ? 'healthy' : 'degraded';

  return { activeCount, needsAttentionCount, completedRecentCount, overallHealth };
}

/**
 * Detect bottleneck conditions in the provisioning queue.
 */
export function detectBottlenecks(
  requests: readonly IProjectSetupRequest[],
  nowIso: string,
): BottleneckIndicator[] {
  const indicators: BottleneckIndicator[] = [];
  const counts = computeStateCounts(requests);
  const now = Date.parse(nowIso);

  // Failed threshold
  if (counts['Failed'] >= FAILED_THRESHOLD) {
    indicators.push({
      state: 'Failed',
      type: 'count',
      message: `${counts['Failed']} failed request${counts['Failed'] === 1 ? '' : 's'} requiring attention`,
    });
  }

  // NeedsClarification aging (>48h since clarification requested)
  const agingClarifications = requests.filter(
    (r) =>
      r.state === 'NeedsClarification' &&
      r.clarificationRequestedAt !== undefined &&
      (now - Date.parse(r.clarificationRequestedAt)) > CLARIFICATION_AGING_HOURS * 60 * 60 * 1000,
  );
  if (agingClarifications.length > 0) {
    indicators.push({
      state: 'NeedsClarification',
      type: 'aging',
      message: `${agingClarifications.length} clarification request${agingClarifications.length === 1 ? '' : 's'} aging >48h`,
    });
  }

  // AwaitingExternalSetup aging (>5 business days since submitted)
  const agingExternal = requests.filter(
    (r) =>
      r.state === 'AwaitingExternalSetup' &&
      (now - Date.parse(r.submittedAt)) > EXTERNAL_SETUP_AGING_DAYS * 24 * 60 * 60 * 1000,
  );
  if (agingExternal.length > 0) {
    indicators.push({
      state: 'AwaitingExternalSetup',
      type: 'aging',
      message: `${agingExternal.length} external setup request${agingExternal.length === 1 ? '' : 's'} aging >5 days`,
    });
  }

  return indicators;
}
