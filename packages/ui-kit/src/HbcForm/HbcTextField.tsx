/**
 * HbcTextField — D-07 dual-mode form field (RHF context + controlled fallback)
 * PH4B.15 §6 (HF-007) | PH4B-C D-07 | Blueprint §1d
 */
import * as React from 'react';
import { Field, Input } from '@fluentui/react-components';
import { useController } from 'react-hook-form';
import { useHbcFormContext } from './HbcFormContext.js';
import { useFormDensity } from './hooks/useFormDensity.js';
import type { HbcTextFieldProps } from './types.js';

function RhfTextField(props: HbcTextFieldProps): React.ReactElement {
  const {
    name = '',
    label,
    onChange,
    placeholder,
    required,
    disabled,
    validationMessage: externalValidation,
    type = 'text',
    className,
    fieldId,
    onBlurValidate,
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

  const validationMessage = externalValidation ?? error?.message ?? internalError;

  const handleBlur = React.useCallback(() => {
    field.onBlur();
    if (!onBlurValidate || !id) return;
    const message = onBlurValidate(String(field.value ?? ''));
    if (message) {
      setInternalError(message);
      ctx.setFieldError(id, message);
    } else {
      setInternalError(undefined);
      ctx.clearFieldError(id);
    }
  }, [ctx, field, id, onBlurValidate]);

  const handleChange = React.useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>, data: { value: string }) => {
      field.onChange(data.value);
      onChange?.(data.value);
      if (id) ctx.markDirty(id);
    },
    [ctx, field, id, onChange],
  );

  const inputStyle = tier === 'touch' ? { minHeight: `${inputMinHeight}px` } : undefined;

  return (
    <Field
      data-hbc-ui="text-field"
      id={id ? `field-${id}` : undefined}
      label={label}
      required={required}
      validationMessage={validationMessage}
      validationState={validationMessage ? 'error' : undefined}
      className={className}
    >
      <Input
        value={String(field.value ?? '')}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        style={inputStyle}
        ref={field.ref}
      />
    </Field>
  );
}

function ControlledTextField(props: HbcTextFieldProps): React.ReactElement {
  const {
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
  } = props;

  const ctx = useHbcFormContext();
  const { tier, inputMinHeight } = useFormDensity();
  const [internalError, setInternalError] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (fieldId) {
      ctx.registerField(fieldId, label);
      return () => ctx.unregisterField(fieldId);
    }
    return undefined;
  }, [ctx, fieldId, label]);

  const validationMessage = externalValidation ?? internalError;

  const handleBlur = React.useCallback(() => {
    if (!onBlurValidate || !fieldId) return;
    const message = onBlurValidate(value ?? '');
    if (message) {
      setInternalError(message);
      ctx.setFieldError(fieldId, message);
    } else {
      setInternalError(undefined);
      ctx.clearFieldError(fieldId);
    }
  }, [ctx, fieldId, onBlurValidate, value]);

  const handleChange = React.useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>, data: { value: string }) => {
      onChange?.(data.value);
      if (fieldId) ctx.markDirty(fieldId);
    },
    [ctx, fieldId, onChange],
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
        value={value ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        style={inputStyle}
      />
    </Field>
  );
}

export const HbcTextField: React.FC<HbcTextFieldProps> = (props) => {
  const ctx = useHbcFormContext();
  const useRhf = Boolean(props.name && ctx.isFormContextActive);

  // D-07 enforcement path: name+context uses centralized RHF validation.
  if (useRhf) return <RhfTextField {...props} />;

  // Backward-compatible path for existing controlled consumers.
  return <ControlledTextField {...props} />;
};
