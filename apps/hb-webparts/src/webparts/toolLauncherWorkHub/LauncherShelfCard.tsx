/**
 * LauncherShelfCard — Medium-weight secondary card for workflow shelves.
 *
 * Phase 05-02: Shelf card primitive positioned between flagship cards
 * and the old icon tiles in the visual hierarchy.
 *
 * Structure: horizontal row layout with 40px logo container, name,
 * and optional descriptor. Whole-card <a> click target. No explicit
 * CTA row (simpler than flagship). No spring motion (only flagship
 * gets motion — hierarchy protection). Subtle CSS hover only.
 *
 * Logo resolution uses the same 5-step chain from launcherAssetResolution
 * with onError fallback to Lucide icon.
 */
import * as React from 'react';
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
  gap: HP_SPACE.md,
  padding: `${HP_SPACE.md}px ${HP_SPACE.lg}px`,
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.command,
  background: 'rgba(255,255,255,0.5)',
  textDecoration: 'none',
  color: 'inherit',
  transition: `background ${HP_MOTION.fast}`,
  cursor: 'pointer',
  minHeight: 44,
};

/** 40px logo container — smaller than flagship's 56px */
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
  minWidth: 0,
  overflow: 'hidden',
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'rgba(0,0,0,0.75)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const descriptorStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.68rem',
  color: 'rgba(0,0,0,0.45)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
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
    </a>
  );
}
