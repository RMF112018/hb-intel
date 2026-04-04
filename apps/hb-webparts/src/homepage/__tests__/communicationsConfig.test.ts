import { describe, expect, it } from 'vitest';
import {
  normalizeCompanyPulseConfig,
  normalizeLeadershipMessageConfig,
  normalizePeopleCultureConfig,
} from '../helpers/communicationsConfig.js';

describe('Prompt-06 communication normalization', () => {
  it('promotes featured pulse item and bounds secondary items', () => {
    const result = normalizeCompanyPulseConfig({
      maxSecondaryItems: 1,
      items: [
        { id: 'one', title: 'Secondary', summary: 'Summary', order: 2 },
        { id: 'two', title: 'Featured', summary: 'Summary', featured: true, order: 1 },
      ],
    });

    expect(result.featured?.id).toBe('two');
    expect(result.secondary.map((item) => item.id)).toEqual(['one']);
  });

  it('drops malformed leadership entries and media without alt', () => {
    const result = normalizeLeadershipMessageConfig({
      entries: [
        { id: 'good', title: 'Message', message: 'Body', leaderName: 'Leader', media: { src: '/a.jpg', alt: 'Leader' } },
        { id: 'bad-media', title: 'Bad', message: 'Body', leaderName: 'Leader', media: { src: '/b.jpg', alt: '' } },
        { id: '', title: 'Invalid', message: 'Body', leaderName: 'Leader' },
      ],
    });

    expect(result.featured?.id).toBe('bad-media');
    expect(result.featured?.media).toBeUndefined();
    expect(result.secondary[0]?.id).toBe('good');
  });

  it('filters people and culture entries by audience', () => {
    const result = normalizePeopleCultureConfig(
      {
        entries: [
          { id: 'field', personName: 'Field Person', eventType: 'recognition', highlight: 'Great work', audiences: ['field'] },
          { id: 'admin', personName: 'Admin Person', eventType: 'promotion', highlight: 'Congrats', audiences: ['admin'] },
        ],
      },
      'field',
    );

    expect(result.featured?.id).toBe('field');
    expect(result.secondary).toEqual([]);
  });
});
