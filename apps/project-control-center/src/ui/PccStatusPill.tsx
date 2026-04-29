import type { FC, ReactNode } from 'react';
import styles from './PccStatusPill.module.css';

export const PCC_STATUS_PILL_TONES = [
  'info',
  'success',
  'warning',
  'danger',
  'neutral',
] as const;

export type PccStatusPillTone = (typeof PCC_STATUS_PILL_TONES)[number];

export interface PccStatusPillProps {
  tone?: PccStatusPillTone;
  filled?: boolean;
  children: ReactNode;
}

export const PccStatusPill: FC<PccStatusPillProps> = ({
  tone = 'neutral',
  filled = false,
  children,
}) => (
  <span
    className={`${styles.pill} ${filled ? styles.filled : styles.outline}`}
    data-pcc-pill-tone={tone}
    data-pcc-pill-fill={filled ? 'filled' : 'outline'}
  >
    {children}
  </span>
);

export default PccStatusPill;
