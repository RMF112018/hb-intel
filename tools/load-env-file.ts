/**
 * Zero-dependency `.env` file loader for the SPFx packaging toolchain.
 *
 * The SPFx packaging orchestrator (`tools/build-spfx-package.ts`) reads
 * runtime-config env vars (`FUNCTION_APP_URL`, `API_AUDIENCE`,
 * `BACKEND_MODE`, ...) only from `process.env`. To give operators a stable
 * local workflow without inline `VAR=… npx tsx …` invocations, this loader
 * reads a repo-root `.env` file and fills `process.env` — but **only for
 * keys that are not already set**, so an explicit environment variable (CI,
 * inline) always wins over the file.
 *
 * No `dotenv` dependency: a tiny `KEY=VALUE` parser covers the format the
 * packaging toolchain needs. A missing file is a silent no-op.
 *
 * @module tools/load-env-file
 */

import fs from 'node:fs';

export interface LoadEnvFileResult {
  /** Keys that were read from the file and set into `process.env`. */
  readonly loaded: readonly string[];
  /**
   * Keys present in the file but skipped because they were already set in
   * `process.env` (explicit env wins).
   */
  readonly skipped: readonly string[];
}

/**
 * Parse a single `.env` line into a `[key, value]` pair, or `null` for
 * blank lines, comment lines, and malformed lines (no `=`, empty key).
 * Strips one layer of matched surrounding single or double quotes from
 * the value. Values may themselves contain `=`.
 */
function parseEnvLine(rawLine: string): readonly [string, string] | null {
  const line = rawLine.trim();
  if (line.length === 0 || line.startsWith('#')) {
    return null;
  }
  const eqIndex = line.indexOf('=');
  if (eqIndex <= 0) {
    // No `=`, or `=` is the first char (empty key) — malformed; skip.
    return null;
  }
  const key = line.slice(0, eqIndex).trim();
  if (key.length === 0) {
    return null;
  }
  let value = line.slice(eqIndex + 1).trim();
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      value = value.slice(1, -1);
    }
  }
  return [key, value];
}

/**
 * Load a `.env` file into `process.env`. Keys already present in
 * `process.env` are left untouched (explicit env wins). A missing file is
 * a silent no-op. Malformed lines are skipped without throwing.
 */
export function loadEnvFileIntoProcessEnv(envPath: string): LoadEnvFileResult {
  let contents: string;
  try {
    contents = fs.readFileSync(envPath, 'utf8');
  } catch {
    // Missing / unreadable file — silent no-op by design.
    return { loaded: [], skipped: [] };
  }

  const loaded: string[] = [];
  const skipped: string[] = [];

  for (const rawLine of contents.split(/\r?\n/)) {
    const parsed = parseEnvLine(rawLine);
    if (!parsed) continue;
    const [key, value] = parsed;
    if (Object.prototype.hasOwnProperty.call(process.env, key) && process.env[key] !== undefined) {
      skipped.push(key);
      continue;
    }
    process.env[key] = value;
    loaded.push(key);
  }

  return { loaded, skipped };
}
