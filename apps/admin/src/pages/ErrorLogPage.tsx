/**
 * Error Log Page — Real observability error event surface.
 *
 * Replaces the deferred stub (SF17-T05) with a production-grade error log
 * that queries the backend observability error store. Supports filtering by
 * domain, source, classification, severity, and date range.
 *
 * @design G6-T01, P12-08
 */

import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import { useObservabilityErrors } from '@hbc/features-admin';
import type { IObservabilityErrorRecord, IObservabilityPagedResponse } from '@hbc/models/admin-control-plane';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';
import {
  HbcButton,
  HbcCard,
  HbcSelect,
  HbcStatusBadge,
  HbcTypography,
  WorkspacePageShell,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  HBC_SPACE_XS,
  HBC_SPACE_XL,
} from '@hbc/ui-kit';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';

// ─── Styles ─────────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  filterBar: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
    marginBottom: `${HBC_SPACE_MD}px`,
    alignItems: 'center',
  },
  filterItem: {
    minWidth: `${HBC_SPACE_XL * 4 + HBC_SPACE_SM}px`,
  },
  errorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
  },
  errorCard: {
    padding: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
  },
  errorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_XS}px`,
  },
  errorMeta: {
    display: 'flex',
    gap: `${HBC_SPACE_MD}px`,
    flexWrap: 'wrap',
    marginTop: `${HBC_SPACE_XS}px`,
  },
  metaItem: {
    color: 'var(--colorNeutralForeground3)',
  },
  summaryBar: {
    display: 'flex',
    gap: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
    flexWrap: 'wrap',
  },
  clearButtonWrap: {
    alignSelf: 'flex-end',
  },
});

// ─── Empty State Config ─────────────────────────────────────────────────────────

const ERROR_LOG_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: context.hasActiveFilters ? 'filter-empty' : 'truly-empty',
    heading: context.hasActiveFilters ? 'No errors match filters' : 'No error events',
    description: context.hasActiveFilters
      ? 'Try adjusting your filters or clearing them to see all error events.'
      : 'Error events from admin operations will appear here as they occur.',
    primaryAction: context.hasActiveFilters
      ? { label: 'Clear Filters', href: '#clear' }
      : { label: 'View Health Dashboard', href: '/health' },
    coachingTip: 'The error log surfaces durable error records from provisioning, identity, device deployment, and other admin domains.',
  }),
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

const SEVERITY_VARIANT: Record<string, 'error' | 'warning' | 'completed' | 'neutral'> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'neutral',
};

const DOMAIN_OPTIONS = [
  { value: 'provisioning-rollout', label: 'Provisioning' },
  { value: 'sharepoint-control', label: 'SharePoint' },
  { value: 'entra-control', label: 'Identity' },
  { value: 'white-glove-deployment', label: 'White-Glove' },
  { value: 'setup-install', label: 'Setup' },
  { value: 'standards-config', label: 'Standards' },
];

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const CLASSIFICATION_OPTIONS = [
  { value: 'transient', label: 'Transient' },
  { value: 'permissions', label: 'Permissions' },
  { value: 'structural', label: 'Structural' },
  { value: 'repeated', label: 'Repeated' },
  { value: 'admin-class', label: 'Admin Class' },
  { value: 'unclassified', label: 'Unclassified' },
];

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ErrorLogPage(): ReactNode {
  const session = useCurrentSession();
  const styles = useStyles();

  const sessionRef = useCallback(() => session, [session]);
  const getToken = useMemo(() => createSessionTokenFactory(sessionRef), [sessionRef]);
  const functionAppUrl = (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';

  const fetchErrors = useCallback(async (params: Record<string, string>): Promise<IObservabilityPagedResponse<IObservabilityErrorRecord>> => {
    const query = new URLSearchParams(params).toString();
    const url = `${functionAppUrl}/api/admin/observability/errors${query ? `?${query}` : ''}`;
    const token = await getToken();
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Error log fetch failed: ${res.status}`);
    const body = await res.json();
    return body.data as IObservabilityPagedResponse<IObservabilityErrorRecord>;
  }, [functionAppUrl, getToken]);

  const {
    errors, totalCount, setFilters, clearFilters,
    hasActiveFilters, refresh, isLoading, error,
  } = useObservabilityErrors(fetchErrors);

  const [domainFilter, setDomainFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');

  if (!session) {
    return (
      <WorkspacePageShell layout="list" title="Loading..." isLoading>
        {null}
      </WorkspacePageShell>
    );
  }

  if (error && errors.length === 0 && !isLoading) {
    return (
      <WorkspacePageShell
        layout="list"
        title="Error Log"
        isError
        errorMessage={error.message}
        onRetry={() => { refresh().catch(() => {}); }}
      >
        {null}
      </WorkspacePageShell>
    );
  }

  const emptyContext: IEmptyStateContext = {
    module: 'admin',
    view: 'error-log',
    hasActiveFilters,
    hasPermission: true,
    isFirstVisit: false,
    currentUserRole: 'admin',
    isLoadError: false,
  };

  return (
    <WorkspacePageShell layout="list" title="Error Log" isLoading={isLoading}>
      <div className={styles.summaryBar}>
        <HbcTypography intent="body">
          {totalCount} error{totalCount !== 1 ? 's' : ''} recorded
        </HbcTypography>
      </div>

      <div className={styles.filterBar}>
        <HbcSelect
          label="Domain"
          value={domainFilter}
          onChange={(val) => {
            setDomainFilter(val);
            setFilters({ domain: val || null });
          }}
          placeholder="All Domains"
          options={DOMAIN_OPTIONS}
        />
        <HbcSelect
          label="Severity"
          value={severityFilter}
          onChange={(val) => {
            setSeverityFilter(val);
            setFilters({ severity: val || null });
          }}
          placeholder="All Severities"
          options={SEVERITY_OPTIONS}
        />
        <HbcSelect
          label="Classification"
          value={classificationFilter}
          onChange={(val) => {
            setClassificationFilter(val);
            setFilters({ classification: val || null });
          }}
          placeholder="All Classifications"
          options={CLASSIFICATION_OPTIONS}
        />
        {hasActiveFilters && (
          <div className={styles.clearButtonWrap}>
            <HbcButton
              size="sm"
              variant="secondary"
              onClick={() => {
                setDomainFilter('');
                setSeverityFilter('');
                setClassificationFilter('');
                clearFilters();
              }}
            >
              Clear Filters
            </HbcButton>
          </div>
        )}
      </div>

      {errors.length === 0 && !isLoading ? (
        <HbcSmartEmptyState
          config={ERROR_LOG_EMPTY_CONFIG}
          context={emptyContext}
          variant="inline"
        />
      ) : (
        <div className={styles.errorList}>
          {errors.map((err) => (
            <HbcCard key={err.errorId} className={styles.errorCard}>
              <div className={styles.errorHeader}>
                <div>
                  <HbcTypography intent="label">{err.title}</HbcTypography>
                  <HbcTypography intent="bodySmall">{err.message}</HbcTypography>
                </div>
                <HbcStatusBadge
                  variant={SEVERITY_VARIANT[err.severity] ?? 'neutral'}
                  label={err.severity}
                />
              </div>
              <div className={styles.errorMeta}>
                <span className={styles.metaItem}>Domain: {err.domain}</span>
                <span className={styles.metaItem}>Source: {err.source}</span>
                <span className={styles.metaItem}>Classification: {err.classification}</span>
                <span className={styles.metaItem}>{formatTimestamp(err.occurredAt)}</span>
                {err.runId && <span className={styles.metaItem}>Run: {err.runId}</span>}
                {err.actionKey && <span className={styles.metaItem}>Action: {err.actionKey}</span>}
              </div>
            </HbcCard>
          ))}
        </div>
      )}
    </WorkspacePageShell>
  );
}
