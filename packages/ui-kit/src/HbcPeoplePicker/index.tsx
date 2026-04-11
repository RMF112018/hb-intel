/**
 * HbcPeoplePicker — Production-grade people selection with Graph live lookup.
 *
 * Governed combobox + chip pattern supporting single-select and multi-select
 * modes, keyboard navigation, loading/empty/disabled/error states,
 * Graph-backed search, avatar/initials rendering, and a `bare` mode for
 * embedding inside consumer-owned label/layout shells.
 *
 * When no searchPeople adapter is provided, falls back to manual UPN entry.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Field } from '@fluentui/react-components';
import { HBC_PRIMARY_BLUE, HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { HBC_RADIUS_SM, HBC_RADIUS_MD } from '../theme/radii.js';
import { elevationLevel2 } from '../theme/elevation.js';
import { label as labelType, body as bodyType, bodySmall } from '../theme/typography.js';
import { TRANSITION_FAST } from '../theme/animations.js';
import { Cancel } from '../icons/index.js';
import type { HbcPeoplePickerProps, PersonEntry, PersonPhotoFn } from './types.js';
import { usePersonPhotoCache } from './usePersonPhotoCache.js';

// ── Avatar helpers ────────────────────────────────────────────────────────

/** Extract up to two initials from a PersonEntry for fallback display. */
function getInitials(person: PersonEntry): string {
  if (person.givenName && person.surname) {
    return `${person.givenName[0]}${person.surname[0]}`.toUpperCase();
  }
  const parts = person.displayName.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

/** Initials circle — governed fallback when photo is unavailable. */
function InitialsAvatar({
  person,
  px,
  fontSize,
}: {
  person: PersonEntry;
  px: number;
  fontSize: string;
}): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px,
        height: px,
        borderRadius: '50%',
        backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
        color: HBC_SURFACE_LIGHT['text-primary'],
        fontSize,
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {getInitials(person)}
    </span>
  );
}

/**
 * Inline avatar circle with photo cache integration.
 *
 * Resolution order:
 *   1. `person.photoUrl` already set → render immediately
 *   2. `getPhoto` cache → fetch via adapter, render when available
 *   3. Fallback → initials circle (missing-photo or no adapter)
 */
function PersonAvatar({
  person,
  size,
  getPhoto,
}: {
  person: PersonEntry;
  size: 'sm' | 'md';
  getPhoto?: (key: string) => { state: string; url?: string };
}): React.JSX.Element {
  const px = size === 'sm' ? 20 : 28;
  const fontSize = size === 'sm' ? '0.5625rem' : '0.6875rem';

  // Prefer pre-set photoUrl (e.g. from static data or pre-fetched)
  const presetUrl = person.photoUrl;

  // Try cache-backed photo fetch if adapter is available
  const photoKey = person.id ?? person.upn;
  const cached = getPhoto?.(photoKey);
  const resolvedUrl = presetUrl ?? cached?.url;

  if (resolvedUrl) {
    return (
      <img
        src={resolvedUrl}
        alt=""
        aria-hidden="true"
        style={{
          width: px,
          height: px,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return <InitialsAvatar person={person} px={px} fontSize={fontSize} />;
}

/** Build a display label for a person — prefers "First Last", falls back to displayName. */
function personDisplayLabel(person: PersonEntry): string {
  if (person.givenName && person.surname) return `${person.givenName} ${person.surname}`;
  return person.displayName;
}

// ── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  container: {
    position: 'relative',
  },
  inputArea: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '4px',
    minHeight: '36px',
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft: '8px',
    paddingRight: '8px',
    borderTopWidth: '1px',
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderRightWidth: '1px',
    borderTopStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderRightStyle: 'solid',
    borderTopColor: HBC_SURFACE_LIGHT['surface-3'],
    borderBottomColor: HBC_SURFACE_LIGHT['surface-3'],
    borderLeftColor: HBC_SURFACE_LIGHT['surface-3'],
    borderRightColor: HBC_SURFACE_LIGHT['surface-3'],
    borderRadius: HBC_RADIUS_MD,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    cursor: 'text',
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: TRANSITION_FAST,
    ':focus-within': {
      borderTopColor: HBC_PRIMARY_BLUE,
      borderBottomColor: HBC_PRIMARY_BLUE,
      borderLeftColor: HBC_PRIMARY_BLUE,
      borderRightColor: HBC_PRIMARY_BLUE,
    },
  },
  inputAreaDisabled: {
    opacity: 0.5,
    cursor: 'default',
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
  },
  inputAreaError: {
    borderTopColor: '#FF4D4D',
    borderBottomColor: '#FF4D4D',
    borderLeftColor: '#FF4D4D',
    borderRightColor: '#FF4D4D',
  },
  searchInput: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: '120px',
    borderTopWidth: '0',
    borderBottomWidth: '0',
    borderLeftWidth: '0',
    borderRightWidth: '0',
    outlineWidth: '0',
    backgroundColor: 'transparent',
    fontSize: bodyType.fontSize,
    lineHeight: '28px',
    color: HBC_SURFACE_LIGHT['text-primary'],
    '::placeholder': {
      color: HBC_SURFACE_LIGHT['text-muted'],
    },
  },

  // ── Chips ──────────────────────────────────────────────────────────
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    maxWidth: '240px',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: '4px',
    paddingRight: '4px',
    borderRadius: HBC_RADIUS_SM,
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    fontSize: bodySmall.fontSize,
    lineHeight: '1.4',
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  chipLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chipRemove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderTopWidth: '0',
    borderBottomWidth: '0',
    borderLeftWidth: '0',
    borderRightWidth: '0',
    borderRadius: HBC_RADIUS_SM,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    paddingTop: '0',
    paddingBottom: '0',
    paddingLeft: '0',
    paddingRight: '0',
    color: HBC_SURFACE_LIGHT['text-muted'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
      color: HBC_SURFACE_LIGHT['text-primary'],
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: HBC_PRIMARY_BLUE,
      outlineOffset: '1px',
    },
  },

  // ── Dropdown ───────────────────────────────────────────────────────
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    marginTop: '4px',
    maxHeight: '240px',
    overflowY: 'auto',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    borderRadius: HBC_RADIUS_MD,
    boxShadow: elevationLevel2,
    zIndex: 1000,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    },
  },
  optionActive: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
  },
  optionText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    minWidth: '0',
  },
  optionName: {
    fontSize: bodyType.fontSize,
    fontWeight: bodyType.fontWeight,
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  optionMeta: {
    fontSize: bodySmall.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusMessage: {
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '12px',
    paddingRight: '12px',
    fontSize: bodySmall.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
    fontStyle: 'italic',
  },
  hint: {
    fontSize: labelType.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginTop: '4px',
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────

function normalizeValue(value: string[] | PersonEntry[]): PersonEntry[] {
  if (value.length === 0) return [];
  if (typeof value[0] === 'string') {
    return (value as string[]).filter(Boolean).map((upn) => ({
      upn,
      displayName: upn,
    }));
  }
  return value as PersonEntry[];
}

// ── Component ─────────────────────────────────────────────────────────────

export const HbcPeoplePicker: React.FC<HbcPeoplePickerProps> = ({
  label,
  value,
  onChange,
  searchPeople,
  mode = 'single',
  placeholder,
  required,
  disabled,
  validationMessage,
  className,
  bare,
  fetchPersonPhoto,
}) => {
  const classes = useStyles();
  const { getPhoto } = usePersonPhotoCache(fetchPersonPhoto);
  const selected = React.useMemo(() => normalizeValue(value), [value]);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<PersonEntry[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = React.useId();

  // Debounced search
  React.useEffect(() => {
    if (!searchPeople || !query || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const hits = await searchPeople(query.trim());
        // Filter out already-selected people
        const selectedUpns = new Set(selected.map((p) => p.upn.toLowerCase()));
        const filtered = hits.filter((h) => !selectedUpns.has(h.upn.toLowerCase()));
        setResults(filtered);
        setIsOpen(true);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchPeople, selected]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectPerson = React.useCallback(
    (person: PersonEntry) => {
      if (mode === 'single') {
        onChange([person]);
      } else {
        onChange([...selected, person]);
      }
      setQuery('');
      setResults([]);
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [mode, selected, onChange],
  );

  const removePerson = React.useCallback(
    (upn: string) => {
      onChange(selected.filter((p) => p.upn !== upn));
      inputRef.current?.focus();
    },
    [selected, onChange],
  );

  // Handle manual UPN entry (fallback when no searchPeople)
  const handleManualEntry = React.useCallback(
    (inputValue: string) => {
      const trimmed = inputValue.trim();
      if (!trimmed || !trimmed.includes('@')) return;

      const person: PersonEntry = { upn: trimmed, displayName: trimmed };
      if (mode === 'single') {
        onChange([person]);
      } else if (!selected.some((p) => p.upn.toLowerCase() === trimmed.toLowerCase())) {
        onChange([...selected, person]);
      }
      setQuery('');
    },
    [mode, selected, onChange],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === 'ArrowDown' && isOpen && results.length > 0) {
        e.preventDefault();
        setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp' && isOpen && results.length > 0) {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (isOpen && activeIndex >= 0 && results[activeIndex]) {
          selectPerson(results[activeIndex]);
        } else if (!searchPeople && query.trim()) {
          handleManualEntry(query);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveIndex(-1);
      } else if (e.key === 'Backspace' && !query && selected.length > 0) {
        removePerson(selected[selected.length - 1].upn);
      }
    },
    [disabled, isOpen, results, activeIndex, query, selected, searchPeople, selectPerson, removePerson, handleManualEntry],
  );

  const showInput = mode === 'multi' || selected.length === 0;
  const defaultPlaceholder = searchPeople
    ? 'Search for a person...'
    : 'Enter email address (e.g. name@hb.com)';

  const inputAreaContent = (
    <>
      <div
        className={mergeClasses(
          classes.inputArea,
          disabled && classes.inputAreaDisabled,
          validationMessage && classes.inputAreaError,
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {selected.map((person) => (
          <span key={person.upn} className={classes.chip}>
            <PersonAvatar person={person} size="sm" getPhoto={getPhoto} />
            <span className={classes.chipLabel} title={person.upn}>
              {personDisplayLabel(person)}
            </span>
            {!disabled && (
              <button
                type="button"
                className={classes.chipRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  removePerson(person.upn);
                }}
                aria-label={`Remove ${personDisplayLabel(person)}`}
                tabIndex={-1}
              >
                <Cancel size="sm" />
              </button>
            )}
          </span>
        ))}
        {showInput && (
          <input
            ref={inputRef}
            type="text"
            className={classes.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selected.length === 0 ? (placeholder ?? defaultPlaceholder) : ''}
            disabled={disabled}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
          />
        )}
      </div>

      {!searchPeople && !disabled && (
        <div className={classes.hint}>
          Type an email address and press Enter to add.
        </div>
      )}

      {/* Dropdown results */}
      {isOpen && (
        <div className={classes.dropdown} id={listboxId} role="listbox" aria-label={`Search results for ${label}`}>
          {isSearching && (
            <div className={classes.statusMessage}>Searching...</div>
          )}
          {!isSearching && results.length === 0 && query.trim().length >= 2 && (
            <div className={classes.statusMessage}>No people found for &ldquo;{query}&rdquo;</div>
          )}
          {results.map((person, index) => (
            <div
              key={person.upn}
              id={`${listboxId}-opt-${index}`}
              className={mergeClasses(
                classes.option,
                index === activeIndex && classes.optionActive,
              )}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => selectPerson(person)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <PersonAvatar person={person} size="md" getPhoto={getPhoto} />
              <div className={classes.optionText}>
                <span className={classes.optionName}>{personDisplayLabel(person)}</span>
                <span className={classes.optionMeta}>
                  {person.upn}
                  {person.jobTitle && ` \u00b7 ${person.jobTitle}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // Bare mode: render only the input area + dropdown, no Field wrapper.
  if (bare) {
    return (
      <div
        ref={containerRef}
        className={mergeClasses(classes.container, className)}
        data-hbc-ui="people-picker"
      >
        {inputAreaContent}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={mergeClasses(classes.container, className)}
      data-hbc-ui="people-picker"
    >
      <Field
        label={label}
        required={required}
        validationMessage={validationMessage}
        validationState={validationMessage ? 'error' : undefined}
      >
        {inputAreaContent}
      </Field>
    </div>
  );
};

export type { HbcPeoplePickerProps, PersonEntry, PeopleSearchFn, PersonPhotoFn, PhotoState, PersonPhotoEntry } from './types.js';
export { useGraphPeopleSearch, createStaticPeopleSearch, rankPeopleResults } from './useGraphPeopleSearch.js';
export { usePersonPhotoCache, createGraphPersonPhotoFn } from './usePersonPhotoCache.js';
