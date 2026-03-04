/**
 * HbcCheckbox — Thin Fluent v9 Checkbox+Field wrapper with form context integration
 * Blueprint §1d — controlled props only, no form-library coupling
 * PH4.11 §Step 3 — fieldId, context registration, dirty tracking
 */
import * as React from 'react';
import { Checkbox } from '@fluentui/react-components';
import { useHbcFormContext } from './HbcFormContext.js';
import type { HbcCheckboxProps } from './types.js';

export const HbcCheckbox: React.FC<HbcCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled,
  className,
  fieldId,
}) => {
  const ctx = useHbcFormContext();

  // Register/unregister with form context
  React.useEffect(() => {
    if (fieldId) {
      ctx.registerField(fieldId, label);
      return () => ctx.unregisterField(fieldId);
    }
  }, [fieldId, label]); // ctx is stable via noop default or memoized provider

  const handleChange = React.useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>, data: { checked: boolean | 'mixed' }) => {
      onChange(!!data.checked);
      if (fieldId) ctx.markDirty(fieldId);
    },
    [onChange, fieldId, ctx],
  );

  return (
    <Checkbox
      data-hbc-ui="checkbox"
      id={fieldId ? `field-${fieldId}` : undefined}
      label={label}
      checked={checked}
      onChange={handleChange}
      disabled={disabled}
      className={className}
    />
  );
};
