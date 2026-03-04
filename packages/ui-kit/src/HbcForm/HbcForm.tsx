/**
 * HbcForm — Form wrapper with context provider, error summary, dirty tracking
 * PH4.6 §Step 8 + PH4.11 §Step 2 | Blueprint §1d
 *
 * Backward-compatible: existing consumers with just onSubmit+children+stickyFooter
 * continue working with zero changes. New props (onDirtyChange, showErrorSummary)
 * are all optional.
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { elevationRaised } from '../theme/elevation.js';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { Z_INDEX } from '../theme/z-index.js';
import { HbcBanner } from '../HbcBanner/index.js';
import { HbcFormContext } from './HbcFormContext.js';
import type { HbcFormProps, FormFieldError } from './types.js';

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

export const HbcForm: React.FC<HbcFormProps> = ({
  onSubmit,
  children,
  stickyFooter,
  className,
  onDirtyChange,
  showErrorSummary,
}) => {
  const styles = useStyles();

  // --- Internal state for context ---
  const fieldsRef = React.useRef<Map<string, string>>(new Map());
  const errorsRef = React.useRef<Map<string, string>>(new Map());
  const dirtyFieldsRef = React.useRef<Set<string>>(new Set());

  const [errors, setErrors] = React.useState<FormFieldError[]>([]);
  const [isDirty, setIsDirty] = React.useState(false);

  // Fire onDirtyChange when isDirty changes
  const prevDirtyRef = React.useRef(false);
  React.useEffect(() => {
    if (prevDirtyRef.current !== isDirty) {
      prevDirtyRef.current = isDirty;
      onDirtyChange?.(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  // Sync errors state from errorsRef
  const syncErrors = React.useCallback(() => {
    const next: FormFieldError[] = [];
    errorsRef.current.forEach((message, fieldId) => {
      const label = fieldsRef.current.get(fieldId) ?? fieldId;
      next.push({ fieldId, label, message });
    });
    setErrors(next);
  }, []);

  // --- Context methods ---
  const contextValue = React.useMemo(
    () => ({
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
        if (!isDirty) setIsDirty(true);
      },
    }),
    [syncErrors, isDirty],
  );

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(e);
    },
    [onSubmit],
  );

  const handleErrorClick = React.useCallback((fieldId: string) => {
    const el = document.getElementById(`field-${fieldId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus the first focusable element within the field
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
