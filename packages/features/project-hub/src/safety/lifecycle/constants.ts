/**
 * P3-E8-T03 SSSP lifecycle governance constants.
 * Section classification, approval rules, work queue triggers.
 */

import type { SSSPSectionKey } from '../records/enums.js';
import type { SSSPApproverRole, ISSSPRenderedDocumentConfig, ISSSPWorkQueueTrigger } from './types.js';

// -- Module Scope -----------------------------------------------------------

export const SSSP_LIFECYCLE_SCOPE = 'safety/lifecycle' as const;

// -- Section Classification (§2.1–2.2) -------------------------------------

/** §2.1: Governed sections — Safety Manager only, read-only for project teams. */
export const GOVERNED_SECTION_KEYS: readonly SSSPSectionKey[] = [
  'HAZARD_IDENTIFICATION',
  'EMERGENCY_RESPONSE',
  'SAFETY_PROGRAM_STANDARDS',
  'REGULATORY_CITATIONS',
  'COMPETENT_PERSON_REQUIREMENTS',
  'SUBCONTRACTOR_COMPLIANCE',
  'INCIDENT_REPORTING',
];

/** §2.2: Instance sections — project team editable. */
export const INSTANCE_SECTION_KEYS: readonly SSSPSectionKey[] = [
  'PROJECT_CONTACTS',
  'SUBCONTRACTOR_LIST',
  'PROJECT_LOCATION',
  'EMERGENCY_ASSEMBLY',
  'ORIENTATION_SCHEDULE',
];

/**
 * §4.3: Sections whose modification constitutes a material change,
 * requiring full base plan reapproval (new version) rather than an addendum.
 */
export const MATERIAL_CHANGE_SECTION_KEYS: readonly SSSPSectionKey[] = [
  'HAZARD_IDENTIFICATION',
  'EMERGENCY_RESPONSE',
  'SAFETY_PROGRAM_STANDARDS',
  'REGULATORY_CITATIONS',
  'COMPETENT_PERSON_REQUIREMENTS',
  'SUBCONTRACTOR_COMPLIANCE',
  'INCIDENT_REPORTING',
];

// -- Approval Rules (§3.1–3.2) ----------------------------------------------

export const SSSP_APPROVER_ROLES = [
  'SAFETY_MANAGER', 'PM', 'SUPERINTENDENT',
] as const satisfies ReadonlyArray<SSSPApproverRole>;

/** §3.1: Base plan requires all three approvers. */
export const BASE_PLAN_REQUIRED_APPROVERS: readonly SSSPApproverRole[] = [
  'SAFETY_MANAGER', 'PM', 'SUPERINTENDENT',
];

/** §3.2: Addendum always requires Safety Manager. PM/Super only when operationallyAffected. */
export const ADDENDUM_ALWAYS_REQUIRED_APPROVERS: readonly SSSPApproverRole[] = [
  'SAFETY_MANAGER',
];

export const ADDENDUM_OPERATIONALLY_AFFECTED_APPROVERS: readonly SSSPApproverRole[] = [
  'SAFETY_MANAGER', 'PM', 'SUPERINTENDENT',
];

// -- Rendered Document Config (§5.3) -----------------------------------------

export const SSSP_RENDERED_DOCUMENT_CONFIG: Readonly<ISSSPRenderedDocumentConfig> = {
  sourceRecordType: 'GENERAL',
  sensitivityTier: 'STANDARD',
  retentionCategory: 'EXTENDED_REGULATORY',
};

// -- Work Queue Triggers (§6) -----------------------------------------------

export const SSSP_WORK_QUEUE_TRIGGERS: ReadonlyArray<ISSSPWorkQueueTrigger> = [
  {
    trigger: 'Base plan in DRAFT, no approval started, project mobilizing',
    workQueueItem: 'Draft SSSP for approval',
    priority: 'HIGH',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Base plan in PENDING_APPROVAL, specific approver not yet signed',
    workQueueItem: 'Sign SSSP for Project [X]',
    priority: 'HIGH',
    assignee: 'Unsigned approver',
  },
  {
    trigger: 'Addendum in PENDING_APPROVAL, specific approver not yet signed',
    workQueueItem: 'Approve safety addendum for [X]',
    priority: 'MEDIUM',
    assignee: 'Unsigned approver',
  },
  {
    trigger: 'Approved SSSP >365 days old without review',
    workQueueItem: 'Review SSSP currency',
    priority: 'MEDIUM',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Project has no SSSP record',
    workQueueItem: 'Create SSSP',
    priority: 'CRITICAL',
    assignee: 'Safety Manager',
  },
];
