/**
 * HbcFormField — Complexity-sensitive form field wrapper
 * D-SF03-T07 / D-08: when complexitySensitive is true, gated at Standard by default.
 * When complexitySensitive is false (default), always renders (minTier = 'essential').
 */
import * as React from 'react';
import { makeStyles } from '@griffel/react';
import { useComplexityGate } from '@hbc/complexity';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { HBC_SPACE_XS } from '../theme/grid.js';
import type { HbcFormFieldProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
});

export function HbcFormField({
  name,
  label,
  complexitySensitive = false,
  complexityMinTier = 'standard',
  complexityMaxTier,
}: HbcFormFieldProps): React.ReactElement | null {
  const styles = useStyles();
  const isVisible = useComplexityGate({
    minTier: complexitySensitive ? complexityMinTier : 'essential',
    maxTier: complexityMaxTier,
  });

  if (!isVisible) return null;

  return (
    <div data-hbc-ui="HbcFormField" data-field-name={name} className={styles.root}>
      <label className={styles.label} htmlFor={`hbc-field-${name}`}>{label}</label>
    </div>
  );
}

export type { HbcFormFieldProps } from './types.js';
