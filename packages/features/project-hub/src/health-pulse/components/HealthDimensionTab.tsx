import { useMemo, useState } from 'react';
import {
  HbcBanner,
  HbcButton,
  HbcCard,
  HbcStatusBadge,
  HbcTooltip,
  HbcTypography,
} from '@hbc/ui-kit';
import { usePermission } from '@hbc/auth';

import type { IHealthDimension, IHealthMetric, IManualEntryGovernanceConfig } from '../types/index.js';
import type { HealthDimensionKey } from './displayModel.js';
import {
  getMetricAnchorId,
  getMetricAgeInDays,
  getMetricValueLabel,
  isMetricExcluded,
  isMetricMissing,
  isOverrideAged,
} from './displayModel.js';
import {
  HealthMetricInlineEdit,
  type IHealthMetricInlineEditSavePayload,
} from './HealthMetricInlineEdit.js';

export interface HealthDimensionTabProps {
  dimensionKey: HealthDimensionKey;
  dimension: IHealthDimension;
  governance: IManualEntryGovernanceConfig;
  canEditOverride?: boolean;
  onMetricSave?: (metric: IHealthMetric) => void;
  onOpenInlineEdit?: (metricKey: string) => void;
  sensitiveMetricKeys?: string[];
  now?: () => Date;
}

const ROW_STYLE = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' };

export const HealthDimensionTab = ({
  dimensionKey,
  dimension,
  governance,
  canEditOverride = true,
  onMetricSave,
  onOpenInlineEdit,
  sensitiveMetricKeys = [],
  now = () => new Date(),
}: HealthDimensionTabProps) => {
  const hasWritePermission = usePermission('project-health:write');
  const canEdit = hasWritePermission && canEditOverride;

  const [localMetrics, setLocalMetrics] = useState<IHealthMetric[]>(dimension.metrics);
  const [editingMetricKey, setEditingMetricKey] = useState<string | null>(null);

  const nowIso = now().toISOString();
  const sensitiveSet = useMemo(
    () =>
      new Set([
        ...sensitiveMetricKeys,
        ...governance.approvalRequiredMetricKeys,
      ]),
    [governance.approvalRequiredMetricKeys, sensitiveMetricKeys]
  );

  const excludedMetrics = localMetrics.filter((metric) => isMetricExcluded(metric));
  const leadingMetrics = localMetrics.filter((metric) => metric.weight === 'leading');
  const laggingMetrics = localMetrics.filter((metric) => metric.weight === 'lagging');

  const handleSave = (payload: IHealthMetricInlineEditSavePayload): void => {
    setLocalMetrics((current) =>
      current.map((metric) =>
        metric.key === payload.metric.key ? payload.metric : metric
      )
    );
    onMetricSave?.(payload.metric);
    setEditingMetricKey(null);
  };

  const openInlineEdit = (metricKey: string): void => {
    setEditingMetricKey(metricKey);
    onOpenInlineEdit?.(metricKey);
  };

  const renderMetricRow = (metric: IHealthMetric) => {
    const isSensitive = sensitiveSet.has(metric.key);
    const requiresApproval = isSensitive || metric.manualOverride?.requiresApproval === true;
    const enteredAt = metric.manualOverride?.enteredAt;
    const isAged =
      isOverrideAged(enteredAt, governance.maxOverrideAgeDays, nowIso);
    const eligibleForEdit =
      metric.value === null || metric.isStale || metric.isManualEntry;

    return (
      <li key={metric.key} id={getMetricAnchorId(dimensionKey, metric.key)}>
        <div style={ROW_STYLE}>
          <HbcTypography intent="label">{metric.label}</HbcTypography>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isMetricMissing(metric) && (
              <HbcStatusBadge variant="pending" label="Missing" />
            )}
            {metric.isStale && <HbcStatusBadge variant="warning" label="Stale" />}
            {metric.isManualEntry && (
              <HbcStatusBadge variant="info" label="Manual entry" />
            )}
            {requiresApproval && (
              <HbcStatusBadge variant="warning" label="Approval required" />
            )}
            {canEdit && eligibleForEdit && (
              <HbcTooltip content="Edit governed metric override">
                <HbcButton
                  size="sm"
                  variant="secondary"
                  onClick={() => openInlineEdit(metric.key)}
                >
                  Edit
                </HbcButton>
              </HbcTooltip>
            )}
          </div>
        </div>
        <HbcTypography intent="body">
          Value: {getMetricValueLabel(metric)} | Last updated:{' '}
          {metric.lastUpdatedAt ?? 'unknown'}
        </HbcTypography>
        {metric.manualOverride && (
          <HbcTypography intent="bodySmall">
            Override: {metric.manualOverride.reason} | By:{' '}
            {metric.manualOverride.enteredBy} | At:{' '}
            {metric.manualOverride.enteredAt}
            {metric.manualOverride.approvedBy
              ? ` | Approved by: ${metric.manualOverride.approvedBy}`
              : ''}
          </HbcTypography>
        )}
        {isAged && (
          <HbcBanner variant="warning">
            Override aging warning: {getMetricAgeInDays(enteredAt!, nowIso)} days old,
            exceeding governance max of {governance.maxOverrideAgeDays}.
          </HbcBanner>
        )}
      </li>
    );
  };

  const editingMetric = localMetrics.find((metric) => metric.key === editingMetricKey) ?? null;

  return (
    <HbcCard
      header={<HbcTypography intent="heading3">{dimension.label} Metrics</HbcTypography>}
    >
      {!canEdit && (
        <HbcBanner variant="info">
          Read-only mode. `project-health:write` permission is required for inline edits.
        </HbcBanner>
      )}

      {excludedMetrics.length > 0 && (
        <HbcBanner variant="warning">
          Excluded metrics detected ({excludedMetrics.length}). Jump to first impacted metric.
          <div style={{ marginTop: 8 }}>
            <HbcButton
              size="sm"
              variant="ghost"
              onClick={() => {
                const first = excludedMetrics[0];
                if (!first) return;
                const anchor = document.getElementById(
                  getMetricAnchorId(dimensionKey, first.key)
                );
                anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Jump to affected metrics
            </HbcButton>
          </div>
        </HbcBanner>
      )}

      <HbcTypography intent="heading4">Leading metrics</HbcTypography>
      <ul>{leadingMetrics.map((metric) => renderMetricRow(metric))}</ul>

      <HbcTypography intent="heading4">Lagging metrics</HbcTypography>
      <ul>{laggingMetrics.map((metric) => renderMetricRow(metric))}</ul>

      <HealthMetricInlineEdit
        metric={editingMetric}
        open={editingMetric !== null}
        onClose={() => setEditingMetricKey(null)}
        onSave={handleSave}
        requiresApproval={editingMetric ? sensitiveSet.has(editingMetric.key) : false}
        maxOverrideAgeDays={governance.maxOverrideAgeDays}
        actorId="health-dimension-operator"
        now={now}
      />
    </HbcCard>
  );
};
