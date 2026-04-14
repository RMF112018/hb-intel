import { describe, expect, it } from 'vitest';
import { authorAttribution } from './authorAttribution.js';

describe('authorAttribution', () => {
  it('returns "you" when the draft belongs to the acting operator (case-insensitive)', () => {
    expect(
      authorAttribution('Alice@Hedrickbrothers.com', 'alice@hedrickbrothers.com'),
    ).toBe('you');
  });

  it('returns a display name derived from the local-part otherwise', () => {
    expect(
      authorAttribution('bob.builder@hedrickbrothers.com', 'alice@hedrickbrothers.com'),
    ).toBe('Bob Builder');
  });

  it('handles dash and underscore separators', () => {
    expect(authorAttribution('c-j_long@hb.com', 'alice@hb.com')).toBe('C J Long');
  });

  it('falls back to "Unknown author" when email is missing', () => {
    expect(authorAttribution(undefined, 'alice@hb.com')).toBe('Unknown author');
    expect(authorAttribution('  ', 'alice@hb.com')).toBe('Unknown author');
  });

  it('returns the display name when the actor is missing', () => {
    expect(authorAttribution('dave@hb.com', undefined)).toBe('Dave');
  });
});
