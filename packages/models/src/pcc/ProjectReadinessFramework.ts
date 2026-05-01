/**
 * PCC Project Readiness Module Framework — shared model contracts.
 *
 * Phase 3 / Wave 8 / Prompt 02. Type-only contracts for the Project
 * Readiness Center read-model envelope key. No runtime behavior, no I/O,
 * no SPFx, PnP, Azure SDK, HTTP clients, Procore, backend, or sibling
 * boundary packages.
 *
 * Authority:
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Implementation_Authorization.md
 *
 * @module pcc/ProjectReadinessFramework
 */

import type { PccPersona } from './PccUserRoles.js';
import type { PccReadModelSourceStatus } from './PccReadModels.js';

// ---------------------------------------------------------------------------
// Domain taxonomy (14 readiness domains from Wave 8 scope lock).
// ---------------------------------------------------------------------------

export const PROJECT_READINESS_DOMAINS = [
  'project-setup',
  'team-and-access',
  'documents-project-record',
  'startup-mobilization',
  'safety-qaqc',
  'permits-jurisdiction',
  'procurement-buyout',
  'responsibility-raci',
  'constraints',
  'schedule-milestones',
  'financial-accounting-setup',
  'external-systems',
  'site-health',
  'closeout-turnover',
] as const;
export type ProjectReadinessDomainId = (typeof PROJECT_READINESS_DOMAINS)[number];

// ---------------------------------------------------------------------------
// Lifecycle gates (10 gates from Wave 8 scope lock).
// ---------------------------------------------------------------------------

export const PROJECT_READINESS_LIFECYCLE_GATES = [
  'lead-pursuit',
  'estimating',
  'preconstruction',
  'turnover-to-operations',
  'startup-mobilization',
  'active-construction',
  'closeout-planning',
  'substantial-completion',
  'turnover-warranty',
  'archived-lessons-learned',
] as const;
export type ProjectReadinessLifecycleGateId =
  (typeof PROJECT_READINESS_LIFECYCLE_GATES)[number];

// ---------------------------------------------------------------------------
// Upstream source modules that the framework normalizes signals from.
// Wave 8 owns the framework and the Project Readiness Center shell.
// Module-specific runtime detail is owned by Waves 6, 7, 9–15, and 17.
// ---------------------------------------------------------------------------

export const PROJECT_READINESS_SOURCE_MODULES = [
  'team-access',
  'document-control',
  'project-lifecycle-readiness',
  'permit-log',
  'responsibility-matrix',
  'constraints-log',
  'buyout-log',
  'approvals-checkpoints',
  'external-systems',
  'site-health',
] as const;
export type ProjectReadinessSourceModuleId =
  (typeof PROJECT_READINESS_SOURCE_MODULES)[number];

// ---------------------------------------------------------------------------
// Item-level vocabulary.
// ---------------------------------------------------------------------------

export const PROJECT_READINESS_STATUSES = [
  'not-started',
  'in-progress',
  'blocked',
  'needs-review',
  'approved',
  'rejected',
  'complete',
  'deferred',
  'not-applicable',
] as const;
export type ProjectReadinessStatus = (typeof PROJECT_READINESS_STATUSES)[number];

export const PROJECT_READINESS_POSTURES = [
  'ready',
  'at-risk',
  'blocked',
  'not-started',
  'not-applicable',
  'unknown',
] as const;
export type ProjectReadinessPosture = (typeof PROJECT_READINESS_POSTURES)[number];

export const PROJECT_READINESS_BLOCKER_STATES = [
  'none',
  'open',
  'mitigated',
  'resolved',
  'escalated',
] as const;
export type ProjectReadinessBlockerState =
  (typeof PROJECT_READINESS_BLOCKER_STATES)[number];

export const PROJECT_READINESS_SEVERITIES = [
  'low',
  'medium',
  'high',
  'critical',
] as const;
export type ProjectReadinessSeverity = (typeof PROJECT_READINESS_SEVERITIES)[number];

export const PROJECT_READINESS_CONFIDENCE_STATES = [
  'high',
  'medium',
  'low',
  'unknown',
] as const;
export type ProjectReadinessConfidenceState =
  (typeof PROJECT_READINESS_CONFIDENCE_STATES)[number];

export const PROJECT_READINESS_EVIDENCE_STATES = [
  'not-required',
  'pending',
  'submitted',
  'approved',
  'rejected',
  'expired',
] as const;
export type ProjectReadinessEvidenceState =
  (typeof PROJECT_READINESS_EVIDENCE_STATES)[number];

// ---------------------------------------------------------------------------
// Item-level interfaces.
// ---------------------------------------------------------------------------

export interface IProjectReadinessSourceLineage {
  readonly sourceItemId?: string;
  readonly sourceReferenceLabel?: string;
  readonly sourceUrl?: string;
}

export interface IProjectReadinessEvidenceRequirement {
  readonly requirementId: string;
  readonly description: string;
  readonly evidenceState: ProjectReadinessEvidenceState;
  readonly evidenceLocationLabel?: string;
  readonly documentControlSourceId?: string;
  readonly dueDateUtc?: string;
}

export interface IProjectReadinessItem {
  readonly id: string;
  readonly domain: ProjectReadinessDomainId;
  readonly lifecycleGate: ProjectReadinessLifecycleGateId;
  readonly sourceModuleId: ProjectReadinessSourceModuleId;
  readonly title: string;
  readonly description: string;
  readonly ownerPersona: PccPersona;
  readonly assignedUserUpn?: string;
  readonly reviewerPersona?: PccPersona;
  readonly dueDateUtc?: string;
  readonly status: ProjectReadinessStatus;
  readonly severity: ProjectReadinessSeverity;
  readonly blockerState: ProjectReadinessBlockerState;
  readonly posture: ProjectReadinessPosture;
  readonly confidence: ProjectReadinessConfidenceState;
  readonly sourceHealthStatus: PccReadModelSourceStatus;
  readonly evidenceRequirement?: IProjectReadinessEvidenceRequirement;
  readonly sourceLineage?: IProjectReadinessSourceLineage;
  readonly dependencyItemIds: readonly string[];
  readonly escalationPath?: readonly PccPersona[];
  readonly approvalCheckpointReference?: string;
  readonly relatedPriorityActionId?: string;
  readonly createdAtUtc: string;
  readonly updatedAtUtc: string;
  readonly lastActorPersona?: PccPersona;
}

// ---------------------------------------------------------------------------
// Summary roll-ups (derived from items).
// ---------------------------------------------------------------------------

export interface IProjectReadinessDomainSummary {
  readonly domain: ProjectReadinessDomainId;
  readonly itemIds: readonly string[];
  readonly posture: ProjectReadinessPosture;
  readonly openBlockerCount: number;
  readonly pendingEvidenceCount: number;
  readonly confidence: ProjectReadinessConfidenceState;
}

export interface IProjectReadinessGateSummary {
  readonly lifecycleGate: ProjectReadinessLifecycleGateId;
  readonly itemIds: readonly string[];
  readonly posture: ProjectReadinessPosture;
  readonly openBlockerCount: number;
  readonly pendingEvidenceCount: number;
}

export interface IProjectReadinessOwnershipSummary {
  readonly ownerPersona: PccPersona;
  readonly assignedItemIds: readonly string[];
  readonly openBlockerCount: number;
  readonly nextDueDateUtc?: string;
}

export interface IProjectReadinessEvidenceSummary {
  readonly evidenceState: ProjectReadinessEvidenceState;
  readonly itemIds: readonly string[];
  readonly documentControlSourceIds: readonly string[];
}

export interface IProjectReadinessBlockerSummary {
  readonly blockerState: ProjectReadinessBlockerState;
  readonly itemIds: readonly string[];
  readonly severityCounts: Readonly<Record<ProjectReadinessSeverity, number>>;
}

export interface IProjectReadinessSourceHealthSummary {
  readonly sourceModuleId: ProjectReadinessSourceModuleId;
  readonly sourceHealthStatus: PccReadModelSourceStatus;
  readonly itemIds: readonly string[];
  readonly warningCount: number;
}

// ---------------------------------------------------------------------------
// Top-level snapshot and read-model alias.
// ---------------------------------------------------------------------------

export interface IProjectReadinessFrameworkSnapshot {
  readonly items: readonly IProjectReadinessItem[];
  readonly domainSummaries: readonly IProjectReadinessDomainSummary[];
  readonly gateSummaries: readonly IProjectReadinessGateSummary[];
  readonly ownershipSummaries: readonly IProjectReadinessOwnershipSummary[];
  readonly evidenceSummary: readonly IProjectReadinessEvidenceSummary[];
  readonly blockerSummary: readonly IProjectReadinessBlockerSummary[];
  readonly sourceHealthSummary: readonly IProjectReadinessSourceHealthSummary[];
}

export type PccProjectReadinessFrameworkReadModel = IProjectReadinessFrameworkSnapshot;
