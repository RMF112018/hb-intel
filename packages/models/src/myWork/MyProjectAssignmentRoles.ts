/**
 * My Projects canonical assignment role taxonomy.
 *
 * Shared by backfill, backend matching, and UI role rendering layers.
 */

export const MY_PROJECT_ASSIGNMENT_ROLE_IDS = [
  'lead-estimator',
  'estimator',
  'ids-manager',
  'project-accountant',
  'project-administrator',
  'project-coordinator',
  'superintendent',
  'lead-superintendent',
  'project-manager',
  'lead-project-manager',
  'project-executive',
  'safety-coordinator',
  'qc-manager',
  'warranty-manager',
] as const;

export type MyProjectAssignmentRoleId = (typeof MY_PROJECT_ASSIGNMENT_ROLE_IDS)[number];

export const MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS = [
  'leadEstimatorUpns',
  'estimatorUpns',
  'idsManagerUpns',
  'projectAccountantUpns',
  'projectAdministratorUpns',
  'projectCoordinatorUpns',
  'superintendentUpns',
  'leadSuperintendentUpns',
  'projectManagerUpns',
  'leadProjectManagerUpns',
  'projectExecutiveUpns',
  'safetyCoordinatorUpns',
  'qcManagerUpns',
  'warrantyManagerUpns',
] as const;

export type MyProjectAssignmentInternalField = (typeof MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS)[number];

export interface MyProjectAssignmentRoleDefinition {
  readonly roleId: MyProjectAssignmentRoleId;
  readonly internalField: MyProjectAssignmentInternalField;
  readonly displayLabel: string;
  readonly priority: number;
}

export const MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS: readonly MyProjectAssignmentRoleDefinition[] = [
  { roleId: 'lead-estimator', internalField: 'leadEstimatorUpns', displayLabel: 'Lead Estimator', priority: 1 },
  { roleId: 'estimator', internalField: 'estimatorUpns', displayLabel: 'Estimator', priority: 2 },
  { roleId: 'ids-manager', internalField: 'idsManagerUpns', displayLabel: 'IDS Manager', priority: 3 },
  { roleId: 'project-accountant', internalField: 'projectAccountantUpns', displayLabel: 'Project Accountant', priority: 4 },
  { roleId: 'project-administrator', internalField: 'projectAdministratorUpns', displayLabel: 'Project Administrator', priority: 5 },
  { roleId: 'project-coordinator', internalField: 'projectCoordinatorUpns', displayLabel: 'Project Coordinator', priority: 6 },
  { roleId: 'superintendent', internalField: 'superintendentUpns', displayLabel: 'Superintendent', priority: 7 },
  { roleId: 'lead-superintendent', internalField: 'leadSuperintendentUpns', displayLabel: 'Lead Superintendent', priority: 8 },
  { roleId: 'project-manager', internalField: 'projectManagerUpns', displayLabel: 'Project Manager', priority: 9 },
  { roleId: 'lead-project-manager', internalField: 'leadProjectManagerUpns', displayLabel: 'Lead Project Manager', priority: 10 },
  { roleId: 'project-executive', internalField: 'projectExecutiveUpns', displayLabel: 'Project Executive', priority: 11 },
  { roleId: 'safety-coordinator', internalField: 'safetyCoordinatorUpns', displayLabel: 'Safety Coordinator', priority: 12 },
  { roleId: 'qc-manager', internalField: 'qcManagerUpns', displayLabel: 'QC Manager', priority: 13 },
  { roleId: 'warranty-manager', internalField: 'warrantyManagerUpns', displayLabel: 'Warranty Manager', priority: 14 },
] as const;

export const MY_PROJECT_ASSIGNMENT_ROLE_COUNT = MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.length;

export const MY_PROJECT_ASSIGNMENT_ROLE_BY_ID: Readonly<Record<MyProjectAssignmentRoleId, MyProjectAssignmentRoleDefinition>> =
  Object.freeze(
    MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.reduce((acc, definition) => {
      acc[definition.roleId] = definition;
      return acc;
    }, {} as Record<MyProjectAssignmentRoleId, MyProjectAssignmentRoleDefinition>),
  );

export const MY_PROJECT_ASSIGNMENT_ROLE_BY_INTERNAL_FIELD: Readonly<Record<MyProjectAssignmentInternalField, MyProjectAssignmentRoleDefinition>> =
  Object.freeze(
    MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.reduce((acc, definition) => {
      acc[definition.internalField] = definition;
      return acc;
    }, {} as Record<MyProjectAssignmentInternalField, MyProjectAssignmentRoleDefinition>),
  );
