/**
 * W0-G1-T03 + W0-G3-T04: Provisioning notification templates keyed by event type string.
 * 15 template factories (8 from G1-T03, 7 added by G3-T04).
 * Enables lookup via PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.completed'].
 * Traceability: docs/reference/workflow-experience/setup-notification-registrations.md
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

  // ─── G3-T04 additions (7 new templates) ─────────────────────────────────
  'provisioning.clarification-responded': (projectName: string, requesterName: string, requestId: string) => ({
    subject: `Clarification Response Received: "${projectName}"`,
    body: `${requesterName} has responded to the clarification request for "${projectName}". Complete your review and approve or request clarification.`,
    actionUrl: `/accounting/requests/${requestId}`,
    actionLabel: 'Review Response',
  }),

  'provisioning.request-approved': (projectName: string, requestId: string) => ({
    subject: `Request Approved: "${projectName}"`,
    body: `Your Project Setup Request for "${projectName}" has been approved. Site provisioning is queued.`,
    actionUrl: `/estimating/requests/${requestId}`,
    actionLabel: 'View Request',
  }),

  'provisioning.step-completed': (projectNumber: string, projectName: string, stepName: string, requestId: string) => ({
    subject: `Step Completed: ${projectNumber} - ${projectName}`,
    body: `The "${stepName}" provisioning step for ${projectNumber} - ${projectName} has been completed. Site provisioning is in progress.`,
    actionUrl: `/accounting/provisioning/${requestId}`,
    actionLabel: 'View Progress',
  }),

  'provisioning.handoff-received': (projectName: string, senderName: string, handoffId: string) => ({
    subject: `Action Required: Handoff Received for "${projectName}"`,
    body: `${senderName} has assigned a workflow handoff to you for "${projectName}". Please review and acknowledge or reject.`,
    actionUrl: `/workflow/handoffs/${handoffId}`,
    actionLabel: 'Review Handoff',
  }),

  'provisioning.handoff-acknowledged': (projectName: string, recipientName: string, handoffId: string) => ({
    subject: `Handoff Acknowledged: "${projectName}"`,
    body: `${recipientName} has acknowledged your workflow handoff for "${projectName}".`,
    actionUrl: `/workflow/handoffs/${handoffId}`,
    actionLabel: 'View Handoff',
  }),

  'provisioning.handoff-rejected': (projectName: string, recipientName: string, reason: string, handoffId: string) => ({
    subject: `Handoff Rejected: "${projectName}"`,
    body: `${recipientName} has rejected your workflow handoff for "${projectName}".\n\nReason: ${reason}\n\nPlease reassign or resolve this handoff.`,
    actionUrl: `/workflow/handoffs/${handoffId}`,
    actionLabel: 'Resolve Handoff',
  }),

  'provisioning.site-access-ready': (projectNumber: string, projectName: string, siteUrl: string) => ({
    subject: `Site Access Ready: ${projectNumber} - ${projectName}`,
    body: `Site access permissions for ${projectNumber} - ${projectName} have been configured. Review your provisioned project site and complete the getting-started steps.`,
    actionUrl: siteUrl,
    actionLabel: 'Open Site',
  }),
} as const;
