/**
 * Drawings Module Config — PH4.13 §13.7
 * Blueprint §1d — Construction drawing management
 */
import { createColumnHelper } from '@tanstack/react-table';
import type { ModuleLandingConfig } from './types.js';

type DrawingRow = Record<string, unknown>;
const col = createColumnHelper<DrawingRow>();

export const drawingsLanding: ModuleLandingConfig<DrawingRow> = {
  toolName: 'Drawings',
  table: {
    columns: [
      col.accessor('sheetNumber', { header: 'Sheet #', size: 110 }),
      col.accessor('sheetName', { header: 'Sheet Name', size: 250 }),
      col.accessor('discipline', { header: 'Discipline', size: 130 }),
      col.accessor('currentRevision', { header: 'Revision', size: 100 }),
      col.accessor('lastUpdated', { header: 'Last Updated', size: 130 }),
      col.accessor('markupCount', { header: 'Markups', size: 100 }),
    ],
    defaultSort: { id: 'sheetNumber', desc: false },
    mobileCardFields: ['sheetNumber', 'sheetName', 'discipline', 'currentRevision'],
  },
  kpiCards: [],
};

/** Standard discipline filter options */
export const disciplineFilters = [
  { key: 'all', label: 'All Disciplines' },
  { key: 'A', label: 'Architectural' },
  { key: 'S', label: 'Structural' },
  { key: 'M', label: 'Mechanical' },
  { key: 'E', label: 'Electrical' },
  { key: 'P', label: 'Plumbing' },
  { key: 'C', label: 'Civil' },
  { key: 'L', label: 'Landscape' },
] as const;
