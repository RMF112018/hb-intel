/**
 * P3-E13-T08 Stage 5 Subcontract Execution Readiness Module workflow-publication TypeScript contracts.
 * Timer definitions, routed outputs, publication outputs, shared package requirements.
 */

import type {
  ProhibitedLocalSubstitute,
  ReadinessActivityEventType,
  ReadinessEscalationType,
  ReadinessHealthMetricType,
  ReadinessNotificationType,
  ReadinessRelatedItemType,
  ReadinessTimerType,
  ReadinessWorkItemType,
  ReadinessWorkQueueType,
  RequiredSharedPackage,
} from './enums.js';

// -- Timer Definition (T05 §2.1) ----------------------------------------------

/** Typed timer definition per T05 §2.1. */
export interface IReadinessTimerDef {
  readonly timerType: ReadinessTimerType;
  readonly anchor: string;
  readonly primaryOutput: string;
}

// -- Routed Work Item Definition (T05 §3.1) -----------------------------------

/** Routed work item definition per T05 §3.1. */
export interface IReadinessWorkItemDef {
  readonly workItemType: ReadinessWorkItemType;
  readonly description: string;
}

// -- Notification Definition (T05 §3.2) ---------------------------------------

/** Notification definition per T05 §3.2. */
export interface IReadinessNotificationDef {
  readonly notificationType: ReadinessNotificationType;
  readonly description: string;
}

// -- Escalation Definition (T05 §3.3) -----------------------------------------

/** Escalation definition per T05 §3.3. */
export interface IReadinessEscalationDef {
  readonly escalationType: ReadinessEscalationType;
  readonly target: string;
  readonly description: string;
}

// -- Activity Event Definition (T05 §4.1) -------------------------------------

/** Activity spine event definition per T05 §4.1. */
export interface IReadinessActivityEventDef {
  readonly eventType: ReadinessActivityEventType;
  readonly description: string;
}

// -- Work Queue Definition (T05 §4.2) -----------------------------------------

/** Work queue projection definition per T05 §4.2. */
export interface IReadinessWorkQueueDef {
  readonly workQueueType: ReadinessWorkQueueType;
  readonly description: string;
}

// -- Health Metric Definition (T05 §4.3) --------------------------------------

/** Health publication definition per T05 §4.3. */
export interface IReadinessHealthMetricDef {
  readonly metricType: ReadinessHealthMetricType;
  readonly description: string;
}

// -- Related Item Definition (T05 §4.4) ---------------------------------------

/** Related item projection definition per T05 §4.4. */
export interface IReadinessRelatedItemDef {
  readonly relatedItemType: ReadinessRelatedItemType;
  readonly description: string;
}

// -- Shared Package Requirement (T05 §5) --------------------------------------

/** Shared package requirement per T05 §5. */
export interface ISharedPackageRequirement {
  readonly packageName: RequiredSharedPackage;
  readonly requiredUse: string;
}

// -- Prohibited Local Substitute (T05 §5.1) -----------------------------------

/** What must not be built locally per T05 §5.1. */
export interface IProhibitedLocalSubstituteDef {
  readonly substitute: ProhibitedLocalSubstitute;
  readonly description: string;
}
