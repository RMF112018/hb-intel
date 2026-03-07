/**
 * D-PH6-09 notification templates used across lifecycle and provisioning updates.
 * Traceability: docs/architecture/plans/PH6.9-Provisioning-Package.md §6.9.5
 */
export const NOTIFICATION_TEMPLATES = {
    NeedsClarification: (projectName, note) => ({
        subject: `Action Required: Clarification needed for "${projectName}" Project Setup Request`,
        body: `The Controller has reviewed your Project Setup Request for "${projectName}" and requires additional information before proceeding.\n\nNote: ${note}\n\nPlease update your request in the Estimating app.`,
    }),
    ReadyToProvision: (projectName) => ({
        subject: `Project Setup Ready: "${projectName}" is ready for provisioning`,
        body: `The Project Setup Request for "${projectName}" has been reviewed and is ready for you to complete external setup and trigger provisioning in the Accounting app.`,
    }),
    ProvisioningStarted: (projectNumber, projectName) => ({
        body: `The SharePoint Project Site for ${projectNumber} - ${projectName} is being created! We will let you know the moment it is ready for use.`,
    }),
    ProvisioningCompleted: (projectNumber, projectName) => ({
        body: `${projectNumber} - ${projectName}'s SharePoint Site is up and running! Let's get to work!`,
    }),
    ProvisioningFailed: (projectNumber, projectName) => ({
        subject: `Provisioning Failed: ${projectNumber} - ${projectName}`,
        body: `The provisioning of ${projectNumber} - ${projectName}'s SharePoint site has failed. Please check the Admin dashboard for details and retry or escalate.`,
    }),
};
//# sourceMappingURL=notification-templates.js.map