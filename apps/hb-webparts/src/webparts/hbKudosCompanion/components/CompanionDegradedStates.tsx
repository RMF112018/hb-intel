/**
 * CompanionDegradedStates — dedicated render paths for every
 * non-happy-path state the HB Kudos Approval Companion can be in:
 *
 *   - `role-resolving`   — waiting on the SharePoint permission check
 *   - `role-failed`      — permission check threw; infra failure, NOT
 *                          a permission denial
 *   - `host-unconfigured`— canonical list-host URL is missing
 *   - `access-restricted`— user lacks `canViewGovernance`
 *   - `loading`          — data load in flight
 *   - `load-error`       — data load failed
 *
 * Each render path preserves the exact `data-hbc-state` / `testid`
 * contract the harness and smoke tests assert against.
 */
import * as React from 'react';
import { HbcEmptyState, HbcSpinner } from '@hbc/ui-kit/homepage';
import {
  KudosActionButton,
  KudosGovernanceErrorAlert,
  kudosCSSVars,
} from '../../../homepage/shared/KudosGovernancePrimitives.js';
import type { KudosRole } from '../../../homepage/helpers/kudosCapabilities.js';
import companionStyles from '../companion.module.css';

const ROOT_CLASS = companionStyles.root;
const CENTERED_CLASS = companionStyles.stateCentered;

export function CompanionRoleResolving(): React.JSX.Element {
  return (
    <section
      data-hbc-webpart="hb-kudos-companion"
      data-hbc-state="role-resolving"
      className={CENTERED_CLASS}
    >
      <HbcSpinner size="md" />
    </section>
  );
}

export function CompanionRoleResolutionFailed({
  onRetry,
}: {
  onRetry: () => void;
}): React.JSX.Element {
  return (
    <section
      data-hbc-webpart="hb-kudos-companion"
      data-hbc-state="role-resolution-failed"
      data-hbc-testid="hb-kudos-companion-role-error"
      aria-label="HB Kudos Approval Companion"
      className={ROOT_CLASS}
      style={kudosCSSVars()}
    >
      <KudosGovernanceErrorAlert message="Unable to verify your HB Kudos governance role. This is a permission-check failure, not an access denial." />
      <HbcEmptyState
        title="Permission check unavailable"
        description="The companion could not reach the SharePoint permission model to confirm your role. Try again; if the problem persists, contact your SharePoint admin."
        primaryAction={
          <KudosActionButton
            label="Retry"
            tone="info"
            disabled={false}
            onClick={onRetry}
            testId="hb-kudos-companion-role-error-retry"
          />
        }
      />
    </section>
  );
}

export function CompanionHostUnconfigured(): React.JSX.Element {
  return (
    <section
      data-hbc-webpart="hb-kudos-companion"
      data-hbc-state="host-unconfigured"
      data-hbc-testid="hb-kudos-companion-host-missing"
      aria-label="HB Kudos Approval Companion"
      className={ROOT_CLASS}
      style={kudosCSSVars()}
    >
      <HbcEmptyState
        title="Workspace not configured"
        description="No Kudos list host is available. This webpart must be deployed with a valid kudosListHostUrl (canonical: HBCentral). Contact your SharePoint admin."
      />
    </section>
  );
}

export function CompanionAccessRestricted({
  role,
}: {
  role: KudosRole;
}): React.JSX.Element {
  return (
    <section data-hbc-webpart="hb-kudos-companion" data-hbc-role={role}>
      <HbcEmptyState
        title="Access restricted"
        description="This governance workspace is available to HB Kudos admins and reviewers. Contact your SharePoint admin if you believe you should have access."
      />
    </section>
  );
}

export function CompanionLoading(): React.JSX.Element {
  return (
    <section
      data-hbc-webpart="hb-kudos-companion"
      data-hbc-state="loading"
      className={CENTERED_CLASS}
    >
      <HbcSpinner size="md" />
    </section>
  );
}

export function CompanionLoadError({
  role,
  loadError,
  onRetry,
}: {
  role: KudosRole;
  loadError: string;
  onRetry: () => void;
}): React.JSX.Element {
  return (
    <section
      data-hbc-webpart="hb-kudos-companion"
      data-hbc-state="load-error"
      data-hbc-testid="hb-kudos-companion-load-error"
      data-hbc-role={role}
      aria-label="HB Kudos Approval Companion"
      className={ROOT_CLASS}
      style={kudosCSSVars()}
    >
      <KudosGovernanceErrorAlert
        message={`Unable to load kudos data: ${loadError}. This is a data-load problem, not an empty queue.`}
      />
      <HbcEmptyState
        title="Kudos data unavailable"
        description="The governance workspace could not load kudos from SharePoint. Try refreshing; if the problem persists, contact your SharePoint admin."
        primaryAction={
          <KudosActionButton
            label="Retry"
            tone="info"
            disabled={false}
            onClick={onRetry}
            testId="hb-kudos-companion-load-error-retry"
          />
        }
      />
    </section>
  );
}
