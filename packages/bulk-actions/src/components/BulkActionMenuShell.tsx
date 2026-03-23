/** SF27-T05 — BulkActionMenu shell. */
import React, { useMemo } from 'react';
import { BulkActionMenu, type BulkActionMenuItem } from '@hbc/ui-kit';
import type { IBulkActionDefinition } from '../types/index.js';

export interface BulkActionMenuShellProps { actions: IBulkActionDefinition<unknown>[]; onSelectAction: (actionId: string) => void; }

export function BulkActionMenuShell({ actions, onSelectAction }: BulkActionMenuShellProps): React.ReactElement {
  const items: BulkActionMenuItem[] = useMemo(() => actions.map(a => ({
    actionId: a.actionId, label: a.label, destructive: a.destructive, enabled: true, disabledReason: null,
  })), [actions]);
  return <BulkActionMenu actions={items} onSelectAction={onSelectAction} />;
}
