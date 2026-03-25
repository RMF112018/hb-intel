/**
 * P3-J1 E8 document-readiness-spikes TypeScript contracts.
 * Spike finding memos, contradiction register, telemetry definitions, Phase 5 handoff recommendations.
 */

import type {
  ContradictionSeverity,
  DocumentTelemetryEvent,
  Phase5HandoffStatus,
  SpikeFindingArea,
} from './enums.js';

export interface ISpikeFindingMemo {
  readonly area: SpikeFindingArea;
  readonly finding: string;
  readonly confidence: string;
  readonly recommendation: string;
  readonly blockerIdentified: boolean;
}

export interface IContradictionRegisterEntry {
  readonly entryId: string;
  readonly area: SpikeFindingArea;
  readonly contradiction: string;
  readonly severity: ContradictionSeverity;
  readonly impactOnPhase5: string;
  readonly resolutionAction: string;
}

export interface ITelemetryEventDefinition {
  readonly event: DocumentTelemetryEvent;
  readonly description: string;
  readonly triggerCondition: string;
  readonly dataPayload: readonly string[];
}

export interface IPhase5HandoffRecommendation {
  readonly area: SpikeFindingArea;
  readonly status: Phase5HandoffStatus;
  readonly recommendation: string;
  readonly prerequisitesRequired: readonly string[];
  readonly riskIfIgnored: string;
}
