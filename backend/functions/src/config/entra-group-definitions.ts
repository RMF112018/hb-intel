/**
 * W0-G1-T02: Entra ID security group definitions for the three-group permission model.
 * Traceability: docs/reference/provisioning/entra-id-group-model.md
 */

export interface IEntraGroupDefinition {
  /** Suffix appended to the project number to form the group display name. */
  roleSuffix: string;
  /** SharePoint permission level to assign this group. */
  sharePointPermissionLevel: 'Full Control' | 'Contribute' | 'Read';
  /** Template string for the group description. Placeholders: {projectNumber}, {projectName}. */
  descriptionTemplate: string;
}

/**
 * The three Entra ID security groups created for every provisioned project site.
 * Order matters: Leaders (Full Control) → Team (Contribute) → Viewers (Read).
 */
export const ENTRA_GROUP_DEFINITIONS: readonly IEntraGroupDefinition[] = [
  {
    roleSuffix: 'Leaders',
    sharePointPermissionLevel: 'Full Control',
    descriptionTemplate:
      'Project leaders for {projectNumber} — {projectName}. Full Control on project site.',
  },
  {
    roleSuffix: 'Team',
    sharePointPermissionLevel: 'Contribute',
    descriptionTemplate:
      'Team members for {projectNumber} — {projectName}. Contribute access on project site.',
  },
  {
    roleSuffix: 'Viewers',
    sharePointPermissionLevel: 'Read',
    descriptionTemplate:
      'Background viewers for {projectNumber} — {projectName}. Read-only access on project site.',
  },
] as const;

/**
 * Builds the Entra ID group display name from project number and role suffix.
 * Format: `HB-{projectNumber}-{roleSuffix}` (e.g. "HB-25-001-01-Leaders").
 */
export function buildGroupDisplayName(projectNumber: string, roleSuffix: string): string {
  return `HB-${projectNumber}-${roleSuffix}`;
}

/**
 * Interpolates the group description template with project metadata.
 */
export function buildGroupDescription(
  template: string,
  projectNumber: string,
  projectName: string
): string {
  return template
    .replace(/\{projectNumber\}/g, projectNumber)
    .replace(/\{projectName\}/g, projectName);
}

/**
 * Reads department-specific background viewer UPNs from environment variables.
 * Env var naming convention: `DEPT_BACKGROUND_ACCESS_{DEPARTMENT}` (uppercase, hyphens → underscores).
 * The value is a comma-separated list of UPNs.
 *
 * Returns an empty array if the env var is not set or the department is not provided.
 */
export function getDepartmentBackgroundViewers(department?: string): string[] {
  if (!department) return [];
  const envKey = `DEPT_BACKGROUND_ACCESS_${department.toUpperCase().replace(/-/g, '_')}`;
  const raw = process.env[envKey];
  if (!raw) return [];
  return raw
    .split(',')
    .map((upn) => upn.trim())
    .filter(Boolean);
}
