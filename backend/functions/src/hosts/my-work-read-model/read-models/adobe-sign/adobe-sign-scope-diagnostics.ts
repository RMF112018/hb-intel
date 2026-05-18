/**
 * Adobe Sign OAuth scope diagnostics — pure helper.
 *
 * Computes a safe, deterministic telemetry payload that compares the set
 * of OAuth scopes the deployment has *configured* via
 * `ADOBE_SIGN_OAUTH_SCOPES` against the set Adobe actually *granted* on
 * the most recent code exchange (or the set persisted on the grant
 * record for the token-service scope-insufficient path).
 *
 * The helper is non-throwing for any input. Every scope string is
 * sanitized before it appears in CSV output so a malformed Adobe
 * response cannot leak vendor-controlled payload fragments into
 * telemetry.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-scope-diagnostics
 */

const ALLOWED_SCOPE_PATTERN = /^[a-z0-9_\-:.]+$/;
const SCOPE_MAX_LENGTH = 96;
const CSV_MAX_ENTRIES = 20;
const CSV_MAX_LENGTH = 1024;

/** Scope literals checked for boolean presence on both sides of the comparison. */
export const ADOBE_SCOPE_DIAGNOSTIC_LITERALS = {
  agreementReadSelf: 'agreement_read:self',
  agreementWriteSelf: 'agreement_write:self',
} as const;

export interface AdobeScopeDiagnosticsPayload {
  readonly configuredScopeCount: number;
  readonly grantedScopeCount: number;
  readonly missingGovernedScopeCount: number;
  readonly hasAgreementReadSelfConfigured: boolean;
  readonly hasAgreementWriteSelfConfigured: boolean;
  readonly hasAgreementReadSelfGranted: boolean;
  readonly hasAgreementWriteSelfGranted: boolean;
  readonly missingGovernedScopesCsv?: string;
  readonly grantedScopesCsv?: string;
}

/**
 * Validate and normalize a scope-like value for safe telemetry emission.
 *
 * Rules (verbatim from the diagnostic contract):
 *   - Accept strings only.
 *   - Trim.
 *   - Lowercase.
 *   - Allow only lowercase letters, digits, `_`, `-`, `:`, `.`.
 *   - Reject empty strings.
 *   - Reject values longer than 96 characters.
 *   - Return `undefined` for invalid values.
 */
export function sanitizeAdobeScopeTelemetryValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized.length === 0) return undefined;
  if (normalized.length > SCOPE_MAX_LENGTH) return undefined;
  if (!ALLOWED_SCOPE_PATTERN.test(normalized)) return undefined;
  return normalized;
}

function sanitizeScopeList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  for (const raw of values) {
    const sanitized = sanitizeAdobeScopeTelemetryValue(raw);
    if (sanitized) seen.add(sanitized);
  }
  return Array.from(seen).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function buildCsv(values: readonly string[]): string | undefined {
  if (values.length === 0) return undefined;
  if (values.length > CSV_MAX_ENTRIES) return undefined;
  const csv = values.join(',');
  if (csv.length > CSV_MAX_LENGTH) return undefined;
  return csv;
}

export interface AdobeScopeDiagnosticsInput {
  readonly configuredScopes: unknown;
  readonly grantedScopes: unknown;
}

/**
 * Build the safe diagnostic payload. Non-throwing for any input.
 *
 * Counts (`configuredScopeCount`, `grantedScopeCount`,
 * `missingGovernedScopeCount`) reflect *sanitized + deduplicated* sets —
 * the same view of the data that ends up in the CSV fields. The four
 * `has*` booleans are checked against the literal sanitized scope
 * strings `agreement_read:self` and `agreement_write:self`.
 *
 * CSV fields (`missingGovernedScopesCsv`, `grantedScopesCsv`) are
 * deduped, sorted, and bounded; if the bound is exceeded the field is
 * omitted entirely (never truncated).
 */
export function buildAdobeScopeDiagnostics(
  input: AdobeScopeDiagnosticsInput,
): AdobeScopeDiagnosticsPayload {
  const configured = sanitizeScopeList(input.configuredScopes);
  const granted = sanitizeScopeList(input.grantedScopes);
  const grantedSet = new Set(granted);
  const missing = configured.filter((scope) => !grantedSet.has(scope));

  const payload: AdobeScopeDiagnosticsPayload = {
    configuredScopeCount: configured.length,
    grantedScopeCount: granted.length,
    missingGovernedScopeCount: missing.length,
    hasAgreementReadSelfConfigured: configured.includes(
      ADOBE_SCOPE_DIAGNOSTIC_LITERALS.agreementReadSelf,
    ),
    hasAgreementWriteSelfConfigured: configured.includes(
      ADOBE_SCOPE_DIAGNOSTIC_LITERALS.agreementWriteSelf,
    ),
    hasAgreementReadSelfGranted: granted.includes(
      ADOBE_SCOPE_DIAGNOSTIC_LITERALS.agreementReadSelf,
    ),
    hasAgreementWriteSelfGranted: granted.includes(
      ADOBE_SCOPE_DIAGNOSTIC_LITERALS.agreementWriteSelf,
    ),
  };

  const missingCsv = buildCsv(missing);
  const grantedCsv = buildCsv(granted);
  return {
    ...payload,
    ...(missingCsv !== undefined ? { missingGovernedScopesCsv: missingCsv } : {}),
    ...(grantedCsv !== undefined ? { grantedScopesCsv: grantedCsv } : {}),
  };
}
