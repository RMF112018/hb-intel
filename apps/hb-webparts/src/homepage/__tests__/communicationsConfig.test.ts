import { describe, expect, it } from 'vitest';
import {
  normalizeCompanyPulseConfig,
  normalizeLeadershipMessageConfig,
  normalizePeopleCultureConfig,
} from '../helpers/communicationsConfig.js';

describe('Prompt-06 communication normalization', () => {
  it('promotes lead story and bounds secondary and tertiary items', () => {
    const result = normalizeCompanyPulseConfig({
      maxSecondaryItems: 1,
      maxTertiaryItems: 1,
      items: [
        { id: 'one', title: 'Secondary', summary: 'Summary', order: 2 },
        { id: 'two', title: 'Featured', summary: 'Summary', featured: true, order: 1 },
        { id: 'three', title: 'Tertiary', summary: 'Summary', order: 3 },
        { id: 'four', title: 'Overflow', summary: 'Summary', order: 4 },
      ],
    });

    expect(result.lead?.id).toBe('two');
    expect(result.secondary.map((item) => item.id)).toEqual(['one']);
    expect(result.tertiary.map((item) => item.id)).toEqual(['three']);
  });

  it('normalizes byline, publishDate, and media on pulse items', () => {
    const result = normalizeCompanyPulseConfig({
      items: [
        {
          id: 'story',
          title: 'Lead Story',
          summary: 'Body text',
          byline: '  Corporate Communications  ',
          publishDate: '  2026-04-07  ',
          media: { src: '/img.jpg', alt: 'Photo' },
          featured: true,
          order: 1,
        },
      ],
    });

    expect(result.lead?.byline).toBe('Corporate Communications');
    expect(result.lead?.publishDate).toBe('2026-04-07');
    expect(result.lead?.media).toEqual({ src: '/img.jpg', alt: 'Photo' });
  });

  it('drops media without alt text on pulse items', () => {
    const result = normalizeCompanyPulseConfig({
      items: [
        {
          id: 'story',
          title: 'Story',
          summary: 'Body',
          media: { src: '/img.jpg', alt: '' },
          featured: true,
          order: 1,
        },
      ],
    });

    expect(result.lead?.media).toBeUndefined();
  });

  it('preserves archiveHref in newsroom output', () => {
    const result = normalizeCompanyPulseConfig({
      archiveHref: '/sites/hb-central/pulse',
      items: [
        { id: 'story', title: 'Story', summary: 'Body', featured: true, order: 1 },
      ],
    });

    expect(result.archiveHref).toBe('/sites/hb-central/pulse');
  });

  it('produces empty lead and tertiary for sparse single-item input', () => {
    const result = normalizeCompanyPulseConfig({
      items: [
        { id: 'only', title: 'Only Story', summary: 'Body', order: 1 },
      ],
    });

    expect(result.lead?.id).toBe('only');
    expect(result.secondary).toEqual([]);
    expect(result.tertiary).toEqual([]);
  });

  it('handles zero stories gracefully', () => {
    const result = normalizeCompanyPulseConfig({ items: [] });

    expect(result.lead).toBeUndefined();
    expect(result.secondary).toEqual([]);
    expect(result.tertiary).toEqual([]);
  });

  it('filters pulse items by audience', () => {
    const result = normalizeCompanyPulseConfig(
      {
        items: [
          { id: 'field', title: 'Field Story', summary: 'Body', audiences: ['field'], order: 1 },
          { id: 'admin', title: 'Admin Story', summary: 'Body', audiences: ['admin'], order: 2 },
        ],
      },
      'field',
    );

    expect(result.lead?.id).toBe('field');
    expect(result.secondary).toEqual([]);
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
