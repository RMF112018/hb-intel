/**
 * PCC Shared Procore Data Layer — deterministic sample fixtures.
 *
 * Phase 3 / Wave 13 / Prompt 13C. Read-model only. No tenant URLs, no
 * secrets, no live UPNs, no non-deterministic identifiers, no runtime
 * Graph / PnP / SharePoint REST / Procore / Sage / AHJ calls. All URLs
 * use the RFC 6761 reserved invalid TLD `https://example.invalid` and
 * all UPNs use the RFC 2606 reserved domain `@example.com`.
 *
 * Fixtures cover:
 *   - all 18 subject areas (registry mirror);
 *   - source lineage entries per subject area;
 *   - object links per subject area (deterministic dedupe keys);
 *   - curated summaries;
 *   - derived signals across all 11 cross-module category families;
 *   - sync-health entries covering every sync state and every source
 *     state (degraded modes included);
 *   - aggregate sync-health read-model envelope payload.
 *
 * @module pcc/fixtures/procoreDataLayer
 */

import {
  PCC_PROCORE_SUBJECT_AREA_REGISTRY,
  buildProcoreObjectLinkDedupeKey,
  type PccProcoreCuratedSummary,
  type PccProcoreDataLayerModuleIdentity,
  type PccProcoreDataLayerSourcePosture,
  type PccProcoreDerivedSignal,
  type PccProcoreObjectLink,
  type PccProcoreSourceLineage,
  type PccProcoreSubjectArea,
  type PccProcoreSyncHealthEntry,
  type PccProcoreSyncHealthReadModel,
} from '../PccProcoreDataLayer.js';

const PROCORE_COMPANY_ID = 'procore-company-w13c-sample';

// ---------------------------------------------------------------------------
// Subject-area registry sample (mirrors the canonical registry).
// ---------------------------------------------------------------------------

export const SAMPLE_PROCORE_SUBJECT_AREAS: readonly PccProcoreSubjectArea[] = [
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['projects'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['companies'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['directories'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['rfis'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['submittals'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['observations'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['punch'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['daily-logs'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['drawings'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['specifications'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['photos'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['inspections'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['documents'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['commitments'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['change-events'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['change-orders'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['vendors'],
  PCC_PROCORE_SUBJECT_AREA_REGISTRY['budget'],
];

// ---------------------------------------------------------------------------
// Source lineage entries — one per subject area, deterministic.
// ---------------------------------------------------------------------------

function lineage(
  subjectArea: PccProcoreSubjectArea['id'],
  procoreObjectId: string,
  procoreObjectType: string,
  capturedAtUtc: string,
): PccProcoreSourceLineage {
  return {
    subjectArea,
    procoreCompanyId: PROCORE_COMPANY_ID,
    procoreObjectId,
    procoreObjectType,
    capturedAtUtc,
    refreshTrigger: 'scheduled',
    sourceEndpointVersion: 'v1.2',
    owningProvider: 'pcc-mock-provider',
  };
}

const LINEAGE_PROJECTS = lineage(
  'projects',
  'procore-project-001',
  'Project',
  '2026-04-28T15:00:00Z',
);
const LINEAGE_COMPANIES = lineage(
  'companies',
  'procore-company-record-001',
  'Company',
  '2026-04-28T15:05:00Z',
);
const LINEAGE_DIRECTORIES = lineage(
  'directories',
  'procore-directory-user-001',
  'DirectoryUser',
  '2026-04-28T15:10:00Z',
);
const LINEAGE_RFIS = lineage('rfis', 'procore-rfi-1001', 'RFI', '2026-04-28T15:15:00Z');
const LINEAGE_SUBMITTALS = lineage(
  'submittals',
  'procore-submittal-2001',
  'Submittal',
  '2026-04-28T15:20:00Z',
);
const LINEAGE_OBSERVATIONS = lineage(
  'observations',
  'procore-observation-3001',
  'Observation',
  '2026-04-28T15:25:00Z',
);
const LINEAGE_PUNCH = lineage('punch', 'procore-punch-4001', 'PunchItem', '2026-04-28T15:30:00Z');
const LINEAGE_DAILY_LOGS = lineage(
  'daily-logs',
  'procore-daily-log-5001',
  'DailyLog',
  '2026-04-28T15:35:00Z',
);
const LINEAGE_DRAWINGS = lineage(
  'drawings',
  'procore-drawing-6001',
  'Drawing',
  '2026-03-15T10:00:00Z',
);
const LINEAGE_SPECIFICATIONS = lineage(
  'specifications',
  'procore-spec-7001',
  'SpecificationSection',
  '2026-04-12T15:00:00Z',
);
const LINEAGE_PHOTOS = lineage('photos', 'procore-photo-8001', 'Photo', '2026-04-28T15:40:00Z');
const LINEAGE_INSPECTIONS = lineage(
  'inspections',
  'procore-inspection-9001',
  'Inspection',
  '2026-04-28T15:45:00Z',
);
const LINEAGE_DOCUMENTS = lineage(
  'documents',
  'procore-document-10001',
  'Document',
  '2026-04-28T15:50:00Z',
);
const LINEAGE_COMMITMENTS = lineage(
  'commitments',
  'procore-commitment-11001',
  'Commitment',
  '2026-04-28T15:55:00Z',
);
const LINEAGE_CHANGE_EVENTS = lineage(
  'change-events',
  'procore-change-event-12001',
  'ChangeEvent',
  '2026-04-28T16:00:00Z',
);
const LINEAGE_CHANGE_ORDERS = lineage(
  'change-orders',
  'procore-change-order-13001',
  'ChangeOrder',
  '2026-04-28T16:05:00Z',
);
const LINEAGE_VENDORS = lineage(
  'vendors',
  'procore-vendor-14001',
  'Vendor',
  '2026-04-28T16:10:00Z',
);
const LINEAGE_BUDGET = lineage(
  'budget',
  'procore-budget-line-15001',
  'BudgetLine',
  '2026-04-28T16:15:00Z',
);

export const SAMPLE_PROCORE_SOURCE_LINEAGES: readonly PccProcoreSourceLineage[] = [
  LINEAGE_PROJECTS,
  LINEAGE_COMPANIES,
  LINEAGE_DIRECTORIES,
  LINEAGE_RFIS,
  LINEAGE_SUBMITTALS,
  LINEAGE_OBSERVATIONS,
  LINEAGE_PUNCH,
  LINEAGE_DAILY_LOGS,
  LINEAGE_DRAWINGS,
  LINEAGE_SPECIFICATIONS,
  LINEAGE_PHOTOS,
  LINEAGE_INSPECTIONS,
  LINEAGE_DOCUMENTS,
  LINEAGE_COMMITMENTS,
  LINEAGE_CHANGE_EVENTS,
  LINEAGE_CHANGE_ORDERS,
  LINEAGE_VENDORS,
  LINEAGE_BUDGET,
];

// ---------------------------------------------------------------------------
// Object links — at least one per subject area.
// ---------------------------------------------------------------------------

function objectLink(
  id: string,
  subjectArea: PccProcoreObjectLink['subjectArea'],
  procoreObjectId: string,
  displayLabel: string,
  sourceLineage: PccProcoreSourceLineage,
  procoreObjectKey?: string,
): PccProcoreObjectLink {
  return {
    id,
    subjectArea,
    procoreCompanyId: PROCORE_COMPANY_ID,
    procoreObjectId,
    procoreObjectKey,
    displayLabel,
    sourceLineage,
    dedupeKey: buildProcoreObjectLinkDedupeKey(
      subjectArea,
      PROCORE_COMPANY_ID,
      procoreObjectId,
      procoreObjectKey,
    ),
  };
}

export const SAMPLE_PROCORE_OBJECT_LINKS: readonly PccProcoreObjectLink[] = [
  objectLink(
    'link-w13c-projects-001',
    'projects',
    LINEAGE_PROJECTS.procoreObjectId,
    'Riverwalk Plaza — Tower A (Procore project record)',
    LINEAGE_PROJECTS,
  ),
  objectLink(
    'link-w13c-companies-001',
    'companies',
    LINEAGE_COMPANIES.procoreObjectId,
    'HB Construction Sample Company',
    LINEAGE_COMPANIES,
  ),
  objectLink(
    'link-w13c-directories-001',
    'directories',
    LINEAGE_DIRECTORIES.procoreObjectId,
    'Procore directory user — sample.user@example.com',
    LINEAGE_DIRECTORIES,
  ),
  objectLink(
    'link-w13c-rfis-001',
    'rfis',
    LINEAGE_RFIS.procoreObjectId,
    'RFI #102 — Slab penetration coordination',
    LINEAGE_RFIS,
    'RFI-102',
  ),
  objectLink(
    'link-w13c-submittals-001',
    'submittals',
    LINEAGE_SUBMITTALS.procoreObjectId,
    'Submittal 03-20-00 — Shop drawings',
    LINEAGE_SUBMITTALS,
    'SUB-03-20-00',
  ),
  objectLink(
    'link-w13c-observations-001',
    'observations',
    LINEAGE_OBSERVATIONS.procoreObjectId,
    'Observation #45 — Trip hazard at Level 02 stair',
    LINEAGE_OBSERVATIONS,
  ),
  objectLink(
    'link-w13c-punch-001',
    'punch',
    LINEAGE_PUNCH.procoreObjectId,
    'Punch item — Door hardware finish at Suite 410',
    LINEAGE_PUNCH,
  ),
  objectLink(
    'link-w13c-daily-logs-001',
    'daily-logs',
    LINEAGE_DAILY_LOGS.procoreObjectId,
    'Daily log — 2026-04-28',
    LINEAGE_DAILY_LOGS,
  ),
  objectLink(
    'link-w13c-drawings-001',
    'drawings',
    LINEAGE_DRAWINGS.procoreObjectId,
    'Drawing A-101 (rev 3)',
    LINEAGE_DRAWINGS,
    'A-101-rev3',
  ),
  objectLink(
    'link-w13c-specifications-001',
    'specifications',
    LINEAGE_SPECIFICATIONS.procoreObjectId,
    'Specification 03-30-00 — Cast-in-place concrete',
    LINEAGE_SPECIFICATIONS,
    '03-30-00',
  ),
  objectLink(
    'link-w13c-photos-001',
    'photos',
    LINEAGE_PHOTOS.procoreObjectId,
    'Photo — Level 02 ceiling rough-in',
    LINEAGE_PHOTOS,
  ),
  objectLink(
    'link-w13c-inspections-001',
    'inspections',
    LINEAGE_INSPECTIONS.procoreObjectId,
    'Procore inspection — Underslab plumbing',
    LINEAGE_INSPECTIONS,
  ),
  objectLink(
    'link-w13c-documents-001',
    'documents',
    LINEAGE_DOCUMENTS.procoreObjectId,
    'Document — Project meeting minutes 2026-04-27',
    LINEAGE_DOCUMENTS,
  ),
  objectLink(
    'link-w13c-commitments-001',
    'commitments',
    LINEAGE_COMMITMENTS.procoreObjectId,
    'Commitment SC-03-001 — Concrete trade',
    LINEAGE_COMMITMENTS,
    'SC-03-001',
  ),
  objectLink(
    'link-w13c-change-events-001',
    'change-events',
    LINEAGE_CHANGE_EVENTS.procoreObjectId,
    'Change event #18 — Foundation ledge revision',
    LINEAGE_CHANGE_EVENTS,
  ),
  objectLink(
    'link-w13c-change-orders-001',
    'change-orders',
    LINEAGE_CHANGE_ORDERS.procoreObjectId,
    'PCO #02 — Mechanical revision pending pricing',
    LINEAGE_CHANGE_ORDERS,
  ),
  objectLink(
    'link-w13c-vendors-001',
    'vendors',
    LINEAGE_VENDORS.procoreObjectId,
    'Vendor — Acme Concrete Co.',
    LINEAGE_VENDORS,
  ),
  objectLink(
    'link-w13c-budget-001',
    'budget',
    LINEAGE_BUDGET.procoreObjectId,
    'Budget line 03-30-00 (reference / exposure only)',
    LINEAGE_BUDGET,
  ),
];

// ---------------------------------------------------------------------------
// Curated summaries — coverage across multiple subject areas.
// ---------------------------------------------------------------------------

export const SAMPLE_PROCORE_CURATED_SUMMARIES: readonly PccProcoreCuratedSummary[] = [
  {
    id: 'curated-w13c-rfis-overdue-summary',
    subjectArea: 'rfis',
    objectLinkId: 'link-w13c-rfis-001',
    summaryText: 'Open RFI awaiting response from design team for 12 days past due.',
    summarizedFields: ['number', 'subject', 'status', 'dueDate', 'ballInCourt'],
    sourceLineage: LINEAGE_RFIS,
    evaluatedAtUtc: '2026-04-29T08:00:00Z',
  },
  {
    id: 'curated-w13c-submittals-overdue-summary',
    subjectArea: 'submittals',
    objectLinkId: 'link-w13c-submittals-001',
    summaryText: 'Submittal review overdue at architect; 5 days past due.',
    summarizedFields: ['number', 'specSection', 'status', 'dueDate'],
    sourceLineage: LINEAGE_SUBMITTALS,
    evaluatedAtUtc: '2026-04-29T08:05:00Z',
  },
  {
    id: 'curated-w13c-commitments-mismatch-summary',
    subjectArea: 'commitments',
    objectLinkId: 'link-w13c-commitments-001',
    summaryText:
      'Commitment currentAmount (sourced from Procore) differs from PCC award amount by approximately 1.2 percent (reference / exposure only; not accounting truth).',
    summarizedFields: ['title', 'currentAmount', 'originalAmount', 'status'],
    sourceLineage: LINEAGE_COMMITMENTS,
    evaluatedAtUtc: '2026-04-29T08:10:00Z',
  },
  {
    id: 'curated-w13c-budget-variance-summary',
    subjectArea: 'budget',
    objectLinkId: 'link-w13c-budget-001',
    summaryText:
      'Budget exposure: cost-code 03-30-00 currentBudget exceeds originalBudget by 0.8 percent (reference / exposure only; not accounting truth).',
    summarizedFields: ['costCode', 'originalBudget', 'currentBudget'],
    sourceLineage: LINEAGE_BUDGET,
    evaluatedAtUtc: '2026-04-29T08:15:00Z',
  },
  {
    id: 'curated-w13c-drawings-currency-summary',
    subjectArea: 'drawings',
    objectLinkId: 'link-w13c-drawings-001',
    summaryText: 'Drawing A-101 latest revision is more than 30 days old; verify currency.',
    summarizedFields: ['number', 'revision', 'currentRevisionDate'],
    sourceLineage: LINEAGE_DRAWINGS,
    evaluatedAtUtc: '2026-04-29T08:20:00Z',
  },
];

// ---------------------------------------------------------------------------
// Derived signals — at least one per category family (11).
// ---------------------------------------------------------------------------

export const SAMPLE_PROCORE_DERIVED_SIGNALS: readonly PccProcoreDerivedSignal[] = [
  {
    id: 'signal-w13c-rfi-overdue-001',
    subjectArea: 'rfis',
    signalKind: 'open-rfi-overdue',
    category: 'priority-action',
    severity: 'attention',
    summary: 'RFI #102 is 12 days past its due date.',
    sourceLineage: LINEAGE_RFIS,
    evaluatedAtUtc: '2026-04-29T08:00:00Z',
    objectLinkId: 'link-w13c-rfis-001',
  },
  {
    id: 'signal-w13c-unmapped-project-001',
    subjectArea: 'projects',
    signalKind: 'unmapped-project',
    category: 'readiness-impact',
    severity: 'critical',
    summary:
      'PCC project lacks a confirmed Procore mapping; readiness gates dependent on Procore signals are inconclusive.',
    sourceLineage: LINEAGE_PROJECTS,
    evaluatedAtUtc: '2026-04-29T08:25:00Z',
  },
  {
    id: 'signal-w13c-inspection-failed-001',
    subjectArea: 'inspections',
    signalKind: 'inspection-failed',
    category: 'risk-exposure-signal',
    severity: 'critical',
    summary: 'Procore inspection — underslab plumbing reported failed result.',
    sourceLineage: LINEAGE_INSPECTIONS,
    evaluatedAtUtc: '2026-04-29T08:30:00Z',
    objectLinkId: 'link-w13c-inspections-001',
  },
  {
    id: 'signal-w13c-directory-mismatch-001',
    subjectArea: 'directories',
    signalKind: 'directory-mismatch',
    category: 'workflow-ball-in-court',
    severity: 'attention',
    summary:
      'Directory user present in Procore but absent from PCC team-access; PM ball-in-court for triage.',
    sourceLineage: LINEAGE_DIRECTORIES,
    evaluatedAtUtc: '2026-04-29T08:35:00Z',
    objectLinkId: 'link-w13c-directories-001',
  },
  {
    id: 'signal-w13c-photo-evidence-missing-001',
    subjectArea: 'photos',
    signalKind: 'photo-evidence-missing',
    category: 'evidence-link',
    severity: 'info',
    summary:
      'No Procore photo evidence linked to this readiness item; evidence-link surface should request operator capture.',
    sourceLineage: LINEAGE_PHOTOS,
    evaluatedAtUtc: '2026-04-29T08:40:00Z',
    objectLinkId: 'link-w13c-photos-001',
  },
  {
    id: 'signal-w13c-stale-drawing-001',
    subjectArea: 'drawings',
    signalKind: 'stale-drawing',
    category: 'document-currency-signal',
    severity: 'attention',
    summary: 'Drawing A-101 has not refreshed in more than 30 days.',
    sourceLineage: LINEAGE_DRAWINGS,
    evaluatedAtUtc: '2026-04-29T08:45:00Z',
    objectLinkId: 'link-w13c-drawings-001',
  },
  {
    id: 'signal-w13c-commitment-amount-mismatch-001',
    subjectArea: 'commitments',
    signalKind: 'commitment-amount-mismatch',
    category: 'financial-exposure-signal',
    severity: 'attention',
    summary:
      'Commitment currentAmount (sourced from Procore) differs from PCC award amount; surfaced as financial exposure (not accounting truth).',
    sourceLineage: LINEAGE_COMMITMENTS,
    evaluatedAtUtc: '2026-04-29T08:50:00Z',
    objectLinkId: 'link-w13c-commitments-001',
  },
  {
    id: 'signal-w13c-observation-open-001',
    subjectArea: 'observations',
    signalKind: 'observation-open',
    category: 'quality-safety-exception',
    severity: 'critical',
    summary: 'Open Procore safety observation — trip hazard at Level 02 stair.',
    sourceLineage: LINEAGE_OBSERVATIONS,
    evaluatedAtUtc: '2026-04-29T08:55:00Z',
    objectLinkId: 'link-w13c-observations-001',
  },
  {
    id: 'signal-w13c-missing-daily-log-001',
    subjectArea: 'daily-logs',
    signalKind: 'missing-daily-log',
    category: 'field-execution-gap',
    severity: 'attention',
    summary: 'No daily log recorded for the previous workday.',
    sourceLineage: LINEAGE_DAILY_LOGS,
    evaluatedAtUtc: '2026-04-29T09:00:00Z',
    objectLinkId: 'link-w13c-daily-logs-001',
  },
  {
    id: 'signal-w13c-vendor-performance-degraded-001',
    subjectArea: 'vendors',
    signalKind: 'vendor-performance-degraded',
    category: 'subcontractor-performance-signal',
    severity: 'attention',
    summary:
      'Subcontractor vendor performance band declined relative to prior reporting window (reference signal only).',
    sourceLineage: LINEAGE_VENDORS,
    evaluatedAtUtc: '2026-04-29T09:05:00Z',
    objectLinkId: 'link-w13c-vendors-001',
  },
  {
    id: 'signal-w13c-hbi-grounding-citation-001',
    subjectArea: 'rfis',
    signalKind: 'hbi-grounding-citation',
    category: 'hbi-grounding-citation',
    severity: 'info',
    summary:
      'HBI answer used Procore RFI #102 as a grounding citation (no question text retained here).',
    sourceLineage: LINEAGE_RFIS,
    evaluatedAtUtc: '2026-04-29T09:10:00Z',
    objectLinkId: 'link-w13c-rfis-001',
    hbiGroundingCitationId: 'hbi-grounding-w13c-rfi-102',
  },
];

// ---------------------------------------------------------------------------
// Sync-health entries — coverage across sync states + degraded source states.
// ---------------------------------------------------------------------------

export const SAMPLE_PROCORE_SYNC_HEALTH_ENTRIES: readonly PccProcoreSyncHealthEntry[] = [
  {
    subjectArea: 'projects',
    syncState: 'synced-fresh',
    sourceState: 'available',
    freshnessBand: 'fresh',
    lastIngestedAtUtc: '2026-05-02T15:00:00Z',
    openObjectCount: 1,
    derivedSignalCount: 1,
    errors: [],
  },
  {
    subjectArea: 'companies',
    syncState: 'synced-fresh',
    sourceState: 'available',
    freshnessBand: 'fresh',
    lastIngestedAtUtc: '2026-05-02T15:05:00Z',
    openObjectCount: 1,
    derivedSignalCount: 0,
    errors: [],
  },
  {
    subjectArea: 'directories',
    syncState: 'synced-stale',
    sourceState: 'stale',
    freshnessBand: 'stale',
    lastIngestedAtUtc: '2026-02-15T15:10:00Z',
    openObjectCount: 1,
    derivedSignalCount: 1,
    errors: [],
  },
  {
    subjectArea: 'rfis',
    syncState: 'synced-fresh',
    sourceState: 'available',
    freshnessBand: 'fresh',
    lastIngestedAtUtc: '2026-05-02T15:15:00Z',
    openObjectCount: 1,
    derivedSignalCount: 2,
    errors: [],
  },
  {
    subjectArea: 'submittals',
    syncState: 'synced-fresh',
    sourceState: 'available',
    freshnessBand: 'fresh',
    lastIngestedAtUtc: '2026-05-02T15:20:00Z',
    openObjectCount: 1,
    derivedSignalCount: 0,
    errors: [],
  },
  {
    subjectArea: 'observations',
    syncState: 'synced-fresh',
    sourceState: 'available',
    freshnessBand: 'fresh',
    lastIngestedAtUtc: '2026-05-02T15:25:00Z',
    openObjectCount: 1,
    derivedSignalCount: 1,
    errors: [],
  },
  {
    subjectArea: 'punch',
    syncState: 'sync-degraded',
    sourceState: 'rate-limited',
    freshnessBand: 'recent',
    lastIngestedAtUtc: '2026-04-12T15:30:00Z',
    openObjectCount: 1,
    derivedSignalCount: 0,
    errors: ['Provider returned partial result; retry scheduled.'],
  },
  {
    subjectArea: 'daily-logs',
    syncState: 'synced-fresh',
    sourceState: 'available',
    freshnessBand: 'fresh',
    lastIngestedAtUtc: '2026-05-02T15:35:00Z',
    openObjectCount: 1,
    derivedSignalCount: 1,
    errors: [],
  },
  {
    subjectArea: 'drawings',
    syncState: 'synced-stale',
    sourceState: 'stale',
    freshnessBand: 'stale',
    lastIngestedAtUtc: '2026-01-20T10:00:00Z',
    openObjectCount: 1,
    derivedSignalCount: 1,
    errors: [],
  },
  {
    subjectArea: 'specifications',
    syncState: 'synced-fresh',
    sourceState: 'available',
    freshnessBand: 'recent',
    lastIngestedAtUtc: '2026-04-12T15:00:00Z',
    openObjectCount: 1,
    derivedSignalCount: 0,
    errors: [],
  },
  {
    subjectArea: 'photos',
    syncState: 'synced-fresh',
    sourceState: 'available',
    freshnessBand: 'fresh',
    lastIngestedAtUtc: '2026-05-02T15:40:00Z',
    openObjectCount: 1,
    derivedSignalCount: 1,
    errors: [],
  },
  {
    subjectArea: 'inspections',
    syncState: 'synced-fresh',
    sourceState: 'available',
    freshnessBand: 'fresh',
    lastIngestedAtUtc: '2026-05-02T15:45:00Z',
    openObjectCount: 1,
    derivedSignalCount: 1,
    errors: [],
  },
  {
    subjectArea: 'documents',
    syncState: 'sync-disabled',
    sourceState: 'tool-disabled',
    freshnessBand: 'unknown',
    openObjectCount: 0,
    derivedSignalCount: 0,
    errors: [],
  },
  {
    subjectArea: 'commitments',
    syncState: 'synced-fresh',
    sourceState: 'available',
    freshnessBand: 'fresh',
    lastIngestedAtUtc: '2026-05-02T15:55:00Z',
    openObjectCount: 1,
    derivedSignalCount: 1,
    errors: [],
  },
  {
    subjectArea: 'change-events',
    syncState: 'sync-failed',
    sourceState: 'endpoint-deprecated',
    freshnessBand: 'unknown',
    openObjectCount: 0,
    derivedSignalCount: 0,
    errors: ['Endpoint returned deprecation notice; provider scheduled for upgrade.'],
  },
  {
    subjectArea: 'change-orders',
    syncState: 'sync-degraded',
    sourceState: 'permission-denied',
    freshnessBand: 'unknown',
    openObjectCount: 0,
    derivedSignalCount: 0,
    errors: ['Service principal lacks change-order read scope on this Procore tool.'],
  },
  {
    subjectArea: 'vendors',
    syncState: 'sync-degraded',
    sourceState: 'object-inaccessible',
    freshnessBand: 'unknown',
    openObjectCount: 0,
    derivedSignalCount: 1,
    errors: ['Vendor record archived in source tenant; access restricted.'],
  },
  {
    subjectArea: 'budget',
    syncState: 'never-synced',
    sourceState: 'mapping-missing',
    freshnessBand: 'unknown',
    openObjectCount: 0,
    derivedSignalCount: 0,
    errors: [],
  },
];

// ---------------------------------------------------------------------------
// Source posture and read-model envelope payload.
// ---------------------------------------------------------------------------

const MODULE_IDENTITY: PccProcoreDataLayerModuleIdentity = {
  moduleId: 'procore-sync-health',
  displayName: 'Procore Data Layer Sync Health',
  subtitle: 'Subject Areas, Object Links, Curated Summaries, and Derived Signals',
  governance: 'pcc-procore-data-layer-authority',
  mvpTier: 'MVP',
};

export const SAMPLE_PROCORE_DATA_LAYER_SOURCE_POSTURE: PccProcoreDataLayerSourcePosture = {
  sourceStatus: 'available',
  evaluatedAtUtc: '2026-05-04T12:00:00Z',
  pendingHumanReviewCount: 3,
};

export const SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL: PccProcoreSyncHealthReadModel = {
  moduleIdentity: MODULE_IDENTITY,
  subjectAreas: SAMPLE_PROCORE_SUBJECT_AREAS,
  syncHealthEntries: SAMPLE_PROCORE_SYNC_HEALTH_ENTRIES,
  sourceLineages: SAMPLE_PROCORE_SOURCE_LINEAGES,
  objectLinks: SAMPLE_PROCORE_OBJECT_LINKS,
  curatedSummaries: SAMPLE_PROCORE_CURATED_SUMMARIES,
  derivedSignals: SAMPLE_PROCORE_DERIVED_SIGNALS,
  ownershipNote:
    'PCC owns mapping and curation; Procore remains canonical for Procore-native records. No write-back. Budget and other financial subject areas are reference-only and not accounting truth.',
  sourcePosture: SAMPLE_PROCORE_DATA_LAYER_SOURCE_POSTURE,
};
