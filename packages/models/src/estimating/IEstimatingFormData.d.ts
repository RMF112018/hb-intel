/**
 * Form input shape for creating or editing an estimating tracker entry.
 */
export interface IEstimatingTrackerFormData {
    /** Associated project identifier. */
    projectId: string;
    /** Bid / proposal number. */
    bidNumber: string;
    /** Current status of the estimate. */
    status: string;
    /** ISO-8601 due date for the estimate. */
    dueDate: string;
}
/**
 * Form input shape for creating an estimating kickoff record.
 */
export interface IEstimatingKickoffFormData {
    /** Associated project identifier. */
    projectId: string;
    /** ISO-8601 kickoff meeting date. */
    kickoffDate: string;
    /** List of attendee names. */
    attendees: string[];
    /** Meeting notes / action items. */
    notes: string;
}
//# sourceMappingURL=IEstimatingFormData.d.ts.map