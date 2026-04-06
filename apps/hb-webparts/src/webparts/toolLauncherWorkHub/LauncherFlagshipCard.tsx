/**
 * LauncherFlagshipCard — Premium brand-led launch card for featured platforms.
 *
 * Phase 03-01: Flagship card primitive with:
 *   - 56px logo container (renders <img> when logoAssetRef exists,
 *     falls back to platform-specific Lucide icon)
 *   - Platform name at primary weight
 *   - Optional short descriptor
 *   - Launch CTA with ExternalLink icon
 *   - Optional notice badge with tone coloring
 *   - Premium hover/tap interaction via motion (gated by prefers-reduced-motion)
 *
 * Accepts a single LauncherPlatformRecord — does not depend on raw
 * SharePoint fields. Structurally distinct from workflow shelf tiles
 * (larger, column-layout, logo container, CTA row).
 */
import * as React from 'react';
import { motion, ExternalLink } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER, HP_RADIUS } from '../../homepage/tokens.js';
import { usePrefersReducedMotion } from '../../homepage/shared/usePrefersReducedMotion.js';
import { resolvePlatformIcon } from './launcherIconResolution.js';
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

/* ── Motion variants ─────────────────────────────────────────────── */

const hoverVariant = { scale: 1.015, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' };
const tapVariant = { scale: 0.985 };
const restVariant = { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' };

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherFlagshipCard({ platform: p }: LauncherFlagshipCardProps): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const Icon = resolvePlatformIcon(p);
  const hasLogo = Boolean(p.logoAssetRef);
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
    </motion.a>
  );
}
