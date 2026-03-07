/**
 * Minimal request-access payload for Phase 5 admin review queue submission.
 */
export interface RequestAccessSubmission {
    targetPath: string;
    reason: string;
    requestedAt: string;
}
/**
 * Lightweight submission result contract.
 */
export interface RequestAccessSubmissionResult {
    success: boolean;
    reviewQueueId?: string;
    message?: string;
}
/**
 * Submission seam for queue integration.
 */
export type AccessRequestSubmitter = (request: RequestAccessSubmission) => Promise<RequestAccessSubmissionResult> | RequestAccessSubmissionResult;
//# sourceMappingURL=requestAccess.d.ts.map