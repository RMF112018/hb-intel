/**
 * Governed Safety runtime binding — the single source of truth for:
 *   - SPFx webpart manifest id
 *   - Safety package-solution version
 *   - accepted backend origin (independent allowlist, not derived from
 *     property-pane input)
 *   - expected API audience (independent of property-pane input)
 *   - build sha / build timestamp (release identity, optional)
 *   - hosted GUID overlay fingerprint (re-exported from the overlay module)
 *
 * Values are baked in at build time via Vite `define` (see
 * `apps/safety/vite.config.ts`). The Vite config reads from:
 *   - `apps/safety/config/package-solution.json` — authoritative package version
 *   - `apps/safety/config/runtime-binding.json` — governed origin + audience
 *   - `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json` — manifest id
 *   - env `HBC_SAFETY_BUILD_SHA` / `HBC_SAFETY_BUILD_TIMESTAMP`
 *
 * Vitest honors the same Vite `define`, so these constants resolve in tests.
 * The `typeof` guards keep the module safe in tooling paths that don't apply
 * the define (isolated typecheck, ad-hoc ts-node execution).
 *
 * DO NOT hardcode these values anywhere else in the app — import from here.
 */

import { hostedSafetyGuidOverlayFingerprint } from './hostedSafetyGuidBinding.js';

declare const __HBC_SAFETY_MANIFEST_ID__: string;
declare const __HBC_SAFETY_PACKAGE_VERSION__: string;
declare const __HBC_SAFETY_ACCEPTED_BACKEND_ORIGIN__: string;
declare const __HBC_SAFETY_EXPECTED_API_AUDIENCE__: string;
declare const __HBC_SAFETY_DEFAULT_FUNCTION_APP_URL__: string;
declare const __HBC_SAFETY_DEFAULT_API_AUDIENCE__: string;
declare const __HBC_SAFETY_BUILD_SHA__: string;
declare const __HBC_SAFETY_BUILD_TIMESTAMP__: string;

export const SAFETY_WEBPART_MANIFEST_ID: string =
  typeof __HBC_SAFETY_MANIFEST_ID__ === 'string' && __HBC_SAFETY_MANIFEST_ID__
    ? __HBC_SAFETY_MANIFEST_ID__
    : 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e';

export const SAFETY_PACKAGE_VERSION: string =
  typeof __HBC_SAFETY_PACKAGE_VERSION__ === 'string' && __HBC_SAFETY_PACKAGE_VERSION__
    ? __HBC_SAFETY_PACKAGE_VERSION__
    : '0.0.0.0';

export const SAFETY_ACCEPTED_BACKEND_ORIGIN: string =
  typeof __HBC_SAFETY_ACCEPTED_BACKEND_ORIGIN__ === 'string'
    ? __HBC_SAFETY_ACCEPTED_BACKEND_ORIGIN__
    : '';

export const SAFETY_EXPECTED_API_AUDIENCE: string =
  typeof __HBC_SAFETY_EXPECTED_API_AUDIENCE__ === 'string'
    ? __HBC_SAFETY_EXPECTED_API_AUDIENCE__
    : '';

export const SAFETY_DEFAULT_FUNCTION_APP_URL: string =
  typeof __HBC_SAFETY_DEFAULT_FUNCTION_APP_URL__ === 'string'
    ? __HBC_SAFETY_DEFAULT_FUNCTION_APP_URL__
    : '';

export const SAFETY_DEFAULT_API_AUDIENCE: string =
  typeof __HBC_SAFETY_DEFAULT_API_AUDIENCE__ === 'string'
    ? __HBC_SAFETY_DEFAULT_API_AUDIENCE__
    : '';

export const SAFETY_BUILD_SHA: string =
  typeof __HBC_SAFETY_BUILD_SHA__ === 'string' ? __HBC_SAFETY_BUILD_SHA__ : '';

export const SAFETY_BUILD_TIMESTAMP: string =
  typeof __HBC_SAFETY_BUILD_TIMESTAMP__ === 'string'
    ? __HBC_SAFETY_BUILD_TIMESTAMP__
    : '';

export interface GovernedSafetyBinding {
  readonly manifestId: string;
  readonly packageVersion: string;
  readonly acceptedBackendOrigin: string;
  readonly expectedApiAudience: string;
  readonly hostedGuidOverlayFingerprint: string;
  readonly buildSha: string;
  readonly buildTimestamp: string;
}

export function governedSafetyBinding(): GovernedSafetyBinding {
  return {
    manifestId: SAFETY_WEBPART_MANIFEST_ID,
    packageVersion: SAFETY_PACKAGE_VERSION,
    acceptedBackendOrigin: SAFETY_ACCEPTED_BACKEND_ORIGIN,
    expectedApiAudience: SAFETY_EXPECTED_API_AUDIENCE,
    hostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
    buildSha: SAFETY_BUILD_SHA,
    buildTimestamp: SAFETY_BUILD_TIMESTAMP,
  };
}
