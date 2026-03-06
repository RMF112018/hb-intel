/**
 * HbcSelect — D-07 dual-mode select field (RHF context + controlled fallback)
 * PH4B.15 §6 (HF-007) | PH4B-C D-07 | Blueprint §1d
 */
import * as React from 'react';
import { Combobox, Field, Option } from '@fluentui/react-components';
import { useController } from 'react-hook-form';
import { useHbcFormContext } from './HbcFormContext.js';
import { useFormDensity } from './hooks/useFormDensity.js';
import type { HbcSelectProps } from './types.js';

function RhfSelect(props: HbcSelectProps): React.ReactElement {
  const {
    name = '',
    label,
    onChange,
    options,
    placeholder,
    required,
    disabled,
    validationMessage: externalValidation,
    className,
    fieldId,
    onChangeValidate,
  } = props;

  const ctx = useHbcFormContext();
  const { tier, inputMinHeight } = useFormDensity();
  const [internalError, setInternalError] = React.useState<string | undefined>();
  const id = fieldId ?? name;

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: ctx.control,
  });

  React.useEffect(() => {
    if (id) {
      ctx.registerField(id, label);
      return () => ctx.unregisterField(id);
    }
    return undefined;
  }, [ctx, id, label]);

  const value = String(field.value ?? '');
  const selectedOption = options.find((opt) => opt.value === value);
  const validationMessage = externalValidation ?? error?.message ?? internalError;

  const handleOptionSelect = React.useCallback(
    (_e: unknown, data: { optionValue?: string }) => {
      if (!data.optionValue) return;

      field.onChange(data.optionValue);
      onChange?.(data.optionValue);
      if (id) ctx.markDirty(id);

      if (onChangeValidate && id) {
        const message = onChangeValidate(data.optionValue);
        if (message) {
          setInternalError(message);
          ctx.setFieldError(id, message);
        } else {
          setInternalError(undefined);
          ctx.clearFieldError(id);
        }
      }
    },
    [ctx, field, id, onChange, onChangeValidate],
  );

  const comboStyle = tier === 'touch' ? { minHeight: `${inputMinHeight}px` } : undefined;

  return (
    <Field
      data-hbc-ui="select"
      id={id ? `field-${id}` : undefined}
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
        onBlur={field.onBlur}
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
}

function ControlledSelect(props: HbcSelectProps): React.ReactElement {
  const {
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
  } = props;

  const ctx = useHbcFormContext();
  const { tier, inputMinHeight } = useFormDensity();
  const [internalError, setInternalError] = React.useState<string | undefined>();
  const selectedOption = options.find((opt) => opt.value === (value ?? ''));

  React.useEffect(() => {
    if (fieldId) {
      ctx.registerField(fieldId, label);
      return () => ctx.unregisterField(fieldId);
    }
    return undefined;
  }, [ctx, fieldId, label]);

  const validationMessage = externalValidation ?? internalError;

  const handleOptionSelect = React.useCallback(
    (_e: unknown, data: { optionValue?: string }) => {
      if (!data.optionValue) return;
      onChange?.(data.optionValue);
      if (fieldId) ctx.markDirty(fieldId);

      if (onChangeValidate && fieldId) {
        const message = onChangeValidate(data.optionValue);
        if (message) {
          setInternalError(message);
          ctx.setFieldError(fieldId, message);
        } else {
          setInternalError(undefined);
          ctx.clearFieldError(fieldId);
        }
      }
    },
    [ctx, fieldId, onChange, onChangeValidate],
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
}

export const HbcSelect: React.FC<HbcSelectProps> = (props) => {
  const ctx = useHbcFormContext();
  const useRhf = Boolean(props.name && ctx.isFormContextActive);

  // D-07 enforcement path: name+context uses centralized RHF validation.
  if (useRhf) return <RhfSelect {...props} />;

  // Backward-compatible path for existing controlled consumers.
  return <ControlledSelect {...props} />;
};
