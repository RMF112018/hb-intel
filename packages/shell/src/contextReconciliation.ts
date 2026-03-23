/**
 * Phase 3 Stage 4.5 — Context mismatch reconciliation.
 *
 * Detects when the route-carried projectId differs from the store-carried
 * activeProject and resolves the mismatch. Per P3-B1 §7: route always wins.
 *
 * Governing: P3-B1 §7 (Context Mismatch Reconciliation)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ContextMismatchInput {
  /** The projectId from the current route (authoritative) */
  routeProjectId: string;
  /** The projectId from projectStore.activeProject (may be stale or null) */
  storeProjectId: string | null;
}

export interface ContextReconciliationResult {
  /** Whether a mismatch was detected between route and store */
  mismatchDetected: boolean;
  /** The authoritative projectId (always the route value per §7.2) */
  authoritativeProjectId: string;
  /** Whether the store needs to be re-synchronized to match the route */
  storeNeedsSync: boolean;
  /** The previous projectId from the store (for return-memory preservation per §7.2 step 4) */
  previousProjectId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reconciliation (P3-B1 §7.2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reconcile project context between route and store.
 *
 * **Route always wins** (P3-B1 §7.2):
 * - If store matches route → no action needed
 * - If store differs from route → store must sync to route
 * - If store is null (first load) → store must sync to route
 *
 * The caller should:
 * 1. Check `storeNeedsSync` — if true, call `setActiveProject()` with the route project
 * 2. Check `previousProjectId` — if set, preserve return-memory for the previous project
 *
 * Per §7.4: NEVER redirect based on store identity, NEVER prompt the user,
 * NEVER show content for a different project than the URL specifies.
 */
export function reconcileProjectContext(
  input: ContextMismatchInput,
): ContextReconciliationResult {
  const { routeProjectId, storeProjectId } = input;

  // Store is null (first load or cleared) — sync needed, not a mismatch
  if (storeProjectId === null) {
    return {
      mismatchDetected: false,
      authoritativeProjectId: routeProjectId,
      storeNeedsSync: true,
    };
  }

  // Store matches route — no action needed
  if (storeProjectId === routeProjectId) {
    return {
      mismatchDetected: false,
      authoritativeProjectId: routeProjectId,
      storeNeedsSync: false,
    };
  }

  // Mismatch: store differs from route — route wins (§7.2)
  return {
    mismatchDetected: true,
    authoritativeProjectId: routeProjectId,
    storeNeedsSync: true,
    previousProjectId: storeProjectId,
  };
}
