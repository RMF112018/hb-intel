/**
 * ForecastSummaryForm — R3 region for Forecast Summary.
 * State-aware: editing / comparing / reviewing / read-only behaviors.
 * Grouped sections with inline validation, prior-value indicators,
 * and dirty-field tracking.
 */

import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Card, CardHeader, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';

import type { ForecastFormSection, ForecastSurfaceState } from '../hooks/useForecastSummary.js';

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
    transitionProperty: 'border-color, background-color',
    transitionDuration: '150ms',
  },
  fieldChanged: {
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: HBC_STATUS_COLORS.warning,
  },
  fieldDirty: {
    borderTopColor: 'var(--colorBrandStroke1)',
    borderRightColor: 'var(--colorBrandStroke1)',
    borderBottomColor: 'var(--colorBrandStroke1)',
    borderLeftColor: 'var(--colorBrandStroke1)',
    backgroundColor: 'var(--colorBrandBackground2)',
  },
  fieldCompareHighlight: {
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: HBC_STATUS_COLORS.info,
    backgroundColor: 'var(--colorNeutralBackground3)',
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
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'var(--colorNeutralBackground3)',
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: 'var(--colorBrandStroke1)',
      outlineOffset: '-2px',
    },
  },
  priorValue: {
    fontSize: '11px',
    color: 'var(--colorNeutralForeground3)',
  },
  validationMsg: {
    fontSize: '11px',
    color: HBC_STATUS_COLORS.warning,
  },
  provenanceLabel: {
    fontSize: '10px',
    color: 'var(--colorNeutralForeground3)',
    fontStyle: 'italic',
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
  readOnlyTag: {
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--colorNeutralForeground3)',
    backgroundColor: 'var(--colorNeutralBackground3)',
    padding: '1px 6px',
    borderRadius: '3px',
    alignSelf: 'flex-start',
  },
});

export interface ForecastSummaryFormProps {
  readonly sections: readonly ForecastFormSection[];
  readonly isEditable: boolean;
  readonly dirtyFields?: ReadonlySet<string>;
  readonly isCompareMode?: boolean;
  readonly surfaceState?: ForecastSurfaceState;
  readonly onEditField?: (fieldId: string, value: string) => void;
}

export function ForecastSummaryForm({
  sections,
  isEditable,
  dirtyFields,
  isCompareMode = false,
  surfaceState = 'editing',
  onEditField,
}: ForecastSummaryFormProps): ReactNode {
  const styles = useStyles();

  return (
    <div
      data-testid="forecast-summary-form"
      data-surface-state={surfaceState}
      className={styles.root}
    >
      {sections.map((section) => (
        <Card key={section.id} size="small">
          <CardHeader header={<Text weight="semibold" size={200}>{section.title}</Text>} />
          <div className={styles.fieldGrid}>
            {section.fields.map((field) => {
              const isDirty = dirtyFields?.has(field.id) ?? false;
              const showCompare = isCompareMode && field.changedFromPrior;
              const canEdit = field.editable && isEditable;

              return (
                <div
                  key={field.id}
                  className={mergeClasses(
                    styles.fieldItem,
                    field.changedFromPrior && !isCompareMode && styles.fieldChanged,
                    isDirty && styles.fieldDirty,
                    showCompare && styles.fieldCompareHighlight,
                    canEdit && styles.fieldEditable,
                  )}
                  data-testid={`forecast-field-${field.id}`}
                  data-changed={field.changedFromPrior}
                  data-editable={canEdit}
                  data-dirty={isDirty}
                  role={canEdit ? 'button' : undefined}
                  tabIndex={canEdit ? 0 : undefined}
                  aria-label={canEdit ? `Edit ${field.label}` : undefined}
                  onClick={canEdit ? () => onEditField?.(field.id, field.value) : undefined}
                  onKeyDown={canEdit
                    ? (e) => { if (e.key === 'Enter' || e.key === ' ') onEditField?.(field.id, field.value); }
                    : undefined
                  }
                >
                  <span className={styles.fieldLabel}>{field.label}</span>
                  <span className={styles.fieldValue}>{field.value}</span>

                  {canEdit && <span className={styles.editableTag}>Editable</span>}
                  {surfaceState === 'read-only' && <span className={styles.readOnlyTag}>Read Only</span>}
                  {surfaceState === 'reviewing' && field.changedFromPrior && (
                    <span className={styles.editableTag}>Changed</span>
                  )}

                  {field.changedFromPrior && field.priorValue && (
                    <span className={styles.priorValue}>
                      {isCompareMode ? `V3: ${field.priorValue}` : `Prior: ${field.priorValue}`}
                    </span>
                  )}

                  {field.provenance && (
                    <span className={styles.provenanceLabel}>{field.provenance}</span>
                  )}

                  {field.validationMessage && (
                    <span className={styles.validationMsg}>{field.validationMessage}</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
