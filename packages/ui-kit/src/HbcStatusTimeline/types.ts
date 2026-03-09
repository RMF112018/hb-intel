/**
 * HbcStatusTimeline types — D-SF03-T07 / D-08
 * Historical status progression, gated at Standard by default.
 */
import type { IComplexityAwareProps } from '@hbc/complexity';

export interface IStatusEntry {
  status: string;
  timestamp: string;
  actor?: string;
}

export interface HbcStatusTimelineProps extends IComplexityAwareProps {
  /** Ordered list of status entries to display */
  statuses: IStatusEntry[];
  /** When true, shows projected future statuses */
  showFuture?: boolean;
}
