/**
 * SF25-T05 — HbcPublishPanel composition shell.
 */
import React, { useMemo } from 'react';
import { HbcPublishPanel, type PublishPanelStep, type PublishPanelTarget } from '@hbc/ui-kit';
import type { IPublishRequest } from '../types/index.js';
import type { IPublishStorageAdapter } from '../storage/IPublishStorageAdapter.js';
import { usePublishWorkflowState } from '../hooks/usePublishWorkflowState.js';

export interface PublishPanelShellProps {
  adapter: IPublishStorageAdapter;
  sourceModuleKey: string;
  projectId: string;
  onPublish?: () => void;
  onApprove?: (stepId: string) => void;
  onReject?: (stepId: string) => void;
  onSupersede?: () => void;
  onRevoke?: () => void;
}

export function PublishPanelShell({ adapter, sourceModuleKey, projectId, onPublish, onApprove, onReject, onSupersede, onRevoke }: PublishPanelShellProps): React.ReactElement {
  const { requests, isLoading } = usePublishWorkflowState({ adapter, sourceModuleKey, projectId });
  const active = requests[0];

  const steps: PublishPanelStep[] = useMemo(() => active?.bicSteps.map(s => ({ stepId: s.stepId, label: s.stepLabel, status: 'pending', ownerName: s.ownerName, ownerRole: s.ownerRole, blocking: s.blocking })) ?? [], [active]);
  const targets: PublishPanelTarget[] = useMemo(() => active?.targets.map(t => ({ targetId: t.targetId, label: t.label, targetType: t.targetType, ready: true, readyMessage: null })) ?? [], [active]);

  if (isLoading || !active) return <div>Loading publish panel...</div>;

  return (
    <HbcPublishPanel
      state={active.state}
      readinessMessage={active.readiness.isReady ? 'Ready to publish' : 'Not ready'}
      isReady={active.readiness.isReady}
      blockingReasons={active.readiness.blockingReasons}
      approvalSteps={steps}
      targets={targets}
      receipt={active.receipt ? { receiptId: active.receipt.receiptId, publishedAtIso: active.receipt.publishedAtIso, versionNumber: active.receipt.versionNumber, frozen: active.receipt.frozen, artifactUrl: active.receipt.artifactUrl } : null}
      supersessionMessage={active.supersession.supersededByRecordId ? `Superseded by ${active.supersession.supersededByRecordId}` : null}
      revocationMessage={active.revocation.revokedByUpn ? `Revoked by ${active.revocation.revokedByUpn}: ${active.revocation.reason}` : null}
      syncStatus={null}
      onPublish={onPublish} onApprove={onApprove} onReject={onReject} onSupersede={onSupersede} onRevoke={onRevoke}
    />
  );
}
