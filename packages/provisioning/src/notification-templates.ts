/**
 * W0-G1-T03: Provisioning notification templates keyed by event type string.
 * Enables lookup via PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.completed'].
 * Traceability: docs/reference/provisioning/notification-event-matrix.md
 */

export const PROVISIONING_NOTIFICATION_TEMPLATES = {
  'provisioning.request-submitted': (projectName: string, requestId: string) => ({
    subject: `New Project Setup Request: "${projectName}"`,
    body: `A new Project Setup Request for "${projectName}" has been submitted and is awaiting your review.`,
    actionUrl: `/accounting/requests/${requestId}`,
    actionLabel: 'Review Request',
  }),

  'provisioning.clarification-requested': (projectName: string, note: string, requestId: string) => ({
    subject: `Action Required: Clarification needed for "${projectName}" Project Setup Request`,
    body: `The Controller has reviewed your Project Setup Request for "${projectName}" and requires additional information before proceeding.\n\nNote: ${note}\n\nPlease update your request in the Estimating app.`,
    actionUrl: `/estimating/requests/${requestId}`,
    actionLabel: 'Update Request',
  }),

  'provisioning.ready-to-provision': (projectName: string, requestId: string) => ({
    subject: `Project Setup Ready: "${projectName}" is ready for provisioning`,
    body: `The Project Setup Request for "${projectName}" has been reviewed and is ready for you to complete external setup and trigger provisioning in the Accounting app.`,
    actionUrl: `/accounting/requests/${requestId}`,
    actionLabel: 'Start Provisioning',
  }),

  'provisioning.started': (projectNumber: string, projectName: string, requestId: string) => ({
    subject: `Provisioning Started: ${projectNumber} - ${projectName}`,
    body: `The SharePoint Project Site for ${projectNumber} - ${projectName} is being created! We will let you know the moment it is ready for use.`,
    actionUrl: `/accounting/provisioning/${requestId}`,
    actionLabel: 'View Progress',
  }),

  'provisioning.first-failure': (projectNumber: string, projectName: string) => ({
    subject: `Provisioning Failed: ${projectNumber} - ${projectName}`,
    body: `The provisioning of ${projectNumber} - ${projectName}'s SharePoint site has failed on the first attempt. Please check the Admin dashboard for details and retry.`,
    actionUrl: `/admin/provisioning`,
    actionLabel: 'View Details',
  }),

  'provisioning.second-failure-escalated': (projectNumber: string, projectName: string) => ({
    subject: `ESCALATION: Provisioning Failed Again — ${projectNumber} - ${projectName}`,
    body: `The provisioning of ${projectNumber} - ${projectName}'s SharePoint site has failed a second time and requires admin intervention. This issue has been escalated.`,
    actionUrl: `/admin/provisioning`,
    actionLabel: 'Investigate',
  }),

  'provisioning.completed': (projectNumber: string, projectName: string, siteUrl: string) => ({
    subject: `Site Ready: ${projectNumber} - ${projectName}`,
    body: `${projectNumber} - ${projectName}'s SharePoint Site is up and running! Let's get to work!`,
    actionUrl: siteUrl,
    actionLabel: 'Open Site',
  }),

  'provisioning.recovery-resolved': (projectNumber: string, projectName: string, siteUrl: string) => ({
    subject: `Recovery Complete: ${projectNumber} - ${projectName}`,
    body: `The previously failed provisioning for ${projectNumber} - ${projectName} has been successfully recovered. The SharePoint site is now ready.`,
    actionUrl: siteUrl,
    actionLabel: 'Open Site',
  }),
} as const;
