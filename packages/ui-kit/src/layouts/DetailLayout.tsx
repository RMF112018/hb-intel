/**
 * DetailLayout — Single-item detail page layout
 * PH4.5 §Step 3 | Blueprint §1f, §2c
 *
 * Structure: Breadcrumb (sticky) → Detail Header (sticky) → Tab Bar (sticky) → Content Split (8:4)
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { heading2 } from '../theme/typography.js';
import { HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_LG } from '../theme/grid.js';
import {
  HBC_SURFACE_LIGHT,
  HBC_PRIMARY_BLUE,
  HBC_HEADER_ICON_MUTED,
} from '../theme/tokens.js';
import { TRANSITION_NORMAL } from '../theme/animations.js';
import { ChevronBack } from '../icons/index.js';
import type { DetailLayoutProps, LayoutTab } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    position: 'relative',
  },
  breadcrumb: {
    position: 'sticky',
    top: '0px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    zIndex: 12,
    flexShrink: 0,
    gap: `${HBC_SPACE_SM}px`,
    fontSize: '0.75rem',
  },
  breadcrumbLink: {
    color: HBC_PRIMARY_BLUE,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    ...shorthands.padding('0px'),
    fontSize: 'inherit',
    textDecorationLine: 'none',
    ':hover': {
      textDecorationLine: 'underline',
    },
  },
  breadcrumbSeparator: {
    color: HBC_HEADER_ICON_MUTED,
  },
  breadcrumbCurrent: {
    fontWeight: '600',
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  detailHeader: {
    position: 'sticky',
    top: '32px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    zIndex: 11,
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_MD}px`,
    minWidth: '0px',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    ...shorthands.padding('0px'),
    color: HBC_PRIMARY_BLUE,
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '500',
    flexShrink: 0,
    ':hover': {
      textDecorationLine: 'underline',
    },
  },
  itemTitle: {
    ...heading2,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginTop: '0px',
    marginBottom: '0px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flexShrink: 0,
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    ...shorthands.borderRadius('6px'),
    ...shorthands.borderStyle('none'),
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transitionProperty: 'background-color, opacity',
    transitionDuration: TRANSITION_NORMAL,
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    color: HBC_SURFACE_LIGHT['text-primary'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
    },
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  tabBar: {
    position: 'sticky',
    top: '96px',
    height: '40px',
    display: 'flex',
    alignItems: 'stretch',
    gap: `${HBC_SPACE_LG}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    zIndex: 10,
    flexShrink: 0,
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    ...shorthands.borderBottom('2px', 'solid', 'transparent'),
    ...shorthands.padding('0px'),
    paddingBottom: '0px',
    color: HBC_SURFACE_LIGHT['text-muted'],
    fontSize: '0.875rem',
    fontWeight: '400',
    cursor: 'pointer',
    transitionProperty: 'color, border-color, font-weight',
    transitionDuration: TRANSITION_NORMAL,
    ':hover': {
      color: HBC_SURFACE_LIGHT['text-primary'],
    },
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  tabActive: {
    color: HBC_PRIMARY_BLUE,
    fontWeight: '600',
    borderBottomColor: HBC_PRIMARY_BLUE,
  },
  contentSplit: {
    display: 'grid',
    gridTemplateColumns: '8fr 4fr',
    gap: `${HBC_SPACE_LG}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_LG}px`,
    flexGrow: 1,
    '@media (max-width: 1023px)': {
      gridTemplateColumns: '1fr',
    },
  },
  contentSplitNoSidebar: {
    gridTemplateColumns: '1fr',
  },
  mainColumn: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
    '@media (max-width: 1023px)': {
      maxHeight: 'none',
    },
  },
  sideColumn: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
    '@media (max-width: 1023px)': {
      maxHeight: 'none',
    },
  },
});

export const DetailLayout: React.FC<DetailLayoutProps> = ({
  breadcrumbs,
  backLink,
  backLabel,
  itemTitle,
  statusBadge,
  actions,
  tabs,
  activeTabId,
  onTabChange,
  mainContent,
  sidebarContent,
  onNavigate,
}) => {
  const styles = useStyles();

  const handleTabKeyDown = (e: React.KeyboardEvent, tabList: LayoutTab[]) => {
    const currentIndex = tabList.findIndex((t) => t.id === activeTabId);
    if (currentIndex === -1) return;

    let nextIndex = -1;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabList.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabList.length) % tabList.length;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      return;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = tabList[nextIndex];
    if (nextTab && !nextTab.disabled) {
      onTabChange?.(nextTab.id);
      // Focus the next tab button
      const tabBar = (e.currentTarget as HTMLElement).parentElement;
      const buttons = tabBar?.querySelectorAll('[role="tab"]');
      (buttons?.[nextIndex] as HTMLElement)?.focus();
    }
  };

  return (
    <div className={styles.root} data-hbc-layout="detail">
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className={styles.breadcrumb}>
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`${crumb.label}-${i}`}>
                {i > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
                {isLast ? (
                  <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
                ) : (
                  <button
                    className={styles.breadcrumbLink}
                    onClick={() => crumb.href && onNavigate?.(crumb.href)}
                    type="button"
                  >
                    {crumb.label}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Detail Header */}
      <div className={styles.detailHeader}>
        <div className={styles.headerLeft}>
          {backLink && (
            <button
              className={styles.backButton}
              onClick={() => onNavigate?.(backLink)}
              type="button"
            >
              <ChevronBack size="sm" />
              {backLabel ?? 'Back'}
            </button>
          )}
          <h2 className={styles.itemTitle}>{itemTitle}</h2>
          {statusBadge}
        </div>
        <div className={styles.headerRight}>
          {actions?.map((action) => (
            <button
              key={action.key}
              className={styles.actionButton}
              onClick={action.onClick}
              disabled={action.disabled}
              type="button"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      {tabs && tabs.length > 0 && (
        <div className={styles.tabBar} role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={tab.id === activeTabId}
              aria-controls={`tabpanel-${tab.id}`}
              className={mergeClasses(
                styles.tab,
                tab.id === activeTabId && styles.tabActive,
              )}
              onClick={() => onTabChange?.(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, tabs)}
              disabled={tab.disabled}
              tabIndex={tab.id === activeTabId ? 0 : -1}
              type="button"
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content Split */}
      <div
        className={mergeClasses(
          styles.contentSplit,
          !sidebarContent && styles.contentSplitNoSidebar,
        )}
      >
        <div
          className={styles.mainColumn}
          role="tabpanel"
          id={activeTabId ? `tabpanel-${activeTabId}` : undefined}
          aria-labelledby={activeTabId ? `tab-${activeTabId}` : undefined}
        >
          {mainContent}
        </div>
        {sidebarContent && (
          <div className={styles.sideColumn}>{sidebarContent}</div>
        )}
      </div>
    </div>
  );
};
