/**
 * W0-G3-T01: Field-to-step mapping for clarification-return behavior.
 *
 * Maps every IProjectSetupRequest field collected by the wizard to
 * the step that owns it. Used by the clarification-return flow (T03)
 * to determine which steps should be opened when annotated fields
 * need correction.
 */
import type { ProjectSetupStepId } from '../types/index.js';

/** Map of field names on IProjectSetupRequest to their owning step. */
export const PROJECT_SETUP_FIELD_MAP: Readonly<Record<string, ProjectSetupStepId>> = {
  // Step 1 — Project Information
  projectName: 'project-info',
  projectStreetAddress: 'project-info',
  projectCity: 'project-info',
  projectCounty: 'project-info',
  projectState: 'project-info',
  projectZip: 'project-info',
  projectLocation: 'project-info',
  estimatedValue: 'project-info',
  clientName: 'project-info',
  startDate: 'project-info',
  procoreProject: 'project-info',

  // Step 2 — Department & Type
  officeDivision: 'department',
  department: 'department',
  projectType: 'department',
  projectStage: 'department',
  contractType: 'department',

  // Step 3 — Project Team
  projectLeadId: 'project-team',
  groupMembers: 'project-team',
  viewerUPNs: 'project-team',

  // Step 4 — Template & Add-Ons
  addOns: 'template-addons',
};

/**
 * Given an array of field IDs from clarification annotations,
 * returns the unique set of step IDs that contain those fields,
 * in wizard sequential order.
 *
 * Unknown field IDs are silently ignored.
 */
export function resolveStepsForClarification(
  fieldIds: readonly string[],
): ProjectSetupStepId[] {
  const stepSet = new Set<ProjectSetupStepId>();

  for (const fieldId of fieldIds) {
    const step = PROJECT_SETUP_FIELD_MAP[fieldId];
    if (step) {
      stepSet.add(step);
    }
  }

  // Return in wizard sequential order
  const orderedSteps: ProjectSetupStepId[] = [
    'project-info',
    'department',
    'project-team',
    'template-addons',
    'review-submit',
  ];

  return orderedSteps.filter((s) => stepSet.has(s));
}
