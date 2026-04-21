/**
 * HbcProjectSpotlightSurface — flagship project / portfolio spotlight
 * surface family. Public composition + re-exports only.
 *
 * Responsibilities are split across focused seams in this folder:
 *   - `types.ts`              — view-model contract
 *   - `layout-mode.ts`        — explicit mode type + visibility matrix + pure resolver
 *   - `use-spotlight-layout-mode.ts` — container-measurement hook
 *   - `internals.ts`          — shared constants and pure helpers
 *   - `Masthead.tsx`          — editorial nameplate
 *   - `FeaturedMedia.tsx`     — mode-aware hero media + overlay chips
 *   - `Milestones.tsx`        — compact pill + full list
 *   - `TeamStrip.tsx`         — avatar stack + team detail panel
 *   - `FeaturedSlot.tsx`      — essentials + details disclosure
 *   - `SupportingRail.tsx`    — numbered past-spotlights rail
 *   - `HistoryDisclosure.tsx` — governed "past spotlights" reveal
 *
 * This file wires them into a single section, resolves the active
 * layout mode from the rendered container, and writes `data-layout-mode`
 * on the root so CSS can polish the resolved posture.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import {
  hbcPresentationCSSVars,
  HBC_PRESENTATION_BLUE,
  HBC_PRESENTATION_BLUE_RGB,
  HBC_PRESENTATION_ORANGE_RGB,
} from '../theme/tokens.js';
import styles from './project-spotlight-surface.module.css';
import type { ProjectSpotlightSurfaceModel } from './types.js';
import {
  getSpotlightLayoutVisibility,
  type SpotlightLayoutMode,
} from './layout-mode.js';
import { useSpotlightLayoutMode } from './use-spotlight-layout-mode.js';
import { Masthead } from './Masthead.js';
import { FeaturedSlot } from './FeaturedSlot.js';
import { HistoryDisclosure } from './HistoryDisclosure.js';

// ── Public API re-exports ────────────────────────────────────────────

export type {
  ProjectSpotlightStatusVariant,
  ProjectSpotlightStatus,
  ProjectSpotlightMedia,
  ProjectSpotlightCta,
  ProjectSpotlightMilestone,
  ProjectSpotlightTeamMember,
  ProjectSpotlightFeaturedItem,
  ProjectSpotlightRailItem,
  ProjectSpotlightSurfaceModel,
  ProjectSpotlightCompleteness,
} from './types.js';

export {
  resolveSpotlightLayoutMode,
  getSpotlightLayoutVisibility,
  SPOTLIGHT_LAYOUT_VISIBILITY,
  SPOTLIGHT_LAYOUT_WIDTH_THRESHOLDS,
  SPOTLIGHT_LAYOUT_HEIGHT_PRESSURE_PX,
} from './layout-mode.js';
export type {
  SpotlightLayoutMode,
  SpotlightLayoutVisibility,
  ResolveSpotlightLayoutInput,
} from './layout-mode.js';
export { useSpotlightLayoutMode } from './use-spotlight-layout-mode.js';

// ── Props ─────────────────────────────────────────────────────────────

export interface HbcProjectSpotlightSurfaceProps {
  model: ProjectSpotlightSurfaceModel;
  className?: string;
  'aria-label'?: string;
  /**
   * Optional layout-mode override. When provided, the surface skips
   * container measurement and renders in the requested mode verbatim.
   * Use for stories, snapshot tests, or host environments that need
   * deterministic posture. Omit for production (self-measuring).
   */
  forceMode?: SpotlightLayoutMode;
}

// ── Public component ─────────────────────────────────────────────────

export function HbcProjectSpotlightSurface({
  model,
  className,
  'aria-label': ariaLabel,
  forceMode,
}: HbcProjectSpotlightSurfaceProps): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const railLabel = model.railLabel ?? 'More projects';
  const sectionEyebrow = model.sectionEyebrow ?? 'Portfolio';

  const { mode, ref } = useSpotlightLayoutMode({ forceMode });
  const visibility = getSpotlightLayoutVisibility(mode);

  const hasHistory = visibility.showRail && model.secondary.length > 0;
  const hasFeaturedImage = Boolean(model.featured.image?.src);

  // Section-level CTA fallback — handed to the featured slot so a
  // missing authored item CTA still produces a credible next step.
  // Resolution: authored `featured.cta` wins; otherwise the section
  // destination (typically `allProjectsUrl`) is rendered in the same
  // CTA slot. Suppressed cleanly when neither exists.
  const fallbackCta = model.allProjectsUrl
    ? {
        label: model.allProjectsLabel ?? 'View all projects',
        href: model.allProjectsUrl,
      }
    : undefined;

  // Bind governed presentation-lane tokens to CSS custom properties so
  // the Spotlight stylesheet references one authoritative source for
  // brand color instead of hardcoding `#225391` / `rgba(34, 83, 145, …)`
  // across ~80 sites. The stylesheet still carries literal fallbacks
  // on `.root` so Storybook/tests render correctly without injection.
  const surfaceStyle = React.useMemo<React.CSSProperties>(
    () =>
      ({
        ...hbcPresentationCSSVars(),
        '--hbc-presentation-blue': HBC_PRESENTATION_BLUE,
        '--hbc-presentation-blue-rgb': HBC_PRESENTATION_BLUE_RGB,
        '--hbc-presentation-orange-rgb': HBC_PRESENTATION_ORANGE_RGB,
      }) as React.CSSProperties,
    [],
  );

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      aria-label={ariaLabel ?? model.heading}
      className={clsx(styles.root, className)}
      style={surfaceStyle}
      data-hbc-presentation="project-spotlight-surface"
      data-hbc-homepage="project-spotlight"
      data-layout-mode={mode}
      data-featured-has-image={hasFeaturedImage ? 'true' : 'false'}
    >
      <Masthead
        heading={model.heading}
        eyebrow={sectionEyebrow}
        latestFreshnessLabel={model.featured.freshnessLabel}
        allProjectsLabel={model.allProjectsLabel}
        allProjectsUrl={model.allProjectsUrl}
        showDate={visibility.showMastheadDate}
        showAction={visibility.showMastheadAction}
      />

      <hr className={styles.separator} />

      <div className={styles.composition}>
        <div className={styles.featuredWrap}>
          <FeaturedSlot
            featured={model.featured}
            reducedMotion={reducedMotion}
            visibility={visibility}
            fallbackCta={fallbackCta}
          />
        </div>
        {hasHistory ? (
          <HistoryDisclosure
            items={model.secondary}
            label={railLabel}
            allProjectsLabel={model.allProjectsLabel}
            allProjectsUrl={model.allProjectsUrl}
            reducedMotion={reducedMotion}
            openByDefault={visibility.railOpenByDefault}
            mode={mode}
            showFooterCta={visibility.showRailFooterCta}
          />
        ) : null}
      </div>

      <div className={styles.bottomSpacer} aria-hidden="true" />
    </section>
  );
}
