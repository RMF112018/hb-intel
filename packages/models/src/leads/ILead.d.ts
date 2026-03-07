import type { LeadStage } from './LeadEnums.js';
/**
 * A construction lead tracked through the business development pipeline.
 *
 * Leads progress through {@link LeadStage} from identification to award or decline.
 *
 * @example
 * ```ts
 * import { ILead, LeadStage } from '@hbc/models';
 * ```
 */
export interface ILead {
    /** Unique lead identifier. */
    id: number;
    /** Descriptive title for the lead / opportunity. */
    title: string;
    /** Current pipeline stage. */
    stage: LeadStage;
    /** Name of the prospective client. */
    clientName: string;
    /** Estimated contract value in USD. */
    estimatedValue: number;
    /** ISO-8601 timestamp when the lead was created. */
    createdAt: string;
    /** ISO-8601 timestamp when the lead was last updated. */
    updatedAt: string;
}
//# sourceMappingURL=ILead.d.ts.map