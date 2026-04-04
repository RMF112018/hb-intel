/**
 * SafetyPreviewPanel — Phase 11 preview/dry-run result display.
 *
 * Composes ui-kit safety primitives to present a full preview result
 * with scope, impact items, warnings, and proceed/cancel actions.
 *
 * @design P11-06
 */
import * as React from 'react';
import {
  HbcSafetyBanner,
  HbcScopeSummaryCard,
  HbcImpactSummaryList,
  HbcButton,
} from '@hbc/ui-kit';
import type {
  IAdminSafetyPreviewResult,
} from '@hbc/models/admin-control-plane';

export interface SafetyPreviewPanelProps {
  /** Preview result from the backend */
  readonly preview: IAdminSafetyPreviewResult;
  /** Callback when operator chooses to proceed */
  readonly onProceed?: () => void;
  /** Callback when operator cancels */
  readonly onCancel?: () => void;
  /** Whether the proceed action is loading */
  readonly loading?: boolean;
}

export const SafetyPreviewPanel: React.FC<SafetyPreviewPanelProps> = ({
  preview,
  onProceed,
  onCancel,
  loading = false,
}) => {
  const riskLevel = preview.riskLevel as 'read-only' | 'low' | 'moderate' | 'high' | 'critical';
  const warnings = preview.warnings.map(w => ({
    severity: w.severity,
    code: w.code,
    message: w.message,
    resource: w.resource,
  }));

  const impactItems = preview.impactItems.map(item => ({
    resource: item.resource,
    changeType: item.changeType,
    description: item.description,
    reversible: item.reversible,
    itemRiskLevel: item.itemRiskLevel as 'read-only' | 'low' | 'moderate' | 'high' | 'critical',
  }));

  const scope = {
    domain: preview.scope.domain,
    targetEntityId: preview.scope.targetEntityId,
    targetEntityLabel: preview.scope.targetEntityLabel,
    affectedResourceCount: preview.scope.affectedResourceCount,
    scopeDescription: preview.scope.scopeDescription,
  };

  return (
    <div data-hbc-ui="safety-preview-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <HbcSafetyBanner
        riskLevel={riskLevel}
        title={preview.dryRun ? 'Dry-Run Result' : 'Action Preview'}
        warnings={warnings}
      >
        {preview.advisoryNotes.length > 0 && (
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
            {preview.advisoryNotes.map((note, i) => (
              <div key={i}>• {note}</div>
            ))}
          </div>
        )}
      </HbcSafetyBanner>

      <HbcScopeSummaryCard scope={scope} riskLevel={riskLevel} />

      {impactItems.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.6, marginBottom: '8px' }}>
            Impact Summary ({impactItems.length} item{impactItems.length !== 1 ? 's' : ''})
          </div>
          <HbcImpactSummaryList items={impactItems} />
        </div>
      )}

      {(onProceed || onCancel) && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          {onCancel && (
            <HbcButton variant="secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </HbcButton>
          )}
          {onProceed && (
            <HbcButton
              variant="primary"
              onClick={onProceed}
              disabled={!preview.proceedRecommended || loading}
            >
              {loading ? 'Processing…' : 'Proceed'}
            </HbcButton>
          )}
        </div>
      )}
    </div>
  );
};
