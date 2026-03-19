/**
 * Maps one or more Entra ID Job Title strings to a SystemRole.
 *
 * Matching behavior:
 * - `exact`: Job Title must match one alias exactly (case-insensitive)
 * - `contains`: Job Title must contain one alias as a substring (case-insensitive)
 * - `starts-with`: Job Title must begin with one alias (case-insensitive)
 *
 * Aliases are evaluated in order; first match wins.
 * Inactive mappings are loaded but skipped during resolution.
 */
export interface IJobTitleMapping {
  id: string;
  /** Target SystemRole value (e.g. 'PROJECT_MANAGER'). */
  roleId: string;
  /** Human-readable role name for display. */
  roleName: string;
  /**
   * Entra ID Job Title strings (or substrings) that map to this role.
   * Store the exact values observed in Entra; alias matching is case-insensitive.
   */
  aliases: string[];
  matchMode: 'exact' | 'contains' | 'starts-with';
  active: boolean;
  updatedAt: string;
  updatedBy: string;
}
