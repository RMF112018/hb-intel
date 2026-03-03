/**
 * HbcTextField — Thin Fluent v9 Input+Field wrapper
 * Blueprint §1d — controlled props only, no form-library coupling
 */
import * as React from 'react';
import { Field, Input } from '@fluentui/react-components';
import type { HbcTextFieldProps } from './types.js';

export const HbcTextField: React.FC<HbcTextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  validationMessage,
  type = 'text',
  className,
}) => {
  return (
    <Field
      data-hbc-ui="text-field"
      label={label}
      required={required}
      validationMessage={validationMessage}
      validationState={validationMessage ? 'error' : undefined}
      className={className}
    >
      <Input
        value={value}
        onChange={(_e, data) => onChange(data.value)}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
      />
    </Field>
  );
};
