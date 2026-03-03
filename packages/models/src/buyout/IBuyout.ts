/**
 * A single buyout line item representing a committed cost code.
 *
 * @example
 * ```ts
 * import type { IBuyoutEntry } from '@hbc/models';
 * ```
 */
export interface IBuyoutEntry {
  /** Unique buyout entry identifier. */
  id: number;
  /** Associated project identifier. */
  projectId: string;
  /** Cost code for this line item. */
  costCode: string;
  /** Description of the scope / trade. */
  description: string;
  /** Original budget amount in USD. */
  budgetAmount: number;
  /** Committed (contracted) amount in USD. */
  committedAmount: number;
  /** Current buyout status. */
  status: string;
}

/**
 * Aggregate buyout summary for a project.
 */
export interface IBuyoutSummary {
  /** Associated project identifier. */
  projectId: string;
  /** Total budget across all cost codes in USD. */
  totalBudget: number;
  /** Total committed amount in USD. */
  totalCommitted: number;
  /** Remaining un-committed budget in USD. */
  totalRemaining: number;
  /** Percentage of the budget that has been bought out (0–100). */
  percentBoughtOut: number;
}
