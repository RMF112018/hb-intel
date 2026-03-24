/**
 * P3-E8-T07 Compliance and qualification constants.
 * Expiration thresholds, topic definitions, work queue triggers.
 */

import type { AcknowledgmentMethod } from '../records/enums.js';
import type {
  IOrientationTopicDefinition,
  IOrientationWorkQueueTrigger,
  ICertificationWorkQueueTrigger,
} from './types.js';

// -- Expiration Thresholds (§3) ---------------------------------------------

export const EXPIRING_SOON_THRESHOLD_DAYS = 30;

// -- Orientation Escalation (§1) --------------------------------------------

export const ORIENTATION_PENDING_ESCALATION_DAYS = 2;

// -- Acknowledgment Evidence Requirements (§1) ------------------------------

/** Acknowledgment methods that require linked evidence record. */
export const REQUIRED_EVIDENCE_METHODS: readonly AcknowledgmentMethod[] = [
  'PHYSICAL_SIGNATURE',
];

// -- Default Orientation Topic Definitions (§1.2) ---------------------------

export const ORIENTATION_TOPIC_DEFINITIONS: ReadonlyArray<IOrientationTopicDefinition> = [
  { topicKey: 'SITE_HAZARDS', topicName: 'Site Hazards', isRequired: true, regulatoryRef: 'OSHA 29 CFR 1926.21(b)(2)' },
  { topicKey: 'EMERGENCY_PROCEDURES', topicName: 'Emergency Procedures', isRequired: true, regulatoryRef: 'OSHA 29 CFR 1926.35' },
  { topicKey: 'PPE_REQUIREMENTS', topicName: 'PPE Requirements', isRequired: true, regulatoryRef: 'OSHA 29 CFR 1926.28' },
  { topicKey: 'INCIDENT_REPORTING', topicName: 'Incident Reporting', isRequired: true, regulatoryRef: 'OSHA 29 CFR 1904' },
  { topicKey: 'SSSP_OVERVIEW', topicName: 'SSSP Overview', isRequired: true, regulatoryRef: null },
  { topicKey: 'SUBSTANCE_ABUSE_POLICY', topicName: 'Substance Abuse Policy', isRequired: true, regulatoryRef: null },
  { topicKey: 'FALL_PROTECTION', topicName: 'Fall Protection', isRequired: false, regulatoryRef: 'OSHA 29 CFR 1926.501' },
  { topicKey: 'PROJECT_SPECIFIC_HAZARDS', topicName: 'Project-Specific Hazards', isRequired: false, regulatoryRef: null },
];

// -- Orientation Work Queue Triggers (§1) -----------------------------------

export const ORIENTATION_WORK_QUEUE_TRIGGERS: ReadonlyArray<IOrientationWorkQueueTrigger> = [
  {
    trigger: 'New subcontractor expected on site with no orientation records',
    workQueueItem: 'Orientate new subcontractor crew',
    priority: 'HIGH',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Worker on-site without completed orientation record',
    workQueueItem: 'Complete worker orientation',
    priority: 'HIGH',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Orientation PENDING_ACKNOWLEDGMENT > 2 days',
    workQueueItem: 'Follow up on orientation acknowledgment',
    priority: 'MEDIUM',
    assignee: 'Safety Manager',
  },
];

// -- Certification Work Queue Triggers (§3) ---------------------------------

export const CERTIFICATION_WORK_QUEUE_TRIGGERS: ReadonlyArray<ICertificationWorkQueueTrigger> = [
  {
    trigger: 'Certification EXPIRING_SOON, active project role requiring it',
    workQueueItem: 'Renew certification before expiration',
    priority: 'HIGH',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Certification EXPIRED, worker has active competent-person designation requiring it',
    workQueueItem: 'Certification expired for competent-person role',
    priority: 'CRITICAL',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Certification EXPIRED, required for current scope',
    workQueueItem: 'Worker certification expired',
    priority: 'HIGH',
    assignee: 'Safety Manager',
  },
];
