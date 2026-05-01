import type { FC } from 'react';
import type { TeamAccessRequestStatus } from '@hbc/models/pcc';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import { REQUEST_STATUS_LABELS } from './teamAccessAdapter';

export const REQUEST_STATUS_TONES: Readonly<Record<TeamAccessRequestStatus, PccStatusPillTone>> = {
  'draft-preview': 'neutral',
  'submitted-preview': 'info',
  'pending-review': 'warning',
  'approved-pending-execution': 'info',
  rejected: 'danger',
  'completed-manual': 'success',
};

export interface PccRequestStatusBadgeProps {
  status: TeamAccessRequestStatus;
  label?: string;
}

export const PccRequestStatusBadge: FC<PccRequestStatusBadgeProps> = ({ status, label }) => {
  const tone = REQUEST_STATUS_TONES[status];
  const visibleLabel = label ?? REQUEST_STATUS_LABELS[status];
  return (
    <span
      data-pcc-request-status={status}
      data-pcc-request-status-tone={tone}
      data-pcc-request-status-label={visibleLabel}
    >
      <PccStatusPill tone={tone}>{visibleLabel}</PccStatusPill>
    </span>
  );
};

export default PccRequestStatusBadge;
