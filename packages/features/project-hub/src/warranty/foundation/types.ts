/**
 * P3-E14-T10 Stage 1 Project Warranty Module foundation TypeScript contracts.
 * Operating model, SoT boundaries, adjacent modules, coverage sources, out-of-scope.
 */

import type {
  WarrantyAdjacentModule,
  WarrantyCoverageSource,
  WarrantyLayer2SeamField,
  WarrantyOperationalFlowStage,
  WarrantyOutOfScopeItem,
  WarrantySoTAuthority,
  WarrantySoTRelationship,
} from './enums.js';

/** Source-of-truth boundary row per T01 §5.1. */
export interface IWarrantySoTBoundary {
  readonly dataConcern: string;
  readonly sotOwner: WarrantySoTAuthority;
  readonly warrantyRelationship: WarrantySoTRelationship;
  readonly notes: string;
}

/** Adjacent module boundary definition per T01 §5.2. */
export interface IWarrantyAdjacentModuleBoundary {
  readonly adjacentModule: WarrantyAdjacentModule;
  readonly whatAdjacentOwns: string;
  readonly whatWarrantyDoes: string;
  readonly constraint: string;
}

/** Operational flow stage definition per T01 §3.1. */
export interface IWarrantyOperationalFlowStageDef {
  readonly stage: WarrantyOperationalFlowStage;
  readonly description: string;
}

/** Coverage source definition per T01 §3.1. */
export interface IWarrantyCoverageSourceDef {
  readonly source: WarrantyCoverageSource;
  readonly description: string;
}

/** Out-of-scope item definition per T01 §6. */
export interface IWarrantyOutOfScopeDef {
  readonly item: WarrantyOutOfScopeItem;
  readonly reasonDeferred: string;
}

/** Layer 2 seam field definition per T01 §4.3. */
export interface IWarrantyLayer2SeamFieldDef {
  readonly field: WarrantyLayer2SeamField;
  readonly purpose: string;
}

/** Locked invariant from T01. */
export interface IWarrantyLockedInvariant {
  readonly invariant: string;
  readonly description: string;
}
