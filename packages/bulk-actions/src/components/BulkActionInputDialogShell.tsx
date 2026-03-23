/** SF27-T06 — BulkActionInputDialog shell. */
import React, { useState, useCallback, useMemo } from 'react';
import { BulkActionInputDialog, type BulkActionInputField } from '@hbc/ui-kit';
import type { IBulkActionDefinition, IBulkConfiguredInputSchema } from '../types/index.js';

export interface BulkActionInputDialogShellProps { action: IBulkActionDefinition<unknown>; onConfirm: (values: Record<string, string>) => void; onCancel: () => void; }

export function BulkActionInputDialogShell({ action, onConfirm, onCancel }: BulkActionInputDialogShellProps): React.ReactElement {
  const [values, setValues] = useState<Record<string, string>>({});
  const onChange = useCallback((key: string, value: string) => setValues(prev => ({ ...prev, [key]: value })), []);
  const fields: BulkActionInputField[] = useMemo(() => (action.inputSchema?.fields ?? []).map(f => ({ key: f.key, label: f.label, type: f.type === 'number' || f.type === 'boolean' ? 'text' : f.type, options: f.options })), [action.inputSchema]);
  return <BulkActionInputDialog actionLabel={action.label} fields={fields} values={values} onChange={onChange} onConfirm={() => onConfirm(values)} onCancel={onCancel} />;
}
