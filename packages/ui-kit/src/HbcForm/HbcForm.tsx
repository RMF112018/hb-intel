/**
 * HbcForm — D-07 centralized validation architecture with RHF + zodResolver
 * PH4B.15 §6 (HF-007) | PH4B-C D-07 | Blueprint §1d
 *
 * This component is the single form-validation boundary for HB Intel forms.
 * It exposes react-hook-form APIs through HbcFormContext, supports schema-driven
 * validation through zodResolver, and preserves legacy onSubmit behavior so
 * existing controlled forms continue to function during migration.
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { elevationRaised } from '../theme/elevation.js';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { Z_INDEX } from '../theme/z-index.js';
import { HbcBanner } from '../HbcBanner/index.js';
import { HbcFormContext } from './HbcFormContext.js';
import type {
  FormFieldError,
  HbcFormProps,
  HbcFormValues,
} from './types.js';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: '0',
  },
  stickyFooter: {
    position: 'sticky',
    bottom: '0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    boxShadow: elevationRaised,
    borderTop: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    zIndex: Z_INDEX.stickyFooter,
  },
  errorSummary: {
    marginBottom: '16px',
  },
  errorLink: {
    display: 'block',
    color: 'inherit',
    textDecoration: 'underline',
    cursor: 'pointer',
    marginTop: '4px',
    fontSize: '0.875rem',
    background: 'none',
    border: 'none',
    padding: '0',
    textAlign: 'left',
  },
});

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  if ('message' in error && typeof error.message === 'string' && error.message) {
    return error.message;
  }

  const entries = Object.values(error as Record<string, unknown>);
  for (const entry of entries) {
    const nested = getErrorMessage(entry);
    if (nested) return nested;
  }
  return undefined;
}

function flattenErrors(
  errors: FieldErrors<HbcFormValues>,
  prefix = '',
): Array<{ fieldId: string; message: string }> {
  const flattened: Array<{ fieldId: string; message: string }> = [];

  Object.entries(errors).forEach(([key, value]) => {
    const fieldId = prefix ? `${prefix}.${key}` : key;
    const message = getErrorMessage(value);
    if (message) {
      flattened.push({ fieldId, message });
      return;
    }

    if (typeof value === 'object' && value !== null) {
      flattened.push(...flattenErrors(value as FieldErrors<HbcFormValues>, fieldId));
    }
  });

  return flattened;
}

export const HbcForm: React.FC<HbcFormProps> = ({
  onSubmit,
  onValidSubmit,
  schema,
  resolver,
  defaultValues,
  children,
  stickyFooter,
  className,
  onDirtyChange,
  showErrorSummary,
}) => {
  const styles = useStyles();

  const rhf = useForm<HbcFormValues>({
    defaultValues,
    resolver: resolver ?? (schema ? zodResolver(schema) : undefined),
  });
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState,
    control,
    setValue,
    getValues,
    watch,
    trigger,
    reset,
  } = rhf;

  // Field metadata + manual errors support migration-era validators.
  const fieldsRef = React.useRef<Map<string, string>>(new Map());
  const errorsRef = React.useRef<Map<string, string>>(new Map());
  const dirtyFieldsRef = React.useRef<Set<string>>(new Set());

  const [errors, setErrors] = React.useState<FormFieldError[]>([]);
  const [isDirty, setIsDirty] = React.useState(false);

  const syncErrors = React.useCallback(() => {
    const merged = new Map(errorsRef.current);

    // Merge centralized RHF errors into summary so zod + resolver results are
    // always visible through the shared form banner (D-07 single surface).
    flattenErrors(formState.errors).forEach(({ fieldId, message }) => {
      merged.set(fieldId, message);
    });

    const next: FormFieldError[] = [];
    merged.forEach((message, fieldId) => {
      const label = fieldsRef.current.get(fieldId) ?? fieldId;
      next.push({ fieldId, label, message });
    });
    setErrors(next);
  }, [formState.errors]);

  React.useEffect(() => {
    syncErrors();
  }, [syncErrors]);

  React.useEffect(() => {
    const nextDirty = formState.isDirty || dirtyFieldsRef.current.size > 0;
    setIsDirty(nextDirty);
  }, [formState.isDirty]);

  const prevDirtyRef = React.useRef(false);
  React.useEffect(() => {
    if (prevDirtyRef.current !== isDirty) {
      prevDirtyRef.current = isDirty;
      onDirtyChange?.(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  const contextValue = React.useMemo(
    () => ({
      isFormContextActive: true,
      registerField: (fieldId: string, label: string) => {
        fieldsRef.current.set(fieldId, label);
      },
      unregisterField: (fieldId: string) => {
        fieldsRef.current.delete(fieldId);
        errorsRef.current.delete(fieldId);
        dirtyFieldsRef.current.delete(fieldId);
        syncErrors();
      },
      setFieldError: (fieldId: string, message: string) => {
        errorsRef.current.set(fieldId, message);
        syncErrors();
      },
      clearFieldError: (fieldId: string) => {
        if (errorsRef.current.has(fieldId)) {
          errorsRef.current.delete(fieldId);
          syncErrors();
        }
      },
      markDirty: (fieldId: string) => {
        dirtyFieldsRef.current.add(fieldId);
        setIsDirty(true);
      },
      register,
      handleSubmit: rhfHandleSubmit,
      formState,
      control,
      setValue,
      getValues,
      watch,
      trigger,
      reset,
    }),
    [
      control,
      formState,
      getValues,
      register,
      reset,
      rhfHandleSubmit,
      setValue,
      syncErrors,
      trigger,
      watch,
    ],
  );

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const submit = rhfHandleSubmit(
        async (values) => {
          await onValidSubmit?.(values);
          onSubmit?.(event);
        },
        () => {
          // Legacy compatibility path: callers historically relied on onSubmit
          // firing on attempted submit even before RHF schema integration.
          onSubmit?.(event);
        },
      );

      void submit(event);
    },
    [rhfHandleSubmit, onSubmit, onValidSubmit],
  );

  const handleErrorClick = React.useCallback((fieldId: string) => {
    const el = document.getElementById(`field-${fieldId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const focusable = el.querySelector<HTMLElement>(
        'input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }
  }, []);

  const shouldShowSummary = showErrorSummary !== false && errors.length > 0;

  return (
    <HbcFormContext.Provider value={contextValue}>
      <form
        data-hbc-ui="form"
        className={mergeClasses(styles.form, className)}
        onSubmit={handleSubmit}
      >
        {shouldShowSummary && (
          <div className={styles.errorSummary}>
            <HbcBanner variant="error">
              <div>
                <strong>Please fix the following errors:</strong>
                {errors.map((err) => (
                  <button
                    key={err.fieldId}
                    type="button"
                    className={styles.errorLink}
                    onClick={() => handleErrorClick(err.fieldId)}
                  >
                    {err.label}: {err.message}
                  </button>
                ))}
              </div>
            </HbcBanner>
          </div>
        )}
        {children}
        {stickyFooter && (
          <div className={styles.stickyFooter}>{stickyFooter}</div>
        )}
      </form>
    </HbcFormContext.Provider>
  );
};
