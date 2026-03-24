/**
 * P3-E7-T05 Permits Workflow and Downstream Surfaces TypeScript contracts.
 */

import type {
  PermitActivityEventType,
  PermitAnnotatableRecordType,
  PermitHandoffScenario,
  PermitRelationshipType,
  PermitWorkQueuePriority,
  PermitWorkQueueRuleId,
} from './enums.js';

// ── Activity Spine (§1) ─────────────────────────────────────────────

export interface IPermitActivityEventConfig {
  readonly eventType: PermitActivityEventType;
  readonly trigger: string;
  readonly additionalPayloadFields: readonly string[];
}

// ── Health Spine (§2) ───────────────────────────────────────────────

export interface IPermitHealthMetricConfig {
  readonly metricKey: string;
  readonly type: string;
  readonly description: string;
}

// ── Work Queue (§3) ─────────────────────────────────────────────────

export interface IPermitWorkQueueRuleConfig {
  readonly ruleId: PermitWorkQueueRuleId;
  readonly trigger: string;
  readonly itemType: string;
  readonly priority: PermitWorkQueuePriority;
  readonly assignee: string;
  readonly resolutionTrigger: string;
}

// ── Related Items (§4) ──────────────────────────────────────────────

export interface IPermitRelatedItemConfig {
  readonly source: string;
  readonly target: string;
  readonly relationshipType: PermitRelationshipType;
  readonly direction: string;
}

// ── Handoffs (§5) ───────────────────────────────────────────────────

export interface IPermitHandoffConfig {
  readonly scenario: PermitHandoffScenario;
  readonly fromParty: string;
  readonly toParty: string;
  readonly trigger: string;
}

// ── BIC Next Move (§6) ─────────────────────────────────────────────

export interface IPermitBicNextMovePrompt {
  readonly condition: string;
  readonly prompt: string;
  readonly surface: string;
}

// ── PER Annotation (§7) ────────────────────────────────────────────

export interface IPermitAnnotationAnchor {
  readonly issuedPermitId: string;
  readonly recordType: PermitAnnotatableRecordType;
  readonly recordId: string;
  readonly fieldKey: string | null;
}

export interface IPermitAnnotationScope {
  readonly recordType: PermitAnnotatableRecordType;
  readonly annotatableFields: readonly string[];
}
