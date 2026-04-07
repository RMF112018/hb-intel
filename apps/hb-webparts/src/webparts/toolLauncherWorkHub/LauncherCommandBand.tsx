/**
 * LauncherCommandBand — Responsive top identity and command surface.
 *
 * Phase 07-02: Tier-aware layout adaptation.
 *   Desktop: 3-column grid (title, search, actions)
 *   Tablet:  3-column grid (same — auto-wraps at narrow tablet)
 *   Mobile:  2-column grid (title + actions; search hidden)
 */
import * as React from 'react';
import { Search } from '@hbc/ui-kit/homepage';
import {
  HP_SPACE,
  HP_RADIUS,
  HP_BORDER,
  HP_MOTION,
} from '../../homepage/tokens.js';
import type { ResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';

/* ── Props ───────────────────────────────────────────────────────── */

export interface LauncherCommandBandProps {
  title?: string;
  supportingLine?: string;
  onAllPlatforms?: () => void;
  onNeedHelp?: () => void;
  platformCount?: number;
  featuredCount?: number;
  tier?: ResponsiveTier;
}

/* ── Style factories ─────────────────────────────────────────────── */

function getBandStyle(tier: ResponsiveTier): React.CSSProperties {
  const isMobile = tier === 'mobile';
  return {
    display: 'grid',
    gridTemplateColumns: isMobile ? 'auto 1fr' : 'auto 1fr auto',
    alignItems: 'center',
    gap: isMobile ? HP_SPACE.md : HP_SPACE['2xl'],
    padding: isMobile
      ? `${HP_SPACE.md}px ${HP_SPACE.lg}px`
      : `${HP_SPACE.lg}px ${HP_SPACE['2xl']}px`,
    borderRadius: HP_RADIUS.command,
    border: HP_BORDER.subtle,
    background: 'rgba(34,83,145,0.03)',
    minHeight: isMobile ? 38 : 44,
  };
}

const identityStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.88rem',
  fontWeight: 650,
  letterSpacing: '0.015em',
  color: 'rgba(0,0,0,0.8)',
  whiteSpace: 'nowrap',
};

const supportingLineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.72rem',
  fontWeight: 400,
  color: 'rgba(0,0,0,0.45)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const searchContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
  maxWidth: 320,
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: `${HP_SPACE.sm}px ${HP_SPACE.lg}px ${HP_SPACE.sm}px 32px`,
  borderRadius: HP_RADIUS.command,
  border: HP_BORDER.subtle,
  background: 'rgba(255,255,255,0.6)',
  fontSize: '0.78rem',
  color: 'rgba(0,0,0,0.5)',
  outline: 'none',
  transition: `border-color ${HP_MOTION.fast}`,
  cursor: 'default',
};

const searchIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: 10,
  pointerEvents: 'none',
  color: 'rgba(0,0,0,0.3)',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
  flexShrink: 0,
  justifyContent: 'flex-end',
};

const actionButtonStyle: React.CSSProperties = {
  padding: `${HP_SPACE.xs}px ${HP_SPACE.lg}px`,
  borderRadius: HP_RADIUS.command,
  border: HP_BORDER.subtle,
  background: 'rgba(255,255,255,0.5)',
  fontSize: '0.73rem',
  fontWeight: 500,
  color: 'rgba(0,0,0,0.6)',
  cursor: 'pointer',
  transition: `background ${HP_MOTION.fast}, color ${HP_MOTION.fast}`,
  whiteSpace: 'nowrap',
};

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherCommandBand({
  title = 'Work Hub',
  supportingLine,
  onAllPlatforms,
  onNeedHelp,
  platformCount,
  featuredCount,
  tier = 'desktop',
}: LauncherCommandBandProps): React.JSX.Element {
  const isMobile = tier === 'mobile';

  let effectiveSupportingLine = supportingLine;
  if (!effectiveSupportingLine) {
    const parts: string[] = [];
    if (typeof platformCount === 'number' && platformCount > 0) {
      parts.push(`${platformCount} platform${platformCount === 1 ? '' : 's'}`);
    }
    if (typeof featuredCount === 'number' && featuredCount > 0) {
      parts.push(`${featuredCount} featured`);
    }
    if (parts.length > 0) {
      effectiveSupportingLine = isMobile
        ? parts.join(' · ')
        : `${parts.join(' · ')} · Launch the systems your team uses every day`;
    } else {
      effectiveSupportingLine = isMobile ? '' : 'Launch the systems your team uses every day';
    }
  }

  return (
    <div style={getBandStyle(tier)} role="toolbar" aria-label={`${title} command band`}>
      {/* Left: identity */}
      <div style={identityStyle}>
        <h3 style={titleStyle}>{title}</h3>
        {effectiveSupportingLine && (
          <p style={supportingLineStyle}>{effectiveSupportingLine}</p>
        )}
      </div>

      {/* Center: search (hidden on mobile — users access overlay search instead) */}
      {!isMobile && (
        <div style={searchContainerStyle}>
          <Search size={14} strokeWidth={2} style={searchIconStyle} />
          <input
            type="text"
            placeholder="Search platforms, workflows, or support"
            readOnly
            tabIndex={-1}
            aria-label="Search platforms (coming soon)"
            style={searchInputStyle}
          />
        </div>
      )}

      {/* Right: utility actions */}
      <div style={actionsStyle}>
        <button
          type="button"
          style={actionButtonStyle}
          onClick={onAllPlatforms}
          disabled={!onAllPlatforms}
          aria-label="View all platforms"
        >
          All Platforms
        </button>
        {!isMobile && (
          <button
            type="button"
            style={actionButtonStyle}
            onClick={onNeedHelp}
            disabled={!onNeedHelp}
            aria-label="Get help with platforms"
          >
            Need Help
          </button>
        )}
      </div>
    </div>
  );
}
