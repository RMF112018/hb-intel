/**
 * Shared build-time Safety governance defines, used by both
 * `apps/safety/vite.config.ts` and `apps/safety/vitest.config.ts`.
 *
 * Single source: reads `config/package-solution.json`,
 * `config/runtime-binding.json`, and `src/webparts/safety/SafetyWebPart.manifest.json`.
 * Env var overrides (`HBC_SAFETY_*`) apply when set.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(thisDir, '..');

interface SafetyRuntimeBindingFile {
  readonly acceptedBackendOrigin?: string;
  readonly expectedApiAudience?: string;
  readonly defaultFunctionAppUrl?: string;
  readonly defaultApiAudience?: string;
}

function readJson<T>(relPath: string): T {
  return JSON.parse(readFileSync(path.resolve(appDir, relPath), 'utf-8')) as T;
}

function envOrFile(envKey: string, fileValue: string | undefined): string {
  return (process.env[envKey] ?? fileValue ?? '').trim();
}

export function readGovernedSafetyDefines(): Record<string, string> {
  const packageSolution = readJson<{ solution: { version: string } }>(
    'config/package-solution.json',
  );
  const manifest = readJson<{ id: string }>(
    'src/webparts/safety/SafetyWebPart.manifest.json',
  );
  const runtimeBinding = readJson<SafetyRuntimeBindingFile>('config/runtime-binding.json');

  return {
    __HBC_SAFETY_MANIFEST_ID__: JSON.stringify(manifest.id),
    __HBC_SAFETY_PACKAGE_VERSION__: JSON.stringify(packageSolution.solution.version),
    __HBC_SAFETY_ACCEPTED_BACKEND_ORIGIN__: JSON.stringify(
      envOrFile('HBC_SAFETY_ACCEPTED_BACKEND_ORIGIN', runtimeBinding.acceptedBackendOrigin),
    ),
    __HBC_SAFETY_EXPECTED_API_AUDIENCE__: JSON.stringify(
      envOrFile('HBC_SAFETY_EXPECTED_API_AUDIENCE', runtimeBinding.expectedApiAudience),
    ),
    __HBC_SAFETY_DEFAULT_FUNCTION_APP_URL__: JSON.stringify(
      envOrFile('HBC_SAFETY_DEFAULT_FUNCTION_APP_URL', runtimeBinding.defaultFunctionAppUrl),
    ),
    __HBC_SAFETY_DEFAULT_API_AUDIENCE__: JSON.stringify(
      envOrFile('HBC_SAFETY_DEFAULT_API_AUDIENCE', runtimeBinding.defaultApiAudience),
    ),
    __HBC_SAFETY_BUILD_SHA__: JSON.stringify(process.env.HBC_SAFETY_BUILD_SHA ?? ''),
    __HBC_SAFETY_BUILD_TIMESTAMP__: JSON.stringify(
      process.env.HBC_SAFETY_BUILD_TIMESTAMP ?? new Date().toISOString(),
    ),
  };
}
