/**
 * Phase 08 wave-b13 Prompt 10E — deterministic Procore linked-record
 * fixture and launch-cue copy.
 *
 * Read-only / launch-only reference data for the Document Control
 * Explorer Procore category panes. Records are governed preview
 * entries: each `displayLabel` is intrinsic to the record's identity
 * (number + short title), with no fabricated approval state, dollar
 * exposure, due date, assignee, or live transactional status.
 *
 * Inspection / Observation identifiers use non-date `INSP-NNN` /
 * `OBS-NNN` forms to avoid invented timestamps. Linked-record
 * `recordKind` is sourced from the locked category-to-record-kind map
 * below — never derived via string heuristics.
 */

import type { IDocumentExplorerNode } from './documentExplorerModel';
import type { ProcoreCategoryId } from './documentExplorerProcoreCategories';

/**
 * Locked Procore category → linked-record `recordKind` map. Consumed
 * by the fixture below; do not derive `recordKind` from `categoryId`
 * via string heuristics.
 */
export const PROCORE_LINKED_RECORD_KIND_BY_CATEGORY: Readonly<Record<ProcoreCategoryId, string>> = {
  documents: 'document',
  drawings: 'drawing',
  specifications: 'specification',
  rfis: 'rfi',
  submittals: 'submittal',
  'change-orders': 'change-order',
  commitments: 'commitment',
  'change-events': 'change-event',
  inspections: 'inspection',
  observations: 'observation',
  'punch-list': 'punch-item',
};

/**
 * Product-safe launch-cue copy for the inert `PccDisabledAffordance`
 * controls inside Procore category panes. Verbatim from the Prompt
 * 10E preferred wording.
 */
export const PROCORE_LAUNCH_REASON =
  'Direct launch is not available from this Document Control view.';
export const PROCORE_LAUNCH_NEXT_STEP =
  'Use the configured Procore project source when external launch access is enabled.';

/**
 * Product-safe Procore source posture cue rendered above the
 * linked-record list when the user has drilled into a category.
 */
export const PROCORE_CATEGORY_PANE_POSTURE_COPY =
  'Procore is the source system. PCC does not mirror, sync, or write back from this Document Control view.';

interface ILinkedRecordSeed {
  readonly recordId: string;
  readonly displayLabel: string;
}

const LINKED_RECORD_SEEDS_BY_CATEGORY: Readonly<
  Record<ProcoreCategoryId, readonly ILinkedRecordSeed[]>
> = {
  documents: [
    { recordId: '24-001', displayLabel: 'Document 24-001 — Project Manual Rev. A' },
    {
      recordId: '24-014',
      displayLabel: 'Document 24-014 — Issued for Construction Drawings',
    },
  ],
  drawings: [
    { recordId: 'A101', displayLabel: 'Drawing A101 — Level 1 Architectural Plan' },
    { recordId: 'S201', displayLabel: 'Drawing S201 — Foundation Details' },
  ],
  specifications: [
    {
      recordId: '03-30-00',
      displayLabel: 'Specification 03 30 00 — Cast-in-Place Concrete',
    },
    { recordId: '09-91-00', displayLabel: 'Specification 09 91 00 — Painting' },
  ],
  rfis: [
    { recordId: '014', displayLabel: 'RFI 014 — Courtyard Drainage Clarification' },
    {
      recordId: '027',
      displayLabel: 'RFI 027 — Steel Connection Detail at Gridline C-5',
    },
  ],
  submittals: [
    {
      recordId: '061000-03',
      displayLabel: 'Submittal 061000-03 — Rough Carpentry Product Data',
    },
    {
      recordId: '092900-01',
      displayLabel: 'Submittal 092900-01 — Gypsum Board Shop Drawings',
    },
  ],
  'change-orders': [
    {
      recordId: '005',
      displayLabel: 'Change Order 005 — Lobby Finish Upgrade Package',
    },
    { recordId: '008', displayLabel: 'Change Order 008 — Site Utility Realignment' },
  ],
  commitments: [
    { recordId: 'SUB-0142', displayLabel: 'Commitment SUB-0142 — Structural Steel Erection' },
    {
      recordId: 'SUB-0188',
      displayLabel: 'Commitment SUB-0188 — Mechanical Equipment Package',
    },
  ],
  'change-events': [
    {
      recordId: '022',
      displayLabel: 'Change Event 022 — East Lobby Finish Revision',
    },
    { recordId: '031', displayLabel: 'Change Event 031 — Roof Membrane Substitution' },
  ],
  inspections: [
    { recordId: 'INSP-014', displayLabel: 'Inspection INSP-014 — Footing Reinforcement' },
    {
      recordId: 'INSP-027',
      displayLabel: 'Inspection INSP-027 — Underground Plumbing Rough',
    },
  ],
  observations: [
    { recordId: 'OBS-008', displayLabel: 'Observation OBS-008 — Site Safety Walk' },
    {
      recordId: 'OBS-012',
      displayLabel: 'Observation OBS-012 — Concrete Pour Quality Walk',
    },
  ],
  'punch-list': [
    { recordId: 'PL-001', displayLabel: 'Punch List PL-001 — Level 1 Finish Items' },
    {
      recordId: 'PL-002',
      displayLabel: 'Punch List PL-002 — Mechanical Room Items',
    },
  ],
};

function buildLinkedRecordNode(
  categoryId: ProcoreCategoryId,
  seed: ILinkedRecordSeed,
): IDocumentExplorerNode {
  return {
    nodeId: `procore/${categoryId}/${seed.recordId}`,
    displayLabel: seed.displayLabel,
    sourceId: 'procore',
    nodeKind: 'linked-record',
    parentId: `procore/${categoryId}`,
    relativePathSegments: [categoryId, seed.recordId],
    hasChildren: false,
    posture: 'launch-only',
    linkedRecordRef: { recordKind: PROCORE_LINKED_RECORD_KIND_BY_CATEGORY[categoryId] },
  };
}

export const PROCORE_LINKED_RECORDS_BY_CATEGORY: Readonly<
  Record<ProcoreCategoryId, readonly IDocumentExplorerNode[]>
> = Object.fromEntries(
  (Object.keys(LINKED_RECORD_SEEDS_BY_CATEGORY) as ProcoreCategoryId[]).map((categoryId) => [
    categoryId,
    LINKED_RECORD_SEEDS_BY_CATEGORY[categoryId].map((seed) =>
      buildLinkedRecordNode(categoryId, seed),
    ),
  ]),
) as unknown as Readonly<Record<ProcoreCategoryId, readonly IDocumentExplorerNode[]>>;
