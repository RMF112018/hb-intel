/**
 * P3-E8-T07 Orientation, submissions, qualifications, SDS, competent person types.
 * Topic definitions, certification status, designation cascade, work queue.
 */

import type { CertificationStatus, OrientationTopic } from '../records/enums.js';

// -- Orientation Topic Definition (§1.2) ------------------------------------

export interface IOrientationTopicDefinition {
  readonly topicKey: OrientationTopic;
  readonly topicName: string;
  readonly isRequired: boolean;
  readonly regulatoryRef: string | null;
}

// -- Certification Status Computation (§3) ----------------------------------

export interface ICertificationStatusResult {
  readonly status: CertificationStatus;
  readonly daysToExpiration: number | null;
}

// -- Designation Cascade (§5.4) ---------------------------------------------

export interface IDesignationCascadeResult {
  readonly designationExpired: boolean;
  readonly affectedJhaIds: readonly string[];
  readonly workQueueRequired: boolean;
}

// -- Work Queue Triggers (§1, §3) -------------------------------------------

export interface IOrientationWorkQueueTrigger {
  readonly trigger: string;
  readonly workQueueItem: string;
  readonly priority: string;
  readonly assignee: string;
}

export interface ICertificationWorkQueueTrigger {
  readonly trigger: string;
  readonly workQueueItem: string;
  readonly priority: string;
  readonly assignee: string;
}
