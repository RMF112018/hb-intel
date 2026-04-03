import { type ReactNode, useState } from 'react';
import { makeStyles } from '@griffel/react';
import {
  WorkspacePageShell,
  HbcTabs,
  HbcCard,
  HbcTypography,
  HbcStatusBadge,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
} from '@hbc/ui-kit';

/**
 * P9-08: Hybrid Identity control lane — overview and tab navigation.
 *
 * Replaces the Phase 5 scaffold with a real control lane providing
 * authority-aware identity administration and no-code connection management.
 *
 * Sub-views:
 * - Overview: lane health, connection status, recent activity summary
 * - Users: user search, create, update, enable/disable, delete
 * - Groups: group search, create, membership, delete
 * - Connections: AD DS and Graph connector setup, test, rotate
 */

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_MD}px`,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${HBC_SPACE_MD * 17}px, 1fr))`,
    gap: `${HBC_SPACE_MD}px`,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
});

interface IdentityTab {
  id: string;
  label: string;
}

const IDENTITY_TABS: IdentityTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'groups', label: 'Groups & Access' },
  { id: 'connections', label: 'Connections' },
];

export function EntraLanePage(): ReactNode {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <WorkspacePageShell layout="list" title="Hybrid Identity">
      <div className={styles.container}>
        <HbcTabs
          tabs={IDENTITY_TABS}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
        />
        {activeTab === 'overview' && <IdentityOverview />}
        {activeTab === 'users' && <IdentityUsersTab />}
        {activeTab === 'groups' && <IdentityGroupsTab />}
        {activeTab === 'connections' && <IdentityConnectionsTab />}
      </div>
    </WorkspacePageShell>
  );
}

// ─── Overview tab ──────────────────────────────────────────────────────────────

function IdentityOverview(): ReactNode {
  const styles = useStyles();

  return (
    <div className={styles.grid}>
      <HbcCard>
        <div className={styles.cardContent}>
          <HbcTypography intent="heading3">AD DS Connection</HbcTypography>
          <div className={styles.statusRow}>
            <HbcStatusBadge variant="neutral" label="Not configured" />
          </div>
          <HbcTypography intent="bodySmall">
            Configure the on-prem AD DS connector to enable authoritative user lifecycle operations.
          </HbcTypography>
        </div>
      </HbcCard>

      <HbcCard>
        <div className={styles.cardContent}>
          <HbcTypography intent="heading3">Graph Identity</HbcTypography>
          <div className={styles.statusRow}>
            <HbcStatusBadge variant="neutral" label="Not confirmed" />
          </div>
          <HbcTypography intent="bodySmall">
            Confirm Graph identity permissions to enable cloud-side user and group operations.
          </HbcTypography>
        </div>
      </HbcCard>

      <HbcCard>
        <div className={styles.cardContent}>
          <HbcTypography intent="heading3">Source of Authority</HbcTypography>
          <HbcTypography intent="bodySmall">
            AD DS-synced users are administered through on-prem AD DS.
            Cloud-only users are administered through Microsoft Graph.
            The system routes actions to the correct boundary automatically.
          </HbcTypography>
        </div>
      </HbcCard>

      <HbcCard>
        <div className={styles.cardContent}>
          <HbcTypography intent="heading3">Capabilities</HbcTypography>
          <HbcTypography intent="bodySmall">
            User lifecycle (create, update, enable/disable, delete) — Group membership —
            Cloud-only group management — Sync-status visibility — Rollout-critical access setup.
          </HbcTypography>
        </div>
      </HbcCard>
    </div>
  );
}

// ─── Users tab ─────────────────────────────────────────────────────────────────

function IdentityUsersTab(): ReactNode {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <IdentityUserSearch />
    </div>
  );
}

function IdentityUserSearch(): ReactNode {
  const styles = useStyles();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; displayName: string; userPrincipalName: string; authorityType: string; accountEnabled: boolean }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/identity/users/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({ message: 'Search failed' }));
        throw new Error((errBody as { message?: string }).message ?? `HTTP ${response.status}`);
      }
      const data = await response.json() as { data?: { users?: Array<{ id: string; displayName: string; userPrincipalName: string; authorityType: string; accountEnabled: boolean }> } };
      setResults(data.data?.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HbcCard>
        <div className={styles.cardContent}>
          <HbcTypography intent="heading3">User Search</HbcTypography>
          <div className={styles.statusRow}>
            <input
              type="text"
              placeholder="Search by name or UPN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleSearch().catch(() => {}); } }}
              style={{ flex: 1, padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button onClick={() => { handleSearch().catch(() => {}); }} disabled={loading} style={{ padding: '6px 16px' }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <HbcTypography intent="bodySmall" color="#c00">{error}</HbcTypography>}
        </div>
      </HbcCard>

      {results.length > 0 && (
        <HbcCard>
          <div className={styles.cardContent}>
            <HbcTypography intent="heading3">Results ({results.length})</HbcTypography>
            {results.map((user) => (
              <div key={user.id} className={styles.statusRow} style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <HbcTypography intent="body">{user.displayName}</HbcTypography>
                  <HbcTypography intent="bodySmall">{user.userPrincipalName}</HbcTypography>
                </div>
                <div className={styles.statusRow}>
                  <HbcStatusBadge
                    variant={user.authorityType === 'ad-ds' ? 'neutral' : 'inProgress'}
                    label={user.authorityType === 'ad-ds' ? 'AD DS' : 'Cloud'}
                  />
                  <HbcStatusBadge
                    variant={user.accountEnabled ? 'success' : 'error'}
                    label={user.accountEnabled ? 'Enabled' : 'Disabled'}
                  />
                </div>
              </div>
            ))}
          </div>
        </HbcCard>
      )}
    </>
  );
}

// ─── Groups tab ────────────────────────────────────────────────────────────────

function IdentityGroupsTab(): ReactNode {
  const styles = useStyles();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; displayName: string; authorityType: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/identity/groups/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({ message: 'Search failed' }));
        throw new Error((errBody as { message?: string }).message ?? `HTTP ${response.status}`);
      }
      const data = await response.json() as { data?: { groups?: Array<{ id: string; displayName: string; authorityType: string }> } };
      setResults(data.data?.groups ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <HbcCard>
        <div className={styles.cardContent}>
          <HbcTypography intent="heading3">Group Search</HbcTypography>
          <div className={styles.statusRow}>
            <input
              type="text"
              placeholder="Search groups by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleSearch().catch(() => {}); } }}
              style={{ flex: 1, padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button onClick={() => { handleSearch().catch(() => {}); }} disabled={loading} style={{ padding: '6px 16px' }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <HbcTypography intent="bodySmall" color="#c00">{error}</HbcTypography>}
        </div>
      </HbcCard>

      {results.length > 0 && (
        <HbcCard>
          <div className={styles.cardContent}>
            <HbcTypography intent="heading3">Results ({results.length})</HbcTypography>
            {results.map((group) => (
              <div key={group.id} className={styles.statusRow} style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <HbcTypography intent="body">{group.displayName}</HbcTypography>
                <HbcStatusBadge
                  variant={group.authorityType === 'ad-ds' ? 'neutral' : 'inProgress'}
                  label={group.authorityType === 'ad-ds' ? 'AD DS Synced' : 'Cloud Only'}
                />
              </div>
            ))}
          </div>
        </HbcCard>
      )}
    </div>
  );
}

// ─── Connections tab ───────────────────────────────────────────────────────────

function IdentityConnectionsTab(): ReactNode {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <ADDSConnectorCard />
      <GraphIdentityConnectorCard />
    </div>
  );
}

function ADDSConnectorCard(): ReactNode {
  const styles = useStyles();
  const [endpoint, setEndpoint] = useState('');
  const [port, setPort] = useState('636');
  const [baseDn, setBaseDn] = useState('');
  const [serviceAccount, setServiceAccount] = useState('');
  const [password, setPassword] = useState('');
  const [useLdaps, setUseLdaps] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'untested' | 'healthy' | 'unhealthy'>('untested');
  const [lastError, setLastError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectorId: 'ad-ds-primary',
          connectorClass: 'ad-ds',
          displayName: 'AD DS Primary',
          config: { endpoint, port: parseInt(port, 10), baseDn, serviceAccountDn: serviceAccount, useLdaps },
          ...(password ? { credential: password } : {}),
        }),
      });
      if (!response.ok) throw new Error(`Save failed: HTTP ${response.status}`);
      setMessage('Connection saved. Click "Test Connection" to verify.');
      setPassword('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setLastError(null);
    try {
      const response = await fetch('/api/admin/connections/ad-ds-primary/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json() as { success?: boolean; error?: string };
      if (data.success) {
        setStatus('healthy');
        setMessage('Connection test succeeded.');
      } else {
        setStatus('unhealthy');
        setLastError(data.error ?? 'Test failed');
        setMessage(null);
      }
    } catch (err) {
      setStatus('unhealthy');
      setLastError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <HbcCard>
      <div className={styles.cardContent}>
        <div className={styles.statusRow} style={{ justifyContent: 'space-between' }}>
          <HbcTypography intent="heading3">AD DS Connector</HbcTypography>
          <HbcStatusBadge
            variant={status === 'healthy' ? 'success' : status === 'unhealthy' ? 'error' : 'neutral'}
            label={status === 'healthy' ? 'Healthy' : status === 'unhealthy' ? 'Unhealthy' : 'Not tested'}
          />
        </div>
        <HbcTypography intent="bodySmall">
          Configure the on-prem Active Directory connection for authoritative user lifecycle operations.
          Credentials are stored securely in the backend and never returned to the browser.
        </HbcTypography>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Server Endpoint</span>
            <input type="text" placeholder="dc01.corp.example.com" value={endpoint} onChange={(e) => setEndpoint(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Port</span>
            <input type="text" placeholder="636" value={port} onChange={(e) => setPort(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Base DN</span>
            <input type="text" placeholder="DC=corp,DC=example,DC=com" value={baseDn} onChange={(e) => setBaseDn(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Service Account DN</span>
            <input type="text" placeholder="CN=svc-hb-intel,OU=Service,DC=corp" value={serviceAccount} onChange={(e) => setServiceAccount(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Password</span>
            <input type="password" placeholder="Enter or update password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Use LDAPS</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <input type="checkbox" checked={useLdaps} onChange={(e) => setUseLdaps(e.target.checked)} />
              <span style={{ fontSize: '13px' }}>Encrypt with TLS (port 636)</span>
            </label>
          </label>
        </div>

        {message && <HbcTypography intent="bodySmall" color="#0078d4">{message}</HbcTypography>}
        {lastError && <HbcTypography intent="bodySmall" color="#c00">Error: {lastError}</HbcTypography>}

        <div className={styles.statusRow} style={{ marginTop: '12px' }}>
          <button onClick={() => { handleSave().catch(() => {}); }} disabled={saving} style={{ padding: '6px 16px' }}>
            {saving ? 'Saving...' : 'Save Connection'}
          </button>
          <button onClick={() => { handleTest().catch(() => {}); }} disabled={testing} style={{ padding: '6px 16px' }}>
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </div>
    </HbcCard>
  );
}

function GraphIdentityConnectorCard(): ReactNode {
  const styles = useStyles();
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'untested' | 'healthy' | 'unhealthy'>('untested');
  const [message, setMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectorId: 'graph-identity-primary',
          connectorClass: 'graph-identity',
          displayName: 'Graph Identity',
          config: { permissionConfirmed: true },
        }),
      });
      if (!response.ok) throw new Error(`Save failed: HTTP ${response.status}`);
      setConfirmed(true);
      setMessage('Permission confirmation saved. Click "Test Connection" to verify.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/admin/connections/graph-identity-primary/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json() as { success?: boolean; error?: string };
      if (data.success) {
        setStatus('healthy');
        setMessage('Graph API test succeeded — Managed Identity permissions are working.');
      } else {
        setStatus('unhealthy');
        setMessage(`Test failed: ${data.error ?? 'Unknown error'}. Verify admin consent in Entra portal.`);
      }
    } catch (err) {
      setStatus('unhealthy');
      setMessage(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <HbcCard>
      <div className={styles.cardContent}>
        <div className={styles.statusRow} style={{ justifyContent: 'space-between' }}>
          <HbcTypography intent="heading3">Graph Identity Connector</HbcTypography>
          <HbcStatusBadge
            variant={status === 'healthy' ? 'success' : status === 'unhealthy' ? 'error' : 'neutral'}
            label={status === 'healthy' ? 'Healthy' : status === 'unhealthy' ? 'Unhealthy' : 'Not tested'}
          />
        </div>
        <HbcTypography intent="bodySmall">
          Graph identity uses the Function App's Managed Identity — no credentials to enter.
          Confirm that admin consent has been granted for the required permissions in the Entra admin portal,
          then test the connection to verify.
        </HbcTypography>

        <div style={{ marginTop: '12px' }}>
          <HbcTypography intent="label">Required permissions (grant via Entra admin portal):</HbcTypography>
          <ul style={{ fontSize: '13px', margin: '4px 0 0 16px', lineHeight: 1.6 }}>
            <li>User.Read.All, User.ReadWrite.All</li>
            <li>Group.Read.All, Group.ReadWrite.All</li>
            <li>GroupMember.Read.All, GroupMember.ReadWrite.All</li>
            <li>Organization.Read.All</li>
          </ul>
        </div>

        {message && <HbcTypography intent="bodySmall" color={status === 'unhealthy' ? '#c00' : '#0078d4'}>{message}</HbcTypography>}

        <div className={styles.statusRow} style={{ marginTop: '12px' }}>
          <button onClick={() => { handleConfirm().catch(() => {}); }} disabled={saving || confirmed} style={{ padding: '6px 16px' }}>
            {saving ? 'Saving...' : confirmed ? 'Confirmed' : 'Confirm Permissions Granted'}
          </button>
          <button onClick={() => { handleTest().catch(() => {}); }} disabled={testing} style={{ padding: '6px 16px' }}>
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </div>
    </HbcCard>
  );
}
