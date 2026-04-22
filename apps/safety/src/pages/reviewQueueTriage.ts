import type { ReviewQueueEntry } from '@hbc/features-safety';

/**
 * Review-queue triage classification + bucketing (Phase-04 audit G-05).
 *
 * Pure, side-effect-free functions that derive the product-level story of
 * the review queue from a ReviewQueueEntry[] array. Consumed by
 * ReviewQueuePage to drive the triage summary copy and the priority-ordered
 * category groups so the queue reads as a triage workspace rather than a
 * passive table.
 */

export type SafetyQueueState =
  | 'clean'
  | 'light'
  | 'duplicate-heavy'
  | 'failure-heavy'
  | 'backed-up'
  | 'active';

export type SafetyTriageCategoryId =
  | 'duplicates-suspected'
  | 'workflow-failures'
  | 'unresolved-projects'
  | 'period-mismatches'
  | 'other-review-required';

export interface SafetyTriageCategory {
  readonly id: SafetyTriageCategoryId;
  /** Short human title used in triage group headers. */
  readonly title: string;
  /** One-sentence framing of what this category represents operationally. */
  readonly rationale: string;
  /** Action-direction copy used in empty-category placeholders (not the queue). */
  readonly actionHint: string;
  readonly entries: ReadonlyArray<ReviewQueueEntry>;
}

const WORKFLOW_FAILURE_STATUSES = new Set<string>([
  'parse-error',
  'invalid-template',
  'commit-failed',
]);

/**
 * Bucket a single entry into exactly one triage category. Priority order:
 *   1. duplicate-suspected (governed supersede path)
 *   2. workflow failures (parse / template / commit)
 *   3. unresolved projects
 *   4. period mismatches
 *   5. other review-required
 */
export function categoryForEntry(entry: ReviewQueueEntry): SafetyTriageCategoryId {
  const errorClass = entry.run.errorClass;
  const terminalStatus = entry.run.terminalStatus;

  if (errorClass === 'duplicate-suspected') return 'duplicates-suspected';
  if (WORKFLOW_FAILURE_STATUSES.has(terminalStatus)) return 'workflow-failures';
  if (terminalStatus === 'unresolved-project') return 'unresolved-projects';
  if (terminalStatus === 'reporting-period-mismatch') return 'period-mismatches';
  return 'other-review-required';
}

const CATEGORY_ORDER: ReadonlyArray<SafetyTriageCategoryId> = [
  'duplicates-suspected',
  'workflow-failures',
  'unresolved-projects',
  'period-mismatches',
  'other-review-required',
];

const CATEGORY_META: Record<
  SafetyTriageCategoryId,
  Pick<SafetyTriageCategory, 'title' | 'rationale' | 'actionHint'>
> = {
  'duplicates-suspected': {
    title: 'Duplicates suspected',
    rationale:
      'Uploads whose checksum or identity matched a prior inspection. Requires a governed supersede decision before commit.',
    actionHint: 'Review and either retry or supersede the prior inspection.',
  },
  'workflow-failures': {
    title: 'Workflow failures',
    rationale:
      'Pipeline-blocked uploads — template, parse, or commit failures. Data never entered the record set.',
    actionHint: 'Inspect the reported cause and retry against the retained workbook.',
  },
  'unresolved-projects': {
    title: 'Unresolved projects',
    rationale:
      'The workbook’s project cell did not match an HBCentral project. Mapping correction required.',
    actionHint: 'Correct the mapping and retry.',
  },
  'period-mismatches': {
    title: 'Period mismatches',
    rationale:
      'Submitted against a closed or mismatched reporting period. Period selection must be corrected before replay.',
    actionHint: 'Replay against the correct reporting period.',
  },
  'other-review-required': {
    title: 'Other review required',
    rationale:
      'Review-required uploads that don’t match the categories above. Triage individually.',
    actionHint: 'Inspect and decide on retry or supersede.',
  },
};

/**
 * Group entries by triage category in fixed priority order. Categories with
 * zero entries are omitted — the page does not render empty subheads.
 */
export function bucketEntries(
  entries: ReadonlyArray<ReviewQueueEntry>,
): ReadonlyArray<SafetyTriageCategory> {
  const grouped = new Map<SafetyTriageCategoryId, ReviewQueueEntry[]>();
  for (const entry of entries) {
    const id = categoryForEntry(entry);
    const list = grouped.get(id) ?? [];
    list.push(entry);
    grouped.set(id, list);
  }
  const result: SafetyTriageCategory[] = [];
  for (const id of CATEGORY_ORDER) {
    const list = grouped.get(id);
    if (!list || list.length === 0) continue;
    result.push({
      id,
      ...CATEGORY_META[id],
      entries: list,
    });
  }
  return result;
}

/**
 * Classify the overall queue state. Drives the triage summary copy.
 *
 *   - clean:           no entries awaiting review
 *   - light:           1–2 entries; individually scannable
 *   - duplicate-heavy: ≥3 entries and ≥50% duplicate-suspected
 *   - failure-heavy:   ≥3 entries and ≥50% workflow failures
 *   - backed-up:       >8 entries and not duplicate- or failure-heavy
 *   - active:          everything else
 */
export function classifyQueueState(
  entries: ReadonlyArray<ReviewQueueEntry>,
): SafetyQueueState {
  const total = entries.length;
  if (total === 0) return 'clean';
  if (total <= 2) return 'light';

  const duplicates = entries.filter(
    (e) => e.run.errorClass === 'duplicate-suspected',
  ).length;
  const failures = entries.filter((e) =>
    WORKFLOW_FAILURE_STATUSES.has(e.run.terminalStatus),
  ).length;

  if (duplicates / total >= 0.5) return 'duplicate-heavy';
  if (failures / total >= 0.5) return 'failure-heavy';
  if (total > 8) return 'backed-up';
  return 'active';
}

/**
 * Short authored headline + longer rationale for the triage summary panel.
 */
export interface SafetyQueueNarrative {
  readonly state: SafetyQueueState;
  readonly headline: string;
  readonly rationale: string;
}

export function narrativeForQueueState(
  state: SafetyQueueState,
  total: number,
): SafetyQueueNarrative {
  switch (state) {
    case 'clean':
      return {
        state,
        headline: 'Nothing awaiting review',
        rationale: 'Weekly ingestion is clean. No duplicates, failures, or unresolved items in the queue.',
      };
    case 'light':
      return {
        state,
        headline: total === 1 ? '1 upload awaiting review' : `${total} uploads awaiting review`,
        rationale:
          'A light queue. Each entry can be triaged individually — review cause, then retry or supersede.',
      };
    case 'duplicate-heavy':
      return {
        state,
        headline: `${total} awaiting review — duplicate-heavy`,
        rationale:
          'Most entries are duplicate-suspected. Expect governed supersede decisions; confirm carefully before replacing prior inspections.',
      };
    case 'failure-heavy':
      return {
        state,
        headline: `${total} awaiting review — workflow failures dominant`,
        rationale:
          'Most entries are pipeline-blocked (template, parse, or commit). Inspect cause before retry.',
      };
    case 'backed-up':
      return {
        state,
        headline: `${total} awaiting review — queue is backed up`,
        rationale:
          'The queue is larger than typical operational load. Prioritize by category below.',
      };
    case 'active':
    default:
      return {
        state,
        headline: `${total} awaiting review`,
        rationale:
          'An active queue with a mix of causes. Work through the priority categories below.',
      };
  }
}
