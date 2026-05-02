import { describe, expect, it } from 'vitest';
import {
  SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE,
  SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
} from '@hbc/models/pcc';
import type { PccResponsibilityMatrixReadModel } from '@hbc/models/pcc';
import { buildPccRmIntegrationSignalsViewModel } from './integrationSignals.js';

const EMPTY_READ_MODEL: PccResponsibilityMatrixReadModel = {
  templates: [],
  projectInstances: [],
  exceptions: [],
  healthScore: SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE,
  workbookSourceSummary: {
    defaultItemsTotal: 0,
    pmItems: 0,
    fieldItems: 0,
    strictMarkedRows: 0,
    ambiguousItemsTotal: 0,
    ownerContractActiveDefaultObligations: 0,
    sourceFiles: [],
  },
  sourcePosture: {
    sourceStatus: 'source-unavailable',
    pendingHumanReviewCount: 0,
  },
  snapshotHistory: [],
  auditEvents: [],
};

describe('buildPccRmIntegrationSignalsViewModel — happy path (canonical fixture)', () => {
  const integration = buildPccRmIntegrationSignalsViewModel(
    SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
  );

  it('returns all five integration sub-region view-models', () => {
    expect(integration.priorityActions).toBeDefined();
    expect(integration.readinessSignals).toBeDefined();
    expect(integration.approvalsReferences).toBeDefined();
    expect(integration.teamAccessReferences).toBeDefined();
    expect(integration.documentControlReferences).toBeDefined();
  });

  it('priority-actions candidates surface every required exception code', () => {
    const codes = integration.priorityActions.groups.map((g) => g.code);
    expect(codes).toContain('MISSING_ACCOUNTABLE_OWNER');
    expect(codes).toContain('MISSING_CURRENT_ACTION_OWNER');
    expect(codes).toContain('OVERDUE_ACTION');
    expect(codes).toContain('ROLE_VACANT');
    expect(codes).toContain('PERSON_INACTIVE');
    expect(codes).toContain('HANDOFF_REQUIRED');
    expect(codes).toContain('MISSING_REQUIRED_EVIDENCE_REFERENCE');
    expect(codes).toContain('OWNER_CONTRACT_AMBIGUITY');
  });

  it('priority-actions "missing current action owner" group is labeled as responsible-action-owner unresolved', () => {
    const group = integration.priorityActions.groups.find(
      (g) => g.code === 'MISSING_CURRENT_ACTION_OWNER',
    );
    expect(group).toBeDefined();
    expect(group!.codeLabel).toContain('responsible action owner unresolved');
    expect(group!.captionText).toContain('responsible action owner is unresolved');
  });

  it('priority-actions group severities match envelope', () => {
    const overdue = integration.priorityActions.groups.find((g) => g.code === 'OVERDUE_ACTION');
    expect(overdue!.severityHighest).toBe('critical');
    expect(overdue!.severityLabel).toBe('Critical');
    expect(overdue!.relatedInstanceIds).toContain('RM-INS-0003');
  });

  it('priority-actions ownership caption preserves Priority Actions surface ownership', () => {
    expect(integration.priorityActions.ownershipCaption).toContain('Priority Actions remains');
    expect(integration.priorityActions.ownershipCaption).toContain('candidate signals only');
  });

  it('readiness signals surface open critical, pending review, decision-rights, and source posture entries', () => {
    const kinds = integration.readinessSignals.entries.map((e) => e.kind);
    expect(kinds).toContain('open-critical-exceptions');
    expect(kinds).toContain('pending-human-review');
    expect(kinds).toContain('decision-rights-gap');
    expect(kinds).toContain('source-posture');
    expect(integration.readinessSignals.sourceModuleId).toBe('responsibility-matrix');
  });

  it('readiness signals "decision-rights gap" is rendered explicitly even when count is 0', () => {
    const entry = integration.readinessSignals.entries.find(
      (e) => e.kind === 'decision-rights-gap',
    );
    expect(entry).toBeDefined();
    expect(entry!.count).toBe(
      SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL.healthScore.state === 'computed'
        ? SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL.healthScore.unresolvedDecisionRightsGaps
        : 0,
    );
  });

  it('readiness signals "pending human review" aggregates source-posture + ambiguous workbook rows', () => {
    const entry = integration.readinessSignals.entries.find(
      (e) => e.kind === 'pending-human-review',
    );
    expect(entry).toBeDefined();
    expect(entry!.count).toBe(
      SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL.sourcePosture.pendingHumanReviewCount +
        SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL.workbookSourceSummary.ambiguousItemsTotal,
    );
  });

  it('readiness ownership caption preserves Project Readiness scoring doctrine ownership', () => {
    expect(integration.readinessSignals.ownershipCaption).toContain(
      'Project Readiness retains its scoring doctrine',
    );
  });

  it('approvals references list workflow steps from the healthy instance fixture', () => {
    const entries = integration.approvalsReferences.entries;
    expect(entries.length).toBeGreaterThanOrEqual(1);
    const review = entries.find((e) => e.stepType === 'review');
    expect(review).toBeDefined();
    expect(review!.stepStateLabel).toBe('Pending');
  });

  it('approvals ownership caption defers execution to Wave 14', () => {
    expect(integration.approvalsReferences.ownershipCaption).toContain('Wave 14');
    expect(integration.approvalsReferences.ownershipCaption).toContain(
      'no approval is requested or executed',
    );
  });

  it('team-access references surface roles, including the inactive person', () => {
    const personEntries = integration.teamAccessReferences.personEntries;
    expect(personEntries.length).toBeGreaterThanOrEqual(1);
    const inactive = personEntries.find((p) => p.isActive === false);
    expect(inactive, 'expected an inactive person ref').toBeDefined();
    const roles = integration.teamAccessReferences.roleEntries.map((r) => r.roleCode);
    expect(roles).toContain('PM');
  });

  it('team-access ownership caption preserves Team & Access roster ownership', () => {
    expect(integration.teamAccessReferences.ownershipCaption).toContain(
      'Team & Access remains the roster and access owner',
    );
    expect(integration.teamAccessReferences.ownershipCaption).toContain('no roster, permission');
  });

  it('document-control references group evidence by status', () => {
    const entries = integration.documentControlReferences.entries;
    const presentEntry = entries.find((e) => e.status === 'present');
    const missingEntry = entries.find((e) => e.status === 'missing');
    expect(presentEntry).toBeDefined();
    expect(missingEntry).toBeDefined();
    expect(presentEntry!.documentControlSourceIds).toContain('project-record');
  });

  it('document-control ownership caption preserves Document Control binary ownership', () => {
    expect(integration.documentControlReferences.ownershipCaption).toContain(
      'HB Document Control Center retains evidence-binary ownership',
    );
    expect(integration.documentControlReferences.ownershipCaption).toContain(
      'no upload, download, sync, mirror, or storage',
    );
  });
});

describe('buildPccRmIntegrationSignalsViewModel — degraded source health', () => {
  it('renders safely with insufficient-data health score', () => {
    const integration = buildPccRmIntegrationSignalsViewModel({
      ...SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
      healthScore: SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE,
    });
    const open = integration.readinessSignals.entries.find(
      (e) => e.kind === 'open-critical-exceptions',
    );
    const decision = integration.readinessSignals.entries.find(
      (e) => e.kind === 'decision-rights-gap',
    );
    expect(open).toBeDefined();
    expect(open!.count).toBe(0);
    expect(open!.captionText).toContain('insufficient-data');
    expect(decision).toBeDefined();
    expect(decision!.count).toBe(0);
    expect(decision!.captionText).toContain('insufficient-data');
  });

  it('renders safely with empty read-model (source-unavailable / backend-unavailable shape)', () => {
    const integration = buildPccRmIntegrationSignalsViewModel(EMPTY_READ_MODEL);
    expect(integration.priorityActions.groups).toHaveLength(0);
    expect(integration.approvalsReferences.entries).toHaveLength(0);
    expect(integration.teamAccessReferences.roleEntries).toHaveLength(0);
    expect(integration.teamAccessReferences.personEntries).toHaveLength(0);
    expect(integration.documentControlReferences.entries).toHaveLength(0);
    // Readiness signals always emit the four canonical entries regardless of envelope.
    const kinds = integration.readinessSignals.entries.map((e) => e.kind);
    expect(kinds).toEqual(
      expect.arrayContaining([
        'open-critical-exceptions',
        'decision-rights-gap',
        'pending-human-review',
        'source-posture',
      ]),
    );
  });
});

describe('buildPccRmIntegrationSignalsViewModel — derived "missing responsible / current action owner unresolved"', () => {
  it('is sourced from MISSING_CURRENT_ACTION_OWNER plus absent currentActionOwner — never from absent ownerRole', () => {
    const group = buildPccRmIntegrationSignalsViewModel(
      SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
    ).priorityActions.groups.find((g) => g.code === 'MISSING_CURRENT_ACTION_OWNER');
    expect(group).toBeDefined();
    const referenced = SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL.projectInstances.find(
      (i) => i.instanceId === group!.relatedInstanceIds[0],
    );
    expect(referenced).toBeDefined();
    // The fixture preserves ownerRole on every instance — the "missing
    // responsible" condition is therefore proven via absent currentActionOwner
    // on the same instance.
    expect(referenced!.assignment.ownerRole).toBeDefined();
    expect(referenced!.assignment.currentActionOwner).toBeUndefined();
  });
});
