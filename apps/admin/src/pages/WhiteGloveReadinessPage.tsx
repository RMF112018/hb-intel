/**
 * P9.1-08: White-Glove Readiness page.
 *
 * Summarizes environment readiness for white-glove device deployment:
 * connector status, package template completeness, standards bundle
 * availability, and run store readiness.
 */

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import {
  WorkspacePageShell,
  HbcCard,
  HbcTypography,
  HbcButton,
  HbcStatusBadge,
  HbcBanner,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
} from '@hbc/ui-kit';
import { useWhiteGloveReadiness } from '../hooks/useWhiteGloveReadiness.js';

const useStyles = makeStyles({
  verdictCard: {
    padding: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  verdictHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  checksSection: {
    marginTop: `${HBC_SPACE_MD}px`,
  },
  checkRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${HBC_SPACE_SM}px 0`,
  },
  checkInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  actions: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_MD}px`,
  },
});

export function WhiteGloveReadinessPage(): ReactNode {
  const session = useCurrentSession();
  const styles = useStyles();
  const { ready, checks, loading, error, runReadinessCheck } = useWhiteGloveReadiness();

  useEffect(() => {
    if (session) {
      runReadinessCheck().catch(() => {});
    }
  }, [session, runReadinessCheck]);

  if (!session) {
    return <WorkspacePageShell layout="list" title="Loading..." isLoading>{null}</WorkspacePageShell>;
  }

  const connectorChecks = checks.filter((c) => c.category === 'connector');
  const templateChecks = checks.filter((c) => c.category === 'template');
  const environmentChecks = checks.filter((c) => c.category === 'environment');
  const blockingFailures = checks.filter((c) => c.blocking && !c.passed);

  return (
    <WorkspacePageShell layout="list" title="White-Glove Readiness">
      <HbcCard className={styles.verdictCard}>
        <div className={styles.verdictHeader}>
          <HbcTypography intent="heading2">Environment Readiness</HbcTypography>
          {checks.length > 0 && (
            <HbcStatusBadge variant={ready ? 'completed' : 'error'} label={ready ? 'Ready' : 'Not Ready'} />
          )}
        </div>
        {checks.length === 0 && !loading && (
          <HbcTypography intent="body">Click "Run Readiness Check" to evaluate the environment.</HbcTypography>
        )}
        {blockingFailures.length > 0 && (
          <HbcBanner variant="warning">
            {blockingFailures.length} blocking issue{blockingFailures.length > 1 ? 's' : ''} must be resolved before launching packages.
          </HbcBanner>
        )}
        {error && <HbcBanner variant="error">{error}</HbcBanner>}
      </HbcCard>

      {connectorChecks.length > 0 && (
        <div className={styles.checksSection}>
          <HbcTypography intent="heading3">Connector Status</HbcTypography>
          {connectorChecks.map((check) => (
            <div key={check.checkId} className={styles.checkRow}>
              <div className={styles.checkInfo}>
                <HbcTypography intent="body">{check.label}</HbcTypography>
                <HbcTypography intent="bodySmall">{check.message}</HbcTypography>
              </div>
              <HbcStatusBadge variant={check.passed ? 'completed' : 'error'} label={check.passed ? 'Pass' : 'Fail'} />
            </div>
          ))}
        </div>
      )}

      {templateChecks.length > 0 && (
        <div className={styles.checksSection}>
          <HbcTypography intent="heading3">Package Templates</HbcTypography>
          {templateChecks.map((check) => (
            <div key={check.checkId} className={styles.checkRow}>
              <div className={styles.checkInfo}>
                <HbcTypography intent="body">{check.label}</HbcTypography>
                <HbcTypography intent="bodySmall">{check.message}</HbcTypography>
              </div>
              <HbcStatusBadge variant={check.passed ? 'completed' : 'error'} label={check.passed ? 'Pass' : 'Fail'} />
            </div>
          ))}
        </div>
      )}

      {environmentChecks.length > 0 && (
        <div className={styles.checksSection}>
          <HbcTypography intent="heading3">Environment</HbcTypography>
          {environmentChecks.map((check) => (
            <div key={check.checkId} className={styles.checkRow}>
              <div className={styles.checkInfo}>
                <HbcTypography intent="body">{check.label}</HbcTypography>
                <HbcTypography intent="bodySmall">{check.message}</HbcTypography>
              </div>
              <HbcStatusBadge variant={check.passed ? 'completed' : 'error'} label={check.passed ? 'Pass' : 'Fail'} />
            </div>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <HbcButton variant="primary" onClick={() => { runReadinessCheck().catch(() => {}); }} disabled={loading}>
          {loading ? 'Checking...' : 'Run Readiness Check'}
        </HbcButton>
      </div>
    </WorkspacePageShell>
  );
}
