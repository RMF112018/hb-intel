import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_DENSITY_TOKENS,
  HBC_SPACE_SM,
  HBC_SPACE_XS,
  Text,
} from '@hbc/ui-kit';

import type { FieldFocusArea } from '../hooks/useFieldFocusSummary.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: '1px solid #edebe9',
    backgroundColor: '#faf9f8',
  },
  header: {
    padding: `${HBC_SPACE_SM}px`,
    borderBottom: '1px solid #edebe9',
  },
  areaList: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  areaItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${HBC_SPACE_SM}px`,
    // Touch-first: minimum 48px height, generous padding
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
    padding: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px ${HBC_SPACE_SM}px`,
    cursor: 'pointer',
    borderLeft: '4px solid transparent',
    borderBottom: '1px solid #f3f2f1',
    transitionProperty: 'background-color, border-color',
    transitionDuration: '150ms',
    ':hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  areaItemSelected: {
    borderLeftColor: '#0078D4',
    backgroundColor: '#EFF6FC',
  },
  areaLabel: {
    flex: 1,
    minWidth: 0,
  },
  countGroup: {
    display: 'flex',
    gap: `${HBC_SPACE_XS}px`,
    flexShrink: 0,
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    height: '24px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    padding: '0 6px',
  },
  countOpen: {
    backgroundColor: '#edebe9',
    color: '#323130',
  },
  countUrgent: {
    backgroundColor: '#FDE7E9',
    color: '#A4262C',
  },
  allAreasButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
    padding: `${HBC_SPACE_SM}px`,
    borderTop: '1px solid #edebe9',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    ':hover': {
      backgroundColor: '#f3f2f1',
    },
  },
});

export interface FieldFocusRailProps {
  readonly areas: readonly FieldFocusArea[];
  readonly selectedAreaId: string | null;
  readonly onSelectArea: (areaId: string | null) => void;
}

export function FieldFocusRail({
  areas,
  selectedAreaId,
  onSelectArea,
}: FieldFocusRailProps): ReactNode {
  const styles = useStyles();

  return (
    <nav data-testid="field-focus-rail" className={styles.root}>
      <div className={styles.header}>
        <Text weight="semibold" size={300}>Work Areas</Text>
      </div>
      <div className={styles.areaList}>
        {areas.map((area) => {
          const isSelected = selectedAreaId === area.id;
          return (
            <button
              key={area.id}
              type="button"
              data-testid={`field-area-${area.id}`}
              className={mergeClasses(
                styles.areaItem,
                isSelected && styles.areaItemSelected,
              )}
              onClick={() => onSelectArea(isSelected ? null : area.id)}
              aria-pressed={isSelected}
            >
              <div className={styles.areaLabel}>
                <Text size={300} weight="semibold">{area.label}</Text>
                <br />
                <Text size={200} style={{ color: '#605e5c' }}>{area.description}</Text>
              </div>
              <div className={styles.countGroup}>
                {area.urgentItemCount > 0 && (
                  <span className={mergeClasses(styles.countBadge, styles.countUrgent)}>
                    {area.urgentItemCount}
                  </span>
                )}
                <span className={mergeClasses(styles.countBadge, styles.countOpen)}>
                  {area.openItemCount}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {selectedAreaId && (
        <button
          type="button"
          className={styles.allAreasButton}
          onClick={() => onSelectArea(null)}
        >
          <Text size={200} style={{ color: '#0078D4' }}>Show all areas</Text>
        </button>
      )}
    </nav>
  );
}
