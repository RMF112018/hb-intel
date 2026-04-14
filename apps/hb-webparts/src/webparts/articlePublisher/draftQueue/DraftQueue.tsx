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
  const [rawQuery, setRawQuery] = React.useState<string>(() => readPersistedQuery());
  const [query, setQuery] = React.useState(rawQuery);
  const [collapsed, setCollapsed] = React.useState<ReadonlySet<WorkflowState>>(
    () => new Set(defaultCollapsed),
  );
  const now = React.useMemo(() => new Date(), []);

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

  // `/` anywhere in the rail focuses the search; `Escape` inside
  // the input clears the query.
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  }, []);

  const toggleCollapsed = (state: WorkflowState) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });

  const activeQuery = query;
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
}

function DraftRow({
  row,
  active,
  onSelect,
  actorEmail,
  query,
  now,
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
  const className =
    completeness.level === 'ready'
      ? styles.chipReady
      : completeness.level === 'blocked'
        ? styles.chipBlocked
        : styles.chipTodo;
  const tooltip =
    completeness.missingFields.length > 0
      ? completeness.missingFields.join(', ')
      : undefined;
  return (
    <span
      className={`${styles.chip} ${className}`}
      aria-label={completeness.ariaLabel}
      title={tooltip}
    >
      {completeness.chipLabel}
    </span>
  );
}

function GroupCounts({
  rows,
}: {
  rows: readonly PublisherArticleRow[];
}): React.JSX.Element {
  const rollup = rollupGroupCompleteness(rows);
  if (rollup.total === 0) {
    return <span className={styles.groupCount}>0</span>;
  }
  return (
    <span className={styles.groupCountGroup}>
      <span className={styles.groupCount}>{rollup.total}</span>
      {rollup.todo > 0 && (
        <span
          className={`${styles.groupAttention}`}
          aria-label={`${rollup.todo} need attention`}
          title={`${rollup.todo} need attention`}
        >
          {rollup.todo} TODO
        </span>
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
