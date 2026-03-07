import type { ReactNode } from 'react';
import type { AccessRequestSubmitter, RequestAccessSubmission } from './requestAccess.js';
/**
 * UI contract for structured access-denied responses.
 */
export interface AccessDeniedProps {
    title?: string;
    message?: string;
    onGoHome?: (() => void) | null;
    onGoBack?: (() => void) | null;
    onRequestAccess?: (() => void) | null;
    homeLabel?: string;
    backLabel?: string;
    requestAccessLabel?: string;
    onSubmitAccessRequest?: AccessRequestSubmitter;
    requestAccessSeed?: Omit<RequestAccessSubmission, 'requestedAt'>;
}
/**
 * Action model used by tests and downstream wrappers to verify CTA behavior.
 */
export interface AccessDeniedActionModel {
    showGoHome: boolean;
    showGoBack: boolean;
    showRequestAccess: boolean;
    showSubmitRequestAccess: boolean;
}
/**
 * Build deterministic action visibility for structured access-denied UX.
 */
export declare function buildAccessDeniedActionModel(props: Pick<AccessDeniedProps, 'onGoHome' | 'onGoBack' | 'onRequestAccess' | 'onSubmitAccessRequest'>): AccessDeniedActionModel;
/**
 * Structured access-denied experience required by Phase 5.4.
 *
 * Alignment notes:
 * - Plain-language explanation
 * - Safe navigation options
 * - Optional request-access entry point
 */
export declare function AccessDenied({ title, message, onGoHome, onGoBack, onRequestAccess, homeLabel, backLabel, requestAccessLabel, onSubmitAccessRequest, requestAccessSeed, }: AccessDeniedProps): ReactNode;
//# sourceMappingURL=AccessDenied.d.ts.map