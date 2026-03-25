/**
 * P3-E14-T10 Stage 7 Project Warranty Module ux-surfaces enumerations.
 * Surfaces, workspace zones/tabs, Next Move, saved views, complexity, related items, HBI, canvas.
 */

export type WarrantyPrimarySurface = 'CoverageRegistry' | 'CaseWorkspace' | 'CanvasTile';
export type CaseWorkspaceZone = 'IdentityStatusBar' | 'WorkArea' | 'NextMovePanel';
export type CaseWorkspaceTab = 'Overview' | 'Timeline' | 'Evidence' | 'Assignment' | 'RelatedItems';
export type NextMoveUrgency = 'Normal' | 'Warning' | 'Overdue' | 'Blocked';
export type SavedViewScope = 'Personal' | 'Team' | 'System';
export type WarrantyComplexityTier = 'Essential' | 'Standard' | 'Expert';
export type RelatedItemDirection = 'Outbound' | 'Inbound';
export type HbiBehaviorLocation = 'CoverageDecision' | 'CoverageRegistry' | 'BackChargeAdvisory' | 'SlaEscalation' | 'DisputePath';
export type CanvasTileContentTier = 'Essential' | 'Standard' | 'Expert';
