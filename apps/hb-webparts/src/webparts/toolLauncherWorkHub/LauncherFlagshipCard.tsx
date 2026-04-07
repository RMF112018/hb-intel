/**
 * LauncherFlagshipCard — Premium brand-led launch card for featured platforms.
 *
 * Phase 11B: Composition re-architecture. Two variants:
 *   - "hero": full-width horizontal layout with larger logo, descriptor,
 *     and prominent CTA. Used for the primary featured platform.
 *   - "standard": compact vertical layout for secondary featured platforms.
 *
 * Phase 11D: Premium primitives and surface layer.
 *   - CVA variant system for hero/standard axis
 *   - Shared LauncherLogo primitive (replaces inline LogoContent)
 *   - Shared LAUNCHER_TONE_COLORS (replaces inline BADGE_TONE_COLORS)
 *   - CSS module interactive states (:hover, :focus-visible, :active)
 *
 * Logo resolution order (unchanged from Phase 03-03):
 *   1. Record logoAssetRef (from SharePoint list)
 *   2. Asset manifest governed logo (light/dark variant)
 *   3. Manifest fallback Lucide icon
 *   4. Platform/category Lucide icon
 *   5. Monogram (first letter) as final fallback
 */
import * as React from 'react';
import { motion, ExternalLink, cva, clsx } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER, HP_RADIUS } from '../../homepage/tokens.js';
import { usePrefersReducedMotion } from '../../homepage/shared/usePrefersReducedMotion.js';
import { resolvePlatformIcon } from './launcherIconResolution.js';
import { resolveLogoAsset, type LogoResolution } from './launcherAssetResolution.js';
import { LauncherLogo } from './LauncherLogo.js';
import { LAUNCHER_TONE_COLORS } from './launcherTokens.js';
import interactiveStyles from './launcher-interactive.module.css';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherFlagshipCardProps {
  platform: LauncherPlatformRecord;
  /** Card variant. 'hero' is full-width horizontal; 'standard' is compact vertical. */
  variant?: 'hero' | 'standard';
}

/* ── CVA variant system ─────────────────────────────────────────── */

const flagshipCardVariants = cva(interactiveStyles.flagshipCard, {
  variants: {
    variant: {
      hero: '',
      standard: '',
    },
  },
  defaultVariants: {
    variant: 'standard',
  },
});

/* ── Hero variant styles ─────────────────────────────────────────── */

const heroCardStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: HP_SPACE['2xl'],
  alignItems: 'center',
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.editorial,
  background: 'linear-gradient(135deg, rgba(34,83,145,0.04) 0%, rgba(255,255,255,0.8) 100%)',
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
  borderLeft: '4px solid rgba(34,83,145,0.25)',
};

const heroContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: HP_SPACE.sm,
  minWidth: 0,
};

const heroNameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.05rem',
  fontWeight: 700,
  color: 'rgba(0,0,0,0.88)',
  lineHeight: 1.2,
};

const heroDescriptorStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.82rem',
  lineHeight: 1.45,
  color: 'rgba(0,0,0,0.55)',
};

const heroCtaRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.xl,
  marginTop: HP_SPACE.xs,
};

/* ── Standard variant styles ─────────────────────────────────────── */

const standardCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: HP_SPACE.md,
  padding: HP_SPACE.xl,
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.card,
  background: 'rgba(255,255,255,0.75)',
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
};

const standardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.lg,
};

const standardNameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.88rem',
  fontWeight: 650,
  color: 'rgba(0,0,0,0.85)',
};

const standardDescriptorStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.76rem',
  lineHeight: 1.4,
  color: 'rgba(0,0,0,0.5)',
};

/* ── Shared styles ───────────────────────────────────────────────── */

const ctaLabelStyle: React.CSSProperties = {
  fontSize: '0.74rem',
  fontWeight: 600,
  color: '#225391',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};

const noticeBadgeStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  fontWeight: 500,
  padding: `2px ${HP_SPACE.sm}px`,
  borderRadius: 4,
  whiteSpace: 'nowrap',
};

const standardCtaRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 'auto',
  paddingTop: HP_SPACE.sm,
};

/* ── Motion variants ─────────────────────────────────────────────── */

const heroHover = { scale: 1.008, boxShadow: '0 6px 24px rgba(34,83,145,0.1)' };
const standardHover = { scale: 1.015, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' };
const tapVariant = { scale: 0.985 };
const restVariant = { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' };

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherFlagshipCard({ platform: p, variant = 'standard' }: LauncherFlagshipCardProps): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const [imageErrored, setImageErrored] = React.useState(false);

  const primaryResolution = resolveLogoAsset(p);
  const fallbackResolution: LogoResolution = {
    type: 'icon',
    icon: resolvePlatformIcon(p),
  };
  const resolution = imageErrored && primaryResolution.type === 'image'
    ? fallbackResolution
    : primaryResolution;

  const badgeColors = p.notice
    ? LAUNCHER_TONE_COLORS[p.notice.tone] ?? LAUNCHER_TONE_COLORS.info
    : undefined;

  const isHero = variant === 'hero';
  const hoverVariant = isHero ? heroHover : standardHover;

  return (
    <motion.a
      href={p.launchUrl}
      target={p.openInNewTab ? '_blank' : undefined}
      rel={p.openInNewTab ? 'noopener noreferrer' : undefined}
      className={clsx(flagshipCardVariants({ variant }))}
      style={isHero ? heroCardStyle : standardCardStyle}
      aria-label={`Launch ${p.name}`}
      initial={false}
      whileHover={reducedMotion ? undefined : hoverVariant}
      whileTap={reducedMotion ? undefined : tapVariant}
      animate={restVariant}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {isHero ? (
        /* ── Hero layout: horizontal with large logo ── */
        <>
          <LauncherLogo
            resolution={resolution}
            onImageError={() => setImageErrored(true)}
            size="hero"
          />
          <div style={heroContentStyle}>
            <p style={heroNameStyle}>{p.name}</p>
            {p.descriptor && <p style={heroDescriptorStyle}>{p.descriptor}</p>}
            <div style={heroCtaRowStyle}>
              <span style={ctaLabelStyle}>
                Launch <ExternalLink size={12} strokeWidth={2} />
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
          </div>
        </>
      ) : (
        /* ── Standard layout: compact vertical ── */
        <>
          <div style={standardHeaderStyle}>
            <LauncherLogo
              resolution={resolution}
              onImageError={() => setImageErrored(true)}
              size="flagship"
            />
            <p style={standardNameStyle}>{p.name}</p>
          </div>
          {p.descriptor && <p style={standardDescriptorStyle}>{p.descriptor}</p>}
          <div style={standardCtaRowStyle}>
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
        </>
      )}
    </motion.a>
  );
}
