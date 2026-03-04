/**
 * Documents Module Config — PH4.13 §13.7
 * Blueprint §1d — Document management / explorer
 */
import { createColumnHelper } from '@tanstack/react-table';
import type { ModuleLandingConfig } from './types.js';

type DocumentRow = Record<string, unknown>;
const col = createColumnHelper<DocumentRow>();

export const documentsLanding: ModuleLandingConfig<DocumentRow> = {
  toolName: 'Documents',
  table: {
    columns: [
      col.accessor('name', { header: 'Name', size: 280 }),
      col.accessor('type', { header: 'Type', size: 100 }),
      col.accessor('size', { header: 'Size', size: 90 }),
      col.accessor('modifiedBy', { header: 'Modified By', size: 150 }),
      col.accessor('modifiedAt', { header: 'Modified', size: 140 }),
      col.accessor('version', { header: 'Version', size: 80 }),
    ],
    defaultSort: { id: 'modifiedAt', desc: true },
    mobileCardFields: ['name', 'type', 'modifiedAt'],
  },
  kpiCards: [],
};
