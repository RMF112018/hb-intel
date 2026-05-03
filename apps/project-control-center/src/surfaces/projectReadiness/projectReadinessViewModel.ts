/**
 * Project Readiness Center view-model contract (Phase 3 / Wave 8 / Prompt 05).
 *
 * Authoritative shape returned by `buildPccProjectReadinessViewModel`.
 * Each region slot pairs presentational `state` (the existing card-state
 * vocabulary) with the originating envelope `sourceStatus` and the data
 * the cards render.
 *
 * Defines the narrow read-model client interface consumed by
 * `PccProjectReadinessSurface`. Lists only the methods the surface uses
 * so non-api consumers (router, surface, content-child) can type the
 * client prop without crossing the controlled-consumption guard for the
 * full `IPccReadModelClient`.
 */

import type {
  PccLifecycleReadinessReadModel,
  PccPersona,
  PccProjectId,
  PccProjectReadinessFrameworkReadModel,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccUnifiedLifecycleReadModel,
  ProjectReadinessBlockerState,
  ProjectReadinessConfidenceState,
  ProjectReadinessDomainId,
  ProjectReadinessEvidenceState,
  ProjectReadinessLifecycleGateId,
  ProjectReadinessPosture,
  ProjectReadinessSeverity,
  ProjectReadinessSourceModuleId,
  ProjectReadinessStatus,
} from '@hbc/models/pcc';
import type { PccCardState } from '../projectHome/shared.js';

export interface IPccProjectReadinessReadModelClient {
  getProjectReadiness(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel>>;
  getLifecycleReadiness(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccLifecycleReadinessReadModel>>;

  /**
   * Wave 99 / Prompt 05C — supplemental unified-lifecycle context
   * (timeline, memory, traceability) consumed exclusively by
   * `PccProjectReadinessUnifiedLifecycleSection` via
   * `useUnifiedLifecycleReadModel`. None of the existing five
   * Project Readiness region hooks call this method (locked by
   * `PccProjectReadinessSurface.test.tsx`).
   */
  getUnifiedLifecycle(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccUnifiedLifecycleReadModel>>;
}

export interface IPccReadinessHeroViewModel {
  readonly activeLifecycleGate: ProjectReadinessLifecycleGateId;
  readonly activeLifecycleGateLabel: string;
  readonly overallPosture: ProjectReadinessPosture;
  readonly blockerCount: number;
  readonly evidenceConfidence: ProjectReadinessConfidenceState;
  readonly sourceHealthBadges: readonly IPccReadinessSourceHealthBadge[];
  readonly readOnlyBadgeText: string;
  readonly noExecutionCaption: string;
}

export interface IPccReadinessSourceHealthBadge {
  readonly sourceModuleId: ProjectReadinessSourceModuleId;
  readonly sourceModuleLabel: string;
  readonly sourceHealthStatus: PccReadModelSourceStatus;
  readonly warningCount: number;
}

export interface IPccReadinessGateViewModel {
  readonly lifecycleGate: ProjectReadinessLifecycleGateId;
  readonly label: string;
  readonly posture: ProjectReadinessPosture;
  readonly itemCount: number;
  readonly openBlockerCount: number;
  readonly pendingEvidenceCount: number;
  readonly isActive: boolean;
}

export interface IPccReadinessDomainViewModel {
  readonly domain: ProjectReadinessDomainId;
  readonly label: string;
  readonly posture: ProjectReadinessPosture;
  readonly itemCount: number;
  readonly openBlockerCount: number;
  readonly pendingEvidenceCount: number;
  readonly confidence: ProjectReadinessConfidenceState;
}

export type ProjectReadinessRiskTag =
  | 'critical-blocker'
  | 'open-blocker'
  | 'at-risk-warning'
  | 'monitor';

export interface IPccReadinessBlockerItemViewModel {
  readonly id: string;
  readonly title: string;
  readonly domain: ProjectReadinessDomainId;
  readonly domainLabel: string;
  readonly lifecycleGate: ProjectReadinessLifecycleGateId;
  readonly lifecycleGateLabel: string;
  readonly status: ProjectReadinessStatus;
  readonly severity: ProjectReadinessSeverity;
  readonly blockerState: ProjectReadinessBlockerState;
  readonly posture: ProjectReadinessPosture;
  readonly ownerPersona: PccPersona;
  readonly dueDateUtc?: string;
  readonly sourceModuleId: ProjectReadinessSourceModuleId;
  readonly sourceModuleLabel: string;
  readonly riskTag: ProjectReadinessRiskTag;
}

export interface IPccReadinessOwnershipEntryViewModel {
  readonly ownerPersona: PccPersona;
  readonly assignedItemIds: readonly string[];
  readonly unassignedItemIds: readonly string[];
  readonly openBlockerCount: number;
  readonly nextDueDateUtc?: string;
  readonly escalationPersonas: readonly PccPersona[];
}

export interface IPccReadinessOwnershipAccountabilityViewModel {
  readonly entries: readonly IPccReadinessOwnershipEntryViewModel[];
  readonly totalUnassignedCount: number;
  readonly summaryCaption: string;
}

export interface IPccReadinessPriorityActionEligibilityItem {
  readonly itemId: string;
  readonly itemTitle: string;
  readonly relatedPriorityActionId: string;
  readonly domain: ProjectReadinessDomainId;
  readonly domainLabel: string;
  readonly eligibilityCaption: string;
}

export interface IPccReadinessPriorityActionsPreviewViewModel {
  readonly items: readonly IPccReadinessPriorityActionEligibilityItem[];
  readonly previewCaption: string;
  readonly inertActionLabel: string;
}

export interface IPccReadinessEvidenceStateBucket {
  readonly evidenceState: ProjectReadinessEvidenceState;
  readonly itemCount: number;
  readonly documentControlSourceIds: readonly string[];
}

export interface IPccReadinessSourceHealthEntry {
  readonly sourceModuleId: ProjectReadinessSourceModuleId;
  readonly sourceModuleLabel: string;
  readonly sourceHealthStatus: PccReadModelSourceStatus;
  readonly itemCount: number;
  readonly warningCount: number;
}

export interface IPccReadinessEvidenceViewModel {
  readonly evidenceBuckets: readonly IPccReadinessEvidenceStateBucket[];
  readonly sourceHealthEntries: readonly IPccReadinessSourceHealthEntry[];
  readonly documentControlReferenceCaption: string;
}

export type IPccReadinessDownstreamWaveStatus =
  | 'wave-8-framework'
  | 'implemented'
  | 'preview-deferred';

export interface IPccReadinessDownstreamModuleViewModel {
  readonly sourceModuleId: ProjectReadinessSourceModuleId;
  readonly sourceModuleLabel: string;
  readonly waveLabel: string;
  readonly waveStatus: IPccReadinessDownstreamWaveStatus;
  readonly statusCaption: string;
}

export type IPccProjectReadinessViewModel =
  | { readonly status: 'loading' }
  | {
      readonly status: 'preview';
      readonly cardState: PccCardState;
      readonly sourceStatus: PccReadModelSourceStatus;
      readonly hero: IPccReadinessHeroViewModel;
      readonly lifecycleGates: readonly IPccReadinessGateViewModel[];
      readonly domains: readonly IPccReadinessDomainViewModel[];
      readonly blockers: readonly IPccReadinessBlockerItemViewModel[];
      readonly ownershipAccountability: IPccReadinessOwnershipAccountabilityViewModel;
      readonly priorityActionsPreview: IPccReadinessPriorityActionsPreviewViewModel;
      readonly evidence: IPccReadinessEvidenceViewModel;
      readonly downstreamModules: readonly IPccReadinessDownstreamModuleViewModel[];
    }
  | { readonly status: 'error' };
