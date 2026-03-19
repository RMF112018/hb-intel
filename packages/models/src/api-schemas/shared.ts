import { z } from 'zod';

// ─── Error Envelope (D3 locked: message is primary field) ────────────────────

export const ErrorDetailSchema = z.object({
  field: z.string().optional(),
  message: z.string(),
});

export const ErrorEnvelopeSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  requestId: z.string().optional(),
  details: z.array(ErrorDetailSchema).optional(),
});

// ─── Pagination Query (D4 locked: default 25, max 100) ──────────────────────

export const PaginationQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(25),
});

// ─── Response Envelope Factories ─────────────────────────────────────────────

export function createPagedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  });
}

export function createItemResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: itemSchema,
  });
}

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
