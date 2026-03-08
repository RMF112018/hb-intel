import React from 'react';
import type { IUploadedDocument } from '../../types/index.js';

interface MigrationStatusBadgeProps {
  status: IUploadedDocument['migrationStatus'];
}

const STATUS_LABELS: Record<IUploadedDocument['migrationStatus'], string> = {
  'not-applicable': '',
  'pending': 'Awaiting migration',
  'scheduled': 'Migration tonight',
  'in-progress': 'Migrating…',
  'migrated': 'In project site',
  'conflict': 'Conflict — action needed',
  'failed': 'Migration failed',
};

const STATUS_CLASSES: Record<IUploadedDocument['migrationStatus'], string> = {
  'not-applicable': '',
  'pending': 'hbc-badge--neutral',
  'scheduled': 'hbc-badge--info',
  'in-progress': 'hbc-badge--info hbc-badge--pulsing',
  'migrated': 'hbc-badge--success',
  'conflict': 'hbc-badge--warning',
  'failed': 'hbc-badge--error',
};

export const MigrationStatusBadge: React.FC<MigrationStatusBadgeProps> = ({ status }) => {
  if (status === 'not-applicable') return null;
  return (
    <span className={`hbc-badge ${STATUS_CLASSES[status]}`} aria-label={STATUS_LABELS[status]}>
      {STATUS_LABELS[status]}
    </span>
  );
};
