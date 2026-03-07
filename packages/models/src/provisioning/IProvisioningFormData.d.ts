/**
 * Form input shape for initiating a site provisioning request.
 *
 * A form-oriented version of {@link IProvisionSiteRequest}
 * suitable for use with React Hook Form.
 */
export interface IProvisionSiteFormData {
    /** Immutable auto-generated project identifier (UUID v4). */
    projectId: string;
    /** Human-assigned project number. */
    projectNumber: string;
    /** Project display name. */
    projectName: string;
    /** SharePoint site template identifier. */
    templateId?: string;
    /** Hub site URL for association. */
    hubSiteUrl?: string;
}
//# sourceMappingURL=IProvisioningFormData.d.ts.map