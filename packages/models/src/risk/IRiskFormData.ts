/**
 * Form input shape for creating or editing a risk cost item.
 */
export interface IRiskCostItemFormData {
  /** Associated project identifier. */
  projectId: string;
  /** Description of the risk. */
  description: string;
  /** Risk category. */
  category: string;
  /** Estimated financial impact in USD. */
  estimatedImpact: number;
  /** Probability of occurrence (0–1). */
  probability: number;
  /** Current risk status. */
  status: string;
}
