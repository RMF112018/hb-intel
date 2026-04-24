/**
 * Deterministic, non-cryptographic fingerprint used by the runtime
 * binding proof so operators can correlate deploys/configurations
 * without the proof exposing the underlying list GUIDs, origin
 * allowlist entries, or route paths.
 *
 * FNV-1a 32-bit, zero-padded to 8 hex chars. Not suitable for
 * security (and never used as one); suitable for "did the admin
 * rotate the config between deploys?" diagnostics.
 *
 * Empty inputs collapse to the sentinel `'00000000'` so consumers
 * can distinguish a *present-but-empty* set from an *absent* value
 * (the latter is represented at a higher layer by a `presence: false`
 * boolean — this function never sees `undefined`).
 */

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function fnv1a(input: string): number {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}

export function fingerprintString(value: string): string {
  if (value.length === 0) return '00000000';
  return fnv1a(value).toString(16).padStart(8, '0');
}

export function fingerprintStringSet(values: ReadonlyArray<string>): string {
  if (values.length === 0) return '00000000';
  // Sort + canonical separator so two deploys with the same logical
  // allowlist produce the same fingerprint regardless of order or
  // accidental duplicates.
  const canonical = Array.from(new Set(values)).sort().join('|');
  return fingerprintString(canonical);
}
