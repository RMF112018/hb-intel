/**
 * LauncherIndexRow — Compact inventory row for the all-platforms overlay.
 *
 * Phase 11B: Composition re-architecture. Subtle brand hover state,
 * improved spacing rhythm, and consistent icon treatment with the
 * rest of the launcher surface.
 *
 * Phase 11D: Premium primitives and surface layer.
 *   - Shared LauncherLogo primitive (replaces inline IndexLogoContent)
 *   - CSS module interactive states (:hover, :focus-visible, :active)
 *
 * Tier 3 card — the most compact representation in the launcher
 * hierarchy. Horizontal row with 32px logo container, name,
 * optional descriptor, and optional category tag.
 */
import * as React from 'react';
import { ExternalLink } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_RADIUS } from '../../homepage/tokens.js';
import { resolvePlatformIcon } from './launcherIconResolution.js';
import { resolveLogoAsset, type LogoResolution } from './launcherAssetResolution.js';
import { LauncherLogo } from './LauncherLogo.js';
import interactiveStyles from './launcher-interactive.module.css';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherIndexRowProps {
  platform: LauncherPlatformRecord;
}

/* ── Styles ───────────────────────────────────────────────────────── */

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.lg,
  padding: `${HP_SPACE.md}px ${HP_SPACE.xl}px`,
  borderRadius: HP_RADIUS.command,
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
  minHeight: 42,
};

const textContainerStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'baseline',
  gap: HP_SPACE.md,
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8rem',
  fontWeight: 620,
  color: 'rgba(0,0,0,0.78)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const descriptorStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.67rem',
  color: 'rgba(0,0,0,0.38)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const categoryTagStyle: React.CSSProperties = {
  fontSize: '0.62rem',
  fontWeight: 500,
  padding: `1px ${HP_SPACE.sm}px`,
  borderRadius: 4,
  background: 'rgba(34,83,145,0.06)',
  color: 'rgba(34,83,145,0.5)',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const launchIconStyle: React.CSSProperties = {
  flexShrink: 0,
  color: 'rgba(34,83,145,0.3)',
};

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
      className={interactiveStyles.indexRow}
      style={rowStyle}
      aria-label={`Launch ${p.name}`}
    >
      <LauncherLogo
        resolution={resolution}
        onImageError={() => setImageErrored(true)}
        size="index"
      />
      <div style={textContainerStyle}>
        <p style={nameStyle}>{p.name}</p>
        {p.descriptor && <p style={descriptorStyle}>{p.descriptor}</p>}
      </div>
      {p.category && <span style={categoryTagStyle}>{p.category}</span>}
      <ExternalLink size={12} strokeWidth={1.8} style={launchIconStyle} />
    </a>
  );
}
