import { type FC, useMemo } from 'react';
import { HbcStatusBadge, HbcSpinner, HbcBanner, HbcButton } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig } from '@hbc/smart-empty-state';
import { useInfrastructureProbes } from '../hooks/useInfrastructureProbes.js';
import type { IInfrastructureProbeResult } from '../types/IInfrastructureProbeResult.js';
import { probeStatusToVariant, formatAlertTimestamp, PROBE_STALENESS_MS } from './helpers.js';

const PROBE_SECTIONS: { key: IInfrastructureProbeResult['probeKey']; label: string }[] = [
  { key: 'sharepoint-infrastructure', label: 'SharePoint Infrastructure' },
  { key: 'azure-functions', label: 'Azure Functions' },
  { key: 'azure-search', label: 'Azure Search' },
  { key: 'notification-system', label: 'Notification System' },
  { key: 'module-record-health', label: 'Module Record Health' },
];

const PROBE_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'No probe data',
    description: 'No data available for this probe. Run probes to collect current health status.',
    coachingTip: 'Probe data is cached for 30 minutes after each run.',
  }),
};

export interface ImplementationTruthDashboardProps {
  readonly onRunProbes?: () => void;
}

/**
 * Dashboard component showing infrastructure probe results and health status.
 *
 * @design D-04, SF17-T06
 */
export const ImplementationTruthDashboard: FC<ImplementationTruthDashboardProps> = ({
  onRunProbes,
}) => {
  const { latestSnapshot, isLoading, error, refresh, lastRunAt } = useInfrastructureProbes();

  const isStale = useMemo(() => {
    if (!lastRunAt) return false;
    return Date.now() - new Date(lastRunAt).getTime() > PROBE_STALENESS_MS;
  }, [lastRunAt]);

  const resultsByKey = useMemo(() => {
    const map = new Map<string, IInfrastructureProbeResult>();
    if (latestSnapshot) {
      for (const result of latestSnapshot.results) {
        map.set(result.probeKey, result);
      }
    }
    return map;
  }, [latestSnapshot]);

  const handleRunProbes = () => {
    void refresh();
    onRunProbes?.();
  };

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading probe results">
        <HbcSpinner label="Loading probe results…" />
      </div>
    );
  }

  if (error) {
    return (
      <HbcBanner variant="error">
        Failed to load probe results: {error.message}
      </HbcBanner>
    );
  }

  return (
    <div aria-label="Implementation truth dashboard">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        {lastRunAt && (
          <span>Last run: {formatAlertTimestamp(lastRunAt)}</span>
        )}
        {isStale && (
          <HbcBanner variant="warning">
            Probe data is stale (last run over 30 minutes ago).
          </HbcBanner>
        )}
        <HbcButton variant="secondary" size="sm" onClick={handleRunProbes} aria-label="Run probes now">
          Run probes now
        </HbcButton>
      </div>

      {PROBE_SECTIONS.map(({ key, label }) => {
        const result = resultsByKey.get(key);

        return (
          <section key={key} aria-label={`${label} probe status`}>
            <h3>
              <HbcStatusBadge
                variant={result ? probeStatusToVariant(result.status) : 'neutral'}
                label={label}
              />
            </h3>
            {result ? (
              <>
                <p>{result.summary}</p>
                {Object.keys(result.metrics).length > 0 && (
                  <ul aria-label={`${label} metrics`}>
                    {Object.entries(result.metrics).map(([metric, value]) => (
                      <li key={metric}>{metric}: {String(value)}</li>
                    ))}
                  </ul>
                )}
                {result.anomalies.length > 0 && (
                  <ul aria-label={`${label} anomalies`}>
                    {result.anomalies.map((anomaly) => (
                      <li key={anomaly}>{anomaly}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <HbcSmartEmptyState
                config={PROBE_EMPTY_CONFIG}
                context={{
                  module: 'admin',
                  view: `probe-${key}`,
                  hasActiveFilters: false,
                  hasPermission: true,
                  isFirstVisit: false,
                  currentUserRole: 'admin',
                  isLoadError: false,
                }}
                variant="inline"
              />
            )}
          </section>
        );
      })}
    </div>
  );
};
