/**
 * DraftQueue — left-rail drafts queue with search, friendly
 * metadata, and collapsible state-grouped rows.
 * Workstream-g step-02.
 *
 * Extracts the rail out of ArticlePublisher.tsx so the queue is
 * owned by its own module and can evolve independently.
 */

import * as React from 'react';
import type {
  PublisherArticleRow,
  WorkflowState,
} from '../../../homepage/data/publisherAdapter/index.js';
import {
  articleContentTypeLabel,
  draftGroupEmptyCopy,
  draftGroupLabel,
} from '../authorLabels.js';
import { authorAttribution } from './authorAttribution.js';
import { humaniseAge } from './humaniseAge.js';
import { highlightMatches, matchesDraftQuery } from './draftFilter.js';
import {
  assessDraftCompleteness,
  rollupGroupCompleteness,
  type DraftCompleteness,
} from './draftCompleteness.js';
import { EditorialChip } from '../sharedChrome/index.js';
import styles from './draftQueue.module.css';

export interface DraftQueueProps {
  readonly groupOrder: readonly WorkflowState[];
  readonly groups: Record<WorkflowState, readonly PublisherArticleRow[]>;
  readonly selectedArticleId: string | undefined;
  readonly onSelect: (articleId: string) => void;
  readonly actorEmail?: string;
  readonly loading: boolean;
  readonly error?: string;
  readonly defaultCollapsed: ReadonlySet<WorkflowState>;
}

const SEARCH_STORAGE_KEY = 'hb-publisher:draftQueue.search';
const COLLAPSED_STORAGE_KEY = 'hb-publisher:draftQueue.collapsed';
const SEARCH_DEBOUNCE_MS = 150;

export function DraftQueue({
  groupOrder,
  groups,
  selectedArticleId,
  onSelect,
  actorEmail,
  loading,
  error,
  defaultCollapsed,
}: DraftQueueProps): React.JSX.Element {
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const activeRowRef = React.useRef<HTMLButtonElement | null>(null);
  const [rawQuery, setRawQuery] = React.useState<string>(() => readPersistedQuery());
  const [query, setQuery] = React.useState(rawQuery);
  const [collapsed, setCollapsed] = React.useState<ReadonlySet<WorkflowState>>(
    () => readPersistedCollapsed(defaultCollapsed),
  );
  const now = React.useMemo(() => new Date(), []);

  // Auto-expand the group that contains the selected article so a
  // reload or deep-link lands with the selected row visible.
  React.useEffect(() => {
    if (!selectedArticleId) return;
    for (const state of groupOrder) {
      const rows = groups[state] ?? [];
      if (rows.some((r) => r.ArticleId === selectedArticleId)) {
        setCollapsed((prev) => {
          if (!prev.has(state)) return prev;
          const next = new Set(prev);
          next.delete(state);
          return next;
        });
        break;
      }
    }
  }, [selectedArticleId, groupOrder, groups]);

  // Scroll the active row into view when selection changes so
  // queue-to-editor handoff lands with the row on screen.
  React.useEffect(() => {
    if (!selectedArticleId) return;
    activeRowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedArticleId]);

  // Debounce the active query. 150ms is imperceptible during
  // typing but collapses three+ keystrokes into a single filter
  // pass on long queues.
  React.useEffect(() => {
    const handle = window.setTimeout(() => setQuery(rawQuery), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [rawQuery]);

  // Persist search across reloads.
  React.useEffect(() => {
    try {
      if (rawQuery.length === 0) {
        window.sessionStorage.removeItem(SEARCH_STORAGE_KEY);
      } else {
        window.sessionStorage.setItem(SEARCH_STORAGE_KEY, rawQuery);
      }
    } catch {
      // sessionStorage may be unavailable (tests, locked-down
      // browsers). Swallow — search still works this session.
    }
  }, [rawQuery]);

  // Persist collapsed-group state across reloads so author-chosen
  // queue layout survives a page refresh.
  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(
        COLLAPSED_STORAGE_KEY,
        JSON.stringify(Array.from(collapsed)),
      );
    } catch {
      // sessionStorage may be unavailable — swallow.
    }
  }, [collapsed]);

  const activeQuery = query;
  const visibleRowsFlat = React.useMemo(() => {
    const flat: PublisherArticleRow[] = [];
    for (const state of groupOrder) {
      if (collapsed.has(state)) continue;
      const rows = groups[state] ?? [];
      for (const r of rows) {
        if (!activeQuery || matchesDraftQuery(r, activeQuery)) flat.push(r);
      }
    }
    return flat;
  }, [activeQuery, collapsed, groupOrder, groups]);

  // Keyboard navigation across the visible (filtered + expanded)
  // rows. `/` focuses search; Up/Down cycles through rows even
  // when focus is in the search input so authors can flick
  // between drafts without leaving the keyboard.
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      if (visibleRowsFlat.length === 0) return;
      e.preventDefault();
      const currentIdx = visibleRowsFlat.findIndex(
        (r) => r.ArticleId === selectedArticleId,
      );
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      const nextIdx =
        currentIdx < 0
          ? e.key === 'ArrowDown'
            ? 0
            : visibleRowsFlat.length - 1
          : Math.max(0, Math.min(visibleRowsFlat.length - 1, currentIdx + delta));
      const next = visibleRowsFlat[nextIdx];
      if (next && next.ArticleId !== selectedArticleId) {
        onSelect(next.ArticleId);
      }
    },
    [onSelect, selectedArticleId, visibleRowsFlat],
  );

  const toggleCollapsed = (state: WorkflowState) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });

  const filteredGroups = React.useMemo(() => {
    const out: Partial<Record<WorkflowState, readonly PublisherArticleRow[]>> = {};
    for (const state of groupOrder) {
      const rows = groups[state] ?? [];
      out[state] = activeQuery
        ? rows.filter((r) => matchesDraftQuery(r, activeQuery))
        : rows;
    }
    return out as Record<WorkflowState, readonly PublisherArticleRow[]>;
  }, [activeQuery, groupOrder, groups]);

  const totalMatches = groupOrder.reduce(
    (sum, state) => sum + filteredGroups[state].length,
    0,
  );
  const hasQuery = activeQuery.trim().length > 0;

  return (
    <div className={styles.root} onKeyDown={handleKeyDown}>
      <div className={styles.searchRow}>
        <input
          ref={searchInputRef}
          type="search"
          className={styles.searchInput}
          placeholder="Search drafts (press / to focus)"
          aria-label="Search drafts"
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && rawQuery.length > 0) {
              e.preventDefault();
              setRawQuery('');
            }
          }}
        />
      </div>

      {loading && <p className={styles.loading}>Loading drafts…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && hasQuery && totalMatches === 0 && (
        <p className={styles.empty}>
          No drafts match “{activeQuery}”. Clear the search to see everything.
        </p>
      )}

      {!loading && !error && (
        <div className={styles.groupList}>
          {groupOrder.map((state) => {
            const rows = filteredGroups[state];
            if (hasQuery && rows.length === 0) return null;
            const isCollapsed = collapsed.has(state);
            const groupHeaderId = `draft-group-${state}`;
            const groupListId = `draft-group-list-${state}`;
            return (
              <section
                key={state}
                className={styles.group}
                aria-labelledby={groupHeaderId}
              >
                <button
                  type="button"
                  id={groupHeaderId}
                  className={styles.groupHeader}
                  aria-expanded={!isCollapsed}
                  aria-controls={groupListId}
                  onClick={() => toggleCollapsed(state)}
                >
                  <span className={styles.groupLabel}>{draftGroupLabel(state)}</span>
                  <GroupCounts rows={rows} />
                </button>
                {!isCollapsed && (
                  <div id={groupListId}>
                    {rows.length === 0 ? (
                      <p className={styles.groupEmpty}>{draftGroupEmptyCopy(state)}</p>
                    ) : (
                      <ul className={styles.list}>
                        {rows.map((a) => (
                          <DraftRow
                            key={a.ArticleId}
                            row={a}
                            active={a.ArticleId === selectedArticleId}
                            onSelect={onSelect}
                            actorEmail={actorEmail}
                            query={activeQuery}
                            now={now}
                            activeRef={
                              a.ArticleId === selectedArticleId ? activeRowRef : undefined
                            }
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface DraftRowProps {
  readonly row: PublisherArticleRow;
  readonly active: boolean;
  readonly onSelect: (articleId: string) => void;
  readonly actorEmail: string | undefined;
  readonly query: string;
  readonly now: Date;
  readonly activeRef?: React.MutableRefObject<HTMLButtonElement | null>;
}

function DraftRow({
  row,
  active,
  onSelect,
  actorEmail,
  query,
  now,
  activeRef,
}: DraftRowProps): React.JSX.Element {
  const title = row.Title?.trim() || 'Untitled draft';
  const project = row.ProjectName?.trim() || 'No project linked yet';
  const contentType = row.ArticleContentType
    ? articleContentTypeLabel(row.ArticleContentType)
    : undefined;
  const updatedLabel = humaniseAge(row.UpdatedDateUtc, now);
  const attribution = authorAttribution(row.AuthorEmail, actorEmail);
  const completeness = assessDraftCompleteness(row);

  return (
    <li>
      <button
        type="button"
        ref={activeRef}
        className={`${styles.row} ${active ? styles.rowActive : ''}`}
        aria-current={active ? 'true' : undefined}
        onClick={() => onSelect(row.ArticleId)}
      >
        <div className={styles.rowPrimary}>
          <span className={styles.rowTitle} title={title}>
            {renderHighlighted(title, query)}
          </span>
          <span
            className={styles.rowAge}
            title={row.UpdatedDateUtc ? `Updated ${row.UpdatedDateUtc}` : undefined}
          >
            {updatedLabel}
          </span>
        </div>
        <div className={styles.rowSecondary}>
          <span className={styles.rowProject}>
            {renderHighlighted(project, query)}
          </span>
          {contentType && (
            <>
              <span className={styles.rowSeparator} aria-hidden="true">·</span>
              <span className={styles.rowContentType}>{contentType}</span>
            </>
          )}
        </div>
        <div className={styles.rowTertiary}>
          <span className={styles.rowAttribution}>{attribution}</span>
          <span className={styles.rowSeparator} aria-hidden="true">·</span>
          <CompletenessChip completeness={completeness} />
        </div>
      </button>
    </li>
  );
}

function CompletenessChip({
  completeness,
}: {
  completeness: DraftCompleteness;
}): React.JSX.Element {
  const variant =
    completeness.level === 'ready'
      ? 'success'
      : completeness.level === 'blocked'
        ? 'danger'
        : 'warn';
  const tooltip =
    completeness.missingFields.length > 0
      ? completeness.missingFields.join(', ')
      : undefined;
  return (
    <EditorialChip
      variant={variant}
      size="sm"
      aria-label={completeness.ariaLabel}
      title={tooltip}
    >
      {completeness.chipLabel}
    </EditorialChip>
  );
}

function GroupCounts({
  rows,
}: {
  rows: readonly PublisherArticleRow[];
}): React.JSX.Element {
  const rollup = rollupGroupCompleteness(rows);
  if (rollup.total === 0) {
    return (
      <EditorialChip variant="neutral" size="sm">
        0
      </EditorialChip>
    );
  }
  return (
    <span className={styles.groupCountGroup}>
      <EditorialChip variant="info" size="sm">
        {String(rollup.total)}
      </EditorialChip>
      {rollup.todo > 0 && (
        <EditorialChip
          variant="warn"
          size="sm"
          aria-label={`${rollup.todo} need attention`}
          title={`${rollup.todo} need attention`}
        >
          {rollup.todo} TODO
        </EditorialChip>
      )}
    </span>
  );
}

function renderHighlighted(text: string, query: string): React.ReactNode {
  const segments = highlightMatches(text, query);
  if (segments.length === 0) return text;
  return segments.map((segment, i) =>
    segment.match ? (
      <mark key={i} className={styles.highlight}>
        {segment.text}
      </mark>
    ) : (
      <React.Fragment key={i}>{segment.text}</React.Fragment>
    ),
  );
}

function readPersistedQuery(): string {
  try {
    return window.sessionStorage.getItem(SEARCH_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function readPersistedCollapsed(
  defaultCollapsed: ReadonlySet<WorkflowState>,
): ReadonlySet<WorkflowState> {
  try {
    const raw = window.sessionStorage.getItem(COLLAPSED_STORAGE_KEY);
    if (!raw) return new Set(defaultCollapsed);
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set(defaultCollapsed);
    const set = new Set<WorkflowState>();
    for (const item of parsed) {
      if (typeof item === 'string') set.add(item as WorkflowState);
    }
    return set;
  } catch {
    return new Set(defaultCollapsed);
  }
}
