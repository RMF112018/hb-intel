/**
 * Form input shape for initiating a site provisioning request.
 *
 * A form-oriented version of {@link IProvisionSiteRequest}
 * suitable for use with React Hook Form.
 */
export interface IProvisionSiteFormData {
  /** Project code identifier. */
  projectCode: string;
  /** Project display name. */
  projectName: string;
  /** SharePoint site template identifier. */
  templateId?: string;
  /** Hub site URL for association. */
  hubSiteUrl?: string;
}
