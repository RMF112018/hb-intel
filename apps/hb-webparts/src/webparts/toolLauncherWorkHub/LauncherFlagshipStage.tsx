/**
 * LauncherFlagshipStage — Premium featured platforms with focal hierarchy.
 *
 * Phase 11B: Composition re-architecture. The first featured platform
 * receives a hero-weight treatment (larger card, full row span) while
 * remaining featured platforms render in a secondary grid below.
 * This creates a visible focal sequence instead of a flat auto-fill grid.
 *
 * When only one featured platform exists, it renders as the hero card.
 * When none exist, the stage is suppressed (returns null).
 *
 * Stage qualification: platforms with isFeatured === true, sorted by
 * featuredSortOrder (ascending), then alphabetical by name.
 */
import * as React from 'react';
import { HP_SPACE } from '../../homepage/tokens.js';
import { LauncherFlagshipCard } from './LauncherFlagshipCard.js';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';
import type { ResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherFlagshipStageProps {
  platforms: LauncherPlatformRecord[];
  tier?: ResponsiveTier;
}

/* ── Style factory ───────────────────────────────────────────────── */

const stageContainerStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.xl,
};

function getSecondaryGridStyle(tier: ResponsiveTier): React.CSSProperties {
  const minWidth = tier === 'mobile' ? '140px' : '200px';
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
    gap: tier === 'mobile' ? HP_SPACE.lg : HP_SPACE.xl,
  };
}

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherFlagshipStage({ platforms, tier = 'desktop' }: LauncherFlagshipStageProps): React.JSX.Element | null {
  if (platforms.length === 0) return null;

  const [hero, ...secondary] = platforms;

  return (
    <div style={stageContainerStyle} data-launcher-sub="flagship-stage">
      {/* Hero-weight featured platform */}
      <LauncherFlagshipCard key={hero.platformKey} platform={hero} variant="hero" />

      {/* Secondary featured platforms */}
      {secondary.length > 0 && (
        <div style={getSecondaryGridStyle(tier)} data-launcher-sub="flagship-secondary">
          {secondary.map((p) => (
            <LauncherFlagshipCard key={p.platformKey} platform={p} variant="standard" />
          ))}
        </div>
      )}
    </div>
  );
}
