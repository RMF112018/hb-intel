/**
 * Pure draft-completeness assessment for the queue row.
 * Workstream-g step-03.
 *
 * Classifies a PublisherArticleRow into `ready` / `todo(n)` /
 * `blocked` without running the full validationEngine (which would
 * require loaded resolution + shell + template registry). This is a
 * cheaper heuristic over the master-row fields that the composer's
 * own guidance already enforces — designed to surface at-a-glance
 * cues in the rail, not to duplicate Rule 1-16 from the engine.
 */

import type {
  PublisherArticleRow,
  WorkflowState,
} from '../../../homepage/data/publisherAdapter/index.js';
import { isRichBodyEmpty } from '../../../homepage/data/publisherAdapter/validation/validationEngine.js';

export type DraftCompletenessLevel = 'ready' | 'todo' | 'blocked';

export interface DraftCompleteness {
  readonly level: DraftCompletenessLevel;
  /** Number of missing required fields; 0 for ready/blocked. */
  readonly missingCount: number;
  /** Internal field keys that are missing — for tooltips + aria-label. */
  readonly missingFields: readonly string[];
  /** Short chip label ("Ready", "3 TODO", "Blocked"). */
  readonly chipLabel: string;
  /** Full-sentence screen-reader description. */
  readonly ariaLabel: string;
}

const BLOCKED_STATES: ReadonlySet<WorkflowState> = new Set<WorkflowState>([
  'archived',
  'withdrawn',
]);

const READY_STATES: ReadonlySet<WorkflowState> = new Set<WorkflowState>([
  'approved',
  'published',
  'scheduled',
]);

function isBlank(value: string | undefined): boolean {
  return typeof value !== 'string' || value.trim().length === 0;
}

/**
 * Field-by-field completeness scan. Returns the list of missing
 * required-field keys in a stable order.
 */
export function assessDraftMissingFields(
  row: PublisherArticleRow,
): readonly string[] {
  const missing: string[] = [];
  if (isBlank(row.Title)) missing.push('Title');
  if (isBlank(row.Subhead)) missing.push('Subhead');
  if (isBlank(row.SummaryExcerpt)) missing.push('SummaryExcerpt');
  if (isRichBodyEmpty(row.BodyRichText)) missing.push('BodyRichText');
  if (isBlank(row.HeroPrimaryImage)) missing.push('HeroPrimaryImage');
  if (isBlank(row.HeroPrimaryImageAltText)) missing.push('HeroPrimaryImageAltText');
  if (isBlank(row.Slug)) missing.push('Slug');
  if (isBlank(row.ArticleContentType)) missing.push('ArticleContentType');
  if (isBlank(row.Destination)) missing.push('Destination');
  return missing;
}

export function assessDraftCompleteness(
  row: PublisherArticleRow,
): DraftCompleteness {
  const missingFields = assessDraftMissingFields(row);
  if (BLOCKED_STATES.has(row.WorkflowState)) {
    return {
      level: 'blocked',
      missingCount: 0,
      missingFields,
      chipLabel: 'Blocked',
      ariaLabel:
        row.WorkflowState === 'archived'
          ? 'Blocked — archived'
          : 'Blocked — withdrawn',
    };
  }
  if (missingFields.length === 0 && READY_STATES.has(row.WorkflowState)) {
    return {
      level: 'ready',
      missingCount: 0,
      missingFields,
      chipLabel: 'Ready',
      ariaLabel: 'Ready — all required fields present',
    };
  }
  if (missingFields.length === 0) {
    return {
      level: 'ready',
      missingCount: 0,
      missingFields,
      chipLabel: 'Ready',
      ariaLabel: 'Ready — all required fields present',
    };
  }
  const count = missingFields.length;
  const noun = count === 1 ? 'thing to do' : 'things to do';
  return {
    level: 'todo',
    missingCount: count,
    missingFields,
    chipLabel: `${count} TODO`,
    ariaLabel: `${count} ${noun}: ${missingFields.join(', ')}`,
  };
}

/**
 * Aggregate completeness for a group of rows. Returns the number of
 * rows in each level so the group header can render a compact
 * needs-attention rollup like "3 · 1 TODO".
 */
export interface GroupCompletenessRollup {
  readonly ready: number;
  readonly todo: number;
  readonly blocked: number;
  readonly total: number;
}

export function rollupGroupCompleteness(
  rows: readonly PublisherArticleRow[],
): GroupCompletenessRollup {
  let ready = 0;
  let todo = 0;
  let blocked = 0;
  for (const r of rows) {
    const level = assessDraftCompleteness(r).level;
    if (level === 'ready') ready += 1;
    else if (level === 'todo') todo += 1;
    else blocked += 1;
  }
  return { ready, todo, blocked, total: rows.length };
}
