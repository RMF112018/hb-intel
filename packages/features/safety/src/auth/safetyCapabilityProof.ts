/**
 * Debug-safe proof publisher for the Safety frontend capability bridge.
 *
 * Mirrors the existing `__hbIntel_safetyRuntimeBindingProof` pattern: emits a
 * non-secret diagnostic object to `globalThis` and `window` so hosted
 * troubleshooting can capture the resolved authority path without leaking
 * tokens, signatures, or other sensitive material.
 *
 * SECURITY: this module accepts and emits ONLY the documented allow-list
 * fields. Raw bearer tokens, JWT signatures, authorization headers, and
 * refresh tokens never reach this surface — callers must not pass them in.
 */

import type { ApiTokenAuthority } from './spfxApiTokenAuthority.js';
import type { SafetyCapabilities } from './safetyCapabilities.js';

export type SafetyCapabilitySourcePath =
  | 'api-token-roles'
  | 'spfx-permission-keys-diagnostic-only'
  | 'token-unavailable'
  | 'unknown';

export type SafetyCapabilityTokenStatus =
  | 'pending'
  | 'ok'
  | 'failed'
  | 'no-scope'
  | 'audience-mismatch'
  | 'expired';

export interface SafetyCapabilityProofDecoded {
  readonly aud: string | null;
  readonly iss: string | null;
  readonly tid: string | null;
  readonly hasAccessAsUserScope: boolean;
}

export interface SafetyCapabilityProof {
  readonly generatedAt: string;
  readonly sourcePath: SafetyCapabilitySourcePath;
  readonly tokenStatus: SafetyCapabilityTokenStatus;
  readonly tokenErrorClass?: string;
  readonly decoded: SafetyCapabilityProofDecoded | null;
  readonly resolvedRoles: readonly string[];
  readonly permissionKeys: readonly string[];
  readonly capabilities: {
    readonly canPreview: boolean;
    readonly canIngest: boolean;
    readonly canReplay: boolean;
  };
  readonly capabilityState: SafetyCapabilities['state'];
}

export interface PublishSafetyCapabilityProofInput {
  readonly authority?: ApiTokenAuthority | { readonly status: 'pending' };
  readonly capabilities: SafetyCapabilities;
  readonly resolvedRoles: readonly string[];
  readonly permissionKeys: readonly string[];
  readonly hasProvider: boolean;
}

export const SAFETY_CAPABILITY_PROOF_GLOBAL_KEY = '__hbIntel_safetyCapabilityProof';

/**
 * Build a debug-safe proof object from the inputs. Pure function — useful in
 * tests that want to assert the proof shape without globalThis side effects.
 */
export function buildSafetyCapabilityProof(
  input: PublishSafetyCapabilityProofInput,
): SafetyCapabilityProof {
  const { authority, capabilities, resolvedRoles, permissionKeys, hasProvider } = input;

  const tokenStatus: SafetyCapabilityTokenStatus = !authority
    ? hasProvider
      ? 'pending'
      : 'failed'
    : authority.status === 'pending'
      ? 'pending'
      : authority.status;

  let decoded: SafetyCapabilityProofDecoded | null = null;
  if (authority && authority.status !== 'pending' && authority.status !== 'failed') {
    if ('decoded' in authority && authority.decoded) {
      decoded = {
        aud: authority.decoded.aud,
        iss: authority.decoded.iss,
        tid: authority.decoded.tid,
        hasAccessAsUserScope:
          authority.status === 'ok' ? authority.hasAccessAsUserScope : false,
      };
    }
  }

  let tokenErrorClass: string | undefined;
  if (authority && authority.status !== 'pending' && authority.status !== 'ok') {
    tokenErrorClass = authority.errorClass;
  }

  let sourcePath: SafetyCapabilitySourcePath;
  if (capabilities.state === 'authorized') {
    sourcePath = 'api-token-roles';
  } else if (
    capabilities.state === 'token-unavailable' ||
    capabilities.state === 'scope-missing'
  ) {
    sourcePath = 'token-unavailable';
  } else if (capabilities.state === 'pending') {
    sourcePath = 'unknown';
  } else if (permissionKeys.length > 0) {
    // unauthorized but SP permission keys exist — surface the diagnostic side-channel
    sourcePath = 'spfx-permission-keys-diagnostic-only';
  } else {
    sourcePath = 'unknown';
  }

  return {
    generatedAt: new Date().toISOString(),
    sourcePath,
    tokenStatus,
    ...(tokenErrorClass !== undefined ? { tokenErrorClass } : {}),
    decoded,
    resolvedRoles: [...resolvedRoles],
    permissionKeys: [...permissionKeys],
    capabilities: {
      canPreview: capabilities.canPreview,
      canIngest: capabilities.canIngest,
      canReplay: capabilities.canReplay,
    },
    capabilityState: capabilities.state,
  };
}

/**
 * Publish the proof to `globalThis` and `window` so hosted DevTools can
 * inspect `window.__hbIntel_safetyCapabilityProof` directly.
 */
export function publishSafetyCapabilityProof(
  input: PublishSafetyCapabilityProofInput,
): SafetyCapabilityProof {
  const proof = buildSafetyCapabilityProof(input);
  (
    globalThis as unknown as {
      __hbIntel_safetyCapabilityProof?: SafetyCapabilityProof;
    }
  ).__hbIntel_safetyCapabilityProof = proof;
  if (typeof window !== 'undefined' && globalThis !== window) {
    (
      window as unknown as {
        __hbIntel_safetyCapabilityProof?: SafetyCapabilityProof;
      }
    ).__hbIntel_safetyCapabilityProof = proof;
  }
  return proof;
}
