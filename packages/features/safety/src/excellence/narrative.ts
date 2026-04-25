/**
 * Multi-signal narrative builder for Safety Field Excellence.
 *
 * The reason summary must anchor on at least two independent signals when
 * supporting a primary or secondary recommendation. Single-score
 * narratives are downgraded by `eligibility.ts`.
 */

import type { SafetyActivityEvidence } from './types.js';
import type { FindingSummary } from './correctiveActions.js';
import type { CompositeInputs } from './scoring.js';
import type { ConsistencyResult } from './consistency.js';

export type ExcellenceSignal =
  | 'safety-performance'
  | 'consistency-trend'
  | 'activity-exposure'
  | 'corrective-action'
  | 'data-quality';

export interface NarrativeInputs {
  readonly projectNumber: string;
  readonly projectNameSnapshot: string;
  readonly composite: number;
  readonly parts: CompositeInputs;
  readonly consistency: ConsistencyResult;
  readonly summary: FindingSummary;
  readonly evidence: SafetyActivityEvidence;
  readonly inspectionCountWindow: number;
}

export interface NarrativeResult {
  readonly reasonSummary: string;
  readonly signals: ReadonlyArray<ExcellenceSignal>;
  readonly hasMultiSignal: boolean;
}

export function clearedSignals(
  parts: CompositeInputs,
  evidence: SafetyActivityEvidence,
  summary: FindingSummary,
): ExcellenceSignal[] {
  const signals: ExcellenceSignal[] = [];
  if (parts.safetyPerformance >= 75) signals.push('safety-performance');
  if (parts.consistencyTrend >= 60) signals.push('consistency-trend');
  if (evidence.status === 'proven') signals.push('activity-exposure');
  if (summary.openFindingCount === 0 && summary.repeatFindingCount === 0) {
    signals.push('corrective-action');
  }
  if (parts.dataQuality >= 80) signals.push('data-quality');
  return signals;
}

export function buildReasonSummary(input: NarrativeInputs): NarrativeResult {
  const signals = clearedSignals(input.parts, input.evidence, input.summary);
  const hasMultiSignal = signals.length >= 2;

  if (input.inspectionCountWindow === 0) {
    return {
      reasonSummary:
        'No accepted inspections were available for this period; candidate cannot be ranked for recognition.',
      signals,
      hasMultiSignal: false,
    };
  }

  if (!hasMultiSignal) {
    const single = signals[0];
    const phrase = single ? signalPhrase(single) : 'a single safety signal';
    return {
      reasonSummary:
        `Only ${phrase} cleared the recognition threshold for this period; ` +
        'a single-signal record is not sufficient for primary recognition.',
      signals,
      hasMultiSignal,
    };
  }

  const ordered = orderSignalsForDisplay(signals);
  const top = ordered[0];
  const second = ordered[1];
  const tail = ordered.slice(2);

  const sentences: string[] = [];
  sentences.push(
    `Strong ${signalPhrase(top)} paired with ${signalPhrase(second)} across ` +
      `${input.inspectionCountWindow} accepted inspection${input.inspectionCountWindow === 1 ? '' : 's'} ` +
      'support recognition this week.',
  );

  if (tail.length > 0) {
    sentences.push(
      `Supporting evidence: ${tail.map(signalPhrase).join(', ')}.`,
    );
  }

  if (input.evidence.status === 'inferred') {
    sentences.push('Activity evidence is inferred, so recognition is held below primary.');
  } else if (input.evidence.status === 'missing') {
    sentences.push('Activity evidence is missing, which limits confidence.');
  }

  if (input.summary.repeatFindingCount > 0) {
    sentences.push(
      `Repeat finding pressure (${input.summary.repeatFindingCount}) is being monitored.`,
    );
  }

  return {
    reasonSummary: sentences.join(' '),
    signals: ordered,
    hasMultiSignal,
  };
}

function signalPhrase(signal: ExcellenceSignal): string {
  switch (signal) {
    case 'safety-performance':
      return 'inspection performance';
    case 'consistency-trend':
      return 'rolling consistency trend';
    case 'activity-exposure':
      return 'verified active-jobsite exposure';
    case 'corrective-action':
      return 'finding-response posture';
    case 'data-quality':
      return 'data-quality posture';
  }
}

const SIGNAL_DISPLAY_ORDER: Record<ExcellenceSignal, number> = {
  'safety-performance': 0,
  'activity-exposure': 1,
  'consistency-trend': 2,
  'corrective-action': 3,
  'data-quality': 4,
};

function orderSignalsForDisplay(signals: ReadonlyArray<ExcellenceSignal>): ExcellenceSignal[] {
  return [...signals].sort(
    (a, b) => SIGNAL_DISPLAY_ORDER[a] - SIGNAL_DISPLAY_ORDER[b],
  );
}
