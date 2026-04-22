import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { HbcTypography } from '@hbc/ui-kit';
import {
  applyProjectSitesPipeline,
  EMPTY_FILTERS,
  SCOPE_ALL,
  useProjectSites,
  type IProjectSiteEntry,
  type ProjectSiteSourceClassification,
} from '@hbc/spfx/project-sites';
import type { ProjectSourceClassification } from '@hbc/features-safety';

/**
 * SafetyProjectPicker — Phase-04 audit G-03 Wave 2 revision.
 *
 * Governed project picker for the Safety Upload intake runway. Operators
 * search by project name or project number and commit to a selection;
 * the selected project populates authoritative ProjectNumber writes in
 * the Safety ingestion pipeline.
 *
 * Grounded behavior: search + merge logic is imported directly from
 * `@hbc/spfx/project-sites` (`applyProjectSitesPipeline`,
 * `useProjectSites`, `SCOPE_ALL`, `EMPTY_FILTERS`). The picker and the
 * project-sites grid therefore run the same multi-token AND-match over
 * the same merged Projects + Legacy Fallback Registry corpus, and the
 * same deterministic precedence. No new search variant is introduced.
 *
 * Safety-local composition: not promoted to `@hbc/ui-kit`. If a second
 * consumer needs a searchable combobox, promote then — do not duplicate.
 */

export type SafetyProjectPickerValue = IProjectSiteEntry;

export interface SafetyProjectPickerProps {
  readonly id?: string;
  readonly label: ReactNode;
  readonly helpText?: ReactNode;
  readonly errorText?: ReactNode;
  readonly placeholder?: string;
  readonly selected: SafetyProjectPickerValue | null;
  readonly onSelect: (entry: SafetyProjectPickerValue | null) => void;
  readonly disabled?: boolean;
  /** Maximum number of match rows displayed in the dropdown. */
  readonly maxResults?: number;
}

/**
 * Map the project-sites classification (`project-only | merged |
 * legacy-only`) to the Safety domain classification (`project |
 * project+legacy | legacy-only | unresolved`). Authority-preserving
 * boundary mapping — the operator's choice survives verbatim.
 */
export function toSafetyProjectSourceClassification(
  value: ProjectSiteSourceClassification,
): ProjectSourceClassification {
  switch (value) {
    case 'project-only':
      return 'project';
    case 'merged':
      return 'project+legacy';
    case 'legacy-only':
      return 'legacy-only';
  }
}

const DEFAULT_MAX_RESULTS = 20;

export function SafetyProjectPicker({
  id,
  label,
  helpText,
  errorText,
  placeholder = 'Search by project name or number…',
  selected,
  onSelect,
  disabled,
  maxResults = DEFAULT_MAX_RESULTS,
}: SafetyProjectPickerProps): ReactNode {
  const generatedId = useId();
  const rootId = id ?? generatedId;
  const inputId = `${rootId}-input`;
  const listboxId = `${rootId}-listbox`;
  const helpId = helpText ? `${rootId}-help` : undefined;
  const errorId = errorText ? `${rootId}-error` : undefined;

  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const projectSitesResult = useProjectSites(SCOPE_ALL);

  const matches = useMemo<IProjectSiteEntry[]>(() => {
    if (!projectSitesResult || projectSitesResult.status !== 'success') return [];
    const filtered = applyProjectSitesPipeline({
      entries: projectSitesResult.entries,
      searchTerm: query,
      sortKey: 'number-asc',
      filters: EMPTY_FILTERS,
    });
    return filtered.slice(0, maxResults);
  }, [projectSitesResult, query, maxResults]);

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return;
    const handle = (event: MouseEvent): void => {
      const root = rootRef.current;
      if (root && !root.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [isOpen]);

  // Clamp highlight when match set changes.
  useEffect(() => {
    if (highlightedIndex >= matches.length) {
      setHighlightedIndex(matches.length > 0 ? matches.length - 1 : 0);
    }
  }, [matches.length, highlightedIndex]);

  const handleSelect = useCallback(
    (entry: IProjectSiteEntry): void => {
      onSelect(entry);
      setQuery('');
      setIsOpen(false);
    },
    [onSelect],
  );

  const handleClear = useCallback((): void => {
    onSelect(null);
    setQuery('');
    setIsOpen(false);
  }, [onSelect]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (disabled) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          matches.length === 0 ? 0 : Math.min(prev + 1, matches.length - 1),
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter') {
        if (!isOpen) return;
        event.preventDefault();
        const entry = matches[highlightedIndex];
        if (entry) handleSelect(entry);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }
    },
    [disabled, matches, highlightedIndex, isOpen, handleSelect],
  );

  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;
  const isLoading = projectSitesResult?.status === 'loading';
  const isError = projectSitesResult?.status === 'error';

  return (
    <div
      ref={rootRef}
      className="safety-project-picker"
      data-safety-ui="project-picker"
    >
      <label htmlFor={inputId} className="safety-project-picker__label">
        <HbcTypography intent="label">{label}</HbcTypography>
      </label>

      {selected && (
        <div
          className="safety-project-picker__selected"
          data-safety-ui="project-picker-selected"
          role="group"
          aria-label="Selected project"
        >
          <div className="safety-project-picker__selected-main">
            <HbcTypography intent="body" as="span">
              <strong>{selected.projectName || '(Unnamed project)'}</strong>
              {selected.projectNumber ? ` · ${selected.projectNumber}` : ''}
            </HbcTypography>
          </div>
          <div className="safety-project-picker__selected-meta">
            <HbcTypography intent="bodySmall">
              {[selected.clientName, selected.projectStage, selected.projectLocation]
                .filter(Boolean)
                .join(' · ') || 'No additional context on file.'}
            </HbcTypography>
          </div>
          <button
            type="button"
            className="safety-project-picker__clear"
            onClick={handleClear}
            disabled={disabled}
          >
            Change project
          </button>
        </div>
      )}

      {!selected && (
        <div
          role="combobox"
          aria-expanded={isOpen}
          aria-owns={listboxId}
          aria-haspopup="listbox"
          className="safety-project-picker__combobox"
        >
          {/*
           * Governed Safety primitive: the combobox pattern requires
           * aria-activedescendant, aria-autocomplete, aria-controls, and
           * direct keydown handling that HbcTextField does not expose.
           * Scoped raw <input> inside a governed primitive, matching the
           * SafetyFileInput precedent.
           */}
          {/* eslint-disable-next-line @hb-intel/hbc/no-raw-form-elements */}
          <input
            id={inputId}
            type="text"
            className="safety-project-picker__input"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isError}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              isOpen && matches[highlightedIndex]
                ? `${rootId}-option-${highlightedIndex}`
                : undefined
            }
            aria-describedby={describedBy}
            aria-invalid={errorText ? true : undefined}
            aria-errormessage={errorId}
          />
          {isOpen && (
            <ul
              id={listboxId}
              role="listbox"
              className="safety-project-picker__listbox"
              aria-label="Project search results"
            >
              {isLoading && (
                <li className="safety-project-picker__status" role="option" aria-selected={false} aria-disabled={true}>
                  <HbcTypography intent="bodySmall">Loading projects…</HbcTypography>
                </li>
              )}
              {isError && (
                <li className="safety-project-picker__status" role="option" aria-selected={false} aria-disabled={true}>
                  <HbcTypography intent="bodySmall">
                    Project list unavailable. {projectSitesResult?.errorMessage ?? ''}
                  </HbcTypography>
                </li>
              )}
              {!isLoading && !isError && matches.length === 0 && (
                <li className="safety-project-picker__status" role="option" aria-selected={false} aria-disabled={true}>
                  <HbcTypography intent="bodySmall">
                    {query
                      ? 'No matching projects. Try another term.'
                      : 'Start typing to search projects.'}
                  </HbcTypography>
                </li>
              )}
              {!isLoading &&
                !isError &&
                matches.map((entry, index) => (
                  <li
                    key={entry.recordKey}
                    id={`${rootId}-option-${index}`}
                    role="option"
                    aria-selected={index === highlightedIndex}
                    className="safety-project-picker__option"
                    data-highlighted={index === highlightedIndex}
                    data-source-classification={entry.sourceClassification}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSelect(entry);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="safety-project-picker__option-primary">
                      <HbcTypography intent="body" as="span">
                        <strong>{entry.projectName || '(Unnamed project)'}</strong>
                        {entry.projectNumber ? ` · ${entry.projectNumber}` : ''}
                      </HbcTypography>
                    </div>
                    <div className="safety-project-picker__option-secondary">
                      <HbcTypography intent="bodySmall">
                        {buildSecondaryLine(entry)}
                      </HbcTypography>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {helpText && (
        <div id={helpId} className="safety-project-picker__help">
          <HbcTypography intent="bodySmall">{helpText}</HbcTypography>
        </div>
      )}
      {errorText && (
        <div
          id={errorId}
          className="safety-project-picker__error"
          role="alert"
        >
          <HbcTypography intent="bodySmall">{errorText}</HbcTypography>
        </div>
      )}
    </div>
  );
}

function buildSecondaryLine(entry: IProjectSiteEntry): string {
  const parts: string[] = [];
  if (entry.clientName) parts.push(entry.clientName);
  if (entry.projectStage) parts.push(entry.projectStage);
  if (entry.projectLocation) parts.push(entry.projectLocation);
  if (entry.year) parts.push(String(entry.year));
  if (entry.sourceClassification === 'legacy-only') parts.push('Legacy');
  return parts.join(' · ');
}
