/**
 * Mutation gate primitive for the Phase 2 provisioning manifest.
 *
 * The literal-true / literal-false types make it a compile-time error to
 * construct a manifest where live tenant mutation is allowed without
 * widening the type. Runtime validation in ./validation enforces the
 * same invariants for inputs typed as `unknown`.
 *
 * Approval fields are intentionally optional and unset in scaffold
 * outputs; they are only populated by a later operator-driven step that
 * flips `liveMutationAllowed` separately and never inside this package.
 */
export interface MutationGate {
  readonly mutationLocked: true;
  readonly liveMutationAllowed: false;
  readonly requiresHumanApproval: true;
  readonly approvedBy?: string;
  readonly approvedAt?: string;
  readonly approvalRef?: string;
}
