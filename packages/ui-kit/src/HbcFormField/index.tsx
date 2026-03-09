/**
 * HbcFormField — Complexity-sensitive form field stub
 * D-SF03-T07 / D-08: when complexitySensitive is true, gated at Standard by default.
 * When complexitySensitive is false (default), always renders (minTier = 'essential').
 *
 * Stub component — full implementation deferred to module phases.
 */
import * as React from 'react';
import { useComplexityGate } from '@hbc/complexity';
import type { HbcFormFieldProps } from './types.js';

export function HbcFormField({
  name,
  label,
  complexitySensitive = false,
  complexityMinTier = 'standard',
  complexityMaxTier,
}: HbcFormFieldProps): React.ReactElement | null {
  const isVisible = useComplexityGate({
    minTier: complexitySensitive ? complexityMinTier : 'essential',
    maxTier: complexityMaxTier,
  });

  if (!isVisible) return null;

  return (
    <div data-hbc-ui="HbcFormField" data-field-name={name}>
      <label>{label}</label>
      {/* T07 stub — full form field implementation in module phases */}
    </div>
  );
}

export type { HbcFormFieldProps } from './types.js';
