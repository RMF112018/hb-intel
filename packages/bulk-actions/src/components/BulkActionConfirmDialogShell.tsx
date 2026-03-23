/** SF27-T06 — BulkActionConfirmDialog shell. */
import React from 'react';
import { BulkActionConfirmDialog } from '@hbc/ui-kit';
import type { IBulkActionDefinition, IBulkSelectionSnapshot } from '../types/index.js';

export interface BulkActionConfirmDialogShellProps { action: IBulkActionDefinition<unknown>; selection: IBulkSelectionSnapshot; onConfirm: () => void; onCancel: () => void; }

export function BulkActionConfirmDialogShell({ action, selection, onConfirm, onCancel }: BulkActionConfirmDialogShellProps): React.ReactElement {
  return <BulkActionConfirmDialog actionLabel={action.label} itemCount={selection.exactCount} destructive={action.destructive} onConfirm={onConfirm} onCancel={onCancel} />;
}
