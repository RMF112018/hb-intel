/**
 * LauncherAllPlatformsOverlay — Full platform inventory overlay with search.
 *
 * Phase 11B: Composition re-architecture. Stronger header with brand
 * accent, better search placement, premium category headings, and
 * consistent visual language with the rest of the launcher.
 *
 * Phase 11D: Premium primitives and surface layer.
 *   - CSS module interactive states on search input and close button
 *
 * Phase 11E: Search and discovery upgrade.
 *   - Scored search replaces flat substring filtering
 *   - Platforms within groups re-ordered by relevance when searching
 *   - Groups re-ordered by best match score when searching
 *   - Category count badges show filtered/total in search mode
 *   - Improved no-results treatment with helpful guidance
 *   - Search scope signal in header (result count with categories)
 *
 * Search via launcherSearch.ts contract with weighted multi-field scoring.
 * Matches against name, aliases, descriptor, category, workflowShelf,
 * and support owner name. Results ranked by relevance score.
 */
import * as React from 'react';
import { motion, AnimatePresence, Search } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER, HP_RADIUS } from '../../homepage/tokens.js';
import { usePrefersReducedMotion } from '../../homepage/shared/usePrefersReducedMotion.js';
import { resolveGroupIcon } from './launcherIconResolution.js';
import { LauncherIndexRow } from './LauncherIndexRow.js';
import { prepareAllForSearch, filterIndexByQuery, countIndexPlatforms } from './launcherSearch.js';
import interactiveStyles from './launcher-interactive.module.css';
import type { LauncherPlatformIndex } from '../../homepage/webparts/toolLauncherContracts.js';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherAllPlatformsOverlayProps {
  index: LauncherPlatformIndex;
  /** All platforms for search preparation. */
  allPlatforms: LauncherPlatformRecord[];
  isOpen: boolean;
  onClose: () => void;
}

/* ── Styles ───────────────────────────────────────────────────────── */

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 99,
  background: 'rgba(0,0,0,0.08)',
};

const overlayStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 100,
  maxHeight: '65vh',
  display: 'flex',
  flexDirection: 'column',
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.editorial,
  background: 'rgba(255,255,255,0.99)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
  overflow: 'hidden',
};

const stickyHeaderStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  padding: `${HP_SPACE['2xl']}px ${HP_SPACE['2xl']}px ${HP_SPACE.xl}px`,
  background: 'rgba(255,255,255,0.99)',
  borderBottom: HP_BORDER.brandAccent,
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: HP_SPACE.xl,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9rem',
  fontWeight: 700,
  color: 'rgba(0,0,0,0.85)',
  whiteSpace: 'nowrap',
};

const titleDetailStyle: React.CSSProperties = {
  fontWeight: 400,
  color: 'rgba(0,0,0,0.4)',
  fontSize: '0.78rem',
};

const searchContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  maxWidth: 300,
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: `${HP_SPACE.md}px ${HP_SPACE.xl}px ${HP_SPACE.md}px 32px`,
  borderRadius: HP_RADIUS.card,
  border: HP_BORDER.subtle,
  background: 'rgba(34,83,145,0.02)',
  fontSize: '0.78rem',
  color: 'rgba(0,0,0,0.8)',
  outline: 'none',
};

const searchIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: 10,
  pointerEvents: 'none',
  color: 'rgba(34,83,145,0.35)',
};

const closeButtonStyle: React.CSSProperties = {
  padding: `${HP_SPACE.sm}px ${HP_SPACE.xl}px`,
  borderRadius: HP_RADIUS.command,
  border: HP_BORDER.subtle,
  background: 'rgba(0,0,0,0.03)',
  fontSize: '0.72rem',
  fontWeight: 600,
  color: 'rgba(0,0,0,0.55)',
  cursor: 'pointer',
  flexShrink: 0,
};

const scrollBodyStyle: React.CSSProperties = {
  overflowY: 'auto',
  padding: `${HP_SPACE.xl}px ${HP_SPACE['2xl']}px ${HP_SPACE['2xl']}px`,
};

const categoryHeadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.sm,
  margin: `${HP_SPACE['2xl']}px 0 ${HP_SPACE.md}px`,
  paddingBottom: HP_SPACE.sm,
  borderBottom: HP_BORDER.subtle,
  fontSize: '0.72rem',
  fontWeight: 650,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: 'rgba(0,0,0,0.45)',
};

const firstCategoryHeadingStyle: React.CSSProperties = {
  ...categoryHeadingStyle,
  marginTop: 0,
};

const categoryIconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: 4,
  background: 'rgba(34,83,145,0.06)',
  flexShrink: 0,
};

const categoryCountStyle: React.CSSProperties = {
  fontSize: '0.62rem',
  fontWeight: 500,
  padding: `0 ${HP_SPACE.xs}px`,
  borderRadius: 4,
  background: 'rgba(34,83,145,0.07)',
  color: 'rgba(34,83,145,0.55)',
  marginLeft: 'auto',
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

const noResultsHintStyle: React.CSSProperties = {
  marginTop: HP_SPACE.md,
  fontSize: '0.7rem',
  color: 'rgba(0,0,0,0.3)',
};

/* ── Motion variants ─────────────────────────────────────────────── */

const overlayMotion = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/* ── Component ───────────────────────────────────────────────────── */

function OverlayContent({ index, allPlatforms, onClose }: {
  index: LauncherPlatformIndex;
  allPlatforms: LauncherPlatformRecord[];
  onClose: () => void;
}): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Pre-compute searchable records (once per data set, not per keystroke)
  const searchable = React.useMemo(() => prepareAllForSearch(allPlatforms), [allPlatforms]);

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
    const timer = setTimeout(() => searchRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  const totalPlatforms = countIndexPlatforms(index);
  const totalCategories = index.groups.length;
  const filtered = filterIndexByQuery(index, searchable, searchQuery);
  const filteredCount = countIndexPlatforms(filtered);
  const filteredCategories = filtered.groups.length;
  const isSearching = searchQuery.trim().length > 0;

  // Build header title based on search state
  let headerTitle: React.ReactNode;
  if (!isSearching) {
    headerTitle = (
      <>
        All Platforms{' '}
        <span style={titleDetailStyle}>
          ({totalPlatforms} in {totalCategories} {totalCategories === 1 ? 'category' : 'categories'})
        </span>
      </>
    );
  } else if (filteredCount === 0) {
    headerTitle = 'No results';
  } else {
    headerTitle = (
      <>
        {filteredCount} result{filteredCount === 1 ? '' : 's'}{' '}
        <span style={titleDetailStyle}>
          across {filteredCategories} {filteredCategories === 1 ? 'category' : 'categories'}
        </span>
      </>
    );
  }

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
            <h3 style={titleStyle}>{headerTitle}</h3>
            <div style={searchContainerStyle}>
              <Search size={14} strokeWidth={2} style={searchIconStyle} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search by name, category, or workflow..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search all platforms"
                className={interactiveStyles.commandSearchInput}
                style={searchInputStyle}
              />
            </div>
            <button
              type="button"
              className={interactiveStyles.closeButton}
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
              <div style={noResultsHintStyle}>
                Try searching by platform name, category, workflow, or support owner
              </div>
            </div>
          ) : (
            filtered.groups.map((group, i) => {
              const GroupIcon = resolveGroupIcon(group.category);
              // Find original group to show filtered/total count when searching
              const originalGroup = isSearching
                ? index.groups.find((g) => g.category === group.category)
                : undefined;
              const countLabel = originalGroup
                ? `${group.platforms.length}/${originalGroup.platforms.length}`
                : `${group.platforms.length}`;
              return (
                <div key={group.category}>
                  <div style={i === 0 ? firstCategoryHeadingStyle : categoryHeadingStyle}>
                    <div style={categoryIconStyle}>
                      <GroupIcon size={11} strokeWidth={2} color="rgba(34,83,145,0.5)" />
                    </div>
                    {group.category}
                    <span style={categoryCountStyle}>{countLabel}</span>
                  </div>
                  {group.platforms.map((p) => (
                    <LauncherIndexRow key={p.platformKey} platform={p} />
                  ))}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </>
  );
}

export function LauncherAllPlatformsOverlay({ index, allPlatforms, isOpen, onClose }: LauncherAllPlatformsOverlayProps): React.JSX.Element {
  return (
    <AnimatePresence>
      {isOpen && <OverlayContent index={index} allPlatforms={allPlatforms} onClose={onClose} />}
    </AnimatePresence>
  );
}
