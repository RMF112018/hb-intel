/**
 * PCC fixture barrel.
 *
 * Deterministic, non-secret sample data for local development and tests.
 * Phase 3 / Wave 1 / Prompt 06.
 */

export {
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_PROJECT_PROFILE_PRECONSTRUCTION,
  SAMPLE_PROJECT_PROFILES,
} from './projectProfile.js';

export { SAMPLE_PRIORITY_ACTIONS } from './priorityActions.js';

export {
  SAMPLE_WORKFLOW_ITEMS,
  SAMPLE_WORKFLOW_ITEM_ASSIGNMENTS,
  SAMPLE_WORKFLOW_ITEM_ASSIGNMENT_HISTORY,
  SAMPLE_WORKFLOW_ITEM_TRANSITIONS,
} from './workflow.js';

export {
  SAMPLE_APPROVAL_CHECKPOINTS,
  SAMPLE_REVIEWER_ACTIONS,
} from './approvals.js';

export { SAMPLE_BUSINESS_AUDIT_EVENTS } from './audit.js';

export {
  SAMPLE_COMMENTS,
  SAMPLE_COMMENT_HISTORY,
} from './comments.js';

export {
  SAMPLE_EXTERNAL_SYSTEM_LINKS,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_LAUNCH_LINKS,
  SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS,
} from './integrations.js';

export {
  SAMPLE_TEAM_ACCESS_MEMBERS,
  SAMPLE_TEAM_ACCESS_VIEWER_LANE,
  SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE,
  SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE,
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
} from './TeamAccessFixtures.js';

export {
  SAMPLE_SITE_HEALTH_CHECKS,
  SAMPLE_DRIFT_INDICATORS,
  SAMPLE_SITE_HEALTH_SUMMARY,
  SAMPLE_REPAIR_REQUESTS,
} from './siteHealth.js';

import { SAMPLE_PROJECT_PROFILES } from './projectProfile.js';
import { SAMPLE_PRIORITY_ACTIONS } from './priorityActions.js';
import {
  SAMPLE_WORKFLOW_ITEMS,
  SAMPLE_WORKFLOW_ITEM_ASSIGNMENTS,
  SAMPLE_WORKFLOW_ITEM_ASSIGNMENT_HISTORY,
  SAMPLE_WORKFLOW_ITEM_TRANSITIONS,
} from './workflow.js';
import {
  SAMPLE_APPROVAL_CHECKPOINTS,
  SAMPLE_REVIEWER_ACTIONS,
} from './approvals.js';
import { SAMPLE_BUSINESS_AUDIT_EVENTS } from './audit.js';
import {
  SAMPLE_COMMENTS,
  SAMPLE_COMMENT_HISTORY,
} from './comments.js';
import {
  SAMPLE_EXTERNAL_SYSTEM_LINKS,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_LAUNCH_LINKS,
  SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS,
} from './integrations.js';
import {
  SAMPLE_TEAM_ACCESS_MEMBERS,
  SAMPLE_TEAM_ACCESS_VIEWER_LANE,
  SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE,
  SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE,
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
} from './TeamAccessFixtures.js';
import {
  SAMPLE_SITE_HEALTH_CHECKS,
  SAMPLE_DRIFT_INDICATORS,
  SAMPLE_SITE_HEALTH_SUMMARY,
  SAMPLE_REPAIR_REQUESTS,
} from './siteHealth.js';

/**
 * Aggregate map of all PCC fixtures, grouped by domain. Useful for
 * scaffolding tests and dev surfaces.
 */
export const PCC_FIXTURES = {
  projectProfiles: SAMPLE_PROJECT_PROFILES,
  priorityActions: SAMPLE_PRIORITY_ACTIONS,
  workflow: {
    items: SAMPLE_WORKFLOW_ITEMS,
    assignments: SAMPLE_WORKFLOW_ITEM_ASSIGNMENTS,
    assignmentHistory: SAMPLE_WORKFLOW_ITEM_ASSIGNMENT_HISTORY,
    transitions: SAMPLE_WORKFLOW_ITEM_TRANSITIONS,
  },
  approvals: {
    checkpoints: SAMPLE_APPROVAL_CHECKPOINTS,
    reviewerActions: SAMPLE_REVIEWER_ACTIONS,
  },
  audit: {
    events: SAMPLE_BUSINESS_AUDIT_EVENTS,
  },
  comments: {
    comments: SAMPLE_COMMENTS,
    history: SAMPLE_COMMENT_HISTORY,
  },
  integrations: {
    externalSystemLinks: SAMPLE_EXTERNAL_SYSTEM_LINKS,
    missingConfigs: SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
    launchLinks: SAMPLE_LAUNCH_LINKS,
    documentControlSourceIds: SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS,
  },
  teamAccess: {
    members: SAMPLE_TEAM_ACCESS_MEMBERS,
    teamViewerLane: SAMPLE_TEAM_ACCESS_VIEWER_LANE,
    permissionRequestLane: SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE,
    accessManagerLane: SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE,
    previewModel: SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
  },
  siteHealth: {
    checks: SAMPLE_SITE_HEALTH_CHECKS,
    driftIndicators: SAMPLE_DRIFT_INDICATORS,
    summary: SAMPLE_SITE_HEALTH_SUMMARY,
    repairRequests: SAMPLE_REPAIR_REQUESTS,
  },
} as const;
