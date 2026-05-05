import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  EMPTY_APPROVALS_READ_MODEL,
  EXTERNAL_SYSTEM_DEGRADED_STATE_MATRIX,
  PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE,
  SAMPLE_APPROVALS_READ_MODEL,
  SAMPLE_BUYOUT_LOG_READ_MODEL,
  SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL,
  SAMPLE_CONSTRAINTS_LOG_READ_MODEL,
  SAMPLE_PCC_EXTERNAL_OBJECT_REFERENCES_READ_MODEL,
  SAMPLE_PCC_EXTERNAL_REVIEW_ITEMS_READ_MODEL,
  SAMPLE_PCC_EXTERNAL_SYSTEM_AUDIT_EVENTS_READ_MODEL,
  SAMPLE_PCC_EXTERNAL_SYSTEM_HEALTH_SNAPSHOTS_READ_MODEL,
  SAMPLE_PCC_EXTERNAL_SYSTEM_REGISTRY_READ_MODEL,
  SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_BACKEND_UNAVAILABLE,
  SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT,
  SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_UNKNOWN_PROJECT,
  SAMPLE_PCC_HBI_SOURCE_LINEAGE_READ_MODEL,
  SAMPLE_PCC_PROJECT_EXTERNAL_LAUNCH_LINKS_READ_MODEL,
  SAMPLE_PCC_PROJECT_EXTERNAL_SYSTEM_MAPPINGS_READ_MODEL,
  SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL,
  SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL,
  SAMPLE_PROJECT_LENSES_READ_MODEL,
  SAMPLE_PROJECT_MEMORY_READ_MODEL,
  SAMPLE_PROJECT_PROFILES,
  SAMPLE_PROJECT_TRACEABILITY_READ_MODEL,
  SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
  SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
  SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
  SAMPLE_WARRANTY_TRACE_READ_MODEL,
  type PccProjectId,
} from '@hbc/models/pcc';
import { PccMockReadModelProvider } from './pcc-mock-read-model-provider.js';

const KNOWN_PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILES[0].projectId;
const UNKNOWN_PROJECT_ID: PccProjectId =
  'project-unknown-permit-inspection-fixture-001' as PccProjectId;
const UNKNOWN_RESPONSIBILITY_MATRIX_PROJECT_ID: PccProjectId =
  'project-unknown-responsibility-matrix-001' as PccProjectId;
const UNKNOWN_CONSTRAINTS_LOG_PROJECT_ID: PccProjectId =
  'project-unknown-constraints-log-001' as PccProjectId;
const UNKNOWN_BUYOUT_LOG_PROJECT_ID: PccProjectId =
  'project-unknown-buyout-log-001' as PccProjectId;
const UNKNOWN_PROCORE_PROJECT_MAPPING_PROJECT_ID: PccProjectId =
  'project-unknown-procore-project-mapping-001' as PccProjectId;
const UNKNOWN_PROCORE_SYNC_HEALTH_PROJECT_ID: PccProjectId =
  'project-unknown-procore-sync-health-001' as PccProjectId;
const UNKNOWN_UNIFIED_LIFECYCLE_PROJECT_ID: PccProjectId =
  'project-unknown-unified-lifecycle-001' as PccProjectId;

const PROVIDER_SOURCE_FILE = fileURLToPath(
  new URL('./pcc-mock-read-model-provider.ts', import.meta.url),
);

function stripCommentsAndStrings(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, ' ')
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, ' ')
    .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, ' ');
}

describe('PccMockReadModelProvider.getPermitInspectionControlCenter — known project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns a read-only mock envelope with available status and the deterministic fixture', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.warnings).toHaveLength(0);
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);
    expect(envelope.data).toBe(PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE);
  });

  it('preserves the canonical fixture content (permits, inspections, AHJ launcher posture)', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(KNOWN_PROJECT_ID);
    const data = envelope.data;

    expect(data.permits.length).toBeGreaterThan(0);
    expect(data.inspections.length).toBeGreaterThan(0);
    expect(data.ahjProfiles.length).toBeGreaterThan(0);
    for (const ahj of data.ahjProfiles) {
      expect(ahj.launcherOnly).toBe(true);
    }
    expect(data.summary.permitCount).toBe(data.permits.length);
    expect(data.summary.inspectionCount).toBe(data.inspections.length);
  });

  it('echoes optional viewerPersona on the envelope when provided', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(
      KNOWN_PROJECT_ID,
      'project-manager',
    );
    expect(envelope.viewerPersona).toBe('project-manager');
  });
});

describe('PccMockReadModelProvider.getPermitInspectionControlCenter — unknown project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the empty Permit & Inspection Control Center read model with source-unavailable status', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(UNKNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('source-unavailable');
    expect(envelope.projectId).toBe(UNKNOWN_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    const warning = envelope.warnings[0];
    expect(warning.code).toBe('source-unavailable');
    expect(warning.message).toContain(UNKNOWN_PROJECT_ID);
    expect(warning.source).toBe('pcc-mock-fixtures');
  });

  it('returns empty arrays and zeroed summary counts for unknown projects', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(UNKNOWN_PROJECT_ID);
    const data = envelope.data;

    expect(data.permits).toEqual([]);
    expect(data.inspections).toEqual([]);
    expect(data.reinspectionLineages).toEqual([]);
    expect(data.ahjProfiles).toEqual([]);
    expect(data.feeExposure).toEqual([]);
    expect(data.priorityActionSignals).toEqual([]);
    expect(data.readinessSignals).toEqual([]);
    expect(data.approvalSignals).toEqual([]);
    expect(data.permitTransitions).toEqual([]);
    expect(data.inspectionTransitions).toEqual([]);

    expect(data.summary.permitCount).toBe(0);
    expect(data.summary.expiringCount).toBe(0);
    expect(data.summary.expiredCount).toBe(0);
    expect(data.summary.pendingRevisionCount).toBe(0);
    expect(data.summary.inspectionCount).toBe(0);
    expect(data.summary.failedInspectionCount).toBe(0);
    expect(data.summary.openReinspectionCount).toBe(0);
    expect(data.summary.openFeeExposureCount).toBe(0);
    expect(data.summary.evidenceMissingCount).toBe(0);
    expect(data.summary.ahjLauncherCount).toBe(0);
  });
});

describe('PccMockReadModelProvider.getPermitInspectionControlCenter — backend-unavailable simulation', () => {
  const provider = new PccMockReadModelProvider({ simulateBackendUnavailable: true });

  it('returns the empty read model with backend-unavailable status and warning', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('backend-unavailable');
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    expect(envelope.warnings[0].code).toBe('backend-unavailable');
    expect(envelope.warnings[0].message).toBe(
      'Mock provider configured to simulate backend-unavailable.',
    );

    expect(envelope.data.permits).toEqual([]);
    expect(envelope.data.inspections).toEqual([]);
    expect(envelope.data.summary.permitCount).toBe(0);
    expect(envelope.data.summary.ahjLauncherCount).toBe(0);
  });

  it('produces the same empty body shape as the unknown-project branch', async () => {
    const unavailable = await provider.getPermitInspectionControlCenter(KNOWN_PROJECT_ID);
    const unknown = await new PccMockReadModelProvider().getPermitInspectionControlCenter(
      UNKNOWN_PROJECT_ID,
    );
    expect(unavailable.data).toEqual(unknown.data);
  });
});

describe('PccMockReadModelProvider.getResponsibilityMatrix — known project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns a read-only mock envelope with available status and the deterministic fixture', async () => {
    const envelope = await provider.getResponsibilityMatrix(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.warnings).toHaveLength(0);
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);
    expect(envelope.data).toBe(SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL);
  });

  it('preserves the canonical 109 / 82 / 27 / 98 / 47 / 0 workbook posture', async () => {
    const envelope = await provider.getResponsibilityMatrix(KNOWN_PROJECT_ID);
    const data = envelope.data;

    expect(data.templates.length).toBe(4);
    expect(data.projectInstances.length).toBe(5);
    expect(data.snapshotHistory.length).toBe(1);
    expect(data.auditEvents.length).toBe(4);
    expect(data.workbookSourceSummary.defaultItemsTotal).toBe(109);
    expect(data.workbookSourceSummary.pmItems).toBe(82);
    expect(data.workbookSourceSummary.fieldItems).toBe(27);
    expect(data.workbookSourceSummary.strictMarkedRows).toBe(98);
    expect(data.workbookSourceSummary.ambiguousItemsTotal).toBe(47);
    expect(data.workbookSourceSummary.ownerContractActiveDefaultObligations).toBe(0);
    expect(data.sourcePosture.sourceStatus).toBe('available');
  });

  it('echoes optional viewerPersona on the envelope when provided', async () => {
    const envelope = await provider.getResponsibilityMatrix(KNOWN_PROJECT_ID, 'project-manager');
    expect(envelope.viewerPersona).toBe('project-manager');
  });
});

describe('PccMockReadModelProvider.getResponsibilityMatrix — unknown project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the empty Responsibility Matrix read model with source-unavailable status', async () => {
    const envelope = await provider.getResponsibilityMatrix(
      UNKNOWN_RESPONSIBILITY_MATRIX_PROJECT_ID,
    );

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('source-unavailable');
    expect(envelope.projectId).toBe(UNKNOWN_RESPONSIBILITY_MATRIX_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    const warning = envelope.warnings[0];
    expect(warning.code).toBe('source-unavailable');
    expect(warning.message).toContain(UNKNOWN_RESPONSIBILITY_MATRIX_PROJECT_ID);
    expect(warning.source).toBe('pcc-mock-fixtures');
  });

  it('returns empty arrays, zeroed counts, and insufficient-data health for unknown projects', async () => {
    const envelope = await provider.getResponsibilityMatrix(
      UNKNOWN_RESPONSIBILITY_MATRIX_PROJECT_ID,
    );
    const data = envelope.data;

    expect(data.templates).toEqual([]);
    expect(data.projectInstances).toEqual([]);
    expect(data.exceptions).toEqual([]);
    expect(data.snapshotHistory).toEqual([]);
    expect(data.auditEvents).toEqual([]);

    expect(data.healthScore.state).toBe('insufficient-data');
    if (data.healthScore.state === 'insufficient-data') {
      expect(typeof data.healthScore.reason).toBe('string');
    }

    expect(data.workbookSourceSummary.defaultItemsTotal).toBe(0);
    expect(data.workbookSourceSummary.pmItems).toBe(0);
    expect(data.workbookSourceSummary.fieldItems).toBe(0);
    expect(data.workbookSourceSummary.strictMarkedRows).toBe(0);
    expect(data.workbookSourceSummary.ambiguousItemsTotal).toBe(0);
    expect(data.workbookSourceSummary.ownerContractActiveDefaultObligations).toBe(0);
    expect(data.workbookSourceSummary.sourceFiles).toEqual([]);

    expect(data.sourcePosture.sourceStatus).toBe('source-unavailable');
    expect(data.sourcePosture.pendingHumanReviewCount).toBe(0);
  });
});

describe('PccMockReadModelProvider.getResponsibilityMatrix — backend-unavailable simulation', () => {
  const provider = new PccMockReadModelProvider({ simulateBackendUnavailable: true });

  it('returns the empty read model with backend-unavailable status and warning', async () => {
    const envelope = await provider.getResponsibilityMatrix(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('backend-unavailable');
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    expect(envelope.warnings[0].code).toBe('backend-unavailable');
    expect(envelope.warnings[0].message).toBe(
      'Mock provider configured to simulate backend-unavailable.',
    );

    expect(envelope.data.templates).toEqual([]);
    expect(envelope.data.projectInstances).toEqual([]);
    expect(envelope.data.workbookSourceSummary.defaultItemsTotal).toBe(0);
    expect(envelope.data.healthScore.state).toBe('insufficient-data');
    expect(envelope.data.sourcePosture.sourceStatus).toBe('backend-unavailable');
  });

  it('produces an empty body shape parallel to the unknown-project branch', async () => {
    const unavailable = await provider.getResponsibilityMatrix(KNOWN_PROJECT_ID);
    const unknown = await new PccMockReadModelProvider().getResponsibilityMatrix(
      UNKNOWN_RESPONSIBILITY_MATRIX_PROJECT_ID,
    );

    expect(unavailable.data.templates).toEqual(unknown.data.templates);
    expect(unavailable.data.projectInstances).toEqual(unknown.data.projectInstances);
    expect(unavailable.data.exceptions).toEqual(unknown.data.exceptions);
    expect(unavailable.data.snapshotHistory).toEqual(unknown.data.snapshotHistory);
    expect(unavailable.data.auditEvents).toEqual(unknown.data.auditEvents);
    expect(unavailable.data.workbookSourceSummary).toEqual(unknown.data.workbookSourceSummary);
    expect(unavailable.data.healthScore).toEqual(unknown.data.healthScore);
  });
});

describe('PccMockReadModelProvider.getConstraintsLog — known project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns a read-only mock envelope with available status and the deterministic fixture', async () => {
    const envelope = await provider.getConstraintsLog(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.warnings).toHaveLength(0);
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);
    expect(envelope.data).toBe(SAMPLE_CONSTRAINTS_LOG_READ_MODEL);
  });

  it('preserves canonical Constraints Log module identity, vocabularies, and item coverage', async () => {
    const envelope = await provider.getConstraintsLog(KNOWN_PROJECT_ID);
    const data = envelope.data;

    expect(data.moduleIdentity.moduleId).toBe('constraints-log');
    expect(data.moduleIdentity.governance).toBe('project-readiness');
    expect(data.moduleIdentity.workCenterId).toBe('risk-issues-decision');

    expect(data.exposureBands.length).toBeGreaterThan(0);
    expect(data.seedCategories.length).toBeGreaterThan(0);
    expect(data.riskItems.length).toBeGreaterThan(0);
    expect(data.constraintItems.length).toBeGreaterThan(0);
    expect(data.snapshotHistory.length).toBeGreaterThan(0);
    expect(data.auditEvents.length).toBeGreaterThan(0);
    expect(data.sourcePosture.sourceStatus).toBe('available');
  });

  it('echoes optional viewerPersona on the envelope when provided', async () => {
    const envelope = await provider.getConstraintsLog(KNOWN_PROJECT_ID, 'project-manager');
    expect(envelope.viewerPersona).toBe('project-manager');
  });
});

describe('PccMockReadModelProvider.getConstraintsLog — unknown project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the empty Constraints Log read model with source-unavailable status', async () => {
    const envelope = await provider.getConstraintsLog(UNKNOWN_CONSTRAINTS_LOG_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('source-unavailable');
    expect(envelope.projectId).toBe(UNKNOWN_CONSTRAINTS_LOG_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    const warning = envelope.warnings[0];
    expect(warning.code).toBe('source-unavailable');
    expect(warning.message).toContain(UNKNOWN_CONSTRAINTS_LOG_PROJECT_ID);
    expect(warning.source).toBe('pcc-mock-fixtures');
  });

  it('returns empty arrays, zeroed counts, and source-unavailable source posture for unknown projects', async () => {
    const envelope = await provider.getConstraintsLog(UNKNOWN_CONSTRAINTS_LOG_PROJECT_ID);
    const data = envelope.data;

    expect(data.riskItems).toEqual([]);
    expect(data.constraintItems).toEqual([]);
    expect(data.seedCategories).toEqual([]);
    expect(data.snapshotHistory).toEqual([]);
    expect(data.auditEvents).toEqual([]);

    expect(data.exposureSummary.overdueConstraintCount).toBe(0);
    expect(data.exposureSummary.awaitingExternalPartyCount).toBe(0);
    expect(data.exposureSummary.delayExposureReviewQueueCount).toBe(0);
    expect(data.exposureSummary.changeExposureReviewQueueCount).toBe(0);
    expect(data.exposureSummary.priorityActionsCandidateCount).toBe(0);
    for (const band of Object.values(data.exposureSummary.riskCountsByBand)) {
      expect(band).toBe(0);
    }
    for (const band of Object.values(data.exposureSummary.constraintCountsByBand)) {
      expect(band).toBe(0);
    }

    expect(data.sourcePosture.sourceStatus).toBe('source-unavailable');
    expect(data.sourcePosture.pendingHumanReviewCount).toBe(0);

    // Module identity and vocabulary are preserved on the degraded envelope
    // so consumers always see the authoritative module name and scoring
    // catalog even when project state is unavailable.
    expect(data.moduleIdentity.moduleId).toBe('constraints-log');
    expect(data.exposureBands.length).toBeGreaterThan(0);
    expect(data.riskMatrixConfig.impactDimensions.length).toBeGreaterThan(0);
  });
});

describe('PccMockReadModelProvider.getConstraintsLog — backend-unavailable simulation', () => {
  const provider = new PccMockReadModelProvider({ simulateBackendUnavailable: true });

  it('returns the empty read model with backend-unavailable status and warning', async () => {
    const envelope = await provider.getConstraintsLog(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('backend-unavailable');
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    expect(envelope.warnings[0].code).toBe('backend-unavailable');
    expect(envelope.warnings[0].message).toBe(
      'Mock provider configured to simulate backend-unavailable.',
    );

    expect(envelope.data.riskItems).toEqual([]);
    expect(envelope.data.constraintItems).toEqual([]);
    expect(envelope.data.snapshotHistory).toEqual([]);
    expect(envelope.data.auditEvents).toEqual([]);
    expect(envelope.data.sourcePosture.sourceStatus).toBe('backend-unavailable');
  });

  it('produces an empty body shape parallel to the unknown-project branch', async () => {
    const unavailable = await provider.getConstraintsLog(KNOWN_PROJECT_ID);
    const unknown = await new PccMockReadModelProvider().getConstraintsLog(
      UNKNOWN_CONSTRAINTS_LOG_PROJECT_ID,
    );

    expect(unavailable.data.riskItems).toEqual(unknown.data.riskItems);
    expect(unavailable.data.constraintItems).toEqual(unknown.data.constraintItems);
    expect(unavailable.data.seedCategories).toEqual(unknown.data.seedCategories);
    expect(unavailable.data.snapshotHistory).toEqual(unknown.data.snapshotHistory);
    expect(unavailable.data.auditEvents).toEqual(unknown.data.auditEvents);
    expect(unavailable.data.exposureSummary).toEqual(unknown.data.exposureSummary);
    expect(unavailable.data.moduleIdentity).toEqual(unknown.data.moduleIdentity);
  });
});

describe('PccMockReadModelProvider.getBuyoutLog — known project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns a read-only mock envelope with available status and the deterministic fixture', async () => {
    const envelope = await provider.getBuyoutLog(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.warnings).toHaveLength(0);
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);
    expect(envelope.data).toBe(SAMPLE_BUYOUT_LOG_READ_MODEL);
  });

  it('preserves canonical Buyout Log module identity verbatim', async () => {
    const envelope = await provider.getBuyoutLog(KNOWN_PROJECT_ID);
    const data = envelope.data;

    expect(data.moduleIdentity.moduleId).toBe('buyout-log');
    expect(data.moduleIdentity.displayName).toBe('Buyout Log');
    expect(data.moduleIdentity.subtitle).toBe('Buyout Control Center');
    expect(data.moduleIdentity.governance).toBe('project-readiness');
    expect(data.moduleIdentity.workCenterId).toBe('procurement-and-buyout');
    expect(data.moduleIdentity.mvpTier).toBe('MVP');

    expect(data.packages.length).toBeGreaterThan(0);
    expect(data.priorityActionCandidates.length).toBeGreaterThan(0);
    expect(data.snapshotHistory.length).toBeGreaterThan(0);
    expect(data.auditEvents.length).toBeGreaterThan(0);
    expect(data.sourcePosture.sourceStatus).toBe('available');
  });

  it('echoes optional viewerPersona on the envelope when provided', async () => {
    const envelope = await provider.getBuyoutLog(KNOWN_PROJECT_ID, 'project-manager');
    expect(envelope.viewerPersona).toBe('project-manager');
  });

  it('omits viewerPersona on the envelope when not provided', async () => {
    const envelope = await provider.getBuyoutLog(KNOWN_PROJECT_ID);
    expect(envelope.viewerPersona).toBeUndefined();
  });
});

describe('PccMockReadModelProvider.getBuyoutLog — unknown project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the empty Buyout Log read model with source-unavailable status', async () => {
    const envelope = await provider.getBuyoutLog(UNKNOWN_BUYOUT_LOG_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('source-unavailable');
    expect(envelope.projectId).toBe(UNKNOWN_BUYOUT_LOG_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    const warning = envelope.warnings[0];
    expect(warning.code).toBe('source-unavailable');
    expect(warning.message).toContain(UNKNOWN_BUYOUT_LOG_PROJECT_ID);
    expect(warning.source).toBe('pcc-mock-fixtures');
  });

  it('returns empty arrays and source-unavailable source posture for unknown projects', async () => {
    const envelope = await provider.getBuyoutLog(UNKNOWN_BUYOUT_LOG_PROJECT_ID);
    const data = envelope.data;

    expect(data.packages).toEqual([]);
    expect(data.scopeLines).toEqual([]);
    expect(data.budgetAllocations).toEqual([]);
    expect(data.commitmentLinks).toEqual([]);
    expect(data.complianceRequirements).toEqual([]);
    expect(data.procurementMilestones).toEqual([]);
    expect(data.evidenceLinks).toEqual([]);
    expect(data.reconciliationIssues).toEqual([]);
    expect(data.priorityActionCandidates).toEqual([]);
    expect(data.auditEvents).toEqual([]);
    expect(data.projectMemoryContributions).toEqual([]);
    expect(data.traceabilityEdgeContributions).toEqual([]);
    expect(data.hbiEligibilityMarkers).toEqual([]);
    expect(data.snapshotHistory).toEqual([]);

    expect(data.sourcePosture.sourceStatus).toBe('source-unavailable');
    expect(data.sourcePosture.pendingHumanReviewCount).toBe(0);

    // Module identity preserved on the degraded envelope.
    expect(data.moduleIdentity.moduleId).toBe('buyout-log');
    expect(data.moduleIdentity.subtitle).toBe('Buyout Control Center');
  });
});

describe('PccMockReadModelProvider.getBuyoutLog — backend-unavailable simulation', () => {
  const provider = new PccMockReadModelProvider({ simulateBackendUnavailable: true });

  it('returns the empty read model with backend-unavailable status and warning', async () => {
    const envelope = await provider.getBuyoutLog(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('backend-unavailable');
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    expect(envelope.warnings[0].code).toBe('backend-unavailable');
    expect(envelope.warnings[0].message).toBe(
      'Mock provider configured to simulate backend-unavailable.',
    );

    expect(envelope.data.packages).toEqual([]);
    expect(envelope.data.priorityActionCandidates).toEqual([]);
    expect(envelope.data.snapshotHistory).toEqual([]);
    expect(envelope.data.auditEvents).toEqual([]);
    expect(envelope.data.sourcePosture.sourceStatus).toBe('backend-unavailable');
  });

  it('produces an empty body shape parallel to the unknown-project branch', async () => {
    const unavailable = await provider.getBuyoutLog(KNOWN_PROJECT_ID);
    const unknown = await new PccMockReadModelProvider().getBuyoutLog(
      UNKNOWN_BUYOUT_LOG_PROJECT_ID,
    );

    expect(unavailable.data.packages).toEqual(unknown.data.packages);
    expect(unavailable.data.commitmentLinks).toEqual(unknown.data.commitmentLinks);
    expect(unavailable.data.complianceRequirements).toEqual(unknown.data.complianceRequirements);
    expect(unavailable.data.priorityActionCandidates).toEqual(
      unknown.data.priorityActionCandidates,
    );
    expect(unavailable.data.snapshotHistory).toEqual(unknown.data.snapshotHistory);
    expect(unavailable.data.auditEvents).toEqual(unknown.data.auditEvents);
    expect(unavailable.data.moduleIdentity).toEqual(unknown.data.moduleIdentity);
  });
});

describe('PccMockReadModelProvider.getProcoreProjectMapping — known project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns a read-only mock envelope with available status and the deterministic fixture', async () => {
    const envelope = await provider.getProcoreProjectMapping(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.warnings).toHaveLength(0);
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);
    expect(envelope.data).toBe(SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL);
  });

  it('preserves canonical Procore Project Mapping module identity, registry-field names, and ownership note', async () => {
    const envelope = await provider.getProcoreProjectMapping(KNOWN_PROJECT_ID);
    const data = envelope.data;

    expect(data.moduleIdentity.moduleId).toBe('procore-project-mapping');
    expect(data.moduleIdentity.governance).toBe('pcc-mapping-authority');
    expect(data.registryFieldInternalNames.pccProjectId).toBe('field_1');
    expect(data.registryFieldInternalNames.legacyProcoreHint).toBe('procoreProject');
    expect(data.queryRecommendations.length).toBeGreaterThan(0);
    expect(data.ownershipNote).toBe(
      'PCC owns mapping; legacyProcoreHint is informative only and never canonical.',
    );
    expect(data.mappings.length).toBeGreaterThan(0);
    expect(data.registryContexts.length).toBeGreaterThan(0);
    expect(data.sourcePosture.sourceStatus).toBe('available');
  });

  it('echoes optional viewerPersona on the envelope when provided', async () => {
    const envelope = await provider.getProcoreProjectMapping(KNOWN_PROJECT_ID, 'project-manager');
    expect(envelope.viewerPersona).toBe('project-manager');
  });

  it('omits viewerPersona on the envelope when not provided', async () => {
    const envelope = await provider.getProcoreProjectMapping(KNOWN_PROJECT_ID);
    expect(envelope.viewerPersona).toBeUndefined();
  });
});

describe('PccMockReadModelProvider.getProcoreProjectMapping — unknown project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the empty Procore Project Mapping read model with source-unavailable status', async () => {
    const envelope = await provider.getProcoreProjectMapping(
      UNKNOWN_PROCORE_PROJECT_MAPPING_PROJECT_ID,
    );

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('source-unavailable');
    expect(envelope.projectId).toBe(UNKNOWN_PROCORE_PROJECT_MAPPING_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    const warning = envelope.warnings[0];
    expect(warning.code).toBe('source-unavailable');
    expect(warning.message).toContain(UNKNOWN_PROCORE_PROJECT_MAPPING_PROJECT_ID);
    expect(warning.source).toBe('pcc-mock-fixtures');
  });

  it('returns empty mappings + registryContexts and source-unavailable source posture; preserves static registry/query/ownership context', async () => {
    const envelope = await provider.getProcoreProjectMapping(
      UNKNOWN_PROCORE_PROJECT_MAPPING_PROJECT_ID,
    );
    const data = envelope.data;

    expect(data.mappings).toEqual([]);
    expect(data.registryContexts).toEqual([]);

    expect(data.sourcePosture.sourceStatus).toBe('source-unavailable');
    expect(data.sourcePosture.pendingHumanReviewCount).toBe(0);

    // Module identity, registry field-name registry, query recommendations,
    // and ownership note are preserved on the degraded envelope so consumers
    // always see the authoritative scope and posture.
    expect(data.moduleIdentity.moduleId).toBe('procore-project-mapping');
    expect(data.registryFieldInternalNames).toBe(
      SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.registryFieldInternalNames,
    );
    expect(data.queryRecommendations).toBe(
      SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.queryRecommendations,
    );
    expect(data.ownershipNote).toBe(SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.ownershipNote);
  });
});

describe('PccMockReadModelProvider.getProcoreProjectMapping — backend-unavailable simulation', () => {
  const provider = new PccMockReadModelProvider({ simulateBackendUnavailable: true });

  it('returns the empty read model with backend-unavailable status and warning', async () => {
    const envelope = await provider.getProcoreProjectMapping(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('backend-unavailable');
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    expect(envelope.warnings[0].code).toBe('backend-unavailable');
    expect(envelope.warnings[0].message).toBe(
      'Mock provider configured to simulate backend-unavailable.',
    );

    expect(envelope.data.mappings).toEqual([]);
    expect(envelope.data.registryContexts).toEqual([]);
    expect(envelope.data.sourcePosture.sourceStatus).toBe('backend-unavailable');
    expect(envelope.data.ownershipNote).toBe(
      SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.ownershipNote,
    );
  });

  it('produces an empty body shape parallel to the unknown-project branch (except sourcePosture)', async () => {
    const unavailable = await provider.getProcoreProjectMapping(KNOWN_PROJECT_ID);
    const unknown = await new PccMockReadModelProvider().getProcoreProjectMapping(
      UNKNOWN_PROCORE_PROJECT_MAPPING_PROJECT_ID,
    );

    expect(unavailable.data.mappings).toEqual(unknown.data.mappings);
    expect(unavailable.data.registryContexts).toEqual(unknown.data.registryContexts);
    expect(unavailable.data.moduleIdentity).toEqual(unknown.data.moduleIdentity);
    expect(unavailable.data.queryRecommendations).toBe(unknown.data.queryRecommendations);
    expect(unavailable.data.ownershipNote).toBe(unknown.data.ownershipNote);
    expect(unavailable.data.sourcePosture.sourceStatus).toBe('backend-unavailable');
    expect(unknown.data.sourcePosture.sourceStatus).toBe('source-unavailable');
  });
});

describe('PccMockReadModelProvider.getProcoreSyncHealth — known project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns a read-only mock envelope with available status and the deterministic fixture', async () => {
    const envelope = await provider.getProcoreSyncHealth(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.warnings).toHaveLength(0);
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);
    expect(envelope.data).toBe(SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL);
  });

  it('preserves canonical Procore Sync Health module identity, subject-area registry, and ownership note', async () => {
    const envelope = await provider.getProcoreSyncHealth(KNOWN_PROJECT_ID);
    const data = envelope.data;

    expect(data.moduleIdentity.moduleId).toBe('procore-sync-health');
    expect(data.moduleIdentity.governance).toBe('pcc-procore-data-layer-authority');
    expect(data.subjectAreas.length).toBeGreaterThan(0);
    expect(data.syncHealthEntries.length).toBeGreaterThan(0);
    expect(data.objectLinks.length).toBeGreaterThan(0);
    expect(data.curatedSummaries.length).toBeGreaterThan(0);
    expect(data.derivedSignals.length).toBeGreaterThan(0);
    expect(data.sourceLineages.length).toBeGreaterThan(0);
    expect(data.ownershipNote).toContain('No write-back');
    expect(data.sourcePosture.sourceStatus).toBe('available');
  });

  it('echoes optional viewerPersona on the envelope when provided', async () => {
    const envelope = await provider.getProcoreSyncHealth(KNOWN_PROJECT_ID, 'project-manager');
    expect(envelope.viewerPersona).toBe('project-manager');
  });

  it('omits viewerPersona on the envelope when not provided', async () => {
    const envelope = await provider.getProcoreSyncHealth(KNOWN_PROJECT_ID);
    expect(envelope.viewerPersona).toBeUndefined();
  });
});

describe('PccMockReadModelProvider.getProcoreSyncHealth — unknown project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the empty Procore Sync Health read model with source-unavailable status', async () => {
    const envelope = await provider.getProcoreSyncHealth(UNKNOWN_PROCORE_SYNC_HEALTH_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('source-unavailable');
    expect(envelope.projectId).toBe(UNKNOWN_PROCORE_SYNC_HEALTH_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    const warning = envelope.warnings[0];
    expect(warning.code).toBe('source-unavailable');
    expect(warning.message).toContain(UNKNOWN_PROCORE_SYNC_HEALTH_PROJECT_ID);
    expect(warning.source).toBe('pcc-mock-fixtures');
  });

  it('returns empty per-area arrays and source-unavailable source posture; preserves static subject-area registry and ownership note', async () => {
    const envelope = await provider.getProcoreSyncHealth(UNKNOWN_PROCORE_SYNC_HEALTH_PROJECT_ID);
    const data = envelope.data;

    expect(data.syncHealthEntries).toEqual([]);
    expect(data.sourceLineages).toEqual([]);
    expect(data.objectLinks).toEqual([]);
    expect(data.curatedSummaries).toEqual([]);
    expect(data.derivedSignals).toEqual([]);

    expect(data.sourcePosture.sourceStatus).toBe('source-unavailable');
    expect(data.sourcePosture.pendingHumanReviewCount).toBe(0);

    // Module identity, subject-area registry list, and ownership note are
    // preserved on the degraded envelope.
    expect(data.moduleIdentity.moduleId).toBe('procore-sync-health');
    expect(data.subjectAreas).toBe(SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.subjectAreas);
    expect(data.ownershipNote).toBe(SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.ownershipNote);
  });
});

describe('PccMockReadModelProvider.getProcoreSyncHealth — backend-unavailable simulation', () => {
  const provider = new PccMockReadModelProvider({ simulateBackendUnavailable: true });

  it('returns the empty read model with backend-unavailable status and warning', async () => {
    const envelope = await provider.getProcoreSyncHealth(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('backend-unavailable');
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    expect(envelope.warnings[0].code).toBe('backend-unavailable');
    expect(envelope.warnings[0].message).toBe(
      'Mock provider configured to simulate backend-unavailable.',
    );

    expect(envelope.data.syncHealthEntries).toEqual([]);
    expect(envelope.data.objectLinks).toEqual([]);
    expect(envelope.data.curatedSummaries).toEqual([]);
    expect(envelope.data.derivedSignals).toEqual([]);
    expect(envelope.data.sourceLineages).toEqual([]);
    expect(envelope.data.sourcePosture.sourceStatus).toBe('backend-unavailable');
    expect(envelope.data.ownershipNote).toBe(SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.ownershipNote);
  });

  it('produces an empty body shape parallel to the unknown-project branch (except sourcePosture)', async () => {
    const unavailable = await provider.getProcoreSyncHealth(KNOWN_PROJECT_ID);
    const unknown = await new PccMockReadModelProvider().getProcoreSyncHealth(
      UNKNOWN_PROCORE_SYNC_HEALTH_PROJECT_ID,
    );

    expect(unavailable.data.syncHealthEntries).toEqual(unknown.data.syncHealthEntries);
    expect(unavailable.data.objectLinks).toEqual(unknown.data.objectLinks);
    expect(unavailable.data.curatedSummaries).toEqual(unknown.data.curatedSummaries);
    expect(unavailable.data.derivedSignals).toEqual(unknown.data.derivedSignals);
    expect(unavailable.data.sourceLineages).toEqual(unknown.data.sourceLineages);
    expect(unavailable.data.moduleIdentity).toEqual(unknown.data.moduleIdentity);
    expect(unavailable.data.subjectAreas).toBe(unknown.data.subjectAreas);
    expect(unavailable.data.ownershipNote).toBe(unknown.data.ownershipNote);
    expect(unavailable.data.sourcePosture.sourceStatus).toBe('backend-unavailable');
    expect(unknown.data.sourcePosture.sourceStatus).toBe('source-unavailable');
  });
});

describe('PccMockReadModelProvider unified lifecycle canonical read models', () => {
  const provider = new PccMockReadModelProvider();
  const unavailableProvider = new PccMockReadModelProvider({ simulateBackendUnavailable: true });

  it('returns known-project deterministic fixtures for canonical unified lifecycle methods', async () => {
    const unifiedLifecycle = await provider.getUnifiedLifecycle(KNOWN_PROJECT_ID);
    const projectMemory = await provider.getProjectMemory(KNOWN_PROJECT_ID);
    const projectLenses = await provider.getProjectLenses(KNOWN_PROJECT_ID);
    const projectTraceability = await provider.getProjectTraceability(KNOWN_PROJECT_ID);
    const warrantyTrace = await provider.getWarrantyTrace(KNOWN_PROJECT_ID);
    const crossProjectKnowledge = await provider.getCrossProjectKnowledge(KNOWN_PROJECT_ID);
    const unifiedSearch = await provider.getUnifiedSearch(KNOWN_PROJECT_ID);

    expect(unifiedLifecycle.data).toBe(SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL);
    expect(projectMemory.data).toBe(SAMPLE_PROJECT_MEMORY_READ_MODEL);
    expect(projectLenses.data).toBe(SAMPLE_PROJECT_LENSES_READ_MODEL);
    expect(projectTraceability.data).toBe(SAMPLE_PROJECT_TRACEABILITY_READ_MODEL);
    expect(warrantyTrace.data).toBe(SAMPLE_WARRANTY_TRACE_READ_MODEL);
    expect(crossProjectKnowledge.data).toBe(SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL);
    expect(unifiedSearch.data).toBe(SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL);

    for (const envelope of [
      unifiedLifecycle,
      projectMemory,
      projectLenses,
      projectTraceability,
      warrantyTrace,
      crossProjectKnowledge,
      unifiedSearch,
    ]) {
      expect(envelope.readOnly).toBe(true);
      expect(envelope.mode).toBe('mock');
      expect(envelope.sourceStatus).toBe('available');
    }
  });

  it('returns source-unavailable degraded envelopes for unknown project', async () => {
    const unknown = await provider.getUnifiedLifecycle(UNKNOWN_UNIFIED_LIFECYCLE_PROJECT_ID);
    expect(unknown.sourceStatus).toBe('source-unavailable');
    expect(unknown.warnings).toHaveLength(1);

    const methods = [
      provider.getProjectMemory(UNKNOWN_UNIFIED_LIFECYCLE_PROJECT_ID),
      provider.getProjectLenses(UNKNOWN_UNIFIED_LIFECYCLE_PROJECT_ID),
      provider.getProjectTraceability(UNKNOWN_UNIFIED_LIFECYCLE_PROJECT_ID),
      provider.getWarrantyTrace(UNKNOWN_UNIFIED_LIFECYCLE_PROJECT_ID),
      provider.getCrossProjectKnowledge(UNKNOWN_UNIFIED_LIFECYCLE_PROJECT_ID),
      provider.getUnifiedSearch(UNKNOWN_UNIFIED_LIFECYCLE_PROJECT_ID),
    ];
    const envelopes = await Promise.all(methods);
    for (const envelope of envelopes) {
      expect(envelope.sourceStatus).toBe('source-unavailable');
      expect(envelope.warnings).toHaveLength(1);
    }
  });

  it('returns backend-unavailable degraded envelopes when simulation is enabled', async () => {
    const methods = [
      unavailableProvider.getUnifiedLifecycle(KNOWN_PROJECT_ID),
      unavailableProvider.getProjectMemory(KNOWN_PROJECT_ID),
      unavailableProvider.getProjectLenses(KNOWN_PROJECT_ID),
      unavailableProvider.getProjectTraceability(KNOWN_PROJECT_ID),
      unavailableProvider.getWarrantyTrace(KNOWN_PROJECT_ID),
      unavailableProvider.getCrossProjectKnowledge(KNOWN_PROJECT_ID),
      unavailableProvider.getUnifiedSearch(KNOWN_PROJECT_ID),
    ];
    const envelopes = await Promise.all(methods);
    for (const envelope of envelopes) {
      expect(envelope.sourceStatus).toBe('backend-unavailable');
      expect(envelope.warnings[0]?.code).toBe('backend-unavailable');
      expect(envelope.readOnly).toBe(true);
    }
  });

  it('unified search grounded responses remain cited and refusal responses explicit', async () => {
    const envelope = await provider.getUnifiedSearch(KNOWN_PROJECT_ID);
    const grounded = envelope.data.responses.filter((r) => r.grounded);
    const refusals = envelope.data.responses.filter((r) => r.refused);

    expect(grounded.length).toBeGreaterThan(0);
    for (const item of grounded) {
      if (!item.grounded) continue;
      expect(item.citations.length).toBeGreaterThan(0);
    }
    expect(refusals.length).toBeGreaterThan(0);
    for (const item of refusals) {
      if (!item.refused) continue;
      expect(item.citations).toEqual([]);
      expect(item.refusalReason.length).toBeGreaterThan(0);
    }
  });

  it('warranty trace does not assign responsibility when status is insufficient-evidence', async () => {
    const envelope = await provider.getWarrantyTrace(KNOWN_PROJECT_ID);
    const insufficient = envelope.data.traces.find(
      (trace) => trace.status === 'insufficient-evidence',
    );
    expect(insufficient).toBeDefined();
    expect(insufficient?.recommendation).toBeUndefined();
  });

  it('cross-project knowledge includes security/redaction posture', async () => {
    const envelope = await provider.getCrossProjectKnowledge(KNOWN_PROJECT_ID);
    expect(envelope.data.crossProjectReferences.length).toBeGreaterThan(0);
    for (const ref of envelope.data.crossProjectReferences) {
      expect(ref.security.classification.length).toBeGreaterThan(0);
      expect(ref.security.redactionLevel.length).toBeGreaterThan(0);
    }
  });
});

describe('PccMockReadModelProvider source posture (no runtime, no mutation)', () => {
  const stripped = stripCommentsAndStrings(readFileSync(PROVIDER_SOURCE_FILE, 'utf8'));

  const FORBIDDEN_IMPORT_PATTERNS: readonly RegExp[] = [
    /\b@microsoft\/sp-/,
    /\b@pnp\//,
    /\b@azure\/(?!functions\b)/,
    /\baxios\b/,
    /\bnode-fetch\b/,
    /procore-sdk/i,
    /\b@microsoft\/microsoft-graph-client\b/,
  ];

  const FORBIDDEN_EXECUTABLE_TOKENS: readonly RegExp[] = [
    /\bprovision\b/i,
    /\bexecute\b/i,
    /\brepair\b/i,
    /\bmirror\b/i,
    /\bwriteBack\b/i,
    /\bupload\b/i,
    /\bmutate\b/i,
    /\bapprove\b/i,
    /\breject\b/i,
    /\bMSGraphClient\b/,
    /\bGraphServiceClient\b/,
    /\bsp\.web\b/,
    /_api\/web/,
    /\baddUserToGroup\b/,
    /\bremoveUserFromGroup\b/,
    /\baddTeamMember\b/,
    /\baddChannelMember\b/,
    /\bjoinedTeams\b/,
    /\bgraphMembers\b/,
  ];

  it('imports no forbidden runtime clients', () => {
    const importLines = stripped
      .split('\n')
      .filter((line) => /\bimport\b/.test(line) || /\bfrom\b/.test(line));
    for (const line of importLines) {
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(pattern.test(line), `forbidden import: ${line.trim()}`).toBe(false);
      }
    }
  });

  it('contains no mutation/execution tokens in executable source', () => {
    for (const pattern of FORBIDDEN_EXECUTABLE_TOKENS) {
      expect(stripped, `matched ${pattern}`).not.toMatch(pattern);
    }
  });
});

// ===========================================================================
// Wave 14 / Prompt 03 — getApprovals composite read-model behavior
// ===========================================================================

const UNKNOWN_APPROVALS_PROJECT_ID: PccProjectId = 'project-unknown-approvals-001' as PccProjectId;

describe('PccMockReadModelProvider.getApprovals — known project, no viewerPersona', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the full SAMPLE_APPROVALS_READ_MODEL composite unchanged', async () => {
    const env = await provider.getApprovals(KNOWN_PROJECT_ID);
    expect(env.mode).toBe('mock');
    expect(env.readOnly).toBe(true);
    expect(env.sourceStatus).toBe('available');
    expect(env.warnings).toEqual([]);
    expect(env.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.viewerPersona).toBeUndefined();
    expect(env.data).toBe(SAMPLE_APPROVALS_READ_MODEL);
  });

  it('exposes every required Wave 14 composite field', async () => {
    const env = await provider.getApprovals(KNOWN_PROJECT_ID);
    expect(env.data.queue).toBeDefined();
    expect(env.data.myApprovals).toBeDefined();
    expect(env.data.registry).toBeDefined();
    expect(env.data.escalation).toBeDefined();
    expect(env.data.adminVerification).toBeDefined();
    expect(env.data.policy).toBeDefined();
    expect(env.data.analytics).toBeDefined();
  });

  it('does not include detail or decisionHistory (deferred to a future per-request route)', async () => {
    const env = await provider.getApprovals(KNOWN_PROJECT_ID);
    expect((env.data as Record<string, unknown>).detail).toBeUndefined();
    expect((env.data as Record<string, unknown>).decisionHistory).toBeUndefined();
  });
});

describe('PccMockReadModelProvider.getApprovals — known project, viewerPersona provided', () => {
  const provider = new PccMockReadModelProvider();

  it("filters myApprovals.entries by assignedRole === 'project-executive' and sets viewerRole", async () => {
    const env = await provider.getApprovals(KNOWN_PROJECT_ID, 'project-executive');
    expect(env.viewerPersona).toBe('project-executive');
    expect(env.data.myApprovals.viewerRole).toBe('project-executive');
    for (const entry of env.data.myApprovals.entries) {
      expect(entry.assignedRole).toBe('project-executive');
    }
    expect(env.data.myApprovals.entries.length).toBeGreaterThan(0);
  });

  it('returns an empty entries array for a persona with no fixture matches', async () => {
    const env = await provider.getApprovals(KNOWN_PROJECT_ID, 'subcontractor-limited');
    expect(env.data.myApprovals.viewerRole).toBe('subcontractor-limited');
    expect(env.data.myApprovals.entries).toEqual([]);
  });

  it('passes through other sub-models unchanged when viewerPersona is provided', async () => {
    const env = await provider.getApprovals(KNOWN_PROJECT_ID, 'project-executive');
    expect(env.data.queue).toBe(SAMPLE_APPROVALS_READ_MODEL.queue);
    expect(env.data.registry).toBe(SAMPLE_APPROVALS_READ_MODEL.registry);
    expect(env.data.escalation).toBe(SAMPLE_APPROVALS_READ_MODEL.escalation);
    expect(env.data.adminVerification).toBe(SAMPLE_APPROVALS_READ_MODEL.adminVerification);
    expect(env.data.policy).toBe(SAMPLE_APPROVALS_READ_MODEL.policy);
    expect(env.data.analytics).toBe(SAMPLE_APPROVALS_READ_MODEL.analytics);
  });
});

describe('PccMockReadModelProvider.getApprovals — unknown project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the EMPTY composite with source-unavailable status and a warning', async () => {
    const env = await provider.getApprovals(UNKNOWN_APPROVALS_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.data).toBe(EMPTY_APPROVALS_READ_MODEL);
    expect(env.warnings.some((w) => w.code === 'source-unavailable')).toBe(true);
    expect(env.readOnly).toBe(true);
    expect(env.mode).toBe('mock');
  });
});

describe('PccMockReadModelProvider.getApprovals — backend-unavailable simulation', () => {
  const provider = new PccMockReadModelProvider({ simulateBackendUnavailable: true });

  it('returns the EMPTY composite with backend-unavailable status and a warning', async () => {
    const env = await provider.getApprovals(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.data).toBe(EMPTY_APPROVALS_READ_MODEL);
    expect(env.warnings.some((w) => w.code === 'backend-unavailable')).toBe(true);
    expect(env.readOnly).toBe(true);
    expect(env.mode).toBe('mock');
  });
});

// ─── Wave 15 / Prompt 03 — External Systems Launch Pad ──────────────────────

const UNKNOWN_WAVE_15_PROJECT_ID: PccProjectId =
  'project-unknown-wave-15-launch-pad-001' as PccProjectId;

describe('PccMockReadModelProvider.getExternalSystemsLaunchPad', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the canonical composite for a known project with available status', async () => {
    const env = await provider.getExternalSystemsLaunchPad(KNOWN_PROJECT_ID);
    expect(env.readOnly).toBe(true);
    expect(env.mode).toBe('mock');
    expect(env.sourceStatus).toBe('available');
    expect(env.warnings).toEqual([]);
    expect(env.data).toBe(SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT);
  });

  it('returns the unknown-project composite with source-unavailable status', async () => {
    const env = await provider.getExternalSystemsLaunchPad(UNKNOWN_WAVE_15_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.data).toBe(SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_UNKNOWN_PROJECT);
    expect(env.warnings.some((w) => w.code === 'source-unavailable')).toBe(true);
  });

  it('returns the backend-unavailable composite carrying the canonical degraded-matrix user copy', async () => {
    const offline = new PccMockReadModelProvider({ simulateBackendUnavailable: true });
    const env = await offline.getExternalSystemsLaunchPad(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.data).toBe(SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_BACKEND_UNAVAILABLE);
    expect(env.warnings.some((w) => w.code === 'backend-unavailable')).toBe(true);
    expect(env.data.healthSnapshots).toHaveLength(1);
    expect(env.data.healthSnapshots[0]?.statusMessage).toBe(
      EXTERNAL_SYSTEM_DEGRADED_STATE_MATRIX['backend-unavailable'].userCopy,
    );
  });
});

describe('PccMockReadModelProvider.getExternalSystemRegistry', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the canonical registry for a known project', async () => {
    const env = await provider.getExternalSystemRegistry(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('available');
    expect(env.data).toBe(SAMPLE_PCC_EXTERNAL_SYSTEM_REGISTRY_READ_MODEL);
    expect(env.warnings).toEqual([]);
  });

  it('returns the canonical registry even for an unknown project (project-independent)', async () => {
    const env = await provider.getExternalSystemRegistry(UNKNOWN_WAVE_15_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.data).toBe(SAMPLE_PCC_EXTERNAL_SYSTEM_REGISTRY_READ_MODEL);
    expect(env.warnings.some((w) => w.code === 'source-unavailable')).toBe(true);
  });

  it('returns the canonical registry with backend-unavailable status under simulation', async () => {
    const offline = new PccMockReadModelProvider({ simulateBackendUnavailable: true });
    const env = await offline.getExternalSystemRegistry(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.data).toBe(SAMPLE_PCC_EXTERNAL_SYSTEM_REGISTRY_READ_MODEL);
    expect(env.warnings.some((w) => w.code === 'backend-unavailable')).toBe(true);
  });
});

describe('PccMockReadModelProvider.getProjectExternalLaunchLinks', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the canonical links for a known project with overridden inner projectId', async () => {
    const env = await provider.getProjectExternalLaunchLinks(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('available');
    expect(env.data.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.data.links).toBe(SAMPLE_PCC_PROJECT_EXTERNAL_LAUNCH_LINKS_READ_MODEL.links);
  });

  it('returns empty links for an unknown project with source-unavailable status', async () => {
    const env = await provider.getProjectExternalLaunchLinks(UNKNOWN_WAVE_15_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.data.projectId).toBe(UNKNOWN_WAVE_15_PROJECT_ID);
    expect(env.data.links).toEqual([]);
  });

  it('returns empty links with backend-unavailable status under simulation', async () => {
    const offline = new PccMockReadModelProvider({ simulateBackendUnavailable: true });
    const env = await offline.getProjectExternalLaunchLinks(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.data.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.data.links).toEqual([]);
  });
});

describe('PccMockReadModelProvider.getProjectExternalSystemMappings', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the canonical mappings for a known project with overridden inner projectId', async () => {
    const env = await provider.getProjectExternalSystemMappings(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('available');
    expect(env.data.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.data.mappings).toBe(SAMPLE_PCC_PROJECT_EXTERNAL_SYSTEM_MAPPINGS_READ_MODEL.mappings);
  });

  it('returns empty mappings for an unknown project with source-unavailable status', async () => {
    const env = await provider.getProjectExternalSystemMappings(UNKNOWN_WAVE_15_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.data.projectId).toBe(UNKNOWN_WAVE_15_PROJECT_ID);
    expect(env.data.mappings).toEqual([]);
  });

  it('returns empty mappings with backend-unavailable status under simulation', async () => {
    const offline = new PccMockReadModelProvider({ simulateBackendUnavailable: true });
    const env = await offline.getProjectExternalSystemMappings(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.data.mappings).toEqual([]);
  });
});

describe('PccMockReadModelProvider.getExternalObjectReferences', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the canonical references for a known project with overridden inner projectId', async () => {
    const env = await provider.getExternalObjectReferences(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('available');
    expect(env.data.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.data.references).toBe(SAMPLE_PCC_EXTERNAL_OBJECT_REFERENCES_READ_MODEL.references);
  });

  it('returns empty references for an unknown project with source-unavailable status', async () => {
    const env = await provider.getExternalObjectReferences(UNKNOWN_WAVE_15_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.data.references).toEqual([]);
  });

  it('returns empty references with backend-unavailable status under simulation', async () => {
    const offline = new PccMockReadModelProvider({ simulateBackendUnavailable: true });
    const env = await offline.getExternalObjectReferences(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.data.references).toEqual([]);
  });
});

describe('PccMockReadModelProvider.getExternalReviewItems', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the canonical review items for a known project with overridden inner projectId', async () => {
    const env = await provider.getExternalReviewItems(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('available');
    expect(env.data.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.data.items).toBe(SAMPLE_PCC_EXTERNAL_REVIEW_ITEMS_READ_MODEL.items);
  });

  it('returns empty items for an unknown project with source-unavailable status', async () => {
    const env = await provider.getExternalReviewItems(UNKNOWN_WAVE_15_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.data.items).toEqual([]);
  });

  it('returns empty items with backend-unavailable status under simulation', async () => {
    const offline = new PccMockReadModelProvider({ simulateBackendUnavailable: true });
    const env = await offline.getExternalReviewItems(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.data.items).toEqual([]);
  });
});

describe('PccMockReadModelProvider.getExternalSystemHealthSnapshots', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the canonical snapshots for a known project with overridden inner projectId', async () => {
    const env = await provider.getExternalSystemHealthSnapshots(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('available');
    expect(env.data.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.data.snapshots).toBe(
      SAMPLE_PCC_EXTERNAL_SYSTEM_HEALTH_SNAPSHOTS_READ_MODEL.snapshots,
    );
  });

  it('returns empty snapshots for an unknown project with source-unavailable status', async () => {
    const env = await provider.getExternalSystemHealthSnapshots(UNKNOWN_WAVE_15_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.data.snapshots).toEqual([]);
  });

  it('returns empty snapshots with backend-unavailable status under simulation', async () => {
    const offline = new PccMockReadModelProvider({ simulateBackendUnavailable: true });
    const env = await offline.getExternalSystemHealthSnapshots(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.data.snapshots).toEqual([]);
  });
});

describe('PccMockReadModelProvider.getExternalSystemAuditEvents', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the canonical events for a known project with overridden inner projectId', async () => {
    const env = await provider.getExternalSystemAuditEvents(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('available');
    expect(env.data.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.data.events).toBe(SAMPLE_PCC_EXTERNAL_SYSTEM_AUDIT_EVENTS_READ_MODEL.events);
  });

  it('returns empty events for an unknown project with source-unavailable status', async () => {
    const env = await provider.getExternalSystemAuditEvents(UNKNOWN_WAVE_15_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.data.events).toEqual([]);
  });

  it('returns empty events with backend-unavailable status under simulation', async () => {
    const offline = new PccMockReadModelProvider({ simulateBackendUnavailable: true });
    const env = await offline.getExternalSystemAuditEvents(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.data.events).toEqual([]);
  });
});

describe('PccMockReadModelProvider.getHbiSourceLineage', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the canonical lineage entries for a known project with overridden inner projectId', async () => {
    const env = await provider.getHbiSourceLineage(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('available');
    expect(env.data.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.data.entries).toBe(SAMPLE_PCC_HBI_SOURCE_LINEAGE_READ_MODEL.entries);
  });

  it('returns empty entries for an unknown project with source-unavailable status', async () => {
    const env = await provider.getHbiSourceLineage(UNKNOWN_WAVE_15_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.data.entries).toEqual([]);
  });

  it('returns empty entries with backend-unavailable status under simulation', async () => {
    const offline = new PccMockReadModelProvider({ simulateBackendUnavailable: true });
    const env = await offline.getHbiSourceLineage(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.data.entries).toEqual([]);
  });
});
