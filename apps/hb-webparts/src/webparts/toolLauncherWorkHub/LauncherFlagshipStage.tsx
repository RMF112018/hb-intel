/**
 * LauncherFlagshipStage — Featured platforms grid at primary visual weight.
 *
 * Phase 03-01: Renders LauncherFlagshipCard instances in a responsive
 * auto-fill grid. Accepts featured platforms pre-sorted by
 * featuredSortOrder from the presentation model.
 *
 * Stage qualification: platforms with isFeatured === true, sorted by
 * featuredSortOrder (ascending), then alphabetical by name. The
 * normalization layer and deriveToolLauncherPresentation() handle
 * qualification and ordering — this component renders the result.
 *
 * Returns null when no featured platforms exist (the composition
 * shell's flagship region is suppressed).
 */
import * as React from 'react';
import { HP_SPACE } from '../../homepage/tokens.js';
import { LauncherFlagshipCard } from './LauncherFlagshipCard.js';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherFlagshipStageProps {
  platforms: LauncherPlatformRecord[];
}

/* ── Styles ───────────────────────────────────────────────────────── */

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: HP_SPACE['2xl'],
};

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherFlagshipStage({ platforms }: LauncherFlagshipStageProps): React.JSX.Element | null {
  if (platforms.length === 0) return null;

  return (
    <div style={gridStyle} data-launcher-sub="flagship-grid">
      {platforms.map((p) => (
        <LauncherFlagshipCard key={p.platformKey} platform={p} />
      ))}
    </div>
  );
}
