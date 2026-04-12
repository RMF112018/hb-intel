/**
 * useCompanionRole — resolves the operator's HB Kudos governance
 * role against the SharePoint site permission model and exposes the
 * derived capabilities + resolution status + retry handle.
 *
 * The previous inline implementation inside `HbKudosCompanion.tsx`
 * mixed role state, retry plumbing, and capabilities derivation into
 * the main component; extracting it here keeps role resolution
 * testable and lets the orchestration host stay readable.
 */
import * as React from 'react';
import { getSiteUrl } from '../../../homepage/data/spContext.js';
import {
  deriveKudosCapabilities,
  type KudosCapabilities,
  type KudosRole,
} from '../../../homepage/helpers/kudosCapabilities.js';
import {
  resolveKudosRoleStatus,
  type KudosRoleResolutionStatus,
} from '../../../homepage/helpers/kudosRoleResolver.js';

export interface UseCompanionRoleInput {
  currentUserEmail?: string;
  /** Dev-only override supplied via webpart properties. */
  simulatedRole?: unknown;
}

export interface UseCompanionRoleResult {
  role: KudosRole;
  roleResolving: boolean;
  roleStatus: KudosRoleResolutionStatus;
  capabilities: KudosCapabilities;
  retryRoleResolution: () => void;
}

export function useCompanionRole({
  currentUserEmail,
  simulatedRole,
}: UseCompanionRoleInput): UseCompanionRoleResult {
  const [role, setRole] = React.useState<KudosRole>('viewer');
  const [roleResolving, setRoleResolving] = React.useState(true);
  const [roleStatus, setRoleStatus] =
    React.useState<KudosRoleResolutionStatus>('simulated');
  const [roleAttempt, setRoleAttempt] = React.useState(0);
  const retryRoleResolution = React.useCallback(
    () => setRoleAttempt((n) => n + 1),
    [],
  );

  React.useEffect(() => {
    let cancelled = false;
    setRoleResolving(true);
    resolveKudosRoleStatus({
      siteUrl: getSiteUrl(),
      currentUserEmail,
      simulatedRole,
    })
      .then((resolution) => {
        if (!cancelled) {
          setRole(resolution.role);
          setRoleStatus(resolution.status);
          setRoleResolving(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRole('viewer');
          setRoleStatus('resolution-failed');
          setRoleResolving(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // simulatedRole intentionally excluded — dev-only, should not
    // re-trigger production resolution on property pane changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserEmail, roleAttempt]);

  const capabilities = React.useMemo(
    () => deriveKudosCapabilities(role),
    [role],
  );

  return { role, roleResolving, roleStatus, capabilities, retryRoleResolution };
}
