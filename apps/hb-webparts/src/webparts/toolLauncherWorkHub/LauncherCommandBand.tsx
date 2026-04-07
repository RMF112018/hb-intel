/**
 * LauncherCommandBand — Premium command surface with authoritative identity
 * and live search.
 *
 * Phase 11B: Composition re-architecture. Stronger identity region with
 * brand accent, elevated search placement, forceful action buttons, and
 * clearer hierarchy between identity / search / actions.
 *
 * Phase 11D: Premium primitives and surface layer.
 *   - CSS module interactive states (:hover, :focus-visible, :active)
 *     on buttons, search input, and suggestion rows
 *
 * Search behavior preserved from Phase 08-02:
 *   - Live filtering via launcherSearch contract (pre-computed searchText)
 *   - Keyboard: ArrowDown/Up to navigate, Enter to launch, Escape to dismiss
 *   - Suggestion dropdown shows top 6 matches with name + category
 *   - No-match state: "No platforms matching '{query}'"
 */
import * as React from 'react';
import { Search, ExternalLink, Settings, Info } from '@hbc/ui-kit/homepage';
import {
  HP_SPACE,
  HP_RADIUS,
  HP_BORDER,
} from '../../homepage/tokens.js';
import { matchesQuery, type SearchablePlatform } from './launcherSearch.js';
import interactiveStyles from './launcher-interactive.module.css';
import type { ResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';

/* ── Props ───────────────────────────────────────────────────────── */

export interface LauncherCommandBandProps {
  title?: string;
  supportingLine?: string;
  onAllPlatforms?: () => void;
  onNeedHelp?: () => void;
  platformCount?: number;
  featuredCount?: number;
  tier?: ResponsiveTier;
  /** Pre-computed searchable records for inline suggestions. */
  searchable?: SearchablePlatform[];
}

const MAX_SUGGESTIONS = 6;

/* ── Style factories ─────────────────────────────────────────────── */

function getBandStyle(tier: ResponsiveTier): React.CSSProperties {
  const isMobile = tier === 'mobile';
  return {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr auto' : 'auto 1fr auto',
    alignItems: 'center',
    gap: isMobile ? HP_SPACE.lg : HP_SPACE['2xl'],
    padding: isMobile
      ? `${HP_SPACE.lg}px ${HP_SPACE.xl}px`
      : `${HP_SPACE.xl}px ${HP_SPACE['2xl']}px`,
    borderRadius: HP_RADIUS.card,
    background: 'rgba(34,83,145,0.05)',
    border: HP_BORDER.brandAccent,
    minHeight: isMobile ? 44 : 52,
  };
}

const identityStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.lg,
  minWidth: 0,
};

const identityIconContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: HP_RADIUS.command,
  background: 'rgba(34,83,145,0.08)',
  flexShrink: 0,
};

const identityTextStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  minWidth: 0,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 700,
  letterSpacing: '0.01em',
  color: 'rgba(0,0,0,0.85)',
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

const searchWrapperStyle: React.CSSProperties = {
  position: 'relative',
  minWidth: 0,
  maxWidth: 360,
  flex: 1,
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: `${HP_SPACE.md}px ${HP_SPACE.xl}px ${HP_SPACE.md}px 36px`,
  borderRadius: HP_RADIUS.card,
  border: HP_BORDER.subtle,
  background: 'rgba(255,255,255,0.8)',
  fontSize: '0.8rem',
  color: 'rgba(0,0,0,0.8)',
  outline: 'none',
};

const searchIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  color: 'rgba(34,83,145,0.4)',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: 4,
  zIndex: 50,
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.card,
  background: 'rgba(255,255,255,0.99)',
  boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
  maxHeight: 260,
  overflowY: 'auto',
};

const suggestionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: HP_SPACE.md,
  padding: `${HP_SPACE.md}px ${HP_SPACE.xl}px`,
  fontSize: '0.78rem',
  color: 'rgba(0,0,0,0.75)',
  textDecoration: 'none',
  cursor: 'pointer',
};

const suggestionActiveStyle: React.CSSProperties = {
  ...suggestionStyle,
  background: 'rgba(34,83,145,0.06)',
};

const suggestionNameStyle: React.CSSProperties = {
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
};

const suggestionCategoryStyle: React.CSSProperties = {
  fontSize: '0.67rem',
  color: 'rgba(0,0,0,0.38)',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const noMatchStyle: React.CSSProperties = {
  padding: `${HP_SPACE.xl}px`,
  fontSize: '0.76rem',
  color: 'rgba(0,0,0,0.4)',
  textAlign: 'center',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
  flexShrink: 0,
};

const actionButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: HP_SPACE.xs,
  padding: `${HP_SPACE.sm}px ${HP_SPACE.xl}px`,
  borderRadius: HP_RADIUS.command,
  border: HP_BORDER.subtle,
  background: 'rgba(255,255,255,0.7)',
  fontSize: '0.74rem',
  fontWeight: 600,
  color: '#225391',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherCommandBand({
  title = 'Work Hub',
  supportingLine,
  onAllPlatforms,
  onNeedHelp,
  platformCount,
  featuredCount,
  tier = 'desktop',
  searchable = [],
}: LauncherCommandBandProps): React.JSX.Element {
  const isMobile = tier === 'mobile';
  const [query, setQuery] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Compute suggestions from search contract
  const suggestions = React.useMemo(() => {
    if (!query.trim() || searchable.length === 0) return [];
    return searchable
      .filter((sp) => matchesQuery(sp, query))
      .slice(0, MAX_SUGGESTIONS);
  }, [query, searchable]);

  const hasQuery = query.trim().length > 0;

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setShowDropdown(true);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || !hasQuery) {
      if (e.key === 'Escape') {
        setQuery('');
        setShowDropdown(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          const target = suggestions[activeIndex].record;
          window.open(target.launchUrl, target.openInNewTab ? '_blank' : '_self');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setQuery('');
        inputRef.current?.focus();
        break;
    }
  }

  function handleBlur() {
    // Delay to allow click on suggestion before blur hides dropdown
    setTimeout(() => setShowDropdown(false), 150);
  }

  // Supporting line
  let effectiveSupportingLine = supportingLine;
  if (!effectiveSupportingLine) {
    const parts: string[] = [];
    if (typeof platformCount === 'number' && platformCount > 0) {
      parts.push(`${platformCount} platform${platformCount === 1 ? '' : 's'}`);
    }
    if (typeof featuredCount === 'number' && featuredCount > 0) {
      parts.push(`${featuredCount} featured`);
    }
    if (parts.length > 0) {
      effectiveSupportingLine = isMobile
        ? parts.join(' · ')
        : `${parts.join(' · ')} · Launch the systems your team uses every day`;
    } else {
      effectiveSupportingLine = isMobile ? '' : 'Launch the systems your team uses every day';
    }
  }

  return (
    <div style={getBandStyle(tier)} role="toolbar" aria-label={`${title} command band`}>
      {/* Left: identity with icon */}
      <div style={identityStyle}>
        {!isMobile && (
          <div style={identityIconContainerStyle}>
            <Settings size={16} strokeWidth={1.8} color="#225391" />
          </div>
        )}
        <div style={identityTextStyle}>
          <h3 style={titleStyle}>{title}</h3>
          {effectiveSupportingLine && (
            <p style={supportingLineStyle}>{effectiveSupportingLine}</p>
          )}
        </div>
      </div>

      {/* Center: search with inline suggestions (hidden on mobile) */}
      {!isMobile && (
        <div style={searchWrapperStyle}>
          <Search size={15} strokeWidth={2} style={searchIconStyle} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search platforms..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => hasQuery && setShowDropdown(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-label="Search platforms"
            aria-expanded={showDropdown && hasQuery}
            aria-haspopup="listbox"
            role="combobox"
            aria-autocomplete="list"
            className={interactiveStyles.commandSearchInput}
            style={searchInputStyle}
          />

          {/* Suggestion dropdown */}
          {showDropdown && hasQuery && (
            <div style={dropdownStyle} role="listbox" aria-label="Platform suggestions">
              {suggestions.length === 0 ? (
                <div style={noMatchStyle}>
                  No platforms matching &ldquo;{query}&rdquo;
                </div>
              ) : (
                suggestions.map((sp, i) => (
                  <a
                    key={sp.record.platformKey}
                    href={sp.record.launchUrl}
                    target={sp.record.openInNewTab ? '_blank' : undefined}
                    rel={sp.record.openInNewTab ? 'noopener noreferrer' : undefined}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={interactiveStyles.suggestion}
                    style={i === activeIndex ? suggestionActiveStyle : suggestionStyle}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span style={suggestionNameStyle}>{sp.record.name}</span>
                    {sp.record.category && (
                      <span style={suggestionCategoryStyle}>{sp.record.category}</span>
                    )}
                    <ExternalLink size={11} strokeWidth={1.8} color="rgba(0,0,0,0.25)" />
                  </a>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Right: utility actions */}
      <div style={actionsStyle}>
        <button
          type="button"
          className={interactiveStyles.commandButton}
          style={actionButtonStyle}
          onClick={onAllPlatforms}
          disabled={!onAllPlatforms}
          aria-label="View all platforms"
        >
          <Settings size={13} strokeWidth={2} />
          All Platforms
        </button>
        {!isMobile && (
          <button
            type="button"
            className={interactiveStyles.commandButton}
            style={actionButtonStyle}
            onClick={onNeedHelp}
            disabled={!onNeedHelp}
            aria-label="Get help with platforms"
          >
            <Info size={13} strokeWidth={2} />
            Need Help
          </button>
        )}
      </div>
    </div>
  );
}
