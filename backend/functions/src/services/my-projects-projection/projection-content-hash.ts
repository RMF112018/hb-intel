/**
 * Deterministic key + content-hash helpers for the My Projects Registry
 * projection.
 *
 * `ProjectionKey`        — sha256(lower(UserUpn) + "|" + RecordKey).
 *                          Unique upsert identifier (also a SharePoint unique-value
 *                          constraint on the list).
 *
 * `ProjectionContentHash`— sha256 of a canonicalized JSON serialization of the
 *                          business-relevant projection fields. Lets the slice
 *                          engine skip no-op SharePoint updates when only
 *                          operational metadata (LastProjectedAtUtc /
 *                          ProjectionBatchId) would change.
 */

import { createHash } from 'node:crypto';

import type { MyProjectLinkItem } from '@hbc/models/myWork';

const PROJECTION_KEY_SEPARATOR = '|';

export function normalizeUpnForKey(upn: string): string {
  return upn.trim().toLowerCase();
}

export function computeProjectionKey(upn: string, recordKey: string): string {
  const normalizedUpn = normalizeUpnForKey(upn);
  const composite = `${normalizedUpn}${PROJECTION_KEY_SEPARATOR}${recordKey}`;
  return createHash('sha256').update(composite).digest('hex');
}

/**
 * Deterministic JSON canonicalization: object keys sorted lexicographically at
 * every depth. Arrays preserve order (semantic). Booleans/numbers/strings
 * passthrough. `undefined` properties are skipped (matches JSON.stringify's
 * own behavior, but applied explicitly during sort so the canonical form
 * matches between Node versions / property-insertion orders).
 */
function canonicalize(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalize(entry));
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort();
  const output: Record<string, unknown> = {};
  for (const key of keys) {
    output[key] = canonicalize(record[key]);
  }
  return output;
}

export interface IProjectionContentHashInput {
  readonly upn: string;
  readonly recordKey: string;
  readonly item: MyProjectLinkItem;
}

/**
 * Hashes the business-relevant fields of the projection. Intentionally
 * EXCLUDES `LastProjectedAtUtc` and `ProjectionBatchId` so an unchanged
 * projection short-circuits before any SharePoint write.
 *
 * Includes:
 *   - normalized UPN
 *   - record key
 *   - the entire MyProjectLinkItem (source, project display fields,
 *     assignment roles, four launch actions with state/label/href,
 *     provenance, warnings).
 */
export function computeProjectionContentHash(input: IProjectionContentHashInput): string {
  const canonical = canonicalize({
    upn: normalizeUpnForKey(input.upn),
    recordKey: input.recordKey,
    item: input.item,
  });
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}
