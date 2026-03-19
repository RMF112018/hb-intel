import { z } from 'zod';

/**
 * P1-C2 Task 5: Shared pagination query schema.
 * Defaults: page=1, pageSize=25 (D4 lock). Max pageSize=100.
 * Uses coercion for query string → number conversion.
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
  search: z.string().optional(),
});
