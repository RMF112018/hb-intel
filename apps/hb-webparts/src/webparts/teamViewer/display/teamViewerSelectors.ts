/**
 * teamViewerSelectors — pure view-model helpers for TeamViewer.
 *
 * Sorting, grouping, and density-by-size selection live here so they
 * can be unit-tested independently of React rendering.
 */
import type {
  TeamViewerDensity,
  TeamViewerGroup,
  TeamViewerPerson,
} from '../teamViewerContracts.js';

const SMALL_TEAM_THRESHOLD = 6;
const MEDIUM_TEAM_THRESHOLD = 18;

/** Lower `sortOrder` first; ties break on displayName (case-insensitive). */
export function sortPeople(people: readonly TeamViewerPerson[]): TeamViewerPerson[] {
  return [...people].sort((a, b) => {
    const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' });
  });
}

/**
 * Group sorted people by `groupKey`. People without a `groupKey` collapse
 * into a single trailing 'ungrouped' bucket (only emitted when present).
 */
export function groupPeople(sorted: readonly TeamViewerPerson[]): TeamViewerGroup[] {
  const map = new Map<string, TeamViewerPerson[]>();
  const ungrouped: TeamViewerPerson[] = [];
  for (const p of sorted) {
    if (p.groupKey) {
      const existing = map.get(p.groupKey);
      if (existing) existing.push(p);
      else map.set(p.groupKey, [p]);
    } else {
      ungrouped.push(p);
    }
  }
  const groups: TeamViewerGroup[] = [];
  for (const [key, people] of map) {
    groups.push({ id: key, label: key, people });
  }
  if (ungrouped.length > 0) {
    groups.push({ id: 'ungrouped', label: 'Team', people: ungrouped });
  }
  return groups;
}

/**
 * Pick a density based on team size when the caller hasn't locked one.
 *   small  (<= 6)  → expanded
 *   medium (<= 18) → standard
 *   large  (> 18)  → compact
 */
export function selectDensityForSize(count: number): TeamViewerDensity {
  if (count <= SMALL_TEAM_THRESHOLD) return 'expanded';
  if (count <= MEDIUM_TEAM_THRESHOLD) return 'standard';
  return 'compact';
}

export const TEAM_VIEWER_SIZE_THRESHOLDS = {
  small: SMALL_TEAM_THRESHOLD,
  medium: MEDIUM_TEAM_THRESHOLD,
} as const;
