/**
 * A risk cost item representing a potential financial exposure.
 *
 * @example
 * ```ts
 * import type { IRiskCostItem } from '@hbc/models';
 * ```
 */
export interface IRiskCostItem {
  /** Unique risk item identifier. */
  id: number;
  /** Associated project identifier. */
  projectId: string;
  /** Description of the risk. */
  description: string;
  /** Risk category (e.g. safety, financial, schedule). */
  category: string;
  /** Estimated financial impact in USD. */
  estimatedImpact: number;
  /** Probability of occurrence (0–1). */
  probability: number;
  /** Current risk status. */
  status: string;
}

/**
 * Aggregate risk cost management view for a project.
 */
export interface IRiskCostManagement {
  /** Associated project identifier. */
  projectId: string;
  /** Total risk exposure in USD (sum of impact × probability). */
  totalExposure: number;
  /** Amount of risk that has been mitigated in USD. */
  mitigatedAmount: number;
  /** Contingency budget allocated in USD. */
  contingencyBudget: number;
  /** Individual risk cost items. */
  items: IRiskCostItem[];
}
