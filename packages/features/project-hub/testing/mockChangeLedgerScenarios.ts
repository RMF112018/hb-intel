import { createMockChangeEventRecord } from './createMockChangeEventRecord.js';
import { createMockChangeLineItem } from './createMockChangeLineItem.js';
import { createMockProcoreMappingRecord } from './createMockProcoreMappingRecord.js';

/** Pre-built scenario records for all Change Ledger lifecycle states and edge cases. */
export const mockChangeLedgerScenarios = {
  /** Default: newly identified change event. */
  identifiedChangeEvent: createMockChangeEventRecord(),

  /** Change event under cost/schedule analysis. */
  underAnalysisChangeEvent: createMockChangeEventRecord({
    changeEventId: 'ce-002',
    changeEventNumber: 'CE-002',
    status: 'UnderAnalysis',
    statusDate: '2026-02-15',
    totalCostImpact: 75000,
    costConfidence: 'Rough',
    lineItems: [
      createMockChangeLineItem({ lineItemId: 'li-001', description: 'Drilled pier installation', type: 'Subcontract', totalCost: 55000 }),
      createMockChangeLineItem({ lineItemId: 'li-002', description: 'Additional engineering', type: 'Labor', totalCost: 20000 }),
    ],
    totalCostCalculated: true,
  }),

  /** Change event pending approval. */
  pendingApprovalChangeEvent: createMockChangeEventRecord({
    changeEventId: 'ce-003',
    changeEventNumber: 'CE-003',
    status: 'PendingApproval',
    statusDate: '2026-03-01',
    totalCostImpact: 82000,
    costConfidence: 'Ordered',
    scheduleImpactDays: 14,
    scheduleImpactDescription: 'Foundation redesign extends critical path by 14 calendar days.',
  }),

  /** Approved change event with cost and approval details. */
  approvedChangeEvent: createMockChangeEventRecord({
    changeEventId: 'ce-004',
    changeEventNumber: 'CE-004',
    status: 'Approved',
    statusDate: '2026-03-10',
    approvedDate: '2026-03-10',
    approvedBy: 'user-exec-001',
    totalCostImpact: 82000,
    costConfidence: 'Definitive',
  }),

  /** Rejected change event. */
  rejectedChangeEvent: createMockChangeEventRecord({
    changeEventId: 'ce-005',
    changeEventNumber: 'CE-005',
    status: 'Rejected',
    statusDate: '2026-03-05',
    totalCostImpact: 150000,
    origin: 'VALUE_ENGINEERING',
    title: 'VE proposal — alternate curtain wall system',
    description: 'Value engineering proposal to substitute curtain wall system with a lower-cost alternative. Owner rejected due to aesthetic concerns.',
  }),

  /** Closed change event. */
  closedChangeEvent: createMockChangeEventRecord({
    changeEventId: 'ce-006',
    changeEventNumber: 'CE-006',
    status: 'Closed',
    statusDate: '2026-03-20',
    dateClosed: '2026-03-20',
    approvedDate: '2026-03-10',
    approvedBy: 'user-exec-001',
    totalCostImpact: 82000,
    closureReason: 'Work executed; cost absorbed into revised budget.',
  }),

  /** Voided change event. */
  voidChangeEvent: createMockChangeEventRecord({
    changeEventId: 'ce-007',
    changeEventNumber: 'CE-007',
    status: 'Void',
    statusDate: '2026-02-05',
    closureReason: 'Duplicate of CE-001.',
    dateClosed: '2026-02-05',
  }),

  /** Cancelled change event. */
  cancelledChangeEvent: createMockChangeEventRecord({
    changeEventId: 'ce-008',
    changeEventNumber: 'CE-008',
    status: 'Cancelled',
    statusDate: '2026-02-10',
    closureReason: 'Owner withdrew the directive.',
    dateClosed: '2026-02-10',
    origin: 'OWNER_DIRECTIVE',
  }),

  /** Superseded change event. */
  supersededChangeEvent: createMockChangeEventRecord({
    changeEventId: 'ce-009',
    changeEventNumber: 'CE-009',
    status: 'Superseded',
    statusDate: '2026-03-15',
    closureReason: 'Replaced by CE-012 with updated scope.',
    dateClosed: '2026-03-15',
  }),

  /** Change event spawned from a constraint. */
  spawnedFromConstraintChangeEvent: createMockChangeEventRecord({
    changeEventId: 'ce-010',
    changeEventNumber: 'CE-010',
    parentConstraintId: 'con-008',
    origin: 'SITE_CONDITION',
    title: 'Elevator pit redesign (from CON-008)',
    description: 'Constraint CON-008 regarding elevator equipment delivery resulted in scope change for elevator pit dimensions to accommodate alternate manufacturer.',
  }),

  /** Change event with Procore integration. */
  integratedChangeEvent: createMockChangeEventRecord({
    changeEventId: 'ce-011',
    changeEventNumber: 'CE-011',
    integrationMode: 'IntegratedWithProcore',
    procoreMapping: createMockProcoreMappingRecord(),
  }),

  /** Change event with line items. */
  changeEventWithLineItems: createMockChangeEventRecord({
    changeEventId: 'ce-012',
    changeEventNumber: 'CE-012',
    status: 'UnderAnalysis',
    totalCostImpact: 95000,
    totalCostCalculated: true,
    lineItems: [
      createMockChangeLineItem({ lineItemId: 'li-010', description: 'Drilled pier installation', type: 'Subcontract', totalCost: 55000 }),
      createMockChangeLineItem({ lineItemId: 'li-011', description: 'Structural engineering revision', type: 'Labor', totalCost: 20000 }),
      createMockChangeLineItem({ lineItemId: 'li-012', description: 'Additional rebar', type: 'Material', quantity: 8, unit: 'TON', unitCost: 2500, totalCost: 20000 }),
    ],
  }),
} as const;
