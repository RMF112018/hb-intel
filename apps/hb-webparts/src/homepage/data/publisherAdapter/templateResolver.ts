/**
 * Deterministic template resolver for the Project Spotlight publisher.
 *
 * Authority: docs/architecture/plans/MASTER/spfx/publisher/architecture/05-Template-Registry-Schema.md
 *
 * Rules (ordered):
 *   1. Admin override — if the post carries a non-empty `TemplateKey`, prefer
 *      the registry entry with that exact key. The override must still be
 *      `TemplateStatus === 'active'`; an inactive override resolves to a
 *      hard failure with reason `'overrideInactive'`.
 *   2. Applicability filter — an entry is a candidate when every applicability
 *      array the entry declares (PostFamily, SpotlightType, ProjectStage,
 *      ArticleSubject) contains the post's corresponding value. An empty or
 *      missing applicability array is treated as a wildcard.
 *   3. Status filter — only `TemplateStatus === 'active'` entries are
 *      candidates.
 *   4. Specificity tie-break — among candidates, prefer the entry whose
 *      applicability filters match most narrowly (highest sum of declared,
 *      matching filters beyond PostFamily). PostFamily is required and
 *      contributes 1 to every candidate.
 *   5. Version tie-break — if specificity ties, prefer the entry with the
 *      highest `TemplateVersion` using a semver-loose compare (numeric parts
 *      compared left-to-right; non-numeric suffixes compared lexicographically
 *      last).
 *   6. Stable ordering — if versions tie, preserve the input registry order.
 *
 * The resolver is pure. It never reads SharePoint, never touches the DOM,
 * and never throws on unmatched input — failures surface as a typed result.
 */

import type {
  ArticleSubject,
  PostFamily,
  ProjectStage,
  SpotlightType,
} from './publisherEnums';
import type { PublisherTemplateRegistryRow } from './publisherContracts';

export interface TemplateResolverInput {
  readonly TemplateKey?: string;
  readonly PostFamily: PostFamily;
  readonly SpotlightType?: SpotlightType;
  readonly ProjectStage?: ProjectStage;
  readonly ArticleSubject?: ArticleSubject;
}

export type TemplateResolutionFailureReason =
  | 'emptyRegistry'
  | 'overrideNotFound'
  | 'overrideInactive'
  | 'noCandidate'
  | 'ambiguous';

export interface TemplateResolutionTraceStep {
  readonly entryKey: string;
  readonly status: 'candidate' | 'rejected';
  readonly reason?: string;
  readonly specificityScore?: number;
}

export interface TemplateResolutionTrace {
  readonly input: TemplateResolverInput;
  readonly steps: readonly TemplateResolutionTraceStep[];
  readonly selectedKey?: string;
  readonly selectionRule?:
    | 'adminOverride'
    | 'applicability'
    | 'specificityTieBreak'
    | 'versionTieBreak';
}

export type TemplateResolutionResult =
  | {
      readonly ok: true;
      readonly entry: PublisherTemplateRegistryRow;
      readonly trace: TemplateResolutionTrace;
    }
  | {
      readonly ok: false;
      readonly reason: TemplateResolutionFailureReason;
      readonly message: string;
      readonly trace: TemplateResolutionTrace;
    };

/**
 * Loose semver-style comparator for `TemplateVersion`.
 * Splits on `.` and compares numeric segments numerically; non-numeric
 * suffixes compare lexicographically so `1.2.0` > `1.2.0-beta`.
 */
export function compareTemplateVersions(a: string, b: string): number {
  const split = (v: string): Array<number | string> =>
    v.split(/[.+-]/).map((seg) => {
      const n = Number(seg);
      return Number.isFinite(n) && seg.trim().length > 0 ? n : seg;
    });
  const aa = split(a);
  const bb = split(b);
  const len = Math.max(aa.length, bb.length);
  for (let i = 0; i < len; i++) {
    const av = aa[i];
    const bv = bb[i];
    if (av === undefined && bv !== undefined) {
      // Missing segment vs. non-numeric trailing ⇒ release > pre-release.
      return typeof bv === 'string' ? 1 : -1;
    }
    if (av !== undefined && bv === undefined) {
      return typeof av === 'string' ? -1 : 1;
    }
    if (typeof av === 'number' && typeof bv === 'number') {
      if (av !== bv) return av - bv;
    } else {
      const as = String(av);
      const bs = String(bv);
      if (as !== bs) return as.localeCompare(bs);
    }
  }
  return 0;
}

function applicabilityMatches<T>(
  declared: readonly T[] | undefined,
  value: T | undefined,
): { matches: boolean; declared: boolean } {
  if (!declared || declared.length === 0) {
    // Wildcard — treated as a match but does not add to specificity.
    return { matches: true, declared: false };
  }
  if (value === undefined) return { matches: false, declared: true };
  return { matches: declared.includes(value), declared: true };
}

function scoreCandidate(
  entry: PublisherTemplateRegistryRow,
  input: TemplateResolverInput,
): { matches: boolean; score: number; reason?: string } {
  // PostFamily is mandatory per arch doc 05; registry rows always declare it.
  const postFamily = applicabilityMatches(entry.PostFamily, input.PostFamily);
  if (!postFamily.matches) {
    return { matches: false, score: 0, reason: 'postFamilyMismatch' };
  }

  const spotlight = applicabilityMatches(
    entry.SpotlightType,
    input.SpotlightType,
  );
  if (!spotlight.matches) {
    return { matches: false, score: 0, reason: 'spotlightTypeMismatch' };
  }

  const stage = applicabilityMatches(entry.ProjectStage, input.ProjectStage);
  if (!stage.matches) {
    return { matches: false, score: 0, reason: 'projectStageMismatch' };
  }

  const subject = applicabilityMatches(
    entry.ArticleSubject,
    input.ArticleSubject,
  );
  if (!subject.matches) {
    return { matches: false, score: 0, reason: 'articleSubjectMismatch' };
  }

  const declaredCount =
    (postFamily.declared ? 1 : 0) +
    (spotlight.declared ? 1 : 0) +
    (stage.declared ? 1 : 0) +
    (subject.declared ? 1 : 0);

  return { matches: true, score: declaredCount };
}

export function resolveTemplate(
  input: TemplateResolverInput,
  registry: readonly PublisherTemplateRegistryRow[],
): TemplateResolutionResult {
  const steps: TemplateResolutionTraceStep[] = [];

  if (registry.length === 0) {
    return {
      ok: false,
      reason: 'emptyRegistry',
      message: 'No template registry entries provided.',
      trace: { input, steps },
    };
  }

  // Rule 1 — admin override.
  const overrideKey = input.TemplateKey?.trim();
  if (overrideKey) {
    const overrideEntry = registry.find((r) => r.TemplateKey === overrideKey);
    if (!overrideEntry) {
      steps.push({
        entryKey: overrideKey,
        status: 'rejected',
        reason: 'overrideNotFound',
      });
      return {
        ok: false,
        reason: 'overrideNotFound',
        message: `Admin override TemplateKey '${overrideKey}' was not found in the registry.`,
        trace: { input, steps },
      };
    }
    if (overrideEntry.TemplateStatus !== 'active') {
      steps.push({
        entryKey: overrideKey,
        status: 'rejected',
        reason: `overrideStatus:${overrideEntry.TemplateStatus}`,
      });
      return {
        ok: false,
        reason: 'overrideInactive',
        message: `Admin override '${overrideKey}' is not active (status=${overrideEntry.TemplateStatus}).`,
        trace: { input, steps },
      };
    }
    steps.push({
      entryKey: overrideKey,
      status: 'candidate',
      reason: 'adminOverride',
    });
    return {
      ok: true,
      entry: overrideEntry,
      trace: {
        input,
        steps,
        selectedKey: overrideEntry.TemplateKey,
        selectionRule: 'adminOverride',
      },
    };
  }

  // Rules 2-3 — applicability + status filter.
  const candidates: Array<{
    entry: PublisherTemplateRegistryRow;
    score: number;
    index: number;
  }> = [];

  registry.forEach((entry, index) => {
    if (entry.TemplateStatus !== 'active') {
      steps.push({
        entryKey: entry.TemplateKey,
        status: 'rejected',
        reason: `status:${entry.TemplateStatus}`,
      });
      return;
    }
    const { matches, score, reason } = scoreCandidate(entry, input);
    if (!matches) {
      steps.push({
        entryKey: entry.TemplateKey,
        status: 'rejected',
        reason,
      });
      return;
    }
    steps.push({
      entryKey: entry.TemplateKey,
      status: 'candidate',
      specificityScore: score,
    });
    candidates.push({ entry, score, index });
  });

  if (candidates.length === 0) {
    return {
      ok: false,
      reason: 'noCandidate',
      message: 'No active template registry entry matched the post.',
      trace: { input, steps },
    };
  }

  // Rule 4 — specificity tie-break.
  const maxScore = candidates.reduce(
    (max, c) => (c.score > max ? c.score : max),
    0,
  );
  const mostSpecific = candidates.filter((c) => c.score === maxScore);

  if (mostSpecific.length === 1) {
    const winner = mostSpecific[0]!.entry;
    return {
      ok: true,
      entry: winner,
      trace: {
        input,
        steps,
        selectedKey: winner.TemplateKey,
        selectionRule:
          candidates.length === 1 ? 'applicability' : 'specificityTieBreak',
      },
    };
  }

  // Rule 5 — version tie-break.
  const sortedByVersion = mostSpecific
    .slice()
    .sort((a, b) => {
      const cmp = compareTemplateVersions(
        b.entry.TemplateVersion,
        a.entry.TemplateVersion,
      );
      if (cmp !== 0) return cmp;
      // Rule 6 — stable order.
      return a.index - b.index;
    });

  const winner = sortedByVersion[0]!.entry;
  return {
    ok: true,
    entry: winner,
    trace: {
      input,
      steps,
      selectedKey: winner.TemplateKey,
      selectionRule: 'versionTieBreak',
    },
  };
}
