/**
 * HbcSidebar — Collapsible icon-rail (56px / 240px)
 * PH4.4 §Step 5 | Blueprint §2c
 * Traceability: D-PH4C-26, D-PH4C-27
 *
 * Groups filtered by usePermission(). Mobile (< 1024px) renders nothing.
 * Active state: 3px left border orange + highlight bg.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { Tooltip, tokens } from '@fluentui/react-components';
import { usePermission } from '@hbc/auth';
import { HBC_ACCENT_ORANGE } from '../theme/tokens.js';
import { TRANSITION_NORMAL } from '../theme/animations.js';
import { Z_INDEX } from '../theme/z-index.js';
import { Expand, Collapse } from '../icons/index.js';
import { useSidebarState } from './hooks/useSidebarState.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import { HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
import type { HbcSidebarProps, SidebarNavGroup, SidebarNavItem } from './types.js';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    top: '58px',
    left: '0px',
    height: 'calc(100vh - 58px)',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke1),
    display: 'flex',
    flexDirection: 'column',
    transitionProperty: 'width',
    transitionDuration: TRANSITION_NORMAL,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // UIF-009: overflow hidden on root so the toggle button cannot be scrolled
    // out of view. Scrolling is delegated to the navScroll inner container.
    overflow: 'hidden',
    zIndex: Z_INDEX.sidebar,
  },
  // UIF-009: Scrollable wrapper for nav groups. flex:1 fills available height
  // between the top edge and the sticky toggle button at the bottom.
  navScroll: {
    flex: '1 1 0',
    overflowY: 'auto',
    overflowX: 'hidden',
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
    color: tokens.colorNeutralForeground3,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_MD}px`,
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
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    // UIF-035-addl: Touch-target bump on coarse-pointer devices (WCAG 2.5.5).
    '@media (pointer: coarse)': {
      minHeight: '44px',
      paddingTop: '12px',
      paddingBottom: '12px',
    },
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    ...shorthands.borderLeft('3px', 'solid', 'transparent'),
    cursor: 'pointer',
    color: tokens.colorNeutralForeground1,
    fontSize: '0.875rem',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecorationLine: 'none',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
      color: tokens.colorBrandForeground1,
    },
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingLeft: '0px',
    paddingRight: '0px',
  },
  navItemActive: {
    // D-PH4C-27 invariant: keep brand orange accent for active rail marker.
    borderLeftColor: HBC_ACCENT_ORANGE as string,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
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
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke1),
    cursor: 'pointer',
    color: tokens.colorNeutralForeground3,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
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
      <div className={styles.navScroll}>
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
                        aria-label={item.label}
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
      </div>

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
