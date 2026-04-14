import { describe, expect, it } from 'vitest';
import { sanitizePastedHtml } from '../pasteSanitization';

describe('sanitizePastedHtml', () => {
  it('returns empty string for non-string / empty input', () => {
    expect(sanitizePastedHtml('')).toBe('');
    expect(sanitizePastedHtml(undefined as unknown as string)).toBe('');
    expect(sanitizePastedHtml(null as unknown as string)).toBe('');
  });

  it('strips inline styles and classes from otherwise-allowed tags', () => {
    const input =
      '<p style="font-family:Calibri; font-size:14pt; color:red" class="MsoNormal">Hello</p>';
    expect(sanitizePastedHtml(input)).toBe('<p>Hello</p>');
  });

  it('flattens <span> / <font> / <div> presentational wrappers', () => {
    const input =
      '<div><font face="Arial"><span style="color:red">Crew</span></font> raised <span>the beam</span>.</div>';
    expect(sanitizePastedHtml(input)).toBe('Crew raised the beam.');
  });

  it('removes MSO conditional comments and WordML-namespaced tags', () => {
    const input =
      '<!--[if gte mso 9]><xml><w:WordDocument/></xml><![endif]-->' +
      '<p><o:p>Intro</o:p> body <w:sdt>data</w:sdt></p>';
    expect(sanitizePastedHtml(input)).toBe('<p>Intro body data</p>');
  });

  it('drops <script>, <style>, <meta>, and <iframe> along with their contents', () => {
    const input =
      '<meta charset="utf-8">' +
      '<style>.x { color: red }</style>' +
      '<script>alert(1)</script>' +
      '<p>Copy</p>' +
      '<iframe src="https://evil.example">hi</iframe>';
    expect(sanitizePastedHtml(input)).toBe('<p>Copy</p>');
  });

  it('strips xml processing instructions and html comments', () => {
    const input = '<?xml version="1.0"?><!-- stray --><p>Body</p>';
    expect(sanitizePastedHtml(input)).toBe('<p>Body</p>');
  });

  it('converts <b>/<i> to <strong>/<em>', () => {
    const input = '<p><b>Bold</b> and <i>italic</i> words.</p>';
    expect(sanitizePastedHtml(input)).toBe(
      '<p><strong>Bold</strong> and <em>italic</em> words.</p>',
    );
  });

  it('keeps href on anchors but strips every other attribute', () => {
    const input =
      '<p>See <a href="https://example.com" target="_blank" style="color:blue" onclick="x()">link</a>.</p>';
    expect(sanitizePastedHtml(input)).toBe(
      '<p>See <a href="https://example.com">link</a>.</p>',
    );
  });

  it('preserves list and heading structure that the schema permits', () => {
    const input =
      '<h2 id="x" style="margin:0">Heading</h2>' +
      '<ul class="MsoListParagraph"><li style="m">One</li><li>Two</li></ul>';
    expect(sanitizePastedHtml(input)).toBe(
      '<h2>Heading</h2><ul><li>One</li><li>Two</li></ul>',
    );
  });

  it('is idempotent on already-clean schema-compliant HTML', () => {
    const clean =
      '<p>Opening with <strong>emphasis</strong> and an <a href="https://example.com">link</a>.</p>' +
      '<h3>Subheading</h3><ul><li>A</li><li>B</li></ul>';
    expect(sanitizePastedHtml(clean)).toBe(clean);
    expect(sanitizePastedHtml(sanitizePastedHtml(clean))).toBe(clean);
  });
});
