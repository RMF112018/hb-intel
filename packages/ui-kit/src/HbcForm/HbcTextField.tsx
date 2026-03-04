/**
 * HbcTextField — Thin Fluent v9 Input+Field wrapper with form context integration
 * Blueprint §1d — controlled props only, no form-library coupling
 * PH4.11 §Step 3 — fieldId, onBlurValidate, context registration, touch density
 */
import * as React from 'react';
import { Field, Input } from '@fluentui/react-components';
import { useHbcFormContext } from './HbcFormContext.js';
import { useFormDensity } from './hooks/useFormDensity.js';
import type { HbcTextFieldProps } from './types.js';

export const HbcTextField: React.FC<HbcTextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  validationMessage: externalValidation,
  type = 'text',
  className,
  fieldId,
  onBlurValidate,
}) => {
  const ctx = useHbcFormContext();
  const { tier, inputMinHeight } = useFormDensity();
  const [internalError, setInternalError] = React.useState<string | undefined>();

  // Register/unregister with form context
  React.useEffect(() => {
    if (fieldId) {
      ctx.registerField(fieldId, label);
      return () => ctx.unregisterField(fieldId);
    }
  }, [fieldId, label]); // ctx is stable via noop default or memoized provider

  const validationMessage = externalValidation ?? internalError;

  const handleBlur = React.useCallback(() => {
    if (!onBlurValidate || !fieldId) return;
    const msg = onBlurValidate(value);
    if (msg) {
      setInternalError(msg);
      ctx.setFieldError(fieldId, msg);
    } else {
      setInternalError(undefined);
      ctx.clearFieldError(fieldId);
    }
  }, [onBlurValidate, fieldId, value, ctx]);

  const handleChange = React.useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>, data: { value: string }) => {
      onChange(data.value);
      if (fieldId) ctx.markDirty(fieldId);
    },
    [onChange, fieldId, ctx],
  );

  const inputStyle = tier === 'touch' ? { minHeight: `${inputMinHeight}px` } : undefined;

  return (
    <Field
      data-hbc-ui="text-field"
      id={fieldId ? `field-${fieldId}` : undefined}
      label={label}
      required={required}
      validationMessage={validationMessage}
      validationState={validationMessage ? 'error' : undefined}
      className={className}
    >
      <Input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        style={inputStyle}
      />
    </Field>
  );
};
