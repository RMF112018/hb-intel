/**
 * Editor ↔ preview ↔ publish faithfulness proofs for the Story
 * body editor schema.
 *
 * Why this file exists. `editorSchema.ts` declares the canonical
 * set of nodes, marks, and attributes the Story body editor
 * accepts. The doctrine block at the top of that file names every
 * item kept out and the reason. This test file continuously proves
 * the declared schema:
 *
 *   - every allowed block/mark round-trips through a live
 *     `@tiptap/core` Editor built from the production
 *     `STORY_BODY_EXTENSIONS` set,
 *   - every explicitly disallowed block/mark is dropped by the
 *     schema parser (defense-in-depth around the paste sanitiser),
 *   - the editor's output HTML, rendered into the preview's
 *     `.bodyProse` container via `dangerouslySetInnerHTML` (the
 *     exact pattern `ArticlePreview.tsx` uses), emits the expected
 *     DOM so editor output and preview rendering stay in lock-step.
 *
 * If any case here fails, either the schema drifted, the preview
 * stopped rendering an allowed element, or a disallowed element
 * started surviving. Any such drift must be resolved before shipping.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { Editor } from '@tiptap/core';
import { STORY_BODY_EXTENSIONS } from '../editorSchema.js';

afterEach(cleanup);

function parseThroughSchema(input: string): string {
  const host = document.createElement('div');
  const editor = new Editor({
    element: host,
    extensions: STORY_BODY_EXTENSIONS,
    content: input,
  });
  const html = editor.getHTML();
  editor.destroy();
  host.remove();
  return html;
}

describe('editor schema ─ allowed elements round-trip through the schema', () => {
  it('keeps paragraphs', () => {
    const html = parseThroughSchema('<p>Opening line.</p>');
    expect(html).toContain('<p>Opening line.</p>');
  });

  it('keeps h2 and h3 headings', () => {
    const html = parseThroughSchema(
      '<h2>Chapter beat</h2><h3>Sub-beat</h3>',
    );
    expect(html).toContain('<h2>Chapter beat</h2>');
    expect(html).toContain('<h3>Sub-beat</h3>');
  });

  it('keeps bullet and ordered lists with list items', () => {
    const html = parseThroughSchema(
      '<ul><li>first</li><li>second</li></ul><ol><li>step one</li><li>step two</li></ol>',
    );
    expect(html).toMatch(/<ul>\s*<li>\s*(<p>)?first(<\/p>)?\s*<\/li>/);
    expect(html).toMatch(/<ol>\s*<li>\s*(<p>)?step one(<\/p>)?\s*<\/li>/);
  });

  it('keeps blockquote', () => {
    const html = parseThroughSchema(
      '<blockquote><p>Quoted voice.</p></blockquote>',
    );
    expect(html).toMatch(/<blockquote>\s*<p>Quoted voice\.<\/p>\s*<\/blockquote>/);
  });

  it('keeps hard breaks inside a paragraph', () => {
    const html = parseThroughSchema('<p>line one<br>line two</p>');
    expect(html).toMatch(/<p>line one<br[^>]*>line two<\/p>/);
  });

  it('keeps bold (<strong>) and italic (<em>) marks', () => {
    const html = parseThroughSchema(
      '<p><strong>Heavy</strong> and <em>light</em>.</p>',
    );
    expect(html).toContain('<strong>Heavy</strong>');
    expect(html).toContain('<em>light</em>');
  });

  it('keeps a link with a valid https href', () => {
    const html = parseThroughSchema(
      '<p>See <a href="https://example.com">example</a>.</p>',
    );
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('>example</a>');
  });
});

describe('editor schema ─ disallowed elements are dropped by the schema parser', () => {
  it('drops <h1> (page shell owns page-level h1)', () => {
    const html = parseThroughSchema('<h1>Forbidden</h1>');
    expect(html).not.toMatch(/<h1[\s>]/);
  });

  it('drops <h4>, <h5>, <h6> (beyond the supported depth)', () => {
    const html = parseThroughSchema(
      '<h4>Four</h4><h5>Five</h5><h6>Six</h6>',
    );
    expect(html).not.toMatch(/<h4[\s>]/);
    expect(html).not.toMatch(/<h5[\s>]/);
    expect(html).not.toMatch(/<h6[\s>]/);
  });

  it('drops <hr> (preview has no style for it)', () => {
    const html = parseThroughSchema('<p>a</p><hr><p>b</p>');
    expect(html).not.toMatch(/<hr[\s/>]/);
  });

  it('drops inline <code>, <code-block>, and <pre> (no technical voice in this product)', () => {
    const html = parseThroughSchema(
      '<p>a <code>x</code> b</p><pre><code>block</code></pre>',
    );
    expect(html).not.toMatch(/<code[\s>]/);
    expect(html).not.toMatch(/<pre[\s>]/);
  });

  it('drops <table> / <tr> / <td> (page shell does not render tables)', () => {
    const html = parseThroughSchema(
      '<table><tr><td>cell</td></tr></table>',
    );
    expect(html).not.toMatch(/<table[\s>]/);
    expect(html).not.toMatch(/<tr[\s>]/);
    expect(html).not.toMatch(/<td[\s>]/);
  });

  it('drops inline <img> (inline images bypass hero/gallery governance)', () => {
    const html = parseThroughSchema(
      '<p>before <img src="https://x/y.png" alt="x" /> after</p>',
    );
    expect(html).not.toMatch(/<img[\s/>]/);
  });

  it('drops <strike>, <s>, and <u> marks', () => {
    const html = parseThroughSchema(
      '<p><s>gone</s> <strike>also</strike> <u>underlined</u></p>',
    );
    expect(html).not.toMatch(/<s[\s>]/);
    expect(html).not.toMatch(/<strike[\s>]/);
    expect(html).not.toMatch(/<u[\s>]/);
  });

  it('drops <script> and <iframe>', () => {
    const html = parseThroughSchema(
      '<p>safe</p><script>alert(1)</script><iframe src="x"></iframe>',
    );
    expect(html).not.toMatch(/<script[\s>]/);
    expect(html).not.toMatch(/<iframe[\s>]/);
  });

  it('strips inline `style` and `class` attributes from surviving tags', () => {
    const html = parseThroughSchema(
      '<p style="color:red" class="danger"><strong style="font-size:30px">bold</strong></p>',
    );
    expect(html).not.toContain('style=');
    expect(html).not.toContain('class=');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('rejects links whose href fails the validation allowlist', () => {
    const html = parseThroughSchema(
      '<p><a href="javascript:alert(1)">click</a></p>',
    );
    expect(html).not.toContain('href=');
    // The link mark is dropped; the anchor text survives as plain text.
    expect(html).toContain('click');
  });
});

describe('editor ↔ preview faithfulness (bodyProse renders verbatim)', () => {
  it('renders every allowed element into the preview DOM without stripping', () => {
    const authored = parseThroughSchema(
      [
        '<h2>Beat</h2>',
        '<h3>Sub-beat</h3>',
        '<p>Opening with <strong>emphasis</strong>, <em>voice</em>, and a <a href="https://example.com">link</a>.</p>',
        '<ul><li>first</li><li>second</li></ul>',
        '<ol><li>step one</li><li>step two</li></ol>',
        '<blockquote><p>Quoted voice.</p></blockquote>',
      ].join(''),
    );

    const { container } = render(
      // eslint-disable-next-line react/no-danger -- exact pattern ArticlePreview uses
      React.createElement('div', {
        'data-testid': 'preview-body',
        dangerouslySetInnerHTML: { __html: authored },
      }),
    );

    const body = container.querySelector('[data-testid="preview-body"]')!;
    expect(body.querySelector('h2')?.textContent).toBe('Beat');
    expect(body.querySelector('h3')?.textContent).toBe('Sub-beat');
    expect(body.querySelector('strong')?.textContent).toBe('emphasis');
    expect(body.querySelector('em')?.textContent).toBe('voice');
    const link = body.querySelector('a');
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(body.querySelectorAll('ul > li').length).toBe(2);
    expect(body.querySelectorAll('ol > li').length).toBe(2);
    expect(body.querySelector('blockquote')).not.toBeNull();
  });
});
