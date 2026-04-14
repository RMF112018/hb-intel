/**
 * PublisherButton — governed button primitive for the Article
 * Publisher. Workstream-h step-02 foundation.
 *
 * Three variants:
 *   - `primary`   HBC_BRAND_ACTION ramp. CTAs (Publish, Save teammate).
 *   - `secondary` Neutral outlined. Reorder, Edit, Cancel.
 *   - `danger`    Danger ramp. Remove, Withdraw, Archive.
 *
 * Plus an `iconOnly` mode for star toggles, kebab menus, etc.
 * Replaces six+ duplicated button styles across the Publisher
 * modules.
 */

import * as React from 'react';
import styles from './publisherButton.module.css';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- side-effect import to inject :root tokens
import tokens from './tokens.module.css';
void tokens;

export type PublisherButtonVariant = 'primary' | 'secondary' | 'danger';

export interface PublisherButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  readonly variant?: PublisherButtonVariant;
  readonly iconOnly?: boolean;
  readonly pressed?: boolean;
  readonly size?: 'md' | 'sm';
}

export const PublisherButton = React.forwardRef<
  HTMLButtonElement,
  PublisherButtonProps
>(function PublisherButton(
  {
    variant = 'secondary',
    iconOnly = false,
    pressed,
    size = 'md',
    className,
    type,
    children,
    ...rest
  },
  ref,
) {
  const cls = [
    styles.base,
    styles[variant] ?? styles.secondary,
    size === 'sm' ? styles.sizeSm : styles.sizeMd,
    iconOnly ? styles.iconOnly : undefined,
    pressed ? styles.pressed : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cls}
      aria-pressed={pressed}
      {...rest}
    >
      {children}
    </button>
  );
});
