/**
 * Form input shape for creating or editing a compliance entry.
 */
export interface IComplianceEntryFormData {
    /** Associated project identifier. */
    projectId: string;
    /** Name of the vendor or subcontractor. */
    vendorName: string;
    /** Type of compliance requirement. */
    requirementType: string;
    /** Current compliance status. */
    status: string;
    /** ISO-8601 expiration date. */
    expirationDate: string;
}
//# sourceMappingURL=IComplianceFormData.d.ts.map