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
  const commitSha = nonEmpty(process.env.HBC_FUNCTIONS_BUILD_SHA) ?? UNKNOWN;
  const buildTimestamp = nonEmpty(process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP) ?? UNKNOWN;
  return { version, commitSha, buildTimestamp };
}
