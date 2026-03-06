import type { CSSProperties, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  defaultAccessControlAdminRepository,
} from './inMemoryRepository.js';
import { useAdminAccessControlData } from './hooks.js';
import type {
  AccessControlAdminSection,
  AccessControlOverrideRecord,
  AccessControlRoleAccessRecord,
  AccessControlUserLookupRecord,
  AccessControlAuditEventRecord,
} from '../types.js';
import type { AdminAccessControlPageProps, AdminSectionDescriptor } from './types.js';

const SECTION_DESCRIPTORS: AdminSectionDescriptor[] = [
  { id: 'user-lookup', label: 'User Lookup', description: 'Search users and inspect current role/access posture.' },
  { id: 'role-access-lookup', label: 'Role Access', description: 'Inspect role grants and override pressure by role.' },
  { id: 'override-review', label: 'Override Review', description: 'Approve or reject pending override requests.' },
  { id: 'renewal-queue', label: 'Renewals', description: 'Handle expiring access records with updated justification.' },
  { id: 'role-change-review', label: 'Role Change Queue', description: 'Review overrides flagged by base-role definition changes.' },
  { id: 'emergency-review', label: 'Emergency Queue', description: 'Resolve emergency access requests with mandatory reasoning.' },
  { id: 'audit-log', label: 'Audit Log', description: 'Read-only access-control audit visibility.' },
];

/**
 * Phase 5.11 minimal production admin UX surface.
 *
 * This component intentionally keeps rendering framework-agnostic so `@hbc/auth`
 * does not depend on shell/ui packages, preserving locked package boundaries.
 */
export function AdminAccessControlPage({
  repository = defaultAccessControlAdminRepository,
  initialSection = 'user-lookup',
  title = 'Access Control Administration',
}: AdminAccessControlPageProps): ReactNode {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<AccessControlAdminSection>(initialSection);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { snapshot, loading, error, refresh } = useAdminAccessControlData({
    repository,
    searchTerm,
  });

  const queueCounts = useMemo(
    () => ({
      overrides: snapshot?.overrideReviewQueue.length ?? 0,
      renewals: snapshot?.renewalQueue.length ?? 0,
      roleReview: snapshot?.roleChangeReviewQueue.length ?? 0,
      emergency: snapshot?.emergencyReviewQueue.length ?? 0,
      audits: snapshot?.auditEvents.length ?? 0,
    }),
    [snapshot],
  );

  const onReview = async (
    decision: 'approve' | 'reject',
    override: AccessControlOverrideRecord,
    reason?: string,
  ) => {
    const result = await repository.reviewOverride({
      overrideId: override.id,
      reviewerId: 'admin-reviewer',
      decision,
      reason,
    });
    setActionMessage(result.message);
    await refresh();
  };

  const onRenew = async (override: AccessControlOverrideRecord) => {
    if (!override.expiration.expiresAt) {
      setActionMessage('Override has no expiration value for renewal.');
      return;
    }

    const expiration = new Date(override.expiration.expiresAt);
    expiration.setDate(expiration.getDate() + 14);

    const result = await repository.renewOverride({
      overrideId: override.id,
      reviewerId: 'admin-reviewer',
      reason: 'Renewed for continued operational coverage after admin review.',
      expiresAt: expiration.toISOString(),
    });
    setActionMessage(result.message);
    await refresh();
  };

  const onResolveRoleReview = async (override: AccessControlOverrideRecord) => {
    const result = await repository.resolveRoleChangeReview({
      overrideId: override.id,
      reviewerId: 'admin-reviewer',
      reason: 'Role-change impact reviewed and accepted in Phase 5.11 queue.',
    });
    setActionMessage(result.message);
    await refresh();
  };

  const onReviewEmergency = async (
    decision: 'approve' | 'reject',
    override: AccessControlOverrideRecord,
  ) => {
    const result = await repository.reviewEmergencyAccess({
      overrideId: override.id,
      reviewerId: 'admin-reviewer',
      decision,
      reason:
        decision === 'approve'
          ? 'Emergency business continuity validated by admin reviewer.'
          : 'Emergency request rejected due to insufficient continuity impact.',
    });
    setActionMessage(result.message);
    await refresh();
  };

  return (
    <section aria-label="Access control administration" style={{ display: 'grid', gap: 16 }}>
      <header>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <p style={{ marginTop: 8 }}>
          Core production admin workflows for Phase 5.11. Expanded dashboards and analytics remain deferred.
        </p>
      </header>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <MetricChip label="Users" value={snapshot?.users.length ?? 0} />
        <MetricChip label="Roles" value={snapshot?.roleAccess.length ?? 0} />
        <MetricChip label="Pending Overrides" value={queueCounts.overrides} />
        <MetricChip label="Renewals" value={queueCounts.renewals} />
        <MetricChip label="Role Review" value={queueCounts.roleReview} />
        <MetricChip label="Emergency Queue" value={queueCounts.emergency} />
        <MetricChip label="Audit Events" value={queueCounts.audits} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <label htmlFor="hbc-admin-search" style={{ fontWeight: 600 }}>Lookup</label>
        <input
          id="hbc-admin-search"
          aria-label="Search admin access data"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search users, roles, overrides"
          style={{ minWidth: 280, padding: '8px 10px', borderRadius: 4, border: '1px solid #a0a0a0' }}
        />
        <button type="button" onClick={() => setSearchTerm('')}>Clear</button>
        <button type="button" onClick={() => void refresh()} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <nav aria-label="Admin queue sections" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SECTION_DESCRIPTORS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            aria-pressed={section.id === activeSection}
            title={section.description}
            style={{
              borderRadius: 4,
              padding: '8px 10px',
              border: '1px solid #d4d4d4',
              background: section.id === activeSection ? '#f0f6ff' : '#ffffff',
              fontWeight: section.id === activeSection ? 700 : 500,
            }}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {actionMessage ? <p role="status">{actionMessage}</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      <div>
        {renderSection({
          activeSection,
          snapshot,
          loading,
          onReview,
          onRenew,
          onResolveRoleReview,
          onReviewEmergency,
        })}
      </div>
    </section>
  );
}

function MetricChip({ label, value }: { label: string; value: number }): ReactNode {
  return (
    <div style={{ border: '1px solid #d4d4d4', borderRadius: 6, padding: '8px 12px' }}>
      <div style={{ fontSize: 12, color: '#555' }}>{label}</div>
      <strong>{String(value)}</strong>
    </div>
  );
}

function renderSection(params: {
  activeSection: AccessControlAdminSection;
  snapshot: ReturnType<typeof useAdminAccessControlData>['snapshot'];
  loading: boolean;
  onReview: (decision: 'approve' | 'reject', override: AccessControlOverrideRecord, reason?: string) => Promise<void>;
  onRenew: (override: AccessControlOverrideRecord) => Promise<void>;
  onResolveRoleReview: (override: AccessControlOverrideRecord) => Promise<void>;
  onReviewEmergency: (decision: 'approve' | 'reject', override: AccessControlOverrideRecord) => Promise<void>;
}): ReactNode {
  if (!params.snapshot) {
    return <p>Loading admin access-control data...</p>;
  }

  switch (params.activeSection) {
    case 'user-lookup':
      return <UserLookupTable rows={params.snapshot.users} loading={params.loading} />;
    case 'role-access-lookup':
      return <RoleLookupTable rows={params.snapshot.roleAccess} loading={params.loading} />;
    case 'override-review':
      return (
        <OverrideQueueTable
          rows={params.snapshot.overrideReviewQueue}
          loading={params.loading}
          onApprove={(row) => params.onReview('approve', row)}
          onReject={(row) => params.onReview('reject', row, 'Rejected during admin queue review.')}
        />
      );
    case 'renewal-queue':
      return <RenewalQueueTable rows={params.snapshot.renewalQueue} loading={params.loading} onRenew={params.onRenew} />;
    case 'role-change-review':
      return (
        <RoleReviewQueueTable
          rows={params.snapshot.roleChangeReviewQueue}
          loading={params.loading}
          onResolve={params.onResolveRoleReview}
        />
      );
    case 'emergency-review':
      return (
        <EmergencyQueueTable
          rows={params.snapshot.emergencyReviewQueue}
          loading={params.loading}
          onApprove={(row) => params.onReviewEmergency('approve', row)}
          onReject={(row) => params.onReviewEmergency('reject', row)}
        />
      );
    case 'audit-log':
      return <AuditLogTable rows={params.snapshot.auditEvents} loading={params.loading} />;
    default:
      return null;
  }
}

function UserLookupTable({ rows, loading }: { rows: AccessControlUserLookupRecord[]; loading: boolean }): ReactNode {
  if (loading) {
    return <p>Loading user lookup...</p>;
  }

  return (
    <table aria-label="User lookup table" style={tableStyle}>
      <thead><tr><th>User</th><th>Email</th><th>Roles</th><th>Access</th></tr></thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.userId}>
            <td>{row.displayName}</td>
            <td>{row.email}</td>
            <td>{row.resolvedRoles.join(', ')}</td>
            <td>{row.grants.join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RoleLookupTable({ rows, loading }: { rows: AccessControlRoleAccessRecord[]; loading: boolean }): ReactNode {
  if (loading) {
    return <p>Loading role/access lookup...</p>;
  }

  return (
    <table aria-label="Role access table" style={tableStyle}>
      <thead><tr><th>Role</th><th>Grants</th><th>Active</th><th>Pending</th><th>Review Required</th></tr></thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.roleId}>
            <td>{row.roleName}</td>
            <td>{row.grants.join(', ')}</td>
            <td>{row.activeOverrideCount}</td>
            <td>{row.pendingOverrideCount}</td>
            <td>{row.reviewRequiredCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OverrideQueueTable(params: {
  rows: AccessControlOverrideRecord[];
  loading: boolean;
  onApprove: (row: AccessControlOverrideRecord) => void;
  onReject: (row: AccessControlOverrideRecord) => void;
}): ReactNode {
  if (params.loading) {
    return <p>Loading override review queue...</p>;
  }

  return (
    <table aria-label="Override review queue" style={tableStyle}>
      <thead><tr><th>ID</th><th>Target User</th><th>Base Role</th><th>Change</th><th>Actions</th></tr></thead>
      <tbody>
        {params.rows.map((row) => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.targetUserId}</td>
            <td>{row.baseRoleId}</td>
            <td>{row.requestedChange.mode}: {row.requestedChange.grants.join(', ')}</td>
            <td>
              <button type="button" onClick={() => params.onApprove(row)}>Approve</button>{' '}
              <button type="button" onClick={() => params.onReject(row)}>Reject</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RenewalQueueTable(params: {
  rows: AccessControlOverrideRecord[];
  loading: boolean;
  onRenew: (row: AccessControlOverrideRecord) => void;
}): ReactNode {
  if (params.loading) {
    return <p>Loading renewal queue...</p>;
  }

  return (
    <table aria-label="Renewal queue" style={tableStyle}>
      <thead><tr><th>ID</th><th>Target User</th><th>Expires</th><th>Action</th></tr></thead>
      <tbody>
        {params.rows.map((row) => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.targetUserId}</td>
            <td>{row.expiration.expiresAt ?? 'N/A'}</td>
            <td><button type="button" onClick={() => params.onRenew(row)}>Renew 14 Days</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RoleReviewQueueTable(params: {
  rows: AccessControlOverrideRecord[];
  loading: boolean;
  onResolve: (row: AccessControlOverrideRecord) => void;
}): ReactNode {
  if (params.loading) {
    return <p>Loading role-change review queue...</p>;
  }

  return (
    <table aria-label="Role change review queue" style={tableStyle}>
      <thead><tr><th>ID</th><th>Base Role</th><th>Reason</th><th>Action</th></tr></thead>
      <tbody>
        {params.rows.map((row) => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.baseRoleId}</td>
            <td>{row.review.reviewReason ?? 'Base role definition changed.'}</td>
            <td><button type="button" onClick={() => params.onResolve(row)}>Mark Reviewed</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmergencyQueueTable(params: {
  rows: AccessControlOverrideRecord[];
  loading: boolean;
  onApprove: (row: AccessControlOverrideRecord) => void;
  onReject: (row: AccessControlOverrideRecord) => void;
}): ReactNode {
  if (params.loading) {
    return <p>Loading emergency queue...</p>;
  }

  return (
    <table aria-label="Emergency review queue" style={tableStyle}>
      <thead><tr><th>ID</th><th>Target User</th><th>Reason</th><th>Expires</th><th>Actions</th></tr></thead>
      <tbody>
        {params.rows.map((row) => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.targetUserId}</td>
            <td>{row.reason}</td>
            <td>{row.expiration.expiresAt ?? 'N/A'}</td>
            <td>
              <button type="button" onClick={() => params.onApprove(row)}>Approve</button>{' '}
              <button type="button" onClick={() => params.onReject(row)}>Reject</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AuditLogTable({ rows, loading }: { rows: AccessControlAuditEventRecord[]; loading: boolean }): ReactNode {
  if (loading) {
    return <p>Loading audit log...</p>;
  }

  return (
    <table aria-label="Access control audit log" style={tableStyle}>
      <thead><tr><th>Timestamp</th><th>Event</th><th>Actor</th><th>Subject User</th><th>Details</th></tr></thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.occurredAt}</td>
            <td>{row.eventType}</td>
            <td>{row.actorId}</td>
            <td>{row.subjectUserId}</td>
            <td>{row.details ? JSON.stringify(row.details) : 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #d4d4d4',
};
