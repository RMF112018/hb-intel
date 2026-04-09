/**
 * Recurring milestone candidate generator for People & Culture.
 *
 * Phase-14 pc/ Prompt-04 (Media, Preview, Homepage, Milestone Operations).
 *
 * Converts a trusted people-source snapshot into a
 * `PeopleCultureMilestoneCandidate[]` ready to hand to the HR review
 * queue. Generation is deterministic, pure, and side-effect-free —
 * real persistence is handled by the companion reducer / a future
 * SharePoint list adapter.
 *
 * Rules (aligned with the Decision-Lock Appendix hybrid-intake model):
 *
 *   - Birthday candidates are generated for every person whose
 *     birthday falls inside a forward window starting at `referenceDate`.
 *   - Service-anniversary candidates are generated for every person
 *     whose hire-date anniversary (year-count ≥ 1) falls inside the
 *     same window. One-year milestones use the `newHireAnniversary`
 *     candidate type; multi-year milestones use `serviceAnniversary`.
 *   - Every candidate lands in `reviewState: 'pendingReview'`. HR
 *     reviews, edits, suppresses, schedules, features, or publishes
 *     via the companion.
 *   - Candidates are never auto-published — the queue is the hybrid
 *     step between automation and HR authoring.
 *   - A stable deterministic id scheme is used so re-running the
 *     generator does not double-enqueue. `dedupeAgainst` lets callers
 *     pass previously-generated candidates so the generator skips
 *     any id that already exists.
 */

import type {
  PeopleCultureMilestoneCandidate,
  PeopleCultureMilestoneCandidateType,
} from '../webparts/peopleCultureSplitContracts.js';

const MS_PER_DAY = 86_400_000;

export interface PeopleSourceRecord {
  /** Stable identifier — typically an email or SharePoint GUID. */
  id: string;
  displayName: string;
  /** ISO date (yyyy-mm-dd) of birth. Year is irrelevant. */
  birthDate?: string;
  /** ISO date (yyyy-mm-dd) of hire. Year is used for anniversary math. */
  hireDate?: string;
}

export interface MilestoneGeneratorOptions {
  referenceDate?: Date;
  /** Forward window in days. Defaults to 14. */
  windowDays?: number;
  /** Source-system identifier stamped onto every candidate. Defaults to `PeopleData`. */
  sourceSystem?: string;
  /** Previously-generated candidates whose ids should be skipped. */
  dedupeAgainst?: ReadonlyArray<PeopleCultureMilestoneCandidate>;
  /**
   * Optional fixed `generatedAt` ISO timestamp. Useful for tests. Defaults
   * to `referenceDate.toISOString()`.
   */
  generatedAt?: string;
}

function parseIsoDay(value: string | undefined): { month: number; day: number; year: number } | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return undefined;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return undefined;
  }
  return { year, month, day };
}

function toIsoDay(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(
    day,
  ).padStart(2, '0')}`;
}

function daysBetween(aMs: number, bMs: number): number {
  return Math.round((bMs - aMs) / MS_PER_DAY);
}

/**
 * Build the next occurrence (on or after `referenceDate`) of a recurring
 * month/day. Returns the year to pair with the given month/day.
 */
function nextOccurrenceYear(
  month: number,
  day: number,
  referenceDate: Date,
): number {
  const refYear = referenceDate.getUTCFullYear();
  const refMs = Date.UTC(
    refYear,
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
  );
  const thisYearMs = Date.UTC(refYear, month - 1, day);
  return thisYearMs >= refMs ? refYear : refYear + 1;
}

function candidateId(type: PeopleCultureMilestoneCandidateType, personId: string, occursOn: string): string {
  return `mc:${type}:${personId}:${occursOn}`;
}

/**
 * Generate recurring milestone candidates from a trusted people source.
 *
 * The generator produces, per person, up to one birthday candidate and
 * one service-anniversary candidate for the next upcoming occurrence
 * inside the forward window. Callers can extend the window by
 * re-running the generator with a later `referenceDate`.
 */
export function generateMilestoneCandidates(
  people: ReadonlyArray<PeopleSourceRecord>,
  options: MilestoneGeneratorOptions = {},
): PeopleCultureMilestoneCandidate[] {
  const referenceDate = options.referenceDate ?? new Date();
  const windowDays = options.windowDays ?? 14;
  const sourceSystem = options.sourceSystem ?? 'PeopleData';
  const generatedAt = options.generatedAt ?? referenceDate.toISOString();
  const dedupe = new Set(
    (options.dedupeAgainst ?? []).map((candidate) => candidate.id),
  );

  const refMs = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
  );

  const out: PeopleCultureMilestoneCandidate[] = [];

  for (const person of people) {
    const personId = person.id?.trim();
    const displayName = person.displayName?.trim();
    if (!personId || !displayName) continue;

    // --- Birthday candidate ----------------------------------------------
    const birth = parseIsoDay(person.birthDate);
    if (birth) {
      const year = nextOccurrenceYear(birth.month, birth.day, referenceDate);
      const occursOn = toIsoDay(year, birth.month, birth.day);
      const occursMs = Date.UTC(year, birth.month - 1, birth.day);
      const delta = daysBetween(refMs, occursMs);
      if (delta >= 0 && delta <= windowDays) {
        const id = candidateId('birthday', personId, occursOn);
        if (!dedupe.has(id)) {
          dedupe.add(id);
          out.push({
            id,
            candidateType: 'birthday',
            personId,
            personDisplayName: displayName,
            occursOn,
            generatedAt,
            sourceSystem,
            reviewState: 'pendingReview',
          });
        }
      }
    }

    // --- Service / new-hire anniversary candidate -------------------------
    const hire = parseIsoDay(person.hireDate);
    if (hire) {
      const year = nextOccurrenceYear(hire.month, hire.day, referenceDate);
      const occursOn = toIsoDay(year, hire.month, hire.day);
      const occursMs = Date.UTC(year, hire.month - 1, hire.day);
      const delta = daysBetween(refMs, occursMs);
      const yearsOfService = year - hire.year;
      if (delta >= 0 && delta <= windowDays && yearsOfService >= 1) {
        const candidateType: PeopleCultureMilestoneCandidateType =
          yearsOfService === 1 ? 'newHireAnniversary' : 'serviceAnniversary';
        const id = candidateId(candidateType, personId, occursOn);
        if (!dedupe.has(id)) {
          dedupe.add(id);
          out.push({
            id,
            candidateType,
            personId,
            personDisplayName: displayName,
            occursOn,
            generatedAt,
            sourceSystem,
            reviewState: 'pendingReview',
            anniversaryYears: yearsOfService,
          });
        }
      }
    }
  }

  // Deterministic order: by occursOn asc, then personId asc, then type.
  out.sort((a, b) => {
    if (a.occursOn !== b.occursOn) return a.occursOn.localeCompare(b.occursOn);
    if (a.personId !== b.personId) return a.personId.localeCompare(b.personId);
    return a.candidateType.localeCompare(b.candidateType);
  });

  return out;
}
