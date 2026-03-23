/**
 * SF26-T05 — SavedViewChip composition shell.
 *
 * Governing: SF26-T05, L-06
 */

import React, { useMemo } from 'react';
import { SavedViewChip, type SavedViewChipView } from '@hbc/ui-kit';
import type { ISavedViewDefinition } from '../types/index.js';

export interface SavedViewChipShellProps {
  activeView: ISavedViewDefinition | undefined;
  hasUnsavedChanges: boolean;
  onOpenPicker: () => void;
}

export function SavedViewChipShell({ activeView, hasUnsavedChanges, onOpenPicker }: SavedViewChipShellProps): React.ReactElement {
  const chipView: SavedViewChipView | undefined = useMemo(
    () => activeView ? { title: activeView.title, scope: activeView.scope } : undefined,
    [activeView],
  );

  return <SavedViewChip activeView={chipView} hasUnsavedChanges={hasUnsavedChanges} onOpenPicker={onOpenPicker} />;
}
