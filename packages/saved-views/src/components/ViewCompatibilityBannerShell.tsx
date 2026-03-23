/**
 * SF26-T06 — ViewCompatibilityBanner composition shell.
 */
import React from 'react';
import { ViewCompatibilityBanner, type ViewCompatibilityBannerResult } from '@hbc/ui-kit';
import type { ISavedViewCompatibilityResult } from '../types/index.js';

export interface ViewCompatibilityBannerShellProps {
  result: ISavedViewCompatibilityResult;
  onApplyAnyway: () => void;
  onCancel: () => void;
}

export function ViewCompatibilityBannerShell({ result, onApplyAnyway, onCancel }: ViewCompatibilityBannerShellProps): React.ReactElement {
  const bannerResult: ViewCompatibilityBannerResult = { status: result.status, removedColumns: result.removedColumns, removedFilterFields: result.removedFilterFields, removedGroupFields: result.removedGroupFields, userExplanation: result.userExplanation };
  return <ViewCompatibilityBanner result={bannerResult} onApplyAnyway={onApplyAnyway} onCancel={onCancel} />;
}
