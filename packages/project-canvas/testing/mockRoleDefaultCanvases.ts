/**
 * mockRoleDefaultCanvases — D-SF13-T01, D-10 (testing sub-path)
 *
 * Default tile key arrays for each of the 6 core roles, matching PH7-SF-13 spec exactly.
 */

export const mockRoleDefaultCanvases: Record<string, string[]> = {
  'Superintendent': [
    'bic-my-items',
    'active-constraints',
    'weather-impact',
    'document-activity',
    'safety-observations',
    'daily-report-status',
  ],
  'Project Manager': [
    'bic-my-items',
    'project-health-pulse',
    'pending-approvals',
    'active-constraints',
    'bd-heritage',
    'workflow-handoff-inbox',
  ],
  'Project Engineer': [
    'bic-my-items',
    'active-constraints',
    'permit-status',
    'document-activity',
  ],
  'Chief Estimator': [
    'bic-my-items',
    'estimating-pursuit',
    'bd-heritage',
    'workflow-handoff-inbox',
  ],
  'VP of Operations': [
    'project-health-pulse',
    'bic-my-items',
    'pending-approvals',
    'notification-summary',
  ],
  'Director of Preconstruction': [
    'bic-my-items',
    'workflow-handoff-inbox',
    'pending-approvals',
    'bd-heritage',
  ],
};
