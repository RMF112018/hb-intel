import { describe, expect, it } from 'vitest';
import {
  ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES,
  ARTICLE_CONTENT_TYPE_VALUES,
} from './publisherEnums';

describe('publisher content-type enums', () => {
  it('keeps compatibility values schema-complete, including milestoneSpotlight', () => {
    expect((ARTICLE_CONTENT_TYPE_VALUES as readonly string[])).toContain('milestoneSpotlight');
  });

  it('excludes milestoneSpotlight from operational live-authoring values', () => {
    expect(
      (ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES as readonly string[]),
    ).not.toContain('milestoneSpotlight');

    for (const value of ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES) {
      expect((ARTICLE_CONTENT_TYPE_VALUES as readonly string[])).toContain(value);
    }
  });
});
