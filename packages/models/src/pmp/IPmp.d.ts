/**
 * A Project Management Plan (PMP) document.
 *
 * @example
 * ```ts
 * import type { IProjectManagementPlan } from '@hbc/models';
 * ```
 */
export interface IProjectManagementPlan {
    /** Unique PMP identifier. */
    id: number;
    /** Associated project identifier. */
    projectId: string;
    /** Document version number. */
    version: number;
    /** Current PMP status. */
    status: string;
    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-updated timestamp. */
    updatedAt: string;
}
/**
 * A signature record for PMP approval.
 */
export interface IPMPSignature {
    /** Unique signature identifier. */
    id: number;
    /** PMP being signed. */
    pmpId: number;
    /** Name of the signer. */
    signerName: string;
    /** Role of the signer (e.g. "Project Manager", "Owner"). */
    role: string;
    /** ISO-8601 timestamp when the signature was applied. */
    signedAt: string;
    /** Signature status. */
    status: string;
}
//# sourceMappingURL=IPmp.d.ts.map