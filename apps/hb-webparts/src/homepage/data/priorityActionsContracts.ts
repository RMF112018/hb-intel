/**
 * Priority Actions — normalized contracts for public, admin, runtime,
 * and write use cases.
 *
 * These contracts sit between the raw SharePoint rows (defined in the
 * list descriptor modules) and the presentational components. They
 * provide a single typed vocabulary shared by readers, writers, admin
 * surfaces, and validation logic.
 *
 * Schema authority:
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md
 */

// ---------------------------------------------------------------------------
// Shared enumerations
// ---------------------------------------------------------------------------

export type DesktopLayoutMode = 'rail' | 'segmented' | 'hybrid';
export type TabletLayoutMode = 'grid' | 'rail' | 'hybrid';
export type MobileLayoutMode = 'grid' | 'scroll' | 'sheet-trigger';

export type ItemStatus = 'Enabled' | 'Disabled' | 'Archived';
export type BadgeVariant = 'neutral' | 'info' | 'warning' | 'success' | 'critical';
export type ItemPriority = 'primary' | 'secondary' | 'overflow';
export type AudienceMode = 'all' | 'include-only' | 'exclude' | 'role-driven';

// ---------------------------------------------------------------------------
// Config — resolved from active row
// ---------------------------------------------------------------------------

export interface PriorityActionsConfigResolved {
  id: number;
  title: string;
  bandKey: string;
  enabled: boolean;
  isActive: boolean;
  headingText: string;
  overflowLabel: string;
  showHeading: boolean;
  showBadges: boolean;
  desktopLayoutMode: DesktopLayoutMode;
  tabletLayoutMode: TabletLayoutMode;
  mobileLayoutMode: MobileLayoutMode;
  maxVisibleDesktop: number;
  maxVisibleLaptop: number;
  maxVisibleTabletLandscape: number;
  maxVisibleTabletPortrait: number;
  maxVisiblePhone: number;
  openExternalInNewTabByDefault: boolean;
  adminNotes: string;
  modified: string;
}

// ---------------------------------------------------------------------------
// Item — normalized for public render
// ---------------------------------------------------------------------------

export interface PriorityActionsItemNormalized {
  id: number;
  actionKey: string;
  title: string;
  href: string;
  description: string;
  iconKey: string;
  badgeLabel: string;
  badgeVariant: BadgeVariant;
  priority: ItemPriority;
  groupKey: string;
  groupTitle: string;
  sortOrder: number;
  overflowOnly: boolean;
  mobilePriority: number;
  audienceMode: AudienceMode;
  audienceKeys: string[];
  isExternal: boolean;
  openInNewTab: boolean;
  visibleDesktop: boolean;
  visibleLaptop: boolean;
  visibleTabletLandscape: boolean;
  visibleTabletPortrait: boolean;
  visiblePhone: boolean;
  startsAtUtc: string | null;
  endsAtUtc: string | null;
}

// ---------------------------------------------------------------------------
// Admin drafts — form-bound models for authoring
// ---------------------------------------------------------------------------

export interface PriorityActionsConfigDraft {
  title: string;
  bandKey: string;
  enabled: boolean;
  isActive: boolean;
  headingText: string;
  overflowLabel: string;
  showHeading: boolean;
  showBadges: boolean;
  desktopLayoutMode: DesktopLayoutMode;
  tabletLayoutMode: TabletLayoutMode;
  mobileLayoutMode: MobileLayoutMode;
  maxVisibleDesktop: number;
  maxVisibleLaptop: number;
  maxVisibleTabletLandscape: number;
  maxVisibleTabletPortrait: number;
  maxVisiblePhone: number;
  openExternalInNewTabByDefault: boolean;
  adminNotes: string;
}

export interface PriorityActionsItemDraft {
  actionKey: string;
  title: string;
  href: string;
  description: string;
  iconKey: string;
  badgeLabel: string;
  badgeVariant: BadgeVariant;
  priority: ItemPriority;
  groupKey: string;
  groupTitle: string;
  sortOrder: number;
  overflowOnly: boolean;
  mobilePriority: number;
  audienceMode: AudienceMode;
  audienceKeys: string[];
  isExternal: boolean;
  openInNewTab: boolean;
  visibleDesktop: boolean;
  visibleLaptop: boolean;
  visibleTabletLandscape: boolean;
  visibleTabletPortrait: boolean;
  visiblePhone: boolean;
  startsAtUtc: string;
  endsAtUtc: string;
}

export interface PriorityActionsAdminRowPersistedIdentity {
  itemId: number;
  actionKey: string;
  sortOrder: number;
}

export interface PriorityActionsAdminRow {
  rowKey: string;
  persisted?: PriorityActionsAdminRowPersistedIdentity;
  draft: PriorityActionsItemDraft;
  markedForArchive: boolean;
  saveError?: string;
}

export interface PriorityActionsPermissionMaskParts {
  High?: string;
  Low?: string;
}

export interface PriorityActionsAdminPermissions {
  canView: boolean;
  canEdit: boolean;
  canReorder: boolean;
  canArchive: boolean;
  canPublish: boolean;
}

export type PriorityActionsAdminPermissionResolutionStatus =
  | 'resolved'
  | 'resolution-failed'
  | 'simulated';

export type PriorityActionsAdminPosture =
  | 'editable'
  | 'read-only'
  | 'insufficient-permission';

export interface PriorityActionsAdminPermissionResolution {
  status: PriorityActionsAdminPermissionResolutionStatus;
  posture: PriorityActionsAdminPosture;
  permissions: PriorityActionsAdminPermissions;
  reason?: string;
  user?: {
    title?: string;
    email?: string;
    isSiteAdmin: boolean;
  };
}

export type PriorityActionsAdminRowLifecycle =
  | 'persisted-unchanged'
  | 'persisted-edited'
  | 'new'
  | 'marked-for-archive'
  | 'pending-reorder'
  | 'save-error';

export type PriorityActionsAdminRowStatusChip =
  | 'persisted'
  | 'new'
  | 'edited'
  | 'reordered'
  | 'archive-intent'
  | 'invalid';

export interface PriorityActionsItemOperationPlan {
  create: Array<{ rowKey: string; draft: PriorityActionsItemDraft }>;
  update: Array<{ rowKey: string; itemId: number; draft: PriorityActionsItemDraft }>;
  archive: Array<{ rowKey: string; itemId: number }>;
  reorder: Array<{ itemId: number; sortOrder: number }>;
  lifecycleByRowKey: Record<string, PriorityActionsAdminRowLifecycle>;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type PriorityActionsValidationIssueKind =
  | 'duplicate-active-config'
  | 'missing-band-key'
  | 'missing-action-key'
  | 'missing-overflow-label'
  | 'invalid-schedule-window'
  | 'invalid-date-format'
  | 'duplicate-action-key'
  | 'missing-href'
  | 'invalid-icon-key'
  | 'invalid-breakpoint-cap'
  | 'inconsistent-breakpoint-caps'
  | 'inconsistent-group-metadata'
  | 'all-devices-hidden'
  | 'empty-title'
  | 'inconsistent-audience-mode';

export interface PriorityActionsValidationIssue {
  kind: PriorityActionsValidationIssueKind;
  message: string;
  field?: string;
  rowId?: number;
}

export interface PriorityActionsValidationResult {
  valid: boolean;
  issues: PriorityActionsValidationIssue[];
}

export interface PriorityActionsValidationContext {
  activeConfigCountForBand?: number;
}

// ---------------------------------------------------------------------------
// Write commands — discriminated union for SP write operations
// ---------------------------------------------------------------------------

export type PriorityActionsWriteCommand =
  | PriorityActionsCreateItemCommand
  | PriorityActionsUpdateItemCommand
  | PriorityActionsArchiveItemCommand
  | PriorityActionsUpdateConfigCommand;

export interface PriorityActionsCreateItemCommand {
  type: 'create-item';
  bandKey: string;
  draft: PriorityActionsItemDraft;
}

export interface PriorityActionsUpdateItemCommand {
  type: 'update-item';
  itemId: number;
  bandKey: string;
  draft: Partial<PriorityActionsItemDraft>;
}

export interface PriorityActionsArchiveItemCommand {
  type: 'archive-item';
  itemId: number;
}

export interface PriorityActionsUpdateConfigCommand {
  type: 'update-config';
  configId: number;
  draft: Partial<PriorityActionsConfigDraft>;
}
