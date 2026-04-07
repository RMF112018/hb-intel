/**
 * LauncherLogo — Unified logo renderer for the Tool Launcher surface.
 *
 * Phase 11D: Premium primitives and surface layer.
 * Replaces three duplicate logo renderers (LogoContent, ShelfLogoContent,
 * IndexLogoContent) with a single parameterized component.
 *
 * Renders a branded container with the resolved logo content:
 *   - image (from SharePoint or asset manifest)
 *   - icon (Lucide icon from resolution chain)
 *   - monogram (first letter fallback)
 *
 * The component owns its container div — callers do not need a wrapper.
 */
import * as React from 'react';
import { HP_RADIUS } from '../../homepage/tokens.js';
import type { LogoResolution } from './launcherAssetResolution.js';

/* ── Size presets ────────────────────────────────────────────────── */

export type LauncherLogoSize = 'hero' | 'flagship' | 'shelf' | 'index';

interface LogoSizeConfig {
  containerSize: number;
  iconSize: number;
  imagePadding: number;
  monogramFontSize: string;
  iconColor: string;
  monogramColor: string;
  containerRadius: number;
  containerBg: string;
}

const LOGO_SIZE_CONFIG: Record<LauncherLogoSize, LogoSizeConfig> = {
  hero: {
    containerSize: 64,
    iconSize: 30,
    imagePadding: 10,
    monogramFontSize: '1.4rem',
    iconColor: 'rgba(34,83,145,0.6)',
    monogramColor: 'rgba(34,83,145,0.5)',
    containerRadius: HP_RADIUS.card,
    containerBg: 'rgba(34,83,145,0.06)',
  },
  flagship: {
    containerSize: 48,
    iconSize: 24,
    imagePadding: 7,
    monogramFontSize: '1.1rem',
    iconColor: 'rgba(34,83,145,0.6)',
    monogramColor: 'rgba(34,83,145,0.45)',
    containerRadius: HP_RADIUS.command,
    containerBg: 'rgba(34,83,145,0.05)',
  },
  shelf: {
    containerSize: 40,
    iconSize: 20,
    imagePadding: 6,
    monogramFontSize: '0.9rem',
    iconColor: 'rgba(34,83,145,0.5)',
    monogramColor: 'rgba(34,83,145,0.45)',
    containerRadius: HP_RADIUS.command,
    containerBg: 'rgba(34,83,145,0.04)',
  },
  index: {
    containerSize: 32,
    iconSize: 16,
    imagePadding: 4,
    monogramFontSize: '0.75rem',
    iconColor: 'rgba(34,83,145,0.45)',
    monogramColor: 'rgba(34,83,145,0.4)',
    containerRadius: HP_RADIUS.command,
    containerBg: 'rgba(34,83,145,0.04)',
  },
};

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherLogoProps {
  resolution: LogoResolution;
  onImageError: () => void;
  size: LauncherLogoSize;
}

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherLogo({ resolution, onImageError, size }: LauncherLogoProps): React.JSX.Element {
  const cfg = LOGO_SIZE_CONFIG[size];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: cfg.containerSize,
    height: cfg.containerSize,
    borderRadius: cfg.containerRadius,
    background: cfg.containerBg,
    flexShrink: 0,
    overflow: 'hidden',
  };

  let content: React.JSX.Element;

  switch (resolution.type) {
    case 'image':
      content = (
        <img
          src={resolution.src}
          alt={resolution.alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: cfg.imagePadding,
          }}
          onError={onImageError}
        />
      );
      break;
    case 'icon': {
      const Icon = resolution.icon;
      content = <Icon size={cfg.iconSize} strokeWidth={1.6} color={cfg.iconColor} />;
      break;
    }
    case 'monogram':
      content = (
        <span
          style={{
            fontSize: cfg.monogramFontSize,
            fontWeight: 700,
            color: cfg.monogramColor,
            lineHeight: 1,
            userSelect: 'none',
          }}
          aria-hidden="true"
        >
          {resolution.letter}
        </span>
      );
      break;
  }

  return <div style={containerStyle}>{content}</div>;
}
