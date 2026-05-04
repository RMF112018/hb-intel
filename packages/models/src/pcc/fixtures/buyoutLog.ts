/**
 * PCC Buyout Log — deterministic sample fixtures.
 *
 * Phase 3 / Wave 13 / Prompt 02. Read-model only. No tenant URLs, no
 * secrets, no live UPNs, no non-deterministic identifiers, no runtime
 * Graph / PnP / SharePoint REST / Procore / Sage / AHJ / Document
 * Crunch / Adobe Sign / DocuSign calls. Evidence is reference-only.
 *
 * Eight named scenarios, each surfaced as a distinct BuyoutPackage with
 * stable IDs so tests can assert against them directly:
 *   - ready
 *   - blocked (subcontract not executed)
 *   - compliance-hold (SDI required and missing)
 *   - over-budget (Procore amount mismatch above tolerance)
 *   - missing-lineage (no sourceObjectId for Procore-sourced package)
 *   - missing-evidence (zero evidence-link refs even though lineage present)
 *   - missing-commitment (subcontract executed but no CommitmentLink)
 *   - unknown-degraded (sourcePosture: 'source-unavailable', confidence: 'low')
 *
 * @module pcc/fixtures/buyoutLog
 */

import {
  BUYOUT_EXCEPTION_CLASSIFICATION_BY_CODE,
  buyoutPriorityActionDedupeKey,
  type BuyoutAuditEvent,
  type BuyoutBudgetAllocation,
  type BuyoutCommitmentLink,
  type BuyoutComplianceRequirement,
  type BuyoutEvidenceLink,
  type BuyoutHbiEligibilityMarker,
  type BuyoutLogModuleIdentity,
  type BuyoutPackage,
  type BuyoutPriorityActionCandidate,
  type BuyoutProcurementMilestone,
  type BuyoutProjectMemoryContribution,
  type BuyoutReconciliationIssue,
  type BuyoutReferenceSeams,
  type BuyoutScopeLine,
  type BuyoutSnapshot,
  type BuyoutSourceLineage,
  type BuyoutSourcePosture,
  type BuyoutTraceabilityEdgeContribution,
  type IBuyoutWorkbookSourceRef,
  type PccBuyoutLogReadModel,
} from '../BuyoutLog.js';
import type { PccProjectId } from '../types.js';

const SAMPLE_PROJECT_ID = 'p-wave13-buyout-log-sample' as PccProjectId;
const WORKBOOK = 'HB_BuyoutLog_Template_2025';

function workbookRef(
  sheetSection: string,
  rowReference: string,
): IBuyoutWorkbookSourceRef {
  return { workbook: WORKBOOK, sheetSection, rowReference };
}

const REFERENCE_SEAMS_BASE: Pick<BuyoutReferenceSeams, 'projectReadinessSourceModuleRef'> = {
  projectReadinessSourceModuleRef: 'buyout-log',
};

// ---------------------------------------------------------------------------
// Scenario IDs — stable across the fixture set so tests can assert by id.
// ---------------------------------------------------------------------------

export const BUYOUT_LOG_SCENARIO_IDS = [
  'ready',
  'blocked',
  'compliance-hold',
  'over-budget',
  'missing-lineage',
  'missing-evidence',
  'missing-commitment',
  'unknown-degraded',
] as const;
export type BuyoutLogScenarioId = (typeof BUYOUT_LOG_SCENARIO_IDS)[number];

const PKG_IDS = {
  ready: 'pkg-w13-ready-001',
  blocked: 'pkg-w13-blocked-002',
  complianceHold: 'pkg-w13-compliance-hold-003',
  overBudget: 'pkg-w13-over-budget-004',
  missingLineage: 'pkg-w13-missing-lineage-005',
  missingEvidence: 'pkg-w13-missing-evidence-006',
  missingCommitment: 'pkg-w13-missing-commitment-007',
  unknownDegraded: 'pkg-w13-unknown-degraded-008',
} as const;

// ---------------------------------------------------------------------------
// Source lineage helpers per source system.
// ---------------------------------------------------------------------------

const PCC_LINEAGE: BuyoutSourceLineage = {
  sourceSystem: 'pcc',
  creationSource: 'manual-pcc',
};

const PROCORE_LINEAGE_OK: BuyoutSourceLineage = {
  sourceSystem: 'procore',
  creationSource: 'procore-budget-line',
  sourceObjectId: 'procore-budget-line-1001',
  importedAtUtc: '2026-04-12T15:00:00Z',
};

const PROCORE_LINEAGE_MISSING_OBJECT_ID: BuyoutSourceLineage = {
  sourceSystem: 'procore',
  creationSource: 'procore-budget-line',
};

const WORKBOOK_LINEAGE: BuyoutSourceLineage = {
  sourceSystem: 'workbook-template',
  creationSource: 'workbook-seed',
  workbookRef: workbookRef('Buyout Log Template', 'row 12'),
  importedAtUtc: '2026-04-08T13:00:00Z',
};

// ---------------------------------------------------------------------------
// Packages.
// ---------------------------------------------------------------------------

export const SAMPLE_BUYOUT_LOG_PACKAGES: readonly BuyoutPackage[] = [
  {
    id: PKG_IDS.ready,
    projectId: SAMPLE_PROJECT_ID,
    packageCode: 'BL-001',
    packageTitle: 'Concrete — Cast-in-Place',
    scopeDescription: 'Cast-in-place concrete superstructure including formwork and finishing.',
    csiDivision: '03',
    costCode: '03-30-00',
    status: 'procurement-tracking',
    ballInCourtPersonOrRoleRef: 'role-w11-procurement-lead',
    ballInCourtAssignedAtUtc: '2026-04-26T09:00:00Z',
    selectedVendorName: 'Acme Concrete Co.',
    procoreCompanyId: 'procore-company-acme-concrete',
    pccAwardAmount: 1_250_000,
    originalBudgetAmount: 1_300_000,
    originalBudgetSource: 'procore',
    currentBudgetAmount: 1_290_000,
    currentBudgetSource: 'procore',
    procoreCurrentCommitmentAmount: 1_250_000,
    loiSendTargetDate: '2026-04-01T00:00:00Z',
    loiExecutedDate: '2026-04-04T00:00:00Z',
    leadTimeDays: 45,
    sdiEnrollmentStatus: 'enrolled',
    bondRequirementStatus: 'received',
    sourceLineage: PROCORE_LINEAGE_OK,
    createdAtUtc: '2026-03-15T10:00:00Z',
    updatedAtUtc: '2026-04-30T17:00:00Z',
    documentControlEvidenceRefs: ['dc-source-buyout-loi-001', 'dc-source-buyout-subcontract-001'],
    lifecycleReadinessGateRef: 'gate-w9-procurement-readiness',
    responsibilityRoleRef: 'role-w11-procurement-lead',
    ...REFERENCE_SEAMS_BASE,
  },
  {
    id: PKG_IDS.blocked,
    projectId: SAMPLE_PROJECT_ID,
    packageCode: 'BL-002',
    packageTitle: 'Mechanical — HVAC',
    scopeDescription: 'Mechanical HVAC installation including ductwork and equipment.',
    csiDivision: '23',
    costCode: '23-00-00',
    status: 'blocked',
    blockReason: 'Subcontract drafted but not yet executed; vendor renegotiating terms.',
    ballInCourtPersonOrRoleRef: 'role-w11-project-manager',
    ballInCourtAssignedAtUtc: '2026-04-22T11:00:00Z',
    selectedVendorName: 'Northwind Mechanical Services',
    pccAwardAmount: 2_100_000,
    originalBudgetAmount: 2_050_000,
    originalBudgetSource: 'pcc',
    currentBudgetAmount: 2_050_000,
    currentBudgetSource: 'pcc',
    loiSendTargetDate: '2026-03-25T00:00:00Z',
    loiExecutedDate: '2026-03-29T00:00:00Z',
    leadTimeDays: 90,
    sdiEnrollmentStatus: 'enrolled',
    bondRequirementStatus: 'required',
    sourceLineage: PCC_LINEAGE,
    createdAtUtc: '2026-03-18T10:00:00Z',
    updatedAtUtc: '2026-04-29T14:00:00Z',
    documentControlEvidenceRefs: ['dc-source-buyout-loi-002'],
    priorityActionsCandidateRef: 'pa-candidate-buyout-blocked-mechanical',
    ...REFERENCE_SEAMS_BASE,
  },
  {
    id: PKG_IDS.complianceHold,
    projectId: SAMPLE_PROJECT_ID,
    packageCode: 'BL-003',
    packageTitle: 'Electrical — Service & Distribution',
    scopeDescription: 'Electrical service and distribution including panels and feeders.',
    csiDivision: '26',
    costCode: '26-00-00',
    status: 'compliance-pending',
    ballInCourtPersonOrRoleRef: 'role-w11-compliance-coordinator',
    ballInCourtAssignedAtUtc: '2026-04-20T08:00:00Z',
    selectedVendorName: 'Bright Spark Electric',
    procoreCompanyId: 'procore-company-bright-spark',
    pccAwardAmount: 1_750_000,
    originalBudgetAmount: 1_750_000,
    originalBudgetSource: 'procore',
    currentBudgetAmount: 1_750_000,
    currentBudgetSource: 'procore',
    procoreCurrentCommitmentAmount: 1_750_000,
    loiSendTargetDate: '2026-03-30T00:00:00Z',
    loiExecutedDate: '2026-04-02T00:00:00Z',
    leadTimeDays: 60,
    sdiEnrollmentStatus: 'required',
    bondRequirementStatus: 'received',
    sourceLineage: PROCORE_LINEAGE_OK,
    createdAtUtc: '2026-03-19T11:00:00Z',
    updatedAtUtc: '2026-04-30T17:00:00Z',
    documentControlEvidenceRefs: ['dc-source-buyout-loi-003', 'dc-source-buyout-subcontract-003'],
    priorityActionsCandidateRef: 'pa-candidate-sdi-missing-electrical',
    ...REFERENCE_SEAMS_BASE,
  },
  {
    id: PKG_IDS.overBudget,
    projectId: SAMPLE_PROJECT_ID,
    packageCode: 'BL-004',
    packageTitle: 'Masonry — Exterior Veneer',
    scopeDescription: 'Exterior masonry veneer including brick and stone facing.',
    csiDivision: '04',
    costCode: '04-20-00',
    status: 'procore-commitment-created',
    ballInCourtPersonOrRoleRef: 'role-w11-project-executive',
    ballInCourtAssignedAtUtc: '2026-04-25T13:00:00Z',
    selectedVendorName: 'Cornerstone Masonry',
    procoreCompanyId: 'procore-company-cornerstone',
    pccAwardAmount: 850_000,
    originalBudgetAmount: 800_000,
    originalBudgetSource: 'procore',
    currentBudgetAmount: 815_000,
    currentBudgetSource: 'procore',
    procoreCurrentCommitmentAmount: 880_000,
    loiSendTargetDate: '2026-03-22T00:00:00Z',
    loiExecutedDate: '2026-03-26T00:00:00Z',
    leadTimeDays: 30,
    sdiEnrollmentStatus: 'enrolled',
    bondRequirementStatus: 'not-required',
    sourceLineage: PROCORE_LINEAGE_OK,
    createdAtUtc: '2026-03-20T09:00:00Z',
    updatedAtUtc: '2026-04-30T17:00:00Z',
    documentControlEvidenceRefs: ['dc-source-buyout-loi-004', 'dc-source-buyout-subcontract-004'],
    priorityActionsCandidateRef: 'pa-candidate-procore-amount-mismatch-masonry',
    ...REFERENCE_SEAMS_BASE,
  },
  {
    id: PKG_IDS.missingLineage,
    projectId: SAMPLE_PROJECT_ID,
    packageCode: 'BL-005',
    packageTitle: 'Finishes — Flooring',
    scopeDescription: 'Flooring installation including resilient flooring and carpet.',
    csiDivision: '09',
    costCode: '09-60-00',
    status: 'leveling',
    ballInCourtPersonOrRoleRef: 'role-w11-procurement-lead',
    ballInCourtAssignedAtUtc: '2026-04-18T10:00:00Z',
    selectedVendorName: 'Foundation Flooring',
    pccAwardAmount: 425_000,
    originalBudgetAmount: 410_000,
    originalBudgetSource: 'pcc',
    currentBudgetAmount: 410_000,
    currentBudgetSource: 'pcc',
    leadTimeDays: 30,
    sdiEnrollmentStatus: 'not-required',
    bondRequirementStatus: 'not-required',
    sourceLineage: PROCORE_LINEAGE_MISSING_OBJECT_ID,
    createdAtUtc: '2026-03-22T10:00:00Z',
    updatedAtUtc: '2026-04-29T16:00:00Z',
    documentControlEvidenceRefs: ['dc-source-buyout-bid-package-005'],
    ...REFERENCE_SEAMS_BASE,
  },
  {
    id: PKG_IDS.missingEvidence,
    projectId: SAMPLE_PROJECT_ID,
    packageCode: 'BL-006',
    packageTitle: 'Sitework — Earthwork',
    scopeDescription: 'Earthwork including excavation, grading, and backfill.',
    csiDivision: '31',
    costCode: '31-20-00',
    status: 'contract-executed',
    ballInCourtPersonOrRoleRef: 'role-w11-superintendent',
    ballInCourtAssignedAtUtc: '2026-04-15T08:00:00Z',
    selectedVendorName: 'Granite Earthworks',
    pccAwardAmount: 580_000,
    originalBudgetAmount: 600_000,
    originalBudgetSource: 'pcc',
    currentBudgetAmount: 595_000,
    currentBudgetSource: 'pcc',
    loiSendTargetDate: '2026-03-15T00:00:00Z',
    loiExecutedDate: '2026-03-19T00:00:00Z',
    leadTimeDays: 14,
    sdiEnrollmentStatus: 'enrolled',
    bondRequirementStatus: 'received',
    sourceLineage: WORKBOOK_LINEAGE,
    createdAtUtc: '2026-03-10T09:00:00Z',
    updatedAtUtc: '2026-04-28T11:00:00Z',
    documentControlEvidenceRefs: [],
    priorityActionsCandidateRef: 'pa-candidate-missing-evidence-sitework',
    ...REFERENCE_SEAMS_BASE,
  },
  {
    id: PKG_IDS.missingCommitment,
    projectId: SAMPLE_PROJECT_ID,
    packageCode: 'BL-007',
    packageTitle: 'Openings — Doors and Hardware',
    scopeDescription: 'Door, frame, and hardware supply and installation.',
    csiDivision: '08',
    costCode: '08-10-00',
    status: 'contract-executed',
    ballInCourtPersonOrRoleRef: 'role-w11-procurement-lead',
    ballInCourtAssignedAtUtc: '2026-04-23T09:00:00Z',
    selectedVendorName: 'Atlas Door & Hardware',
    pccAwardAmount: 320_000,
    originalBudgetAmount: 310_000,
    originalBudgetSource: 'pcc',
    currentBudgetAmount: 315_000,
    currentBudgetSource: 'pcc',
    loiSendTargetDate: '2026-03-26T00:00:00Z',
    loiExecutedDate: '2026-03-30T00:00:00Z',
    leadTimeDays: 70,
    sdiEnrollmentStatus: 'enrolled',
    bondRequirementStatus: 'not-required',
    sourceLineage: PCC_LINEAGE,
    createdAtUtc: '2026-03-12T09:00:00Z',
    updatedAtUtc: '2026-04-30T15:00:00Z',
    documentControlEvidenceRefs: ['dc-source-buyout-loi-007', 'dc-source-buyout-subcontract-007'],
    priorityActionsCandidateRef: 'pa-candidate-procore-commitment-missing-openings',
    ...REFERENCE_SEAMS_BASE,
  },
  {
    id: PKG_IDS.unknownDegraded,
    projectId: SAMPLE_PROJECT_ID,
    packageCode: 'BL-008',
    packageTitle: 'Thermal & Moisture — Roofing',
    scopeDescription: 'Roofing system including membrane, insulation, and flashings.',
    csiDivision: '07',
    costCode: '07-50-00',
    status: 'scope-defined',
    ballInCourtPersonOrRoleRef: 'role-w11-procurement-lead',
    ballInCourtAssignedAtUtc: '2026-04-19T11:00:00Z',
    selectedVendorName: 'Summit Roofing',
    pccAwardAmount: 690_000,
    originalBudgetAmount: 700_000,
    originalBudgetSource: 'pcc',
    currentBudgetAmount: 700_000,
    currentBudgetSource: 'pcc',
    leadTimeDays: 50,
    sdiEnrollmentStatus: 'required',
    bondRequirementStatus: 'required',
    sourceLineage: PCC_LINEAGE,
    createdAtUtc: '2026-03-25T10:00:00Z',
    updatedAtUtc: '2026-04-29T17:00:00Z',
    documentControlEvidenceRefs: ['dc-source-buyout-bid-package-008'],
    ...REFERENCE_SEAMS_BASE,
  },
];

// ---------------------------------------------------------------------------
// Scope lines, budget allocations, commitment links, compliance, milestones,
// evidence, reconciliation, audit, candidates, memory, traceability, HBI.
// ---------------------------------------------------------------------------

export const SAMPLE_BUYOUT_LOG_SCOPE_LINES: readonly BuyoutScopeLine[] = [
  {
    id: 'scope-w13-001',
    buyoutPackageId: PKG_IDS.ready,
    csiDivision: '03',
    costCode: '03-30-00',
    description: 'Foundation walls and slab on grade.',
    quantity: 1,
    unit: 'lot',
    scopeStatus: 'covered',
    sourceLineage: PROCORE_LINEAGE_OK,
  },
  {
    id: 'scope-w13-002',
    buyoutPackageId: PKG_IDS.blocked,
    csiDivision: '23',
    costCode: '23-00-00',
    description: 'HVAC equipment and ductwork.',
    quantity: 1,
    unit: 'lot',
    scopeStatus: 'covered',
    sourceLineage: PCC_LINEAGE,
  },
];

export const SAMPLE_BUYOUT_LOG_BUDGET_ALLOCATIONS: readonly BuyoutBudgetAllocation[] = [
  {
    id: 'alloc-w13-001',
    buyoutPackageId: PKG_IDS.ready,
    sourceSystem: 'procore',
    sourceObjectId: 'procore-budget-line-1001',
    costCode: '03-30-00',
    costType: 'subcontract',
    budgetCode: 'B-03-30',
    allocationAmount: 1_250_000,
    allocationPercent: 100,
    allocationBasis: 'cost-code-percent',
    mappingConfidence: 'high',
    mappingStatus: 'linked',
  },
  {
    id: 'alloc-w13-002',
    buyoutPackageId: PKG_IDS.blocked,
    sourceSystem: 'pcc',
    sourceObjectId: 'pcc-allocation-mech-001',
    costCode: '23-00-00',
    costType: 'subcontract',
    budgetCode: 'B-23-00',
    allocationAmount: 2_100_000,
    allocationPercent: 100,
    allocationBasis: 'even-split',
    mappingConfidence: 'medium',
    mappingStatus: 'candidate',
  },
  {
    id: 'alloc-w13-003',
    buyoutPackageId: PKG_IDS.complianceHold,
    sourceSystem: 'procore',
    sourceObjectId: 'procore-budget-line-1003',
    costCode: '26-00-00',
    costType: 'subcontract',
    budgetCode: 'B-26-00',
    allocationAmount: 1_750_000,
    allocationPercent: 100,
    allocationBasis: 'cost-code-percent',
    mappingConfidence: 'high',
    mappingStatus: 'linked',
  },
  {
    id: 'alloc-w13-004',
    buyoutPackageId: PKG_IDS.overBudget,
    sourceSystem: 'procore',
    sourceObjectId: 'procore-budget-line-1004',
    costCode: '04-20-00',
    costType: 'subcontract',
    budgetCode: 'B-04-20',
    allocationAmount: 850_000,
    allocationPercent: 100,
    allocationBasis: 'cost-code-percent',
    mappingConfidence: 'high',
    mappingStatus: 'linked',
  },
  {
    id: 'alloc-w13-005',
    buyoutPackageId: PKG_IDS.missingLineage,
    sourceSystem: 'pcc',
    sourceObjectId: 'pcc-allocation-flooring-001',
    costCode: '09-60-00',
    costType: 'subcontract',
    budgetCode: 'B-09-60',
    allocationAmount: 425_000,
    allocationPercent: 100,
    allocationBasis: 'even-split',
    mappingConfidence: 'low',
    mappingStatus: 'unresolved',
  },
  {
    id: 'alloc-w13-006',
    buyoutPackageId: PKG_IDS.missingEvidence,
    sourceSystem: 'pcc',
    sourceObjectId: 'pcc-allocation-sitework-001',
    costCode: '31-20-00',
    costType: 'subcontract',
    budgetCode: 'B-31-20',
    allocationAmount: 580_000,
    allocationPercent: 100,
    allocationBasis: 'even-split',
    mappingConfidence: 'medium',
    mappingStatus: 'linked',
  },
  {
    id: 'alloc-w13-007',
    buyoutPackageId: PKG_IDS.missingCommitment,
    sourceSystem: 'pcc',
    sourceObjectId: 'pcc-allocation-openings-001',
    costCode: '08-10-00',
    costType: 'subcontract',
    budgetCode: 'B-08-10',
    allocationAmount: 320_000,
    allocationPercent: 100,
    allocationBasis: 'even-split',
    mappingConfidence: 'medium',
    mappingStatus: 'candidate',
  },
];

export const SAMPLE_BUYOUT_LOG_COMMITMENT_LINKS: readonly BuyoutCommitmentLink[] = [
  {
    id: 'link-w13-001',
    buyoutPackageId: PKG_IDS.ready,
    sourceSystem: 'procore',
    procoreCommitmentId: 'procore-commitment-cnc-001',
    procoreCommitmentNumber: 'CCM-2026-001',
    procoreCommitmentSovLineId: 'procore-sov-001',
    procoreCompanyId: 'procore-company-acme-concrete',
    procoreCurrentCommitmentAmount: 1_250_000,
    procoreOriginalCommitmentAmount: 1_250_000,
    sourceLineageId: 'lineage-procore-line-1001',
    reconciliationStatus: 'reconciled',
  },
  {
    id: 'link-w13-002',
    buyoutPackageId: PKG_IDS.complianceHold,
    sourceSystem: 'procore',
    procoreCommitmentId: 'procore-commitment-elec-003',
    procoreCommitmentNumber: 'CCM-2026-003',
    procoreCompanyId: 'procore-company-bright-spark',
    procoreCurrentCommitmentAmount: 1_750_000,
    procoreOriginalCommitmentAmount: 1_750_000,
    sourceLineageId: 'lineage-procore-line-1003',
    reconciliationStatus: 'reconciled',
  },
  {
    id: 'link-w13-003',
    buyoutPackageId: PKG_IDS.overBudget,
    sourceSystem: 'procore',
    procoreCommitmentId: 'procore-commitment-mas-004',
    procoreCommitmentNumber: 'CCM-2026-004',
    procoreCompanyId: 'procore-company-cornerstone',
    procoreCurrentCommitmentAmount: 880_000,
    procoreOriginalCommitmentAmount: 850_000,
    sourceLineageId: 'lineage-procore-line-1004',
    reconciliationStatus: 'variance-exception',
  },
];

export const SAMPLE_BUYOUT_LOG_COMPLIANCE_REQUIREMENTS: readonly BuyoutComplianceRequirement[] = [
  {
    id: 'comp-w13-001',
    buyoutPackageId: PKG_IDS.ready,
    requirementType: 'sdi',
    required: true,
    status: 'satisfied',
    receivedDate: '2026-04-05T00:00:00Z',
    waiverRequired: false,
    evidenceLinkIds: ['evidence-w13-sdi-ready'],
    sourceSystem: 'pcc',
    sourceLineageId: 'lineage-pcc-comp-001',
  },
  {
    id: 'comp-w13-002',
    buyoutPackageId: PKG_IDS.complianceHold,
    requirementType: 'sdi',
    required: true,
    status: 'pending',
    waiverRequired: false,
    evidenceLinkIds: [],
    sourceSystem: 'pcc',
    sourceLineageId: 'lineage-pcc-comp-002',
  },
  {
    id: 'comp-w13-003',
    buyoutPackageId: PKG_IDS.complianceHold,
    requirementType: 'bond',
    required: true,
    status: 'satisfied',
    receivedDate: '2026-04-10T00:00:00Z',
    waiverRequired: false,
    evidenceLinkIds: ['evidence-w13-bond-compliance-hold'],
    sourceSystem: 'pcc',
    sourceLineageId: 'lineage-pcc-comp-003',
  },
  {
    id: 'comp-w13-004',
    buyoutPackageId: PKG_IDS.overBudget,
    requirementType: 'bond',
    required: true,
    status: 'waived',
    waiverRequired: true,
    waiverReason: 'Vendor waived bond per executive agreement; alternative SDI coverage in place.',
    waiverApprovedBy: 'role-w11-project-executive',
    waiverApprovedAtUtc: '2026-04-22T15:00:00Z',
    evidenceLinkIds: ['evidence-w13-bond-waiver-over-budget'],
    sourceSystem: 'pcc',
    sourceLineageId: 'lineage-pcc-comp-004',
  },
];

export const SAMPLE_BUYOUT_LOG_PROCUREMENT_MILESTONES: readonly BuyoutProcurementMilestone[] = [
  {
    id: 'milestone-w13-001',
    buyoutPackageId: PKG_IDS.ready,
    milestoneType: 'lead-time',
    requiredDate: '2026-05-15T00:00:00Z',
    forecastDate: '2026-05-15T00:00:00Z',
    status: 'on-track',
    sourceSystem: 'pcc',
    sourceLineageId: 'lineage-pcc-milestone-001',
    riskLevel: 'green',
  },
  {
    id: 'milestone-w13-002',
    buyoutPackageId: PKG_IDS.unknownDegraded,
    milestoneType: 'lead-time',
    requiredDate: '2026-06-01T00:00:00Z',
    forecastDate: '2026-06-15T00:00:00Z',
    status: 'at-risk',
    sourceSystem: 'pcc',
    sourceLineageId: 'lineage-pcc-milestone-002',
    riskLevel: 'critical',
    notes: 'Long-lead with negative procurement float; awaiting vendor confirmation.',
  },
];

export const SAMPLE_BUYOUT_LOG_EVIDENCE_LINKS: readonly BuyoutEvidenceLink[] = [
  {
    id: 'evidence-w13-loi-ready',
    buyoutPackageId: PKG_IDS.ready,
    label: 'LOI executed — Concrete',
    classification: 'loi',
    sharepointReferenceId: 'dc-source-buyout-loi-001',
    addedAtUtc: '2026-04-04T10:00:00Z',
    addedByPersonRef: 'role-w11-procurement-lead',
  },
  {
    id: 'evidence-w13-subcontract-ready',
    buyoutPackageId: PKG_IDS.ready,
    label: 'Subcontract executed — Concrete',
    classification: 'subcontract',
    sharepointReferenceId: 'dc-source-buyout-subcontract-001',
    addedAtUtc: '2026-04-12T11:00:00Z',
    addedByPersonRef: 'role-w11-procurement-lead',
  },
  {
    id: 'evidence-w13-sdi-ready',
    buyoutPackageId: PKG_IDS.ready,
    label: 'SDI enrollment — Concrete',
    classification: 'sdi',
    sharepointReferenceId: 'dc-source-buyout-sdi-001',
    addedAtUtc: '2026-04-05T11:00:00Z',
    addedByPersonRef: 'role-w11-compliance-coordinator',
  },
  {
    id: 'evidence-w13-loi-blocked',
    buyoutPackageId: PKG_IDS.blocked,
    label: 'LOI executed — Mechanical',
    classification: 'loi',
    sharepointReferenceId: 'dc-source-buyout-loi-002',
    addedAtUtc: '2026-03-29T11:00:00Z',
    addedByPersonRef: 'role-w11-project-manager',
  },
  {
    id: 'evidence-w13-loi-compliance-hold',
    buyoutPackageId: PKG_IDS.complianceHold,
    label: 'LOI executed — Electrical',
    classification: 'loi',
    sharepointReferenceId: 'dc-source-buyout-loi-003',
    addedAtUtc: '2026-04-02T11:00:00Z',
    addedByPersonRef: 'role-w11-procurement-lead',
  },
  {
    id: 'evidence-w13-subcontract-compliance-hold',
    buyoutPackageId: PKG_IDS.complianceHold,
    label: 'Subcontract executed — Electrical',
    classification: 'subcontract',
    sharepointReferenceId: 'dc-source-buyout-subcontract-003',
    addedAtUtc: '2026-04-15T11:00:00Z',
    addedByPersonRef: 'role-w11-procurement-lead',
  },
  {
    id: 'evidence-w13-bond-compliance-hold',
    buyoutPackageId: PKG_IDS.complianceHold,
    label: 'Bond received — Electrical',
    classification: 'bond',
    sharepointReferenceId: 'dc-source-buyout-bond-003',
    addedAtUtc: '2026-04-10T11:00:00Z',
    addedByPersonRef: 'role-w11-compliance-coordinator',
  },
  {
    id: 'evidence-w13-loi-over-budget',
    buyoutPackageId: PKG_IDS.overBudget,
    label: 'LOI executed — Masonry',
    classification: 'loi',
    sharepointReferenceId: 'dc-source-buyout-loi-004',
    addedAtUtc: '2026-03-26T11:00:00Z',
    addedByPersonRef: 'role-w11-procurement-lead',
  },
  {
    id: 'evidence-w13-subcontract-over-budget',
    buyoutPackageId: PKG_IDS.overBudget,
    label: 'Subcontract executed — Masonry',
    classification: 'subcontract',
    sharepointReferenceId: 'dc-source-buyout-subcontract-004',
    addedAtUtc: '2026-04-15T11:00:00Z',
    addedByPersonRef: 'role-w11-procurement-lead',
  },
  {
    id: 'evidence-w13-bond-waiver-over-budget',
    buyoutPackageId: PKG_IDS.overBudget,
    label: 'Bond waiver — Masonry',
    classification: 'general',
    sharepointReferenceId: 'dc-source-buyout-bond-waiver-004',
    addedAtUtc: '2026-04-22T15:00:00Z',
    addedByPersonRef: 'role-w11-project-executive',
  },
  {
    id: 'evidence-w13-loi-missing-commitment',
    buyoutPackageId: PKG_IDS.missingCommitment,
    label: 'LOI executed — Openings',
    classification: 'loi',
    sharepointReferenceId: 'dc-source-buyout-loi-007',
    addedAtUtc: '2026-03-30T11:00:00Z',
    addedByPersonRef: 'role-w11-procurement-lead',
  },
  {
    id: 'evidence-w13-subcontract-missing-commitment',
    buyoutPackageId: PKG_IDS.missingCommitment,
    label: 'Subcontract executed — Openings',
    classification: 'subcontract',
    sharepointReferenceId: 'dc-source-buyout-subcontract-007',
    addedAtUtc: '2026-04-15T11:00:00Z',
    addedByPersonRef: 'role-w11-procurement-lead',
  },
  // missing-evidence package (PKG_IDS.missingEvidence) intentionally has no evidence-link entries.
  // missing-lineage package's bid-package evidence is referenced via documentControlEvidenceRefs
  // but no full BuyoutEvidenceLink record is materialized — the package surfaces lineage gaps,
  // not evidence gaps.
];

export const SAMPLE_BUYOUT_LOG_RECONCILIATION_ISSUES: readonly BuyoutReconciliationIssue[] = [
  {
    id: 'recon-w13-001',
    buyoutPackageId: PKG_IDS.overBudget,
    kind: 'amount-mismatch',
    detail:
      'Procore commitment amount (880,000) exceeds PCC award amount (850,000) above tolerance.',
    openedAtUtc: '2026-04-25T13:00:00Z',
  },
];

function dedupe(
  buyoutPackageId: string,
  reasonCode: Parameters<typeof buyoutPriorityActionDedupeKey>[2],
): string {
  return buyoutPriorityActionDedupeKey(SAMPLE_PROJECT_ID, buyoutPackageId, reasonCode);
}

export const SAMPLE_BUYOUT_LOG_PRIORITY_ACTION_CANDIDATES: readonly BuyoutPriorityActionCandidate[] = [
  {
    id: 'pac-w13-001',
    buyoutPackageId: PKG_IDS.blocked,
    reasonCode: 'SUBCONTRACT_NOT_EXECUTED',
    classification: BUYOUT_EXCEPTION_CLASSIFICATION_BY_CODE.SUBCONTRACT_NOT_EXECUTED,
    severity: 'critical',
    generatedAtUtc: '2026-04-29T14:00:00Z',
    dedupeKey: dedupe(PKG_IDS.blocked, 'SUBCONTRACT_NOT_EXECUTED'),
  },
  {
    id: 'pac-w13-002',
    buyoutPackageId: PKG_IDS.complianceHold,
    reasonCode: 'SDI_MISSING',
    classification: BUYOUT_EXCEPTION_CLASSIFICATION_BY_CODE.SDI_MISSING,
    severity: 'attention',
    generatedAtUtc: '2026-04-30T17:00:00Z',
    dedupeKey: dedupe(PKG_IDS.complianceHold, 'SDI_MISSING'),
  },
  {
    id: 'pac-w13-003',
    buyoutPackageId: PKG_IDS.overBudget,
    reasonCode: 'PROCORE_AMOUNT_MISMATCH',
    classification: BUYOUT_EXCEPTION_CLASSIFICATION_BY_CODE.PROCORE_AMOUNT_MISMATCH,
    severity: 'critical',
    generatedAtUtc: '2026-04-25T13:00:00Z',
    dedupeKey: dedupe(PKG_IDS.overBudget, 'PROCORE_AMOUNT_MISMATCH'),
  },
  {
    id: 'pac-w13-004',
    buyoutPackageId: PKG_IDS.missingEvidence,
    reasonCode: 'MISSING_EVIDENCE',
    classification: BUYOUT_EXCEPTION_CLASSIFICATION_BY_CODE.MISSING_EVIDENCE,
    severity: 'critical',
    generatedAtUtc: '2026-04-28T11:00:00Z',
    dedupeKey: dedupe(PKG_IDS.missingEvidence, 'MISSING_EVIDENCE'),
  },
  {
    id: 'pac-w13-005',
    buyoutPackageId: PKG_IDS.missingCommitment,
    reasonCode: 'PROCORE_COMMITMENT_MISSING',
    classification: BUYOUT_EXCEPTION_CLASSIFICATION_BY_CODE.PROCORE_COMMITMENT_MISSING,
    severity: 'critical',
    generatedAtUtc: '2026-04-30T15:00:00Z',
    dedupeKey: dedupe(PKG_IDS.missingCommitment, 'PROCORE_COMMITMENT_MISSING'),
  },
  {
    id: 'pac-w13-006',
    buyoutPackageId: PKG_IDS.unknownDegraded,
    reasonCode: 'LONG_LEAD_RISK',
    classification: BUYOUT_EXCEPTION_CLASSIFICATION_BY_CODE.LONG_LEAD_RISK,
    severity: 'critical',
    generatedAtUtc: '2026-04-29T17:00:00Z',
    dedupeKey: dedupe(PKG_IDS.unknownDegraded, 'LONG_LEAD_RISK'),
  },
];

export const SAMPLE_BUYOUT_LOG_AUDIT_EVENTS: readonly BuyoutAuditEvent[] = [
  {
    eventId: 'evt-w13-001',
    eventType: 'package-recorded',
    occurredAtUtc: '2026-03-15T10:05:00Z',
    entityRef: PKG_IDS.ready,
    summary: 'Concrete buyout package recorded with Procore budget lineage.',
  },
  {
    eventId: 'evt-w13-002',
    eventType: 'state-transitioned',
    occurredAtUtc: '2026-04-26T09:30:00Z',
    entityRef: PKG_IDS.ready,
    summary: 'Concrete package transitioned to procurement-tracking after compliance verified.',
  },
  {
    eventId: 'evt-w13-003',
    eventType: 'exception-recorded',
    occurredAtUtc: '2026-04-25T13:30:00Z',
    entityRef: PKG_IDS.overBudget,
    summary: 'Procore amount mismatch recorded for masonry package.',
  },
  {
    eventId: 'evt-w13-004',
    eventType: 'waiver-recorded',
    occurredAtUtc: '2026-04-22T15:30:00Z',
    entityRef: PKG_IDS.overBudget,
    summary: 'Bond waiver recorded with executive approval for masonry package.',
  },
  {
    eventId: 'evt-w13-005',
    eventType: 'snapshot-generated',
    occurredAtUtc: '2026-05-01T18:30:00Z',
    entityRef: 'snapshot-w13-2026-05-01',
    summary: 'Wave 13 sample snapshot generated.',
  },
];

export const SAMPLE_BUYOUT_LOG_PROJECT_MEMORY_CONTRIBUTIONS: readonly BuyoutProjectMemoryContribution[] = [
  {
    id: 'memory-w13-001',
    buyoutPackageId: PKG_IDS.overBudget,
    kind: 'waiver-rationale',
    narrative:
      'Bond waived in lieu of expanded SDI coverage for masonry vendor; documented vendor history with HB.',
    recordedAtUtc: '2026-04-22T15:35:00Z',
    recordedByPersonRef: 'role-w11-project-executive',
    sourceLineageId: 'lineage-pcc-comp-004',
  },
  {
    id: 'memory-w13-002',
    buyoutPackageId: PKG_IDS.ready,
    kind: 'vendor-selection-rationale',
    narrative:
      'Acme selected based on prior project performance and tightest schedule alignment.',
    recordedAtUtc: '2026-04-05T11:15:00Z',
    recordedByPersonRef: 'role-w11-procurement-lead',
    sourceLineageId: 'lineage-procore-line-1001',
  },
];

export const SAMPLE_BUYOUT_LOG_TRACEABILITY_EDGE_CONTRIBUTIONS: readonly BuyoutTraceabilityEdgeContribution[] = [
  {
    id: 'trace-w13-001',
    buyoutPackageId: PKG_IDS.ready,
    fromRef: 'cost-code:03-30-00',
    toRef: PKG_IDS.ready,
    edgeKind: 'cost-code-to-package',
  },
  {
    id: 'trace-w13-002',
    buyoutPackageId: PKG_IDS.ready,
    fromRef: PKG_IDS.ready,
    toRef: 'procore-commitment-cnc-001',
    edgeKind: 'package-to-commitment',
  },
  {
    id: 'trace-w13-003',
    buyoutPackageId: PKG_IDS.ready,
    fromRef: 'procore-commitment-cnc-001',
    toRef: 'dc-source-buyout-subcontract-001',
    edgeKind: 'commitment-to-evidence',
  },
  {
    id: 'trace-w13-004',
    buyoutPackageId: PKG_IDS.ready,
    fromRef: 'dc-source-buyout-subcontract-001',
    toRef: 'gate-w9-procurement-readiness',
    edgeKind: 'evidence-to-readiness-gate',
  },
];

export const SAMPLE_BUYOUT_LOG_HBI_ELIGIBILITY_MARKERS: readonly BuyoutHbiEligibilityMarker[] = [
  {
    id: 'hbi-w13-ready',
    buyoutPackageId: PKG_IDS.ready,
    eligible: true,
    refusalReasons: [],
  },
  {
    id: 'hbi-w13-missing-evidence',
    buyoutPackageId: PKG_IDS.missingEvidence,
    eligible: false,
    refusalReasons: ['missing-evidence-link'],
  },
  {
    id: 'hbi-w13-missing-lineage',
    buyoutPackageId: PKG_IDS.missingLineage,
    eligible: false,
    refusalReasons: ['missing-source-lineage'],
  },
];

export const SAMPLE_BUYOUT_LOG_SOURCE_POSTURE: BuyoutSourcePosture = {
  sourceStatus: 'available',
  confidence: 'high',
  lastIngestedAtUtc: '2026-05-01T18:30:00Z',
  pendingHumanReviewCount: 2,
};

export const SAMPLE_BUYOUT_LOG_SNAPSHOT_HISTORY: readonly BuyoutSnapshot[] = [
  {
    snapshotId: 'snapshot-w13-2026-05-01',
    generatedAtUtc: '2026-05-01T18:30:00Z',
    projectId: SAMPLE_PROJECT_ID,
    readOnly: true,
    summary:
      'Wave 13 sample snapshot: 8 packages across ready, blocked, compliance-hold, over-budget, missing-lineage, missing-evidence, missing-commitment, and unknown-degraded scenarios.',
    packageCount: 8,
    completionGateBreakdown: {
      'not-ready': 4,
      'ready-for-award': 1,
      'ready-with-exceptions': 0,
      blocked: 3,
      complete: 0,
    },
  },
];

const SAMPLE_MODULE_IDENTITY: BuyoutLogModuleIdentity = {
  moduleId: 'buyout-log',
  displayName: 'Buyout Log',
  subtitle: 'Buyout Control Center',
  governance: 'project-readiness',
  workCenterId: 'procurement-and-buyout',
  mvpTier: 'MVP',
  futureAffinityWorkCenter: 'procurement-and-buyout-center',
};

// Sanity check at module-load time: scenario id list must match package count and codes.
{
  const packageScenarios = SAMPLE_BUYOUT_LOG_PACKAGES.map((p) => p.packageCode);
  if (packageScenarios.length !== BUYOUT_LOG_SCENARIO_IDS.length) {
    throw new Error(
      'SAMPLE_BUYOUT_LOG_PACKAGES count does not match BUYOUT_LOG_SCENARIO_IDS count',
    );
  }
}

export const SAMPLE_BUYOUT_LOG_READ_MODEL: PccBuyoutLogReadModel = {
  moduleIdentity: SAMPLE_MODULE_IDENTITY,
  packages: SAMPLE_BUYOUT_LOG_PACKAGES,
  scopeLines: SAMPLE_BUYOUT_LOG_SCOPE_LINES,
  budgetAllocations: SAMPLE_BUYOUT_LOG_BUDGET_ALLOCATIONS,
  commitmentLinks: SAMPLE_BUYOUT_LOG_COMMITMENT_LINKS,
  complianceRequirements: SAMPLE_BUYOUT_LOG_COMPLIANCE_REQUIREMENTS,
  procurementMilestones: SAMPLE_BUYOUT_LOG_PROCUREMENT_MILESTONES,
  evidenceLinks: SAMPLE_BUYOUT_LOG_EVIDENCE_LINKS,
  reconciliationIssues: SAMPLE_BUYOUT_LOG_RECONCILIATION_ISSUES,
  priorityActionCandidates: SAMPLE_BUYOUT_LOG_PRIORITY_ACTION_CANDIDATES,
  auditEvents: SAMPLE_BUYOUT_LOG_AUDIT_EVENTS,
  projectMemoryContributions: SAMPLE_BUYOUT_LOG_PROJECT_MEMORY_CONTRIBUTIONS,
  traceabilityEdgeContributions: SAMPLE_BUYOUT_LOG_TRACEABILITY_EDGE_CONTRIBUTIONS,
  hbiEligibilityMarkers: SAMPLE_BUYOUT_LOG_HBI_ELIGIBILITY_MARKERS,
  sourcePosture: SAMPLE_BUYOUT_LOG_SOURCE_POSTURE,
  snapshotHistory: SAMPLE_BUYOUT_LOG_SNAPSHOT_HISTORY,
};
