import * as React from 'react';
import { CompanyPulse } from '../../companyPulse/CompanyPulse.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';
import { normalizeCompanyPulseConfig } from '../../../homepage/helpers/communicationsConfig.js';
import { useReportOccupantContentState } from '../shell/occupantContentState.js';
import type { OccupantContentStateReport } from '../shell/occupantContentState.js';

function buildCompanyPulseReport(
  config: unknown,
  activeAudience?: string,
): OccupantContentStateReport {
  const normalized = normalizeCompanyPulseConfig(
    config as Record<string, unknown> | undefined,
    activeAudience,
  );
  const leadCount = normalized.lead ? 1 : 0;
  const itemCount = leadCount + normalized.secondary.length + normalized.tertiary.length;

  if (itemCount === 0) {
    return {
      occupantId: 'company-pulse',
      kind: 'empty',
      summary: 'no-items',
      itemCount: 0,
      reportedAt: Date.now(),
    };
  }

  const kind = leadCount > 0 ? 'strong' : 'low-signal';
  return {
    occupantId: 'company-pulse',
    kind,
    summary: `lead=${leadCount} secondary=${normalized.secondary.length} tertiary=${normalized.tertiary.length}`,
    itemCount,
    reportedAt: Date.now(),
  };
}

export function CompanyPulseZone({ moduleConfig }: HbHomepageZoneProps): React.JSX.Element {
  const report = React.useMemo(
    () => buildCompanyPulseReport(moduleConfig.companyPulse, moduleConfig.activeAudience),
    [moduleConfig.companyPulse, moduleConfig.activeAudience],
  );
  useReportOccupantContentState(report);

  return (
    <ZoneErrorBoundary zoneName="company-pulse">
      <section aria-label="Company Pulse">
        <CompanyPulse config={moduleConfig.companyPulse} activeAudience={moduleConfig.activeAudience} />
      </section>
    </ZoneErrorBoundary>
  );
}
