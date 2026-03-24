/**
 * P3-E7-T04 Inspection, Deficiency, and Compliance Control constants.
 */

import type { ICheckpointTemplate, IDeficiencyHealthImpactRule, IDeficiencyWorkQueueRule } from './types.js';

export const INSPECTION_SCOPE = 'permits/inspection' as const;

// ── Master Building Checkpoint Templates (§1.3) ────────────────────

export const MASTER_BUILDING_CHECKPOINT_TEMPLATES: ReadonlyArray<Omit<ICheckpointTemplate, 'templateId' | 'createdAt' | 'updatedAt'>> = [
  { permitType: 'MASTER_BUILDING', checkpointName: 'Building Footer & ISO pads', codeReference: 'IBC §1809', sequence: 1, isBlockingCloseout: true, blockedByCheckpointNames: [], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Soil bearing test', codeReference: 'IBC §1803', sequence: 2, isBlockingCloseout: true, blockedByCheckpointNames: [], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Pre-slab inspection', codeReference: 'IBC §1907', sequence: 3, isBlockingCloseout: true, blockedByCheckpointNames: ['Soil bearing test'], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Underground plumbing rough-in', codeReference: 'IPC §312', sequence: 4, isBlockingCloseout: true, blockedByCheckpointNames: [], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Structural steel', codeReference: 'IBC §1705', sequence: 5, isBlockingCloseout: true, blockedByCheckpointNames: ['Building Footer & ISO pads'], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Fire preliminary', codeReference: 'NFPA 13 §7', sequence: 6, isBlockingCloseout: true, blockedByCheckpointNames: [], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Framing rough-in', codeReference: 'IBC §2308', sequence: 7, isBlockingCloseout: true, blockedByCheckpointNames: ['Structural steel'], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Electrical rough-in', codeReference: 'NEC §230', sequence: 8, isBlockingCloseout: true, blockedByCheckpointNames: [], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Insulation', codeReference: 'IECC §C402', sequence: 9, isBlockingCloseout: false, blockedByCheckpointNames: ['Framing rough-in'], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Final — Building', codeReference: 'IBC §111', sequence: 10, isBlockingCloseout: true, blockedByCheckpointNames: [], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Final — Electrical', codeReference: 'NEC §230', sequence: 11, isBlockingCloseout: true, blockedByCheckpointNames: ['Electrical rough-in'], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Final — Plumbing', codeReference: 'IPC §107', sequence: 12, isBlockingCloseout: true, blockedByCheckpointNames: ['Underground plumbing rough-in'], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Final — Mechanical', codeReference: 'IMC §106', sequence: 13, isBlockingCloseout: true, blockedByCheckpointNames: [], jurisdictionName: null, notes: null, isActive: true },
  { permitType: 'MASTER_BUILDING', checkpointName: 'Certificate of Occupancy', codeReference: 'IBC §111.1', sequence: 14, isBlockingCloseout: true, blockedByCheckpointNames: ['Final — Building', 'Final — Electrical', 'Final — Plumbing', 'Final — Mechanical'], jurisdictionName: null, notes: null, isActive: true },
];

// ── Deficiency Health Impact Rules (§3.3) ───────────────────────────

export const DEFICIENCY_HEALTH_IMPACT_RULES: ReadonlyArray<IDeficiencyHealthImpactRule> = [
  { severity: 'HIGH', resolutionStatus: 'OPEN', healthTierImpact: 'CRITICAL', condition: null },
  { severity: 'HIGH', resolutionStatus: 'ACKNOWLEDGED', healthTierImpact: 'CRITICAL', condition: null },
  { severity: 'HIGH', resolutionStatus: 'REMEDIATION_IN_PROGRESS', healthTierImpact: 'AT_RISK', condition: null },
  { severity: 'HIGH', resolutionStatus: 'RESOLVED', healthTierImpact: null, condition: null },
  { severity: 'HIGH', resolutionStatus: 'VERIFIED_RESOLVED', healthTierImpact: null, condition: null },
  { severity: 'MEDIUM', resolutionStatus: 'OPEN', healthTierImpact: 'AT_RISK', condition: null },
  { severity: 'MEDIUM', resolutionStatus: 'ACKNOWLEDGED', healthTierImpact: 'AT_RISK', condition: null },
  { severity: 'MEDIUM', resolutionStatus: 'REMEDIATION_IN_PROGRESS', healthTierImpact: null, condition: null },
  { severity: 'LOW', resolutionStatus: 'OPEN', healthTierImpact: null, condition: 'No health impact until 7 days past dueDate' },
];

// ── Deficiency Work Queue Rules (§3.4) ──────────────────────────────

export const DEFICIENCY_WORK_QUEUE_RULES: ReadonlyArray<IDeficiencyWorkQueueRule> = [
  { condition: 'HIGH severity + OPEN', workQueueItem: 'High-Severity Deficiency — Immediate Action Required', priority: 'HIGH', assignee: 'assignedToPartyId or permit currentResponsiblePartyId' },
  { condition: 'MEDIUM severity + OPEN > 3 days', workQueueItem: 'Deficiency Unaddressed', priority: 'MEDIUM', assignee: 'assignedToPartyId' },
  { condition: 'Any severity + past dueDate', workQueueItem: 'Deficiency Overdue', priority: 'HIGH', assignee: 'escalationOwnerId' },
  { condition: 'followUpRequired = true on InspectionVisit', workQueueItem: 'Re-inspection Required', priority: 'HIGH', assignee: 'permit currentResponsiblePartyId' },
];

// ── Compliance Close-Out Conditions (§6) ────────────────────────────

export const COMPLIANCE_CLOSEOUT_CONDITIONS = [
  'All blocking checkpoints have currentResult = PASS or NOT_APPLICABLE',
  'No deficiencies with resolutionStatus = OPEN, ACKNOWLEDGED, or REMEDIATION_IN_PROGRESS',
  'IssuedPermit.currentStatus is ACTIVE or UNDER_INSPECTION',
  'IssuedPermit.expirationDate has not passed (or renewal approved)',
] as const;
