/**
 * ListLayout — 4-zone list page layout
 * PH4B.3 §Step 2 | Blueprint §1f, §2c
 *
 * Zones: FilterToolbar (sticky) -> SavedViewsBar (conditional) -> children (flexGrow) -> BulkActionBar (floating)
 * Filter state uses controlled props pattern -- parent page owns state.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { HBC_SPACE_XS, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_LG } from '../theme/grid.js';
import { HBC_SURFACE_LIGHT, HBC_PRIMARY_BLUE, HBC_HEADER_TEXT } from '../theme/tokens.js';
import { elevationRaised } from '../theme/elevation.js';
import { TRANSITION_FAST } from '../theme/animations.js';
import { HbcSearch } from '../HbcSearch/index.js';
import { HbcButton } from '../HbcButton/index.js';
import type { ListLayoutProps, ListFilterDef, ListBulkAction, ListSavedViewEntry } from './types.js';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    flexGrow: 1,
    position: 'relative',
  },
  // -- Filter Toolbar --
  filterToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
    paddingBottom: `${HBC_SPACE_SM}px`,
    position: 'sticky',
    top: 0,
    zIndex: 5,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
  },
  searchBox: {
    minWidth: '220px',
    flex: '0 1 280px',
  },
  primaryFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
  },
  filterSelect: {
    minWidth: '140px',
  },
  moreFiltersButton: {
    flexShrink: 0,
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    marginLeft: 'auto',
  },
  resultCount: {
    fontSize: '0.8125rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    whiteSpace: 'nowrap',
  },
  viewToggle: {
    display: 'inline-flex',
    ...shorthands.borderRadius('4px'),
    ...shorthands.borderWidth('1px'),
    ...shorthands.borderStyle('solid'),
    ...shorthands.borderColor(HBC_SURFACE_LIGHT['border-default']),
    overflow: 'hidden',
  },
  viewToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    cursor: 'pointer',
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    transitionProperty: 'background-color, color',
    transitionDuration: TRANSITION_FAST,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  viewToggleBtnActive: {
    backgroundColor: HBC_PRIMARY_BLUE as string,
    color: HBC_HEADER_TEXT,
    ':hover': {
      backgroundColor: HBC_PRIMARY_BLUE as string,
    },
  },
  // -- Filter Pills --
  pillStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
    flexWrap: 'wrap',
    paddingBottom: `${HBC_SPACE_SM}px`,
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    height: '26px',
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: '4px',
    ...shorthands.borderRadius('13px'),
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    whiteSpace: 'nowrap',
  },
  pillDismiss: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    ...shorthands.borderRadius('50%'),
    ...shorthands.borderStyle('none'),
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '0.625rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
    },
  },
  clearAll: {
    fontSize: '0.75rem',
    color: HBC_PRIMARY_BLUE as string,
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    cursor: 'pointer',
    paddingLeft: `${HBC_SPACE_SM}px`,
    ':hover': {
      textDecorationLine: 'underline',
    },
  },
  // -- Saved Views Bar --
  savedViewsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    overflowX: 'auto',
  },
  savedViewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    height: '28px',
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    ...shorthands.borderRadius('14px'),
    ...shorthands.borderWidth('1px'),
    ...shorthands.borderStyle('solid'),
    ...shorthands.borderColor(HBC_SURFACE_LIGHT['border-default']),
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    whiteSpace: 'nowrap',
    transitionProperty: 'background-color, border-color',
    transitionDuration: TRANSITION_FAST,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  savedViewBtnActive: {
    backgroundColor: HBC_PRIMARY_BLUE as string,
    ...shorthands.borderColor(HBC_PRIMARY_BLUE as string),
    color: HBC_HEADER_TEXT,
    ':hover': {
      backgroundColor: HBC_PRIMARY_BLUE as string,
    },
  },
  savedViewScope: {
    fontSize: '0.625rem',
    opacity: '0.7',
  },
  saveViewAction: {
    flexShrink: 0,
  },
  // -- Table Zone --
  tableZone: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: 0,
  },
  // -- Bulk Action Bar (floating) --
  bulkBar: {
    position: 'sticky',
    bottom: `${HBC_SPACE_MD}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    boxShadow: elevationRaised,
    ...shorthands.borderRadius('8px'),
    marginLeft: `${HBC_SPACE_MD}px`,
    marginRight: `${HBC_SPACE_MD}px`,
    zIndex: 6,
  },
  bulkInfo: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: HBC_SURFACE_LIGHT['text-primary'],
    whiteSpace: 'nowrap',
  },
  bulkActions: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  bulkActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    ...shorthands.borderRadius('6px'),
    ...shorthands.borderStyle('none'),
    fontWeight: '600',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    color: HBC_SURFACE_LIGHT['text-primary'],
    transitionProperty: 'background-color',
    transitionDuration: TRANSITION_FAST,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
    },
  },
  bulkActionBtnDestructive: {
    backgroundColor: HBC_SURFACE_LIGHT['destructive-bg'],
    color: HBC_SURFACE_LIGHT['destructive-text'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['destructive-bg-hover'],
    },
  },
  clearSelectionBtn: {
    fontSize: '0.8125rem',
    color: HBC_PRIMARY_BLUE as string,
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    cursor: 'pointer',
    ':hover': {
      textDecorationLine: 'underline',
    },
  },
});

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

function FilterPill({
  label,
  value,
  onDismiss,
  styles,
}: {
  label: string;
  value: string;
  onDismiss: () => void;
  styles: ReturnType<typeof useStyles>;
}) {
  return (
    <span className={styles.pill}>
      {label}: {value}
      <button
        className={styles.pillDismiss}
        onClick={onDismiss}
        aria-label={`Remove filter ${label}`}
        type="button"
      >
        x
      </button>
    </span>
  );
}

function SavedViewsBarInner({
  views,
  activeViewId,
  onViewSelect,
  onSaveView,
  styles,
}: {
  views: ListSavedViewEntry[];
  activeViewId?: string;
  onViewSelect?: (viewId: string) => void;
  onSaveView?: () => void;
  styles: ReturnType<typeof useStyles>;
}) {
  return (
    <div className={styles.savedViewsBar} role="tablist" aria-label="Saved views">
      {views.map((view) => (
        <button
          key={view.id}
          role="tab"
          aria-selected={view.id === activeViewId}
          className={mergeClasses(
            styles.savedViewBtn,
            view.id === activeViewId && styles.savedViewBtnActive,
          )}
          onClick={() => onViewSelect?.(view.id)}
          type="button"
        >
          {view.name}
          <span className={styles.savedViewScope}>
            ({view.scope === 'personal' ? 'Me' : view.scope === 'project' ? 'Project' : 'Org'})
          </span>
        </button>
      ))}
      {onSaveView && (
        <div className={styles.saveViewAction}>
          <HbcButton variant="ghost" size="sm" onClick={onSaveView}>
            + Save View
          </HbcButton>
        </div>
      )}
    </div>
  );
}

function BulkActionBarInner({
  selectedCount,
  bulkActions,
  onClearSelection,
  styles,
}: {
  selectedCount: number;
  bulkActions: ListBulkAction[];
  onClearSelection?: () => void;
  styles: ReturnType<typeof useStyles>;
}) {
  return (
    <div className={styles.bulkBar} role="toolbar" aria-label="Bulk actions">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className={styles.bulkInfo}>
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
        {onClearSelection && (
          <button
            className={styles.clearSelectionBtn}
            onClick={onClearSelection}
            type="button"
          >
            Clear selection
          </button>
        )}
      </div>
      <div className={styles.bulkActions}>
        {bulkActions.map((action) => (
          <button
            key={action.key}
            className={mergeClasses(
              styles.bulkActionBtn,
              action.isDestructive && styles.bulkActionBtnDestructive,
            )}
            onClick={() => action.onClick([])}
            type="button"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ListLayout
// ---------------------------------------------------------------------------
export const ListLayout: React.FC<ListLayoutProps> = ({
  primaryFilters,
  advancedFilters,
  activeFilters,
  onFilterChange,
  onClearAllFilters,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  savedViewsEnabled = false,
  savedViews,
  activeViewId,
  onViewSelect,
  onSaveView,
  viewMode = 'table',
  onViewModeChange,
  selectedCount = 0,
  bulkActions,
  onClearSelection,
  showingCount,
  totalCount,
  children,
}) => {
  const styles = useStyles();
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  const activeFilterEntries = React.useMemo(() => {
    if (!activeFilters) return [];
    return Object.entries(activeFilters).filter(([, v]) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== '';
    });
  }, [activeFilters]);

  const hasActiveFilters = activeFilterEntries.length > 0;
  const hasAdvancedFilters = advancedFilters && advancedFilters.length > 0;
  const showBulkBar = selectedCount > 0 && bulkActions && bulkActions.length > 0;

  // Find filter label by key
  const getFilterLabel = React.useCallback(
    (key: string): string => {
      const all = [...(primaryFilters ?? []), ...(advancedFilters ?? [])];
      return all.find((f) => f.key === key)?.label ?? key;
    },
    [primaryFilters, advancedFilters],
  );

  return (
    <div className={styles.root} data-hbc-layout="list">
      {/* Filter Toolbar */}
      <div className={styles.filterToolbar}>
        {/* Search */}
        <div className={styles.searchBox}>
          <HbcSearch
            variant="local"
            value={searchValue}
            onSearch={onSearchChange ?? (() => {})}
            placeholder={searchPlaceholder}
          />
        </div>

        {/* Primary Filters */}
        {primaryFilters && primaryFilters.length > 0 && (
          <div className={styles.primaryFilters}>
            {primaryFilters.map((filter) => (
              <div key={filter.key} className={styles.filterSelect}>
                <select
                  value={
                    activeFilters?.[filter.key] !== undefined
                      ? String(activeFilters[filter.key])
                      : ''
                  }
                  onChange={(e) =>
                    onFilterChange?.(filter.key, e.target.value || undefined)
                  }
                  aria-label={filter.label}
                  style={{
                    width: '100%',
                    height: '36px',
                    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
                    borderRadius: '4px',
                    padding: `0 ${HBC_SPACE_SM}px`,
                    fontSize: '0.8125rem',
                    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
                    color: HBC_SURFACE_LIGHT['text-primary'],
                  }}
                >
                  <option value="">{filter.label}</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* More Filters button */}
        {hasAdvancedFilters && (
          <div className={styles.moreFiltersButton}>
            <HbcButton
              variant="secondary"
              size="sm"
              onClick={() => setAdvancedOpen(!advancedOpen)}
            >
              More Filters{advancedOpen ? ' -' : ' +'}
            </HbcButton>
          </div>
        )}

        {/* Right side: count + view toggle */}
        <div className={styles.toolbarRight}>
          {showingCount !== undefined && totalCount !== undefined && (
            <span className={styles.resultCount}>
              {showingCount} of {totalCount}
            </span>
          )}
          {onViewModeChange && (
            <div className={styles.viewToggle}>
              <button
                className={mergeClasses(
                  styles.viewToggleBtn,
                  viewMode === 'table' && styles.viewToggleBtnActive,
                )}
                onClick={() => onViewModeChange('table')}
                aria-label="Table view"
                aria-pressed={viewMode === 'table'}
                type="button"
              >
                =
              </button>
              <button
                className={mergeClasses(
                  styles.viewToggleBtn,
                  viewMode === 'card' && styles.viewToggleBtnActive,
                )}
                onClick={() => onViewModeChange('card')}
                aria-label="Card view"
                aria-pressed={viewMode === 'card'}
                type="button"
              >
                #
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel (inline expandable) */}
      {advancedOpen && hasAdvancedFilters && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: `${HBC_SPACE_SM}px`,
            paddingBottom: `${HBC_SPACE_SM}px`,
          }}
        >
          {advancedFilters!.map((filter) => (
            <div key={filter.key} className={styles.filterSelect}>
              <select
                value={
                  activeFilters?.[filter.key] !== undefined
                    ? String(activeFilters[filter.key])
                    : ''
                }
                onChange={(e) =>
                  onFilterChange?.(filter.key, e.target.value || undefined)
                }
                aria-label={filter.label}
                style={{
                  width: '100%',
                  height: '36px',
                  border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
                  borderRadius: '4px',
                  padding: `0 ${HBC_SPACE_SM}px`,
                  fontSize: '0.8125rem',
                  backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
                  color: HBC_SURFACE_LIGHT['text-primary'],
                }}
              >
                <option value="">{filter.label}</option>
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Filter Pill Strip */}
      {hasActiveFilters && (
        <div className={styles.pillStrip}>
          {activeFilterEntries.map(([key, val]) => (
            <FilterPill
              key={key}
              label={getFilterLabel(key)}
              value={Array.isArray(val) ? val.join(', ') : String(val)}
              onDismiss={() => onFilterChange?.(key, undefined)}
              styles={styles}
            />
          ))}
          {onClearAllFilters && (
            <button
              className={styles.clearAll}
              onClick={onClearAllFilters}
              type="button"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Saved Views Bar */}
      {savedViewsEnabled && savedViews && savedViews.length > 0 && (
        <SavedViewsBarInner
          views={savedViews}
          activeViewId={activeViewId}
          onViewSelect={onViewSelect}
          onSaveView={onSaveView}
          styles={styles}
        />
      )}

      {/* Table / Card Zone */}
      <div className={styles.tableZone}>{children}</div>

      {/* Floating Bulk Action Bar */}
      {showBulkBar && (
        <BulkActionBarInner
          selectedCount={selectedCount}
          bulkActions={bulkActions!}
          onClearSelection={onClearSelection}
          styles={styles}
        />
      )}
    </div>
  );
};
