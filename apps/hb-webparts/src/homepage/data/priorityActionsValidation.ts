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
  PriorityActionsValidationContext,
} from './priorityActionsContracts.js';
import {
  isGovernedPriorityIconKey,
  isNonIncreasingCaps,
  isValidBreakpointCap,
  parseUtcDate,
} from './priorityActionsGovernance.js';

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

function hasAnyAudienceKeys(draft: PriorityActionsItemDraft): boolean {
  return draft.audienceKeys.some((value) => value.trim().length > 0);
}

/* ── Config validation ───────────────────────────────────────────── */

export function validateConfig(
  draft: PriorityActionsConfigDraft,
  context: PriorityActionsValidationContext = {},
): PriorityActionsValidationIssue[] {
  const issues: PriorityActionsValidationIssue[] = [];

  if (!hasText(draft.bandKey)) {
    issues.push(issue('missing-band-key', 'Band key is required.', 'bandKey'));
  }

  if (!hasText(draft.title)) {
    issues.push(issue('empty-title', 'Config name is required.', 'title'));
  }

  if (!hasText(draft.overflowLabel)) {
    issues.push(issue('missing-overflow-label', 'Overflow label is required.', 'overflowLabel'));
  }

  if ((context.activeConfigCountForBand ?? 1) > 1) {
    issues.push(issue(
      'duplicate-active-config',
      'Multiple active config rows exist for this band. Resolve duplicates before saving.',
      'isActive',
    ));
  }

  // Legacy compatibility guardrails:
  // these fields are preserved in the authored/list contract but do not
  // govern homepage launcher runtime partitioning.
  const caps: Array<[keyof PriorityActionsConfigDraft, number]> = [
    ['maxVisibleDesktop', draft.maxVisibleDesktop],
    ['maxVisibleLaptop', draft.maxVisibleLaptop],
    ['maxVisibleTabletLandscape', draft.maxVisibleTabletLandscape],
    ['maxVisibleTabletPortrait', draft.maxVisibleTabletPortrait],
    ['maxVisiblePhone', draft.maxVisiblePhone],
  ];

  for (const [field, value] of caps) {
    if (!isValidBreakpointCap(value)) {
      issues.push(issue(
        'invalid-breakpoint-cap',
        `Breakpoint cap "${String(field)}" must be an integer from 1 to 20.`,
        String(field),
      ));
    }
  }

  if (!isNonIncreasingCaps(caps.map((entry) => entry[1]))) {
    issues.push(issue(
      'inconsistent-breakpoint-caps',
      'Breakpoint caps must be non-increasing from desktop to phone.',
      'maxVisibleDesktop',
    ));
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
    issues.push(issue('missing-action-key', 'Action key is required for stable identity.', 'actionKey', rowId));
  }

  if (draft.startsAtUtc.trim().length > 0 && !parseUtcDate(draft.startsAtUtc)) {
    issues.push(issue('invalid-date-format', 'Start date must be a valid date/time.', 'startsAtUtc', rowId));
  }

  if (draft.endsAtUtc.trim().length > 0 && !parseUtcDate(draft.endsAtUtc)) {
    issues.push(issue('invalid-date-format', 'End date must be a valid date/time.', 'endsAtUtc', rowId));
  }

  const start = parseUtcDate(draft.startsAtUtc);
  const end = parseUtcDate(draft.endsAtUtc);
  if (start && end && start >= end) {
    issues.push(issue('invalid-schedule-window', 'Start date must be before end date.', 'startsAtUtc', rowId));
  }

  const hasAudienceKeys = hasAnyAudienceKeys(draft);
  if (draft.audienceMode === 'all' && hasAudienceKeys) {
    issues.push(issue(
      'inconsistent-audience-mode',
      'Audience mode "all" cannot include audience keys.',
      'audienceKeys',
      rowId,
    ));
  }

  if (draft.audienceMode !== 'all' && !hasAudienceKeys) {
    issues.push(issue(
      'inconsistent-audience-mode',
      `Audience mode "${draft.audienceMode}" requires at least one audience key.`,
      'audienceKeys',
      rowId,
    ));
  }

  if (!isGovernedPriorityIconKey(draft.iconKey)) {
    issues.push(issue(
      'invalid-icon-key',
      'Icon key must use a governed Priority Actions icon value.',
      'iconKey',
      rowId,
    ));
  }

  const hasGroupKey = hasText(draft.groupKey);
  const hasGroupTitle = hasText(draft.groupTitle);
  if (hasGroupKey !== hasGroupTitle) {
    issues.push(issue(
      'inconsistent-group-metadata',
      'Group key and group title must be set together or both left blank.',
      hasGroupKey ? 'groupTitle' : 'groupKey',
      rowId,
    ));
  }

  if (!draft.visibleDesktop
    && !draft.visibleLaptop
    && !draft.visibleTabletLandscape
    && !draft.visibleTabletPortrait
    && !draft.visiblePhone) {
    issues.push(issue(
      'all-devices-hidden',
      'At least one device visibility flag must be enabled.',
      'visibleDesktop',
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
    const key = items[i].actionKey.trim().toLowerCase();
    if (!key) continue;
    const prev = keysSeen.get(key);
    if (prev !== undefined) {
      issues.push(issue(
        'duplicate-action-key',
        `Duplicate action key "${items[i].actionKey.trim()}" (also at row ${prev}).`,
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
  context: PriorityActionsValidationContext = {},
): PriorityActionsValidationResult {
  const configIssues = validateConfig(configDraft, context);
  const itemIssues = validateItemBatch(itemDrafts);
  const allIssues = [...configIssues, ...itemIssues];

  return {
    valid: allIssues.length === 0,
    issues: allIssues,
  };
}
