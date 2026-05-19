/**
 * My Dashboard | Adobe Sign cache — multi-list schema readiness (pure).
 *
 * Classifies the four Adobe Sign cache descriptor lists against a live
 * SharePoint snapshot of each list's columns. Aggregates per-list readiness
 * into a single multi-target report so the verifier script can exit 0 only
 * when every required column on every list is live-verified with the right
 * type and the right `EnforceUniqueValues` posture.
 *
 * Pattern source: `services/my-projects-projection/registry-schema-readiness.ts`
 * (single-list). This module adopts the same `live-verified | missing |
 * wrong-type | wrong-unique` taxonomy and adds a multi-target wrapper.
 *
 * Pure: no I/O, no Graph calls, no mutation.
 *
 * @module services/adobe-sign-cache/cache-list-schema-readiness
 */

import type { IFieldDefinition, IListDefinition } from '../sharepoint-service.js';
import { getCompatibleSharePointFieldTypes } from '../sharepoint-schema-provisioning/compatibility.js';
import { MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS } from './cache-list-descriptors.js';

export const ADOBE_SIGN_CACHE_READINESS_STATES = [
  'live-verified',
  'missing',
  'wrong-type',
  'wrong-unique',
] as const;

export type AdobeSignCacheReadinessState = (typeof ADOBE_SIGN_CACHE_READINESS_STATES)[number];

export interface AdobeSignCacheListFieldSnapshot {
  readonly internalName: string;
  readonly typeAsString: string;
  readonly enforceUniqueValues?: boolean;
}

export interface AdobeSignCacheFieldReadinessEntry {
  readonly internalName: string;
  readonly expectedTypeAsString: string;
  readonly observedTypeAsString: string | null;
  readonly expectedUnique?: boolean;
  readonly observedUnique?: boolean;
  readonly state: AdobeSignCacheReadinessState;
}

export interface AdobeSignCacheListReadinessTarget {
  readonly listName: string;
  readonly listFound: boolean;
  readonly ready: boolean;
  readonly entries: readonly AdobeSignCacheFieldReadinessEntry[];
}

export interface AdobeSignCacheListsSchemaReadinessReport {
  readonly ready: boolean;
  readonly generatedAtUtc: string;
  readonly targets: readonly AdobeSignCacheListReadinessTarget[];
}

function expectedTypeFor(field: IFieldDefinition): string {
  const compatibles = getCompatibleSharePointFieldTypes(field.type);
  return compatibles[0];
}

function classifyField(
  field: IFieldDefinition,
  snapshot: readonly AdobeSignCacheListFieldSnapshot[],
): AdobeSignCacheFieldReadinessEntry {
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

function classifyList(
  descriptor: IListDefinition,
  snapshot: readonly AdobeSignCacheListFieldSnapshot[] | null,
): AdobeSignCacheListReadinessTarget {
  if (snapshot === null) {
    const entries = descriptor.fields.map<AdobeSignCacheFieldReadinessEntry>((field) => ({
      internalName: field.internalName,
      expectedTypeAsString: expectedTypeFor(field),
      observedTypeAsString: null,
      expectedUnique: field.unique === true ? true : undefined,
      state: 'missing',
    }));
    return {
      listName: descriptor.title,
      listFound: false,
      ready: false,
      entries,
    };
  }
  const entries = descriptor.fields.map((field) => classifyField(field, snapshot));
  const ready = entries.every((entry) => entry.state === 'live-verified');
  return {
    listName: descriptor.title,
    listFound: true,
    ready,
    entries,
  };
}

export function buildAdobeSignCacheListsSchemaReadinessReport(input: {
  readonly snapshots: Readonly<Record<string, readonly AdobeSignCacheListFieldSnapshot[] | null>>;
  readonly generatedAtUtc: string;
}): AdobeSignCacheListsSchemaReadinessReport {
  const targets = MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS.map((descriptor) => {
    const snapshot = input.snapshots[descriptor.title];
    return classifyList(descriptor, snapshot === undefined ? null : snapshot);
  });
  const ready = targets.every((target) => target.ready);
  return {
    ready,
    generatedAtUtc: input.generatedAtUtc,
    targets,
  };
}
