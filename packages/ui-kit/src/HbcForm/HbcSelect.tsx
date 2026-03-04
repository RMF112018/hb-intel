/**
 * HbcSelect — Thin Fluent v9 Combobox+Field wrapper with form context integration
 * Blueprint §1d — controlled props only, no form-library coupling
 * PH4.11 §Step 3 — fieldId, onChangeValidate, context registration, touch density
 */
import * as React from 'react';
import { Field, Combobox, Option } from '@fluentui/react-components';
import { useHbcFormContext } from './HbcFormContext.js';
import { useFormDensity } from './hooks/useFormDensity.js';
import type { HbcSelectProps } from './types.js';

export const HbcSelect: React.FC<HbcSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  validationMessage: externalValidation,
  className,
  fieldId,
  onChangeValidate,
}) => {
  const ctx = useHbcFormContext();
  const { tier, inputMinHeight } = useFormDensity();
  const [internalError, setInternalError] = React.useState<string | undefined>();
  const selectedOption = options.find((o) => o.value === value);

  // Register/unregister with form context
  React.useEffect(() => {
    if (fieldId) {
      ctx.registerField(fieldId, label);
      return () => ctx.unregisterField(fieldId);
    }
  }, [fieldId, label]); // ctx is stable via noop default or memoized provider

  const validationMessage = externalValidation ?? internalError;

  const handleOptionSelect = React.useCallback(
    (_e: unknown, data: { optionValue?: string }) => {
      if (!data.optionValue) return;
      onChange(data.optionValue);
      if (fieldId) ctx.markDirty(fieldId);

      if (onChangeValidate && fieldId) {
        const msg = onChangeValidate(data.optionValue);
        if (msg) {
          setInternalError(msg);
          ctx.setFieldError(fieldId, msg);
        } else {
          setInternalError(undefined);
          ctx.clearFieldError(fieldId);
        }
      }
    },
    [onChange, fieldId, ctx, onChangeValidate],
  );

  const comboStyle = tier === 'touch' ? { minHeight: `${inputMinHeight}px` } : undefined;

  return (
    <Field
      data-hbc-ui="select"
      id={fieldId ? `field-${fieldId}` : undefined}
      label={label}
      required={required}
      validationMessage={validationMessage}
      validationState={validationMessage ? 'error' : undefined}
      className={className}
    >
      <Combobox
        value={selectedOption?.label ?? ''}
        selectedOptions={value ? [value] : []}
        onOptionSelect={handleOptionSelect}
        placeholder={placeholder}
        disabled={disabled}
        style={comboStyle}
      >
        {options.map((opt) => (
          <Option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </Option>
        ))}
      </Combobox>
    </Field>
  );
};
