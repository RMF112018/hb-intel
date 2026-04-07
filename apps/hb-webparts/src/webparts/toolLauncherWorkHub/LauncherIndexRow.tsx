/**
 * LauncherIndexRow — Compact inventory row for the all-platforms overlay.
 *
 * Phase 06-01: Tier 3 card — the most compact representation in the
 * launcher hierarchy. Horizontal row with 32px logo container, name,
 * optional descriptor, and optional category tag. Whole-row click.
 *
 * Visually below both flagship cards (Tier 1) and shelf cards (Tier 2).
 */
import * as React from 'react';
import { ExternalLink } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_RADIUS, HP_MOTION } from '../../homepage/tokens.js';
import { resolvePlatformIcon } from './launcherIconResolution.js';
import { resolveLogoAsset, type LogoResolution } from './launcherAssetResolution.js';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherIndexRowProps {
  platform: LauncherPlatformRecord;
}

/* ── Styles ───────────────────────────────────────────────────────── */

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
  padding: `${HP_SPACE.sm}px ${HP_SPACE.lg}px`,
  borderRadius: HP_RADIUS.command,
  textDecoration: 'none',
  color: 'inherit',
  transition: `background ${HP_MOTION.fast}`,
  cursor: 'pointer',
  minHeight: 40,
};

const logoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: HP_RADIUS.command,
  background: 'rgba(34,83,145,0.035)',
  flexShrink: 0,
  overflow: 'hidden',
};

const logoImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  padding: 4,
};

const monogramStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'rgba(34,83,145,0.4)',
  lineHeight: 1,
  userSelect: 'none',
};

const textContainerStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'baseline',
  gap: HP_SPACE.sm,
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'rgba(0,0,0,0.75)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const descriptorStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.65rem',
  color: 'rgba(0,0,0,0.4)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const categoryTagStyle: React.CSSProperties = {
  fontSize: '0.6rem',
  fontWeight: 500,
  padding: `0 ${HP_SPACE.xs}px`,
  borderRadius: 3,
  background: 'rgba(0,0,0,0.05)',
  color: 'rgba(0,0,0,0.4)',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const launchIconStyle: React.CSSProperties = {
  flexShrink: 0,
  color: 'rgba(0,0,0,0.3)',
};

/* ── Logo renderer ───────────────────────────────────────────────── */

function IndexLogoContent({ resolution, onImageError }: {
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
      return <Icon size={16} strokeWidth={1.6} color="rgba(34,83,145,0.45)" />;
    }
    case 'monogram':
      return <span style={monogramStyle} aria-hidden="true">{resolution.letter}</span>;
  }
}

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherIndexRow({ platform: p }: LauncherIndexRowProps): React.JSX.Element {
  const [imageErrored, setImageErrored] = React.useState(false);

  const primaryResolution = resolveLogoAsset(p);
  const fallbackResolution: LogoResolution = { type: 'icon', icon: resolvePlatformIcon(p) };
  const resolution = imageErrored && primaryResolution.type === 'image'
    ? fallbackResolution
    : primaryResolution;

  return (
    <a
      href={p.launchUrl}
      target={p.openInNewTab ? '_blank' : undefined}
      rel={p.openInNewTab ? 'noopener noreferrer' : undefined}
      style={rowStyle}
      aria-label={`Launch ${p.name}`}
    >
      <div style={logoContainerStyle}>
        <IndexLogoContent resolution={resolution} onImageError={() => setImageErrored(true)} />
      </div>
      <div style={textContainerStyle}>
        <p style={nameStyle}>{p.name}</p>
        {p.descriptor && <p style={descriptorStyle}>{p.descriptor}</p>}
      </div>
      {p.category && <span style={categoryTagStyle}>{p.category}</span>}
      <ExternalLink size={12} strokeWidth={1.8} style={launchIconStyle} />
    </a>
  );
}
