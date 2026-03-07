import * as React from 'react';
import { Field, Textarea } from '@fluentui/react-components';

export interface HbcPeoplePickerProps {
  label: string;
  value: string[];
  onChange: (upns: string[]) => void;
  tenantId?: string;
  accessToken?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * D-PH6-10 minimal headless-compatible people picker.
 * Accepts newline/comma/semicolon-delimited UPNs and normalizes to unique values.
 */
export function HbcPeoplePicker({
  label,
  value,
  onChange,
  tenantId,
  accessToken,
  placeholder,
  required,
  disabled,
}: HbcPeoplePickerProps): React.ReactNode {
  void tenantId;
  void accessToken;

  const [rawValue, setRawValue] = React.useState(value.join(', '));

  React.useEffect(() => {
    setRawValue(value.join(', '));
  }, [value]);

  const parsePeople = React.useCallback((input: string): string[] => {
    return Array.from(
      new Set(
        input
          .split(/[\n,;]+/)
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
  }, []);

  return (
    <Field
      data-hbc-ui="people-picker"
      label={label}
      required={required}
      hint="Enter one or more user UPNs (email format), separated by comma, semicolon, or newline."
    >
      <Textarea
        value={rawValue}
        placeholder={placeholder ?? 'name@hb.com, teammate@hb.com'}
        disabled={disabled}
        resize="vertical"
        onChange={(_event, data) => {
          setRawValue(data.value);
          onChange(parsePeople(data.value));
        }}
      />
    </Field>
  );
}
