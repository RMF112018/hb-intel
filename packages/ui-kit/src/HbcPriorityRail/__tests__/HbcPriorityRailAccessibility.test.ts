import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * HbcPriorityRail accessibility structural guardrails.
 *
 * Locks the interaction invariants the flagship redesign depends on so
 * later refactors cannot silently strip reduced-motion handling, focus
 * treatment, or semantic role alignment.
 */

const ACTION_SOURCE = readFileSync(
  resolve(__dirname, '../HbcPriorityRailAction.tsx'),
  'utf8',
);
const OVERFLOW_SOURCE = readFileSync(
  resolve(__dirname, '../HbcPriorityRailOverflow.tsx'),
  'utf8',
);
const CSS_SOURCE = readFileSync(
  resolve(__dirname, '../priority-rail.module.css'),
  'utf8',
);

describe('HbcPriorityRail — reduced motion', () => {
  it('gates action hover motion on useReducedMotion', () => {
    expect(ACTION_SOURCE).toContain('useReducedMotion');
    expect(ACTION_SOURCE).toMatch(
      /whileHover=\{prefersReducedMotion\s*\?\s*undefined\s*:/,
    );
  });

  it('includes a prefers-reduced-motion media guard in the shared CSS', () => {
    expect(CSS_SOURCE).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });
});

describe('HbcPriorityRail — focus treatment', () => {
  it('defines focus-visible outline rules for interactive row and trigger', () => {
    expect(CSS_SOURCE).toMatch(/\.item:focus-visible/);
    expect(CSS_SOURCE).toMatch(/\.overflowTrigger:focus-visible/);
  });
});

describe('HbcPriorityRail — semantic role alignment', () => {
  it('overflow triggers are semantic button elements', () => {
    const buttonMatches = OVERFLOW_SOURCE.match(/<button\b[^>]*type="button"/g);
    expect(buttonMatches).not.toBeNull();
    expect(buttonMatches!.length).toBeGreaterThanOrEqual(3);
  });

  it('menu overflow declares menu-button semantics', () => {
    expect(OVERFLOW_SOURCE).toMatch(/aria-haspopup="menu"/);
    expect(OVERFLOW_SOURCE).toMatch(/useRole\(context,\s*\{\s*role:\s*'menu'\s*\}\)/);
  });

  it('sheet overflow declares dialog semantics with modal focus trap', () => {
    expect(OVERFLOW_SOURCE).toMatch(/aria-haspopup="dialog"/);
    expect(OVERFLOW_SOURCE).toMatch(/useRole\(context,\s*\{\s*role:\s*'dialog'\s*\}\)/);
    expect(OVERFLOW_SOURCE).toMatch(/<FloatingFocusManager[^>]*modal\b/);
  });

  it('inline disclosure is a region, not an ARIA menu', () => {
    expect(OVERFLOW_SOURCE).toMatch(/role="region"/);
  });
});

describe('HbcPriorityRail — target size credibility', () => {
  it('default flagship rows commit to a 44px+ minimum height', () => {
    expect(CSS_SOURCE).toMatch(/min-height:\s*44px/);
  });

  it('flagship featured row commits to a clearly larger primary target', () => {
    const featuredBlock = CSS_SOURCE.match(
      /\.contextHomepageFlagship\s+\.featuredTile\s+\.item\s*\{[^}]*\}/,
    );
    expect(featuredBlock).not.toBeNull();
    expect(featuredBlock![0]).toMatch(/min-height:\s*(?:5[2-9]|[6-9]\d|1\d{2})px/);
  });
});

describe('HbcPriorityRail — external link SR cue', () => {
  it('surfaces "(opens in new tab)" as visually-hidden link-owned text, not an icon aria-label', () => {
    expect(ACTION_SOURCE).toContain('(opens in new tab)');
    expect(ACTION_SOURCE).toMatch(/className=\{styles\.visuallyHidden\}/);
    expect(ACTION_SOURCE).not.toMatch(/ExternalLink[^>]*aria-label/);
  });
});

/**
 * Flagship anti-collapse locks — these tests fail if a future refactor
 * silently strips the flagship surface back to the old row/list grammar.
 * They target CSS and source markers that encode the flagship decisions
 * from phase-07 PROMPTs 01, 03, 04, 05, 06 and 08.
 */
describe('HbcPriorityRail — flagship anti-collapse structural locks', () => {
  it('declares an inline-size container for flagship degradation', () => {
    expect(CSS_SOURCE).toMatch(/container-type:\s*inline-size/);
    expect(CSS_SOURCE).toMatch(/container-name:\s*hbc-priority-rail/);
  });

  it('ships a narrowest-stable flagship container-query band (≤ 520px)', () => {
    expect(CSS_SOURCE).toMatch(
      /@container\s+hbc-priority-rail\s*\(max-width:\s*520px\)/,
    );
  });

  it('ships an ultra-narrow flagship container-query guard (≤ 360px)', () => {
    expect(CSS_SOURCE).toMatch(
      /@container\s+hbc-priority-rail\s*\(max-width:\s*360px\)/,
    );
  });

  it('ships a wide-anchored flagship container-query band (≥ 1180px)', () => {
    expect(CSS_SOURCE).toMatch(
      /@container\s+hbc-priority-rail\s*\(min-width:\s*1180px\)/,
    );
  });

  it('renders flagship primary actions as a width-filling command strip grid', () => {
    expect(CSS_SOURCE).toMatch(
      /\.contextHomepageFlagship\s+\.commandStrip\s*\{[^}]*display:\s*grid/,
    );
    expect(CSS_SOURCE).toMatch(
      /\.contextHomepageFlagship\s+\.commandStrip\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fit/,
    );
  });

  it('gives each flagship command tile a tall card silhouette with persistent launch chip', () => {
    expect(CSS_SOURCE).toMatch(
      /\.contextHomepageFlagship\s+\.commandTile\s+\.item\s*\{[^}]*display:\s*grid/,
    );
    expect(CSS_SOURCE).toMatch(
      /\.contextHomepageFlagship\s+\.commandTile\s+\.itemLaunch\s*\{/,
    );
  });

  it('keeps the featured band authoritative with a brand-gradient fill and white launch pill', () => {
    expect(CSS_SOURCE).toMatch(
      /\.contextHomepageFlagship\s+\.featuredTile\s+\.item\s*\{[^}]*linear-gradient/,
    );
    expect(CSS_SOURCE).toMatch(
      /\.contextHomepageFlagship\s+\.featuredTile\s+\.itemLaunch\s*\{[^}]*background:\s*#ffffff/,
    );
  });

  it('carries group identity as a tile eyebrow, not a stacked section header', () => {
    expect(CSS_SOURCE).toMatch(/\.contextHomepageFlagship\s+\.tileEyebrow\s*\{/);
    expect(CSS_SOURCE).toMatch(
      /\.contextHomepageFlagship\s+\.sectionHeader[^{]*\{[^}]*display:\s*none/,
    );
  });

  it('anchors the flagship overflow trigger as a right-edge discrete chip', () => {
    expect(CSS_SOURCE).toMatch(
      /\.contextHomepageFlagship\s+\.overflowRegion\s*\{[^}]*justify-content:\s*flex-end/,
    );
    expect(CSS_SOURCE).toMatch(
      /\.contextHomepageFlagship\s+\.overflowTrigger\s*\{[^}]*border-radius:\s*999px/,
    );
  });
});
