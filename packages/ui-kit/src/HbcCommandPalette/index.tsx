/**
 * HbcCommandPalette — Cmd+K command palette overlay
 * PH4.6 §Step 11 | Blueprint §1d
 *
 * Features:
 * - Cmd+K / Ctrl+K keyboard activation
 * - Debounced search (200ms)
 * - Result categories: Navigation, Recent, Actions, AI
 * - Offline: Navigation + Recent + Actions via localStorage. AI hidden.
 * - Keyboard nav: ArrowUp/Down, Enter, Escape
 * - Accessibility: dialog role, listbox/option, focus trap
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { elevationLevel3 } from '../theme/elevation.js';
import { HBC_SURFACE_LIGHT, HBC_ACCENT_ORANGE } from '../theme/tokens.js';
import { TRANSITION_FAST, keyframes } from '../theme/animations.js';
import { Z_INDEX } from '../theme/z-index.js';
import { Search, Star } from '../icons/index.js';
import { useOnlineStatus } from '../HbcAppShell/hooks/useOnlineStatus.js';
import { useCommandPalette } from './hooks/useCommandPalette.js';
import type {
  HbcCommandPaletteProps,
  CommandPaletteResult,
  CommandPaletteCategory,
} from './types.js';

const CATEGORY_LABELS: Record<CommandPaletteCategory, string> = {
  navigation: 'Navigation',
  recent: 'Recent',
  actions: 'Actions',
  ai: 'AI',
};

const RECENT_STORAGE_KEY = 'hbc-command-palette-recent';
const MAX_RECENT = 10;

const useStyles = makeStyles({
  backdrop: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: Z_INDEX.commandPaletteBackdrop,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
  },
  dialog: {
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: Z_INDEX.commandPalette,
    width: '560px',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: '480px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    borderRadius: '8px',
    boxShadow: elevationLevel3,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animationName: keyframes.scaleIn,
    animationDuration: TRANSITION_FAST,
    animationFillMode: 'forwards',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  searchIcon: {
    flexShrink: 0,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  searchInput: {
    flex: '1 1 auto',
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    backgroundColor: 'transparent',
    color: HBC_SURFACE_LIGHT['text-primary'],
    '::placeholder': {
      color: HBC_SURFACE_LIGHT['text-muted'],
    },
  },
  shortcutHint: {
    flexShrink: 0,
    fontSize: '0.6875rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    padding: '2px 6px',
    borderRadius: '3px',
  },
  results: {
    flex: '1 1 auto',
    overflowY: 'auto',
    padding: '8px 0',
  },
  categoryLabel: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: HBC_SURFACE_LIGHT['text-muted'],
    padding: '8px 16px 4px',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    transitionProperty: 'background-color',
    transitionDuration: TRANSITION_FAST,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  resultActive: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
  },
  resultIcon: {
    flexShrink: 0,
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  resultLabel: {
    flex: '1 1 auto',
  },
  resultDescription: {
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  aiIndicator: {
    color: HBC_ACCENT_ORANGE,
  },
  offlineNote: {
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    padding: '8px 16px',
    fontStyle: 'italic',
  },
  emptyState: {
    padding: '24px 16px',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  aiResponse: {
    padding: '12px 16px',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    color: HBC_SURFACE_LIGHT['text-primary'],
    borderTop: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    maxHeight: '200px',
    overflowY: 'auto',
  },
});

/** Get recent items from localStorage */
function getRecentItems(): CommandPaletteResult[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Array<{ id: string; label: string; description?: string }>;
    return parsed.slice(0, MAX_RECENT).map((item) => ({
      ...item,
      category: 'recent' as const,
      onSelect: () => {},
    }));
  } catch {
    return [];
  }
}

export const HbcCommandPalette: React.FC<HbcCommandPaletteProps> = ({
  navigationItems = [],
  actionItems = [],
  onAiQuery,
  onSelect,
  className,
}) => {
  const styles = useStyles();
  const { isOpen, close } = useCommandPalette();
  const connectivityStatus = useOnlineStatus();
  const isOnline = connectivityStatus === 'online';

  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // Debounced query
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset state when opened/closed
  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setAiResponse(null);
      setAiLoading(false);
      // Focus input after render
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Build filtered results
  const recentItems = React.useMemo(() => getRecentItems(), [isOpen]);
  const allResults = React.useMemo(() => {
    const lowerQ = debouncedQuery.toLowerCase();
    const filtered: CommandPaletteResult[] = [];

    // Navigation (always available)
    const navMatches = lowerQ
      ? navigationItems.filter((r) => r.label.toLowerCase().includes(lowerQ))
      : navigationItems;
    filtered.push(...navMatches);

    // Recent
    const recentMatches = lowerQ
      ? recentItems.filter((r) => r.label.toLowerCase().includes(lowerQ))
      : recentItems;
    filtered.push(...recentMatches);

    // Actions
    const actionMatches = lowerQ
      ? actionItems.filter((r) => r.label.toLowerCase().includes(lowerQ))
      : actionItems;
    filtered.push(...actionMatches);

    return filtered;
  }, [debouncedQuery, navigationItems, actionItems, recentItems]);

  // Group results by category
  const groupedResults = React.useMemo(() => {
    const groups: Record<string, CommandPaletteResult[]> = {};
    for (const r of allResults) {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    }
    return groups;
  }, [allResults]);

  // Flat list for keyboard nav
  const flatResults = allResults;

  // Clamp activeIndex
  React.useEffect(() => {
    if (activeIndex >= flatResults.length) {
      setActiveIndex(Math.max(0, flatResults.length - 1));
    }
  }, [flatResults.length, activeIndex]);

  const handleSelect = React.useCallback(
    (result: CommandPaletteResult) => {
      onSelect?.(result);
      result.onSelect();
      close();
    },
    [onSelect, close],
  );

  const handleAiQuery = React.useCallback(async () => {
    if (!onAiQuery || !query.trim()) return;
    setAiLoading(true);
    try {
      const response = await onAiQuery(query.trim());
      setAiResponse(response);
    } catch {
      setAiResponse('AI query failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }, [onAiQuery, query]);

  // Keyboard navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatResults[activeIndex]) {
            handleSelect(flatResults[activeIndex]);
          } else if (isOnline && onAiQuery && query.trim()) {
            handleAiQuery();
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    },
    [flatResults, activeIndex, handleSelect, close, isOnline, onAiQuery, query, handleAiQuery],
  );

  if (!isOpen) return null;

  const showAiOption = isOnline && onAiQuery && query.trim() && flatResults.length === 0;

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className={mergeClasses(styles.dialog, className)}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        data-hbc-ui="command-palette"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <Search size="md" />
          </span>
          <input
            ref={inputRef}
            className={styles.searchInput}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or ask AI..."
            aria-label="Search commands"
          />
          <span className={styles.shortcutHint}>ESC</span>
        </div>

        {/* Results */}
        <div className={styles.results} role="listbox" aria-label="Results">
          {Object.entries(groupedResults).map(([category, results]) => (
            <div key={category}>
              <div className={styles.categoryLabel}>
                {CATEGORY_LABELS[category as CommandPaletteCategory] ?? category}
              </div>
              {results.map((result) => {
                const flatIdx = flatResults.indexOf(result);
                return (
                  <div
                    key={result.id}
                    className={mergeClasses(
                      styles.resultItem,
                      flatIdx === activeIndex && styles.resultActive,
                    )}
                    role="option"
                    aria-selected={flatIdx === activeIndex}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                  >
                    <span className={styles.resultIcon}>
                      {result.icon ?? (result.category === 'ai' ? <Star size="sm" /> : null)}
                    </span>
                    <span className={styles.resultLabel}>{result.label}</span>
                    {result.description && (
                      <span className={styles.resultDescription}>{result.description}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* AI query option */}
          {showAiOption && (
            <div
              className={mergeClasses(styles.resultItem)}
              role="option"
              onClick={handleAiQuery}
            >
              <span className={mergeClasses(styles.resultIcon, styles.aiIndicator)}>
                <Star size="sm" />
              </span>
              <span className={styles.resultLabel}>
                Ask AI: &quot;{query}&quot;
              </span>
            </div>
          )}

          {/* Offline note */}
          {!isOnline && onAiQuery && query.trim() && (
            <div className={styles.offlineNote}>
              AI unavailable offline
            </div>
          )}

          {/* Empty state */}
          {flatResults.length === 0 && !showAiOption && !aiResponse && (
            <div className={styles.emptyState}>
              {query ? 'No results found' : 'Start typing to search...'}
            </div>
          )}

          {/* AI loading */}
          {aiLoading && (
            <div className={styles.emptyState}>Thinking...</div>
          )}
        </div>

        {/* AI response panel */}
        {aiResponse && (
          <div className={styles.aiResponse}>
            {aiResponse}
          </div>
        )}
      </div>
    </>
  );
};

export { useCommandPalette } from './hooks/useCommandPalette.js';
export type {
  HbcCommandPaletteProps,
  CommandPaletteResult,
  CommandPaletteCategory,
  UseCommandPaletteReturn,
} from './types.js';
