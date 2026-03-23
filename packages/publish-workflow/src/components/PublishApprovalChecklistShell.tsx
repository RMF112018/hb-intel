/** SF25-T06 — PublishApprovalChecklist shell. */
import React, { useMemo } from 'react';
import { PublishApprovalChecklist, type PublishChecklistItem } from '@hbc/ui-kit';
import type { IPublishRequest } from '../types/index.js';
import { evaluateReadiness } from '../model/lifecycle.js';

export interface PublishApprovalChecklistShellProps { request: IPublishRequest; onAcknowledge?: (ruleId: string) => void; }

export function PublishApprovalChecklistShell({ request, onAcknowledge }: PublishApprovalChecklistShellProps): React.ReactElement {
  const items: PublishChecklistItem[] = useMemo(() => [
    { ruleId: 'targets', label: 'Publish targets defined', pass: request.targets.length > 0, message: request.targets.length > 0 ? `${request.targets.length} target(s)` : 'No targets', ownerName: null, dueStatus: null, blocking: true },
    { ruleId: 'source', label: 'Source record available', pass: !!request.sourceRecordId, message: request.sourceRecordId || 'Missing', ownerName: null, dueStatus: null, blocking: true },
    ...request.approvalRules.map(r => ({ ruleId: r.ruleId, label: r.label, pass: request.approval.status === 'approved' || request.approval.status === 'not-required', message: request.approval.status, ownerName: null, dueStatus: r.deadlineHours ? `${r.deadlineHours}h` : null, blocking: r.required })),
  ], [request]);

  const supersessionWarning = request.supersession.supersededByRecordId ? `This publication will be superseded by ${request.supersession.supersededByRecordId}` : null;
  const revocationPrerequisite = request.state === 'published' && request.approval.status === 'approved' ? 'Revocation requires explicit justification' : null;

  return <PublishApprovalChecklist items={items} supersessionWarning={supersessionWarning} revocationPrerequisite={revocationPrerequisite} onAcknowledge={onAcknowledge} />;
}
