/** HbcScoreBar — PH4.13 §13.2 score visualization bar */

export interface HbcScoreBarProps {
  /** Score value from 0 to 100 */
  score: number;
  /** Show numeric label above the marker (default false) */
  showLabel?: boolean;
  /** Bar height (default '12px') */
  height?: string;
  /** Additional CSS class */
  className?: string;
}
