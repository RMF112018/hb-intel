import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  Card,
  CardHeader,
  HBC_DENSITY_TOKENS,
  HBC_SPACE_SM,
  HBC_SPACE_XS,
  HbcButton,
  Text,
  useDensity,
} from '@hbc/ui-kit';

import type { InterventionItem, InterventionQueue } from '../hooks/useInterventionQueue.js';

const URGENCY_COLORS: Record<InterventionItem['urgency'], string> = {
  critical: '#A4262C',
  high: '#D83B01',
  standard: '#0078D4',
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
    overflowY: 'auto',
    overflowX: 'hidden',
    borderLeft: '1px solid #edebe9',
    backgroundColor: '#faf9f8',
    padding: `${HBC_SPACE_SM}px`,
  },
  rootComfortable: {
    gap: `${Math.max(HBC_SPACE_SM, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
    padding: `${HBC_DENSITY_TOKENS.comfortable.tapSpacingMin}px`,
  },
  rootTouch: {
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
    padding: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '18px',
    borderRadius: '9px',
    backgroundColor: '#FDE7E9',
    color: '#A4262C',
    fontSize: '11px',
    fontWeight: 600,
    padding: '0 4px',
  },
  urgencyStrip: {
    width: '4px',
    borderRadius: '2px',
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  cardBody: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px`,
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
  },
  actionsRow: {
    display: 'flex',
    gap: `${HBC_SPACE_XS}px`,
    flexWrap: 'wrap',
    marginTop: `${HBC_SPACE_XS}px`,
  },
});

export interface InterventionRailProps {
  readonly queue: InterventionQueue;
  readonly onOpenModule: (slug: string) => void;
}

export function InterventionRail({
  queue,
  onOpenModule,
}: InterventionRailProps): ReactNode {
  const styles = useStyles();
  const { tier: densityTier } = useDensity();

  return (
    <aside
      data-testid="intervention-rail"
      className={mergeClasses(
        styles.root,
        densityTier === 'comfortable' && styles.rootComfortable,
        densityTier === 'touch' && styles.rootTouch,
      )}
    >
      <div className={styles.headerRow}>
        <Text weight="semibold" size={200}>Interventions</Text>
        {queue.criticalCount > 0 && (
          <span className={styles.countBadge}>{queue.criticalCount}</span>
        )}
      </div>

      {queue.items.map((item) => (
        <Card key={item.id} size="small" data-testid={`intervention-item-${item.id}`}>
          <CardHeader
            header={<Text weight="semibold" size={200}>{item.title}</Text>}
            description={<Text size={200} style={{ color: '#605e5c' }}>{item.affectedProject}</Text>}
          />
          <div className={styles.cardBody}>
            <span
              className={styles.urgencyStrip}
              style={{ backgroundColor: URGENCY_COLORS[item.urgency] }}
            />
            <div className={styles.cardContent}>
              <Text size={200}>
                <strong>Source:</strong> {item.signalSource}
              </Text>
              <Text size={200}>
                <strong>Owner:</strong> {item.owner}
              </Text>
              <Text size={200}>
                <strong>Action:</strong> {item.recommendedAction}
              </Text>
              <div className={styles.actionsRow}>
                <HbcButton
                  variant="secondary"
                  onClick={() => onOpenModule(item.sourceModule)}
                >
                  Open {item.sourceModule}
                </HbcButton>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {queue.items.length === 0 && (
        <Text size={200} style={{ color: '#8A8886' }}>No intervention items</Text>
      )}
    </aside>
  );
}
