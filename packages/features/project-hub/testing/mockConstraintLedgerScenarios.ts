import { createMockConstraintRecord } from './createMockConstraintRecord.js';

/** Pre-built scenario records for all Constraint Ledger lifecycle states and edge cases. */
export const mockConstraintLedgerScenarios = {
  /** Default: newly identified constraint. */
  identifiedConstraint: createMockConstraintRecord(),

  /** Constraint being actively worked. */
  underActionConstraint: createMockConstraintRecord({
    constraintId: 'con-002',
    constraintNumber: 'CON-002',
    status: 'UnderAction',
    statusDate: '2026-02-15',
    comments: [
      {
        commentId: 'cmt-001',
        text: 'Contacted structural engineer; response expected by end of week.',
        authorName: 'Jane Smith',
        authorId: 'user-002',
        timestamp: '2026-02-15T14:00:00Z',
      },
    ],
  }),

  /** Constraint pending external event. */
  pendingConstraint: createMockConstraintRecord({
    constraintId: 'con-003',
    constraintNumber: 'CON-003',
    status: 'Pending',
    statusDate: '2026-02-20',
    category: 'PERMITS',
    title: 'City permit review in progress',
    description:
      'Building permit application submitted to city planning department. Review timeline is 30 business days per city policy.',
    dueDate: '2026-04-15',
    daysOpen: 31,
  }),

  /** Resolved constraint with full closure documentation. */
  resolvedConstraint: createMockConstraintRecord({
    constraintId: 'con-004',
    constraintNumber: 'CON-004',
    status: 'Resolved',
    statusDate: '2026-03-01',
    dateClosed: '2026-03-01',
    closureDocumentUri: 'https://docs.example.com/rfi-042-response.pdf',
    closureNotes: 'RFI-042 answered; foundation design confirmed adequate for bearing loads.',
    closureReason: 'RFI response received; no design changes required.',
  }),

  /** Voided constraint — created in error. */
  voidConstraint: createMockConstraintRecord({
    constraintId: 'con-005',
    constraintNumber: 'CON-005',
    status: 'Void',
    statusDate: '2026-02-05',
    closureReason: 'Duplicate of CON-001.',
    dateClosed: '2026-02-05',
  }),

  /** Cancelled constraint — deliberate withdrawal. */
  cancelledConstraint: createMockConstraintRecord({
    constraintId: 'con-006',
    constraintNumber: 'CON-006',
    status: 'Cancelled',
    statusDate: '2026-02-10',
    closureReason: 'Scope change eliminated this work area; constraint no longer applicable.',
    dateClosed: '2026-02-10',
    category: 'SCHEDULE',
    title: 'Concrete pour sequence conflict',
    description:
      'Building B concrete pour schedule conflicts with crane availability for steel erection in the same area.',
  }),

  /** Superseded constraint — replaced by a newer record. */
  supersededConstraint: createMockConstraintRecord({
    constraintId: 'con-007',
    constraintNumber: 'CON-007',
    status: 'Superseded',
    statusDate: '2026-03-05',
    closureReason: 'Replaced by CON-012 with updated scope and responsible party.',
    dateClosed: '2026-03-05',
  }),

  /** Open constraint past its due date — overdue. */
  overdueConstraint: createMockConstraintRecord({
    constraintId: 'con-008',
    constraintNumber: 'CON-008',
    status: 'UnderAction',
    statusDate: '2026-01-15',
    dateIdentified: '2025-12-01',
    dueDate: '2026-01-31',
    daysOpen: 113,
    category: 'PROCUREMENT',
    title: 'Long-lead elevator equipment delivery',
    description:
      'Elevator manufacturer confirmed 20-week lead time exceeds original schedule allowance by 4 weeks.',
  }),

  /** Critical priority constraint requiring immediate action. */
  criticalPriorityConstraint: createMockConstraintRecord({
    constraintId: 'con-009',
    constraintNumber: 'CON-009',
    priority: 1,
    category: 'SAFETY',
    title: 'Excavation shoring failure at Building C',
    description:
      'Temporary shoring system at Building C excavation showing signs of lateral displacement. All work in the area halted pending structural assessment.',
  }),

  /** Constraint spawned from a Risk record. */
  spawnedFromRiskConstraint: createMockConstraintRecord({
    constraintId: 'con-010',
    constraintNumber: 'CON-010',
    parentRiskId: 'risk-005',
    category: 'GEOTECHNICAL',
    title: 'Unexpected clay deposits at Building A foundation',
    description:
      'Geotechnical borings confirmed clay deposits at northwest corner exceeding design assumptions. Foundation redesign required.',
  }),
} as const;
