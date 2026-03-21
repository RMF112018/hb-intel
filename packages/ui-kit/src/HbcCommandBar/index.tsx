/**
 * HbcCommandBar — Fluent v9 Toolbar wrapper
 * Blueprint §1d — SearchBox + filter toggles + action buttons
 * PH4.6 §Step 10 — Saved views + density auto-detection + column config
 */
import * as React from 'react';
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarToggleButton,
  ToggleButton,
  SearchBox,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { elevationRaised } from '../theme/elevation.js';
import { HBC_ACCENT_ORANGE, HBC_STATUS_COLORS, HBC_HEADER_TEXT, HBC_DANGER_HOVER } from '../theme/tokens.js';
import { HbcTooltip } from '../HbcTooltip/index.js';
import { HBC_SPACE_SM } from '../theme/grid.js';
import { MoreActions } from '../icons/index.js';
import type { HbcCommandBarProps, CommandBarAction, CommandBarFilter, CommandBarGrouping, DensityTier } from './types.js';

// UIF-012: Urgency-differentiated badge background colors for filter count badges.
const URGENCY_BADGE_BG: Record<NonNullable<CommandBarFilter['urgency']>, string> = {
  error: HBC_STATUS_COLORS.error,   // red — Overdue
  warning: '#FFB020',               // amber — Blocked
  neutral: 'var(--colorNeutralBackground4)', // neutral — Unread
};

// UIF-005: Urgency-differentiated label text colors for filter buttons.
// Uses Fluent v9 adaptive status tokens so the color responds to light/dark theme.
const URGENCY_LABEL_COLOR: Record<NonNullable<CommandBarFilter['urgency']>, string | undefined> = {
  error:   tokens.colorStatusDangerForeground1,   // red — Overdue
  warning: tokens.colorStatusWarningForeground1,  // amber — Blocked
  neutral: undefined,                              // inherits button default
};

// UIF-005: Active-state background fill using adaptive status tokens.
// Replaces the light-theme-only HBC_SURFACE_LIGHT['surface-active'] used previously.
const URGENCY_ACTIVE_BG: Record<NonNullable<CommandBarFilter['urgency']>, string> = {
  error:   tokens.colorStatusDangerBackground1,
  warning: tokens.colorStatusWarningBackground1,
  neutral: tokens.colorNeutralBackground4,
};

const DENSITY_HEIGHT: Record<DensityTier, string> = {
  compact: '32px',
  standard: '40px',
  touch: '48px',
};

const DENSITY_LABELS: Record<DensityTier, string> = {
  compact: 'Compact',
  standard: 'Standard',
  touch: 'Touch',
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: '12px',
    paddingRight: '12px',
    boxShadow: elevationRaised,
    backgroundColor: 'var(--colorNeutralBackground1)',
    borderRadius: '4px',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
  },
  search: {
    minWidth: '200px',
    flexShrink: 0,
  },
  filters: {
    display: 'flex',
    gap: '4px',
    flexShrink: 0,
  },
  // UIF-010: Grouping radiogroup row — same flex layout as filters.
  groupings: {
    display: 'flex',
    gap: '4px',
    flexShrink: 0,
  },
  spacer: {
    flex: '1 1 auto',
  },
  actions: {
    display: 'flex',
    gap: '4px',
    flexShrink: 0,
  },
  destructiveBtn: {
    backgroundColor: HBC_STATUS_COLORS.error,
    color: HBC_HEADER_TEXT,
    ':hover': {
      backgroundColor: HBC_DANGER_HOVER,
    },
  },
  overflowBtn: {
    minWidth: '32px',
  },
  viewSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  viewSelect: {
    fontSize: '0.8125rem',
    padding: '2px 8px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '3px',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
  },
  densityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: tokens.colorNeutralForeground3,
  },
  densityLabel: {
    fontSize: '0.6875rem',
    color: tokens.colorNeutralForeground3,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: '2px 6px',
    borderRadius: '3px',
  },
  densitySelect: {
    fontSize: '0.75rem',
    padding: '1px 4px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '3px',
    backgroundColor: 'transparent',
    color: tokens.colorNeutralForeground3,
    cursor: 'pointer',
  },
  scopeBadge: {
    fontSize: '0.625rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: tokens.colorNeutralForeground3,
    marginLeft: '4px',
  },
});

/** V2.1 Dec 23: auto-detect density tier from pointer and screen width */
function useAutoDetectDensity(): DensityTier {
  const [tier, setTier] = React.useState<DensityTier>('standard');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const detect = () => {
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      if (coarse) {
        setTier('touch');
      } else if (window.innerWidth >= 1200) {
        setTier('compact');
      } else {
        setTier('standard');
      }
    };

    detect();
    window.addEventListener('resize', detect);
    const mq = window.matchMedia('(pointer: coarse)');
    mq.addEventListener('change', detect);

    return () => {
      window.removeEventListener('resize', detect);
      mq.removeEventListener('change', detect);
    };
  }, []);

  return tier;
}

export const HbcCommandBar: React.FC<HbcCommandBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  groupings,
  actions,
  overflowActions,
  savedViews,
  onViewChange,
  onViewSave,
  densityTier: densityOverride,
  onDensityChange,
  columnConfigTrigger,
  className,
}) => {
  const styles = useStyles();
  const autoDetected = useAutoDetectDensity();
  const effectiveDensity = densityOverride ?? autoDetected;
  const minItemHeight = DENSITY_HEIGHT[effectiveDensity];

  const activeView = savedViews?.find((v) => v.isActive);

  return (
    <div
      data-hbc-ui="command-bar"
      data-hbc-density={effectiveDensity}
      className={mergeClasses(styles.root, className)}
      style={{ minHeight: minItemHeight }}
    >
      {/* Saved views selector */}
      {savedViews && savedViews.length > 0 && (
        <>
          <div className={styles.viewSelector}>
            <select
              className={styles.viewSelect}
              value={activeView?.id ?? ''}
              onChange={(e) => onViewChange?.(e.target.value)}
              aria-label="Saved views"
            >
              {savedViews.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            {activeView && (
              <span className={styles.scopeBadge}>{activeView.scope}</span>
            )}
            {onViewSave && (
              <button
                type="button"
                onClick={onViewSave}
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 6px',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: HBC_ACCENT_ORANGE,
                }}
              >
                Save
              </button>
            )}
          </div>
          <ToolbarDivider />
        </>
      )}

      {/* Search */}
      {onSearchChange !== undefined && (
        <SearchBox
          className={styles.search}
          value={searchValue ?? ''}
          onChange={(_e, data) => onSearchChange(data.value)}
          placeholder={searchPlaceholder}
          size="small"
        />
      )}

      {/* Filters */}
      {filters && filters.length > 0 && (
        <>
          <ToolbarDivider />
          <Toolbar className={styles.filters} size="small">
            {filters.map((f) => (
              <ToolbarToggleButton
                key={f.key}
                name={f.key}
                value={f.key}
                aria-pressed={f.active}
                onClick={f.onToggle}
                size="small"
                appearance="subtle"
                // UIF-005: Active fill uses adaptive urgency token, not light-theme-only HBC_SURFACE_LIGHT.
                style={f.active ? { backgroundColor: URGENCY_ACTIVE_BG[f.urgency ?? 'neutral'] } : undefined}
              >
                {/* UIF-005: Urgency label color — Overdue=red, Blocked=amber, Unread=default */}
                <span style={{ color: URGENCY_LABEL_COLOR[f.urgency ?? 'neutral'] }}>
                  {f.label}
                </span>
                {f.count !== undefined && (
                  <span
                    style={{
                      marginLeft: '6px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: '8px',
                      backgroundColor: URGENCY_BADGE_BG[f.urgency ?? 'neutral'],
                      color:
                        f.urgency === 'error' || f.urgency === 'warning'
                          ? '#FFFFFF'
                          : undefined,
                      minWidth: '18px',
                      textAlign: 'center' as const,
                      lineHeight: '1.4',
                    }}
                  >
                    {f.count}
                  </span>
                )}
              </ToolbarToggleButton>
            ))}
          </Toolbar>
        </>
      )}

      {/* Groupings — UIF-010: radiogroup row with visible active state + aria-pressed */}
      {groupings && groupings.length > 0 && (
        <>
          <ToolbarDivider />
          <div
            role="radiogroup"
            aria-label="Group by"
            className={styles.groupings}
          >
            {groupings.map((g) => (
              // UIF-010: ToggleButton (not ToolbarToggleButton) exposes the `checked` prop,
              // which Fluent uses to derive aria-pressed. ToolbarToggleButton defers checked
              // state to the Toolbar context and does not accept checked directly.
              <ToggleButton
                key={g.key}
                checked={g.active}
                onClick={g.onSelect}
                size="small"
                appearance="subtle"
                // UIF-010: Active fill uses brand tokens for clear visual distinction.
                style={
                  g.active
                    ? { backgroundColor: tokens.colorBrandBackground2, color: tokens.colorBrandForeground1 }
                    : undefined
                }
              >
                {g.label}
              </ToggleButton>
            ))}
          </div>
        </>
      )}

      <div className={styles.spacer} />

      {/* Density indicator + override */}
      <div className={styles.densityControl}>
        <span className={styles.densityLabel}>{DENSITY_LABELS[effectiveDensity]}</span>
        {onDensityChange && (
          <select
            className={styles.densitySelect}
            value={effectiveDensity}
            onChange={(e) => onDensityChange(e.target.value as DensityTier)}
            aria-label="Density"
          >
            <option value="compact">Compact</option>
            <option value="standard">Standard</option>
            <option value="touch">Touch</option>
          </select>
        )}
      </div>

      {/* Column config trigger slot */}
      {columnConfigTrigger}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((a) => {
            const appearance = a.isDestructive ? 'subtle' : a.primary ? 'primary' : 'subtle';
            const btn = (
              <ToolbarButton
                key={a.key}
                icon={a.icon as React.JSX.Element | undefined}
                onClick={a.onClick}
                disabled={a.disabled}
                appearance={appearance}
                className={a.isDestructive ? styles.destructiveBtn : undefined}
              >
                {a.label}
              </ToolbarButton>
            );
            return a.tooltip ? (
              <HbcTooltip key={a.key} content={a.tooltip}>{btn}</HbcTooltip>
            ) : (
              <React.Fragment key={a.key}>{btn}</React.Fragment>
            );
          })}
        </div>
      )}

      {/* Overflow menu — PH4B.4 §4b.4.2 */}
      {overflowActions && overflowActions.length > 0 && (
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <ToolbarButton
              aria-label="More actions"
              icon={<MoreActions size="sm" /> as React.JSX.Element}
              appearance="subtle"
              className={styles.overflowBtn}
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {overflowActions.map((a) => (
                <MenuItem
                  key={a.key}
                  icon={a.icon as React.JSX.Element | undefined}
                  onClick={a.onClick}
                  disabled={a.disabled}
                >
                  {a.label}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      )}
    </div>
  );
};

export type {
  HbcCommandBarProps,
  CommandBarAction,
  CommandBarFilter,
  CommandBarGrouping,
  SavedView,
  SavedViewScope,
  DensityTier,
} from './types.js';
