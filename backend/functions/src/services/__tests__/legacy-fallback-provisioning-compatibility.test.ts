import { describe, expect, it } from 'vitest';
import {
  getCompatibleSharePointFieldTypes,
  isSharePointFieldTypeCompatible,
  normalizeListTitle,
} from '../legacy-fallback/provisioning-compatibility.js';

describe('legacy fallback provisioning compatibility', () => {
  it('normalizes equivalent list titles for detection', () => {
    expect(normalizeListTitle('Legacy Project Fallback Registry')).toBe(
      normalizeListTitle('legacy-project fallback   registry'),
    );
  });

  it('maps multiline text to SharePoint Note compatibility', () => {
    expect(isSharePointFieldTypeCompatible('MultiLineText', 'Note')).toBe(true);
    expect(isSharePointFieldTypeCompatible('MultiLineText', 'Text')).toBe(false);
  });

  it('keeps URL compatibility strict and does not treat Text as URL-compatible', () => {
    expect(isSharePointFieldTypeCompatible('URL', 'URL')).toBe(true);
    expect(isSharePointFieldTypeCompatible('URL', 'Text')).toBe(false);
  });

  it('exposes compatible type families for diagnostics', () => {
    expect(getCompatibleSharePointFieldTypes('Choice')).toEqual(['Choice', 'MultiChoice']);
    expect(getCompatibleSharePointFieldTypes('Number')).toEqual(['Number', 'Currency']);
  });
});
