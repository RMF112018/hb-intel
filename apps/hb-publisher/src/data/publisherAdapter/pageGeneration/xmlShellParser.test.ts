import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';
import {
  PROJECT_SPOTLIGHT_V1_SHELL,
} from './xmlShellManifest';
import { parseProjectSpotlightShellXml } from './xmlShellParser';

const CANONICAL_XML_PATH = resolve(
  __dirname,
  '../../../../../../',
  'docs/architecture/plans/MASTER/spfx/publisher/architecture/Project-Spotlight-In-Progress.page-template.xml',
);

const CANONICAL_XML = readFileSync(CANONICAL_XML_PATH, 'utf8');

describe('parseProjectSpotlightShellXml', () => {
  it('parses the canonical XML into the same shape as the committed manifest', () => {
    const result = parseProjectSpotlightShellXml(CANONICAL_XML);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const m = result.manifest;

    expect(m.header.layoutType).toBe('FullWidthImage');
    expect(m.sections).toHaveLength(3);

    // Control IDs must match the committed manifest exactly.
    for (const slot of ['banner', 'subhead', 'body', 'team', 'gallery'] as const) {
      expect(m.controlsBySlot[slot].controlId).toBe(
        PROJECT_SPOTLIGHT_V1_SHELL.controlsBySlot[slot].controlId,
      );
      expect(m.controlsBySlot[slot].webPartType).toBe(
        PROJECT_SPOTLIGHT_V1_SHELL.controlsBySlot[slot].webPartType,
      );
    }

    // Section 1 must be FullWidthImage and hold exactly the banner.
    expect(m.sections[0]!.layout).toBe('OneColumnFullWidth');
    expect(m.sections[0]!.controls.map((c) => c.slot)).toEqual(['banner']);

    // Section 2 holds subhead, body, team in that order.
    expect(m.sections[1]!.layout).toBe('OneColumn');
    expect(m.sections[1]!.controls.map((c) => c.slot)).toEqual([
      'subhead',
      'body',
      'team',
    ]);

    // Section 3 holds the gallery.
    expect(m.sections[2]!.controls.map((c) => c.slot)).toEqual(['gallery']);
  });

  it('fails cleanly on malformed XML', () => {
    const result = parseProjectSpotlightShellXml('<not-xml>');
    expect(result.ok).toBe(false);
  });

  it('fails when the header LayoutType is not FullWidthImage', () => {
    const mutated = CANONICAL_XML.replace(
      'LayoutType="FullWidthImage"',
      'LayoutType="NoImage"',
    );
    const result = parseProjectSpotlightShellXml(mutated);
    expect(result.ok).toBe(false);
  });
});
