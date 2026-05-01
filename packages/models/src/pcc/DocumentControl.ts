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

// ── Wave 7 doctrine scaffolding (additive, contract-only) ───────────────────

/**
 * Canonical Wave 7 lane vocabulary for HB Document Control Center.
 * Existing two-lane exports remain intact for backward compatibility.
 */
export const DOCUMENT_CONTROL_WAVE7_LANES = [
  'project-record',
  'my-project-files',
  'external-systems',
] as const;
export type DocumentControlWave7Lane = (typeof DOCUMENT_CONTROL_WAVE7_LANES)[number];

/**
 * Compatibility mapping from the current two-lane runtime taxonomy into the
 * Wave 7 canonical three-lane vocabulary.
 */
export const DOCUMENT_CONTROL_LEGACY_TO_WAVE7_LANE: Readonly<
  Record<DocumentControlLane, readonly DocumentControlWave7Lane[]>
> = {
  'microsoft-files': ['project-record', 'my-project-files'],
  'external-document-systems': ['external-systems'],
};

export const DOCUMENT_CONTROL_WAVE7_TO_LEGACY_LANE: Readonly<
  Record<DocumentControlWave7Lane, DocumentControlLane>
> = {
  'project-record': 'microsoft-files',
  'my-project-files': 'microsoft-files',
  'external-systems': 'external-document-systems',
};

export const DOCUMENT_CONTROL_SOURCE_KIND_IDS = [
  'sharepoint-library',
  'sharepoint-drive',
  'my-project-files',
  'external-system',
] as const;
export type DocumentControlSourceKindId = (typeof DOCUMENT_CONTROL_SOURCE_KIND_IDS)[number];

export const DOCUMENT_CONTROL_EXTERNAL_SYSTEM_IDS = [
  'procore',
  'document-crunch',
  'adobe-sign',
  'future-approved-system',
] as const;
export type DocumentControlExternalSystemId =
  (typeof DOCUMENT_CONTROL_EXTERNAL_SYSTEM_IDS)[number];

export interface ISharePointBinding {
  kind: 'sharepoint-library' | 'sharepoint-drive';
  siteId: string;
  webId?: string;
  listId?: string;
  driveId: string;
  rootPath?: string;
}

export interface IMyProjectFilesBindingPolicy {
  rootFolderName: 'My Project Files';
  allowRootBrowsingFromProjectSite: false;
  allowCrossProjectFolderBrowsingFromProjectSite: false;
  policyNotes?: string;
}

export interface IMyProjectFilesBinding {
  kind: 'my-project-files';
  rootFolderName: 'My Project Files';
  userObjectId: string;
  projectId: string;
  projectFolderName: string;
  projectFolderPath: string;
}

export interface IExternalSourceBinding {
  kind: 'external-system';
  systemId: DocumentControlExternalSystemId;
  tenantOrOrgRef?: string;
  projectRef: string;
  launchUrlTemplate?: string;
}

export type ProjectDocumentSourceBinding =
  | ISharePointBinding
  | IMyProjectFilesBinding
  | IExternalSourceBinding;

export interface IProjectDocumentSourceRegistryEntry {
  sourceKey: string;
  displayName: string;
  wave7Lane: DocumentControlWave7Lane;
  sourceKind: DocumentControlSourceKindId;
  enabled: boolean;
  binding: ProjectDocumentSourceBinding;
  notes?: string;
}

export const DOCUMENT_CONTROL_SOURCE_HEALTH_STATES = [
  'healthy',
  'warning',
  'degraded',
  'unavailable',
  'missing-binding',
  'access-denied',
  'throttled',
] as const;
export type DocumentControlSourceHealthState =
  (typeof DOCUMENT_CONTROL_SOURCE_HEALTH_STATES)[number];

export interface IProjectDocumentSourceHealth {
  sourceKey: string;
  state: DocumentControlSourceHealthState;
  message: string;
  observedAtUtc?: string;
}

export const DOCUMENT_CONTROL_ACTION_FAMILIES = ['PR', 'MP', 'SB', 'EX', 'WF'] as const;
export type DocumentControlActionFamily = (typeof DOCUMENT_CONTROL_ACTION_FAMILIES)[number];

export interface IDocumentControlActionCode {
  code: string;
  family: DocumentControlActionFamily;
  label: string;
  description: string;
}

export const DOCUMENT_CONTROL_ACTION_CODES: readonly IDocumentControlActionCode[] = [
  { code: 'PR01', family: 'PR', label: 'Browse Project Record', description: 'Browse project record libraries.' },
  { code: 'MP01', family: 'MP', label: 'Browse My Project Files Folder', description: 'Browse current user project folder only.' },
  { code: 'SB01', family: 'SB', label: 'View Source Binding', description: 'View source binding metadata and status.' },
  { code: 'EX01', family: 'EX', label: 'Open External Source', description: 'Launch configured external source deep link.' },
  { code: 'WF01', family: 'WF', label: 'Set Review State', description: 'Set document review state per workflow posture.' },
] as const;

export const DOCUMENT_CONTROL_ROLE_CODES = [
  'R01',
  'R02',
  'R03',
  'R04',
  'R05',
  'R06',
  'R07',
  'R08',
  'R09',
  'R10',
  'R11',
  'R12',
  'R13',
  'R14',
  'R15',
  'R16',
  'R17',
  'R18',
  'R19',
  'R20',
  'R21',
  'R22',
  'R23',
] as const;
export type DocumentControlRoleCode = (typeof DOCUMENT_CONTROL_ROLE_CODES)[number];

export interface IDocumentControlRoleVocabularyEntry {
  code: DocumentControlRoleCode;
  label: string;
}

export const DOCUMENT_CONTROL_ROLE_VOCABULARY: Readonly<
  Record<DocumentControlRoleCode, IDocumentControlRoleVocabularyEntry>
> = {
  R01: { code: 'R01', label: 'PCC Admin' },
  R02: { code: 'R02', label: 'IT Admin' },
  R03: { code: 'R03', label: 'Executive Oversight' },
  R04: { code: 'R04', label: 'Project Executive' },
  R05: { code: 'R05', label: 'Project Manager' },
  R06: { code: 'R06', label: 'Superintendent' },
  R07: { code: 'R07', label: 'Project Accounting' },
  R08: { code: 'R08', label: 'Project Team Member' },
  R09: { code: 'R09', label: 'Viewer' },
  R10: { code: 'R10', label: 'Estimating Coordinator' },
  R11: { code: 'R11', label: 'Lead Estimator' },
  R12: { code: 'R12', label: 'Manager of Operational Excellence' },
  R13: { code: 'R13', label: 'Safety QAQC' },
  R14: { code: 'R14', label: 'Project Coordinator' },
  R15: { code: 'R15', label: 'Legal Reviewer' },
  R16: { code: 'R16', label: 'Compliance Reviewer' },
  R17: { code: 'R17', label: 'Leadership Reviewer' },
  R18: { code: 'R18', label: 'Contracts Reviewer' },
  R19: { code: 'R19', label: 'Owner Client Viewer' },
  R20: { code: 'R20', label: 'External Design Team' },
  R21: { code: 'R21', label: 'Subcontractor Limited' },
  R22: { code: 'R22', label: 'Approvals Coordinator' },
  R23: { code: 'R23', label: 'Document Control Observer' },
};

export interface IDocumentControlRoleActionAuthority {
  roleCode: DocumentControlRoleCode;
  actionCode: string;
  posture: 'allow' | 'owner-or-allow' | 'deferred' | 'hard-no';
}

export const DOCUMENT_CONTROL_REVIEW_STATES = [
  'not-required',
  'pending',
  'in-review',
  'approved',
  'rejected',
  'waived',
] as const;
export type DocumentControlReviewState = (typeof DOCUMENT_CONTROL_REVIEW_STATES)[number];

export const DOCUMENT_CONTROL_REVIEW_TYPES = [
  'chief-estimator-review',
  'legal-review',
  'compliance-review',
  'leadership-review',
  'project-execution-review',
] as const;
export type DocumentControlReviewType = (typeof DOCUMENT_CONTROL_REVIEW_TYPES)[number];

export interface IDocumentControlUniversalHardNoRule {
  id: string;
  title: string;
  description: string;
}

export const DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES: readonly IDocumentControlUniversalHardNoRule[] =
  [
    {
      id: 'HN-01',
      title: 'No My Project Files root browsing in project-site UI',
      description:
        "Project-site instances must not expose the full 'My Project Files' root.",
    },
    {
      id: 'HN-02',
      title: 'No other-project folder browsing in project-site UI',
      description:
        'Project-site instances must not expose folders mapped to other projects.',
    },
    {
      id: 'HN-03',
      title: 'No external writeback or sync in Wave 7',
      description:
        'External systems remain launch/deep-link visibility only with no mirror/sync/writeback.',
    },
    {
      id: 'HN-04',
      title: 'No direct broad SPFx Graph execution in Wave 7',
      description: 'No direct broad Graph execution from SPFx for Wave 7 runtime.',
    },
  ] as const;
