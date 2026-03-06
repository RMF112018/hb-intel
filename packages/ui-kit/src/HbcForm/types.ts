/** HbcForm — Blueprint §1d form primitives + PH4.6 §Step 8 form/section + PH4.11 form architecture */
import type {
  Control,
  DefaultValues,
  FieldValues,
  FormState,
  Resolver,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
} from 'react-hook-form';
import type { ZodTypeAny } from 'zod';

/** Canonical form value map for HbcForm + RHF integration */
export type HbcFormValues = Record<string, unknown>;

/** Supported zod schema type for D-07 centralized validation */
export type HbcFormSchema = ZodTypeAny;

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
  /**
   * Indicates whether the consumer is currently inside a live HbcForm provider.
   *
   * Components use this guard to choose RHF mode (`name`) vs controlled mode.
   */
  isFormContextActive: boolean;
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
  /** react-hook-form register API exposed centrally per D-07 */
  register: UseFormRegister<HbcFormValues>;
  /** react-hook-form handleSubmit API exposed centrally per D-07 */
  handleSubmit: UseFormHandleSubmit<HbcFormValues>;
  /** react-hook-form formState API exposed centrally per D-07 */
  formState: FormState<HbcFormValues>;
  /** react-hook-form control API for controller-based integrations */
  control: Control<HbcFormValues>;
  /** react-hook-form setValue API exposed for advanced field integrations */
  setValue: UseFormSetValue<HbcFormValues>;
  /** react-hook-form getValues API exposed for form-level orchestration */
  getValues: UseFormGetValues<HbcFormValues>;
  /** react-hook-form watch API exposed for reactive derived UI */
  watch: UseFormWatch<HbcFormValues>;
  /** react-hook-form trigger API for imperative validation requests */
  trigger: UseFormTrigger<HbcFormValues>;
  /** react-hook-form reset API for submit/cancel/reset workflows */
  reset: UseFormReset<HbcFormValues>;
}

// ---------------------------------------------------------------------------
// Field props
// ---------------------------------------------------------------------------

export interface HbcTextFieldProps {
  /** RHF field name; when provided inside HbcForm this enables context-driven validation mode */
  name?: string;
  /** Field label */
  label: string;
  /** Controlled value (legacy controlled mode fallback) */
  value?: string;
  /** Change handler (legacy controlled mode fallback) */
  onChange?: (value: string) => void;
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
  /** RHF field name; when provided inside HbcForm this enables context-driven validation mode */
  name?: string;
  /** Field label */
  label: string;
  /** Controlled selected value (legacy controlled mode fallback) */
  value?: string;
  /** Change handler (legacy controlled mode fallback) */
  onChange?: (value: string) => void;
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
  /** RHF field name; when provided inside HbcForm this enables context-driven validation mode */
  name?: string;
  /** Checkbox label */
  label: string;
  /** Controlled checked state (legacy controlled mode fallback) */
  checked?: boolean;
  /** Change handler (legacy controlled mode fallback) */
  onChange?: (checked: boolean) => void;
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
  /**
   * Legacy submit handler.
   *
   * Backward-compatibility path: still supported for existing callers, including
   * forms that are not yet migrated to schema + onValidSubmit.
   */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  /**
   * Preferred schema-validated submit handler (D-07).
   *
   * Receives parsed form values after resolver/schema validation succeeds.
   */
  onValidSubmit?: (values: HbcFormValues) => void | Promise<void>;
  /** Optional zod schema used to build a centralized resolver */
  schema?: HbcFormSchema;
  /**
   * Optional custom resolver for advanced workflows.
   *
   * If both `schema` and `resolver` are provided, resolver takes precedence.
   */
  resolver?: Resolver<HbcFormValues, unknown, FieldValues>;
  /** Initial values fed into react-hook-form */
  defaultValues?: DefaultValues<HbcFormValues>;
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
