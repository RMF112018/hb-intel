/**
 * Internal mapping utilities shared by all source adapters.
 * Not exported from the package barrel — consumed only by adapter implementations.
 */

import type {
  MyWorkSource,
  IMyWorkTimestampState,
  IMyWorkSourceMeta,
} from '../types/index.js';

/** Build a namespaced work-item ID: `'{source}::{id}'` */
export function buildWorkItemId(source: MyWorkSource, id: string): string {
  return `${source}::${id}`;
}

/** Build a canonical key: `'{moduleKey}::{recordId}'` */
export function buildCanonicalKey(moduleKey: string, recordId: string): string {
  return `${moduleKey}::${recordId}`;
}

/** Build a deduplication key: `'{moduleKey}::{recordType}::{recordId}'` */
export function buildDedupeKey(
  moduleKey: string,
  recordType: string,
  recordId: string,
): string {
  return `${moduleKey}::${recordType}::${recordId}`;
}

/** Build timestamp state from ISO strings */
export function buildDefaultTimestamps(
  createdAtIso: string,
  updatedAtIso?: string,
): IMyWorkTimestampState {
  return {
    createdAtIso,
    updatedAtIso: updatedAtIso ?? createdAtIso,
    markedReadAtIso: null,
    markedDeferredAtIso: null,
    deferredUntilIso: null,
  };
}

/** Build source metadata entry */
export function buildSourceMeta(
  source: MyWorkSource,
  sourceItemId: string,
  updatedAtIso: string,
): IMyWorkSourceMeta {
  return {
    source,
    sourceItemId,
    sourceUpdatedAtIso: updatedAtIso,
  };
}
