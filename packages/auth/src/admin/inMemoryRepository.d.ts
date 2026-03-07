import type { AccessControlAdminRepository, AccessControlAuditEventRecord, AccessControlOverrideRecord, AccessControlUserLookupRecord, BaseRoleDefinition } from '../types.js';
interface InMemoryState {
    users: AccessControlUserLookupRecord[];
    roles: BaseRoleDefinition[];
    overrides: AccessControlOverrideRecord[];
    audits: AccessControlAuditEventRecord[];
}
/**
 * Build an in-memory repository implementation for Phase 5.11 admin workflows.
 *
 * This adapter intentionally models backend contracts without replacing the
 * richer app-owned backend/rules layer from Phase 5.10.
 */
export declare function createInMemoryAccessControlAdminRepository(seed?: Partial<InMemoryState>): AccessControlAdminRepository;
/**
 * Shared singleton repository for app shells that need a ready-to-use adapter.
 */
export declare const defaultAccessControlAdminRepository: AccessControlAdminRepository;
export {};
//# sourceMappingURL=inMemoryRepository.d.ts.map