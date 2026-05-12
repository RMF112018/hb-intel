import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_EXPLORER_PROCORE_CATEGORY_ORDER,
  type ProcoreCategoryId,
} from '../surfaces/documents/documentExplorerProcoreCategories';
import {
  PROCORE_LINKED_RECORDS_BY_CATEGORY,
  PROCORE_LINKED_RECORD_KIND_BY_CATEGORY,
  PROCORE_LAUNCH_REASON,
  PROCORE_LAUNCH_NEXT_STEP,
  PROCORE_CATEGORY_PANE_POSTURE_COPY,
} from '../surfaces/documents/documentExplorerProcoreLinkedRecords';
import { PROCORE_SOURCE_ROOT_NODE } from '../surfaces/documents/documentExplorerSourceRoots';

const FORBIDDEN_INVENTED_STATUS_PATTERNS: readonly RegExp[] = [
  /\bapproved\b/i,
  /\brejected\b/i,
  /\bpending\b/i,
  /\bopen\b/i,
  /\bclosed\b/i,
  /\bdue\b/i,
  /\$/, // no dollar values
  /\b\d{4}-\d{2}-\d{2}\b/, // ISO-like date timestamps
];

describe('documentExplorerProcoreLinkedRecords — recordKind map', () => {
  it('covers every locked Procore category', () => {
    for (const id of DOCUMENT_EXPLORER_PROCORE_CATEGORY_ORDER) {
      expect(PROCORE_LINKED_RECORD_KIND_BY_CATEGORY[id]).toBeTruthy();
    }
  });

  it('maps each category to the locked singular record kind (no string heuristics)', () => {
    const expected: Readonly<Record<ProcoreCategoryId, string>> = {
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
    expect(PROCORE_LINKED_RECORD_KIND_BY_CATEGORY).toEqual(expected);
  });
});

describe('documentExplorerProcoreLinkedRecords — fixture coverage', () => {
  it('every category has at least one linked-record entry', () => {
    for (const id of DOCUMENT_EXPLORER_PROCORE_CATEGORY_ORDER) {
      const records = PROCORE_LINKED_RECORDS_BY_CATEGORY[id];
      expect(
        records.length,
        `category '${id}' must have at least one linked record`,
      ).toBeGreaterThan(0);
    }
  });

  it('each record node has the locked shape (kind, source, posture, parent, nodeId, segments, linkedRecordRef)', () => {
    for (const id of DOCUMENT_EXPLORER_PROCORE_CATEGORY_ORDER) {
      const records = PROCORE_LINKED_RECORDS_BY_CATEGORY[id];
      for (const node of records) {
        expect(node.nodeKind).toBe('linked-record');
        expect(node.sourceId).toBe('procore');
        expect(node.posture).toBe('launch-only');
        expect(node.parentId).toBe(`procore/${id}`);
        expect(node.hasChildren).toBe(false);
        expect(node.children).toBeUndefined();
        expect(node.relativePathSegments.length).toBe(2);
        expect(node.relativePathSegments[0]).toBe(id);
        const recordId = node.relativePathSegments[1];
        expect(recordId).toBeTruthy();
        expect(node.nodeId).toBe(`procore/${id}/${recordId}`);
        expect(node.linkedRecordRef?.recordKind).toBe(PROCORE_LINKED_RECORD_KIND_BY_CATEGORY[id]);
      }
    }
  });

  it('display labels contain no invented status, dollar, or date substrings', () => {
    for (const id of DOCUMENT_EXPLORER_PROCORE_CATEGORY_ORDER) {
      for (const node of PROCORE_LINKED_RECORDS_BY_CATEGORY[id]) {
        for (const pattern of FORBIDDEN_INVENTED_STATUS_PATTERNS) {
          expect(
            pattern.test(node.displayLabel),
            `linked-record '${node.nodeId}' label leaked pattern ${pattern}`,
          ).toBe(false);
        }
      }
    }
  });
});

describe('documentExplorerProcoreLinkedRecords — composed Procore source root', () => {
  it('every composed category under PROCORE_SOURCE_ROOT_NODE carries its linked-record children', () => {
    const composedCategories = PROCORE_SOURCE_ROOT_NODE.children ?? [];
    expect(composedCategories.length).toBe(DOCUMENT_EXPLORER_PROCORE_CATEGORY_ORDER.length);
    for (const composed of composedCategories) {
      const childCount = composed.children?.length ?? 0;
      expect(
        childCount,
        `composed Procore category '${composed.nodeId}' must expose linked-record children`,
      ).toBeGreaterThan(0);
    }
  });
});

describe('documentExplorerProcoreLinkedRecords — launch-cue and posture copy', () => {
  it('exports product-safe launch reason and next-step copy', () => {
    expect(PROCORE_LAUNCH_REASON).toMatch(/Direct launch is not available/);
    expect(PROCORE_LAUNCH_NEXT_STEP).toMatch(/configured Procore project source/);
  });

  it('exports the Procore category-pane posture cue copy', () => {
    expect(PROCORE_CATEGORY_PANE_POSTURE_COPY).toMatch(/Procore is the source system/);
    expect(PROCORE_CATEGORY_PANE_POSTURE_COPY).toMatch(/does not mirror, sync, or write back/);
  });
});
