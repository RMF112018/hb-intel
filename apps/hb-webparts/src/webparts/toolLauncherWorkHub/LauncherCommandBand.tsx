/**
 * LauncherCommandBand — Top identity and command surface for Tool Launcher.
 *
 * Phase 02-02: Implements the command band as a productized surface with:
 *   - Left: launcher title + optional supporting line
 *   - Center: search placeholder (visual affordance; behavior deferred to Phase 08)
 *   - Right: utility action buttons (All Platforms, Need Help; interaction deferred)
 *
 * The band must:
 *   - Read as a premium utility-zone product identity, not app-shell chrome
 *   - Not compete visually with the Signature Hero above
 *   - Degrade safely when optional content is unavailable
 *   - Accept future deepening without structural replacement
 */
import * as React from 'react';
import { Search } from '@hbc/ui-kit/homepage';
import {
  HP_SPACE,
  HP_RADIUS,
  HP_BORDER,
  HP_MOTION,
} from '../../homepage/tokens.js';

/* ── Props ───────────────────────────────────────────────────────── */

export interface LauncherCommandBandProps {
  /** Primary launcher title. Defaults to "Work Hub". */
  title?: string;
  /** Optional supporting line below the title. */
  supportingLine?: string;
  /** Callback when "All Platforms" is activated (deferred — placeholder if absent). */
  onAllPlatforms?: () => void;
  /** Callback when "Need Help" is activated (deferred — placeholder if absent). */
  onNeedHelp?: () => void;
  /** Total platform count for the supporting line (e.g., "9 platforms"). */
  platformCount?: number;
}

/* ── Styles ──────────────────────────────────────────────────────── */

const bandStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  gap: HP_SPACE['2xl'],
  padding: `${HP_SPACE.lg}px ${HP_SPACE['2xl']}px`,
  borderRadius: HP_RADIUS.command,
  border: HP_BORDER.subtle,
  background: 'rgba(34,83,145,0.03)',
  minHeight: 44,
};

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
}: LauncherCommandBandProps): React.JSX.Element {
  const effectiveSupportingLine =
    supportingLine ??
    (typeof platformCount === 'number' && platformCount > 0
      ? `${platformCount} platform${platformCount === 1 ? '' : 's'} · Launch the systems your team uses every day`
      : 'Launch the systems your team uses every day');

  return (
    <div style={bandStyle} role="toolbar" aria-label={`${title} command band`}>
      {/* Left: identity */}
      <div style={identityStyle}>
        <h3 style={titleStyle}>{title}</h3>
        <p style={supportingLineStyle}>{effectiveSupportingLine}</p>
      </div>

      {/* Center: search placeholder */}
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
        <button
          type="button"
          style={actionButtonStyle}
          onClick={onNeedHelp}
          disabled={!onNeedHelp}
          aria-label="Get help with platforms"
        >
          Need Help
        </button>
      </div>
    </div>
  );
}
