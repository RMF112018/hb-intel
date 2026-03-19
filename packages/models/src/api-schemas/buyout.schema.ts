import { z } from 'zod';
import type { IBuyoutEntry, IBuyoutSummary } from '../buyout/index.js';

export const BuyoutEntrySchema = z.object({
  id: z.number(),
  projectId: z.string(),
  costCode: z.string(),
  description: z.string(),
  budgetAmount: z.number(),
  committedAmount: z.number(),
  status: z.string(),
});

export const BuyoutSummarySchema = z.object({
  projectId: z.string(),
  totalBudget: z.number(),
  totalCommitted: z.number(),
  totalRemaining: z.number(),
  percentBoughtOut: z.number(),
});

type BuyoutEntry = z.infer<typeof BuyoutEntrySchema>;
type _EntryCheck = IBuyoutEntry extends BuyoutEntry ? (BuyoutEntry extends IBuyoutEntry ? true : never) : never;

type BuyoutSummary = z.infer<typeof BuyoutSummarySchema>;
type _SummaryCheck = IBuyoutSummary extends BuyoutSummary ? (BuyoutSummary extends IBuyoutSummary ? true : never) : never;
