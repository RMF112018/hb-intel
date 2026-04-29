/**
 * PCC Document Control source registry.
 *
 * The Document Control Center is modeled as a TWO-LANE module (Phase 3 /
 * Wave 2 / Prompt 06 product correction):
 *
 *   1. Microsoft Files Lane
 *      - SharePoint Drive
 *      - SharePoint document libraries
 *      - OneDrive
 *      - future-state: a functional Microsoft 365 file-management surface
 *        powered by Microsoft Graph; Wave 2 actions remain preview-disabled
 *      - PCC does NOT duplicate Microsoft files into a separate store
 *
 *   2. External Document Systems Lane
 *      - Procore Files
 *      - Document Crunch
 *      - Adobe Sign
 *      - future-state: launch / deep-link / missing-config / access-issue
 *        visibility only
 *      - PCC does NOT mirror, sync, or write back to those external systems
 *
 * Wave 2 carries metadata only. Sensitive-library categorization,
 * sync-policy enforcement, retention, archive lifecycle, upload semantics,
 * permissioning, and review/approval behavior remain DEFERRED to later
 * approved waves.
 *
 * Wave 2 execution guardrails:
 *   - no live Graph/PnP/API/file operation execution;
 *   - no external sync, mirror, write-back, or mutation.
 *
 * Microsoft Graph–backed file operations require a later implementation
 * plan, authorization model, permission posture, tenant consent review, and
 * security review before live operations land.
 */

export const DOCUMENT_CONTROL_SOURCE_IDS = [
  'sharepoint-drive',
  'onedrive',
  'procore-files',
  'document-crunch',
  'adobe-sign',
] as const;

export type DocumentControlSourceId = (typeof DOCUMENT_CONTROL_SOURCE_IDS)[number];

/**
 * `DocumentControlSource` is exported for vocabulary alignment with the
 * Wave 1 prompt package and the contract.
 */
export type DocumentControlSource = DocumentControlSourceId;

export type DocumentControlSourcePosture = 'mvp-required' | 'mvp-optional' | 'conditional';

export type DocumentControlLinkBehavior = 'browse-in-place' | 'launch-link';

// ── Two-lane product model (Wave 2 / Prompt 06) ─────────────────────────

export const DOCUMENT_CONTROL_LANES = [
  'microsoft-files',
  'external-document-systems',
] as const;

export type DocumentControlLane = (typeof DOCUMENT_CONTROL_LANES)[number];

export const DOCUMENT_CONTROL_ACTION_IDS = [
  'browse',
  'open',
  'upload',
  'download',
  'copy-link',
  'approval-status',
] as const;

export type DocumentControlActionId = (typeof DOCUMENT_CONTROL_ACTION_IDS)[number];

/**
 * `'enabled'` is future-metadata only. Wave 2 / Prompt 06 ships every
 * action as `'preview-disabled'` and intentionally does NOT branch runtime
 * behavior on `'enabled'`. The enabled gate lands in a later approved
 * implementation alongside Microsoft Graph wiring.
 */
export type DocumentControlActionExecutionState = 'preview-disabled' | 'enabled';

export type DocumentControlCapabilityPosture =
  | 'future-graph-managed'
  | 'launch-link-visibility-only';

export interface IDocumentControlAction {
  readonly id: DocumentControlActionId;
  readonly label: string;
  readonly description: string;
  readonly executionState: DocumentControlActionExecutionState;
  /** Short label of the future capability that will power the action. */
  readonly futureCapability: string;
  /** Hint that the action requires a later approval / authorization gate
   *  before it can be enabled in any runtime. */
  readonly requiresLaterGate?: boolean;
}

export const DOCUMENT_CONTROL_ACTIONS: Readonly<
  Record<DocumentControlActionId, IDocumentControlAction>
> = {
  browse: {
    id: 'browse',
    label: 'Browse',
    description: 'Browse project libraries and folders.',
    executionState: 'preview-disabled',
    futureCapability: 'Microsoft Graph drive listing',
  },
  open: {
    id: 'open',
    label: 'Open',
    description: 'Open files in their native Microsoft 365 viewers.',
    executionState: 'preview-disabled',
    futureCapability: 'Microsoft Graph item open',
  },
  upload: {
    id: 'upload',
    label: 'Upload',
    description: 'Upload files to authorized project libraries.',
    executionState: 'preview-disabled',
    futureCapability: 'Microsoft Graph item upload',
    requiresLaterGate: true,
  },
  download: {
    id: 'download',
    label: 'Download',
    description: 'Download files where the user is permitted.',
    executionState: 'preview-disabled',
    futureCapability: 'Microsoft Graph item download',
  },
  'copy-link': {
    id: 'copy-link',
    label: 'Copy Link',
    description: 'Copy a Microsoft 365 share link for an item.',
    executionState: 'preview-disabled',
    futureCapability: 'Microsoft Graph share link',
  },
  'approval-status': {
    id: 'approval-status',
    label: 'Approval Status',
    description: 'Display Microsoft 365 approval state for an item.',
    executionState: 'preview-disabled',
    futureCapability: 'Microsoft 365 approval state',
    requiresLaterGate: true,
  },
};

export interface IDocumentControlSource {
  id: DocumentControlSourceId;
  displayName: string;
  posture: DocumentControlSourcePosture;
  linkBehavior: DocumentControlLinkBehavior;
  notes?: string;
  /** Lane assignment for the corrected two-lane Document Control model. */
  lane: DocumentControlLane;
  /** Preview-only action ids that the source's lane participates in.
   *  Microsoft Files lane sources carry the full file-management action set;
   *  External Document Systems lane sources carry an empty list. */
  previewActionIds: readonly DocumentControlActionId[];
  /** Capability posture: future-graph-managed for Microsoft files,
   *  launch-link-visibility-only for external document systems. */
  capabilityPosture: DocumentControlCapabilityPosture;
  /** Display label naming the source of record (e.g., "Microsoft 365 (SharePoint)"). */
  sourceOfRecordLabel: string;
  /** Short non-PII guardrail line shown alongside the source. */
  guardrail: string;
}

const ALL_FILE_MANAGEMENT_ACTIONS: readonly DocumentControlActionId[] =
  DOCUMENT_CONTROL_ACTION_IDS;

export const DOCUMENT_CONTROL_SOURCES: Readonly<Record<DocumentControlSourceId, IDocumentControlSource>> = {
  'sharepoint-drive': {
    id: 'sharepoint-drive',
    displayName: 'SharePoint Drive',
    posture: 'mvp-required',
    linkBehavior: 'browse-in-place',
    lane: 'microsoft-files',
    previewActionIds: ALL_FILE_MANAGEMENT_ACTIONS,
    capabilityPosture: 'future-graph-managed',
    sourceOfRecordLabel: 'Microsoft 365 (SharePoint)',
    guardrail: 'PCC does not duplicate Microsoft files into a separate store.',
  },
  'onedrive': {
    id: 'onedrive',
    displayName: 'OneDrive',
    posture: 'mvp-required',
    linkBehavior: 'browse-in-place',
    lane: 'microsoft-files',
    previewActionIds: ALL_FILE_MANAGEMENT_ACTIONS,
    capabilityPosture: 'future-graph-managed',
    sourceOfRecordLabel: 'Microsoft 365 (OneDrive)',
    guardrail: 'PCC does not duplicate Microsoft files into a separate store.',
  },
  'procore-files': {
    id: 'procore-files',
    displayName: 'Procore Files',
    posture: 'mvp-required',
    linkBehavior: 'launch-link',
    lane: 'external-document-systems',
    previewActionIds: [],
    capabilityPosture: 'launch-link-visibility-only',
    sourceOfRecordLabel: 'Procore',
    guardrail: 'Access depends on your permissions in Procore. PCC does not mirror, sync, or write back.',
  },
  'document-crunch': {
    id: 'document-crunch',
    displayName: 'Document Crunch',
    posture: 'conditional',
    linkBehavior: 'launch-link',
    lane: 'external-document-systems',
    previewActionIds: [],
    capabilityPosture: 'launch-link-visibility-only',
    sourceOfRecordLabel: 'Document Crunch',
    guardrail: 'Access depends on your permissions in Document Crunch. PCC does not mirror, sync, or write back.',
  },
  'adobe-sign': {
    id: 'adobe-sign',
    displayName: 'Adobe Sign',
    posture: 'mvp-optional',
    linkBehavior: 'launch-link',
    lane: 'external-document-systems',
    previewActionIds: [],
    capabilityPosture: 'launch-link-visibility-only',
    sourceOfRecordLabel: 'Adobe Sign',
    guardrail: 'Access depends on your permissions in Adobe Sign. PCC does not mirror, sync, or write back.',
  },
};
