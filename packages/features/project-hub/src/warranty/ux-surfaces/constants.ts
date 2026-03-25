/**
 * P3-E14-T10 Stage 7 Project Warranty Module ux-surfaces constants.
 */

import type {
  CanvasTileContentTier,
  CaseWorkspaceTab,
  CaseWorkspaceZone,
  HbiBehaviorLocation,
  NextMoveUrgency,
  RelatedItemDirection,
  SavedViewScope,
  WarrantyComplexityTier,
  WarrantyPrimarySurface,
} from './enums.js';
import type {
  ICanvasTileContentDef,
  IComplexityRoleDefault,
  IComplexityTierColumnsDef,
  IHbiBehaviorDef,
  INextMoveActionCatalogEntry,
  IPermissionExplainabilityCase,
  IWarrantyRelatedItemConsumption,
  IWarrantyRelatedItemPublication,
  IWarrantySavedViewDef,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const WARRANTY_PRIMARY_SURFACES = ['CoverageRegistry', 'CaseWorkspace', 'CanvasTile'] as const satisfies ReadonlyArray<WarrantyPrimarySurface>;
export const CASE_WORKSPACE_ZONES = ['IdentityStatusBar', 'WorkArea', 'NextMovePanel'] as const satisfies ReadonlyArray<CaseWorkspaceZone>;
export const CASE_WORKSPACE_TABS = ['Overview', 'Timeline', 'Evidence', 'Assignment', 'RelatedItems'] as const satisfies ReadonlyArray<CaseWorkspaceTab>;
export const NEXT_MOVE_URGENCIES = ['Normal', 'Warning', 'Overdue', 'Blocked'] as const satisfies ReadonlyArray<NextMoveUrgency>;
export const SAVED_VIEW_SCOPES = ['Personal', 'Team', 'System'] as const satisfies ReadonlyArray<SavedViewScope>;
export const WARRANTY_COMPLEXITY_TIERS = ['Essential', 'Standard', 'Expert'] as const satisfies ReadonlyArray<WarrantyComplexityTier>;

// -- Next Move Action Catalog (T07 §5.3) — 15 entries -------------------------

export const NEXT_MOVE_ACTION_CATALOG: ReadonlyArray<INextMoveActionCatalogEntry> = [
  { caseStatus: 'Open', acknowledgmentStatus: null, action: 'Evaluate coverage and make coverage decision', owner: 'PM' },
  { caseStatus: 'PendingCoverageDecision', acknowledgmentStatus: null, action: 'Complete coverage review and assign or close', owner: 'PM' },
  { caseStatus: 'Assigned', acknowledgmentStatus: 'Pending' as never, action: 'Contact subcontractor and confirm acknowledgment', owner: 'PM' },
  { caseStatus: 'Assigned', acknowledgmentStatus: 'Acknowledged' as never, action: 'Record subcontractor scope acceptance or dispute', owner: 'PM' },
  { caseStatus: 'Assigned', acknowledgmentStatus: 'ScopeDisputed' as never, action: 'Resolve scope dispute before repair can proceed', owner: 'PM' },
  { caseStatus: 'AwaitingSubcontractor', acknowledgmentStatus: null, action: 'Follow up with subcontractor on scheduling', owner: 'PM' },
  { caseStatus: 'AwaitingOwner', acknowledgmentStatus: null, action: 'Awaiting owner input or site access — follow up', owner: 'PM' },
  { caseStatus: 'Scheduled', acknowledgmentStatus: null, action: 'Confirm visit occurred; record outcome', owner: 'PM' },
  { caseStatus: 'InProgress', acknowledgmentStatus: null, action: 'Confirm completion declaration from subcontractor', owner: 'PM' },
  { caseStatus: 'Corrected', acknowledgmentStatus: null, action: 'Schedule and conduct verification inspection', owner: 'PM / WARRANTY_MANAGER' },
  { caseStatus: 'PendingVerification', acknowledgmentStatus: null, action: 'Complete verification and record outcome', owner: 'PM / WARRANTY_MANAGER' },
  { caseStatus: 'Verified', acknowledgmentStatus: null, action: 'Create resolution record and close case', owner: 'PM / WARRANTY_MANAGER' },
  { caseStatus: 'NotCovered', acknowledgmentStatus: null, action: 'Log communication to owner: not covered', owner: 'PM' },
  { caseStatus: 'Denied', acknowledgmentStatus: null, action: 'Log communication to owner: claim denied', owner: 'PM' },
  { caseStatus: 'Reopened', acknowledgmentStatus: null, action: 'Assess and assign for repeat repair', owner: 'PM' },
];

// -- Saved Views — Coverage Registry (T07 §6.3) --------------------------------

export const COVERAGE_REGISTRY_SYSTEM_VIEWS: ReadonlyArray<IWarrantySavedViewDef> = [
  { viewName: 'Active Coverage', filterDefinition: 'coverageStatus = Active', scope: 'System', surface: 'CoverageRegistry' },
  { viewName: 'Expiring Within 30 Days', filterDefinition: 'coverageStatus = Active AND warrantyEndDate ≤ today + 30d', scope: 'System', surface: 'CoverageRegistry' },
  { viewName: 'Expired Coverage', filterDefinition: 'coverageStatus = Expired', scope: 'System', surface: 'CoverageRegistry' },
  { viewName: 'Coverage With Open Cases', filterDefinition: 'coverageStatus = Active AND openCaseCount > 0', scope: 'System', surface: 'CoverageRegistry' },
  { viewName: 'All Coverage', filterDefinition: 'No filter — full coverage registry', scope: 'System', surface: 'CoverageRegistry' },
];

// -- Saved Views — Case Workspace (T07 §6.4) -----------------------------------

export const CASE_WORKSPACE_SYSTEM_VIEWS: ReadonlyArray<IWarrantySavedViewDef> = [
  { viewName: 'My Open Cases', filterDefinition: 'caseStatus NOT IN (Closed, Voided, Duplicate) AND assignedPmId = currentUser', scope: 'System', surface: 'CaseWorkspace' },
  { viewName: 'All Open Cases', filterDefinition: 'caseStatus NOT IN (Closed, Voided, Duplicate)', scope: 'System', surface: 'CaseWorkspace' },
  { viewName: 'Overdue Cases', filterDefinition: 'slaStatus = Overdue', scope: 'System', surface: 'CaseWorkspace' },
  { viewName: 'Expedited Cases', filterDefinition: 'slaTier = Expedited AND caseStatus NOT IN (Closed, Voided)', scope: 'System', surface: 'CaseWorkspace' },
  { viewName: 'Disputed Cases', filterDefinition: 'acknowledgmentStatus = ScopeDisputed AND caseStatus != Closed', scope: 'System', surface: 'CaseWorkspace' },
  { viewName: 'Awaiting Owner', filterDefinition: 'caseStatus = AwaitingOwner', scope: 'System', surface: 'CaseWorkspace' },
  { viewName: 'Closed This Month', filterDefinition: 'caseStatus = Closed AND closedAt >= startOfCurrentMonth', scope: 'System', surface: 'CaseWorkspace' },
  { viewName: 'Back-Charge Flagged', filterDefinition: 'isBackChargeAdvisory = true', scope: 'System', surface: 'CaseWorkspace' },
];

// -- Related Items — Outbound (T07 §7.1) --------------------------------------

export const RELATED_ITEM_OUTBOUND_PUBLICATIONS: ReadonlyArray<IWarrantyRelatedItemPublication> = [
  { sourceRecord: 'WarrantyCase', targetRecordType: 'WarrantyCoverageItem', relationshipLabel: 'Under coverage', direction: 'Outbound' },
  { sourceRecord: 'WarrantyCase', targetRecordType: 'Subcontractor / Buyout record', relationshipLabel: 'Responsible contractor', direction: 'Outbound' },
  { sourceRecord: 'WarrantyCase', targetRecordType: 'OwnerIntakeLog', relationshipLabel: 'Owner report', direction: 'Outbound' },
  { sourceRecord: 'WarrantyCase', targetRecordType: 'WarrantyCase (duplicate)', relationshipLabel: 'Consolidated with', direction: 'Outbound' },
  { sourceRecord: 'WarrantyCoverageItem', targetRecordType: 'Closeout turnover package', relationshipLabel: 'From turnover', direction: 'Outbound' },
  { sourceRecord: 'WarrantyCoverageItem', targetRecordType: 'Startup commissioning record', relationshipLabel: 'Commissioning reference', direction: 'Outbound' },
  { sourceRecord: 'WarrantyCaseResolutionRecord', targetRecordType: 'WarrantyCase', relationshipLabel: 'Resolves', direction: 'Outbound' },
];

// -- Related Items — Inbound (T07 §7.1) ---------------------------------------

export const RELATED_ITEM_INBOUND_CONSUMPTIONS: ReadonlyArray<IWarrantyRelatedItemConsumption> = [
  { sourceModule: 'Closeout', publishedRecord: 'Turnover package', whatWarrantySurfaces: 'Coverage items sourced from turnover; linked in coverage item detail' },
  { sourceModule: 'Startup', publishedRecord: 'Commissioning record', whatWarrantySurfaces: 'System commissioning reference in coverage item detail' },
  { sourceModule: 'Financial', publishedRecord: 'Back-charge record', whatWarrantySurfaces: 'Back-charge advisory follow-up status in case workspace' },
];

// -- Complexity Tiers (T07 §8) ------------------------------------------------

export const COMPLEXITY_ROLE_DEFAULTS: ReadonlyArray<IComplexityRoleDefault> = [
  { role: 'PM', defaultTier: 'Standard' },
  { role: 'WARRANTY_MANAGER', defaultTier: 'Standard' },
  { role: 'PX', defaultTier: 'Essential' },
  { role: 'APM_PA', defaultTier: 'Essential' },
  { role: 'Admin', defaultTier: 'Expert' },
];

// -- Permission Explainability (T07 §9.1) -------------------------------------

export const PERMISSION_EXPLAINABILITY_CASES: ReadonlyArray<IPermissionExplainabilityCase> = [
  { situation: 'PM cannot close without resolution record', visibleState: 'Close Case greyed', explainerText: 'A resolution record is required before closing.' },
  { situation: 'PM cannot reopen (PX only)', visibleState: 'Reopen visible, disabled', explainerText: 'Only a Project Executive can reopen a closed case.' },
  { situation: 'Coverage item expired, cannot link new case', visibleState: 'Link to Case disabled', explainerText: 'This coverage item is expired. New cases cannot be opened against expired coverage.' },
  { situation: 'APM cannot assign subcontractors', visibleState: 'Assign Sub hidden', explainerText: '' },
];

// -- HBI Assistive Behaviors (T07 §10.2) --------------------------------------

export const HBI_ASSISTIVE_BEHAVIORS: ReadonlyArray<IHbiBehaviorDef> = [
  { location: 'CoverageDecision', behavior: 'Coverage classification suggestion', trigger: 'PM enters issue description in new case' },
  { location: 'CoverageRegistry', behavior: 'Expiration advisory', trigger: 'PM views registry with open cases near expiration' },
  { location: 'BackChargeAdvisory', behavior: 'Back-charge probability flag', trigger: 'PM enters resolution notes with dispute history' },
  { location: 'SlaEscalation', behavior: 'Natural language SLA status', trigger: 'SLA within warning threshold' },
  { location: 'DisputePath', behavior: 'Dispute resolution suggestion', trigger: 'PM opens a scope dispute' },
];

// -- Canvas Tile Content (T07 §11.1) ------------------------------------------

export const CANVAS_TILE_CONTENT: ReadonlyArray<ICanvasTileContentDef> = [
  { tier: 'Essential', content: ['Open warranty case count', 'Overdue case count (SLA exceeded)', 'View Cases quick link'] },
  { tier: 'Standard', content: ['Coverage items expiring within 30 days', 'Cases awaiting owner input', 'View Coverage quick link'] },
  { tier: 'Expert', content: ['Back-charge advisory count', 'Disputed acknowledgment count'] },
];
