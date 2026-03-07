import type { AccessControlAdminQuery, AccessControlAdminRepository, AccessControlAdminSnapshot, AccessControlOverrideRecord, AccessControlUserLookupRecord, BaseRoleDefinition } from '../types.js';
/**
 * Shared snapshot projection builder for Phase 5.11 admin surfaces.
 */
export declare function buildAccessControlAdminSnapshot(params: {
    query?: AccessControlAdminQuery;
    users: AccessControlUserLookupRecord[];
    roles: BaseRoleDefinition[];
    overrides: AccessControlOverrideRecord[];
    audits: AccessControlAdminSnapshot['auditEvents'];
}): AccessControlAdminSnapshot;
/**
 * Minimal repository helper for consumers that need a one-call snapshot payload.
 */
export declare function getAccessControlAdminSnapshot(repository: AccessControlAdminRepository, query?: AccessControlAdminQuery): Promise<AccessControlAdminSnapshot>;
//# sourceMappingURL=repository.d.ts.map