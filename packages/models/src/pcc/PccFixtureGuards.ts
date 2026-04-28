/**
 * PCC fixture-guard utility.
 *
 * Read-model only fixture-guard utility. No runtime mutation, no I/O, no
 * `@hbc/project-site-provisioning` import — Wave 1 scope lock W1-ODR-007.
 *
 * Forbidden keys are exact-name credential and execution/mutation tokens.
 * Read-model health vocabulary like `syncHealth`, `lastSyncStatus`,
 * `procoreSyncEnabled` is allowed; the guard does not blanket-match
 * substrings of `sync` or `mirror`.
 *
 * Phase 3 / Wave 1 / Prompt 06.
 */

/**
 * Exact-name keys that must not appear in PCC fixtures or read-model
 * shapes. Match is case-sensitive equality on the property name.
 */
export const PCC_FORBIDDEN_FIXTURE_KEYS = [
  // Secret / credential keys
  'clientSecret',
  'apiKey',
  'accessToken',
  'refreshToken',
  'bearerToken',
  'procoreSecret',
  // Mutation-intent keys
  'execute',
  'apply',
  'provision',
  'mutate',
  'createSite',
  'createList',
  'createLibrary',
  'createGroup',
  'assignPermission',
  // Mirror / write-back / sync-execution keys (narrowed; read-model
  // health vocabulary like syncHealth/lastSyncStatus is NOT forbidden)
  'mirrorRecords',
  'writeBack',
  'writeback',
  'syncToken',
  'syncClient',
  'syncExecutor',
  'syncCredential',
] as const;

export type PccForbiddenFixtureKey = (typeof PCC_FORBIDDEN_FIXTURE_KEYS)[number];

/**
 * Regex patterns that catch clearly credential-shaped string values.
 * These target secret shapes; they do NOT catch read-model status values
 * such as 'Success', 'healthy', 'Active', or 'pending'.
 */
export const PCC_FORBIDDEN_FIXTURE_VALUE_PATTERNS: readonly RegExp[] = [
  /\bbearer\s+[A-Za-z0-9._-]{8,}/i,
  /\beyJ[A-Za-z0-9._-]{20,}/, // JWT shape
  /\bxox[baprs]-[A-Za-z0-9-]{10,}/, // Slack-style token
  /\bAKIA[0-9A-Z]{16}\b/, // AWS access key id shape
];

const FORBIDDEN_KEY_SET = new Set<string>(PCC_FORBIDDEN_FIXTURE_KEYS);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Recursively walk a value and collect violations.
 *
 * Returns a list of `<keyPath>:<reason>` strings. An empty array means the
 * value is clean. Walks plain objects and arrays only; primitives, Dates,
 * Maps, Sets, etc. are not descended into.
 */
export function findForbiddenFixtureKeys(
  value: unknown,
  path = '',
): readonly string[] {
  const violations: string[] = [];

  if (Array.isArray(value)) {
    value.forEach((item, idx) => {
      violations.push(...findForbiddenFixtureKeys(item, `${path}[${idx}]`));
    });
    return violations;
  }

  if (isPlainObject(value)) {
    for (const [key, val] of Object.entries(value)) {
      const keyPath = path ? `${path}.${key}` : key;
      if (FORBIDDEN_KEY_SET.has(key)) {
        violations.push(`${keyPath}:forbidden-key`);
      }
      if (typeof val === 'string') {
        for (const pattern of PCC_FORBIDDEN_FIXTURE_VALUE_PATTERNS) {
          if (pattern.test(val)) {
            violations.push(`${keyPath}:forbidden-value-pattern`);
            break;
          }
        }
      }
      violations.push(...findForbiddenFixtureKeys(val, keyPath));
    }
    return violations;
  }

  return violations;
}
