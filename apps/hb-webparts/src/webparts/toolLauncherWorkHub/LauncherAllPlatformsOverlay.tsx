/**
 * LauncherAllPlatformsOverlay — Full platform inventory overlay with search.
 *
 * Phase 06-03: Live search filtering against normalized launcher fields
 * (name, aliases, descriptor, category). Sticky header with interactive
 * search input auto-focused on open. Empty-result state. Motion
 * entrance/exit. Escape key and click-outside dismissal.
 *
 * Search matching: case-insensitive substring against name, each alias,
 * descriptor, and category. Filtered results re-grouped by category.
 * Categories with zero matches are suppressed.
 */
import * as React from 'react';
import { motion, AnimatePresence, Search } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER, HP_RADIUS, HP_MOTION } from '../../homepage/tokens.js';
import { usePrefersReducedMotion } from '../../homepage/shared/usePrefersReducedMotion.js';
import { LauncherIndexRow } from './LauncherIndexRow.js';
import type { LauncherPlatformIndex, LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherAllPlatformsOverlayProps {
  index: LauncherPlatformIndex;
  isOpen: boolean;
  onClose: () => void;
}

/* ── Search logic ────────────────────────────────────────────────── */

function matchesPlatform(platform: LauncherPlatformRecord, query: string): boolean {
  const q = query.toLowerCase();
  if (platform.name.toLowerCase().includes(q)) return true;
  if (platform.descriptor?.toLowerCase().includes(q)) return true;
  if (platform.category?.toLowerCase().includes(q)) return true;
  for (const alias of platform.aliases) {
    if (alias.toLowerCase().includes(q)) return true;
  }
  return false;
}

function filterIndex(index: LauncherPlatformIndex, query: string): LauncherPlatformIndex {
  if (!query.trim()) return index;

  const filtered = index.groups
    .map((group) => ({
      category: group.category,
      platforms: group.platforms.filter((p) => matchesPlatform(p, query)),
    }))
    .filter((group) => group.platforms.length > 0);

  return { groups: filtered };
}

/* ── Styles ───────────────────────────────────────────────────────── */

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 99,
  background: 'rgba(0,0,0,0.05)',
};

const overlayStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 100,
  maxHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.card,
  background: 'rgba(255,255,255,0.98)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  overflow: 'hidden',
};

const stickyHeaderStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  padding: `${HP_SPACE['2xl']}px ${HP_SPACE['2xl']}px ${HP_SPACE.lg}px`,
  background: 'rgba(255,255,255,0.98)',
  borderBottom: HP_BORDER.subtle,
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: HP_SPACE.xl,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.85rem',
  fontWeight: 650,
  color: 'rgba(0,0,0,0.8)',
  whiteSpace: 'nowrap',
};

const searchContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  maxWidth: 280,
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: `${HP_SPACE.sm}px ${HP_SPACE.lg}px ${HP_SPACE.sm}px 28px`,
  borderRadius: HP_RADIUS.command,
  border: HP_BORDER.subtle,
  background: 'rgba(0,0,0,0.02)',
  fontSize: '0.75rem',
  color: 'rgba(0,0,0,0.8)',
  outline: 'none',
  transition: `border-color ${HP_MOTION.fast}`,
};

const searchIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: 8,
  pointerEvents: 'none',
  color: 'rgba(0,0,0,0.25)',
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
  flexShrink: 0,
};

const scrollBodyStyle: React.CSSProperties = {
  overflowY: 'auto',
  padding: `${HP_SPACE.lg}px ${HP_SPACE['2xl']}px ${HP_SPACE['2xl']}px`,
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

const noResultsStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: HP_SPACE['3xl'],
  color: 'rgba(0,0,0,0.4)',
  fontSize: '0.78rem',
};

/* ── Motion variants ─────────────────────────────────────────────── */

const overlayMotion = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/* ── Component ───────────────────────────────────────────────────── */

function OverlayContent({ index, onClose }: { index: LauncherPlatformIndex; onClose: () => void }): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Escape key dismissal
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Auto-focus search input on mount
  React.useEffect(() => {
    // Small delay to ensure motion animation doesn't steal focus
    const timer = setTimeout(() => searchRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  const totalPlatforms = index.groups.reduce((sum, g) => sum + g.platforms.length, 0);
  const filtered = filterIndex(index, searchQuery);
  const filteredCount = filtered.groups.reduce((sum, g) => sum + g.platforms.length, 0);
  const isSearching = searchQuery.trim().length > 0;

  return (
    <>
      <div style={backdropStyle} onClick={onClose} aria-hidden="true" />

      <motion.div
        role="dialog"
        aria-label="All Platforms"
        aria-modal="false"
        style={overlayStyle}
        data-launcher-region="all-platforms-overlay"
        initial={reducedMotion ? false : overlayMotion.initial}
        animate={overlayMotion.animate}
        exit={reducedMotion ? undefined : overlayMotion.exit}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {/* Sticky header */}
        <div style={stickyHeaderStyle}>
          <div style={headerRowStyle}>
            <h3 style={titleStyle}>
              {isSearching
                ? `${filteredCount} result${filteredCount === 1 ? '' : 's'}`
                : `All Platforms (${totalPlatforms})`}
            </h3>
            <div style={searchContainerStyle}>
              <Search size={13} strokeWidth={2} style={searchIconStyle} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search all platforms"
                style={searchInputStyle}
              />
            </div>
            <button
              type="button"
              style={closeButtonStyle}
              onClick={onClose}
              aria-label="Close all platforms"
            >
              Close
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={scrollBodyStyle}>
          {totalPlatforms === 0 ? (
            <div style={emptyStyle}>No platforms available</div>
          ) : filtered.groups.length === 0 ? (
            <div style={noResultsStyle}>
              No platforms matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filtered.groups.map((group, i) => (
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
      </motion.div>
    </>
  );
}

export function LauncherAllPlatformsOverlay({ index, isOpen, onClose }: LauncherAllPlatformsOverlayProps): React.JSX.Element {
  return (
    <AnimatePresence>
      {isOpen && <OverlayContent index={index} onClose={onClose} />}
    </AnimatePresence>
  );
}
