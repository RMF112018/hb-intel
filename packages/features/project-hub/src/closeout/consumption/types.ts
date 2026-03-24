/**
 * P3-E10-T08 Project Hub Consumption TypeScript contracts.
 * Data classes, org indexes, consumption surfaces, spine events, reports.
 */

import type { CloseoutDataClass, CloseoutHealthSpineDimension, CloseoutOrgIndex } from './enums.js';

// -- Data Class Definitions (§1) --------------------------------------------

/** Data class definition per T08 §1 table. */
export interface ICloseoutDataClassDefinition {
  readonly class: CloseoutDataClass;
  readonly data: string;
  readonly writePath: string;
  readonly readPath: string;
}

// -- Org Index Definitions (§2) ---------------------------------------------

/** Org intelligence index definition per T08 §2. */
export interface IOrgIndexDefinition {
  readonly index: CloseoutOrgIndex;
  readonly purpose: string;
  readonly populationTrigger: string;
  readonly unitOfEntry: string;
}

// -- Search Dimensions (§2.1–2.3) -------------------------------------------

/** Search dimension configuration for an org index. */
export interface ISearchDimension {
  readonly index: CloseoutOrgIndex;
  readonly fullTextFields: readonly string[];
  readonly filterFields: readonly string[];
  readonly sortFields: readonly string[];
}

// -- Relevance Score (§2.1) -------------------------------------------------

/** Project profile for relevance scoring per T08 §2.1. */
export interface IProjectProfile {
  readonly marketSector: string;
  readonly deliveryMethod: string;
  readonly sizeBand: string;
}

/** Org index entry profile for relevance matching. */
export interface IIndexEntryProfile {
  readonly marketSector: string;
  readonly deliveryMethod: string;
  readonly projectSizeBand: string;
  readonly applicability: number;
}

// -- Consumption Surfaces (§3) ----------------------------------------------

/** Project Hub contextual consumption surface per T08 §3. */
export interface IProjectHubConsumptionSurface {
  readonly surface: string;
  readonly surfacedOn: string;
  readonly trigger: string;
  readonly capabilities: string;
  readonly restrictions: string;
}

// -- Activity Spine Events (§5.1) -------------------------------------------

/** Activity spine event per T08 §5.1. */
export interface IActivitySpineEvent {
  readonly eventKey: string;
  readonly trigger: string;
  readonly payloadDescription: string;
}

// -- Health Spine Metrics (§5.2) --------------------------------------------

/** Health spine metric per T08 §5.2. */
export interface IHealthSpineMetric {
  readonly dimensionKey: CloseoutHealthSpineDimension;
  readonly formula: string;
  readonly emittedWhen: string;
}

// -- Reports Integration (§6) -----------------------------------------------

/** Report artifact family per T08 §6.1. */
export interface IReportArtifactFamily {
  readonly artifact: string;
  readonly trigger: string;
  readonly snapshotSource: string;
  readonly reportsRole: string;
}

/** Snapshot API precondition per T08 §6.2. */
export interface ISnapshotPrecondition {
  readonly snapshot: string;
  readonly precondition: string;
}

// -- UI Data Class Rules (§4) -----------------------------------------------

/** UI data class rule per T08 §4 table. */
export interface IUIDataClassRule {
  readonly surfaceElement: string;
  readonly dataClass: CloseoutDataClass;
  readonly mutability: string;
  readonly navigation: string;
}
