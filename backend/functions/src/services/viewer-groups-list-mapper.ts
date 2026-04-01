/**
 * Serialization/deserialization for the projectViewerGroups list.
 *
 * Read-only mapper — no write path is needed because the
 * `projectViewerGroups` list is admin-managed, not written by the application.
 *
 * @see viewer-groups-list-contract.ts for the persistence DTO and field map
 */
import type { IDepartmentViewerPolicy } from './viewer-groups-list-contract.js';
import { safeParseJsonArray } from './projects-list-mapper.js';

/**
 * Convert a raw SharePoint list item to an `IDepartmentViewerPolicy` domain object.
 *
 * Normalization rules:
 * - `IsActive` Choice: `'Yes'` → `true`, anything else → `false`
 * - `DefaultViewerGroupIdsJson`: parsed as JSON string array; empty/malformed → `[]`
 * - `LastReviewedAt`: optional DateTime string; falsy → `undefined`
 * - `Notes`: optional; falsy → `undefined`
 */
export function toDomain(item: Record<string, unknown>): IDepartmentViewerPolicy {
  return {
    department: (item.Title as string) ?? '',
    defaultViewerGroupIds: safeParseJsonArray(item.DefaultViewerGroupIdsJson),
    defaultViewerGroupNames: (item.DefaultViewerGroupNames as string) ?? '',
    isActive: (item.IsActive as string) === 'Yes',
    lastReviewedAt: (item.LastReviewedAt as string) || undefined,
    notes: (item.Notes as string) || undefined,
  };
}
