import type { IProjectRepository } from '../ports/IProjectRepository.js';

// ─────────────────────────────────────────────────────────────────────────────
// Dual-key project identifier normalization (Phase 3 Stage 1.2)
//
// Accepts either projectId (UUID) or projectNumber (legacy ##-###-##) and
// resolves to the canonical projectId. Used at the router/entry level to
// normalize inbound links before internal processing.
//
// Governing: P3-A1 §3.4–§3.6, P3-B1 §2.2
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classification of an inbound project identifier.
 */
export type ProjectIdentifierKind = 'projectId' | 'projectNumber';

/** UUID v4 pattern (lowercase hex with dashes) */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Project number pattern (##-###-## with variable digit counts) */
const PROJECT_NUMBER_PATTERN = /^\d{2}-\d{3}-\d{2}$/;

/**
 * Detect whether an inbound identifier is a projectId (UUID) or projectNumber.
 *
 * Returns `'projectId'` for UUID-format strings, `'projectNumber'` for
 * ##-###-## format strings. Ambiguous inputs default to `'projectId'`
 * (try by ID first).
 */
export function detectProjectIdentifierKind(value: string): ProjectIdentifierKind {
  if (UUID_PATTERN.test(value)) return 'projectId';
  if (PROJECT_NUMBER_PATTERN.test(value)) return 'projectNumber';
  // Ambiguous: treat as projectId (try by ID first in normalization)
  return 'projectId';
}

/**
 * Result of project identifier normalization.
 */
export interface NormalizeProjectIdentifierResult {
  /** The canonical projectId (UUID) */
  projectId: string;
  /** Whether a redirect to the canonical projectId-based route is needed */
  redirectRequired: boolean;
}

/**
 * Normalize an inbound project identifier to the canonical projectId.
 *
 * - If the input is a UUID, verifies it exists via `getProjectById` and returns it directly.
 * - If the input matches the projectNumber pattern, resolves via `getProjectByNumber`
 *   and signals that a redirect is required.
 * - If neither lookup succeeds, returns `null`.
 *
 * @param value - The inbound identifier (projectId or projectNumber)
 * @param repository - Project repository for lookup
 * @returns Normalized result with canonical projectId, or null if not found
 */
export async function normalizeProjectIdentifier(
  value: string,
  repository: IProjectRepository,
): Promise<NormalizeProjectIdentifierResult | null> {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const kind = detectProjectIdentifierKind(trimmed);

  if (kind === 'projectNumber') {
    // Resolve projectNumber → projectId via registry lookup
    const project = await repository.getProjectByNumber(trimmed);
    if (project) {
      return { projectId: project.id, redirectRequired: true };
    }
    return null;
  }

  // Try as projectId first
  const project = await repository.getProjectById(trimmed);
  if (project) {
    return { projectId: project.id, redirectRequired: false };
  }

  // Fallback: if it wasn't a UUID, try by number as last resort
  if (!UUID_PATTERN.test(trimmed)) {
    const byNumber = await repository.getProjectByNumber(trimmed);
    if (byNumber) {
      return { projectId: byNumber.id, redirectRequired: true };
    }
  }

  return null;
}
