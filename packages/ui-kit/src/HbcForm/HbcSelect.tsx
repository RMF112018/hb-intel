/**
 * HbcSelect — Thin Fluent v9 Combobox+Field wrapper
 * Blueprint §1d — controlled props only, no form-library coupling
 */
import * as React from 'react';
import { Field, Combobox, Option } from '@fluentui/react-components';
import type { HbcSelectProps } from './types.js';

export const HbcSelect: React.FC<HbcSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  validationMessage,
  className,
}) => {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <Field
      data-hbc-ui="select"
      label={label}
      required={required}
      validationMessage={validationMessage}
      validationState={validationMessage ? 'error' : undefined}
      className={className}
    >
      <Combobox
        value={selectedOption?.label ?? ''}
        selectedOptions={value ? [value] : []}
        onOptionSelect={(_e, data) => {
          if (data.optionValue) onChange(data.optionValue);
        }}
        placeholder={placeholder}
        disabled={disabled}
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
