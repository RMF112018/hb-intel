import type { AccessControlAdminAuditVisibility, AccessControlAdminQuery, AccessControlAdminRepository, AccessControlAdminSnapshot, AccessControlAuditEventRecord } from '../types.js';
/**
 * Load a full admin snapshot from the configured repository.
 */
export declare function loadAdminAccessControlSnapshot(repository: AccessControlAdminRepository, query?: AccessControlAdminQuery): Promise<AccessControlAdminSnapshot>;
/**
 * Utility for normalizing section search input into repository query shape.
 */
export declare function toAdminSearchQuery(searchTerm: string): AccessControlAdminQuery | undefined;
/**
 * Hook that owns async loading + refresh for minimal admin UX.
 */
export declare function useAdminAccessControlData(params?: {
    repository?: AccessControlAdminRepository;
    searchTerm?: string;
}): {
    snapshot: AccessControlAdminSnapshot | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    auditVisibility: AccessControlAdminAuditVisibility;
};
/**
 * Build Phase 5.13 operational audit visibility from current admin snapshot
 * plus centralized auth/workflow audit stream entries.
 */
export declare function toAdminAuditOperationalVisibility(auditEvents?: AccessControlAuditEventRecord[]): AccessControlAdminAuditVisibility;
//# sourceMappingURL=hooks.d.ts.map