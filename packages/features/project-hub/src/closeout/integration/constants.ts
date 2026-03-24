/**
 * P3-E10-T10 Lane Ownership and Shared Package Reuse constants.
 */

import type { CloseoutLaneCapability, CloseoutPackageLayer, CloseoutSharedPackage, CloseoutSpineContract, CloseoutSurfaceTarget } from './enums.js';
import type {
  IAcknowledgmentUseCase, IAnnotationAttachmentPoint, IBICPrompt,
  ICloseoutExternalOwnership, ICloseoutPackageIdentity, ILaneCapabilityEntry,
  INotificationContract, IProhibitedDependency, IRelatedItemsPair,
  ISPFxConstraint, IPWAFeature, ISpinePublicationContract,
  ISurfaceClassification, IVersionedRecordContract, IWorkflowHandoffTrigger,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const CLOSEOUT_PACKAGE_LAYERS = ['Foundation', 'Platform', 'Shared', 'Feature'] as const satisfies ReadonlyArray<CloseoutPackageLayer>;
export const CLOSEOUT_SURFACE_TARGETS = ['PWA', 'SPFx'] as const satisfies ReadonlyArray<CloseoutSurfaceTarget>;
export const CLOSEOUT_SHARED_PACKAGES = ['related-items', 'versioned-record', 'field-annotations', 'workflow-handoff', 'acknowledgment', 'bic-next-move', 'notification-intelligence'] as const satisfies ReadonlyArray<CloseoutSharedPackage>;
export const CLOSEOUT_SPINE_CONTRACTS = ['ActivitySpine', 'HealthSpine', 'WorkQueue'] as const satisfies ReadonlyArray<CloseoutSpineContract>;
export const CLOSEOUT_LANE_CAPABILITIES = ['ProjectRecords', 'OrgIntelligenceWrite', 'LifecycleGating', 'WorkQueue', 'HealthSignal', 'ActivitySignal', 'ReportsSnapshot'] as const satisfies ReadonlyArray<CloseoutLaneCapability>;

// -- Package Identity (§1.1) ------------------------------------------------

export const CLOSEOUT_PACKAGE_IDENTITY: ICloseoutPackageIdentity = {
  path: 'packages/features/project-closeout/',
  name: '@hbc/project-closeout',
  layer: 'Feature',
};

// -- External Ownership (§1.3) ----------------------------------------------

export const CLOSEOUT_EXTERNAL_OWNERSHIP: ReadonlyArray<ICloseoutExternalOwnership> = [
  { content: 'Org intelligence index data and read models', correctOwner: 'Separate org-intelligence layer (Phase 3 — to be defined)' },
  { content: 'Sub intelligence viewer UI in Project Hub', correctOwner: 'Project Hub feature package; consumes org-intelligence query API' },
  { content: 'Lessons intelligence search UI in Project Hub', correctOwner: 'Project Hub feature package; consumes org-intelligence query API' },
  { content: 'Reusable visual components', correctOwner: '@hbc/ui-kit if reused across modules' },
  { content: 'Work Queue routing logic', correctOwner: '@hbc/work-queue (P3-D3)' },
  { content: 'Notification delivery', correctOwner: '@hbc/notification-intelligence' },
];

// -- Surface Classifications (§2.1) -----------------------------------------

export const CLOSEOUT_SURFACE_CLASSIFICATIONS: ReadonlyArray<ISurfaceClassification> = [
  { subSurface: 'Closeout Execution Checklist', pwaTarget: 'Full interactive surface', spfxTarget: 'Full interactive surface', notes: 'Item-by-item mutation; completion tracking; milestone visualization' },
  { subSurface: 'Subcontractor Scorecard', pwaTarget: 'Full interactive surface', spfxTarget: 'Full interactive surface', notes: 'Form-heavy; real-time scoring; sign-off workflow' },
  { subSurface: 'Lessons Learned', pwaTarget: 'Full interactive surface', spfxTarget: 'Read-only panel; full authoring in PWA', notes: 'Rolling entry creation and report synthesis are primarily PM operations' },
  { subSurface: 'Project Autopsy', pwaTarget: 'Full interactive surface (PE-led)', spfxTarget: 'Read-only summary', notes: 'Workshop facilitation is not a field activity' },
  { subSurface: 'Project Closeout Health Summary', pwaTarget: 'Full surface + executive roll-up', spfxTarget: 'Lightweight summary widget', notes: 'Completion % and milestone status visible in SPFx' },
];

// -- SPFx Constraints (§2.2) ------------------------------------------------

export const CLOSEOUT_SPFX_CONSTRAINTS: ReadonlyArray<ISPFxConstraint> = [
  { constraint: 'No localStorage or sessionStorage', rule: 'All state must be server-round-tripped or held in component state' },
  { constraint: 'No Next.js routing', rule: 'Routing must be intra-component state machine, not Next router' },
  { constraint: 'Auth token', rule: 'SPFx acquires auth token via SharePoint spHttpClient or ADAL' },
  { constraint: 'Bundle size', rule: 'Heavy dependencies should be loaded lazily' },
  { constraint: 'Real-time updates', rule: 'No long-polling or WebSocket without approval; configurable polling intervals' },
  { constraint: 'Responsive layout', rule: 'SPFx rendered in SharePoint column with fixed width constraints' },
];

// -- PWA Features (§2.3) ----------------------------------------------------

export const CLOSEOUT_PWA_FEATURES: ReadonlyArray<IPWAFeature> = [
  { feature: 'Offline tolerance', rule: 'Checklist item mutations queue if offline; scorecard and lesson forms prevent partial submission' },
  { feature: 'Notification delivery', rule: 'Push notification via @hbc/notification-intelligence; not available in SPFx' },
  { feature: 'Print / PDF export', rule: 'Sub scorecard and lessons snapshot PDF generation triggered from PWA only' },
  { feature: 'Deep linking', rule: 'Lifecycle milestone Work Queue items link directly to relevant Closeout sub-surface' },
];

// -- Related Items Pairs (§3.1) ---------------------------------------------

export const CLOSEOUT_RELATED_ITEMS_PAIRS: ReadonlyArray<IRelatedItemsPair> = [
  { relationship: 'closeout-item → permit', source: 'CloseoutChecklistItem', target: 'IssuedPermit', items: 'Items 2.8, 3.9', behavior: 'Suggests readiness when permit reaches FINAL' },
  { relationship: 'closeout-item → financial-variance', source: 'CloseoutChecklistItem', target: 'Financial variance record', items: 'Item 6.4', behavior: 'Reads final cost variance without direct import' },
  { relationship: 'closeout-item → schedule-milestone', source: 'CloseoutChecklistItem', target: 'Schedule milestone', items: 'Items with date fields', behavior: 'Pulls actual dates from schedule' },
  { relationship: 'autopsy-finding → lesson-entry', source: 'AutopsyFinding', target: 'LessonEntry', items: 'Cross-reference within Closeout', behavior: 'Navigation and evidence linking' },
];

// -- Versioned Records (§3.1) -----------------------------------------------

export const CLOSEOUT_VERSIONED_RECORDS: ReadonlyArray<IVersionedRecordContract> = [
  { record: 'CloseoutChecklistItem', versionedFields: 'result, naJustification, itemDate' },
  { record: 'SubcontractorScorecard', versionedFields: 'All scoring fields; publicationStatus' },
  { record: 'ScorecardCriterion', versionedFields: 'score, isNA' },
  { record: 'LessonsLearningReport', versionedFields: 'publicationStatus; header context fields' },
  { record: 'AutopsyRecord', versionedFields: 'status; finding/action additions' },
  { record: 'ChecklistTemplate', versionedFields: 'Full template content (version history)' },
];

// -- Annotation Attachment Points (§3.1) ------------------------------------

export const CLOSEOUT_ANNOTATION_ATTACHMENT_POINTS: ReadonlyArray<IAnnotationAttachmentPoint> = [
  { entityType: 'closeout-checklist-item', description: 'PE observations on evidence quality or item interpretation' },
  { entityType: 'closeout-scorecard', description: 'Overall scorecard narrative observations' },
  { entityType: 'closeout-scorecard-section', description: 'Section-level review notes' },
  { entityType: 'closeout-scorecard-criterion', description: 'Per-criterion score observations' },
  { entityType: 'closeout-lesson-entry', description: 'Situation, root cause, or recommendation observations' },
  { entityType: 'closeout-lessons-report', description: 'Overall report observations' },
  { entityType: 'closeout-autopsy-finding', description: 'Finding clarification notes' },
  { entityType: 'closeout-learning-legacy-output', description: 'Pre-publication review notes' },
];

// -- Workflow Handoff Triggers (§3.1) ----------------------------------------

export const CLOSEOUT_WORKFLOW_HANDOFF_TRIGGERS: ReadonlyArray<IWorkflowHandoffTrigger> = [
  { trigger: 'FinalCloseout scorecard submitted', from: 'PM / SUPT', to: 'PE', recordAdvanced: 'SubcontractorScorecard.publicationStatus → SUBMITTED' },
  { trigger: 'LessonsLearningReport submitted', from: 'PM', to: 'PE', recordAdvanced: 'LessonsLearningReport.publicationStatus → SUBMITTED' },
  { trigger: 'AutopsyRecord submitted for approval', from: 'PM', to: 'PE', recordAdvanced: 'AutopsyRecord.status → PE_APPROVAL_PENDING' },
  { trigger: 'OWNER_ACCEPTANCE evidence submitted', from: 'PM', to: 'PE', recordAdvanced: 'CloseoutMilestone.status → EVIDENCE_PENDING' },
  { trigger: 'Archive Ready criteria met', from: 'PM requests', to: 'PE', recordAdvanced: 'CloseoutMilestone[ARCHIVE_READY].status → READY_FOR_APPROVAL' },
];

// -- Acknowledgment Use Cases (§3.1) ----------------------------------------

export const CLOSEOUT_ACKNOWLEDGMENT_USE_CASES: ReadonlyArray<IAcknowledgmentUseCase> = [
  { useCase: 'Scorecard PM sign-off', parties: 'PM', trigger: 'PM submits FinalCloseout scorecard' },
  { useCase: 'Scorecard SUPT sign-off', parties: 'SUPT', trigger: 'SUPT co-signs submitted scorecard' },
];

// -- BIC Prompts (§3.1) -----------------------------------------------------

export const CLOSEOUT_BIC_PROMPTS: ReadonlyArray<IBICPrompt> = [
  { prompt: 'Permit is Final — ready to mark item 3.9 Yes?', trigger: 'Related permit reaches FINAL; item 3.9 = Pending', targetUser: 'PM' },
  { prompt: 'FinalCloseout evaluation for [Sub] not yet submitted', trigger: '30+ days in FINAL_COMPLETION with no scorecard SUBMITTED', targetUser: 'PM' },
  { prompt: 'Lessons report not yet submitted', trigger: '45+ days in FINAL_COMPLETION; report still Draft', targetUser: 'PM' },
  { prompt: 'Autopsy action item assigned to you is open', trigger: 'Open AutopsyAction with assigneeId = currentUser', targetUser: 'Action owner' },
  { prompt: '[Project] awaiting your Archive Ready approval', trigger: 'ARCHIVE_READY criteria all pass; PE approval outstanding', targetUser: 'PE' },
];

// -- Notifications (§3.1) ---------------------------------------------------

export const CLOSEOUT_NOTIFICATIONS: ReadonlyArray<INotificationContract> = [
  { notification: 'PE review request (scorecard, lessons, autopsy)', trigger: 'Handoff raised via @hbc/workflow-handoff', channel: 'In-app + email' },
  { notification: 'Lien deadline approaching (14-day warning)', trigger: 'Item 4.14 calculatedDate within 14 days', channel: 'In-app + email' },
  { notification: 'Lien deadline missed', trigger: 'Item 4.14 calculatedDate passed', channel: 'In-app + email + escalation' },
  { notification: 'Archive Ready — PE action needed', trigger: 'All 8 criteria pass', channel: 'In-app + email' },
  { notification: 'Autopsy action item reminder', trigger: 'Open AutopsyAction overdue per targetDate', channel: 'In-app' },
];

// -- Spine Contracts (§4) ---------------------------------------------------

export const CLOSEOUT_SPINE_PUBLICATION_CONTRACTS: ReadonlyArray<ISpinePublicationContract> = [
  { spine: 'ActivitySpine', packageName: '@hbc/project-activity', eventsEmitted: '17 events per T08 §5.1', frequency: 'Per lifecycle event' },
  { spine: 'HealthSpine', packageName: '@hbc/health-indicator', eventsEmitted: '4 dimensions per T08 §5.2', frequency: 'Per item result change, per status change' },
  { spine: 'WorkQueue', packageName: '@hbc/work-queue', eventsEmitted: '7 Work Queue item types per T04 §7', frequency: 'Per trigger condition' },
];

// -- Prohibited Dependencies (§5.1) -----------------------------------------

export const CLOSEOUT_PROHIBITED_DEPENDENCIES: ReadonlyArray<IProhibitedDependency> = [
  { importPackage: '@hbc/financial', reason: 'Feature-to-feature coupling; financial data flows via snapshot API' },
  { importPackage: '@hbc/permits', reason: 'Feature-to-feature coupling; permit links via @hbc/related-items' },
  { importPackage: '@hbc/safety', reason: 'Feature-to-feature coupling; pre-briefing pack reads Safety via API' },
  { importPackage: '@hbc/schedule', reason: 'Feature-to-feature coupling; schedule dates via @hbc/related-items' },
  { importPackage: '@hbc/reports', reason: 'Reports consumes Closeout snapshots, not the reverse' },
  { importPackage: 'org-intelligence (if separate)', reason: 'Closeout writes to intelligence; it does not query it' },
];

// -- Lane Capabilities (§6) -------------------------------------------------

export const CLOSEOUT_LANE_CAPABILITY_ENTRIES: ReadonlyArray<ILaneCapabilityEntry> = [
  { lane: 'ProjectRecords', capability: 'Checklist, scorecard, lessons, autopsy records', notes: 'All project-scoped' },
  { lane: 'OrgIntelligenceWrite', capability: 'Publishes PE-approved records to org indexes on archive', notes: 'Write path only; no read path back into Closeout' },
  { lane: 'LifecycleGating', capability: 'Drives formal lifecycle state transitions with PE approval gates', notes: 'Interacts with project lifecycle manager' },
  { lane: 'WorkQueue', capability: 'Produces PM and PE work queue items for operational and governance actions', notes: 'Consumes P3-D3 contract' },
  { lane: 'HealthSignal', capability: 'Publishes closeoutCompletionPct, scorecardCoverage, lessonsReadiness, autopsyReadiness', notes: 'Consumes P3-D2 contract' },
  { lane: 'ActivitySignal', capability: 'Publishes 17 documented Activity Spine events', notes: 'Consumes P3-D1 contract' },
  { lane: 'ReportsSnapshot', capability: 'Provides frozen snapshots for scorecard and lessons-learned PDF generation', notes: 'API-boundary only' },
];

// -- Label Maps -------------------------------------------------------------

export const CLOSEOUT_LANE_CAPABILITY_LABELS: Readonly<Record<CloseoutLaneCapability, string>> = {
  ProjectRecords: 'Project Records',
  OrgIntelligenceWrite: 'Org Intelligence Write',
  LifecycleGating: 'Lifecycle Gating',
  WorkQueue: 'Work Queue',
  HealthSignal: 'Health Signal',
  ActivitySignal: 'Activity Signal',
  ReportsSnapshot: 'Reports Snapshot',
};

export const CLOSEOUT_SHARED_PACKAGE_LABELS: Readonly<Record<CloseoutSharedPackage, string>> = {
  'related-items': '@hbc/related-items',
  'versioned-record': '@hbc/versioned-record',
  'field-annotations': '@hbc/field-annotations',
  'workflow-handoff': '@hbc/workflow-handoff',
  'acknowledgment': '@hbc/acknowledgment',
  'bic-next-move': '@hbc/bic-next-move',
  'notification-intelligence': '@hbc/notification-intelligence',
};
