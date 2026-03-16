/**
 * HbcBottomNav — Fixed bottom navigation bar for tablet/mobile viewports
 * PH4.14.5 | Blueprint §1d, §1f
 * Traceability: D-PH4C-24, D-PH4C-25
 *
 * Features:
 * - Fixed to viewport bottom, 56px height
 * - First 4 items shown directly; overflow behind "More" sheet
 * - Active state: accent orange; inactive: muted gray
 * - Safe area insets for iOS notch devices
 * - Hides when Focus Mode active
 * - role="navigation" + aria-label for accessibility
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { HBC_DARK_HEADER, HBC_ACCENT_ORANGE, HBC_HEADER_ICON_MUTED } from '../theme/tokens.js';
import { keyframes, TRANSITION_FAST, TRANSITION_NORMAL } from '../theme/animations.js';
import { Z_INDEX } from '../theme/z-index.js';
import { MoreActions } from '../icons/index.js';
import type { HbcBottomNavProps, BottomNavItem } from './types.js';

const MAX_VISIBLE = 4;
const FOCUS_EVENT = 'hbc-focus-mode-change';

const useStyles = makeStyles({
  nav: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    height: '56px',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    backgroundColor: HBC_DARK_HEADER,
    zIndex: Z_INDEX.bottomNav,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navHidden: {
    display: 'none',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 0',
    height: '100%',
    gap: '2px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    ...shorthands.borderWidth('0'),
    paddingTop: '0',
    paddingRight: '0',
    paddingBottom: '0',
    paddingLeft: '0',
    color: HBC_HEADER_ICON_MUTED,
    transitionProperty: 'color',
    transitionDuration: TRANSITION_FAST,
  },
  itemActive: {
    color: HBC_ACCENT_ORANGE,
  },
  itemLabel: {
    fontSize: '0.625rem',
    fontWeight: '500',
    lineHeight: '1',
    whiteSpace: 'nowrap',
  },
  itemIcon: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // "More" bottom sheet
  backdrop: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: Z_INDEX.bottomNav + 1,
  },
  sheet: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: HBC_DARK_HEADER,
    zIndex: Z_INDEX.bottomNav + 2,
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    animationName: keyframes.slideInFromBottom,
    animationDuration: TRANSITION_NORMAL,
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    animationFillMode: 'forwards',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  dragHandle: {
    width: '36px',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: '#555',
    marginTop: '8px',
    marginRight: 'auto',
    marginBottom: '8px',
    marginLeft: 'auto',
    display: 'block',
  },
  sheetItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    paddingTop: '12px',
    paddingRight: '16px',
    paddingBottom: '12px',
    paddingLeft: '16px',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    ...shorthands.borderWidth('0'),
    color: '#E8EAED',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textAlign: 'left',
  },
  sheetItemActive: {
    color: HBC_ACCENT_ORANGE,
  },
  sheetItemIcon: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

export const HbcBottomNav: React.FC<HbcBottomNavProps> = ({
  items,
  activeId,
  onNavigate,
  className,
}) => {
  const styles = useStyles();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isFocusHidden, setIsFocusHidden] = React.useState(false);

  // Listen for Focus Mode changes
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ active: boolean }>).detail;
      setIsFocusHidden(detail.active);
    };
    window.addEventListener(FOCUS_EVENT, handler);
    return () => window.removeEventListener(FOCUS_EVENT, handler);
  }, []);

  const visibleItems = items.slice(0, MAX_VISIBLE);
  const overflowItems = items.slice(MAX_VISIBLE);
  const hasOverflow = overflowItems.length > 0;

  const handleItemClick = (item: BottomNavItem) => {
    onNavigate?.(item.href);
    setIsSheetOpen(false);
  };

  // PH4C.12: guard against rendering an empty nav rail in tablet/field modes.
  if (!items || items.length === 0) return null;
  if (isFocusHidden) return null;

  return (
    <>
      <nav
        className={mergeClasses(styles.nav, className)}
        role="navigation"
        aria-label="Bottom navigation"
        data-hbc-ui="bottom-nav"
      >
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={mergeClasses(styles.item, activeId === item.id && styles.itemActive)}
            onClick={() => handleItemClick(item)}
            aria-current={activeId === item.id ? 'page' : undefined}
          >
            <span className={styles.itemIcon}>{item.icon}</span>
            <span className={styles.itemLabel}>{item.label}</span>
          </button>
        ))}
        {hasOverflow && (
          <button
            type="button"
            className={mergeClasses(styles.item, isSheetOpen && styles.itemActive)}
            onClick={() => setIsSheetOpen((prev) => !prev)}
            aria-label="More navigation options"
            aria-expanded={isSheetOpen}
          >
            <span className={styles.itemIcon}>
              <MoreActions size="md" />
            </span>
            <span className={styles.itemLabel}>More</span>
          </button>
        )}
      </nav>

      {/* "More" bottom sheet */}
      {isSheetOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsSheetOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.sheet} role="menu" aria-label="More navigation items">
            <span className={styles.dragHandle} />
            {overflowItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={mergeClasses(
                  styles.sheetItem,
                  activeId === item.id && styles.sheetItemActive,
                )}
                role="menuitem"
                onClick={() => handleItemClick(item)}
              >
                <span className={styles.sheetItemIcon}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export type { BottomNavItem, HbcBottomNavProps } from './types.js';
