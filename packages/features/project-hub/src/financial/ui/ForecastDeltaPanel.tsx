/**
 * ForecastDeltaPanel — R4 region for Forecast Summary.
 * Prior version comparison with changed-field highlighting.
 */

import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Card, CardHeader, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';

import type { ForecastDeltaEntry } from '../hooks/useForecastSummary.js';

const DIRECTION_COLORS: Record<string, string> = {
  increase: HBC_STATUS_COLORS.critical,
  decrease: HBC_STATUS_COLORS.warning,
  unchanged: HBC_STATUS_COLORS.neutral,
};

const DIRECTION_ARROWS: Record<string, string> = {
  increase: '\u2191',
  decrease: '\u2193',
  unchanged: '=',
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_MD}px`,
    overflow: 'auto',
  },
  deltaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    padding: `${HBC_SPACE_SM}px`,
    borderBottom: '1px solid var(--colorNeutralStroke2)',
  },
  materialItem: {
    borderLeft: `3px solid ${HBC_STATUS_COLORS.warning}`,
    paddingLeft: `${HBC_SPACE_SM}px`,
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${HBC_SPACE_SM}px`,
  },
  valuesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  directionArrow: {
    fontSize: '14px',
    fontWeight: 700,
  },
  priorValueLabel: {
    color: 'var(--colorNeutralForeground3)',
  },
  explanation: {
    color: 'var(--colorNeutralForeground3)',
    fontStyle: 'italic',
  },
  emptyState: {
    color: 'var(--colorNeutralForeground3)',
    padding: `${HBC_SPACE_MD}px`,
    textAlign: 'center',
  },
});

export interface ForecastDeltaPanelProps {
  readonly deltas: readonly ForecastDeltaEntry[];
  readonly compareTarget: string | null;
}

export function ForecastDeltaPanel({
  deltas,
  compareTarget,
}: ForecastDeltaPanelProps): ReactNode {
  const styles = useStyles();
  const materialDeltas = deltas.filter(d => d.material);
  const otherDeltas = deltas.filter(d => !d.material);

  return (
    <div data-testid="forecast-delta-panel" className={styles.root}>
      <Card size="small">
        <CardHeader
          header={<Text weight="semibold" size={200}>Changed Since Prior</Text>}
          description={compareTarget ? <Text size={100} className={styles.priorValueLabel}>Comparing to {compareTarget}</Text> : undefined}
        />
      </Card>

      {materialDeltas.length > 0 && (
        <Card size="small">
          <CardHeader header={<Text weight="semibold" size={200}>Material Changes</Text>} />
          {materialDeltas.map((delta) => (
            <div key={delta.id} className={mergeClasses(styles.deltaItem, styles.materialItem)}>
              <div className={styles.fieldRow}>
                <Text size={200} weight="semibold">{delta.fieldLabel}</Text>
                <span
                  className={styles.directionArrow}
                  style={{ color: DIRECTION_COLORS[delta.direction] }}
                >
                  {DIRECTION_ARROWS[delta.direction]}
                </span>
              </div>
              <div className={styles.valuesRow}>
                <Text size={200} className={styles.priorValueLabel}>{delta.priorValue}</Text>
                <Text size={200}>{'\u2192'}</Text>
                <Text size={200} weight="semibold">{delta.currentValue}</Text>
              </div>
              {delta.explanation && (
                <Text size={100} className={styles.explanation}>{delta.explanation}</Text>
              )}
            </div>
          ))}
        </Card>
      )}

      {otherDeltas.length > 0 && (
        <Card size="small">
          <CardHeader header={<Text weight="semibold" size={200}>Other Changes</Text>} />
          {otherDeltas.map((delta) => (
            <div key={delta.id} className={styles.deltaItem}>
              <div className={styles.fieldRow}>
                <Text size={200}>{delta.fieldLabel}</Text>
                <Text size={200}>{delta.priorValue} {'\u2192'} {delta.currentValue}</Text>
              </div>
            </div>
          ))}
        </Card>
      )}

      {deltas.length === 0 && (
        <Text size={200} className={styles.emptyState}>No changes from prior version</Text>
      )}
    </div>
  );
}
