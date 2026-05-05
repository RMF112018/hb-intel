import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import { useId } from 'react';
import styles from './PccDisabledAffordance.module.css';

export type PccDisabledAffordanceVariant = 'button' | 'chip';

export interface PccDisabledAffordanceProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'aria-disabled' | 'aria-describedby' | 'onClick' | 'children'
> {
  /** Visible label of the inert control. */
  label: ReactNode;
  /** Required product-grade explanation of why the control is unavailable. */
  reason: string;
  /** Optional product-grade hint about what to do instead. */
  nextStep?: string;
  /** Visual treatment. Defaults to 'button'. */
  variant?: PccDisabledAffordanceVariant;
  /** Optional marker for surface-scoped tests / instrumentation. */
  'data-pcc-disabled-affordance-id'?: string;
}

/**
 * Inert (visually disabled, semantically `aria-disabled`) control that always
 * carries a user-facing reason. Click handling is intentionally not accepted —
 * the control performs no action.
 */
export const PccDisabledAffordance: FC<PccDisabledAffordanceProps> = ({
  label,
  reason,
  nextStep,
  variant = 'button',
  className,
  type = 'button',
  // Defensively strip any handler that may have been passed despite the
  // Omit'd prop type — inert affordances must never invoke caller handlers.
  // @ts-expect-error — Omit removes onClick from the public surface
  onClick: _onClick,
  ...rest
}) => {
  const reasonId = useId();
  const nextStepId = useId();
  const describedBy = nextStep ? `${reasonId} ${nextStepId}` : reasonId;
  const rootClass = [styles.root, variant === 'chip' ? styles.chip : styles.button, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={styles.wrapper} data-pcc-disabled-affordance>
      <button
        {...rest}
        type={type}
        className={rootClass}
        aria-disabled="true"
        aria-describedby={describedBy}
        data-pcc-disabled-affordance-variant={variant}
      >
        {label}
      </button>
      <span id={reasonId} className={styles.reason} data-pcc-disabled-affordance-reason>
        {reason}
      </span>
      {nextStep ? (
        <span id={nextStepId} className={styles.nextStep} data-pcc-disabled-affordance-next-step>
          {nextStep}
        </span>
      ) : null}
    </span>
  );
};

export default PccDisabledAffordance;
