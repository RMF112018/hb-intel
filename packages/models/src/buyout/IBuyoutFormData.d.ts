/**
 * Form input shape for creating or editing a buyout entry.
 */
export interface IBuyoutEntryFormData {
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
//# sourceMappingURL=IBuyoutFormData.d.ts.map