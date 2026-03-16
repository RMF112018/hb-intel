/**
 * HbcCard — Surface card component types
 * PH4.8 §Step 3 | Blueprint §1d
 */
import type { CardWeight } from '../theme/hierarchy.js';

export interface HbcCardProps {
  /** Card body content */
  children: React.ReactNode;
  /** Optional header content (rendered above body with border divider) */
  header?: React.ReactNode;
  /** Optional footer content (rendered below body with border divider) */
  footer?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /**
   * Visual weight class — controls elevation, border, and padding treatment.
   * - `'primary'`: elevated with brand-colored border; draws attention
   * - `'standard'`: default card treatment (level 1 shadow, default border)
   * - `'supporting'`: flat with subtle background; recedes visually
   * @default 'standard'
   */
  weight?: CardWeight;
}

export type { CardWeight };
