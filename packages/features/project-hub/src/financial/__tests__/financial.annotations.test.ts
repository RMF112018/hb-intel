import { describe, expect, it } from 'vitest';

import {
  createAnnotationAnchor,
  resolveAnchorOnVersion,
  carryForwardAnnotations,
} from '../../index.js';
import { mockAnnotationAnchors, mockSourceAnnotations } from '../../../testing/index.js';

describe('P3-E4-T08 annotation anchor and carry-forward', () => {
  describe('createAnnotationAnchor', () => {
    it('creates a field-level anchor', () => {
      const anchor = createAnnotationAnchor('ver-1', 'field', {
        canonicalBudgetLineId: 'canon-001',
        fieldKey: 'forecastToComplete',
      });
      expect(anchor.forecastVersionId).toBe('ver-1');
      expect(anchor.anchorType).toBe('field');
      expect(anchor.canonicalBudgetLineId).toBe('canon-001');
      expect(anchor.fieldKey).toBe('forecastToComplete');
    });

    it('creates a section-level anchor', () => {
      const anchor = createAnnotationAnchor('ver-1', 'section', {
        sectionKey: 'cost-summary',
      });
      expect(anchor.anchorType).toBe('section');
      expect(anchor.sectionKey).toBe('cost-summary');
    });

    it('creates a block-level anchor', () => {
      const anchor = createAnnotationAnchor('ver-1', 'block', {
        blockKey: 'cash-flow-q2-2026',
      });
      expect(anchor.anchorType).toBe('block');
      expect(anchor.blockKey).toBe('cash-flow-q2-2026');
    });
  });

  describe('resolveAnchorOnVersion', () => {
    const lineIds = new Set(['canon-001', 'canon-002']);

    it('resolves when canonicalBudgetLineId exists in new version', () => {
      const result = resolveAnchorOnVersion(mockAnnotationAnchors.fieldAnchor, lineIds);
      expect(result.resolved).toBe(true);
    });

    it('does not resolve when canonicalBudgetLineId is missing', () => {
      const result = resolveAnchorOnVersion(mockAnnotationAnchors.unresolvedFieldAnchor, lineIds);
      expect(result.resolved).toBe(false);
    });

    it('section anchors always resolve', () => {
      const result = resolveAnchorOnVersion(mockAnnotationAnchors.sectionAnchor, lineIds);
      expect(result.resolved).toBe(true);
    });

    it('block anchors always resolve', () => {
      const result = resolveAnchorOnVersion(mockAnnotationAnchors.blockAnchor, lineIds);
      expect(result.resolved).toBe(true);
    });
  });

  describe('carryForwardAnnotations', () => {
    const lineIds = new Set(['canon-001', 'canon-002']);

    it('carries forward resolved annotations and skips unresolvable', () => {
      const result = carryForwardAnnotations(
        mockSourceAnnotations,
        'ver-confirmed',
        'ver-new-working',
        lineIds,
      );
      // ann-001 (field, canon-001) → resolved
      // ann-002 (section) → resolved
      // ann-003 (field, canon-removed) → unresolvable, skipped
      expect(result).toHaveLength(2);
    });

    it('sets inheritanceStatus to Inherited and pmDispositionStatus to Pending', () => {
      const result = carryForwardAnnotations(mockSourceAnnotations, 'src', 'tgt', lineIds);
      for (const cf of result) {
        expect(cf.inheritanceStatus).toBe('Inherited');
        expect(cf.pmDispositionStatus).toBe('Pending');
      }
    });

    it('sets valueChangedFlag when value differs between versions', () => {
      const valueMap = new Map([['canon-001:forecastToComplete', 45000]]); // changed from 37000
      const result = carryForwardAnnotations(mockSourceAnnotations, 'src', 'tgt', lineIds, valueMap);
      const fieldCf = result.find((cf) => cf.sourceAnnotationId === 'ann-001')!;
      expect(fieldCf.valueChangedFlag).toBe(true);
    });

    it('sets valueChangedFlag false when value is unchanged', () => {
      const valueMap = new Map([['canon-001:forecastToComplete', 37000]]); // same value
      const result = carryForwardAnnotations(mockSourceAnnotations, 'src', 'tgt', lineIds, valueMap);
      const fieldCf = result.find((cf) => cf.sourceAnnotationId === 'ann-001')!;
      expect(fieldCf.valueChangedFlag).toBe(false);
    });

    it('generates unique newAnnotationId for each carry-forward', () => {
      const result = carryForwardAnnotations(mockSourceAnnotations, 'src', 'tgt', lineIds);
      const ids = new Set(result.map((cf) => cf.newAnnotationId));
      expect(ids.size).toBe(result.length);
    });

    it('returns empty array when no annotations provided', () => {
      const result = carryForwardAnnotations([], 'src', 'tgt', lineIds);
      expect(result).toHaveLength(0);
    });
  });
});
