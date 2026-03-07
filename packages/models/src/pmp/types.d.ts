/**
 * PMP-specific type aliases.
 *
 * @module pmp/types
 */
/** Unique PMP identifier. */
export type PmpId = number;
/** Unique PMP signature identifier. */
export type PmpSignatureId = number;
/** Search criteria for PMP list queries. */
export type PmpSearchCriteria = {
    /** Filter by PMP status. */
    status?: string;
    /** Filter by project identifier. */
    projectId?: string;
};
//# sourceMappingURL=types.d.ts.map