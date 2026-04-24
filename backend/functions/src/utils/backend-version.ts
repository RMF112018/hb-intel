import { createRequire } from 'node:module';

export interface IBackendArtifactIdentity {
  version: string;
  commitSha: string;
  buildTimestamp: string;
}

const UNKNOWN = 'unknown';

function readPackageVersion(): string | undefined {
  try {
    const req = createRequire(import.meta.url);
    const candidates = [
      '../../package.json', // from dist/utils
      '../../../package.json', // from src/utils (tests)
    ];
    for (const candidate of candidates) {
      try {
        const parsed = req(candidate) as { name?: string; version?: string };
        if (parsed.name === '@hbc/functions' && typeof parsed.version === 'string') {
          return parsed.version;
        }
      } catch {
        // try next candidate
      }
    }
  } catch {
    // fall through
  }
  return undefined;
}

function nonEmpty(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Normalizes a commit-SHA input so the artifact identity surface is
 * impossible to misread. Any value that is not a 40-character hexadecimal
 * string collapses to `undefined` so the caller falls back to `'unknown'`.
 * Upper-case hex is lower-cased before validation.
 */
function normalizeCommitSha(value: string | undefined): string | undefined {
  const trimmed = nonEmpty(value);
  if (trimmed === undefined) return undefined;
  const lower = trimmed.toLowerCase();
  return /^[0-9a-f]{40}$/.test(lower) ? lower : undefined;
}

/**
 * Normalizes a build-timestamp input to a canonical ISO-8601 UTC string
 * (`YYYY-MM-DDTHH:MM:SS.sssZ`). Any value that `Date.parse` rejects — or
 * that yields a non-finite date — collapses to `undefined` so the caller
 * falls back to `'unknown'`.
 */
function normalizeBuildTimestamp(value: string | undefined): string | undefined {
  const trimmed = nonEmpty(value);
  if (trimmed === undefined) return undefined;
  const ms = Date.parse(trimmed);
  if (!Number.isFinite(ms)) return undefined;
  return new Date(ms).toISOString();
}

/**
 * Resolves backend artifact identity for telemetry stamping and HTTP proof.
 *
 * Precedence:
 *   version:        HBC_FUNCTIONS_BUILD_VERSION  →  @hbc/functions/package.json  →  'unknown'
 *   commitSha:      HBC_FUNCTIONS_BUILD_SHA      →  'unknown'
 *   buildTimestamp: HBC_FUNCTIONS_BUILD_TIMESTAMP →  'unknown'
 *
 * The env overrides are set at deploy time by the CI workflow so that the
 * live host's /api/health and Safety ingestion telemetry both prove which
 * artifact is executing.
 */
export function resolveBackendArtifactIdentity(): IBackendArtifactIdentity {
  const version =
    nonEmpty(process.env.HBC_FUNCTIONS_BUILD_VERSION) ??
    readPackageVersion() ??
    UNKNOWN;
  const commitSha = normalizeCommitSha(process.env.HBC_FUNCTIONS_BUILD_SHA) ?? UNKNOWN;
  const buildTimestamp =
    normalizeBuildTimestamp(process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP) ?? UNKNOWN;
  return { version, commitSha, buildTimestamp };
}
