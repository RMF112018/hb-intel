/**
 * ForecastSummaryForm — R3 region for Forecast Summary.
 * Grouped editable sections with inline validation and prior-value indicators.
 */

import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Card, CardHeader, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';

import type { ForecastFormSection } from '../hooks/useForecastSummary.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_MD}px`,
    padding: `${HBC_SPACE_MD}px`,
    overflow: 'auto',
    flex: 1,
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: `${HBC_SPACE_SM}px`,
    padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px`,
  },
  fieldItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    padding: `${HBC_SPACE_SM}px`,
    borderRadius: '4px',
    backgroundColor: 'var(--colorNeutralBackground2)',
    border: '1px solid var(--colorNeutralStroke2)',
  },
  fieldChanged: {
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: HBC_STATUS_COLORS.warning,
  },
  fieldLabel: {
    fontSize: '11px',
    color: 'var(--colorNeutralForeground3)',
  },
  fieldValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--colorNeutralForeground1)',
  },
  fieldEditable: {
    color: 'var(--colorBrandForeground1)',
  },
  priorValue: {
    fontSize: '11px',
    color: 'var(--colorNeutralForeground3)',
  },
  validationMsg: {
    fontSize: '11px',
    color: HBC_STATUS_COLORS.warning,
  },
  editableTag: {
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--colorBrandForeground1)',
    backgroundColor: 'var(--colorBrandBackground2)',
    padding: '1px 6px',
    borderRadius: '3px',
    alignSelf: 'flex-start',
  },
});

export interface ForecastSummaryFormProps {
  readonly sections: readonly ForecastFormSection[];
  readonly isEditable: boolean;
}

export function ForecastSummaryForm({
  sections,
  isEditable,
}: ForecastSummaryFormProps): ReactNode {
  const styles = useStyles();

  return (
    <div data-testid="forecast-summary-form" className={styles.root}>
      {sections.map((section) => (
        <Card key={section.id} size="small">
          <CardHeader header={<Text weight="semibold" size={200}>{section.title}</Text>} />
          <div className={styles.fieldGrid}>
            {section.fields.map((field) => (
              <div
                key={field.id}
                className={mergeClasses(
                  styles.fieldItem,
                  field.changedFromPrior && styles.fieldChanged,
                )}
                data-testid={`forecast-field-${field.id}`}
                data-changed={field.changedFromPrior}
                data-editable={field.editable && isEditable}
              >
                <span className={styles.fieldLabel}>{field.label}</span>
                <span className={mergeClasses(
                  styles.fieldValue,
                  field.editable && isEditable && styles.fieldEditable,
                )}>
                  {field.value}
                </span>
                {field.editable && isEditable && (
                  <span className={styles.editableTag}>Editable</span>
                )}
                {field.changedFromPrior && field.priorValue && (
                  <span className={styles.priorValue}>Prior: {field.priorValue}</span>
                )}
                {field.validationMessage && (
                  <span className={styles.validationMsg}>{field.validationMessage}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
