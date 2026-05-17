/**
 * My Projects Custom Links — schema-readiness verification (pure).
 *
 * The custom-links repository (Prompt 03) reads/writes a closed field set on
 * the `My Projects Custom Links` list. If any column is absent or has the
 * wrong SharePoint `TypeAsString`, the repository silently fails or rejects
 * writes. This module produces a deterministic per-field readiness report
 * from a snapshot of the list's columns; the CLI verify script
 * (`scripts/verify-my-projects-custom-links.ts`) owns the actual probe.
 *
 * Pure: no I/O, no Graph calls, no mutation.
 */

import type { IFieldDefinition } from '../sharepoint-service.js';
import { getCompatibleSharePointFieldTypes } from '../sharepoint-schema-provisioning/compatibility.js';
import {
  MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR,
  MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE,
} from './list-descriptor.js';

export const MY_PROJECTS_CUSTOM_LINKS_READINESS_STATES = [
  'live-verified',
  'missing',
  'wrong-type',
] as const;

export type MyProjectsCustomLinksReadinessState =
  (typeof MY_PROJECTS_CUSTOM_LINKS_READINESS_STATES)[number];

/**
 * Minimal column snapshot shape — matches what the SharePoint REST
 * `/_api/web/lists/.../fields` endpoint returns when projected to the two
 * fields the readiness check needs.
 */
export interface CustomLinksListFieldSnapshot {
  readonly internalName: string;
  /** SharePoint `TypeAsString` (e.g., `'Text'`, `'Number'`, `'Choice'`). */
  readonly typeAsString: string;
}

export interface CustomLinksFieldReadinessEntry {
  readonly internalName: string;
  readonly expectedTypeAsString: string;
  readonly observedTypeAsString: string | null;
  readonly state: MyProjectsCustomLinksReadinessState;
}

export interface MyProjectsCustomLinksSchemaReadinessReport {
  readonly ready: boolean;
  readonly generatedAtUtc: string;
  readonly listName: string;
  readonly entries: readonly CustomLinksFieldReadinessEntry[];
}

/**
 * SharePoint `TypeAsString` that should appear on the column for a given
 * descriptor field. Mirrors the compatibility matrix used by the planner —
 * the canonical "live" value for each descriptor type (first entry of the
 * compatibility list).
 */
function expectedTypeFor(field: IFieldDefinition): string {
  const compatibles = getCompatibleSharePointFieldTypes(field.type);
  // `Number` → ['Number', 'Currency']; `Choice` → ['Choice', 'MultiChoice'].
  // For provisioned columns we expect the primary (first) value.
  return compatibles[0];
}

function classifyField(
  field: IFieldDefinition,
  snapshot: readonly CustomLinksListFieldSnapshot[],
): CustomLinksFieldReadinessEntry {
  const expectedTypeAsString = expectedTypeFor(field);
  const observed = snapshot.find((entry) => entry.internalName === field.internalName);
  if (!observed) {
    return {
      internalName: field.internalName,
      expectedTypeAsString,
      observedTypeAsString: null,
      state: 'missing',
    };
  }
  const compatibles = getCompatibleSharePointFieldTypes(field.type);
  if (!compatibles.includes(observed.typeAsString)) {
    return {
      internalName: field.internalName,
      expectedTypeAsString,
      observedTypeAsString: observed.typeAsString,
      state: 'wrong-type',
    };
  }
  return {
    internalName: field.internalName,
    expectedTypeAsString,
    observedTypeAsString: observed.typeAsString,
    state: 'live-verified',
  };
}

export function buildMyProjectsCustomLinksSchemaReadinessReport(input: {
  readonly fields: readonly CustomLinksListFieldSnapshot[];
  readonly generatedAtUtc: string;
}): MyProjectsCustomLinksSchemaReadinessReport {
  const entries = MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.fields.map((field) =>
    classifyField(field, input.fields),
  );
  const ready = entries.every((entry) => entry.state === 'live-verified');
  return {
    ready,
    generatedAtUtc: input.generatedAtUtc,
    listName: MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE,
    entries,
  };
}
