import { describe, expect, it } from 'vitest';
import { normalizeSmartSearchWayfindingConfig } from '../helpers/discoveryConfig.js';

describe('Prompt-08 discovery normalization', () => {
  it('keeps deterministic category ordering and promoted resources', () => {
    const result = normalizeSmartSearchWayfindingConfig({
      categories: [
        { id: 'forms', title: 'Forms', order: 2 },
        { id: 'systems', title: 'Systems', order: 1 },
      ],
      resources: [
        {
          id: 'r2',
          title: 'Form B',
          href: '/form-b',
          type: 'form',
          categoryId: 'forms',
          promoted: true,
          order: 2,
        },
        {
          id: 'r1',
          title: 'System A',
          href: '/system-a',
          type: 'system',
          categoryId: 'systems',
          promoted: true,
          order: 1,
        },
      ],
    });

    expect(result.categoryGroups.map((group) => group.id)).toEqual(['systems', 'forms']);
    expect(result.promotedResources.map((resource) => resource.id)).toEqual(['r1', 'r2']);
  });

  it('filters by audience and query text', () => {
    const result = normalizeSmartSearchWayfindingConfig(
      {
        resources: [
          {
            id: 'field-resource',
            title: 'Safety Field Dashboard',
            href: '/safety',
            type: 'destination',
            audiences: ['field'],
            keywords: ['safety'],
          },
          {
            id: 'admin-resource',
            title: 'Finance Console',
            href: '/finance',
            type: 'system',
            audiences: ['admin'],
          },
        ],
      },
      'field',
      'safety',
    );

    expect(result.hasResources).toBe(true);
    expect(result.categoryGroups.flatMap((group) => group.resources).map((resource) => resource.id)).toEqual([
      'field-resource',
    ]);
  });

  it('drops malformed config and returns no-resource state', () => {
    const result = normalizeSmartSearchWayfindingConfig({
      resources: [{ id: '', title: '', href: '', type: 'tool' }],
      quickPaths: [{ id: '', title: '', href: '' }],
    });

    expect(result.hasResources).toBe(false);
    expect(result.categoryGroups).toEqual([]);
    expect(result.quickPaths).toEqual([]);
  });
});
