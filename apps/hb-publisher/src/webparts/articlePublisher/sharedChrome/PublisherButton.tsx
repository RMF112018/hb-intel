/**
 * PublisherButton — governed button primitive for the Article
 * Publisher.
 *
 * Three variants:
 *   - `primary`   HBC_BRAND_ACTION ramp. CTAs (Publish, Save teammate).
 *   - `secondary` Neutral outlined. Reorder, Edit, Cancel.
 *   - `danger`    Danger ramp. Remove, Withdraw, Archive.
 *
 * Plus an `iconOnly` mode for star toggles, kebab menus, etc.
 * Replaces six+ duplicated button styles across the Publisher
 * modules.
 *
 * Premium-stack wiring (phase-17 wave-02 prompt-01):
 *   - `@radix-ui/react-slot` powers the `asChild` prop so callers can
 *     project the button semantics onto an anchor, router link, or
 *     custom trigger without re-implementing the variant system.
 *   - `motion/react` supplies the restrained hover/press choreography
 *     that the Governing SPFx Standard §6.2 requires: lighter than
 *     PWA, but still visibly premium. Disabled + pressed states skip
 *     the motion so the chrome reads as static commitment.
 *
 * Phase-17 wave-02 prompt-03: `leadingIcon` / `trailingIcon` props
 * project a single governed `lucide-react` icon into the button without
 * callers having to reach for the icon primitive manually. This is the
 * first step in retiring text-symbol CTAs ("+ New draft" etc.) across
 * queue / team / media action surfaces in favor of a coherent editorial
 * action family.
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { LucideIcon } from 'lucide-react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { PublisherIcon } from './PublisherIcon.js';
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
  /**
   * When true, render as a `Slot` so the single child element adopts
   * the button's class, aria, and event contract. Useful for wrapping
   * an anchor or a router link with governed button styling.
   */
  readonly asChild?: boolean;
  /**
   * Optional leading `lucide-react` icon rendered inside the button
   * before the label. Use for action CTAs that would otherwise rely on
   * a text-symbol prefix (e.g. "+ New draft"). Ignored when `iconOnly`
   * is true; in that mode place the icon directly in `children`.
   */
  readonly leadingIcon?: LucideIcon;
  /** Optional trailing `lucide-react` icon rendered after the label. */
  readonly trailingIcon?: LucideIcon;
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
    asChild = false,
    leadingIcon,
    trailingIcon,
    className,
    type,
    children,
    disabled,
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

  const iconSize = size === 'sm' ? 'sm' : 'md';
  const content = iconOnly ? (
    children
  ) : (
    <>
      {leadingIcon && (
        <PublisherIcon
          icon={leadingIcon}
          size={iconSize}
          tint="inherit"
          className={styles.leadingIcon}
        />
      )}
      {children != null && <span className={styles.label}>{children}</span>}
      {trailingIcon && (
        <PublisherIcon
          icon={trailingIcon}
          size={iconSize}
          tint="inherit"
          className={styles.trailingIcon}
        />
      )}
    </>
  );

  if (asChild) {
    return (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        className={cls}
        aria-pressed={pressed}
        data-disabled={disabled ? 'true' : undefined}
        {...rest}
      >
        {content as React.ReactElement}
      </Slot>
    );
  }

  return (
    <MotionPublisherButton
      ref={ref}
      type={type ?? 'button'}
      className={cls}
      aria-pressed={pressed}
      disabled={disabled}
      rest={rest}
    >
      {content}
    </MotionPublisherButton>
  );
});

interface MotionPublisherButtonProps
  extends Pick<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'className' | 'aria-pressed' | 'disabled'
  > {
  readonly rest: Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'ref' | 'type' | 'className' | 'aria-pressed' | 'disabled'
  >;
  readonly children?: React.ReactNode;
}

const MotionPublisherButton = React.forwardRef<
  HTMLButtonElement,
  MotionPublisherButtonProps
>(function MotionPublisherButton(
  { type, className, disabled, rest, children, ...aria },
  ref,
) {
  const reduced = useReducedMotion();
  const interactive = !disabled && !reduced;
  // `rest` carries arbitrary `React.ButtonHTMLAttributes<HTMLButtonElement>`
  // handlers that overlap motion's own drag/animation hooks. We do not
  // opt into motion's pan/drag surface here, so the cast forwards the
  // native React handlers to the underlying DOM button untouched.
  const motionProps: HTMLMotionProps<'button'> = {
    ...(rest as unknown as HTMLMotionProps<'button'>),
    type: type ?? 'button',
    className,
    disabled,
    ...aria,
    whileHover: interactive ? { scale: 1.015 } : undefined,
    whileTap: interactive ? { scale: 0.97 } : undefined,
    transition: { type: 'tween', duration: 0.12, ease: 'easeOut' },
  };
  return (
    <motion.button ref={ref} {...motionProps}>
      {children}
    </motion.button>
  );
});
