import { z } from 'zod';

/**
 * P1-C2 Task 5: Lead validation schemas.
 * Derived from `ILeadFormData` (packages/models/src/leads/ILeadFormData.ts)
 * and `LeadStage` enum (packages/models/src/leads/LeadEnums.ts).
 */

/** LeadStage enum values from @hbc/models. */
const LEAD_STAGES = [
  'Identified',
  'Qualifying',
  'BidDecision',
  'Bidding',
  'Awarded',
  'Lost',
  'Declined',
] as const;

export const CreateLeadSchema = z.object({
  title: z.string().min(1).max(255),
  stage: z.enum(LEAD_STAGES),
  clientName: z.string().min(1).max(255),
  estimatedValue: z.number().nonnegative(),
});

export const UpdateLeadSchema = CreateLeadSchema.partial();
