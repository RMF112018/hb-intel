/**
 * Per-project Financial context state — FIN-04 §5–§7.
 *
 * Preserves the user's last-visited Financial tool, reporting period,
 * and version context per project. This enables:
 * - Return-to-tool when re-entering a project's Financial section
 * - Period continuity across tool navigation
 * - Project-switch isolation (each project has its own context)
 *
 * Context is persisted to localStorage, keyed by projectId.
 * Context does NOT survive across different users or browser profiles.
 *
 * @see Financial-RLR §2 R4–R6 (route durability decisions)
 * @see Financial-LMG §2 (version lifecycle)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FinancialContextState {
  /** The project this context belongs to. */
  projectId: string;
  /** Last-visited Financial tool slug (e.g., 'budget', 'forecast'). */
  lastTool: string | null;
  /** Active reporting period identifier (e.g., '2026-03'). */
  reportingPeriod: string | null;
  /** Active forecast version ID for the current working session. */
  activeVersionId: string | null;
  /** Selected artifact ID (review, publication, history item). */
  selectedArtifactId: string | null;
  /** ISO 8601 timestamp of last context update. */
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const KEY_PREFIX = 'hbc-financial-ctx-';

const EMPTY_CONTEXT: Omit<FinancialContextState, 'projectId' | 'updatedAt'> = {
  lastTool: null,
  reportingPeriod: null,
  activeVersionId: null,
  selectedArtifactId: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Read
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get Financial context for a specific project. Returns null if not found.
 *
 * Context is project-scoped — calling with a different projectId returns
 * that project's context, never a leaked context from another project.
 */
export function getFinancialContext(projectId: string): FinancialContextState | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + projectId);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<FinancialContextState>;

    // Validate the stored projectId matches to prevent cross-project leakage
    if (parsed.projectId !== projectId) return null;

    return {
      projectId,
      lastTool: typeof parsed.lastTool === 'string' ? parsed.lastTool : null,
      reportingPeriod: typeof parsed.reportingPeriod === 'string' ? parsed.reportingPeriod : null,
      activeVersionId: typeof parsed.activeVersionId === 'string' ? parsed.activeVersionId : null,
      selectedArtifactId:
        typeof parsed.selectedArtifactId === 'string' ? parsed.selectedArtifactId : null,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Save or update Financial context for a project.
 *
 * Merges the provided fields into the existing context for that project.
 * Fields not provided are preserved from the current saved state.
 */
export function saveFinancialContext(
  projectId: string,
  update: Partial<Omit<FinancialContextState, 'projectId' | 'updatedAt'>>,
): FinancialContextState {
  const existing = getFinancialContext(projectId);

  const merged: FinancialContextState = {
    projectId,
    lastTool: update.lastTool !== undefined ? update.lastTool : (existing?.lastTool ?? null),
    reportingPeriod:
      update.reportingPeriod !== undefined
        ? update.reportingPeriod
        : (existing?.reportingPeriod ?? null),
    activeVersionId:
      update.activeVersionId !== undefined
        ? update.activeVersionId
        : (existing?.activeVersionId ?? null),
    selectedArtifactId:
      update.selectedArtifactId !== undefined
        ? update.selectedArtifactId
        : (existing?.selectedArtifactId ?? null),
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(KEY_PREFIX + projectId, JSON.stringify(merged));
  } catch {
    // localStorage unavailable or full — fail silently
  }

  return merged;
}

// ─────────────────────────────────────────────────────────────────────────────
// Clear
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clear Financial context for a specific project.
 */
export function clearFinancialContext(projectId: string): void {
  try {
    localStorage.removeItem(KEY_PREFIX + projectId);
  } catch {
    // fail silently
  }
}

/**
 * Get the last-visited Financial tool for a project.
 * Returns null if no Financial context exists.
 *
 * Use this for return-memory behavior: when a user re-enters a project's
 * Financial section without specifying a tool, restore their last tool.
 */
export function getFinancialReturnTool(projectId: string): string | null {
  const ctx = getFinancialContext(projectId);
  return ctx?.lastTool ?? null;
}
