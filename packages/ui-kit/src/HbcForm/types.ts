/** HbcForm — Blueprint §1d form primitives + PH4.6 §Step 8 form/section + PH4.11 form architecture */

// ---------------------------------------------------------------------------
// PH4.11 — Form context types
// ---------------------------------------------------------------------------

/** Single field error entry for error summary */
export interface FormFieldError {
  /** Field identifier matching fieldId prop */
  fieldId: string;
  /** Human-readable field label */
  label: string;
  /** Validation error message */
  message: string;
}

/** Form context value provided by HbcForm to descendant fields */
export interface HbcFormContextValue {
  /** Register a field with the form context */
  registerField: (fieldId: string, label: string) => void;
  /** Unregister a field (on unmount) */
  unregisterField: (fieldId: string) => void;
  /** Set a validation error for a field */
  setFieldError: (fieldId: string, message: string) => void;
  /** Clear the validation error for a field */
  clearFieldError: (fieldId: string) => void;
  /** Mark a field as dirty (edited) */
  markDirty: (fieldId: string) => void;
}

// ---------------------------------------------------------------------------
// Field props
// ---------------------------------------------------------------------------

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
  /** PH4.11 — Field identifier for form context registration */
  fieldId?: string;
  /** PH4.11 — Inline validation on blur; return error message or undefined */
  onBlurValidate?: (value: string) => string | undefined;
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
  /** PH4.11 — Field identifier for form context registration */
  fieldId?: string;
  /** PH4.11 — Inline validation on change; return error message or undefined */
  onChangeValidate?: (value: string) => string | undefined;
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
  /** PH4.11 — Field identifier for form context registration */
  fieldId?: string;
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
  /** PH4.11 — Callback when form dirty state changes */
  onDirtyChange?: (isDirty: boolean) => void;
  /** PH4.11 — Show error summary banner at form top (default true when errors exist) */
  showErrorSummary?: boolean;
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

// ---------------------------------------------------------------------------
// PH4.11 — New component props
// ---------------------------------------------------------------------------

export interface HbcFormRowProps {
  /** Child form fields */
  children: React.ReactNode;
  /** Gap between items (default '16px') */
  gap?: string;
  /** Additional CSS class */
  className?: string;
}

export interface HbcStickyFormFooterProps {
  /** Cancel button handler */
  onCancel: () => void;
  /** Primary button label (default "Save") */
  primaryLabel?: string;
  /** Cancel button label (default "Cancel") */
  cancelLabel?: string;
  /** Disable primary button */
  primaryDisabled?: boolean;
  /** Show loading spinner on primary button */
  primaryLoading?: boolean;
  /** Extra action elements rendered between Cancel and Save */
  extraActions?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
