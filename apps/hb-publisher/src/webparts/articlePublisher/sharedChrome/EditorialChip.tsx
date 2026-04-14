/**
 * EditorialChip — governed status-chip primitive for the Article
 * Publisher. Workstream-h step-02 foundation.
 *
 * Six variants mapped to the HBC_STATUS_RAMP_* set:
 *   - `success`  ready / ok
 *   - `warn`     TODO / guidance
 *   - `danger`   blocked / error
 *   - `info`     neutral editorial (role, destination)
 *   - `neutral`  uncoloured, muted — counts, metadata
 *   - `featured` brand accent (featured teammate, featured image)
 *
 * Always colour + text, never colour-only. An optional `aria-label`
 * carries the full sentence description for screen readers.
 */

import * as React from 'react';
import styles from './editorialChip.module.css';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- side-effect import to inject :root tokens
import tokens from './tokens.module.css';
void tokens;

export type EditorialChipVariant =
  | 'success'
  | 'warn'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'featured';

export interface EditorialChipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'ref'> {
  readonly variant?: EditorialChipVariant;
  readonly size?: 'md' | 'sm';
}

export const EditorialChip = React.forwardRef<
  HTMLSpanElement,
  EditorialChipProps
>(function EditorialChip(
  { variant = 'neutral', size = 'md', className, children, ...rest },
  ref,
) {
  const cls = [
    styles.base,
    styles[variant] ?? styles.neutral,
    size === 'sm' ? styles.sizeSm : styles.sizeMd,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span ref={ref} className={cls} {...rest}>
      {children}
    </span>
  );
});
