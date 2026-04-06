/**
 * LauncherFlagshipCard — Premium brand-led launch card for featured platforms.
 *
 * Phase 03-03: Logo asset binding via launcherAssetResolution with
 * governed fallback chain and onError recovery for broken images.
 *
 * Logo resolution order:
 *   1. Record logoAssetRef (from SharePoint list)
 *   2. Asset manifest governed logo (light/dark variant)
 *   3. Manifest fallback Lucide icon
 *   4. Platform/category Lucide icon
 *   5. Monogram (first letter) as final fallback
 *
 * If an <img> fails to load (onError), the card falls back to the
 * next viable resolution (icon or monogram) without layout shift.
 */
import * as React from 'react';
import { motion, ExternalLink } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER, HP_RADIUS } from '../../homepage/tokens.js';
import { usePrefersReducedMotion } from '../../homepage/shared/usePrefersReducedMotion.js';
import { resolvePlatformIcon } from './launcherIconResolution.js';
import { resolveLogoAsset, type LogoResolution } from './launcherAssetResolution.js';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherFlagshipCardProps {
  platform: LauncherPlatformRecord;
}

/* ── Styles ───────────────────────────────────────────────────────── */

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
  cursor: 'pointer',
};

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

const monogramStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'rgba(34,83,145,0.5)',
  lineHeight: 1,
  userSelect: 'none',
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

/* ── Motion variants ─────────────────────────────────────────────── */

const hoverVariant = { scale: 1.015, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' };
const tapVariant = { scale: 0.985 };
const restVariant = { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' };

/* ── Logo renderer ───────────────────────────────────────────────── */

function LogoContent({ resolution, onImageError }: {
  resolution: LogoResolution;
  onImageError: () => void;
}): React.JSX.Element {
  switch (resolution.type) {
    case 'image':
      return (
        <img
          src={resolution.src}
          alt={resolution.alt}
          style={logoImageStyle}
          onError={onImageError}
        />
      );
    case 'icon': {
      const Icon = resolution.icon;
      return <Icon size={26} strokeWidth={1.6} color="rgba(34,83,145,0.6)" />;
    }
    case 'monogram':
      return <span style={monogramStyle} aria-hidden="true">{resolution.letter}</span>;
  }
}

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherFlagshipCard({ platform: p }: LauncherFlagshipCardProps): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const [imageErrored, setImageErrored] = React.useState(false);

  // Resolve logo: primary resolution, or fallback icon on image error
  const primaryResolution = resolveLogoAsset(p);
  const fallbackResolution: LogoResolution = {
    type: 'icon',
    icon: resolvePlatformIcon(p),
  };
  const resolution = imageErrored && primaryResolution.type === 'image'
    ? fallbackResolution
    : primaryResolution;

  const badgeColors = p.notice
    ? BADGE_TONE_COLORS[p.notice.tone] ?? BADGE_TONE_COLORS.info
    : undefined;

  return (
    <motion.a
      href={p.launchUrl}
      target={p.openInNewTab ? '_blank' : undefined}
      rel={p.openInNewTab ? 'noopener noreferrer' : undefined}
      style={cardStyle}
      aria-label={`Launch ${p.name}`}
      initial={false}
      whileHover={reducedMotion ? undefined : hoverVariant}
      whileTap={reducedMotion ? undefined : tapVariant}
      animate={restVariant}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Header: logo + name */}
      <div style={cardHeaderStyle}>
        <div style={logoContainerStyle}>
          <LogoContent
            resolution={resolution}
            onImageError={() => setImageErrored(true)}
          />
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
    </motion.a>
  );
}
