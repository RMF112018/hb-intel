/** BD publish adapter — SF25-T07. */
import type { IPublishModuleRegistration } from '@hbc/publish-workflow';

export const BD_PUBLISH_MODULE_KEY = 'business-development';

export const bdPublishRegistration: IPublishModuleRegistration = {
  moduleKey: BD_PUBLISH_MODULE_KEY,
  displayName: 'Business Development',
  defaultTargets: [{ targetId: 'sp-reports', targetType: 'sharepoint', label: 'SharePoint Reports Library', recipientScope: 'project-team' }],
  approvalRules: [{ ruleId: 'pm-approval', label: 'PM Approval', required: true, approverRole: 'Project Manager', deadlineHours: 48, escalationUpn: null }],
  supportsSupersession: true,
  supportsRevocation: true,
};
