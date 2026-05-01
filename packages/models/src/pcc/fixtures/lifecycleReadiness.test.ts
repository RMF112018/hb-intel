import { describe, it, expect } from 'vitest';
import { LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS } from '../LifecycleReadiness.js';
import {
  LIFECYCLE_READINESS_LIBRARY_METADATA,
  SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS,
  SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS,
} from './lifecycleReadiness.js';

describe('Lifecycle readiness fixture shapes', () => {
  it('template ids and project-instance ids use distinct prefixes', () => {
    for (const tpl of SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS) {
      expect(tpl.templateItemId.startsWith('tpl-')).toBe(true);
      expect(tpl.templateItemId.startsWith('inst-')).toBe(false);
    }
    for (const inst of SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS) {
      expect(inst.projectItemId.startsWith('inst-')).toBe(true);
      expect(inst.projectItemId.startsWith('tpl-')).toBe(false);
    }
  });

  it('every template sourceTrace.itemKey is unique across the fixture set', () => {
    const itemKeys = SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.map(
      (t) => t.sourceTrace.itemKey,
    );
    expect(new Set(itemKeys).size).toBe(itemKeys.length);
  });

  it('library metadata totals reconcile with the canonical 157 / 55 / 32 / 70 cardinality', () => {
    expect(LIFECYCLE_READINESS_LIBRARY_METADATA.total).toBe(157);
    expect(LIFECYCLE_READINESS_LIBRARY_METADATA.familyCounts).toBe(
      LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS,
    );
    const sum =
      LIFECYCLE_READINESS_LIBRARY_METADATA.familyCounts.startup +
      LIFECYCLE_READINESS_LIBRARY_METADATA.familyCounts.safety +
      LIFECYCLE_READINESS_LIBRARY_METADATA.familyCounts.closeout;
    expect(sum).toBe(LIFECYCLE_READINESS_LIBRARY_METADATA.total);
    expect(LIFECYCLE_READINESS_LIBRARY_METADATA.sourceDocuments.length).toBe(3);
    const familiesInDocs = new Set(
      LIFECYCLE_READINESS_LIBRARY_METADATA.sourceDocuments.map((d) => d.family),
    );
    expect(familiesInDocs.has('startup')).toBe(true);
    expect(familiesInDocs.has('safety')).toBe(true);
    expect(familiesInDocs.has('closeout')).toBe(true);
  });

  it('every template sourceTrace.family matches the template family field', () => {
    for (const tpl of SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS) {
      expect(
        tpl.sourceTrace.family,
        `${tpl.templateItemId} sourceTrace.family parity`,
      ).toBe(tpl.family);
    }
  });

  it('every project instance family matches its backing template family', () => {
    const templateFamilyById = new Map(
      SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS.map((t) => [
        t.templateItemId,
        t.family,
      ]),
    );
    for (const inst of SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS) {
      const tplFamily = templateFamilyById.get(inst.templateItemId);
      expect(tplFamily, `${inst.projectItemId} template lookup`).toBe(
        inst.family,
      );
    }
  });
});
