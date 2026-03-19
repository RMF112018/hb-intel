import { z } from 'zod';

/**
 * P1-C2 Task 5: Estimating validation schemas.
 * Derived from:
 * - `IEstimatingTrackerFormData` (packages/models/src/estimating/IEstimatingFormData.ts)
 * - `IEstimatingKickoffFormData` (same file)
 * - `EstimatingStatus` enum (packages/models/src/estimating/EstimatingEnums.ts)
 */

/** EstimatingStatus enum values from @hbc/models. */
const ESTIMATING_STATUSES = [
  'Draft',
  'InProgress',
  'Submitted',
  'Awarded',
  'Lost',
] as const;

export const CreateTrackerSchema = z.object({
  projectId: z.string().uuid(),
  bidNumber: z.string().min(1),
  status: z.enum(ESTIMATING_STATUSES),
  dueDate: z.string().datetime(),
});

export const UpdateTrackerSchema = CreateTrackerSchema.partial();

export const CreateKickoffSchema = z.object({
  projectId: z.string().uuid(),
  kickoffDate: z.string().datetime(),
  attendees: z.array(z.string().min(1)).min(1),
  notes: z.string(),
});
