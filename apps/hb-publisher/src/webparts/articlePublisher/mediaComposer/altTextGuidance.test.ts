import { describe, expect, it } from 'vitest';
import {
  assessAltText,
  assessCaption,
  roleGuidance,
} from './altTextGuidance.js';

describe('assessAltText', () => {
  it('flags empty alt text as a problem', () => {
    const out = assessAltText('');
    expect(out.level).toBe('problem');
    expect(out.message).toMatch(/required/i);
  });

  it('flags whitespace-only alt text as a problem', () => {
    expect(assessAltText('   ').level).toBe('problem');
  });

  it('warns when alt text starts with "image of", "picture of", etc.', () => {
    for (const phrase of ['image of', 'picture of', 'photo of', 'screenshot of']) {
      const out = assessAltText(`${phrase} a bridge at sunset`);
      expect(out.level).toBe('warn');
      expect(out.message.toLowerCase()).toContain(phrase);
    }
  });

  it('warns when alt text is too short', () => {
    expect(assessAltText('a beam').level).toBe('warn');
  });

  it('accepts a well-formed single sentence', () => {
    const out = assessAltText(
      'Crew raising the final steel beam at the West Palm Beach jobsite.',
    );
    expect(out.level).toBe('good');
  });

  it('warns at the soft ceiling', () => {
    const text = 'a '.repeat(70).trim();
    const out = assessAltText(text);
    expect(out.level).toBe('warn');
    expect(out.message).toMatch(/long/i);
  });

  it('problem-levels past the hard ceiling', () => {
    const text = 'x'.repeat(260);
    expect(assessAltText(text).level).toBe('problem');
  });
});

describe('assessCaption', () => {
  it('returns ok when caption is empty', () => {
    expect(assessCaption({ caption: '', altText: 'x' }).level).toBe('ok');
  });

  it('warns when caption duplicates alt text (case-insensitive)', () => {
    const out = assessCaption({ caption: 'Same Line.', altText: 'same line.' });
    expect(out.level).toBe('warn');
    expect(out.message).toMatch(/duplicate/i);
  });

  it('returns good when caption adds editorial colour', () => {
    expect(
      assessCaption({ caption: 'Final beam — April 2026.', altText: 'Crew raising the beam.' })
        .level,
    ).toBe('good');
  });
});

describe('roleGuidance', () => {
  it('explains gallery role', () => {
    expect(roleGuidance('gallery')).toMatch(/gallery block/i);
  });
  it('explains supporting role', () => {
    expect(roleGuidance('supporting')).toMatch(/inline/i);
  });
});
