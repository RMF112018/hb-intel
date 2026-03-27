import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  Card,
  CardHeader,
  HBC_DENSITY_TOKENS,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  HbcButton,
  Text,
} from '@hbc/ui-kit';

import type { FieldActionItem } from '../hooks/useFieldFocusSummary.js';

const SEVERITY_COLORS: Record<FieldActionItem['severity'], string> = {
  critical: '#A4262C',
  high: '#D83B01',
  standard: '#0078D4',
};

const CATEGORY_LABELS: Record<FieldActionItem['category'], string> = {
  observation: 'Observation',
  inspection: 'Inspection',
  'punch-qc-safety': 'Punch / QC / Safety',
  'next-move': 'Next Move',
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
    overflow: 'auto',
    padding: `${HBC_SPACE_MD}px`,
    flex: 1,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Touch-first: minimum target height
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
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
    backgroundColor: '#edebe9',
    color: '#323130',
  },
  card: {
    // Touch-first: generous card sizing
    minHeight: `${HBC_DENSITY_TOKENS.touch.rowHeightMin * 2}px`,
  },
  cardBody: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px`,
  },
  severityStrip: {
    width: '4px',
    borderRadius: '2px',
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${HBC_SPACE_SM}px`,
    alignItems: 'center',
  },
  categoryTag: {
    display: 'inline-flex',
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#EFF6FC',
    color: '#0078D4',
  },
  actionsRow: {
    display: 'flex',
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
    flexWrap: 'wrap',
    marginTop: '4px',
    // Touch-first: buttons must meet minimum target
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
  },
  emptyMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '120px',
    color: '#8A8886',
  },
});

export interface FieldActionStackProps {
  readonly items: readonly FieldActionItem[];
  readonly selectedAreaId: string | null;
  readonly onOpenModule: (slug: string) => void;
}

export function FieldActionStack({
  items,
  selectedAreaId,
  onOpenModule,
}: FieldActionStackProps): ReactNode {
  const styles = useStyles();

  const filteredItems = selectedAreaId
    ? items.filter((i) => i.areaId === selectedAreaId)
    : items;

  // Group by category for organized display
  const categories: FieldActionItem['category'][] = ['inspection', 'observation', 'punch-qc-safety', 'next-move'];

  return (
    <div data-testid="field-action-stack" className={styles.root}>
      {categories.map((category) => {
        const categoryItems = filteredItems.filter((i) => i.category === category);
        if (categoryItems.length === 0) return null;
        return (
          <div key={category}>
            <div className={styles.sectionHeader}>
              <Text weight="semibold" size={300}>{CATEGORY_LABELS[category]}</Text>
              <span className={styles.countBadge}>{categoryItems.length}</span>
            </div>
            {categoryItems.map((item) => (
              <Card key={item.id} size="small" className={styles.card} data-testid={`field-action-${item.id}`}>
                <CardHeader
                  header={<Text weight="semibold" size={300}>{item.title}</Text>}
                />
                <div className={styles.cardBody}>
                  <span
                    className={styles.severityStrip}
                    style={{ backgroundColor: SEVERITY_COLORS[item.severity] }}
                  />
                  <div className={styles.cardContent}>
                    <div className={styles.meta}>
                      <span className={styles.categoryTag}>{CATEGORY_LABELS[item.category]}</span>
                      <Text size={200} style={{ color: '#605e5c' }}>{item.areaLabel}</Text>
                      <Text size={200} style={{ color: '#605e5c' }}>{item.owner}</Text>
                    </div>
                    {item.dueLabel && (
                      <Text
                        size={200}
                        weight="semibold"
                        style={{ color: item.ageDays != null && item.ageDays > 0 ? '#A4262C' : '#323130' }}
                      >
                        {item.dueLabel}
                      </Text>
                    )}
                    <div className={styles.actionsRow}>
                      <HbcButton
                        variant="secondary"
                        onClick={() => onOpenModule(item.sourceModule)}
                      >
                        Open
                      </HbcButton>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );
      })}

      {filteredItems.length === 0 && (
        <div className={styles.emptyMessage}>
          <Text size={300}>No action items{selectedAreaId ? ' in this area' : ''}</Text>
        </div>
      )}
    </div>
  );
}
