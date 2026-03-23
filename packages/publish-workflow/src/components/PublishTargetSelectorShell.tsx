/**
 * SF25-T05 — PublishTargetSelector composition shell.
 */
import React, { useMemo } from 'react';
import { PublishTargetSelector, type PublishTargetOption } from '@hbc/ui-kit';
import type { IPublishRequest } from '../types/index.js';

export interface PublishTargetSelectorShellProps {
  request: IPublishRequest;
  selectedTargetIds: Set<string>;
  onToggleTarget: (targetId: string) => void;
}

export function PublishTargetSelectorShell({ request, selectedTargetIds, onToggleTarget }: PublishTargetSelectorShellProps): React.ReactElement {
  const targets: PublishTargetOption[] = useMemo(
    () => request.targets.map(t => ({ targetId: t.targetId, label: t.label, targetType: t.targetType, compatible: true, incompatibleReason: null, selected: selectedTargetIds.has(t.targetId) })),
    [request.targets, selectedTargetIds],
  );
  return <PublishTargetSelector targets={targets} offlineStatus={null} onToggleTarget={onToggleTarget} />;
}
