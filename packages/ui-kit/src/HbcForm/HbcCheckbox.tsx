/**
 * HbcCheckbox — Thin Fluent v9 Checkbox+Field wrapper
 * Blueprint §1d — controlled props only, no form-library coupling
 */
import * as React from 'react';
import { Checkbox } from '@fluentui/react-components';
import type { HbcCheckboxProps } from './types.js';

export const HbcCheckbox: React.FC<HbcCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled,
  className,
}) => {
  return (
    <Checkbox
      data-hbc-ui="checkbox"
      label={label}
      checked={checked}
      onChange={(_e, data) => onChange(!!data.checked)}
      disabled={disabled}
      className={className}
    />
  );
};
