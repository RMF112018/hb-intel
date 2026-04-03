import { type ReactNode, useState, useEffect, useCallback } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import {
  WorkspacePageShell,
  HbcTabs,
  HbcCard,
  HbcTypography,
  HbcStatusBadge,
  HbcBanner,
  HbcModal,
  HbcConfirmDialog,
  HbcEmptyState,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
} from '@hbc/ui-kit';

/**
 * P9-08/P9-09: Hybrid Identity control lane — operator safety, audit, and execution UX.
 *
 * Sub-views:
 * - Overview: lane health, live connection status, source-of-authority info
 * - Users: search, risk-aware actions (create, view, enable/disable, delete)
 * - Groups: search with info banner (group action endpoints pending P9-07)
 * - Connections: AD DS and Graph connector setup, test, rotate
 * - History: audit trail of identity operations
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectionHealth = 'healthy' | 'unhealthy' | 'unconfigured' | 'loading';

interface IConnectionRecord {
  connectorId: string;
  connectorClass: string;
  displayName: string;
  healthStatus: 'healthy' | 'unhealthy' | 'untested';
  lastTestedAt: string | null;
  lastTestResult: 'success' | 'failure' | null;
  lastTestError: string | null;
  lastTestedBy: string | null;
}

interface IUserResult {
  id: string;
  displayName: string;
  userPrincipalName: string;
  authorityType: string;
  accountEnabled: boolean;
}

interface IOperationResult {
  success: boolean;
  actionLabel: string;
  authorityUsed: string;
  error?: { code: string; message: string; operatorGuidance?: string };
  syncState?: { syncPending: boolean; estimatedSyncWindowMinutes: number; lastKnownSyncTime: string | null };
}

interface IAuditEntry {
  auditId: string;
  eventType: string;
  timestamp: string;
  domain: string;
  actionKey: string | null;
  runId: string | null;
  actor: { upn: string; displayName: string };
  summary: string;
}

type ModalStep = 'form' | 'preview' | 'executing' | 'result';

// ─── Risk metadata ────────────────────────────────────────────────────────────

type RiskTier = 'routine' | 'elevated' | 'destructive';
type Checkpoint = 'none' | 'preview' | 'confirmation' | 'double-confirmation';

interface RiskMeta {
  tier: RiskTier;
  destructive: boolean;
  checkpoint: Checkpoint;
  label: string;
}

const RISK_BADGE_VARIANT: Record<RiskTier, 'neutral' | 'warning' | 'error'> = {
  routine: 'neutral',
  elevated: 'warning',
  destructive: 'error',
};

function riskMetaFor(action: string, authority: string): RiskMeta {
  switch (action) {
    case 'create': return { tier: 'elevated', destructive: false, checkpoint: 'preview', label: `Create User (${authority === 'ad-ds' ? 'AD DS' : 'Cloud'})` };
    case 'enable': return { tier: 'routine', destructive: false, checkpoint: 'confirmation', label: 'Enable User' };
    case 'disable': return { tier: 'elevated', destructive: false, checkpoint: 'confirmation', label: 'Disable User' };
    case 'delete': return { tier: 'destructive', destructive: true, checkpoint: 'double-confirmation', label: `Delete User (${authority === 'ad-ds' ? 'AD DS' : 'Cloud'})` };
    default: return { tier: 'routine', destructive: false, checkpoint: 'none', label: action };
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '12px',
  },
  riskBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    ...shorthands.padding(`${HBC_SPACE_SM}px`),
    ...shorthands.borderRadius('4px'),
    backgroundColor: '#f8f8f8',
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  previewCard: {
    ...shorthands.padding(`${HBC_SPACE_MD}px`),
    ...shorthands.border('1px', 'solid', '#ddd'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: '#fafafa',
  },
  syncPending: {
    ...shorthands.padding(`${HBC_SPACE_SM}px`, `${HBC_SPACE_MD}px`),
    ...shorthands.borderRadius('4px'),
    backgroundColor: '#fff8e1',
    ...shorthands.border('1px', 'solid', '#ffe082'),
    marginTop: `${HBC_SPACE_SM}px`,
  },
  historyEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding(`${HBC_SPACE_SM}px`, '0'),
    ...shorthands.borderBottom('1px', 'solid', '#eee'),
  },
  userRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding(`${HBC_SPACE_SM}px`, '0'),
    ...shorthands.borderBottom('1px', 'solid', '#eee'),
  },
});

// ─── Tab configuration ────────────────────────────────────────────────────────

interface IdentityTab { id: string; label: string }

const IDENTITY_TABS: IdentityTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'groups', label: 'Groups & Access' },
  { id: 'connections', label: 'Connections' },
  { id: 'history', label: 'History' },
];

// ─── Health status helpers ────────────────────────────────────────────────────

function healthBadgeVariant(h: ConnectionHealth): 'success' | 'error' | 'neutral' {
  if (h === 'healthy') return 'success';
  if (h === 'unhealthy') return 'error';
  return 'neutral';
}

function healthBadgeLabel(h: ConnectionHealth): string {
  if (h === 'healthy') return 'Healthy';
  if (h === 'unhealthy') return 'Unhealthy';
  if (h === 'loading') return 'Checking...';
  return 'Not configured';
}

// ─── Root component ───────────────────────────────────────────────────────────

export function EntraLanePage(): ReactNode {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState('overview');
  const [adDsHealth, setAdDsHealth] = useState<ConnectionHealth>('loading');
  const [graphHealth, setGraphHealth] = useState<ConnectionHealth>('loading');

  const fetchConnectionHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/connections');
      if (!response.ok) {
        setAdDsHealth('unconfigured');
        setGraphHealth('unconfigured');
        return;
      }
      const data = await response.json() as { connections?: IConnectionRecord[] };
      const connections = data.connections ?? [];

      const adDs = connections.find((c) => c.connectorClass === 'ad-ds');
      const graph = connections.find((c) => c.connectorClass === 'graph-identity');

      setAdDsHealth(adDs ? (adDs.healthStatus === 'healthy' ? 'healthy' : adDs.healthStatus === 'unhealthy' ? 'unhealthy' : 'unconfigured') : 'unconfigured');
      setGraphHealth(graph ? (graph.healthStatus === 'healthy' ? 'healthy' : graph.healthStatus === 'unhealthy' ? 'unhealthy' : 'unconfigured') : 'unconfigured');
    } catch {
      setAdDsHealth('unconfigured');
      setGraphHealth('unconfigured');
    }
  }, []);

  useEffect(() => { fetchConnectionHealth().catch(() => {}); }, [fetchConnectionHealth]);

  return (
    <WorkspacePageShell layout="list" title="Hybrid Identity">
      <div className={styles.container}>
        <HbcTabs
          tabs={IDENTITY_TABS}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
        />
        {activeTab === 'overview' && <IdentityOverview adDsHealth={adDsHealth} graphHealth={graphHealth} />}
        {activeTab === 'users' && <IdentityUsersTab adDsHealth={adDsHealth} graphHealth={graphHealth} />}
        {activeTab === 'groups' && <IdentityGroupsTab graphHealth={graphHealth} />}
        {activeTab === 'connections' && <IdentityConnectionsTab onHealthChange={fetchConnectionHealth} />}
        {activeTab === 'history' && <IdentityHistoryTab />}
      </div>
    </WorkspacePageShell>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function IdentityOverview({ adDsHealth, graphHealth }: { adDsHealth: ConnectionHealth; graphHealth: ConnectionHealth }): ReactNode {
  const styles = useStyles();

  return (
    <div className={styles.grid}>
      <HbcCard>
        <div className={styles.cardContent}>
          <HbcTypography intent="heading3">AD DS Connection</HbcTypography>
          <div className={styles.statusRow}>
            <HbcStatusBadge variant={healthBadgeVariant(adDsHealth)} label={healthBadgeLabel(adDsHealth)} />
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
            <HbcStatusBadge variant={healthBadgeVariant(graphHealth)} label={healthBadgeLabel(graphHealth)} />
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

// ─── Users tab ────────────────────────────────────────────────────────────────

function IdentityUsersTab({ adDsHealth, graphHealth }: { adDsHealth: ConnectionHealth; graphHealth: ConnectionHealth }): ReactNode {
  const styles = useStyles();
  const connectorsReady = graphHealth === 'healthy';

  return (
    <div className={styles.container}>
      {graphHealth !== 'healthy' && graphHealth !== 'loading' && (
        <HbcBanner variant="warning">
          Graph Identity connector is not healthy. User search and operations require a working Graph connection.
          Go to the Connections tab to configure and test.
        </HbcBanner>
      )}
      {adDsHealth !== 'healthy' && adDsHealth !== 'loading' && (
        <HbcBanner variant="info">
          AD DS connector is not configured. AD DS-authoritative user operations will not be available
          until the connector is configured and tested in the Connections tab.
        </HbcBanner>
      )}
      <IdentityUserSearch connectorsReady={connectorsReady} adDsHealth={adDsHealth} graphHealth={graphHealth} />
    </div>
  );
}

function IdentityUserSearch({ connectorsReady, adDsHealth, graphHealth }: { connectorsReady: boolean; adDsHealth: ConnectionHealth; graphHealth: ConnectionHealth }): ReactNode {
  const styles = useStyles();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IUserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Action modal state
  const [actionModal, setActionModal] = useState<{ action: string; user: IUserResult | null; step: ModalStep } | null>(null);
  const [operationResult, setOperationResult] = useState<IOperationResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Create user form state
  const [createAuthority, setCreateAuthority] = useState<'ad-ds' | 'entra'>('entra');
  const [createFields, setCreateFields] = useState<Record<string, string>>({});

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
      const data = await response.json() as { data?: { users?: IUserResult[] } };
      setResults(data.data?.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const openAction = (action: string, user: IUserResult | null) => {
    setActionModal({ action, user, step: action === 'create' ? 'form' : 'preview' });
    setOperationResult(null);
    setCreateFields({});
    setCreateAuthority('entra');
  };

  const closeAction = () => {
    setActionModal(null);
    setOperationResult(null);
    setConfirmOpen(false);
  };

  const executeAction = async (action: string, user: IUserResult | null) => {
    setActionModal((prev) => prev ? { ...prev, step: 'executing' } : null);
    const authority = user?.authorityType === 'ad-ds' ? 'ad-ds' : 'entra';
    const meta = riskMetaFor(action, authority);

    try {
      let response: Response;

      if (action === 'create') {
        response = await fetch('/api/admin/identity/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authority: createAuthority, ...createFields }),
        });
      } else if (action === 'enable') {
        response = await fetch(`/api/admin/identity/users/${user!.id}/enable`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authority }),
        });
      } else if (action === 'disable') {
        response = await fetch(`/api/admin/identity/users/${user!.id}/disable`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authority }),
        });
      } else if (action === 'delete') {
        response = await fetch(`/api/admin/identity/users/${user!.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authority, confirmationToken: crypto.randomUUID() }),
        });
      } else {
        return;
      }

      const body = await response.json().catch(() => ({})) as Record<string, unknown>;

      if (response.ok) {
        const syncState = body.syncState as IOperationResult['syncState'] | undefined;
        setOperationResult({
          success: true,
          actionLabel: meta.label,
          authorityUsed: authority === 'ad-ds' ? 'AD DS' : 'Cloud',
          syncState: syncState ?? undefined,
        });
      } else {
        setOperationResult({
          success: false,
          actionLabel: meta.label,
          authorityUsed: authority === 'ad-ds' ? 'AD DS' : 'Cloud',
          error: {
            code: (body.code as string) ?? 'ERROR',
            message: (body.message as string) ?? 'Operation failed',
            operatorGuidance: body.operatorGuidance as string | undefined,
          },
        });
      }
    } catch (err) {
      setOperationResult({
        success: false,
        actionLabel: meta.label,
        authorityUsed: authority === 'ad-ds' ? 'AD DS' : 'Cloud',
        error: {
          code: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : 'Operation failed',
        },
      });
    }
    setActionModal((prev) => prev ? { ...prev, step: 'result' } : null);
  };

  const handleDeleteConfirm = () => {
    setConfirmLoading(true);
    executeAction('delete', actionModal?.user ?? null).finally(() => {
      setConfirmOpen(false);
      setConfirmLoading(false);
    });
  };

  const currentMeta = actionModal ? riskMetaFor(actionModal.action, actionModal.user?.authorityType ?? createAuthority) : null;

  return (
    <>
      {/* Search card */}
      <HbcCard>
        <div className={styles.cardContent}>
          <div className={styles.statusRow} style={{ justifyContent: 'space-between' }}>
            <HbcTypography intent="heading3">User Search</HbcTypography>
            {connectorsReady && (
              <button onClick={() => openAction('create', null)} style={{ padding: '6px 16px' }}>
                Create User
              </button>
            )}
          </div>
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

      {/* Results */}
      {results.length > 0 && (
        <HbcCard>
          <div className={styles.cardContent}>
            <HbcTypography intent="heading3">Results ({results.length})</HbcTypography>
            {results.map((user) => {
              const canAdds = adDsHealth === 'healthy' && user.authorityType === 'ad-ds';
              const canCloud = graphHealth === 'healthy' && user.authorityType !== 'ad-ds';
              const canAct = canAdds || canCloud;
              return (
                <div key={user.id} className={styles.userRow}>
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
                    {canAct && (
                      <div className={styles.actionRow}>
                        <button
                          onClick={() => openAction(user.accountEnabled ? 'disable' : 'enable', user)}
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          {user.accountEnabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => openAction('delete', user)}
                          style={{ padding: '4px 10px', fontSize: '12px', color: '#c00' }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </HbcCard>
      )}

      {/* Action modal — Create */}
      {actionModal?.action === 'create' && (
        <HbcModal
          open
          onClose={closeAction}
          title="Create User"
          size="lg"
          footer={actionModal.step === 'form' ? (
            <div className={styles.statusRow}>
              <button onClick={() => setActionModal({ ...actionModal, step: 'preview' })} style={{ padding: '6px 16px' }}>
                Preview
              </button>
              <button onClick={closeAction} style={{ padding: '6px 16px' }}>Cancel</button>
            </div>
          ) : actionModal.step === 'preview' ? (
            <div className={styles.statusRow}>
              <button onClick={() => { executeAction('create', null).catch(() => {}); }} style={{ padding: '6px 16px' }}>
                Confirm Create
              </button>
              <button onClick={() => setActionModal({ ...actionModal, step: 'form' })} style={{ padding: '6px 16px' }}>Back</button>
            </div>
          ) : actionModal.step === 'result' ? (
            <button onClick={closeAction} style={{ padding: '6px 16px' }}>Close</button>
          ) : undefined}
        >
          {/* Risk metadata header */}
          <div className={styles.riskBanner}>
            <HbcStatusBadge variant={RISK_BADGE_VARIANT[currentMeta!.tier]} label={currentMeta!.tier} />
            <HbcStatusBadge variant={createAuthority === 'ad-ds' ? 'neutral' : 'inProgress'} label={createAuthority === 'ad-ds' ? 'AD DS' : 'Cloud'} />
            {createAuthority === 'ad-ds' && <HbcTypography intent="bodySmall">Changes will be pending sync (~30 min).</HbcTypography>}
          </div>

          {actionModal.step === 'form' && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <HbcTypography intent="label">Authority</HbcTypography>
                <div className={styles.statusRow} style={{ marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="radio" checked={createAuthority === 'entra'} onChange={() => setCreateAuthority('entra')} /> Cloud (Entra)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="radio" checked={createAuthority === 'ad-ds'} onChange={() => setCreateAuthority('ad-ds')} disabled={adDsHealth !== 'healthy'} /> AD DS
                  </label>
                </div>
              </div>
              <div className={styles.formGrid}>
                <FormField label="Display Name" value={createFields.displayName ?? ''} onChange={(v) => setCreateFields({ ...createFields, displayName: v })} />
                <FormField label="User Principal Name" value={createFields.userPrincipalName ?? ''} onChange={(v) => setCreateFields({ ...createFields, userPrincipalName: v })} placeholder="user@domain.com" />
                {createAuthority === 'ad-ds' ? (
                  <>
                    <FormField label="sAMAccountName" value={createFields.samAccountName ?? ''} onChange={(v) => setCreateFields({ ...createFields, samAccountName: v })} />
                    <FormField label="Target OU" value={createFields.targetOu ?? ''} onChange={(v) => setCreateFields({ ...createFields, targetOu: v })} placeholder="OU=Users,DC=corp,DC=example,DC=com" />
                  </>
                ) : (
                  <>
                    <FormField label="Mail Nickname" value={createFields.mailNickname ?? ''} onChange={(v) => setCreateFields({ ...createFields, mailNickname: v })} />
                    <FormField label="Password" value={createFields.password ?? ''} onChange={(v) => setCreateFields({ ...createFields, password: v })} type="password" />
                  </>
                )}
                <FormField label="Department" value={createFields.department ?? ''} onChange={(v) => setCreateFields({ ...createFields, department: v })} />
                <FormField label="Job Title" value={createFields.title ?? ''} onChange={(v) => setCreateFields({ ...createFields, title: v })} />
              </div>
            </>
          )}

          {actionModal.step === 'preview' && (
            <div className={styles.previewCard}>
              <HbcTypography intent="heading4">Pre-execution summary</HbcTypography>
              <div style={{ marginTop: '8px' }}>
                {Object.entries(createFields).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <HbcTypography intent="label">{k}</HbcTypography>
                    <HbcTypography intent="bodySmall">{k === 'password' ? '••••••••' : v}</HbcTypography>
                  </div>
                ))}
              </div>
              {createAuthority === 'ad-ds' && (
                <div className={styles.syncPending}>
                  <HbcTypography intent="bodySmall">
                    After creation, changes will be pending sync to Entra ID. Estimated sync window: ~30 minutes.
                  </HbcTypography>
                </div>
              )}
            </div>
          )}

          {actionModal.step === 'executing' && (
            <HbcTypography intent="body">Executing...</HbcTypography>
          )}

          {actionModal.step === 'result' && operationResult && (
            <OperationResultDisplay result={operationResult} />
          )}
        </HbcModal>
      )}

      {/* Action modal — Enable/Disable */}
      {actionModal && (actionModal.action === 'enable' || actionModal.action === 'disable') && (
        <HbcConfirmDialog
          open
          onClose={closeAction}
          onConfirm={() => { executeAction(actionModal.action, actionModal.user).catch(() => {}); }}
          title={`Confirm ${currentMeta!.label}`}
          description={
            actionModal.action === 'disable'
              ? `You are about to disable "${actionModal.user!.displayName}" (${actionModal.user!.userPrincipalName}). This will prevent the user from signing in. Source of authority: ${actionModal.user!.authorityType === 'ad-ds' ? 'AD DS' : 'Cloud'}.`
              : `You are about to enable "${actionModal.user!.displayName}" (${actionModal.user!.userPrincipalName}). Source of authority: ${actionModal.user!.authorityType === 'ad-ds' ? 'AD DS' : 'Cloud'}.`
          }
          confirmLabel={currentMeta!.label}
          variant={actionModal.action === 'disable' ? 'warning' : 'warning'}
          loading={actionModal.step === 'executing'}
        />
      )}

      {/* Result modal for enable/disable */}
      {actionModal && (actionModal.action === 'enable' || actionModal.action === 'disable') && actionModal.step === 'result' && operationResult && (
        <HbcModal open onClose={closeAction} title={`${currentMeta!.label} — Result`} size="md">
          <OperationResultDisplay result={operationResult} />
        </HbcModal>
      )}

      {/* Delete — double confirmation */}
      {actionModal?.action === 'delete' && !confirmOpen && actionModal.step !== 'result' && (
        <HbcConfirmDialog
          open
          onClose={closeAction}
          onConfirm={() => setConfirmOpen(true)}
          title={`Delete ${actionModal.user!.displayName}?`}
          description={`This will permanently delete "${actionModal.user!.displayName}" (${actionModal.user!.userPrincipalName}). Source of authority: ${actionModal.user!.authorityType === 'ad-ds' ? 'AD DS' : 'Cloud'}. This action cannot be undone for AD DS users.`}
          confirmLabel="Continue to final confirmation"
          variant="danger"
        />
      )}

      {/* Delete — second confirmation */}
      {actionModal?.action === 'delete' && confirmOpen && actionModal.step !== 'result' && (
        <HbcConfirmDialog
          open
          onClose={() => { setConfirmOpen(false); closeAction(); }}
          onConfirm={handleDeleteConfirm}
          title="Final confirmation — Delete user"
          description={`Are you absolutely sure you want to delete "${actionModal.user!.displayName}"? This is a destructive operation.`}
          confirmLabel="Delete permanently"
          variant="danger"
          loading={confirmLoading}
        />
      )}

      {/* Delete result modal */}
      {actionModal?.action === 'delete' && actionModal.step === 'result' && operationResult && (
        <HbcModal open onClose={closeAction} title="Delete User — Result" size="md">
          <OperationResultDisplay result={operationResult} />
        </HbcModal>
      )}
    </>
  );
}

// ─── Operation result display ─────────────────────────────────────────────────

function OperationResultDisplay({ result }: { result: IOperationResult }): ReactNode {
  const styles = useStyles();
  return (
    <div className={styles.cardContent}>
      {result.success ? (
        <>
          <HbcBanner variant="success">
            {result.actionLabel} completed successfully. Authority used: {result.authorityUsed}.
          </HbcBanner>
          {result.syncState?.syncPending && (
            <div className={styles.syncPending}>
              <HbcTypography intent="heading4">Sync pending</HbcTypography>
              <HbcTypography intent="bodySmall">
                Changes have been committed to AD DS. Sync to Entra ID is pending.
                Estimated propagation: ~{result.syncState.estimatedSyncWindowMinutes} minutes.
                {result.syncState.lastKnownSyncTime
                  ? ` Last known sync: ${new Date(result.syncState.lastKnownSyncTime).toLocaleString()}.`
                  : ' Last known sync: unknown.'}
              </HbcTypography>
            </div>
          )}
        </>
      ) : (
        <>
          <HbcBanner variant="error">
            {result.actionLabel} failed — {result.error?.code}: {result.error?.message}
          </HbcBanner>
          {result.error?.operatorGuidance && (
            <HbcTypography intent="bodySmall">
              Guidance: {result.error.operatorGuidance}
            </HbcTypography>
          )}
          {(result.error?.code === 'CONNECTION_NOT_CONFIGURED' || result.error?.code === 'CONNECTION_UNHEALTHY') && (
            <HbcTypography intent="bodySmall">
              Go to the Connections tab to verify connector health.
            </HbcTypography>
          )}
        </>
      )}
    </div>
  );
}

// ─── Form field helper ────────────────────────────────────────────────────────

function FormField({ label, value, onChange, placeholder, type }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}): ReactNode {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '12px', fontWeight: 600 }}>{label}</span>
      <input
        type={type ?? 'text'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </label>
  );
}

// ─── Groups tab ───────────────────────────────────────────────────────────────

function IdentityGroupsTab({ graphHealth }: { graphHealth: ConnectionHealth }): ReactNode {
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
      {graphHealth !== 'healthy' && graphHealth !== 'loading' && (
        <HbcBanner variant="warning">
          Graph Identity connector is not healthy. Group search requires a working Graph connection.
          Go to the Connections tab to configure and test.
        </HbcBanner>
      )}
      <HbcBanner variant="info">
        Group lifecycle operations (create, membership changes, delete) will be available when backend group endpoints are implemented.
        Group search is available now.
      </HbcBanner>
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

// ─── Connections tab ──────────────────────────────────────────────────────────

function IdentityConnectionsTab({ onHealthChange }: { onHealthChange: () => Promise<void> }): ReactNode {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <ADDSConnectorCard onHealthChange={onHealthChange} />
      <GraphIdentityConnectorCard onHealthChange={onHealthChange} />
    </div>
  );
}

function ADDSConnectorCard({ onHealthChange }: { onHealthChange: () => Promise<void> }): ReactNode {
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
      await onHealthChange();
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
      await onHealthChange();
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

        <div className={styles.formGrid}>
          <FormField label="Server Endpoint" value={endpoint} onChange={setEndpoint} placeholder="dc01.corp.example.com" />
          <FormField label="Port" value={port} onChange={setPort} placeholder="636" />
          <FormField label="Base DN" value={baseDn} onChange={setBaseDn} placeholder="DC=corp,DC=example,DC=com" />
          <FormField label="Service Account DN" value={serviceAccount} onChange={setServiceAccount} placeholder="CN=svc-hb-intel,OU=Service,DC=corp" />
          <FormField label="Password" value={password} onChange={setPassword} type="password" placeholder="Enter or update password" />
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

function GraphIdentityConnectorCard({ onHealthChange }: { onHealthChange: () => Promise<void> }): ReactNode {
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
      await onHealthChange();
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
      await onHealthChange();
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

// ─── History tab ──────────────────────────────────────────────────────────────

function IdentityHistoryTab(): ReactNode {
  const styles = useStyles();
  const [entries, setEntries] = useState<IAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const [completedRes, failedRes] = await Promise.all([
          fetch('/api/admin/audit?eventType=run.completed&limit=50'),
          fetch('/api/admin/audit?eventType=run.failed&limit=50'),
        ]);

        const parseEntries = async (res: Response): Promise<IAuditEntry[]> => {
          if (!res.ok) return [];
          const data = await res.json() as { items?: IAuditEntry[] };
          return (data.items ?? []).filter((e) => e.domain === 'entra-control');
        };

        const completed = await parseEntries(completedRes);
        const failed = await parseEntries(failedRes);

        const all = [...completed, ...failed].sort(
          (a, b) => b.timestamp.localeCompare(a.timestamp),
        );
        setEntries(all.slice(0, 50));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory().catch(() => {});
  }, []);

  if (loading) {
    return (
      <HbcCard>
        <div className={styles.cardContent}>
          <HbcTypography intent="body">Loading history...</HbcTypography>
        </div>
      </HbcCard>
    );
  }

  if (error) {
    return (
      <HbcCard>
        <div className={styles.cardContent}>
          <HbcBanner variant="error">{error}</HbcBanner>
        </div>
      </HbcCard>
    );
  }

  if (entries.length === 0) {
    return (
      <HbcEmptyState
        title="No identity operations recorded"
        description="Operations performed in the Users tab will appear here with full audit detail."
      />
    );
  }

  return (
    <HbcCard>
      <div className={styles.cardContent}>
        <HbcTypography intent="heading3">Recent Identity Operations ({entries.length})</HbcTypography>
        {entries.map((entry) => (
          <div key={entry.auditId} className={styles.historyEntry}>
            <div>
              <HbcTypography intent="body">{entry.summary}</HbcTypography>
              <HbcTypography intent="bodySmall">
                {new Date(entry.timestamp).toLocaleString()} — {entry.actor.displayName ?? entry.actor.upn}
              </HbcTypography>
            </div>
            <HbcStatusBadge
              variant={entry.eventType === 'run.completed' ? 'success' : 'error'}
              label={entry.eventType === 'run.completed' ? 'Success' : 'Failed'}
            />
          </div>
        ))}
      </div>
    </HbcCard>
  );
}
