import { HbcButton } from '@hbc/ui-kit/homepage';
import type {
  EditorialQueueFilterId,
  EditorialQueueFilterOption,
  EditorialQueueRow,
} from './editorialQueueViewModel.js';
import shell from './manageShell.module.css';

export interface EditorialQueueEmptyState {
  readonly heading: string;
  readonly body: string;
  readonly action?: {
    readonly id: string;
    readonly label: string;
    readonly onClick: () => void;
  };
}

export interface EditorialQueueProps {
  readonly rows: ReadonlyArray<EditorialQueueRow>;
  readonly filters: ReadonlyArray<EditorialQueueFilterOption>;
  readonly activeFilter: EditorialQueueFilterId;
  readonly onChangeFilter: (filter: EditorialQueueFilterId) => void;
  readonly selectedRowId: string | null;
  readonly onSelectRow: (rowId: string) => void;
  readonly emptyContentState?: EditorialQueueEmptyState;
}

const COLUMNS: ReadonlyArray<{ readonly id: string; readonly label: string }> = [
  { id: 'status', label: 'Status' },
  { id: 'title', label: 'Title' },
  { id: 'feed', label: 'Feed' },
  { id: 'displayWindow', label: 'Display window' },
  { id: 'readiness', label: 'Readiness' },
  { id: 'action', label: 'Action' },
];

export function EditorialQueue(props: EditorialQueueProps): React.ReactNode {
  return (
    <section
      className={shell.editorialQueue}
      role="region"
      aria-label="Editorial Queue"
      data-editorial-queue-active-filter={props.activeFilter}
    >
      <header className={shell.editorialQueueHeader}>
        <h3 className={shell.editorialQueueHeading}>Editorial Queue</h3>
        <p className={shell.editorialQueueIntro}>
          Foleon content available to place into a feed slot. Filter by status to focus on what needs work.
        </p>
      </header>
      <div
        className={shell.editorialQueueFilters}
        role="radiogroup"
        aria-label="Editorial Queue filter"
      >
        {props.filters.map((filter) => {
          const isActive = filter.id === props.activeFilter;
          return (
            <button
              key={filter.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              tabIndex={isActive ? 0 : -1}
              className={
                isActive
                  ? `${shell.editorialQueueFilter} ${shell.editorialQueueFilterActive}`
                  : shell.editorialQueueFilter
              }
              onClick={(): void => props.onChangeFilter(filter.id)}
              data-editorial-queue-filter={filter.id}
            >
              <span className={shell.editorialQueueFilterLabel}>{filter.label}</span>
              <span className={shell.editorialQueueFilterCount}>{filter.count}</span>
            </button>
          );
        })}
      </div>
      {props.rows.length === 0 && props.emptyContentState ? (
        <section
          className={shell.editorialQueueEmptyState}
          role="status"
          aria-label="Editorial Queue empty"
          data-editorial-queue-empty="content"
        >
          <h4 className={shell.editorialQueueEmptyHeading}>{props.emptyContentState.heading}</h4>
          <p className={shell.editorialQueueEmptyBody}>{props.emptyContentState.body}</p>
          {props.emptyContentState.action ? (
            <span
              className={shell.editorialQueueEmptyAction}
              data-editorial-queue-empty-action={props.emptyContentState.action.id}
            >
              <HbcButton variant="primary" onClick={props.emptyContentState.action.onClick}>
                {props.emptyContentState.action.label}
              </HbcButton>
            </span>
          ) : null}
        </section>
      ) : props.rows.length === 0 ? (
        <p
          className={shell.editorialQueueEmpty}
          role="status"
          data-editorial-queue-empty="filter"
        >
          No items match this filter.
        </p>
      ) : (
        <div className={shell.editorialQueueTable} role="table" aria-label="Editorial Queue">
          <div className={shell.editorialQueueRow} role="row" data-editorial-queue-header-row>
            {COLUMNS.map((column) => (
              <div
                key={column.id}
                className={shell.editorialQueueHeaderCell}
                role="columnheader"
              >
                {column.label}
              </div>
            ))}
          </div>
          {props.rows.map((row) => {
            const isSelected = row.id === props.selectedRowId;
            return (
              <button
                key={row.id}
                type="button"
                role="row"
                aria-selected={isSelected}
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? `${shell.editorialQueueRow} ${shell.editorialQueueRowSelected}`
                    : shell.editorialQueueRow
                }
                onClick={(): void => props.onSelectRow(row.id)}
                data-editorial-queue-row={row.id}
                data-editorial-queue-status={row.classifications[0] ?? 'draft'}
              >
                <span className={shell.editorialQueueCell} role="cell">
                  <span className={shell.editorialQueueStatusPill}>{row.statusLabel}</span>
                </span>
                <span className={shell.editorialQueueCell} role="cell">
                  {row.title}
                </span>
                <span className={shell.editorialQueueCell} role="cell">
                  {row.feedLabel}
                </span>
                <span className={shell.editorialQueueCell} role="cell">
                  {row.displayWindow}
                </span>
                <span className={shell.editorialQueueCell} role="cell">
                  {row.readinessLabel}
                </span>
                <span className={shell.editorialQueueCell} role="cell">
                  {row.primaryActionLabel}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
