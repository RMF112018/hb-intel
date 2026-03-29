/**
 * Lifecycle and mutation contract tests (Wave 1C closure).
 */

import { describe, expect, it } from 'vitest';
import type {
  ReviewCustodyStatus,
  IFinancialReviewCustodyRecord,
  IReviewCustodyTransitionResult,
  ReportingPeriodStatus,
  IFinancialReportingPeriod,
  IPeriodCloseResult,
  IPeriodReopenResult,
  IG4SummaryValidationResult,
  G4ValidationErrorCode,
  IFinancialAuditEvent,
  FinancialAuditEventType,
  FinancialAuditCategory,
  ILifecycleTransitionResult,
} from '../types/index.js';
import { REVIEW_CUSTODY_TRANSITIONS } from '../types/index.js';

describe('Review custody contracts', () => {
  it('all custody states are valid', () => {
    const states: ReviewCustodyStatus[] = [
      'PmCourt', 'SubmittedForReview', 'InReview', 'ReturnedForRevision', 'Approved',
    ];
    expect(states).toHaveLength(5);
  });

  it('transition table has 5 valid transitions', () => {
    expect(REVIEW_CUSTODY_TRANSITIONS).toHaveLength(5);
  });

  it('PM can only submit from PmCourt', () => {
    const pmTransitions = REVIEW_CUSTODY_TRANSITIONS.filter(
      (t) => t.allowedRoles.includes('PM'),
    );
    expect(pmTransitions).toHaveLength(2); // PmCourt→Submitted, Returned→PmCourt
    expect(pmTransitions[0].from).toBe('PmCourt');
    expect(pmTransitions[1].from).toBe('ReturnedForRevision');
  });

  it('PER can return or approve from InReview', () => {
    const perFromInReview = REVIEW_CUSTODY_TRANSITIONS.filter(
      (t) => t.from === 'InReview' && t.allowedRoles.includes('PER'),
    );
    expect(perFromInReview).toHaveLength(2);
    const targets = perFromInReview.map((t) => t.to).sort();
    expect(targets).toEqual(['Approved', 'ReturnedForRevision']);
  });

  it('IFinancialReviewCustodyRecord type compiles', () => {
    const record: IFinancialReviewCustodyRecord = {
      custodyRecordId: 'cust-001',
      forecastVersionId: 'ver-003',
      projectId: 'proj-001',
      fromStatus: 'PmCourt',
      toStatus: 'SubmittedForReview',
      transitionedAt: '2026-03-20T10:00:00Z',
      transitionedBy: 'John Smith',
      transitionedByRole: 'PM',
      reason: 'Ready for March review',
      comments: null,
    };
    expect(record.toStatus).toBe('SubmittedForReview');
  });

  it('transition result includes blockers when not allowed', () => {
    const result: IReviewCustodyTransitionResult = {
      allowed: false,
      fromStatus: 'PmCourt',
      toStatus: 'Approved',
      blockers: ['Direct PmCourt→Approved transition is not allowed; must go through review'],
      record: null,
    };
    expect(result.allowed).toBe(false);
    expect(result.blockers).toHaveLength(1);
  });
});

describe('Reporting period contracts', () => {
  it('all period states are valid', () => {
    const states: ReportingPeriodStatus[] = ['Open', 'Closed', 'Reopened'];
    expect(states).toHaveLength(3);
  });

  it('IFinancialReportingPeriod type compiles', () => {
    const period: IFinancialReportingPeriod = {
      periodId: 'per-2026-03',
      projectId: 'proj-001',
      reportingMonth: '2026-03',
      status: 'Open',
      openedAt: '2026-03-01T00:00:00Z',
      closedAt: null,
      closedBy: null,
      reopenedAt: null,
      reopenedBy: null,
      reopenReason: null,
      activeVersionId: 'ver-003',
      publishedVersionId: null,
    };
    expect(period.status).toBe('Open');
    expect(period.activeVersionId).toBe('ver-003');
  });

  it('period close result handles auto-confirm path', () => {
    const result: IPeriodCloseResult = {
      periodId: 'per-2026-02',
      closedAt: '2026-02-28T23:59:00Z',
      closedBy: 'System',
      workingVersionDisposition: 'auto-confirmed',
      resultVersionState: 'ConfirmedInternal',
      gateResult: { canConfirm: true, blockers: [] },
    };
    expect(result.workingVersionDisposition).toBe('auto-confirmed');
  });

  it('period close result handles supersede path', () => {
    const result: IPeriodCloseResult = {
      periodId: 'per-2026-02',
      closedAt: '2026-02-28T23:59:00Z',
      closedBy: 'System',
      workingVersionDisposition: 'superseded-unconfirmed',
      resultVersionState: 'Superseded',
      gateResult: { canConfirm: false, blockers: ['3 required checklist items incomplete'] },
    };
    expect(result.workingVersionDisposition).toBe('superseded-unconfirmed');
    expect(result.gateResult.blockers).toHaveLength(1);
  });

  it('period reopen result includes governed blockers', () => {
    const result: IPeriodReopenResult = {
      allowed: false,
      periodId: 'per-2026-01',
      blockers: ['Reopen requires PE approval per PH3-FIN-SOTL §13'],
      reopenedAt: null,
    };
    expect(result.allowed).toBe(false);
  });
});

describe('G4 summary validation contract', () => {
  it('all G4 error codes are valid', () => {
    const codes: G4ValidationErrorCode[] = [
      'gcgr-posture-not-computable',
      'summary-required-field-missing',
      'derived-field-inconsistent',
      'negative-profit-unacknowledged',
      'contingency-exceeded',
    ];
    expect(codes).toHaveLength(5);
  });

  it('IG4SummaryValidationResult type compiles', () => {
    const result: IG4SummaryValidationResult = {
      isValid: false,
      errors: [
        { code: 'gcgr-posture-not-computable', field: 'gcgrTotalVariance', message: 'GC/GR lines have no data' },
      ],
    };
    expect(result.isValid).toBe(false);
    expect(result.errors[0].code).toBe('gcgr-posture-not-computable');
  });
});

describe('Audit event envelope contract', () => {
  it('all audit event types are valid', () => {
    const types: FinancialAuditEventType[] = [
      'BudgetImported', 'BudgetReconciliationResolved', 'ForecastVersionCreated',
      'ForecastVersionConfirmed', 'ForecastVersionDerived', 'ForecastVersionSuperseded',
      'ReportCandidateDesignated', 'ForecastVersionPublished', 'GCGRLineEdited',
      'CashFlowMonthEdited', 'BuyoutStatusAdvanced', 'BuyoutSavingsDispositioned',
      'ChecklistItemCompleted', 'ReviewCustodyTransitioned', 'PeriodClosed',
      'PeriodReopened', 'ExportRunCreated', 'AnnotationCreated', 'AnnotationDispositioned',
    ];
    expect(types).toHaveLength(19);
  });

  it('all audit categories are valid', () => {
    const categories: FinancialAuditCategory[] = [
      'import', 'lifecycle', 'edit', 'review', 'publication', 'period', 'export', 'annotation',
    ];
    expect(categories).toHaveLength(8);
  });

  it('IFinancialAuditEvent type compiles', () => {
    const event: IFinancialAuditEvent = {
      eventId: 'evt-001',
      projectId: 'proj-001',
      forecastVersionId: 'ver-003',
      eventType: 'ForecastVersionConfirmed',
      category: 'lifecycle',
      actor: 'John Smith',
      actorRole: 'PM',
      occurredAt: '2026-03-25T15:00:00Z',
      summary: 'Version 3 confirmed by PM',
      detail: { versionNumber: 3 },
      sourceRecordType: 'ForecastVersion',
      sourceRecordId: 'ver-003',
      previousState: 'Working',
      newState: 'ConfirmedInternal',
    };
    expect(event.eventType).toBe('ForecastVersionConfirmed');
    expect(event.actorRole).toBe('PM');
  });

  it('system-initiated audit events use System role', () => {
    const event: IFinancialAuditEvent = {
      eventId: 'evt-002',
      projectId: 'proj-001',
      forecastVersionId: 'ver-003',
      eventType: 'ForecastVersionPublished',
      category: 'publication',
      actor: 'System (P3-F1)',
      actorRole: 'System',
      occurredAt: '2026-03-28T18:00:00Z',
      summary: 'Version 3 promoted to PublishedMonthly via P3-F1 handoff',
      detail: {},
      sourceRecordType: 'ForecastVersion',
      sourceRecordId: 'ver-003',
      previousState: 'ConfirmedInternal',
      newState: 'PublishedMonthly',
    };
    expect(event.actorRole).toBe('System');
  });
});

describe('Generic lifecycle transition result', () => {
  it('ILifecycleTransitionResult works with version states', () => {
    const result: ILifecycleTransitionResult<'Working' | 'ConfirmedInternal'> = {
      allowed: true,
      fromState: 'Working',
      toState: 'ConfirmedInternal',
      blockers: [],
      auditEvent: null,
    };
    expect(result.allowed).toBe(true);
  });
});
