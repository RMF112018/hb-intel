/**
 * Searchable project lookup used by the Article Publisher metadata
 * panel. Replaces the pair of manual `Project ID` / `Project name`
 * text inputs with a single authoritative selector backed by the
 * HBCentral `Projects` list.
 *
 * Phase-14 Wave-01 Prompt-03 redesign: the selected, search-result,
 * empty, loading, no-results, and error states are now rebuilt as
 * an editorial selection surface. Project name leads; project number
 * and location form the editorial subtitle. Raw internal project
 * identifiers are demoted into a collapsed `System identifiers`
 * `<details>` block on the selected chip — they remain available for
 * debugging but never lead the author-facing surface.
 *
 * Feature-local composition; only consumed from `ArticlePublisher.tsx`.
 * The combobox keeps WAI-ARIA editable-combobox semantics
 * (`role="combobox"`, `aria-autocomplete="list"`, `aria-haspopup`,
 * `aria-expanded`, `aria-controls`, `aria-activedescendant`).
 */
import * as React from 'react';
import type {
  ProjectLookupEntry,
  ProjectLookupSearchFn,
} from '../../data/publisherAdapter/projectsLookupSource.js';
import styles from './article-publisher.module.css';

export interface ProjectPickerProps {
  readonly value: ProjectPickerValue | null;
  readonly onChange: (next: ProjectLookupEntry | null) => void;
  readonly searchProjects: ProjectLookupSearchFn;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

/**
 * Minimum shape needed to render the currently selected project chip.
 * Exposed so callers that only have `ProjectId` / `ProjectName` from
 * a loaded article row can still show the selection without having
 * re-run the lookup.
 */
export interface ProjectPickerValue {
  readonly projectId: string;
  readonly projectName: string;
  readonly projectNumber?: string;
  readonly projectLocation?: string;
}

const SEARCH_DEBOUNCE_MS = 300;

export function ProjectPicker(props: ProjectPickerProps): JSX.Element {
  const { value, onChange, searchProjects, placeholder, disabled } = props;

  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<ProjectLookupEntry[]>([]);
  const [status, setStatus] = React.useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setStatus('idle');
      setError(undefined);
      return;
    }
    const controller = new AbortController();
    setStatus('loading');
    setError(undefined);
    const handle = window.setTimeout(async () => {
      try {
        const next = await searchProjects(trimmed, controller.signal);
        if (controller.signal.aborted) return;
        setResults(next);
        setActiveIndex(0);
        setStatus('ready');
      } catch (err) {
        if (controller.signal.aborted) return;
        setResults([]);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Project search failed');
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [query, searchProjects]);

  React.useEffect(() => {
    if (!open) return undefined;
    function handleDocumentClick(ev: MouseEvent) {
      const node = containerRef.current;
      if (node && ev.target instanceof Node && !node.contains(ev.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [open]);

  const handleSelect = React.useCallback(
    (entry: ProjectLookupEntry) => {
      onChange(entry);
      setQuery('');
      setResults([]);
      setStatus('idle');
      setOpen(false);
    },
    [onChange],
  );

  const handleClear = React.useCallback(() => {
    onChange(null);
    setQuery('');
    setResults([]);
    setStatus('idle');
    setOpen(true);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = React.useCallback(
    (ev: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open && ev.key !== 'Escape') setOpen(true);
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (ev.key === 'Home') {
        if (results.length > 0) {
          ev.preventDefault();
          setActiveIndex(0);
        }
      } else if (ev.key === 'End') {
        if (results.length > 0) {
          ev.preventDefault();
          setActiveIndex(results.length - 1);
        }
      } else if (ev.key === 'Enter') {
        if (results.length > 0 && activeIndex < results.length) {
          ev.preventDefault();
          handleSelect(results[activeIndex]);
        }
      } else if (ev.key === 'Escape') {
        setOpen(false);
      }
    },
    [open, results, activeIndex, handleSelect],
  );

  // Keep the active option scrolled into view so keyboard-only users
  // never chase it off the dropdown. Only the active option scrolls;
  // the input stays put.
  const activeOptionRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const node = activeOptionRef.current;
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, results.length]);

  const showDropdown = open && !disabled && query.trim().length > 0;
  const LISTBOX_ID = 'project-picker-listbox';
  const optionId = (index: number) => `${LISTBOX_ID}-option-${index}`;
  const activeOptionId =
    showDropdown && status === 'ready' && results.length > 0 && activeIndex < results.length
      ? optionId(activeIndex)
      : undefined;

  return (
    <div className={styles.projectPicker} ref={containerRef}>
      {value ? (
        <SelectedProjectChip
          value={value}
          onChange={!disabled ? handleClear : undefined}
        />
      ) : (
        <>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            value={query}
            disabled={disabled}
            placeholder={placeholder ?? 'Search by project number, name, or location…'}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={showDropdown}
            aria-controls={LISTBOX_ID}
            aria-activedescendant={activeOptionId}
          />
          {!query.trim() && open && !disabled && (
            <p className={styles.projectPickerEmptyHint}>
              Bind this article to a project — search by number, name, or
              location. The selection drives the team heading, the hero
              category, and promotion eligibility.
            </p>
          )}
          {showDropdown && (
            <div
              id={LISTBOX_ID}
              role="listbox"
              aria-label="Project search results"
              className={styles.projectPickerDropdown}
            >
              {status === 'loading' && (
                <div className={styles.projectPickerHint} role="status" aria-live="polite">
                  <span className={styles.projectPickerSpinner} aria-hidden="true" />
                  <span>Searching HBCentral for “{query.trim()}”…</span>
                </div>
              )}
              {status === 'error' && (
                <div className={styles.projectPickerError} role="alert">
                  <strong>Project lookup is temporarily unavailable.</strong>
                  <span>
                    Check your connection to HBCentral and try again.
                    {error ? (
                      <span className={styles.projectPickerErrorDetail}> ({error})</span>
                    ) : null}
                  </span>
                </div>
              )}
              {status === 'ready' && results.length === 0 && (
                <div className={styles.projectPickerHint} role="status" aria-live="polite">
                  No projects match “{query.trim()}”. Try a project number or a
                  partial name.
                </div>
              )}
              {results.length > 0 && (
                <div className={styles.projectPickerResultCount} aria-live="polite">
                  {results.length === 1
                    ? '1 project matches.'
                    : `${results.length} projects match.`}
                </div>
              )}
              {results.map((entry, index) => (
                <div
                  key={entry.projectId}
                  id={optionId(index)}
                  ref={index === activeIndex ? activeOptionRef : undefined}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={
                    index === activeIndex
                      ? `${styles.projectPickerOption} ${styles.projectPickerOptionActive}`
                      : styles.projectPickerOption
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={() => handleSelect(entry)}
                >
                  <span className={styles.projectPickerOptionName}>
                    {entry.projectName}
                  </span>
                  <span className={styles.projectPickerOptionMeta}>
                    {[
                      entry.projectNumber,
                      entry.projectLocation,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'No number or location on file'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Selected chip ────────────────────────────────────────────────
 *
 * Two-tier editorial presentation: project name leads, then a meta
 * line for project number and location. Raw internal `projectId`
 * sits behind a collapsed `<details>` "System identifiers" block so
 * it never competes with the editorial framing but is still available
 * for diagnostics.
 */

export function SelectedProjectChip({
  value,
  onChange,
}: {
  value: ProjectPickerValue;
  onChange?: () => void;
}): JSX.Element {
  const metaParts = [value.projectNumber, value.projectLocation].filter(Boolean);
  return (
    <div className={styles.projectPickerChip} data-testid="project-picker-chip">
      <div className={styles.projectPickerChipMain}>
        <span className={styles.projectPickerChipName}>{value.projectName}</span>
        {metaParts.length > 0 && (
          <span className={styles.projectPickerChipMeta}>
            {metaParts.join(' · ')}
          </span>
        )}
        <details className={styles.projectPickerChipDetails}>
          <summary className={styles.projectPickerChipDetailsSummary}>
            System identifiers
          </summary>
          <span className={styles.projectPickerChipDetailsRow}>
            ID {value.projectId}
          </span>
        </details>
      </div>
      {onChange && (
        <button
          type="button"
          className={styles.projectPickerClear}
          onClick={onChange}
          aria-label="Change selected project"
        >
          Change
        </button>
      )}
    </div>
  );
}
