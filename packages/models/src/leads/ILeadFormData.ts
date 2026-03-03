import type { LeadStage } from './LeadEnums.js';

/**
 * Form input shape for creating or editing a lead.
 *
 * Mirrors the writable fields of {@link ILead}; omits server-generated fields
 * like `id`, `createdAt`, and `updatedAt`.
 */
export interface ILeadFormData {
  /** Descriptive title for the lead / opportunity. */
  title: string;
  /** Current pipeline stage. */
  stage: LeadStage;
  /** Name of the prospective client. */
  clientName: string;
  /** Estimated contract value in USD. */
  estimatedValue: number;
}
