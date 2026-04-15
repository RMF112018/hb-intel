/**
 * Searchable project lookup used by the Article Publisher metadata
 * panel. Replaces the pair of manual `Project ID` / `Project name`
 * text inputs with a single authoritative selector backed by the
 * HBCentral `Projects` list.
 *
 * This is a feature-local composition — it is only consumed from
 * `ArticlePublisher.tsx` and deliberately uses the operational
 * admin-surface styling already defined in `article-publisher.module.css`
 * rather than inventing a new reusable visual primitive. If a second
 * consumer ever needs the picker, the component can be promoted to
 * `@hbc/ui-kit` without changing its contract.
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

  // Debounced remote search
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

  // Close the dropdown on outside click
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
        <div className={styles.projectPickerChip} data-testid="project-picker-chip">
          <div className={styles.projectPickerChipMain}>
            <span className={styles.projectPickerChipName}>{value.projectName}</span>
            <span className={styles.projectPickerChipMeta}>
              {value.projectNumber ? `${value.projectNumber} · ` : ''}
              ID {value.projectId}
              {value.projectLocation ? ` · ${value.projectLocation}` : ''}
            </span>
          </div>
          {!disabled && (
            <button
              type="button"
              className={styles.projectPickerClear}
              onClick={handleClear}
              aria-label="Clear selected project"
            >
              Change
            </button>
          )}
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            value={query}
            disabled={disabled}
            placeholder={placeholder ?? 'Search projects by name or number…'}
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
          {showDropdown && (
            <div
              id={LISTBOX_ID}
              role="listbox"
              aria-label="Project search results"
              className={styles.projectPickerDropdown}
            >
              {status === 'loading' && (
                <div className={styles.projectPickerHint} role="status" aria-live="polite">
                  Searching…
                </div>
              )}
              {status === 'error' && (
                <div className={styles.projectPickerError} role="alert">
                  Project lookup is temporarily unavailable. Check your connection
                  to HBCentral and try again.
                  {error ? <span className={styles.projectPickerErrorDetail}> ({error})</span> : null}
                </div>
              )}
              {status === 'ready' && results.length === 0 && (
                <div className={styles.projectPickerHint} role="status" aria-live="polite">
                  No projects match “{query.trim()}”. Try a project number or a
                  partial name.
                </div>
              )}
              {results.map((entry, index) => (
                <div
                  key={entry.projectId}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={
                    index === activeIndex
                      ? `${styles.projectPickerOption} ${styles.projectPickerOptionActive}`
                      : styles.projectPickerOption
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => {
                    // Prevent input blur before click fires selection.
                    e.preventDefault();
                  }}
                  onClick={() => handleSelect(entry)}
                >
                  <span className={styles.projectPickerOptionName}>
                    {entry.projectName}
                  </span>
                  <span className={styles.projectPickerOptionMeta}>
                    {entry.projectNumber ? `${entry.projectNumber} · ` : ''}
                    ID {entry.projectId}
                    {entry.projectLocation ? ` · ${entry.projectLocation}` : ''}
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
