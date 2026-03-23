/** SF27-T06 — BulkActionResultsPanel shell. */
import React, { useMemo } from 'react';
import { BulkActionResultsPanel, type BulkActionResultItem } from '@hbc/ui-kit';
import type { IBulkExecutionResult } from '../types/index.js';

export interface BulkActionResultsPanelShellProps { result: IBulkExecutionResult; onRetryFailed?: () => void; onDismiss: () => void; }

export function BulkActionResultsPanelShell({ result, onRetryFailed, onDismiss }: BulkActionResultsPanelShellProps): React.ReactElement {
  const items: BulkActionResultItem[] = useMemo(() => result.items.map(i => ({ itemId: i.itemRef.id, status: i.resultKind, message: i.message, retryable: i.retryable })), [result.items]);
  return <BulkActionResultsPanel actionLabel={result.actionId} successCount={result.succeeded} failedCount={result.failed} skippedCount={result.skipped} items={items} onRetryFailed={result.retryable > 0 ? onRetryFailed : undefined} onDismiss={onDismiss} />;
}
