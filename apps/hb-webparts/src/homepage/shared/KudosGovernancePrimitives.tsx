/**
 * Shared governance UI primitives for HB Kudos surfaces.
 *
 * Provides tokenized visual grammar for the governance workspace so
 * consumers avoid duplicating hardcoded inline color/spacing values.
 *
 * These live in the webpart shared layer (not @hbc/ui-kit) because
 * they compose @hbc/ui-kit/homepage primitives and are specific to
 * the kudos governance domain. Promotion to ui-kit is appropriate
 * if/when other governance surfaces reuse them.
 *
 * All imports stay within the @hbc/ui-kit/homepage boundary.
 *
 * Token-bridge posture (Phase-27 Prompt-01 closure):
 *
 *   - `KUDOS_GOV_TOKENS` is a thin alias layer over the governed
 *     presentation-lane theme semantics exported by
 *     `@hbc/ui-kit/homepage`. Brand and surface-warm values route
 *     through `HBC_PRESENTATION_*` / `HBC_SURFACE_PRESENTATION` so
 *     the Kudos public and companion surfaces cannot drift from the
 *     shared source without touching the kit.
 *   - Opacity ramps compose shared RGB triplets through a small
 *     `alpha()` helper rather than repeating literal rgba strings.
 *   - Remaining local exceptions — editorial ink ramp, presentation-
 *     lane danger / warning accents — are explicitly marked below.
 *     They stay local only because `@hbc/ui-kit/homepage` does not
 *     yet expose a presentation-lane ink ramp or a presentation-lane
 *     danger / warning palette; promotion is a visible swap, not a
 *     rename.
 *   - `kudosCSSVars()` is the sole CSS-variable bridge and is applied
 *     ONCE per render-root (each webpart's outermost `<section>`).
 *     Every governance primitive below inherits those custom
 *     properties through the normal CSS cascade — we deliberately do
 *     NOT re-spread `kudosCSSVars()` inline on each primitive.
 */
import * as React from 'react';
import {
  HbcStatusBadge,
  HbcPeoplePicker,
  HBC_PRESENTATION_BLUE,
  HBC_PRESENTATION_BLUE_RGB,
  HBC_PRESENTATION_ORANGE,
  HBC_PRESENTATION_ORANGE_RGB,
  HBC_SURFACE_PRESENTATION,
  type PersonEntry,
} from '@hbc/ui-kit/homepage';
import { KudosTaskDialogShell, kudosShellStyles } from './kudosShells.js';
import { useSharePointPeopleSearch } from '../data/useSharePointPeopleSearch.js';
import {
  governanceActionButton,
  governanceTabButton,
  governanceToggleChip,
  governanceSectionHeading,
  governanceInfoRow,
  governanceInfoRowLabel,
  governanceToolbarLabel,
  governanceErrorAlert,
} from '../../webparts/hbKudos/kudosVariants.js';
import governanceStyles from './governance.module.css';





const alpha = (rgbTriplet: string, opacity: number): string =>
  `rgba(${rgbTriplet}, ${opacity})`;

const BLUE_RGB = HBC_PRESENTATION_BLUE_RGB;
const ORANGE_RGB = HBC_PRESENTATION_ORANGE_RGB;

// Presentation-lane danger / warning accents. Kept local because the
// shared theme semantics do not yet expose a presentation-lane danger
// ramp (the productive-lane `HBC_STATUS_COLORS.error` is the brighter
// `#FF4D4D`, which reads as app-shell status, not editorial danger).
const DANGER_RED = '#c4314b';
const DANGER_RGB = '196, 49, 75';
const WARNING_ORANGE = '#c26434';

// Ink base for body copy on light editorial surfaces — one value,
// many alphas, so text hierarchy collapses to a single semantic scale.
const INK_RGB = '26, 19, 16';
const INK_BASE = '#1a1310';
const INK_HEADING = '#0a1b33';

// RGB triplets for `alpha()` composition in the CSS-var bridge below.
// The ink-shadow ramp derives from `INK_HEADING` so depth cast on
// light editorial surfaces stays in lockstep with the heading ink.
const INK_HEADING_RGB = '10, 27, 51';
const WHITE_RGB = '255, 255, 255';

// Hero editorial deep-blue stack. Authored locally because the
// governed `HBC_SURFACE_PRESENTATION` / `HBC_PRESENTATION_BLUE`
// tokens do not yet expose a multi-stop premium hero gradient; all
// four stops are collected here so future promotion to shared
// theme semantics is a visible swap rather than a scattered rename.
const HERO_BLUE_0 = '#2b4f80';
const HERO_BLUE_1 = '#1f3a65';
const HERO_BLUE_2 = '#172c4c';
const HERO_BLUE_3 = '#1a3354';

// Give-CTA gradient deep-orange + hover stops. Presentation-lane
// variants of `HBC_PRESENTATION_ORANGE` without a governed equivalent.
const ORANGE_DEEP = '#d16a34';
const ORANGE_HOVER = '#ea8c56';
const ORANGE_DEEP_HOVER = '#d77139';
// Companion bulk-approve gradient terminal stop. Slightly cooler than
// `ORANGE_DEEP` so the moderation CTA reads as a distinct operational
// action, not a duplicate of the public Give-CTA. Previously a raw
// `#d4693a` hex in `companion.module.css`.
const ORANGE_CTA_DEEP = '#d4693a';

// Editorial warm highlight — peach text accent reading against the
// deep-blue hero. No shared equivalent yet.
const WARM_HIGHLIGHT = '#ffd7bf';
const WARM_HIGHLIGHT_RGB = '255, 215, 191';

// Hero peach scatter overlay (warm glow above the deep-blue stack).
const HERO_PEACH_RGB = '255, 196, 140';

// Featured glass / solid-fallback deep-nav tints. Local editorial
// variants of the deep-blue hero stack at lower luminance.
const GLASS_INK_RGB = '15, 30, 55';
const GLASS_INK_SOLID_0 = 'rgba(39, 72, 118, 0.92)';
const GLASS_INK_SOLID_1 = 'rgba(27, 50, 88, 0.94)';

// Warm-row surface blends — near-white + near-warm-tint gradient
// stops used by the public recent/archive rows. RGB triplets stay
// in this one seam so CSS never hardcodes them.
const WARM_ROW_WHITE_RGB = '255, 255, 255';
const WARM_ROW_TINT_RGB = '255, 250, 244';
const WARM_ROW_TINT_HOVER_RGB = '255, 241, 228';

export const KUDOS_GOV_TOKENS = {
  // Brand — derived from shared presentation-lane theme semantics
  brandBlue: HBC_PRESENTATION_BLUE,
  brandOrange: HBC_PRESENTATION_ORANGE,
  dangerRed: DANGER_RED,
  warningOrange: WARNING_ORANGE,

  // Text hierarchy — alphas over the editorial ink base
  textPrimary: INK_BASE,
  textHeading: INK_HEADING,
  textSecondary: alpha(INK_RGB, 0.72),
  textTertiary: alpha(INK_RGB, 0.62),
  textMuted: alpha(INK_RGB, 0.55),
  textFaint: alpha(INK_RGB, 0.48),
  textCaption: alpha(INK_RGB, 0.45),
  textDisabled: alpha(INK_RGB, 0.4),
  // Governance tab-button resting label — ink at 68% so the label reads
  // as tertiary in the queue scope row. Previously hardcoded as
  // `rgba(26, 19, 16, 0.68)` in `governance.module.css`.
  textTabResting: alpha(INK_RGB, 0.68),
  // Neutral disabled-surface wash — inert governance action fill that
  // must not borrow a tonal ramp. Previously `rgba(128, 128, 128, 0.08)`
  // in `governance.module.css`.
  neutralDisabled08: 'rgba(128, 128, 128, 0.08)',

  // Presentation-blue opacity ramp — derived from HBC_PRESENTATION_BLUE_RGB
  blueSubtle04: alpha(BLUE_RGB, 0.04),
  blueSubtle06: alpha(BLUE_RGB, 0.06),
  blueSubtle08: alpha(BLUE_RGB, 0.08),
  blueSubtle12: alpha(BLUE_RGB, 0.12),
  blueSubtle14: alpha(BLUE_RGB, 0.14),
  blueSubtle18: alpha(BLUE_RGB, 0.18),
  blueSubtle20: alpha(BLUE_RGB, 0.2),
  blueText82: alpha(BLUE_RGB, 0.82),

  // Presentation-orange opacity ramp — derived from HBC_PRESENTATION_ORANGE_RGB
  orangeSubtle02: alpha(ORANGE_RGB, 0.02),
  orangeSubtle03: alpha(ORANGE_RGB, 0.03),
  orangeSubtle06: alpha(ORANGE_RGB, 0.06),
  orangeSubtle10: alpha(ORANGE_RGB, 0.1),
  orangeSubtle18: alpha(ORANGE_RGB, 0.18),
  orangeSubtle22: alpha(ORANGE_RGB, 0.22),
  orangeSubtle25: alpha(ORANGE_RGB, 0.25),
  orangeSubtle28: alpha(ORANGE_RGB, 0.28),

  // Danger opacity ramp — presentation-lane local until shared semantics expose one
  dangerSubtle08: alpha(DANGER_RGB, 0.08),
  dangerSubtle22: alpha(DANGER_RGB, 0.22),
  dangerSubtle55: alpha(DANGER_RGB, 0.55),
  dangerItalic72: alpha(DANGER_RGB, 0.72),
} as const;

// ---------------------------------------------------------------------------
// Unified CSS-var bridge — the one seam between KUDOS_GOV_TOKENS and every
// Kudos CSS module in `apps/hb-webparts`.
// ---------------------------------------------------------------------------
//
// Applied ONCE at each webpart's outermost render-root (the `<section>`
// for `HbKudos` and `HbKudosCompanion`). CSS modules reference
// `var(--hbk-*)` directly and primitives inherit through the normal
// cascade — do not re-spread this helper on individual primitives or
// dialog bodies. The `@hbc/ui-kit` composer uses its own `--hbc-kudos-*`
// prefix inside the ui-kit package boundary; that stays separate by design.
// ---------------------------------------------------------------------------

export function kudosCSSVars(): React.CSSProperties {
  return {
    // Brand
    '--hbk-brand-blue': KUDOS_GOV_TOKENS.brandBlue,
    '--hbk-brand-orange': KUDOS_GOV_TOKENS.brandOrange,

    // Ink hierarchy
    '--hbk-text-primary': KUDOS_GOV_TOKENS.textPrimary,
    '--hbk-text-heading': KUDOS_GOV_TOKENS.textHeading,
    '--hbk-text-secondary': KUDOS_GOV_TOKENS.textSecondary,
    '--hbk-text-tertiary': KUDOS_GOV_TOKENS.textTertiary,
    '--hbk-text-muted': KUDOS_GOV_TOKENS.textMuted,
    '--hbk-text-faint': KUDOS_GOV_TOKENS.textFaint,
    '--hbk-text-caption': KUDOS_GOV_TOKENS.textCaption,
    '--hbk-text-disabled': KUDOS_GOV_TOKENS.textDisabled,

    // Blue ramp (governance surfaces)
    '--hbk-blue-04': KUDOS_GOV_TOKENS.blueSubtle04,
    '--hbk-blue-06': KUDOS_GOV_TOKENS.blueSubtle06,
    '--hbk-blue-08': KUDOS_GOV_TOKENS.blueSubtle08,
    '--hbk-blue-12': KUDOS_GOV_TOKENS.blueSubtle12,
    '--hbk-blue-14': KUDOS_GOV_TOKENS.blueSubtle14,
    '--hbk-blue-18': KUDOS_GOV_TOKENS.blueSubtle18,
    '--hbk-blue-20': KUDOS_GOV_TOKENS.blueSubtle20,
    '--hbk-blue-ink': KUDOS_GOV_TOKENS.blueText82,

    // Orange ramp (recognition surfaces)
    '--hbk-orange-02': KUDOS_GOV_TOKENS.orangeSubtle02,
    '--hbk-orange-03': KUDOS_GOV_TOKENS.orangeSubtle03,
    '--hbk-orange-06': KUDOS_GOV_TOKENS.orangeSubtle06,
    '--hbk-orange-08': KUDOS_GOV_TOKENS.orangeSubtle10,
    '--hbk-orange-10': KUDOS_GOV_TOKENS.orangeSubtle10,
    '--hbk-orange-18': KUDOS_GOV_TOKENS.orangeSubtle18,
    '--hbk-orange-22': KUDOS_GOV_TOKENS.orangeSubtle22,
    '--hbk-orange-25': KUDOS_GOV_TOKENS.orangeSubtle25,
    '--hbk-orange-28': KUDOS_GOV_TOKENS.orangeSubtle28,
    // Authored surface-lane helpers — kept here so CSS never hardcodes.
    '--hbk-orange-55': `rgba(${HBC_PRESENTATION_ORANGE_RGB}, 0.55)`,
    '--hbk-orange-shadow': `rgba(${HBC_PRESENTATION_ORANGE_RGB}, 0.08)`,
    '--hbk-surface-0': '#ffffff',
    // Editorial warm surface — derived from the governed shared warm-tint
    // so Kudos editorial backdrops cannot drift from the shared palette.
    '--hbk-surface-warm': HBC_SURFACE_PRESENTATION.warmTint,

    // Warning (surface-lane amber — no own ramp; exposed as a single
    // var so tone-driven CSS selectors can resolve --hbk-tone from
    // data-tone without inline style injection).
    '--hbk-warning-orange': KUDOS_GOV_TOKENS.warningOrange,

    // Danger
    '--hbk-danger': KUDOS_GOV_TOKENS.dangerRed,
    '--hbk-danger-08': KUDOS_GOV_TOKENS.dangerSubtle08,
    '--hbk-danger-22': KUDOS_GOV_TOKENS.dangerSubtle22,
    '--hbk-danger-55': KUDOS_GOV_TOKENS.dangerSubtle55,
    '--hbk-danger-ink-italic': KUDOS_GOV_TOKENS.dangerItalic72,

    // On-dark ramp — white-over-dark alphas used by the hero /
    // featured / give-CTA editorial surfaces. Exposed as a single
    // opacity scale so CSS never hardcodes `rgba(255, 255, 255, x)`.
    '--hbk-on-dark-06': alpha(WHITE_RGB, 0.06),
    '--hbk-on-dark-08': alpha(WHITE_RGB, 0.08),
    '--hbk-on-dark-10': alpha(WHITE_RGB, 0.1),
    '--hbk-on-dark-12': alpha(WHITE_RGB, 0.12),
    '--hbk-on-dark-14': alpha(WHITE_RGB, 0.14),
    '--hbk-on-dark-16': alpha(WHITE_RGB, 0.16),
    '--hbk-on-dark-18': alpha(WHITE_RGB, 0.18),
    '--hbk-on-dark-22': alpha(WHITE_RGB, 0.22),
    '--hbk-on-dark-24': alpha(WHITE_RGB, 0.24),
    '--hbk-on-dark-28': alpha(WHITE_RGB, 0.28),
    '--hbk-on-dark-30': alpha(WHITE_RGB, 0.3),
    '--hbk-on-dark-32': alpha(WHITE_RGB, 0.32),
    '--hbk-on-dark-42': alpha(WHITE_RGB, 0.42),
    '--hbk-on-dark-55': alpha(WHITE_RGB, 0.55),
    '--hbk-on-dark-78': alpha(WHITE_RGB, 0.78),
    '--hbk-on-dark-82': alpha(WHITE_RGB, 0.82),
    '--hbk-on-dark-90': alpha(WHITE_RGB, 0.9),

    // Ink-shadow ramp — derived from INK_HEADING_RGB (= #0a1b33).
    // Replaces every `rgba(0, 0, 0, x)` and `rgba(10, 27, 51, x)`
    // call site with one governable scale.
    '--hbk-ink-shadow-04': alpha(INK_HEADING_RGB, 0.04),
    '--hbk-ink-shadow-08': alpha(INK_HEADING_RGB, 0.08),
    '--hbk-ink-shadow-14': alpha(INK_HEADING_RGB, 0.14),
    '--hbk-ink-shadow-18': alpha(INK_HEADING_RGB, 0.18),
    '--hbk-ink-shadow-20': alpha(INK_HEADING_RGB, 0.2),
    '--hbk-ink-shadow-22': alpha(INK_HEADING_RGB, 0.22),
    '--hbk-ink-shadow-24': alpha(INK_HEADING_RGB, 0.24),

    // Orange ramp extensions — used by give-CTA + hero accents.
    '--hbk-orange-35': alpha(ORANGE_RGB, 0.35),
    '--hbk-orange-38': alpha(ORANGE_RGB, 0.38),
    '--hbk-orange-48': alpha(ORANGE_RGB, 0.48),
    '--hbk-orange-92': alpha(ORANGE_RGB, 0.92),
    '--hbk-orange-transparent': alpha(ORANGE_RGB, 0),

    // Hero editorial gradient — deep-blue stack authored locally.
    '--hbk-hero-blue-0': HERO_BLUE_0,
    '--hbk-hero-blue-1': HERO_BLUE_1,
    '--hbk-hero-blue-2': HERO_BLUE_2,
    '--hbk-hero-blue-3': HERO_BLUE_3,
    '--hbk-hero-peach-22': alpha(HERO_PEACH_RGB, 0.22),
    '--hbk-hero-peach-12': alpha(HERO_PEACH_RGB, 0.12),
    '--hbk-hero-peach-0': alpha(HERO_PEACH_RGB, 0),

    // Give-CTA gradient — presentation-lane orange stops.
    '--hbk-orange-deep': ORANGE_DEEP,
    '--hbk-orange-hover': ORANGE_HOVER,
    '--hbk-orange-deep-hover': ORANGE_DEEP_HOVER,

    // Featured glass-card fills + solid fallback for browsers without
    // backdrop-filter support.
    '--hbk-glass-ink-55': alpha(GLASS_INK_RGB, 0.55),
    '--hbk-glass-ink-48': alpha(GLASS_INK_RGB, 0.48),
    '--hbk-glass-solid-0': GLASS_INK_SOLID_0,
    '--hbk-glass-solid-1': GLASS_INK_SOLID_1,

    // Warm editorial highlight — peach accent readable on deep blue.
    '--hbk-warm-highlight': WARM_HIGHLIGHT,
    '--hbk-warm-highlight-55': alpha(WARM_HIGHLIGHT_RGB, 0.55),

    // Warm-row public-surface gradient stops (idle + hover).
    '--hbk-warm-row-white-72': alpha(WARM_ROW_WHITE_RGB, 0.72),
    '--hbk-warm-row-tint-72': alpha(WARM_ROW_TINT_RGB, 0.72),
    '--hbk-warm-row-white-62': alpha(WARM_ROW_WHITE_RGB, 0.62),
    '--hbk-warm-row-tint-62': alpha(WARM_ROW_TINT_RGB, 0.62),
    '--hbk-warm-row-white-55': alpha(WARM_ROW_WHITE_RGB, 0.55),
    '--hbk-warm-row-tint-95': alpha(WARM_ROW_TINT_RGB, 0.95),
    '--hbk-warm-row-tint-92': alpha(WARM_ROW_TINT_RGB, 0.92),
    '--hbk-warm-row-hover-95': alpha(WARM_ROW_TINT_HOVER_RGB, 0.95),
    '--hbk-warm-row-hover-92': alpha(WARM_ROW_TINT_HOVER_RGB, 0.92),

    // Orange cast-shadow for hover depth over warm rows (alpha over
    // HBC_PRESENTATION_ORANGE_RGB).
    '--hbk-orange-cast-10': alpha(ORANGE_RGB, 0.1),
    '--hbk-orange-cast-08': alpha(ORANGE_RGB, 0.08),

    // Companion bulk-approve gradient terminal stop.
    '--hbk-orange-cta-deep': ORANGE_CTA_DEEP,

    // Governance neutrals — ink at 68% for tab-button resting label and
    // a tone-neutral disabled wash for governance actions.
    '--hbk-text-tab-resting': KUDOS_GOV_TOKENS.textTabResting,
    '--hbk-neutral-disabled-08': KUDOS_GOV_TOKENS.neutralDisabled08,

    // ── Phase-28 Prompt-01 — doctrine / token closure ─────────────
    // Geometry, motion, elevation, and icon-size seams. Ordinary
    // webpart CSS must never hardcode raw radius / transition ms /
    // elevation offsets — every governed surface consumes these.

    // Radius scale
    '--hbk-radius-hairline': '2px',
    '--hbk-radius-chip': '3px',
    '--hbk-radius-xs': '6px',
    '--hbk-radius-sm': '8px',
    '--hbk-radius-md': '10px',
    '--hbk-radius-lg': '12px',
    '--hbk-radius-xl': '14px',
    '--hbk-radius-2xl': '18px',
    '--hbk-radius-pill': '999px',

    // Motion scale — durations + easings as composed transition-shorthand
    // fragments so call sites read as `transition: color var(--hbk-motion-fast)`.
    '--hbk-motion-fast': '120ms ease',
    '--hbk-motion-base': '140ms ease',
    '--hbk-motion-mid': '160ms ease',
    '--hbk-motion-slow': '240ms cubic-bezier(0.22, 1, 0.36, 1)',
    '--hbk-motion-snap': '140ms cubic-bezier(0.22, 1, 0.36, 1)',

    // Icon sizing — one scale so filter-chip / inline-glyph sizes never
    // land as raw `font-size: 12px` in ordinary CSS.
    '--hbk-icon-sm': '12px',

    // Elevation scale — composed box-shadow strings referencing the
    // ink-shadow and on-dark ramps above. Consumers use a single
    // `box-shadow: var(--hbk-elev-*)` instead of authoring multi-stop
    // shadow blocks inline.
    '--hbk-elev-hero':
      '0 1px 0 ' +
      alpha(WHITE_RGB, 0.06) +
      ' inset, 0 14px 36px ' +
      alpha(INK_HEADING_RGB, 0.22) +
      ', 0 2px 6px ' +
      alpha(INK_HEADING_RGB, 0.14),
    '--hbk-elev-featured':
      '0 1px 0 ' +
      alpha(WHITE_RGB, 0.18) +
      ' inset, 0 4px 14px ' +
      alpha(INK_HEADING_RGB, 0.18),
    '--hbk-elev-featured-badge':
      '0 1px 0 ' +
      alpha(WHITE_RGB, 0.24) +
      ' inset, 0 2px 6px ' +
      alpha(INK_HEADING_RGB, 0.18),
    '--hbk-elev-title-icon':
      '0 1px 0 ' +
      alpha(WHITE_RGB, 0.3) +
      ' inset, 0 6px 14px ' +
      alpha(ORANGE_RGB, 0.35),
    '--hbk-elev-cta':
      '0 1px 0 ' +
      alpha(WHITE_RGB, 0.3) +
      ' inset, 0 4px 10px ' +
      alpha(ORANGE_RGB, 0.38) +
      ', 0 1px 2px ' +
      alpha(INK_HEADING_RGB, 0.18),
    '--hbk-elev-cta-hover':
      '0 1px 0 ' +
      alpha(WHITE_RGB, 0.32) +
      ' inset, 0 6px 16px ' +
      alpha(ORANGE_RGB, 0.48) +
      ', 0 2px 4px ' +
      alpha(INK_HEADING_RGB, 0.22),
    '--hbk-elev-row':
      '0 1px 2px ' +
      alpha(INK_HEADING_RGB, 0.04) +
      ', 0 1px 0 ' +
      alpha(WHITE_RGB, 0.55) +
      ' inset',
    '--hbk-elev-row-hover':
      '0 4px 12px ' +
      alpha(ORANGE_RGB, 0.1) +
      ', 0 1px 0 ' +
      alpha(WHITE_RGB, 0.55) +
      ' inset',
    '--hbk-elev-row-compact':
      '0 1px 0 ' + alpha(WHITE_RGB, 0.55) + ' inset',
    '--hbk-elev-row-compact-hover':
      '0 3px 10px ' +
      alpha(ORANGE_RGB, 0.08) +
      ', 0 1px 0 ' +
      alpha(WHITE_RGB, 0.55) +
      ' inset',
    '--hbk-elev-celebrate-inset':
      '0 1px 0 ' + alpha(WHITE_RGB, 0.18) + ' inset',
    '--hbk-elev-feed-cta-hover': '0 3px 10px ' + alpha(ORANGE_RGB, 0.08),
    '--hbk-elev-feed-cta-rest':
      '0 1px 2px ' + alpha(INK_HEADING_RGB, 0.04),
    '--hbk-elev-zone': '0 4px 12px ' + alpha(INK_HEADING_RGB, 0.04),
  } as React.CSSProperties;
}

// ---------------------------------------------------------------------------
// SectionHeading — governance metadata section label
// ---------------------------------------------------------------------------

// Primitives below carry no inline style spread — `--hbk-*` custom
// properties flow in from the webpart-root `kudosCSSVars()` application
// and the tone color is composed by the `governance.module.css` selectors
// that read `data-tone` on the host element.

export function KudosSectionHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className={governanceSectionHeading()}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// InfoRow — label:value governance metadata row
// ---------------------------------------------------------------------------

export function KudosInfoRow({ label, value }: { label: string; value?: string }): React.JSX.Element | null {
  if (!value?.trim()) return null;
  return (
    <div className={governanceInfoRow()}>
      <span className={governanceInfoRowLabel()}>{label}:</span> {value}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActionButton — governance action button with tone
// ---------------------------------------------------------------------------

export type GovernanceActionTone = 'info' | 'warning' | 'danger';

/**
 * Tone resolution moved to CSS. The runtime only attaches
 * `data-tone={tone}` and the `governance.module.css` selectors
 * resolve `--hbk-tone` from the tokenized ramp. This keeps dynamic
 * visual values out of ordinary runtime source.
 */
export function KudosActionButton({
  label,
  onClick,
  disabled,
  tone,
  testId,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  tone: GovernanceActionTone;
  testId?: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-hbc-testid={testId}
      data-tone={tone}
      className={governanceActionButton()}
     
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// TabButton — governance queue filter button
//
// Semantics: these are filter buttons, not WAI-ARIA tabs. The content
// is filtered in-place (no distinct tabpanel per filter), so we use
// aria-pressed to convey the active state instead of fake tab semantics.
// ---------------------------------------------------------------------------

export function KudosGovernanceTabButton({
  label,
  active,
  onClick,
  testId,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  testId?: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      data-hbc-testid={testId}
      className={governanceTabButton({ active })}
     
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ToggleChip — governance filter toggle
// ---------------------------------------------------------------------------

export function KudosGovernanceToggleChip({
  label,
  active,
  onToggle,
  testId,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  testId?: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      data-hbc-testid={testId}
      className={governanceToggleChip({ active })}
     
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ToolbarLabel — inline uppercase field label
// ---------------------------------------------------------------------------

export function KudosGovernanceToolbarLabel({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <span className={governanceToolbarLabel()}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ErrorAlert — governance error message
// ---------------------------------------------------------------------------

export function KudosGovernanceErrorAlert({ message }: { message: string }): React.JSX.Element {
  return (
    <div role="alert" className={governanceErrorAlert()}>
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// InputDialog — governance action input dialog (replaces window.prompt)
// ---------------------------------------------------------------------------

export interface KudosGovernanceInputDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  /** Render a <select> instead of a text input. */
  choices?: readonly { value: string; label: string }[];
  /** When true, empty input is accepted (e.g. optional expiry). */
  allowEmpty?: boolean;
}

export function KudosGovernanceInputDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  placeholder,
  defaultValue,
  confirmLabel,
  choices,
  allowEmpty,
}: KudosGovernanceInputDialogProps): React.JSX.Element {
  const [draft, setDraft] = React.useState(defaultValue ?? (choices?.[0]?.value ?? ''));

  // Reset draft when dialog opens with a new default.
  React.useEffect(() => {
    if (open) {
      setDraft(defaultValue ?? (choices?.[0]?.value ?? ''));
    }
  }, [open, defaultValue, choices]);

  const handleConfirm = (): void => {
    if (!allowEmpty && !draft.trim()) return;
    onConfirm(draft);
    onClose();
  };

  return (
    <KudosTaskDialogShell
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      primaryAction={{ label: confirmLabel ?? 'Confirm', onClick: handleConfirm }}
      testId="hb-kudos-task-dialog-input"
    >
      {choices ? (
        <select
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={kudosShellStyles.taskDialogInput}
        >
          {choices.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
          placeholder={placeholder}
          autoFocus
          className={kudosShellStyles.taskDialogInput}
        />
      )}
    </KudosTaskDialogShell>
  );
}

// ---------------------------------------------------------------------------
// DateTimeDialog — task-specific scheduling / expiry picker
//
// Replaces raw ISO free-text entry for schedule / feature-expiry
// actions. Uses the native `datetime-local` input so operators pick
// a moment in their own timezone; serializes to an ISO UTC string
// on confirm so the typed governance patch contract is preserved.
// ---------------------------------------------------------------------------

export interface KudosGovernanceDateTimeDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called with a full ISO-UTC string (e.g. "2026-05-01T14:00:00.000Z"). */
  onConfirm: (isoUtc: string) => void;
  title: string;
  description?: string;
  fieldLabel?: string;
  hint?: string;
  /** Pre-fill the picker with an existing ISO value. */
  defaultIso?: string;
  confirmLabel?: string;
  /** When true, confirming with an empty picker clears the value. */
  allowEmpty?: boolean;
}

/**
 * Convert an ISO-UTC string to the `yyyy-MM-ddTHH:mm` shape the
 * `datetime-local` input expects, interpreted in the operator's
 * local timezone.
 */
function isoToLocalInputValue(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function KudosGovernanceDateTimeDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  fieldLabel,
  hint,
  defaultIso,
  confirmLabel,
  allowEmpty,
}: KudosGovernanceDateTimeDialogProps): React.JSX.Element {
  const [draft, setDraft] = React.useState(() => isoToLocalInputValue(defaultIso));

  React.useEffect(() => {
    if (open) setDraft(isoToLocalInputValue(defaultIso));
  }, [open, defaultIso]);

  const handleConfirm = (): void => {
    if (!draft.trim()) {
      if (allowEmpty) {
        onConfirm('');
        onClose();
      }
      return;
    }
    // `datetime-local` values have no timezone suffix — treat them
    // as wall time in the operator's locale and convert to ISO UTC.
    const local = new Date(draft);
    if (Number.isNaN(local.getTime())) return;
    onConfirm(local.toISOString());
    onClose();
  };

  return (
    <KudosTaskDialogShell
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      primaryAction={{ label: confirmLabel ?? 'Confirm', onClick: handleConfirm }}
      testId="hb-kudos-task-dialog-datetime"
    >
      <label className={kudosShellStyles.taskDialogFieldLabel}>
        {fieldLabel ?? 'Date and time'}
      </label>
      <input
        type="datetime-local"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
        autoFocus
        className={kudosShellStyles.taskDialogInput}
      />
      {hint ? <p className={kudosShellStyles.taskDialogHint}>{hint}</p> : null}
    </KudosTaskDialogShell>
  );
}

// ---------------------------------------------------------------------------
// AssignmentDialog — governed people picker for reassignment.
//
// Phase-28 Prompt-05 UX upgrade: the previous raw email textbox +
// "Resolve user" button is replaced with `HbcPeoplePicker` (the same
// governed picker the public Kudos composer uses) backed by the
// tenant-wide `useSharePointPeopleSearch` adapter. The operator
// searches by name or email, sees display name + email + job title
// + department + avatar fallback, and picks a single person. The
// dialog then ensures that selection against the list-host site so
// the existing `{ userId: number; email: string; displayName? }`
// resolution contract (and the typed `reassign` patch downstream)
// stays intact.
//
// Failure, zero-match, and multi-match paths are handled by the
// picker; the ensure-user step surfaces any resolution error inline
// before the confirm action becomes clickable.
// ---------------------------------------------------------------------------

export interface KudosGovernanceAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called with the resolved SharePoint user id + display context. */
  onConfirm: (resolved: { userId: number; email: string; displayName?: string }) => void;
  title: string;
  description?: string;
  /** Canonical list-host URL used for the REST lookup. */
  listHostUrl: string;
  confirmLabel?: string;
}

interface ResolvedAssignee {
  userId: number;
  email: string;
  displayName?: string;
}

/**
 * Map a picker `PersonEntry` to a SharePoint list-host numeric user
 * id by calling `/_api/web/siteusers/getByEmail(...)`. The people
 * search returns tenant directory entries; the governance writer
 * requires a list-host-scoped numeric id. This is the same single
 * REST call the previous implementation used — only the UX upstream
 * of it has changed.
 */
async function ensureSiteUserFromPerson(
  listHostUrl: string,
  person: PersonEntry,
): Promise<ResolvedAssignee> {
  const email = person.mail ?? person.upn;
  if (!email) {
    throw new Error('Selected person has no mail or UPN — cannot resolve SharePoint id.');
  }
  const res = await fetch(
    `${listHostUrl}/_api/web/siteusers/getByEmail('${encodeURIComponent(email)}')`,
    { headers: { Accept: 'application/json;odata=nometadata' } },
  );
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? 'No SharePoint user matches this person on the list-host site.'
        : `Lookup failed: HTTP ${res.status}`,
    );
  }
  const body = (await res.json()) as { Id?: number; Title?: string; Email?: string };
  if (typeof body.Id !== 'number' || body.Id <= 0) {
    throw new Error('Resolved user did not carry a valid SharePoint id.');
  }
  return {
    userId: body.Id,
    email: body.Email ?? email,
    displayName: body.Title ?? person.displayName,
  };
}

export function KudosGovernanceAssignmentDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  listHostUrl,
  confirmLabel,
}: KudosGovernanceAssignmentDialogProps): React.JSX.Element {
  const searchPeople = useSharePointPeopleSearch();
  const [selected, setSelected] = React.useState<PersonEntry[]>([]);
  const [resolved, setResolved] = React.useState<ResolvedAssignee | undefined>();
  const [resolving, setResolving] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (open) {
      setSelected([]);
      setResolved(undefined);
      setResolving(false);
      setErrorText(undefined);
    }
  }, [open]);

  // Whenever the operator picks a single person, ensure them against
  // the list-host site. If the picker clears, reset resolved state.
  React.useEffect(() => {
    if (!open) return;
    const person = selected[0];
    if (!person) {
      setResolved(undefined);
      setErrorText(undefined);
      return;
    }
    let cancelled = false;
    setResolving(true);
    setErrorText(undefined);
    setResolved(undefined);
    ensureSiteUserFromPerson(listHostUrl, person)
      .then((assignee) => {
        if (!cancelled) setResolved(assignee);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setErrorText(err instanceof Error ? err.message : 'Lookup failed.');
        }
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, selected, listHostUrl]);

  const handleConfirm = (): void => {
    if (!resolved) return;
    onConfirm(resolved);
    onClose();
  };

  return (
    <KudosTaskDialogShell
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      primaryAction={{
        label: confirmLabel ?? 'Reassign',
        onClick: handleConfirm,
        disabled: !resolved || resolving,
        loading: resolving,
      }}
      testId="hb-kudos-task-dialog-assignment"
    >
      <div data-hbc-testid="hb-kudos-assignment-dialog-picker">
        <HbcPeoplePicker
          label="Assignee"
          mode="single"
          value={selected}
          onChange={(people) => {
            setSelected(people);
          }}
          searchPeople={searchPeople}
          placeholder="Start typing a name or email…"
        />
      </div>
      {resolving ? (
        <p
          className={kudosShellStyles.taskDialogHint}
          data-hbc-testid="hb-kudos-assignment-dialog-resolving"
        >
          Resolving SharePoint identity…
        </p>
      ) : null}
      {errorText ? (
        <p
          className={kudosShellStyles.taskDialogErrorText}
          data-hbc-testid="hb-kudos-assignment-dialog-error"
        >
          {errorText}
        </p>
      ) : null}
      {resolved ? (
        <div
          className={kudosShellStyles.taskDialogResolved}
          data-hbc-testid="hb-kudos-assignment-dialog-resolved"
        >
          Will reassign to{' '}
          <span className={kudosShellStyles.taskDialogResolvedEmphasis}>
            {resolved.displayName ?? resolved.email}
          </span>
          {resolved.displayName ? ` (${resolved.email})` : ''} · SharePoint id{' '}
          <span className={kudosShellStyles.taskDialogResolvedEmphasis}>{resolved.userId}</span>
        </div>
      ) : null}
    </KudosTaskDialogShell>
  );
}

// ---------------------------------------------------------------------------
// AuditTimelineBlock — shared audit timeline rendering
// ---------------------------------------------------------------------------

export interface AuditTimelineEvent {
  id: number;
  eventType: string;
  actorDisplayName?: string;
  eventAt: string;
  publicNote?: string;
  internalNote?: string;
}

export function KudosAuditTimelineBlock({
  events,
  showInternalNotes,
  loading,
  fallbackText,
  mapLabel,
  mapTone,
}: {
  events: readonly AuditTimelineEvent[];
  showInternalNotes: boolean;
  loading?: boolean;
  fallbackText?: string;
  mapLabel: (eventType: string) => string;
  mapTone: (eventType: string) => string;
}): React.JSX.Element {
  function chipVariant(tone: string): 'success' | 'warning' | 'critical' | 'info' {
    if (tone === 'success') return 'success';
    if (tone === 'warning') return 'warning';
    if (tone === 'danger') return 'critical';
    return 'info';
  }

  if (loading) {
    return (
      <div className={governanceStyles.timelineStatus}>
        Loading timeline…
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={governanceStyles.timelineStatus}>
        {fallbackText ?? 'No timeline events.'}
      </div>
    );
  }

  return (
    <div className={governanceStyles.timelineList}>
      {events.map((evt) => (
        <div key={evt.id} className={governanceStyles.timelineEvent}>
          <HbcStatusBadge
            variant={chipVariant(mapTone(evt.eventType))}
            size="small"
            label={mapLabel(evt.eventType)}
          />
          <div className={governanceStyles.timelineEventBody}>
            <div className={governanceStyles.timelineEventActor}>
              {evt.actorDisplayName ?? 'System'} · {new Date(evt.eventAt).toLocaleString()}
            </div>
            {evt.publicNote ? (
              <div className={governanceStyles.timelineEventPublic}>{evt.publicNote}</div>
            ) : null}
            {showInternalNotes && evt.internalNote ? (
              <div className={governanceStyles.timelineEventInternal}>
                Internal: {evt.internalNote}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
