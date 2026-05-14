/**
 * My Projects role schema readiness — pure verification helper.
 *
 * The my-project-links backend provider iterates the 14 canonical role-array
 * fields (`MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS` from `@hbc/models/myWork`)
 * on every row of both Projects and the Legacy Project Fallback Registry.
 * When any of those fields is absent or has the wrong SharePoint type, the
 * provider silently emits zero matches for users whose only assignments live
 * in that field — operators cannot triage this from the response payload
 * alone (`data.diagnostics.classification === 'zero-match-available-sources'`
 * is the same value whether the columns exist or not).
 *
 * This module produces a deterministic, per-list per-field readiness
 * classification from a snapshot of each list's columns (as `TypeAsString`
 * strings returned by the SharePoint/Graph fields API). Pure: no I/O, no
 * mutation, no Graph calls — the CLI verify script in
 * `scripts/verify-my-project-role-fields.ts` owns the actual probe.
 *
 * @module services/projects-role-schema-readiness
 */

import {
  MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS,
  type MyProjectAssignmentInternalField,
} from '@hbc/models/myWork';

import { PROJECTS_LIST_NAME } from './projects-list-contract.js';
import { LEGACY_FALLBACK_REGISTRY_LIST_TITLE } from './legacy-fallback/list-descriptors.js';

/**
 * Closed-set classification stamped per-field on the readiness report.
 *
 * - `live-verified` — the column exists on the list with the expected
 *   SharePoint `TypeAsString`.
 * - `missing` — the column is absent from the list snapshot.
 * - `wrong-type` — the column exists but the `TypeAsString` does not match
 *   the expected value (e.g., Text where Note was expected).
 */
export const MY_PROJECT_ROLE_FIELD_READINESS_STATES = [
  'live-verified',
  'missing',
  'wrong-type',
] as const;

export type MyProjectRoleFieldReadinessState =
  (typeof MY_PROJECT_ROLE_FIELD_READINESS_STATES)[number];

/**
 * The 14 canonical role-array fields the my-project-links provider iterates
 * on every row of the Projects list. Source of truth lives in
 * `@hbc/models/myWork`; this constant is a typed re-export so consumers
 * (the readiness helper and CLI script) do not duplicate the list.
 */
export const MY_PROJECT_LINKS_REQUIRED_FIELDS_PROJECTS: readonly MyProjectAssignmentInternalField[] =
  MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS;

/**
 * The Legacy Project Fallback Registry needs the same 14 canonical
 * role-array fields plus a `procoreProject` Text column. The Registry has
 * no provider-side fallback, so a missing field here directly produces
 * silent zero-match for users whose assignments live in legacy rows.
 */
export const MY_PROJECT_LINKS_REQUIRED_FIELDS_LEGACY_REGISTRY: readonly string[] = [
  ...MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS,
  'procoreProject',
];

/**
 * SharePoint `TypeAsString` value expected for each required field. The
 * 14 canonical role-array fields are stored as MultiLineText (Note);
 * `procoreProject` is plain Text.
 */
const EXPECTED_TYPE_NOTE = 'Note';
const EXPECTED_TYPE_TEXT = 'Text';

function expectedTypeFor(field: string): string {
  if (field === 'procoreProject') return EXPECTED_TYPE_TEXT;
  return EXPECTED_TYPE_NOTE;
}

/**
 * One column observed in a tenant list's schema. Matches the minimal
 * shape returned by SharePoint's REST `/_api/web/lists/.../fields` and
 * Graph's `/sites/{site}/lists/{list}/columns` endpoints when projected
 * down to the two fields the readiness check needs.
 */
export interface ListFieldSnapshot {
  readonly internalName: string;
  /** SharePoint `TypeAsString` (e.g., `'Note'`, `'Text'`, `'Number'`). */
  readonly typeAsString: string;
}

export interface FieldReadinessEntry {
  readonly internalName: string;
  readonly expectedTypeAsString: string;
  readonly observedTypeAsString: string | null;
  readonly state: MyProjectRoleFieldReadinessState;
}

export interface ListReadiness {
  readonly listName: string;
  readonly ready: boolean;
  readonly entries: readonly FieldReadinessEntry[];
}

export interface ProjectsRoleSchemaReadinessReport {
  readonly ready: boolean;
  readonly generatedAtUtc: string;
  readonly projects: ListReadiness;
  readonly legacyRegistry: ListReadiness;
}

function classifyField(
  internalName: string,
  snapshot: readonly ListFieldSnapshot[],
): FieldReadinessEntry {
  const expectedTypeAsString = expectedTypeFor(internalName);
  const observed = snapshot.find((field) => field.internalName === internalName);
  if (!observed) {
    return {
      internalName,
      expectedTypeAsString,
      observedTypeAsString: null,
      state: 'missing',
    };
  }
  if (observed.typeAsString !== expectedTypeAsString) {
    return {
      internalName,
      expectedTypeAsString,
      observedTypeAsString: observed.typeAsString,
      state: 'wrong-type',
    };
  }
  return {
    internalName,
    expectedTypeAsString,
    observedTypeAsString: observed.typeAsString,
    state: 'live-verified',
  };
}

function buildListReadiness(
  listName: string,
  requiredFields: readonly string[],
  snapshot: readonly ListFieldSnapshot[],
): ListReadiness {
  const entries = requiredFields.map((field) => classifyField(field, snapshot));
  const ready = entries.every((entry) => entry.state === 'live-verified');
  return { listName, ready, entries };
}

/**
 * Build the structured schema-readiness report from per-list column
 * snapshots. Pure: no I/O, deterministic given the same input.
 *
 * The caller (CLI verify script) is responsible for fetching the
 * snapshots via Graph or PnPjs and supplying `generatedAtUtc`.
 */
export function buildProjectsRoleSchemaReadinessReport(input: {
  readonly projectsFields: readonly ListFieldSnapshot[];
  readonly legacyRegistryFields: readonly ListFieldSnapshot[];
  readonly generatedAtUtc: string;
}): ProjectsRoleSchemaReadinessReport {
  const projects = buildListReadiness(
    PROJECTS_LIST_NAME,
    MY_PROJECT_LINKS_REQUIRED_FIELDS_PROJECTS,
    input.projectsFields,
  );
  const legacyRegistry = buildListReadiness(
    LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
    MY_PROJECT_LINKS_REQUIRED_FIELDS_LEGACY_REGISTRY,
    input.legacyRegistryFields,
  );
  return {
    ready: projects.ready && legacyRegistry.ready,
    generatedAtUtc: input.generatedAtUtc,
    projects,
    legacyRegistry,
  };
}
