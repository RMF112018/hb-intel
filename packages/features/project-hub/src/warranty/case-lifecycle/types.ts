/**
 * P3-E14-T10 Stage 4 Project Warranty Module case-lifecycle TypeScript contracts.
 * State transitions, next move, SLA, escalation, due dates, audit.
 */

import type {
  WarrantyAuditEventType,
  WarrantyCaseBlockingReason,
  WarrantyCaseTransitionActor,
  WarrantyEscalationTrigger,
  WarrantyNextMoveOwner,
  WarrantySlaTier,
  WarrantySlaWindow,
} from './enums.js';
import type { WarrantyCaseStatus } from '../record-families/enums.js';

/** State transition per T04 §3.2. */
export interface IWarrantyCaseTransition {
  readonly from: WarrantyCaseStatus;
  readonly to: WarrantyCaseStatus;
  readonly actor: WarrantyCaseTransitionActor;
  readonly guardCondition: string;
}

/** Next move definition per T04 §4. */
export interface IWarrantyNextMoveDef {
  readonly status: WarrantyCaseStatus;
  readonly nextMove: string;
  readonly owner: WarrantyNextMoveOwner;
  readonly workQueueRoutedTo: string;
}

/** SLA tier definition per T04 §5.1. */
export interface IWarrantySlaTierDef {
  readonly tier: WarrantySlaTier;
  readonly trigger: string;
}

/** SLA window definition per T04 §5.2. */
export interface IWarrantySlaWindowDef {
  readonly window: WarrantySlaWindow;
  readonly standardDays: number;
  readonly expeditedDays: number;
  readonly startsWhen: string;
  readonly appliesToField: string;
}

/** Escalation trigger definition per T04 §6.1. */
export interface IWarrantyEscalationTriggerDef {
  readonly trigger: WarrantyEscalationTrigger;
  readonly action: string;
  readonly routedTo: string;
}

/** Due date model per T04 §7. */
export interface IWarrantyCaseDueDate {
  readonly slaResponseDeadline: string | null;
  readonly slaRepairDeadline: string | null;
  readonly slaVerificationDeadline: string | null;
  readonly dueDateOverride: string | null;
  readonly dueDateOverrideReason: string | null;
  readonly dueDateOverrideSetByUserId: string | null;
}

/** Audit event definition per T04 §12. */
export interface IWarrantyAuditEventDef {
  readonly eventType: WarrantyAuditEventType;
  readonly requirement: string;
}
