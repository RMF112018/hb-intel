/**
 * Phase-16 — shared export drift guard.
 *
 * Proves the six primitives the Kudos system depends on stay exported
 * from `@hbc/ui-kit/homepage`. A rename or removal fails loudly here
 * instead of at E2E time.
 */
import { describe, expect, it } from 'vitest';
import * as homepage from '@hbc/ui-kit/homepage';

const REQUIRED: readonly string[] = [
  'HbcPeopleCultureSurface',
  'HbcKudosComposerFlyout',
  'HbcKudosComposerForm',
  'HbcKudosComposerPreview',
  'HbcPeoplePicker',
  'HbcAvatarStack',
];

describe('@hbc/ui-kit/homepage — Kudos primitive export contract', () => {
  it.each(REQUIRED)('exports %s', (name) => {
    expect(homepage, `missing export: ${name}`).toHaveProperty(name);
    expect((homepage as Record<string, unknown>)[name]).toBeDefined();
  });
});
