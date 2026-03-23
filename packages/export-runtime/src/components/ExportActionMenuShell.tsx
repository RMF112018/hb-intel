/**
 * SF24-T05 — ExportActionMenu composition shell.
 *
 * Thin wrapper wiring useExportRuntimeState hook output to @hbc/ui-kit
 * ExportActionMenu props. Runtime owns state; ui-kit owns rendering.
 *
 * Governing: SF24-T05, L-01 (primitive ownership)
 */

import React, { useMemo } from 'react';
import {
  ExportActionMenu,
  type ExportMenuOption,
  type ExportMenuRecommendation,
  type ExportMenuSuppressedFormat,
  type ExportMenuReviewOwner,
} from '@hbc/ui-kit';
import type { ExportComplexityTier } from '../types/index.js';
import type { IExportStorageAdapter } from '../storage/IExportStorageAdapter.js';
import { EXPORT_FORMATS } from '../types/index.js';
import { useExportRuntimeState } from '../hooks/useExportRuntimeState.js';

// ── Props ────────────────────────────────────────────────────────────────

export interface ExportActionMenuShellProps {
  /** Storage adapter for loading export state. */
  adapter: IExportStorageAdapter;
  /** Module key for scoping queries. */
  moduleKey: string;
  /** Project ID for filtering. */
  projectId: string;
  /** Complexity tier governing menu depth. */
  complexityTier: ExportComplexityTier;
  /** Fired when user selects an export option. */
  onExportSelected: (option: ExportMenuOption) => void;
  /** Fired when user opens composition (Expert tier). */
  onOpenComposition?: () => void;
  /** Fired when user opens configuration (Expert tier). */
  onOpenConfigure?: () => void;
}

// ── Shell ────────────────────────────────────────────────────────────────

/**
 * Wires export runtime state to the ExportActionMenu ui-kit component.
 */
export function ExportActionMenuShell({
  adapter,
  moduleKey,
  projectId,
  complexityTier,
  onExportSelected,
  onOpenComposition,
  onOpenConfigure,
}: ExportActionMenuShellProps): React.ReactElement {
  const {
    requests,
    isLoading,
    suppressedFormats: runtimeSuppressed,
    topRecommended,
  } = useExportRuntimeState({ adapter, moduleKey, projectId });

  // Map formats to menu options
  const options: ExportMenuOption[] = useMemo(() => {
    const suppressedSet = new Set(runtimeSuppressed.map(s => s.format));
    return EXPORT_FORMATS.map(format => {
      const suppressed = runtimeSuppressed.find(s => s.format === format);
      return {
        format,
        intent: 'working-data',
        label: format.toUpperCase(),
        description: `Export as ${format.toUpperCase()}`,
        enabled: !suppressedSet.has(format),
        disabledReason: suppressed?.userMessage ?? null,
      };
    });
  }, [runtimeSuppressed]);

  // Map recommended action
  const recommended: ExportMenuRecommendation | null = useMemo(() => {
    if (!topRecommended?.exportFormat) return null;
    const option = options.find(o => o.format === topRecommended.exportFormat);
    if (!option) return null;
    return { option, reason: topRecommended.reason };
  }, [topRecommended, options]);

  // Map suppressed formats
  const suppressedFormats: ExportMenuSuppressedFormat[] = useMemo(
    () => runtimeSuppressed.map(s => ({ format: s.format, reason: s.userMessage })),
    [runtimeSuppressed],
  );

  // Map BIC review owners from active requests
  const reviewOwners: ExportMenuReviewOwner[] = useMemo(
    () =>
      requests
        .flatMap(r => r.bicSteps)
        .filter(step => step.blocking)
        .map(step => ({
          upn: step.ownerUpn,
          displayName: step.ownerName,
          role: step.ownerRole,
        })),
    [requests],
  );

  return (
    <ExportActionMenu
      options={options}
      recommended={recommended}
      suppressedFormats={suppressedFormats}
      complexityTier={complexityTier}
      reviewOwners={reviewOwners}
      loading={isLoading}
      onSelectOption={onExportSelected}
      onOpenComposition={onOpenComposition}
      onOpenConfigure={onOpenConfigure}
    />
  );
}
