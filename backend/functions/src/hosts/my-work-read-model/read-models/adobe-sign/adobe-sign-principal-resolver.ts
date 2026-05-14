/**
 * Adobe Sign principal resolver — B05 remediation Prompt 05.
 *
 * Production factory that turns an authenticated `MyWorkReadContext`
 * into a closed `AdobeSignPrincipalResolutionResult` discriminant. The
 * resolver is the only sanctioned path through which the action-queue
 * adapter (and any future read-model surface) decides whether to
 * proceed with an outbound Adobe call.
 *
 * Boundary guarantees:
 *
 *   - The actor key is always derived from trusted-tenant + Entra OID
 *     via `normalizeAdobeSignActor`. Email / UPN never participate in
 *     the lookup — they exist only as display snapshots inside the
 *     grant record.
 *   - No shared-principal fallback. A user with no grant on file
 *     receives `'authorization-required'`, never a borrowed principal
 *     from another actor.
 *   - Store-resolver readiness gaps are surfaced as
 *     `'configuration-required'`, not as `'source-unavailable'` — they
 *     reflect operator wiring rather than transient provider failure.
 *   - Grant-store `findGrant` throws map to `'source-unavailable'` so
 *     a transient table outage cannot push a healthy user into a
 *     reauth state.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-principal-resolver
 */

import type { MyWorkReadContext } from '../my-work-read-model-provider.js';

import { normalizeAdobeSignActor } from './adobe-sign-actor-normalizer.js';
import {
  isAdobeSignConfigReady,
  resolveAdobeSignOAuthConfigReadiness,
  type EnvLike,
} from './adobe-sign-config.js';
import type { AdobeSignGrantStoreReadiness } from './adobe-sign-grant-store.js';
import { toAdobeSignGrantPublic } from './adobe-sign-grant-record.js';
import type { AdobeSignPrincipalResolutionResult } from './adobe-sign-principal-resolution.js';
import { toMyWorkSourceStatus } from './adobe-sign-principal-resolution.js';
import { AdobeSignRuntimeDiagnosticError } from './adobe-sign-runtime-diagnostics.js';

export interface AdobeSignPrincipalResolverDeps {
  readonly resolveTenantId: () => string | undefined;
  readonly resolveConfigEnv: () => EnvLike;
  readonly resolveGrantStore: () => AdobeSignGrantStoreReadiness;
}

export type AdobeSignPrincipalResolver = (
  context: MyWorkReadContext,
) => Promise<AdobeSignPrincipalResolutionResult>;

export function createAdobeSignPrincipalResolver(
  deps: AdobeSignPrincipalResolverDeps,
): AdobeSignPrincipalResolver {
  return async (context) => {
    const trackResult = (result: AdobeSignPrincipalResolutionResult): AdobeSignPrincipalResolutionResult => {
      context.diagnostics?.trackAdobeSignRuntimeEvent('adobeSign.read.principalResolution.result', {
        status: result.status,
        sourceStatus: toMyWorkSourceStatus(result.status),
        reason: 'reason' in result ? String(result.reason) : undefined,
      });
      return result;
    };

    // ---------------------------------------------------------------
    // 1. Trusted tenant required for actor-key construction.
    // ---------------------------------------------------------------
    const tenantId = deps.resolveTenantId();
    if (typeof tenantId !== 'string' || tenantId.trim().length === 0) {
      return trackResult({ status: 'principal-unresolved', reason: 'missing-tenant' });
    }

    // ---------------------------------------------------------------
    // 2. OAuth + token-store mode config gate.
    // ---------------------------------------------------------------
    const env = deps.resolveConfigEnv();
    const readiness = resolveAdobeSignOAuthConfigReadiness(env);
    if (!isAdobeSignConfigReady(readiness)) {
      return trackResult({
        status: 'configuration-required',
        missingKeys: readiness.missingKeys,
        pendingStoreSelection: readiness.status === 'pending-store-selection',
      });
    }

    // ---------------------------------------------------------------
    // 3. Actor normalization (tenant + oid, never email).
    // ---------------------------------------------------------------
    const oid = context.actor.hbcUserId ?? '';
    const upn = context.actor.principalName ?? '';
    const displayName = context.actor.displayName;
    const actorResult = normalizeAdobeSignActor({
      tenantId,
      claims: {
        oid,
        upn,
        displayName,
        roles: [],
      },
    });
    if (!actorResult.ok) {
      return trackResult({ status: 'principal-unresolved', reason: actorResult.reason });
    }
    const actor = actorResult.actor;

    // ---------------------------------------------------------------
    // 4. Grant store must be wired (Prompt 02 resolver).
    // ---------------------------------------------------------------
    const grantStore = deps.resolveGrantStore();
    if (grantStore.readiness !== 'ready') {
      return trackResult({
        status: 'configuration-required',
        missingKeys: [],
        pendingStoreSelection: true,
      });
    }

    // ---------------------------------------------------------------
    // 5. Grant lookup (transient throw → source-unavailable).
    // ---------------------------------------------------------------
    let grant;
    try {
      grant = await grantStore.store.findGrant(actor.actorKey);
    } catch (err: unknown) {
      if (err instanceof AdobeSignRuntimeDiagnosticError) {
        context.diagnostics?.trackAdobeSignRuntimeEvent('adobe-sign-runtime-failure', err.diagnostic);
      }
      return trackResult({ status: 'source-unavailable', reason: 'token-store-unavailable' });
    }

    if (!grant) {
      return trackResult({ status: 'authorization-required', actor, reason: 'no-grant-found' });
    }
    if (grant.state === 'revoked') {
      return trackResult({ status: 'authorization-required', actor, reason: 'grant-revoked' });
    }
    if (grant.state === 'requires-reauth') {
      return trackResult({
        status: 'authorization-required',
        actor,
        reason: 'grant-requires-reauth',
      });
    }
    if (grant.state === 'pending') {
      return trackResult({ status: 'authorization-required', actor, reason: 'no-grant-found' });
    }

    // grant.state === 'active'
    return trackResult({
      status: 'resolved',
      principal: {
        actor,
        adobeApiAccessPoint: grant.adobeApiAccessPoint,
        adobeWebAccessPoint: grant.adobeWebAccessPoint,
        grantedScopes: grant.grantedScopes,
        grantState: 'active',
      },
      grantPublic: toAdobeSignGrantPublic(grant),
    });
  };
}
