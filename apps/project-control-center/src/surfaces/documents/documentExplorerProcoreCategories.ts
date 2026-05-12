/**
 * Phase 08 wave-b13 Prompt 10B — Procore category vocabulary and typed
 * category directory nodes.
 *
 * Locked 11-entry directory model. Display labels match the locked
 * user-facing text exactly; `relativePathSegments` use the stable
 * kebab-case `categoryId` so the Prompt 10D module-focus mapping
 * (`procore-documents → ['documents']`) is deterministically aligned
 * with the category node's own segments.
 *
 * Prompt 10B intentionally does NOT populate `children` on these nodes
 * — Procore linked-record preview rows and external-reference UI are
 * Prompt 10E scope.
 */

import { type IDocumentExplorerNode } from './documentExplorerModel';

export type ProcoreCategoryId =
  | 'documents'
  | 'drawings'
  | 'specifications'
  | 'rfis'
  | 'submittals'
  | 'change-orders'
  | 'commitments'
  | 'change-events'
  | 'inspections'
  | 'observations'
  | 'punch-list';

export const DOCUMENT_EXPLORER_PROCORE_CATEGORY_ORDER: readonly ProcoreCategoryId[] = [
  'documents',
  'drawings',
  'specifications',
  'rfis',
  'submittals',
  'change-orders',
  'commitments',
  'change-events',
  'inspections',
  'observations',
  'punch-list',
];

export interface IDocumentExplorerProcoreCategory {
  readonly categoryId: ProcoreCategoryId;
  readonly displayLabel: string;
}

export const DOCUMENT_EXPLORER_PROCORE_CATEGORIES: readonly IDocumentExplorerProcoreCategory[] = [
  { categoryId: 'documents', displayLabel: 'Documents' },
  { categoryId: 'drawings', displayLabel: 'Drawings' },
  { categoryId: 'specifications', displayLabel: 'Specifications' },
  { categoryId: 'rfis', displayLabel: 'RFIs' },
  { categoryId: 'submittals', displayLabel: 'Submittals' },
  { categoryId: 'change-orders', displayLabel: 'Change Orders' },
  { categoryId: 'commitments', displayLabel: 'Commitments' },
  { categoryId: 'change-events', displayLabel: 'Change Events' },
  { categoryId: 'inspections', displayLabel: 'Inspections' },
  { categoryId: 'observations', displayLabel: 'Observations' },
  { categoryId: 'punch-list', displayLabel: 'Punch List' },
];

export const PROCORE_CATEGORY_DIRECTORY_NODES: readonly IDocumentExplorerNode[] =
  DOCUMENT_EXPLORER_PROCORE_CATEGORIES.map((category) => ({
    nodeId: `procore/${category.categoryId}`,
    displayLabel: category.displayLabel,
    sourceId: 'procore',
    nodeKind: 'category',
    parentId: 'procore',
    relativePathSegments: [category.categoryId],
    hasChildren: false,
    posture: 'launch-only',
  }));
