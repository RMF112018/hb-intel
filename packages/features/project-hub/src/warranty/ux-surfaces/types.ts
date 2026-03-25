/**
 * P3-E14-T10 Stage 7 Project Warranty Module ux-surfaces TypeScript contracts.
 */

import type {
  CanvasTileContentTier,
  HbiBehaviorLocation,
  NextMoveUrgency,
  RelatedItemDirection,
  SavedViewScope,
  WarrantyComplexityTier,
} from './enums.js';
import type { WarrantyCaseStatus } from '../record-families/enums.js';
import type { SubAcknowledgmentStatus } from '../subcontractor-participation/enums.js';

export interface IWarrantyNextMoveItem {
  readonly currentOwner: string;
  readonly expectedAction: string;
  readonly dueAt: string | null;
  readonly urgency: NextMoveUrgency;
  readonly blockingReason: string | null;
  readonly escalationPath: string | null;
  readonly previousOwner: string | null;
  readonly nextOwner: string | null;
}

export interface INextMoveActionCatalogEntry {
  readonly caseStatus: WarrantyCaseStatus;
  readonly acknowledgmentStatus: SubAcknowledgmentStatus | null;
  readonly action: string;
  readonly owner: string;
}

export interface IWarrantySavedViewDef {
  readonly viewName: string;
  readonly filterDefinition: string;
  readonly scope: SavedViewScope;
  readonly surface: string;
}

export interface IWarrantyRelatedItemPublication {
  readonly sourceRecord: string;
  readonly targetRecordType: string;
  readonly relationshipLabel: string;
  readonly direction: RelatedItemDirection;
}

export interface IWarrantyRelatedItemConsumption {
  readonly sourceModule: string;
  readonly publishedRecord: string;
  readonly whatWarrantySurfaces: string;
}

export interface IComplexityTierColumnsDef {
  readonly tier: WarrantyComplexityTier;
  readonly surface: string;
  readonly visibleColumns: readonly string[];
}

export interface IComplexityRoleDefault {
  readonly role: string;
  readonly defaultTier: WarrantyComplexityTier;
}

export interface IPermissionExplainabilityCase {
  readonly situation: string;
  readonly visibleState: string;
  readonly explainerText: string;
}

export interface IHbiBehaviorDef {
  readonly location: HbiBehaviorLocation;
  readonly behavior: string;
  readonly trigger: string;
}

export interface ICanvasTileContentDef {
  readonly tier: CanvasTileContentTier;
  readonly content: readonly string[];
}
