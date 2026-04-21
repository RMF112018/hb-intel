/**
 * HbSignatureHeroHomepage — Canonical flagship homepage hero adapter.
 *
 * W01r-P15 — Signature masthead refinement pass.
 *
 * This is the canonical homepage hero for HB Central. All flagship
 * homepage compositions must use this component via the
 * `HbSignatureHero` orchestrator, which hard-locks this branch when the
 * host site is HBCentral.
 *
 * Composition model:
 *   Two-zone flex row — text-left / logo-right.
 *   The hero occupies the full available width of a SharePoint
 *   full-width section. Text content (greeting + tagline) anchors
 *   on the left as the primary focal point. The full-color company
 *   logo sits on the right, creating a premium branded masthead.
 *
 * Locked content (minimal-content doctrine):
 *   1. Personalized greeting — warm entry line, refined (left)
 *   2. Tagline: "Build with GRIT." — primary typographic statement (left)
 *   3. Company logo — full-color, balanced (right)
 *
 * Background system (four-layer stack):
 *   - Photo — default banner_home_7.png (center-cropped) or authored override
 *   - Scrim — composite warm/cool readability overlay biased to the text zone
 *   - Grain — soft-light material texture for physical surface quality
 *   - Brighten — authored right-side luminance for logo legibility
 *   When no image is provided, the surface falls back to a brand-tinted
 *   gradient (presentation-lane blue/orange pools over deep charcoal) so
 *   the masthead never collapses into a flat field.
 *
 * Token discipline:
 *   Raw color values in the CSS module are anchored to presentation-lane
 *   brand tokens via CSS custom properties exposed on the root section,
 *   sourced from @hbc/ui-kit/homepage.
 *
 * Entry-stack governance alignment (Prompt-04):
 *   Hero height, hero→actions spacing, and short-height constrained
 *   behavior are governed by the shell-owned entry-stack policy at
 *   `src/webparts/hbHomepage/shell/entryStackPolicy.ts` (mirrored by
 *   `src/homepage/entryStack/entryStackContract.ts`). This component does
 *   not maintain an independent breakpoint vocabulary; its rendered
 *   height budgets must stay within `heroHeightBudgetPx` for the active
 *   shell entry state. On the flagship page this surface is wrapper-
 *   embedded; standalone webpart dispatch remains valid for non-flagship
 *   reuse and transition diagnostics.
 *
 * Accessibility:
 *   - WCAG 2.1 AA contrast verified against the darkest fallback base
 *   - Fluid typography uses rem + clamp() for zoom resilience
 *   - prefers-reduced-motion disables all animation
 *   - All decorative layers are aria-hidden
 *   - No interactive elements
 */
import * as React from 'react';
import {
  motion,
  HBC_PRESENTATION_BLUE_RGB,
  HBC_PRESENTATION_ORANGE_RGB,
} from '@hbc/ui-kit/homepage';
import { hedrickLogo } from '@hbc/ui-kit/branding';
import { resolveWelcomeMessage } from '../../homepage/helpers/welcomeMessage.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import { resolveEntryStackPolicy } from '../hbHomepage/shell/entryStackPolicy.js';
import {
  SHELL_WIDTH_ACCOUNTING_RULE,
  SHELL_WIDTH_SOURCE,
  type HeroEntryStackState,
} from '../hbHomepage/shell/useShellContainer.js';
import { resolveHomepageHeroBannerSelection } from './homepageHeroBannerSourceSelector.js';
import styles from './signature-hero.module.css';

export interface HbSignatureHeroHomepageProps {
  identity: HomepageIdentityInput;
  /** Optional authored background image URL (wide, low-clutter photography preferred). */
  backgroundImage?: string;
  /** CDN base URL for static assets (injected by SPFx shell at runtime). */
  assetBaseUrl?: string;
  /** Optional wrapper-owned shared entry-stack authority for flagship mode. */
  entryStackState?: HeroEntryStackState;
  /** Runtime path marker for flagship composition diagnostics. */
  flagshipRenderPath?: 'wrapper-embedded' | 'standalone-webpart';
  now?: Date;
}

type Cubic = [number, number, number, number];
const EASE: Cubic = [0.22, 1, 0.36, 1];
type HomepageHeroLayoutMode =
  | 'premium-wide'
  | 'compressed-laptop'
  | 'guided-single-column'
  | 'compact-short-height'
  | 'standalone-fallback';

function resolveHomepageHeroLayoutMode(
  entryStackState: HeroEntryStackState | undefined,
): HomepageHeroLayoutMode {
  if (!entryStackState) return 'standalone-fallback';
  const policy = resolveEntryStackPolicy(entryStackState.entryState);
  if (
    entryStackState.shortHeightConstrained ||
    policy.shortHeightPosture === 'compact-banner' ||
    entryStackState.entryState.id === 'phone-landscape'
  ) {
    return 'compact-short-height';
  }

  switch (entryStackState.entryState.id) {
    case 'ultrawide-desktop':
      return 'premium-wide';
    case 'standard-laptop':
      return 'compressed-laptop';
    case 'tablet-landscape':
    case 'tablet-portrait-large':
    case 'tablet-portrait':
    case 'phone-portrait':
      return 'guided-single-column';
    default:
      return 'guided-single-column';
  }
}

/**
 * Reveal choreography — each slot fades up from below with a soft ease.
 * The greeting, tagline, and logo enter as a staggered sequence so the
 * eye settles naturally down the hierarchy. Pacing is refined, not louder:
 * the tagline carries a slightly longer arrival (0.72s) and the logo
 * waits for the tagline's deceleration to finish before settling in.
 */
const revealGreeting = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0, ease: EASE },
  },
};

const revealTagline = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, delay: 0.1, ease: EASE },
  },
};

const revealLogo = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.26, ease: EASE },
  },
};

export function HbSignatureHeroHomepage({
  identity,
  backgroundImage,
  assetBaseUrl,
  entryStackState,
  flagshipRenderPath,
  now = new Date(),
}: HbSignatureHeroHomepageProps): React.JSX.Element {
  const message = resolveWelcomeMessage(identity, now);
  const bannerSelection = resolveHomepageHeroBannerSelection({
    now,
    assetBaseUrl,
    authoredOverrideUrl: backgroundImage,
  });
  const heroBackground = bannerSelection.url;
  const hasImage = Boolean(heroBackground);

  // Structured runtime diagnostic: emits the same facts surfaced as
  // `data-hbc-hero-*` attributes so hosted operators can confirm winning
  // source selection without DOM inspection. Re-fires only when the
  // selection identity changes (mount, daypart rollover, or override
  // toggle) to avoid log spam from unrelated re-renders.
  React.useEffect(() => {
    console.debug('[hb-signature-hero] background source', {
      source: bannerSelection.source,
      daypart: bannerSelection.daypart,
      fileName: bannerSelection.fileName,
      url: bannerSelection.url,
      overrideActive: bannerSelection.overrideActive,
      flagshipRenderPath,
    });
  }, [
    bannerSelection.source,
    bannerSelection.daypart,
    bannerSelection.fileName,
    bannerSelection.url,
    bannerSelection.overrideActive,
    flagshipRenderPath,
  ]);
  const entryStackPolicy = React.useMemo(
    () => (entryStackState ? resolveEntryStackPolicy(entryStackState.entryState) : undefined),
    [entryStackState],
  );
  const layoutMode = React.useMemo(
    () => resolveHomepageHeroLayoutMode(entryStackState),
    [entryStackState],
  );

  // Per-image governance — focal point + safe-zone intensities resolved
  // from the winning banner source. Drives `background-position` on the
  // photo layer and density of the localized text-safe / logo-safe
  // contrast zones in the CSS module so the global scrim can stay
  // subtle while contrast still locks in where text and logo live.
  const governance = bannerSelection.governance;
  const tabletFocal = governance.tabletFocal ?? governance.focal;
  const phoneFocal = governance.phoneFocal ?? tabletFocal;

  // Presentation-lane brand tokens exposed as CSS custom properties so the
  // CSS module's scrim warmth and fallback gradient stay anchored to the
  // foundation without hand-editing literal hex/rgb values. Per-image
  // governance vars ride the same surface so every layer (photo focal,
  // text-safe darken, logo-safe brighten, breakpoint focal overrides)
  // resolves from one declarative source.
  const surfaceStyle = {
    '--hbc-hero-presentation-blue-rgb': HBC_PRESENTATION_BLUE_RGB,
    '--hbc-hero-presentation-orange-rgb': HBC_PRESENTATION_ORANGE_RGB,
    '--hbc-hero-focal-x': `${governance.focal.x}%`,
    '--hbc-hero-focal-y': `${governance.focal.y}%`,
    '--hbc-hero-focal-x-tablet': `${tabletFocal.x}%`,
    '--hbc-hero-focal-y-tablet': `${tabletFocal.y}%`,
    '--hbc-hero-focal-x-phone': `${phoneFocal.x}%`,
    '--hbc-hero-focal-y-phone': `${phoneFocal.y}%`,
    '--hbc-hero-text-safe-intensity': governance.textSafeIntensity,
    '--hbc-hero-logo-safe-intensity': governance.logoSafeIntensity,
    ...(entryStackPolicy
      ? {
          minHeight: `${entryStackPolicy.heroHeightBudgetPx.min}px`,
          maxHeight: `${entryStackPolicy.heroHeightBudgetPx.max}px`,
        }
      : {}),
  } as React.CSSProperties;

  const surfaceClassName = hasImage
    ? styles.surface
    : `${styles.surface} ${styles.noImage}`;

  return (
    <section
      aria-label="HB Central homepage hero"
      className={surfaceClassName}
      style={surfaceStyle}
      data-hbc-premium="signature-hero"
      data-hbc-hero-blackbox-contract="prompt07-blackbox-v1"
      data-hbc-hero-flagship-render-path={flagshipRenderPath}
      data-hbc-hero-background-source={bannerSelection.source}
      data-hbc-hero-daypart={bannerSelection.daypart}
      data-hbc-hero-banner-file={bannerSelection.fileName}
      data-hbc-hero-banner-override-active={bannerSelection.overrideActive ? 'true' : 'false'}
      data-hbc-hero-entry-authority={entryStackState ? 'shared-entry-state' : 'standalone-hero'}
      data-hbc-hero-entry-state={entryStackState?.entryState.id}
      data-hbc-hero-entry-reason={entryStackState?.entryStateReason}
      data-hbc-hero-layout-mode={layoutMode}
      data-hbc-hero-layout-source={
        entryStackState ? 'shared-entry-state-policy' : 'standalone-fallback'
      }
      data-hbc-hero-short-height={
        entryStackState
          ? (entryStackState.shortHeightConstrained ? 'true' : 'false')
          : undefined
      }
      data-hbc-hero-width={entryStackState ? Math.round(entryStackState.width) : undefined}
      data-hbc-hero-width-authoritative={
        entryStackState ? Math.round(entryStackState.authoritativeWidth) : undefined
      }
      data-hbc-hero-width-inline-inset-total={
        entryStackState ? Math.round(entryStackState.shellInlineInsetTotal) : undefined
      }
      data-hbc-hero-width-source={entryStackState ? SHELL_WIDTH_SOURCE : undefined}
      data-hbc-hero-width-accounting={entryStackState ? SHELL_WIDTH_ACCOUNTING_RULE : undefined}
      data-hbc-hero-height-budget-min={entryStackPolicy?.heroHeightBudgetPx.min}
      data-hbc-hero-height-budget-max={entryStackPolicy?.heroHeightBudgetPx.max}
      data-hbc-hero-short-height-posture={entryStackPolicy?.shortHeightPosture}
    >
      {/* ── Background ── */}
      {hasImage ? (
        <div
          className={styles.photo}
          style={{ backgroundImage: `url(${heroBackground})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.textSafe} aria-hidden="true" />
      <div className={styles.logoSafe} aria-hidden="true" />

      {/* ── Content — text-left / logo-right ── */}
      <div className={styles.content}>
        {/* Left zone: greeting + tagline */}
        <div className={styles.textZone}>
          <motion.div
            className={styles.greeting}
            variants={revealGreeting}
            initial="hidden"
            animate="show"
          >
            <span className={styles.greetingLine}>
              {message.greeting},
            </span>
            <span className={styles.greetingName}>
              {message.firstName}.
            </span>
          </motion.div>

          <motion.h1
            className={styles.tagline}
            variants={revealTagline}
            initial="hidden"
            animate="show"
          >
            Build with GRIT.
          </motion.h1>
        </div>

        {/* Right zone: HB Central brand lockup (Hedrick Brothers mark +
            "HB Central" wordmark) per Homepage Overlay §6.7. The wordmark
            is rendered as visible typography beside the mark and marked
            aria-hidden because the section already exposes "HB Central
            homepage hero" via aria-label and the img carries the
            "Hedrick Brothers" alt — no duplicate announcement. */}
        <motion.div
          className={styles.logoZone}
          variants={revealLogo}
          initial="hidden"
          animate="show"
        >
          <img
            src={hedrickLogo}
            alt="Hedrick Brothers"
            className={styles.logo}
          />
          <span className={styles.lockupWordmark} aria-hidden="true">
            HB Central
          </span>
        </motion.div>
      </div>
    </section>
  );
}
