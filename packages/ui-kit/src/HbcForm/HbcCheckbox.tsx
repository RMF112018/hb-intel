/**
 * HbcCheckbox — D-07 dual-mode checkbox (RHF context + controlled fallback)
 * PH4B.15 §6 (HF-007) | PH4B-C D-07 | Blueprint §1d
 */
import * as React from 'react';
import { Checkbox } from '@fluentui/react-components';
import { useController } from 'react-hook-form';
import { useHbcFormContext } from './HbcFormContext.js';
import type { HbcCheckboxProps } from './types.js';

function RhfCheckbox(props: HbcCheckboxProps): React.ReactElement {
  const {
    name = '',
    label,
    onChange,
    disabled,
    className,
    fieldId,
  } = props;
  const ctx = useHbcFormContext();
  const id = fieldId ?? name;

  const { field } = useController({
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

  const handleChange = React.useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>, data: { checked: boolean | 'mixed' }) => {
      const nextChecked = !!data.checked;
      field.onChange(nextChecked);
      onChange?.(nextChecked);
      if (id) ctx.markDirty(id);
    },
    [ctx, field, id, onChange],
  );

  return (
    <Checkbox
      data-hbc-ui="checkbox"
      id={id ? `field-${id}` : undefined}
      label={label}
      checked={!!field.value}
      onChange={handleChange}
      onBlur={field.onBlur}
      disabled={disabled}
      className={className}
      ref={field.ref}
    />
  );
}

function ControlledCheckbox(props: HbcCheckboxProps): React.ReactElement {
  const {
    label,
    checked,
    onChange,
    disabled,
    className,
    fieldId,
  } = props;
  const ctx = useHbcFormContext();

  React.useEffect(() => {
    if (fieldId) {
      ctx.registerField(fieldId, label);
      return () => ctx.unregisterField(fieldId);
    }
    return undefined;
  }, [ctx, fieldId, label]);

  const handleChange = React.useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>, data: { checked: boolean | 'mixed' }) => {
      const nextChecked = !!data.checked;
      onChange?.(nextChecked);
      if (fieldId) ctx.markDirty(fieldId);
    },
    [ctx, fieldId, onChange],
  );

  return (
    <Checkbox
      data-hbc-ui="checkbox"
      id={fieldId ? `field-${fieldId}` : undefined}
      label={label}
      checked={!!checked}
      onChange={handleChange}
      disabled={disabled}
      className={className}
    />
  );
}

export const HbcCheckbox: React.FC<HbcCheckboxProps> = (props) => {
  const ctx = useHbcFormContext();
  const useRhf = Boolean(props.name && ctx.isFormContextActive);

  // D-07 enforcement path: name+context uses centralized RHF validation.
  if (useRhf) return <RhfCheckbox {...props} />;

  // Backward-compatible path for existing controlled consumers.
  return <ControlledCheckbox {...props} />;
};
