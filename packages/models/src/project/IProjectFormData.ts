/**
 * Form input shape for creating or editing a project.
 *
 * Mirrors the writable fields of {@link IActiveProject}.
 */
export interface IProjectFormData {
  /** Project display name. */
  name: string;
  /** Project number / code. */
  number: string;
  /** Current project status. */
  status: string;
  /** ISO-8601 project start date. */
  startDate: string;
  /** ISO-8601 project end date. */
  endDate: string;
}
