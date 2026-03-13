import type { AutopsyStatus, ConfidenceTier } from '../types/index.js';

export const AUTOPSY_SLA_BUSINESS_DAYS = 5;
export const AUTOPSY_SYNC_QUEUE_KEY = 'post-bid-autopsy-sync-queue';
export const AUTOPSY_STATUS_ORDER = [
  'draft',
  'review',
  'approved',
  'published',
  'superseded',
  'archived',
  'overdue',
] as const satisfies readonly AutopsyStatus[];
export const AUTOPSY_MIN_PUBLISH_CONFIDENCE = 'moderate' as const satisfies ConfidenceTier;
