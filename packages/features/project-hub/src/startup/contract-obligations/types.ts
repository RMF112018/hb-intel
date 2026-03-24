/**
 * P3-E11-T10 Stage 5 Project Startup Contract Obligations Register TypeScript contracts.
 * Register header, obligation rows, lifecycle transitions, monitoring rules.
 */

import type {
  ContractType,
  StartupDeliveryMethod,
  MonitoringPriority,
  ObligationCategory,
  ObligationStatus,
  ObligationTriggerBasis,
} from './enums.js';
import type { StartupCertificationStatus } from '../foundation/enums.js';

// -- ContractObligationsRegister (T04 §2) — Header -------------------------

/** Contract obligations register header per T04 §2. One per project. */
export interface IContractObligationsRegister {
  readonly registerId: string;
  readonly programId: string;
  readonly projectId: string;
  readonly contractDate: string | null;
  readonly contractType: ContractType | null;
  readonly contractValue: number | null;
  readonly deliveryMethod: StartupDeliveryMethod | null;
  readonly uploadedContractFileId: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastModifiedAt: string;
  readonly lastModifiedBy: string | null;
  readonly totalObligationCount: number;
  readonly openObligationCount: number;
  readonly inProgressObligationCount: number;
  readonly flaggedObligationCount: number;
  readonly overdueObligationCount: number;
  readonly lastMonitoringReviewAt: string | null;
  readonly certificationStatus: StartupCertificationStatus;
}

// -- ContractObligation (T04 §3) — Row -------------------------------------

/** Contract obligation row per T04 §3. 0+ per register. */
export interface IContractObligation {
  readonly obligationId: string;
  readonly registerId: string;
  readonly projectId: string;
  readonly article: string | null;
  readonly page: string | null;
  readonly exhibitRef: string | null;
  readonly description: string;
  readonly category: ObligationCategory | null;
  readonly responsibleRoleCode: string | null;
  readonly responsiblePersonName: string | null;
  readonly responsibleUserId: string | null;
  readonly accountableRoleCode: string | null;
  readonly obligationStatus: ObligationStatus;
  readonly flagForMonitoring: boolean;
  readonly monitoringPriority: MonitoringPriority | null;
  readonly triggerBasis: ObligationTriggerBasis | null;
  readonly dueDate: string | null;
  readonly recurrencePeriodDays: number | null;
  readonly nextMonitoringCheckAt: string | null;
  readonly notes: string | null;
  readonly waiverNote: string | null;
  readonly evidenceAttachmentIds: readonly string[];
  readonly satisfiedAt: string | null;
  readonly satisfiedBy: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastModifiedAt: string;
  readonly lastModifiedBy: string | null;
}

// -- Supporting Types -------------------------------------------------------

/** Valid obligation state transition per T04 §4. */
export interface IObligationStateTransition {
  readonly from: ObligationStatus;
  readonly to: ObligationStatus;
  readonly guard: string;
  readonly requiresPX: boolean;
}

/** Obligation category definition per T04 §5. */
export interface IObligationCategoryDefinition {
  readonly category: ObligationCategory;
  readonly label: string;
  readonly routingImplication: string;
  readonly autoFlagForMonitoring: boolean;
}

/** Monitoring trigger rule per T04 §6.1. */
export interface IMonitoringTriggerRule {
  readonly condition: string;
  readonly workQueueItemType: string;
  readonly assignedTo: string;
  readonly clearsWhen: string;
}

/** Monitoring priority lead days per T04 §6.2. */
export interface IMonitoringPriorityLeadDays {
  readonly priority: MonitoringPriority;
  readonly leadDays: number;
}

/** Stage 5 Activity Spine event definition. */
export interface IStage5ActivityEventDef {
  readonly event: string;
  readonly description: string;
}

/** Stage 5 Health Spine metric definition. */
export interface IStage5HealthMetricDef {
  readonly metric: string;
  readonly description: string;
}

/** Stage 5 Work Queue item definition. */
export interface IStage5WorkQueueItemDef {
  readonly item: string;
  readonly description: string;
  readonly assignedTo: string;
}
