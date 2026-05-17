/**
 * My Projects Registry — schema-readiness verification (pure).
 *
 * Classifies each descriptor field against a live snapshot of the SharePoint
 * list columns. Adds a `wrong-unique` state on top of the custom-links
 * readiness shape because `ProjectionKey` must enforce unique values; an
 * indexed `ProjectionKey` without uniqueness is a hard projection-write
 * hazard, not a benign drift.
 *
 * Pure: no I/O, no Graph calls, no mutation.
 */

import type { IFieldDefinition } from '../sharepoint-service.js';
import { getCompatibleSharePointFieldTypes } from '../sharepoint-schema-provisioning/compatibility.js';
import {
  MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR,
  MY_PROJECTS_REGISTRY_LIST_TITLE,
} from './registry-list-descriptor.js';

export const MY_PROJECTS_REGISTRY_READINESS_STATES = [
  'live-verified',
  'missing',
  'wrong-type',
  'wrong-unique',
] as const;

export type MyProjectsRegistryReadinessState =
  (typeof MY_PROJECTS_REGISTRY_READINESS_STATES)[number];

export interface RegistryListFieldSnapshot {
  readonly internalName: string;
  readonly typeAsString: string;
  readonly enforceUniqueValues?: boolean;
}

export interface RegistryFieldReadinessEntry {
  readonly internalName: string;
  readonly expectedTypeAsString: string;
  readonly observedTypeAsString: string | null;
  readonly expectedUnique?: boolean;
  readonly observedUnique?: boolean;
  readonly state: MyProjectsRegistryReadinessState;
}

export interface MyProjectsRegistrySchemaReadinessReport {
  readonly ready: boolean;
  readonly generatedAtUtc: string;
  readonly listName: string;
  readonly entries: readonly RegistryFieldReadinessEntry[];
}

function expectedTypeFor(field: IFieldDefinition): string {
  const compatibles = getCompatibleSharePointFieldTypes(field.type);
  return compatibles[0];
}

function classifyField(
  field: IFieldDefinition,
  snapshot: readonly RegistryListFieldSnapshot[],
): RegistryFieldReadinessEntry {
  const expectedTypeAsString = expectedTypeFor(field);
  const expectedUnique = field.unique === true ? true : undefined;
  const observed = snapshot.find((entry) => entry.internalName === field.internalName);
  if (!observed) {
    return {
      internalName: field.internalName,
      expectedTypeAsString,
      observedTypeAsString: null,
      expectedUnique,
      state: 'missing',
    };
  }
  const compatibles = getCompatibleSharePointFieldTypes(field.type);
  if (!compatibles.includes(observed.typeAsString)) {
    return {
      internalName: field.internalName,
      expectedTypeAsString,
      observedTypeAsString: observed.typeAsString,
      expectedUnique,
      observedUnique: observed.enforceUniqueValues,
      state: 'wrong-type',
    };
  }
  if (expectedUnique === true && observed.enforceUniqueValues !== true) {
    return {
      internalName: field.internalName,
      expectedTypeAsString,
      observedTypeAsString: observed.typeAsString,
      expectedUnique,
      observedUnique: observed.enforceUniqueValues,
      state: 'wrong-unique',
    };
  }
  return {
    internalName: field.internalName,
    expectedTypeAsString,
    observedTypeAsString: observed.typeAsString,
    expectedUnique,
    observedUnique: observed.enforceUniqueValues,
    state: 'live-verified',
  };
}

export function buildMyProjectsRegistrySchemaReadinessReport(input: {
  readonly fields: readonly RegistryListFieldSnapshot[];
  readonly generatedAtUtc: string;
}): MyProjectsRegistrySchemaReadinessReport {
  const entries = MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.fields.map((field) =>
    classifyField(field, input.fields),
  );
  const ready = entries.every((entry) => entry.state === 'live-verified');
  return {
    ready,
    generatedAtUtc: input.generatedAtUtc,
    listName: MY_PROJECTS_REGISTRY_LIST_TITLE,
    entries,
  };
}
