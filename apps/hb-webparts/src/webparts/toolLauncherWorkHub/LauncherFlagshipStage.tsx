/**
 * LauncherFlagshipStage — Featured platforms at primary visual weight.
 *
 * Phase 02-03: Desktop skeleton with brand-asset slots, descriptor,
 * launch CTA, and notice badge placement. Logo resolution follows the
 * asset-manifest fallback chain: logoAssetRef → platform fallback icon
 * → category icon → default Settings icon.
 *
 * Cards are larger than workflow shelf tiles and include:
 *   - logo/icon container (56px, ready for real brand assets)
 *   - platform name
 *   - short descriptor
 *   - launch CTA affordance (whole-card click)
 *   - optional notice badge
 */
import * as React from 'react';
import { ExternalLink } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER, HP_RADIUS, HP_MOTION } from '../../homepage/tokens.js';
import { resolvePlatformIcon } from './launcherIconResolution.js';
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

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: HP_SPACE.md,
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.card,
  background: 'rgba(255,255,255,0.7)',
  textDecoration: 'none',
  color: 'inherit',
  transition: `box-shadow ${HP_MOTION.fast}, transform ${HP_MOTION.fast}`,
  position: 'relative',
};

/** Logo/icon container — 56px, ready for real brand asset images */
const logoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 56,
  borderRadius: HP_RADIUS.card,
  background: 'rgba(34,83,145,0.05)',
  flexShrink: 0,
  overflow: 'hidden',
};

const logoImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  padding: 8,
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.lg,
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.92rem',
  fontWeight: 650,
  color: 'rgba(0,0,0,0.85)',
};

const descriptorStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.78rem',
  lineHeight: 1.4,
  color: 'rgba(0,0,0,0.55)',
};

const ctaRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 'auto',
  paddingTop: HP_SPACE.md,
};

const ctaLabelStyle: React.CSSProperties = {
  fontSize: '0.73rem',
  fontWeight: 600,
  color: '#225391',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const noticeBadgeStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  fontWeight: 500,
  padding: `2px ${HP_SPACE.sm}px`,
  borderRadius: 3,
  whiteSpace: 'nowrap',
};

const BADGE_TONE_COLORS: Record<string, { bg: string; color: string }> = {
  info: { bg: 'rgba(34,83,145,0.1)', color: '#225391' },
  warning: { bg: 'rgba(229,126,70,0.12)', color: '#b5652a' },
  critical: { bg: 'rgba(200,40,40,0.1)', color: '#a02020' },
  success: { bg: 'rgba(40,160,60,0.1)', color: '#1a7a2e' },
  neutral: { bg: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.55)' },
};

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherFlagshipStage({ platforms }: LauncherFlagshipStageProps): React.JSX.Element | null {
  if (platforms.length === 0) return null;

  return (
    <div style={gridStyle} data-launcher-sub="flagship-grid">
      {platforms.map((p) => {
        const Icon = resolvePlatformIcon(p);
        const hasLogo = Boolean(p.logoAssetRef);
        const badgeColors = p.notice
          ? BADGE_TONE_COLORS[p.notice.tone] ?? BADGE_TONE_COLORS.info
          : undefined;

        return (
          <a
            key={p.platformKey}
            href={p.launchUrl}
            target={p.openInNewTab ? '_blank' : undefined}
            rel={p.openInNewTab ? 'noopener noreferrer' : undefined}
            style={cardStyle}
            aria-label={`Launch ${p.name}`}
          >
            {/* Header: logo + name */}
            <div style={cardHeaderStyle}>
              <div style={logoContainerStyle}>
                {hasLogo ? (
                  <img
                    src={p.logoAssetRef}
                    alt={`${p.name} logo`}
                    style={logoImageStyle}
                  />
                ) : (
                  <Icon size={26} strokeWidth={1.6} color="rgba(34,83,145,0.6)" />
                )}
              </div>
              <p style={nameStyle}>{p.name}</p>
            </div>

            {/* Descriptor */}
            {p.descriptor && <p style={descriptorStyle}>{p.descriptor}</p>}

            {/* CTA row + optional notice badge */}
            <div style={ctaRowStyle}>
              <span style={ctaLabelStyle}>
                Launch <ExternalLink size={11} strokeWidth={2} />
              </span>
              {p.notice && badgeColors && (
                <span
                  style={{
                    ...noticeBadgeStyle,
                    background: badgeColors.bg,
                    color: badgeColors.color,
                  }}
                >
                  {p.notice.label}
                </span>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
