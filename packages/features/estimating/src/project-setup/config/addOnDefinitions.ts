/**
 * W0-G3-T01: Frontend add-on registry for project setup Step 4.
 *
 * Wave 0 ships two add-on packs: safety-pack and closeout-pack.
 * Each pack declares which departments it applies to. The consuming
 * surface filters this list by the department selected in Step 2.
 */
import type { ProjectDepartment } from '@hbc/models';
import type { IProjectSetupAddOnDefinition } from '../types/index.js';

export const ADD_ON_DEFINITIONS: readonly IProjectSetupAddOnDefinition[] = [
  {
    slug: 'safety-pack',
    label: 'Safety Pack',
    description:
      'Adds safety-related lists and document libraries for OSHA compliance tracking, safety meeting logs, and incident reporting.',
    departments: ['commercial'],
  },
  {
    slug: 'closeout-pack',
    label: 'Closeout Pack',
    description:
      'Adds closeout checklists, warranty tracking, and punch-list management for project completion workflows.',
    departments: ['commercial', 'luxury-residential'],
  },
];

/**
 * Returns add-on definitions available for the given department.
 * If department is undefined (defensive; should not occur in sequential mode),
 * returns all add-ons.
 */
export function getAddOnsForDepartment(
  department: ProjectDepartment | undefined,
): readonly IProjectSetupAddOnDefinition[] {
  if (!department) return ADD_ON_DEFINITIONS;
  return ADD_ON_DEFINITIONS.filter(
    (def) => def.departments.length === 0 || def.departments.includes(department),
  );
}
