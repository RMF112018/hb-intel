/**
 * Priority Actions validation engine.
 *
 * Validates config and item drafts against schema rules, producing
 * explicit issue models that the admin UI can render and that block
 * or warn on publish.
 *
 * Schema authority:
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md
 */
import type {
  PriorityActionsConfigDraft,
  PriorityActionsItemDraft,
  PriorityActionsValidationIssue,
  PriorityActionsValidationIssueKind,
  PriorityActionsValidationResult,
} from './priorityActionsContracts.js';

/* ── Helpers ─────────────────────────────────────────────────────── */

function issue(
  kind: PriorityActionsValidationIssueKind,
  message: string,
  field?: string,
  rowId?: number,
): PriorityActionsValidationIssue {
  return { kind, message, field, rowId };
}

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

/* ── Config validation ───────────────────────────────────────────── */

export function validateConfig(
  draft: PriorityActionsConfigDraft,
): PriorityActionsValidationIssue[] {
  const issues: PriorityActionsValidationIssue[] = [];

  if (!hasText(draft.bandKey)) {
    issues.push(issue('missing-band-key', 'Band key is required.', 'bandKey'));
  }

  if (!hasText(draft.title)) {
    issues.push(issue('empty-title', 'Config name is required.', 'title'));
  }

  return issues;
}

/* ── Item validation ─────────────────────────────────────────────── */

export function validateItem(
  draft: PriorityActionsItemDraft,
  index?: number,
): PriorityActionsValidationIssue[] {
  const issues: PriorityActionsValidationIssue[] = [];
  const rowId = index;

  if (!hasText(draft.title)) {
    issues.push(issue('empty-title', 'Action title is required.', 'title', rowId));
  }

  if (!hasText(draft.href)) {
    issues.push(issue('missing-href', 'Action URL is required.', 'href', rowId));
  }

  if (!hasText(draft.actionKey)) {
    issues.push(issue('missing-band-key', 'Action key is required for stable identity.', 'actionKey', rowId));
  }

  if (draft.startsAtUtc && draft.endsAtUtc) {
    const start = new Date(draft.startsAtUtc);
    const end = new Date(draft.endsAtUtc);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
      issues.push(issue('invalid-schedule-window', 'Start date must be before end date.', 'startsAtUtc', rowId));
    }
  }

  if (draft.audienceMode !== 'all' && draft.audienceKeys.length === 0) {
    issues.push(issue(
      'inconsistent-audience-mode',
      `Audience mode "${draft.audienceMode}" requires at least one audience key.`,
      'audienceKeys',
      rowId,
    ));
  }

  return issues;
}

/* ── Batch validation ────────────────────────────────────────────── */

export function validateItemBatch(
  items: PriorityActionsItemDraft[],
): PriorityActionsValidationIssue[] {
  const issues: PriorityActionsValidationIssue[] = [];

  for (let i = 0; i < items.length; i++) {
    issues.push(...validateItem(items[i], i));
  }

  const keysSeen = new Map<string, number>();
  for (let i = 0; i < items.length; i++) {
    const key = items[i].actionKey.trim();
    if (!key) continue;
    const prev = keysSeen.get(key);
    if (prev !== undefined) {
      issues.push(issue(
        'duplicate-action-key',
        `Duplicate action key "${key}" (also at row ${prev}).`,
        'actionKey',
        i,
      ));
    } else {
      keysSeen.set(key, i);
    }
  }

  return issues;
}

/* ── Full draft validation ───────────────────────────────────────── */

export function validatePriorityRailDraft(
  configDraft: PriorityActionsConfigDraft,
  itemDrafts: PriorityActionsItemDraft[],
): PriorityActionsValidationResult {
  const configIssues = validateConfig(configDraft);
  const itemIssues = validateItemBatch(itemDrafts);
  const allIssues = [...configIssues, ...itemIssues];

  return {
    valid: allIssues.length === 0,
    issues: allIssues,
  };
}
