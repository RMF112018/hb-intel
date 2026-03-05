/**
 * HbcSidebar — Collapsible icon-rail (56px / 240px)
 * PH4.4 §Step 5 | Blueprint §2c
 *
 * Groups filtered by usePermission(). Mobile (< 1024px) renders nothing.
 * Active state: 3px left border orange + highlight bg.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { Tooltip } from '@fluentui/react-components';
import { usePermission } from '@hbc/auth';
import {
  HBC_ACCENT_ORANGE,
  HBC_PRIMARY_BLUE,
  HBC_SURFACE_LIGHT,
  HBC_HEADER_ICON_MUTED,
} from '../theme/tokens.js';
import { TRANSITION_NORMAL } from '../theme/animations.js';
import { Z_INDEX } from '../theme/z-index.js';
import { Expand, Collapse } from '../icons/index.js';
import { useSidebarState } from './hooks/useSidebarState.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import type { HbcSidebarProps, SidebarNavGroup, SidebarNavItem } from './types.js';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    top: '58px',
    left: '0px',
    height: 'calc(100vh - 58px)',
    backgroundColor: '#FFFFFF',
    ...shorthands.borderRight('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    display: 'flex',
    flexDirection: 'column',
    transitionProperty: 'width',
    transitionDuration: TRANSITION_NORMAL,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    overflowX: 'hidden',
    overflowY: 'auto',
    zIndex: Z_INDEX.sidebar,
  },
  collapsed: {
    width: '56px',
  },
  expanded: {
    width: '240px',
  },
  groupLabel: {
    fontSize: '0.625rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: HBC_HEADER_ICON_MUTED,
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '16px',
    paddingBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  groupLabelCollapsed: {
    paddingLeft: '0px',
    paddingRight: '0px',
    textAlign: 'center' as const,
    fontSize: '0px',
    paddingTop: '12px',
    paddingBottom: '4px',
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '8px',
    paddingBottom: '8px',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    ...shorthands.borderLeft('3px', 'solid', 'transparent'),
    cursor: 'pointer',
    color: HBC_SURFACE_LIGHT['text-primary'],
    fontSize: '0.875rem',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecorationLine: 'none',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
      color: HBC_PRIMARY_BLUE,
    },
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingLeft: '0px',
    paddingRight: '0px',
  },
  navItemActive: {
    borderLeftColor: HBC_ACCENT_ORANGE as string,
    backgroundColor: '#E8F1F8',
    color: HBC_PRIMARY_BLUE,
    fontWeight: '600',
  },
  navItemActiveCollapsed: {
    borderLeftColor: HBC_ACCENT_ORANGE as string,
  },
  navItemIcon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
  },
  navItemActiveIcon: {
    color: HBC_ACCENT_ORANGE,
  },
  navItemLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  spacer: {
    flexGrow: 1,
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    cursor: 'pointer',
    color: HBC_HEADER_ICON_MUTED,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
});

/** Wrapper that filters a group by permission */
const PermissionFilteredGroup: React.FC<{
  group: SidebarNavGroup;
  children: (visible: boolean) => React.ReactNode;
}> = ({ group, children }) => {
  const hasPermission = usePermission(group.requiredPermission ?? '');
  const visible = !group.requiredPermission || hasPermission;
  return <>{children(visible)}</>;
};

/** Wrapper that filters a single nav item by permission — PH4B.5 §4b.5.4 */
const PermissionFilteredItem: React.FC<{
  permission?: string;
  children: React.ReactNode;
}> = ({ permission, children }) => {
  const allowed = usePermission(permission ?? '');
  if (permission && !allowed) return null;
  return <>{children}</>;
};

const FOCUS_EVENT = 'hbc-focus-mode-change';

export const HbcSidebar: React.FC<HbcSidebarProps> = ({
  groups,
  activeItemId,
  onNavigate,
  onToggleFavorite,
}) => {
  const { isExpanded, isMobile, toggle } = useSidebarState();
  const connectivityStatus = useOnlineStatus();
  const [focusOverride, setFocusOverride] = React.useState(false);
  const styles = useStyles();

  // Listen for Focus Mode CustomEvent — force collapse when active
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ active: boolean }>).detail;
      setFocusOverride(detail.active);
    };
    window.addEventListener(FOCUS_EVENT, handler);
    return () => window.removeEventListener(FOCUS_EVENT, handler);
  }, []);

  const effectiveExpanded = focusOverride ? false : isExpanded;
  const topOffset = connectivityStatus === 'online' ? '58px' : '60px';
  const sidebarHeight = connectivityStatus === 'online' ? 'calc(100vh - 58px)' : 'calc(100vh - 60px)';

  if (isMobile) return null;

  return (
    <nav
      className={mergeClasses(styles.root, effectiveExpanded ? styles.expanded : styles.collapsed)}
      role="navigation"
      aria-label="Main navigation"
      data-hbc-ui="sidebar"
      data-expanded={effectiveExpanded}
      style={{ top: topOffset, height: sidebarHeight }}
    >
      {groups.map((group) => (
        <PermissionFilteredGroup key={group.id} group={group}>
          {(visible) =>
            visible ? (
              <div>
                <div
                  className={mergeClasses(
                    styles.groupLabel,
                    !effectiveExpanded && styles.groupLabelCollapsed,
                  )}
                >
                  {effectiveExpanded ? group.label : ''}
                </div>
                {group.items.map((item) => {
                  const isActive = item.id === activeItemId;
                  const iconEl = (
                    <span
                      className={mergeClasses(
                        styles.navItemIcon,
                        isActive && !effectiveExpanded && styles.navItemActiveIcon,
                      )}
                    >
                      {item.icon}
                    </span>
                  );

                  const button = (
                    <button
                      key={item.id}
                      className={mergeClasses(
                        styles.navItem,
                        !effectiveExpanded && styles.navItemCollapsed,
                        isActive && styles.navItemActive,
                        isActive && !effectiveExpanded && styles.navItemActiveCollapsed,
                      )}
                      onClick={() => onNavigate?.(item.href)}
                      aria-current={isActive ? 'page' : undefined}
                      type="button"
                    >
                      {iconEl}
                      {effectiveExpanded && <span className={styles.navItemLabel}>{item.label}</span>}
                    </button>
                  );

                  return (
                    <PermissionFilteredItem key={item.id} permission={item.requiredPermission}>
                      {effectiveExpanded ? (
                        button
                      ) : (
                        <Tooltip
                          content={item.label}
                          relationship="label"
                          positioning="after"
                        >
                          {button}
                        </Tooltip>
                      )}
                    </PermissionFilteredItem>
                  );
                })}
              </div>
            ) : null
          }
        </PermissionFilteredGroup>
      ))}

      <div className={styles.spacer} />

      <button
        className={styles.toggleButton}
        onClick={toggle}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        type="button"
      >
        {isExpanded ? <Collapse size="md" /> : <Expand size="md" />}
      </button>
    </nav>
  );
};
