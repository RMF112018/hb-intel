/**
 * LauncherShelfCard — Medium-weight secondary card for workflow shelves.
 *
 * Phase 11B: Composition re-architecture. Strengthened visual treatment
 * with branded hover state, improved spacing, and subtle left accent
 * for better shelf-level rhythm.
 *
 * Structure: horizontal row layout with 40px logo container, name,
 * and optional descriptor. Whole-card <a> click target. No spring
 * motion (only flagship gets motion — hierarchy protection).
 *
 * Logo resolution uses the same 5-step chain from launcherAssetResolution
 * with onError fallback to Lucide icon.
 */
import * as React from 'react';
import { ExternalLink } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER, HP_RADIUS, HP_MOTION } from '../../homepage/tokens.js';
import { resolvePlatformIcon } from './launcherIconResolution.js';
import { resolveLogoAsset, type LogoResolution } from './launcherAssetResolution.js';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherShelfCardProps {
  platform: LauncherPlatformRecord;
}

/* ── Styles ───────────────────────────────────────────────────────── */

const cardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.lg,
  padding: `${HP_SPACE.lg}px ${HP_SPACE.xl}px`,
  border: HP_BORDER.subtle,
  borderLeft: '3px solid rgba(34,83,145,0.1)',
  borderRadius: HP_RADIUS.command,
  background: 'rgba(255,255,255,0.55)',
  textDecoration: 'none',
  color: 'inherit',
  transition: `background ${HP_MOTION.fast}, border-color ${HP_MOTION.fast}`,
  cursor: 'pointer',
  minHeight: 48,
};

/** 40px logo container */
const logoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: HP_RADIUS.command,
  background: 'rgba(34,83,145,0.04)',
  flexShrink: 0,
  overflow: 'hidden',
};

const logoImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  padding: 6,
};

const monogramStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: 700,
  color: 'rgba(34,83,145,0.45)',
  lineHeight: 1,
  userSelect: 'none',
};

const textContainerStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.82rem',
  fontWeight: 620,
  color: 'rgba(0,0,0,0.78)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const descriptorStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.7rem',
  color: 'rgba(0,0,0,0.42)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const launchIconStyle: React.CSSProperties = {
  flexShrink: 0,
  color: 'rgba(34,83,145,0.35)',
};

/* ── Logo renderer ───────────────────────────────────────────────── */

function ShelfLogoContent({ resolution, onImageError }: {
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
      return <Icon size={20} strokeWidth={1.6} color="rgba(34,83,145,0.5)" />;
    }
    case 'monogram':
      return <span style={monogramStyle} aria-hidden="true">{resolution.letter}</span>;
  }
}

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherShelfCard({ platform: p }: LauncherShelfCardProps): React.JSX.Element {
  const [imageErrored, setImageErrored] = React.useState(false);

  const primaryResolution = resolveLogoAsset(p);
  const fallbackResolution: LogoResolution = {
    type: 'icon',
    icon: resolvePlatformIcon(p),
  };
  const resolution = imageErrored && primaryResolution.type === 'image'
    ? fallbackResolution
    : primaryResolution;

  return (
    <a
      href={p.launchUrl}
      target={p.openInNewTab ? '_blank' : undefined}
      rel={p.openInNewTab ? 'noopener noreferrer' : undefined}
      style={cardStyle}
      aria-label={`Launch ${p.name}`}
    >
      <div style={logoContainerStyle}>
        <ShelfLogoContent
          resolution={resolution}
          onImageError={() => setImageErrored(true)}
        />
      </div>
      <div style={textContainerStyle}>
        <p style={nameStyle}>{p.name}</p>
        {p.descriptor && <p style={descriptorStyle}>{p.descriptor}</p>}
      </div>
      <ExternalLink size={12} strokeWidth={1.8} style={launchIconStyle} />
    </a>
  );
}
