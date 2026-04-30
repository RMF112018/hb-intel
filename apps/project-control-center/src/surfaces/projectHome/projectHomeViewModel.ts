/**
 * Project Home view-model contract (Phase 3 / Wave 4 / Prompt 04).
 *
 * Authoritative shape returned by `buildPccProjectHomeViewModel`. Each
 * slot pairs presentational `state` (the existing card-state vocabulary)
 * with the originating envelope `sourceStatus` and the data the card
 * renders. The card components consume only the slot's `data` and `state`
 * — they never see the envelope itself.
 *
 * Prompt 04 introduces this layer; Prompt 05 wires Project Home through
 * the seam.
 */

import type {
  IDocumentControlSource,
  IExternalSystemMissingConfig,
  IPriorityAction,
  IProjectProfile,
  ISiteHealthSummary,
  PccDocumentControlReadModel,
  PccPersona,
  PccPriorityActionsReadModel,
  PccProjectHomeReadModel,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import type { PccCardState } from './shared.js';

/**
 * Wave 4 / Prompt 05 — narrow Project Home consumer interface.
 *
 * Lists only the read-model client methods Project Home actually uses.
 * Defined here (not re-exported from `src/api/`) so non-api consumers
 * (PccApp, PccSurfaceRouter, PccProjectHome, useProjectHomeReadModel)
 * can type the client prop without crossing the controlled-consumption
 * guard for `IPccReadModelClient`. TypeScript structural typing lets
 * the full `IPccReadModelClient` (returned by `createPccReadModelClient`)
 * flow into a value typed as `IPccProjectHomeReadModelClient`.
 */
export interface IPccProjectHomeReadModelClient {
  getProjectHome(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProjectHomeReadModel>>;

  getPriorityActions(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccPriorityActionsReadModel>>;

  getDocumentControl(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccDocumentControlReadModel>>;
}

export interface IPccProjectHomeViewModelSlot<TData> {
  readonly state: PccCardState;
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly data: TData;
}

export interface IPccProjectHomeViewModel {
  readonly intelligence: IPccProjectHomeViewModelSlot<IProjectProfile | undefined>;
  readonly priorityActions: IPccProjectHomeViewModelSlot<readonly IPriorityAction[]>;
  readonly siteHealth: IPccProjectHomeViewModelSlot<ISiteHealthSummary | undefined>;
  readonly documentControl: IPccProjectHomeViewModelSlot<readonly IDocumentControlSource[]>;
  readonly missingConfigurations: IPccProjectHomeViewModelSlot<
    readonly IExternalSystemMissingConfig[]
  >;
}
