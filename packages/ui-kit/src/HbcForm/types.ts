/** HbcForm — Blueprint §1d form primitives + PH4.6 §Step 8 form/section */

export interface HbcTextFieldProps {
  /** Field label */
  label: string;
  /** Controlled value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Optional placeholder text */
  placeholder?: string;
  /** Field is required */
  required?: boolean;
  /** Field is disabled */
  disabled?: boolean;
  /** Validation message (shown as error state) */
  validationMessage?: string;
  /** Input type (text, email, number, etc.) */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'search' | 'date' | 'datetime-local' | 'month' | 'time' | 'week';
  /** Additional CSS class */
  className?: string;
}

export interface HbcSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface HbcSelectProps {
  /** Field label */
  label: string;
  /** Controlled selected value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Available options */
  options: HbcSelectOption[];
  /** Optional placeholder text */
  placeholder?: string;
  /** Field is required */
  required?: boolean;
  /** Field is disabled */
  disabled?: boolean;
  /** Validation message */
  validationMessage?: string;
  /** Additional CSS class */
  className?: string;
}

export interface HbcCheckboxProps {
  /** Checkbox label */
  label: string;
  /** Controlled checked state */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Checkbox is disabled */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
}

export interface HbcFormLayoutProps {
  /** Child form fields */
  children: React.ReactNode;
  /** Number of columns (1-4) */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between fields */
  gap?: 'small' | 'medium' | 'large';
  /** Additional CSS class */
  className?: string;
}

// PH4.6 §Step 8 — Form wrapper + collapsible sections

export interface HbcFormProps {
  /** Form submit handler */
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Form content */
  children: React.ReactNode;
  /** Sticky footer content (cancel/save buttons) */
  stickyFooter?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

export interface HbcFormSectionProps {
  /** Section title */
  title: string;
  /** Optional section description */
  description?: string;
  /** Enable collapse toggle (default false) */
  collapsible?: boolean;
  /** Initial expanded state (default true) */
  defaultExpanded?: boolean;
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
