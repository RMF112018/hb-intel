// src/components/_utils.ts

import type { BicUrgencyTier } from '../types/IBicNextMove';

/** Maps urgency tier to CSS class suffix for styling */
export function urgencyClass(tier: BicUrgencyTier, isBlocked: boolean): string {
  if (isBlocked) return 'hbc-bic--blocked';
  switch (tier) {
    case 'immediate': return 'hbc-bic--immediate';
    case 'watch':     return 'hbc-bic--watch';
    case 'upcoming':  return 'hbc-bic--upcoming';
  }
}

/** Returns urgency dot aria-label */
export function urgencyLabel(tier: BicUrgencyTier, isOverdue: boolean, isBlocked: boolean): string {
  if (isBlocked) return 'Blocked';
  if (isOverdue) return 'Overdue';
  switch (tier) {
    case 'immediate': return 'Due today';
    case 'watch':     return 'Due soon';
    case 'upcoming':  return 'Upcoming';
  }
}

/** Formats an ISO 8601 date as a relative string */
export function relativeDate(isoDate: string): string {
  const due = new Date(isoDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Due today';
  if (diffDays === -1) return 'Overdue by 1 day';
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays} days`;
}

/** Truncates text to maxLength characters, appending '…' if truncated */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/** Reads complexity variant from context or returns forceVariant override */
export function resolveVariant(
  forceVariant: 'essential' | 'standard' | 'expert' | undefined,
  contextVariant: 'essential' | 'standard' | 'expert'
): 'essential' | 'standard' | 'expert' {
  return forceVariant ?? contextVariant;
}
