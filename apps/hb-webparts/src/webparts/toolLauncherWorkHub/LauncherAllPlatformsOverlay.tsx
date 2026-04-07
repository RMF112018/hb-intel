/**
 * LauncherAllPlatformsOverlay — Full platform inventory overlay.
 *
 * Phase 06-01: Overlay panel anchored below the command band, rendering
 * the complete platform inventory grouped by category with index rows.
 *
 * Features:
 *   - Category-grouped sections with headings
 *   - LauncherIndexRow per platform (Tier 3, most compact)
 *   - Empty state when no platforms exist
 *   - Close button and Escape key dismissal
 *   - Click-outside dismissal via backdrop
 *   - Scrollable content with max-height constraint
 *
 * Consumes LauncherPlatformIndex from the presentation model.
 * Does not create a separate page or faux app — stays anchored
 * to the launcher composition.
 */
import * as React from 'react';
import { HP_SPACE, HP_BORDER, HP_RADIUS } from '../../homepage/tokens.js';
import { LauncherIndexRow } from './LauncherIndexRow.js';
import type { LauncherPlatformIndex } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherAllPlatformsOverlayProps {
  index: LauncherPlatformIndex;
  onClose: () => void;
}

/* ── Styles ───────────────────────────────────────────────────────── */

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 99,
};

const overlayStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 100,
  maxHeight: '60vh',
  overflowY: 'auto',
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.card,
  background: 'rgba(255,255,255,0.97)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: HP_SPACE.xl,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.85rem',
  fontWeight: 650,
  color: 'rgba(0,0,0,0.8)',
};

const closeButtonStyle: React.CSSProperties = {
  padding: `${HP_SPACE.xs}px ${HP_SPACE.md}px`,
  borderRadius: HP_RADIUS.command,
  border: HP_BORDER.subtle,
  background: 'rgba(0,0,0,0.03)',
  fontSize: '0.7rem',
  fontWeight: 500,
  color: 'rgba(0,0,0,0.5)',
  cursor: 'pointer',
};

const categoryHeadingStyle: React.CSSProperties = {
  margin: `${HP_SPACE.xl}px 0 ${HP_SPACE.sm}px`,
  fontSize: '0.7rem',
  fontWeight: 650,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: 'rgba(0,0,0,0.4)',
};

const firstCategoryHeadingStyle: React.CSSProperties = {
  ...categoryHeadingStyle,
  marginTop: 0,
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: HP_SPACE['3xl'],
  color: 'rgba(0,0,0,0.4)',
  fontSize: '0.8rem',
};

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherAllPlatformsOverlay({ index, onClose }: LauncherAllPlatformsOverlayProps): React.JSX.Element {
  // Escape key dismissal
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const totalPlatforms = index.groups.reduce((sum, g) => sum + g.platforms.length, 0);

  return (
    <>
      {/* Click-outside dismissal backdrop */}
      <div style={backdropStyle} onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-label="All Platforms"
        aria-modal="false"
        style={overlayStyle}
        data-launcher-region="all-platforms-overlay"
      >
        <div style={headerStyle}>
          <h3 style={titleStyle}>
            All Platforms{totalPlatforms > 0 ? ` (${totalPlatforms})` : ''}
          </h3>
          <button type="button" style={closeButtonStyle} onClick={onClose} aria-label="Close all platforms">
            Close
          </button>
        </div>

        {index.groups.length === 0 ? (
          <div style={emptyStyle}>No platforms available</div>
        ) : (
          index.groups.map((group, i) => (
            <div key={group.category}>
              <div style={i === 0 ? firstCategoryHeadingStyle : categoryHeadingStyle}>
                {group.category} ({group.platforms.length})
              </div>
              {group.platforms.map((p) => (
                <LauncherIndexRow key={p.platformKey} platform={p} />
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}
