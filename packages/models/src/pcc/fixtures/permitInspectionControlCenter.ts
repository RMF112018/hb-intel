/**
 * PCC Permit & Inspection Control Center — deterministic sample fixtures.
 *
 * Phase 3 / Wave 10 / Prompt 02. Read-model only. No tenant URLs, no
 * secrets, no live UPNs, no non-deterministic identifiers, no runtime
 * AHJ/Procore/Graph/SharePoint calls. AHJ posture is launcher-only;
 * evidence is references-only; receipts are reference labels (no
 * blob/upload/sync field).
 *
 * Fixture coverage (per Wave 10 Prompt 02):
 *   - one expiring permit, one pending-revision permit, one active
 *     permit with both `applicationValue` and `permitFee`;
 *   - one passed inspection, one failed inspection (with required
 *     reinspection), one reinspection-scheduled inspection (with
 *     `reInspectionFee`);
 *   - one reinspection lineage chain linking the failed parent to the
 *     reinspection child with full corrective-action metadata;
 *   - one AHJ profile with `launcherOnly: true`;
 *   - one evidence-missing record (a permit with a `required-missing`
 *     evidence link);
 *   - one fee exposure in `pending-receipt` and one in `disputed`;
 *   - one priority-action signal, one readiness signal targeting the
 *     preserved `permit-log` source-module identifier, one approval
 *     signal.
 */

import type {
  IAhjJurisdictionProfile,
  IFeeExposureRecord,
  IInspectionRecord,
  IPermitInspectionApprovalSignal,
  IPermitInspectionAuditEvent,
  IPermitInspectionControlCenterReadModel,
  IPermitInspectionControlCenterSummary,
  IPermitInspectionEvidenceLink,
  IPermitInspectionPriorityActionSignal,
  IPermitInspectionReadinessSignal,
  IPermitInspectionSourceLineage,
  IPermitInspectionTransition,
  IPermitRecord,
  IReinspectionLineage,
  PccPermitInspectionControlCenterReadModel,
} from '../PermitInspectionControlCenter.js';

const PERMIT_WORKBOOK = 'Permit_Log_Template.xlsx';
const INSPECTION_WORKBOOK = 'Inspection-Log-Template.xlsx';

const PERMIT_SOURCE: IPermitInspectionSourceLineage = {
  workbookFile: PERMIT_WORKBOOK,
  sheet: 'PERMITS',
  range: 'A1:O148',
  classification: 'workbook-derived',
};

const INSPECTION_SOURCE: IPermitInspectionSourceLineage = {
  workbookFile: INSPECTION_WORKBOOK,
  sheet: 'Sheet1',
  range: 'A1:F201',
  classification: 'workbook-derived',
};

const AHJ_SOURCE: IPermitInspectionSourceLineage = {
  workbookFile: PERMIT_WORKBOOK,
  sheet: 'PERMITS',
  range: 'A1:O148',
  classification: 'workbook-enhanced',
};

const PERMIT_AUDIT_BASE: readonly IPermitInspectionAuditEvent[] = [
  {
    id: 'audit-permit-base-001',
    occurredAtUtc: '2026-04-15T14:00:00Z',
    actorPersona: 'project-coordinator',
    action: 'permit-record-created',
    correlationId: 'cor-permit-001',
  },
];

const INSPECTION_AUDIT_BASE: readonly IPermitInspectionAuditEvent[] = [
  {
    id: 'audit-inspection-base-001',
    occurredAtUtc: '2026-04-22T16:30:00Z',
    actorPersona: 'superintendent',
    action: 'inspection-record-created',
    correlationId: 'cor-inspection-001',
  },
];

export const SAMPLE_PERMIT_INSPECTION_AHJ_PROFILES: readonly IAhjJurisdictionProfile[] = [
  {
    ahjId: 'ahj-example-city-001',
    ahjDisplayName: 'Example City Building Department',
    jurisdictionType: 'city',
    portalUrl: 'https://example.invalid/permits/city',
    inspectionPortalUrl: 'https://example.invalid/inspections/city',
    contactName: 'Permit Counter',
    contactPhone: '+1-555-0100',
    contactEmail: 'permits@example.com',
    cutoffNotes: 'Inspection requests accepted until 16:00 local time.',
    launcherOnly: true,
    sourceLineage: AHJ_SOURCE,
  },
  {
    ahjId: 'ahj-example-county-001',
    ahjDisplayName: 'Example County Public Works',
    jurisdictionType: 'county',
    portalUrl: 'https://example.invalid/permits/county',
    contactName: 'County Records',
    contactPhone: '+1-555-0150',
    cutoffNotes: 'County reinspection fees collected at next visit.',
    launcherOnly: true,
    sourceLineage: AHJ_SOURCE,
  },
];

const PERMIT_EVIDENCE_PRESENT: IPermitInspectionEvidenceLink = {
  id: 'evid-permit-coa-001',
  label: 'Approved permit certificate (Document Control)',
  status: 'verified',
  externalRef: 'doc-ctrl-permit-coa-001',
  ownedByDocumentControl: true,
};

const PERMIT_EVIDENCE_MISSING: IPermitInspectionEvidenceLink = {
  id: 'evid-permit-revision-pkg-001',
  label: 'Revised permit application packet (awaiting upload)',
  status: 'required-missing',
  ownedByDocumentControl: true,
};

const INSPECTION_EVIDENCE_PRESENT: IPermitInspectionEvidenceLink = {
  id: 'evid-inspection-photo-001',
  label: 'Field inspection photo set (Document Control)',
  status: 'submitted',
  externalRef: 'doc-ctrl-inspection-photo-001',
  ownedByDocumentControl: true,
};

const INSPECTION_EVIDENCE_REINSPECTION: IPermitInspectionEvidenceLink = {
  id: 'evid-reinspection-corrective-001',
  label: 'Corrective-action photo log (Document Control)',
  status: 'submitted',
  externalRef: 'doc-ctrl-reinspection-corrective-001',
  ownedByDocumentControl: true,
};

const FEE_RECEIPT_PENDING: IPermitInspectionEvidenceLink = {
  id: 'evid-fee-receipt-pending-001',
  label: 'Permit fee receipt (awaiting accounting upload)',
  status: 'required-missing',
  ownedByDocumentControl: true,
};

const FEE_RECEIPT_DISPUTED: IPermitInspectionEvidenceLink = {
  id: 'evid-fee-receipt-disputed-001',
  label: 'Disputed reinspection fee — original invoice',
  status: 'submitted',
  externalRef: 'doc-ctrl-fee-disputed-001',
  ownedByDocumentControl: true,
};

export const SAMPLE_PERMITS: readonly IPermitRecord[] = [
  {
    permitId: 'permit-active-001',
    permitNumber: 'BLD-2026-001',
    permitType: 'Building — Core & Shell',
    status: 'active',
    location: 'Level 1 — Main entrance',
    description: 'Active building permit for core and shell work.',
    responsibleParty: 'project-manager',
    ahjId: 'ahj-example-city-001',
    dateRequired: '2026-02-01',
    dateSubmitted: '2026-02-10',
    dateReceived: '2026-03-05',
    dateExpires: '2026-12-31',
    revision: 0,
    applicationValue: 1_250_000,
    permitFee: 18_750,
    comments: 'Active permit; fee paid; receipt logged.',
    evidenceLinks: [PERMIT_EVIDENCE_PRESENT],
    auditEvents: PERMIT_AUDIT_BASE,
    sourceLineage: PERMIT_SOURCE,
    sourceFamily: 'permits',
  },
  {
    permitId: 'permit-expiring-001',
    permitNumber: 'BLD-2025-204',
    permitType: 'Mechanical — HVAC',
    status: 'expiring',
    location: 'Roof — Mechanical platform',
    description: 'HVAC permit nearing expiration; renewal in flight.',
    responsibleParty: 'project-manager',
    ahjId: 'ahj-example-city-001',
    dateRequired: '2025-11-01',
    dateSubmitted: '2025-11-15',
    dateReceived: '2025-12-10',
    dateExpires: '2026-05-31',
    revision: 1,
    applicationValue: 350_000,
    permitFee: 5_250,
    comments: 'Expiring within 30 days; renewal initiated.',
    evidenceLinks: [PERMIT_EVIDENCE_PRESENT],
    auditEvents: PERMIT_AUDIT_BASE,
    sourceLineage: PERMIT_SOURCE,
    sourceFamily: 'permits',
  },
  {
    permitId: 'permit-expired-001',
    permitNumber: 'BLD-2025-150',
    permitType: 'Plumbing — Site Service',
    status: 'expired',
    location: 'Site — Utility yard',
    description: 'Site service plumbing permit expired before construction restart.',
    responsibleParty: 'project-coordinator',
    ahjId: 'ahj-example-county-001',
    dateRequired: '2025-08-01',
    dateSubmitted: '2025-08-15',
    dateReceived: '2025-09-10',
    dateExpires: '2026-03-15',
    revision: 0,
    applicationValue: 95_000,
    permitFee: 1_425,
    comments: 'Expired before construction restart; renewal needed before tie-in.',
    evidenceLinks: [PERMIT_EVIDENCE_PRESENT],
    auditEvents: PERMIT_AUDIT_BASE,
    sourceLineage: PERMIT_SOURCE,
    sourceFamily: 'permits',
  },
  {
    permitId: 'permit-pending-revision-001',
    permitNumber: 'BLD-2026-115',
    permitType: 'Electrical — Service Upgrade',
    status: 'pending-revision',
    location: 'Basement — Main switchgear',
    description:
      'Electrical service upgrade returned by AHJ for revision; revised packet in preparation.',
    responsibleParty: 'project-coordinator',
    ahjId: 'ahj-example-county-001',
    dateRequired: '2026-03-15',
    dateSubmitted: '2026-03-25',
    revision: 2,
    applicationValue: 220_000,
    permitFee: 3_300,
    comments: 'Pending revision; evidence packet missing — see priority action.',
    evidenceLinks: [PERMIT_EVIDENCE_MISSING],
    auditEvents: [
      ...PERMIT_AUDIT_BASE,
      {
        id: 'audit-permit-revision-001',
        occurredAtUtc: '2026-04-30T15:00:00Z',
        actorPersona: 'project-coordinator',
        action: 'permit-status-transition',
        priorValue: 'application-submitted',
        newValue: 'pending-revision',
        reason: 'AHJ requested clarifications on load calculations.',
      },
    ],
    sourceLineage: PERMIT_SOURCE,
    sourceFamily: 'permits',
  },
];

export const SAMPLE_INSPECTIONS: readonly IInspectionRecord[] = [
  {
    inspectionId: 'inspection-passed-001',
    inspectionNumber: 'INS-2026-014',
    inspectionType: 'Foundation — Footing',
    inspectionCode: 'FND-FT',
    relatedPermitId: 'permit-active-001',
    status: 'passed',
    resultStatus: 'pass',
    dateCalledIn: '2026-04-18',
    scheduledWindow: '2026-04-22T08:00:00Z/2026-04-22T12:00:00Z',
    comment: 'Footing inspection passed on first attempt.',
    verifiedOnline: true,
    reinspectionRequired: false,
    evidenceLinks: [INSPECTION_EVIDENCE_PRESENT],
    auditEvents: INSPECTION_AUDIT_BASE,
    sourceLineage: INSPECTION_SOURCE,
    sourceFamily: 'required-inspections',
  },
  {
    inspectionId: 'inspection-failed-001',
    inspectionNumber: 'INS-2026-027',
    inspectionType: 'Framing — Rough-in',
    inspectionCode: 'FRM-RI',
    relatedPermitId: 'permit-active-001',
    status: 'failed',
    resultStatus: 'fail',
    dateCalledIn: '2026-04-25',
    scheduledWindow: '2026-04-29T13:00:00Z/2026-04-29T16:00:00Z',
    comment: 'Failed for missing fire blocking at chase penetrations.',
    verifiedOnline: true,
    reinspectionRequired: true,
    evidenceLinks: [INSPECTION_EVIDENCE_PRESENT],
    auditEvents: [
      ...INSPECTION_AUDIT_BASE,
      {
        id: 'audit-inspection-failed-001',
        occurredAtUtc: '2026-04-29T15:30:00Z',
        actorPersona: 'superintendent',
        action: 'inspection-result-recorded',
        priorValue: 'scheduled',
        newValue: 'failed',
        reason: 'Missing fire blocking at chase penetrations.',
      },
    ],
    sourceLineage: INSPECTION_SOURCE,
    sourceFamily: 'required-inspections',
  },
  {
    inspectionId: 'inspection-ready-001',
    inspectionNumber: 'INS-2026-035',
    inspectionType: 'Underground — Water Service',
    inspectionCode: 'UND-WS',
    relatedPermitId: 'permit-active-001',
    status: 'ready-to-request',
    dateCalledIn: '2026-05-04',
    comment: 'Underground water service ready to request inspection at AHJ portal.',
    verifiedOnline: false,
    reinspectionRequired: false,
    evidenceLinks: [INSPECTION_EVIDENCE_PRESENT],
    auditEvents: INSPECTION_AUDIT_BASE,
    sourceLineage: INSPECTION_SOURCE,
    sourceFamily: 'required-inspections',
  },
  {
    inspectionId: 'inspection-reinspection-001',
    inspectionNumber: 'INS-2026-027R',
    inspectionType: 'Framing — Rough-in (Reinspection)',
    inspectionCode: 'FRM-RI-R',
    relatedPermitId: 'permit-active-001',
    status: 'reinspection-scheduled',
    dateCalledIn: '2026-05-01',
    scheduledWindow: '2026-05-06T13:00:00Z/2026-05-06T16:00:00Z',
    comment: 'Reinspection scheduled after corrective action.',
    verifiedOnline: false,
    reinspectionRequired: false,
    reInspectionFee: 250,
    evidenceLinks: [INSPECTION_EVIDENCE_REINSPECTION],
    auditEvents: INSPECTION_AUDIT_BASE,
    sourceLineage: INSPECTION_SOURCE,
    sourceFamily: 'required-inspections',
  },
];

export const SAMPLE_REINSPECTION_LINEAGES: readonly IReinspectionLineage[] = [
  {
    lineageId: 'lineage-frame-rough-in-001',
    parentInspectionId: 'inspection-failed-001',
    childReinspectionId: 'inspection-reinspection-001',
    failedItemSummary:
      'Missing fire blocking at chase penetrations; corrective install required at all chase locations on Level 2.',
    correctiveActionOwner: 'superintendent',
    correctiveActionDueDate: '2026-05-05',
    reinspectionRequired: true,
    reinspectionRequestedDate: '2026-05-01',
    reinspectionScheduledWindow: '2026-05-06T13:00:00Z/2026-05-06T16:00:00Z',
    reInspectionFee: 250,
    evidenceLinks: [INSPECTION_EVIDENCE_REINSPECTION],
    auditEvents: [
      {
        id: 'audit-lineage-001',
        occurredAtUtc: '2026-04-30T09:00:00Z',
        actorPersona: 'superintendent',
        action: 'corrective-action-assigned',
        reason: 'Assigned to crew; install verified by photo log.',
      },
      {
        id: 'audit-lineage-002',
        occurredAtUtc: '2026-05-01T11:00:00Z',
        actorPersona: 'superintendent',
        action: 'reinspection-requested',
      },
    ],
  },
];

export const SAMPLE_FEE_EXPOSURE: readonly IFeeExposureRecord[] = [
  {
    feeRecordId: 'fee-permit-pending-001',
    relatedRecordType: 'permit',
    relatedRecordId: 'permit-pending-revision-001',
    applicationValue: 220_000,
    permitFee: 3_300,
    feeStatus: 'pending-receipt',
    invoiceReference: 'INV-2026-PERMIT-115',
    receiptEvidenceLinks: [FEE_RECEIPT_PENDING],
    notes: 'Awaiting accounting to capture receipt in Document Control.',
  },
  {
    feeRecordId: 'fee-permit-renewal-001',
    relatedRecordType: 'permit',
    relatedRecordId: 'permit-expired-001',
    applicationValue: 95_000,
    permitFee: 1_425,
    feeStatus: 'open',
    invoiceReference: 'INV-2026-PERMIT-150-RENEWAL',
    receiptEvidenceLinks: [],
    notes:
      'Renewal fee invoice issued; awaiting AHJ acknowledgment. No upload behavior — Document Control owns evidence.',
  },
  {
    feeRecordId: 'fee-reinspection-open-001',
    relatedRecordType: 'reinspection',
    relatedRecordId: 'inspection-reinspection-001',
    reInspectionFee: 250,
    feeStatus: 'pending-receipt',
    invoiceReference: 'INV-2026-REINSP-027-FOLLOWUP',
    receiptEvidenceLinks: [],
    notes:
      'Reinspection fee invoiced for the framing follow-up; awaiting AHJ acknowledgment. No payment runtime, no upload affordance.',
  },
  {
    feeRecordId: 'fee-reinspection-disputed-001',
    relatedRecordType: 'reinspection',
    relatedRecordId: 'inspection-reinspection-001',
    reInspectionFee: 250,
    feeStatus: 'disputed',
    invoiceReference: 'INV-2026-REINSP-027',
    receiptEvidenceLinks: [FEE_RECEIPT_DISPUTED],
    notes: 'Subcontractor disputes reinspection fee allocation; pending dispute resolution.',
  },
];

export const SAMPLE_PERMIT_INSPECTION_PRIORITY_ACTION_SIGNALS: readonly IPermitInspectionPriorityActionSignal[] =
  [
    {
      signalId: 'pa-signal-permit-revision-001',
      sourceFamily: 'permits',
      sourceRecordId: 'permit-pending-revision-001',
      priorityActionCategory: 'permit',
      severity: 'Warning',
      summary: 'Revised permit application packet missing — submit corrections to AHJ.',
      dueDate: '2026-05-08',
    },
    {
      signalId: 'pa-signal-inspection-reinspection-001',
      sourceFamily: 'required-inspections',
      sourceRecordId: 'inspection-reinspection-001',
      priorityActionCategory: 'inspection',
      severity: 'Warning',
      summary: 'Framing reinspection scheduled — confirm corrective work complete.',
      dueDate: '2026-05-06',
    },
    {
      signalId: 'pa-signal-permit-expired-001',
      sourceFamily: 'permits',
      sourceRecordId: 'permit-expired-001',
      priorityActionCategory: 'permit',
      severity: 'Blocking',
      summary: 'Plumbing permit expired — initiate renewal before construction tie-in.',
      dueDate: '2026-05-09',
    },
    {
      signalId: 'pa-signal-inspection-ready-001',
      sourceFamily: 'required-inspections',
      sourceRecordId: 'inspection-ready-001',
      priorityActionCategory: 'inspection',
      severity: 'Warning',
      summary: 'Underground water service inspection ready to request at AHJ portal.',
      dueDate: '2026-05-07',
    },
    {
      signalId: 'pa-signal-closeout-exposure-001',
      sourceFamily: 'permits',
      sourceRecordId: 'permit-expired-001',
      priorityActionCategory: 'closeout',
      severity: 'Blocking',
      summary: 'Expired plumbing permit creates closeout / TCO / CO exposure until renewal closes.',
      dueDate: '2026-05-15',
    },
  ];

export const SAMPLE_PERMIT_INSPECTION_READINESS_SIGNALS: readonly IPermitInspectionReadinessSignal[] =
  [
    {
      signalId: 'rd-signal-permit-revision-001',
      readinessSourceModuleId: 'permit-log',
      sourceFamily: 'permits',
      sourceRecordId: 'permit-pending-revision-001',
      posture: 'risk',
      summary: 'Permit pending revision blocks permit-readiness gate until packet is resubmitted.',
    },
    {
      signalId: 'rd-signal-inspection-failed-001',
      readinessSourceModuleId: 'permit-log',
      sourceFamily: 'required-inspections',
      sourceRecordId: 'inspection-failed-001',
      posture: 'attention',
      summary:
        'Failed framing inspection; reinspection in flight — readiness will recover after pass.',
    },
    {
      signalId: 'rd-signal-inspection-not-scheduled-001',
      readinessSourceModuleId: 'permit-log',
      sourceFamily: 'required-inspections',
      sourceRecordId: 'inspection-ready-001',
      posture: 'attention',
      summary:
        'Underground water service ready to request — not scheduled within target inspection window.',
    },
    {
      signalId: 'rd-signal-closeout-exposure-001',
      readinessSourceModuleId: 'permit-log',
      sourceFamily: 'permits',
      sourceRecordId: 'permit-expired-001',
      posture: 'blocker',
      summary: 'Expired plumbing permit blocks closeout / TCO / CO until renewal is approved.',
    },
  ];

export const SAMPLE_PERMIT_INSPECTION_APPROVAL_SIGNALS: readonly IPermitInspectionApprovalSignal[] =
  [
    {
      signalId: 'apr-signal-no-reinspection-001',
      sourceFamily: 'required-inspections',
      sourceRecordId: 'inspection-failed-001',
      checkpointKind: 'no-reinspection-exception',
      summary: 'No-reinspection exception draft for documentary clarification; not yet authorized.',
    },
    {
      signalId: 'apr-signal-evidence-override-001',
      sourceFamily: 'required-inspections',
      sourceRecordId: 'inspection-failed-001',
      checkpointKind: 'evidence-override-by-reason',
      summary:
        'Evidence override draft for failed inspection — corrective action photo log pending verification.',
    },
    {
      signalId: 'apr-signal-transition-exception-001',
      sourceFamily: 'permits',
      sourceRecordId: 'permit-expired-001',
      checkpointKind: 'transition-exception-override',
      summary: 'Transition exception draft for expired → void path; not yet authorized.',
    },
    {
      signalId: 'apr-signal-closeout-authorization-001',
      sourceFamily: 'permits',
      sourceRecordId: 'permit-expired-001',
      checkpointKind: 'closeout-authorization',
      summary: 'Closeout authorization draft pending all permit renewals and inspections.',
    },
  ];

export const SAMPLE_PERMIT_INSPECTION_TRANSITIONS: {
  readonly permits: readonly IPermitInspectionTransition[];
  readonly inspections: readonly IPermitInspectionTransition[];
} = {
  permits: [
    {
      from: 'application-submitted',
      to: 'pending-revision',
      decisionAuthorityPersona: 'project-coordinator',
      requiresApproval: false,
      requiresReason: true,
    },
    {
      from: 'application-submitted',
      to: 'approved',
      decisionAuthorityPersona: 'project-manager',
      requiresApproval: true,
      requiresReason: false,
    },
    {
      from: 'active',
      to: 'expiring',
      requiresApproval: false,
      requiresReason: false,
    },
    {
      from: 'expiring',
      to: 'expired',
      requiresApproval: false,
      requiresReason: false,
    },
  ],
  inspections: [
    {
      from: 'scheduled',
      to: 'failed',
      decisionAuthorityPersona: 'superintendent',
      requiresApproval: false,
      requiresReason: true,
    },
    {
      from: 'failed',
      to: 'reinspection-required',
      requiresApproval: false,
      requiresReason: false,
    },
    {
      from: 'reinspection-required',
      to: 'reinspection-scheduled',
      decisionAuthorityPersona: 'superintendent',
      requiresApproval: false,
      requiresReason: false,
    },
  ],
};

export const SAMPLE_PERMIT_INSPECTION_SUMMARY: IPermitInspectionControlCenterSummary = {
  permitCount: SAMPLE_PERMITS.length,
  expiringCount: SAMPLE_PERMITS.filter((p) => p.status === 'expiring').length,
  expiredCount: SAMPLE_PERMITS.filter((p) => p.status === 'expired').length,
  pendingRevisionCount: SAMPLE_PERMITS.filter((p) => p.status === 'pending-revision').length,
  inspectionCount: SAMPLE_INSPECTIONS.length,
  failedInspectionCount: SAMPLE_INSPECTIONS.filter((i) => i.status === 'failed').length,
  openReinspectionCount: SAMPLE_INSPECTIONS.filter((i) => i.status === 'reinspection-scheduled')
    .length,
  openFeeExposureCount: SAMPLE_FEE_EXPOSURE.filter(
    (f) =>
      f.feeStatus === 'open' || f.feeStatus === 'pending-receipt' || f.feeStatus === 'disputed',
  ).length,
  evidenceMissingCount:
    SAMPLE_PERMITS.flatMap((p) => p.evidenceLinks).filter((e) => e.status === 'required-missing')
      .length +
    SAMPLE_INSPECTIONS.flatMap((i) => i.evidenceLinks).filter(
      (e) => e.status === 'required-missing',
    ).length,
  ahjLauncherCount: SAMPLE_PERMIT_INSPECTION_AHJ_PROFILES.length,
};

export const PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE: IPermitInspectionControlCenterReadModel = {
  summary: SAMPLE_PERMIT_INSPECTION_SUMMARY,
  permits: SAMPLE_PERMITS,
  inspections: SAMPLE_INSPECTIONS,
  reinspectionLineages: SAMPLE_REINSPECTION_LINEAGES,
  ahjProfiles: SAMPLE_PERMIT_INSPECTION_AHJ_PROFILES,
  feeExposure: SAMPLE_FEE_EXPOSURE,
  priorityActionSignals: SAMPLE_PERMIT_INSPECTION_PRIORITY_ACTION_SIGNALS,
  readinessSignals: SAMPLE_PERMIT_INSPECTION_READINESS_SIGNALS,
  approvalSignals: SAMPLE_PERMIT_INSPECTION_APPROVAL_SIGNALS,
  permitTransitions: SAMPLE_PERMIT_INSPECTION_TRANSITIONS.permits,
  inspectionTransitions: SAMPLE_PERMIT_INSPECTION_TRANSITIONS.inspections,
};

export const PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE_ALIAS: PccPermitInspectionControlCenterReadModel =
  PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE;
