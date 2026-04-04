/**
 * P9.1-08: White-Glove Connections page.
 *
 * Displays connector configuration, health status, policy toggles,
 * and test actions for all white-glove device management connectors.
 * No secrets are exposed — only health status and metadata are shown.
 */

import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
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
  HBC_SPACE_LG,
} from '@hbc/ui-kit';
import { useWhiteGloveConnections } from '../hooks/useWhiteGloveConnections.js';
import type { IConnectionRecord } from '../hooks/useWhiteGloveConnections.js';

const useStyles = makeStyles({
  connectorGrid: {
    display: 'flex',
    gap: `${HBC_SPACE_MD}px`,
    flexWrap: 'wrap',
    marginTop: `${HBC_SPACE_MD}px`,
  },
  connectorCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: `${HBC_SPACE_LG * 20}px`,
    padding: `${HBC_SPACE_MD}px`,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  metadataRow: {
    display: 'flex',
    gap: `${HBC_SPACE_LG}px`,
    flexWrap: 'wrap',
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  metadataItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  toggleRow: {
    display: 'flex',
    gap: `${HBC_SPACE_MD}px`,
    flexWrap: 'wrap',
    marginTop: `${HBC_SPACE_SM}px`,
  },
  actions: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_MD}px`,
  },
});

function healthVariant(status: string): 'completed' | 'error' | 'warning' | 'neutral' {
  if (status === 'healthy') return 'completed';
  if (status === 'unhealthy') return 'error';
  return 'neutral';
}

function ConnectorCard({ connection, onTest }: { connection: IConnectionRecord; onTest: (id: string) => void }): ReactNode {
  const styles = useStyles();
  const [testing, setTesting] = useState(false);

  const handleTest = useCallback(async () => {
    setTesting(true);
    try {
      onTest(connection.connectorId);
    } finally {
      setTesting(false);
    }
  }, [connection.connectorId, onTest]);

  return (
    <HbcCard className={styles.connectorCard}>
      <div className={styles.cardHeader}>
        <HbcTypography intent="heading3">{connection.displayName}</HbcTypography>
        <HbcStatusBadge variant={healthVariant(connection.healthStatus)} label={connection.healthStatus} />
      </div>

      <HbcTypography intent="bodySmall">{connection.connectorClass}</HbcTypography>

      <div className={styles.metadataRow}>
        <div className={styles.metadataItem}>
          <HbcTypography intent="label">Config Version</HbcTypography>
          <HbcTypography intent="body">{connection.configVersion}</HbcTypography>
        </div>
        <div className={styles.metadataItem}>
          <HbcTypography intent="label">Credential</HbcTypography>
          <HbcTypography intent="body">{connection.hasCredential ? 'Configured' : 'Not set'}</HbcTypography>
        </div>
        <div className={styles.metadataItem}>
          <HbcTypography intent="label">Last Tested</HbcTypography>
          <HbcTypography intent="body">
            {connection.lastTestedAt ? new Date(connection.lastTestedAt).toLocaleString() : 'Never'}
          </HbcTypography>
        </div>
      </div>

      {connection.lastTestResult === 'failure' && connection.lastTestError && (
        <HbcBanner variant="error">{connection.lastTestError}</HbcBanner>
      )}

      <div className={styles.toggleRow}>
        <HbcStatusBadge variant={connection.policyToggles.enabled ? 'completed' : 'neutral'} label={connection.policyToggles.enabled ? 'Enabled' : 'Disabled'} />
        {connection.policyToggles.dryRunOnly && (
          <HbcStatusBadge variant="warning" label="Dry-run only" />
        )}
        {connection.policyToggles.productionLaunchAllowed && (
          <HbcStatusBadge variant="completed" label="Production allowed" />
        )}
      </div>

      <div className={styles.actions}>
        <HbcButton variant="secondary" onClick={handleTest} disabled={testing}>
          {testing ? 'Testing...' : 'Test Connection'}
        </HbcButton>
      </div>
    </HbcCard>
  );
}

export function WhiteGloveConnectionsPage(): ReactNode {
  const session = useCurrentSession();
  const styles = useStyles();
  const { connections, loading, error, testConnection, refreshConnections } = useWhiteGloveConnections();

  if (!session) {
    return <WorkspacePageShell layout="list" title="Loading..." isLoading>{null}</WorkspacePageShell>;
  }

  if (error && connections.length === 0 && !loading) {
    return (
      <WorkspacePageShell
        layout="list"
        title="White-Glove Connections"
        isError
        errorMessage={error}
        onRetry={() => { refreshConnections().catch(() => {}); }}
      >
        {null}
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell layout="list" title="White-Glove Connections">
      <HbcTypography intent="heading2">Device Management Connectors</HbcTypography>
      <HbcTypography intent="body">
        Configure and validate connections to Microsoft, Apple, and NinjaOne services
        required for white-glove device deployment. Credentials are stored securely in the
        backend and are never displayed.
      </HbcTypography>

      {connections.length === 0 && !loading && (
        <HbcBanner variant="info">
          No white-glove connectors configured yet. Use the backend API or setup wizard to add connectors.
        </HbcBanner>
      )}

      <div className={styles.connectorGrid}>
        {connections.map((conn) => (
          <ConnectorCard
            key={conn.connectorId}
            connection={conn}
            onTest={(id) => { testConnection(id).catch(() => {}); }}
          />
        ))}
      </div>

      <div className={styles.actions}>
        <HbcButton variant="secondary" onClick={() => { refreshConnections().catch(() => {}); }} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </HbcButton>
      </div>
    </WorkspacePageShell>
  );
}
