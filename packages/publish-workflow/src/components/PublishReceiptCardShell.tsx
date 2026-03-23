/** SF25-T06 — PublishReceiptCard shell. */
import React, { useMemo } from 'react';
import { PublishReceiptCard, type PublishReceiptDetail, type PublishReceiptLink, type PublishReceiptOwner } from '@hbc/ui-kit';
import type { IPublishRequest } from '../types/index.js';

export interface PublishReceiptCardShellProps { request: IPublishRequest; relatedLinks?: PublishReceiptLink[]; onDownload?: () => void; onDismiss?: () => void; }

export function PublishReceiptCardShell({ request, relatedLinks = [], onDownload, onDismiss }: PublishReceiptCardShellProps): React.ReactElement | null {
  if (!request.receipt) return null;
  const detail: PublishReceiptDetail = useMemo(() => ({
    publishId: request.publishRequestId,
    issueLabel: request.issueLabel,
    publishedByName: request.requestedByUserId,
    publishedAtIso: request.receipt!.publishedAtIso,
    versionNumber: request.receipt!.versionNumber,
    frozen: request.receipt!.frozen,
    supersedesPublishId: request.contextStamp?.supersedesPublishId ?? null,
    targets: request.targets.map(t => ({ targetId: t.targetId, label: t.label, status: 'delivered' })),
  }), [request]);

  const owners: PublishReceiptOwner[] = useMemo(() => request.bicSteps.map(s => ({ upn: s.ownerUpn, displayName: s.ownerName, role: s.ownerRole })), [request.bicSteps]);

  return <PublishReceiptCard receipt={detail} relatedLinks={relatedLinks} owners={owners} syncStatus={null} onDownload={onDownload} onDismiss={onDismiss} />;
}
