/**
 * Priority Actions shared governance helpers.
 *
 * Centralizes authored-value normalization rules used by validation,
 * normalization, and writer seams so contract semantics stay aligned.
 */

import type { AudienceMode } from './priorityActionsContracts.js';

export const PRIORITY_ACTIONS_MAX_VISIBLE_MIN = 1;
export const PRIORITY_ACTIONS_MAX_VISIBLE_MAX = 20;

const GOVERNED_ICON_KEYS = [
  'finance',
  'field',
  'hr',
  'safety',
  'quality',
  'risk',
  'ops',
  'admin',
  'legal',
  'it',
  'project',
  'report',
  'schedule',
  'email',
  'document',
  'team',
  'form',
  'policy',
  'search',
  'link',
  'clipboard',
] as const;

const GOVERNED_ICON_KEY_SET = new Set<string>(GOVERNED_ICON_KEYS);

export function normalizeOptionalText(value: string | undefined): string {
  return value?.trim() ?? '';
}

export function normalizeRequiredText(value: string | undefined): string {
  return normalizeOptionalText(value);
}

export function normalizeActionKey(value: string | undefined): string {
  return normalizeOptionalText(value);
}

export function normalizeAudienceKeys(values: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const normalized = trimmed.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(trimmed);
  }

  return result;
}

export function normalizeAudienceKeysFromRaw(value: unknown): string[] {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }
  return normalizeAudienceKeys(value.split(/\r?\n/));
}

export function normalizeIconKey(iconKey: string | undefined): string {
  const normalized = normalizeOptionalText(iconKey).toLowerCase();
  if (!normalized) return '';
  return GOVERNED_ICON_KEY_SET.has(normalized) ? normalized : '';
}

export function isGovernedPriorityIconKey(iconKey: string | undefined): boolean {
  const normalized = normalizeOptionalText(iconKey).toLowerCase();
  if (!normalized) return true;
  return GOVERNED_ICON_KEY_SET.has(normalized);
}

export function normalizeBreakpointCap(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  const rounded = Math.round(value);
  if (rounded < PRIORITY_ACTIONS_MAX_VISIBLE_MIN) return PRIORITY_ACTIONS_MAX_VISIBLE_MIN;
  if (rounded > PRIORITY_ACTIONS_MAX_VISIBLE_MAX) return PRIORITY_ACTIONS_MAX_VISIBLE_MAX;
  return rounded;
}

export function isValidBreakpointCap(value: number): boolean {
  return Number.isInteger(value)
    && value >= PRIORITY_ACTIONS_MAX_VISIBLE_MIN
    && value <= PRIORITY_ACTIONS_MAX_VISIBLE_MAX;
}

export function isNonIncreasingCaps(caps: number[]): boolean {
  for (let index = 0; index < caps.length - 1; index += 1) {
    if (caps[index] < caps[index + 1]) {
      return false;
    }
  }
  return true;
}

export function parseUtcDate(value: string): Date | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
}

export function normalizeGroupFields(groupKey: string, groupTitle: string): { groupKey: string; groupTitle: string } {
  const normalizedKey = normalizeOptionalText(groupKey);
  const normalizedTitle = normalizeOptionalText(groupTitle);
  if (!normalizedKey || !normalizedTitle) {
    return { groupKey: '', groupTitle: '' };
  }
  return { groupKey: normalizedKey, groupTitle: normalizedTitle };
}

export function normalizeAudienceMode(mode: AudienceMode, audienceKeys: string[]): { mode: AudienceMode; audienceKeys: string[] } {
  if (mode === 'all') {
    return { mode, audienceKeys: [] };
  }
  return { mode, audienceKeys };
}
