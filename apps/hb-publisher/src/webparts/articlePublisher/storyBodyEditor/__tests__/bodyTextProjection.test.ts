import { describe, expect, it } from 'vitest';
import { bodyTextProjection, bodyTextSnippet } from '../bodyTextProjection';

describe('bodyTextProjection', () => {
  it('strips simple paragraph tags', () => {
    expect(bodyTextProjection('<p>Hello world</p>')).toBe('Hello world');
  });

  it('inserts a separator between adjacent block elements', () => {
    expect(bodyTextProjection('<p>One</p><p>Two</p>')).toBe('One Two');
    expect(bodyTextProjection('<h2>Heading</h2><p>Body</p>')).toBe('Heading Body');
  });

  it('flattens lists into space-separated text', () => {
    expect(bodyTextProjection('<ul><li>One</li><li>Two</li></ul>')).toBe('One Two');
    expect(bodyTextProjection('<ol><li>First</li><li>Second</li></ol>')).toBe('First Second');
  });

  it('preserves inline mark text', () => {
    expect(bodyTextProjection('<p><strong>Bold</strong> and <em>italic</em>.</p>'))
      .toBe('Bold and italic.');
  });

  it('decodes basic entities', () => {
    expect(bodyTextProjection('<p>Hedrick &amp; Brothers</p>')).toBe('Hedrick & Brothers');
    expect(bodyTextProjection('<p>5 &lt; 10</p>')).toBe('5 < 10');
    expect(bodyTextProjection('<p>It&#39;s a test</p>')).toBe("It's a test");
  });

  it('collapses internal whitespace runs', () => {
    expect(bodyTextProjection('<p>Hello   world\n\n!</p>')).toBe('Hello world !');
  });

  it('returns an empty string for empty input', () => {
    expect(bodyTextProjection('')).toBe('');
    expect(bodyTextProjection(undefined)).toBe('');
    expect(bodyTextProjection(null)).toBe('');
  });

  it('handles nested marks and links', () => {
    expect(
      bodyTextProjection(
        '<p>Read <a href="https://example.com"><strong>the docs</strong></a> first.</p>',
      ),
    ).toBe('Read the docs first.');
  });
});

describe('bodyTextSnippet', () => {
  it('returns the full projection when shorter than maxChars', () => {
    expect(bodyTextSnippet('<p>Short body.</p>', 200)).toBe('Short body.');
  });

  it('truncates at a word boundary when possible and adds an ellipsis', () => {
    const html = `<p>${'This sentence is intentionally long. '.repeat(20)}</p>`;
    const snippet = bodyTextSnippet(html, 100);
    expect(snippet.length).toBeLessThanOrEqual(101);
    expect(snippet.endsWith('…')).toBe(true);
    expect(snippet).not.toMatch(/\s$/);
  });

  it('returns an empty string for empty input', () => {
    expect(bodyTextSnippet('', 200)).toBe('');
  });
});
