import * as Tooltip from '@radix-ui/react-tooltip';
import { HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import f from './manageFields.module.css';

export function ManageFieldLabel(props: {
  readonly htmlFor?: string;
  readonly label: string;
  readonly helpText?: string;
}): React.ReactNode {
  return (
    <span className={f.inlineHelp}>
      <label className={f.fieldLabel} htmlFor={props.htmlFor}>
        {props.label}
      </label>
      {props.helpText ? (
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              className={f.fieldLabel}
              aria-label={`Help: ${props.label}`}
              style={{ border: 'none', background: 'none', padding: 0, cursor: 'help', color: 'inherit' }}
            >
              <HelpCircle size={16} aria-hidden />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              sideOffset={6}
              style={{
                maxWidth: 280,
                padding: '8px 10px',
                borderRadius: 10,
                background: 'hsl(205 32% 14%)',
                color: 'hsl(0 0% 100%)',
                fontSize: 13,
                lineHeight: 1.35,
                boxShadow: '0 8px 24px hsl(200 45% 20% / 0.2)',
              }}
            >
              {props.helpText}
              <Tooltip.Arrow style={{ fill: 'hsl(205 32% 14%)' }} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      ) : null}
    </span>
  );
}

export function ManageTextField(props: {
  readonly id: string;
  readonly label: string;
  readonly helpText?: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}): React.ReactNode {
  return (
    <div>
      <ManageFieldLabel htmlFor={props.id} label={props.label} helpText={props.helpText} />
      <input
        id={props.id}
        className={f.fieldInput}
        value={props.value}
        onChange={(event): void => props.onChange(event.currentTarget.value)}
      />
    </div>
  );
}

export function ManageSelectField(props: {
  readonly id: string;
  readonly label: string;
  readonly helpText?: string;
  readonly value: string;
  readonly options: ReadonlyArray<string>;
  readonly onChange: (value: string) => void;
}): React.ReactNode {
  return (
    <div>
      <ManageFieldLabel htmlFor={props.id} label={props.label} helpText={props.helpText} />
      <select
        id={props.id}
        className={f.fieldInput}
        value={props.value}
        onChange={(event): void => props.onChange(event.currentTarget.value)}
      >
        {props.options.map((option) => (
          <option key={option} value={option.split(':')[0] ?? option}>
            {option.includes(':') ? option.split(':').slice(1).join(':') : option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ManageCheckbox(props: {
  readonly id: string;
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}): React.ReactNode {
  return (
    <label className={clsx(f.checkboxRow)} htmlFor={props.id}>
      <input
        id={props.id}
        type="checkbox"
        checked={props.checked}
        onChange={(event): void => props.onChange(event.currentTarget.checked)}
      />
      {props.label}
    </label>
  );
}
