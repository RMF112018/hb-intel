import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_DENSITY_TOKENS,
  HBC_SPACE_SM,
  HBC_SPACE_XS,
  Text,
  useDensity,
} from '@hbc/ui-kit';

import type { ProjectHubModulePostureSummary } from '../types.js';

// ── Posture color mapping ───────────────────────────────────────────

const POSTURE_COLORS: Record<ProjectHubModulePostureSummary['posture'], string> = {
  healthy: '#107C10',
  watch: '#CA5010',
  'at-risk': '#D83B01',
  critical: '#A4262C',
  'no-data': '#8A8886',
  'read-only': '#0078D4',
};

// ── Styles ──────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: '1px solid #edebe9',
    backgroundColor: '#faf9f8',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${HBC_SPACE_SM}px`,
    borderBottom: '1px solid #edebe9',
  },
  collapseButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: `${HBC_SPACE_XS}px`,
    fontSize: '14px',
    color: '#605e5c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    minHeight: '24px',
  },
  moduleList: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  moduleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px`,
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    transitionProperty: 'background-color, border-color',
    transitionDuration: '150ms',
    ':hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  moduleRowComfortable: {
    minHeight: `${HBC_DENSITY_TOKENS.comfortable.touchTargetMin}px`,
    padding: `${HBC_DENSITY_TOKENS.comfortable.tapSpacingMin}px ${HBC_SPACE_SM}px`,
  },
  moduleRowTouch: {
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
    padding: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px ${HBC_SPACE_SM}px`,
  },
  moduleRowSelected: {
    borderLeftColor: '#0078D4',
    backgroundColor: '#f3f2f1',
  },
  postureDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  postureDotTouch: {
    width: '14px',
    height: '14px',
  },
  moduleLabel: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
    backgroundColor: '#edebe9',
    fontSize: '11px',
    fontWeight: 600,
    color: '#323130',
    padding: '0 4px',
    flexShrink: 0,
  },
  countBadgeUrgent: {
    backgroundColor: '#FDE7E9',
    color: '#A4262C',
  },
  collapsedRoot: {
    alignItems: 'center',
  },
  collapsedRow: {
    justifyContent: 'center',
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_XS}px`,
  },
});

// ── Component ───────────────────────────────────────────────────────

export interface CommandRailProps {
  readonly modules: readonly ProjectHubModulePostureSummary[];
  readonly selectedModuleSlug: string | null;
  readonly onModuleSelect: (slug: string | null) => void;
  readonly collapsed: boolean;
  readonly onToggleCollapse: () => void;
}

export function CommandRail({
  modules,
  selectedModuleSlug,
  onModuleSelect,
  collapsed,
  onToggleCollapse,
}: CommandRailProps): ReactNode {
  const styles = useStyles();
  const { tier: densityTier } = useDensity();

  const handleClick = (slug: string): void => {
    onModuleSelect(selectedModuleSlug === slug ? null : slug);
  };

  return (
    <nav
      data-testid="command-rail"
      data-collapsed={collapsed}
      className={mergeClasses(styles.root, collapsed && styles.collapsedRoot)}
    >
      <div className={styles.header}>
        {!collapsed && <Text weight="semibold" size={200}>Modules</Text>}
        <button
          type="button"
          className={styles.collapseButton}
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand command rail' : 'Collapse command rail'}
        >
          {collapsed ? '\u203A' : '\u2039'}
        </button>
      </div>
      <div className={styles.moduleList}>
        {modules.map((mod) => {
          const isSelected = selectedModuleSlug === mod.moduleSlug;
          const totalCount = mod.issueCount + mod.actionCount;

          return (
            <button
              key={mod.moduleSlug}
              type="button"
              data-testid={`command-rail-module-${mod.moduleSlug}`}
              data-posture={mod.posture}
              className={mergeClasses(
                styles.moduleRow,
                densityTier === 'comfortable' && styles.moduleRowComfortable,
                densityTier === 'touch' && styles.moduleRowTouch,
                isSelected && styles.moduleRowSelected,
                collapsed && styles.collapsedRow,
              )}
              onClick={() => handleClick(mod.moduleSlug)}
              aria-pressed={isSelected}
              title={collapsed ? `${mod.label} — ${mod.posture}` : undefined}
            >
              <span
                className={mergeClasses(
                  styles.postureDot,
                  densityTier === 'touch' && styles.postureDotTouch,
                )}
                style={{ backgroundColor: POSTURE_COLORS[mod.posture] }}
                aria-label={mod.posture}
              />
              {!collapsed && (
                <>
                  <span className={styles.moduleLabel}>
                    <Text size={200}>{mod.label}</Text>
                  </span>
                  {totalCount > 0 && (
                    <span
                      className={mergeClasses(
                        styles.countBadge,
                        mod.issueCount > 0 && styles.countBadgeUrgent,
                      )}
                    >
                      {totalCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
