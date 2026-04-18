import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * HbcPriorityRail accessibility + structural guardrails.
 *
 * Locks the interaction invariants the flagship launcher grid depends
 * on (reduced-motion gating, focus treatment, semantic overflow roles,
 * external-link SR cue), plus the launcher-grid anti-regression locks
 * that defend against drifting back to the old command-band model.
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
  it('default rows commit to a 44px+ minimum height', () => {
    expect(CSS_SOURCE).toMatch(/min-height:\s*44px/);
  });

  it('flagship launcher tiles commit to a confident minimum target', () => {
    const tileBlock = CSS_SOURCE.match(
      /\.contextHomepageFlagship\s+\.launcherTileWrap\s+\.item\s*\{[^}]*\}/,
    );
    expect(tileBlock).not.toBeNull();
    expect(tileBlock![0]).toMatch(/min-height:\s*(?:6[4-9]|[7-9]\d|1\d{2})px/);
  });
});

describe('HbcPriorityRail — external link SR cue', () => {
  it('surfaces "(opens in new tab)" as visually-hidden link-owned text, not an icon aria-label', () => {
    expect(ACTION_SOURCE).toContain('(opens in new tab)');
    expect(ACTION_SOURCE).toMatch(/className=\{[^}]*visuallyHidden/);
    expect(ACTION_SOURCE).not.toMatch(/ArrowUpRight[^>]*aria-label/);
  });
});

/**
 * Launcher-grid anti-regression locks — these fail if a future refactor
 * silently drifts the flagship surface back to the old command-band
 * model (masthead, featured gradient, sequence chips, eyebrows,
 * persistent launch chip, tall command tiles).
 */
describe('HbcPriorityRail — flagship launcher-grid structural locks', () => {
  it('declares an inline-size container for flagship degradation', () => {
    expect(CSS_SOURCE).toMatch(/container-type:\s*inline-size/);
    expect(CSS_SOURCE).toMatch(/container-name:\s*hbc-priority-rail/);
  });

  it('ships explicit container-query bands for every display class per Homepage Overlay §7.1 (phone / tablet portrait / tablet landscape / desktop / ultrawide)', () => {
    expect(CSS_SOURCE).toMatch(/@container\s+hbc-priority-rail\s*\(max-width:\s*719px\)/);
    expect(CSS_SOURCE).toMatch(/@container\s+hbc-priority-rail\s*\(min-width:\s*720px\)\s*and\s*\(max-width:\s*979px\)/);
    expect(CSS_SOURCE).toMatch(/@container\s+hbc-priority-rail\s*\(min-width:\s*980px\)\s*and\s*\(max-width:\s*1179px\)/);
    expect(CSS_SOURCE).toMatch(/@container\s+hbc-priority-rail\s*\(min-width:\s*1180px\)/);
    expect(CSS_SOURCE).toMatch(/@container\s+hbc-priority-rail\s*\(min-width:\s*1600px\)/);
  });

  it('ships a short-height guard so vertically constrained viewports stay compact', () => {
    expect(CSS_SOURCE).toMatch(/@media\s*\(max-height:\s*640px\)/);
  });

  it('renders flagship primary actions as a responsive launcher-tile grid', () => {
    // Base launcherGrid rule is unscoped (flagship-only consumer); flat grid
    // with auto-fit density floor.
    expect(CSS_SOURCE).toMatch(/\.launcherGrid\s*\{[^}]*display:\s*grid/);
    expect(CSS_SOURCE).toMatch(/\.launcherGrid\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fit/);
  });

  it('renders each flagship tile as a compact single-click-target row (icon + title)', () => {
    const tileBlock = CSS_SOURCE.match(
      /\.contextHomepageFlagship\s+\.launcherTileWrap\s+\.item\s*\{[^}]*\}/,
    );
    expect(tileBlock).not.toBeNull();
    expect(tileBlock![0]).toMatch(/grid-template-columns:\s*40px\s+1fr/);
  });

  it('flagship surface has no legacy command-band chrome — not even hidden (the chrome is gone, not suppressed)', () => {
    // The launcher tear-down (phase-08) requires the legacy masthead /
    // featured-band / command-strip / command-tile / tile-index /
    // tile-eyebrow classes to be fully gone from the stylesheet — not
    // merely hidden with display:none. If any of these class names
    // reappear, the command-band model is drifting back into the CSS.
    expect(CSS_SOURCE).not.toMatch(/\.featuredBand\b/);
    expect(CSS_SOURCE).not.toMatch(/\.commandStrip\b/);
    expect(CSS_SOURCE).not.toMatch(/\.commandTile\b/);
    expect(CSS_SOURCE).not.toMatch(/\.tileIndex\b/);
    expect(CSS_SOURCE).not.toMatch(/\.tileEyebrow\b/);
    // The default-context .header rule may remain (used by admin preview
    // and non-homepage embeds) but the flagship context must not render or
    // style it.
    expect(CSS_SOURCE).not.toMatch(/\.contextHomepageFlagship\s+\.header\b/);
  });

  it('anchors the flagship overflow trigger as a right-edge chip', () => {
    expect(CSS_SOURCE).toMatch(
      /\.contextHomepageFlagship\s+\.overflowRegion\s*\{[^}]*justify-content:\s*flex-end/,
    );
  });
});
