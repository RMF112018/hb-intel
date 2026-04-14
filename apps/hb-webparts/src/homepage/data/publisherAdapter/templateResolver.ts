/**
 * Deterministic template resolver for the Article Publisher.
 *
 * Authority (tenant truth): `HB Article Template Registry`
 * columns documented in the publisher list schema report.
 *
 * Rules (ordered):
 *   1. Admin override — when the article carries a non-empty
 *      `TemplateKey`, prefer the registry entry with that exact key.
 *      The override must still be `IsActive === true`; an inactive
 *      override resolves to a hard failure with `overrideInactive`.
 *   2. Active filter — only `IsActive === true` rows are candidates.
 *   3. Destination filter — the row's `Destination` must equal the
 *      article's destination.
 *   4. Applicability filter — `ContentTypes` must contain the
 *      article's `ArticleContentType`; `SpotlightTypes`,
 *      `ProjectStages`, and `ArticleSubjects` are each wildcarded
 *      when empty/undefined and must otherwise contain the article's
 *      value.
 *   5. Specificity tie-break — prefer rows with the most declared
 *      applicability arrays (beyond `ContentTypes`, which is always
 *      declared).
 *   6. Priority tie-break — among equally-specific candidates, prefer
 *      the row with the highest tenant `TemplatePriority`.
 *   7. Version tie-break — prefer the highest `VersionLabel` by a
 *      loose semver comparison; missing labels compare as lower.
 *   8. Stable ordering — if everything above ties, preserve input
 *      registry order.
 *
 * The resolver is pure. It never reads SharePoint, never touches the
 * DOM, and never throws on unmatched input — failures surface as a
 * typed result.
 */

import type {
  ArticleContentType,
  ArticleSubject,
  Destination,
  ProjectStage,
  SpotlightType,
} from './publisherEnums';
import type { PublisherTemplateRegistryRow } from './publisherContracts';

export interface TemplateResolverInput {
  readonly TemplateKey?: string;
  readonly ArticleContentType: ArticleContentType;
  readonly Destination: Destination;
  readonly SpotlightType?: SpotlightType;
  readonly ProjectStage?: ProjectStage;
  readonly ArticleSubject?: ArticleSubject;
}

export type SystemManagedTemplateResolverInput = Omit<
  TemplateResolverInput,
  'TemplateKey'
>;

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
  readonly priority?: number;
}

export interface TemplateResolutionTrace {
  readonly input: TemplateResolverInput;
  readonly steps: readonly TemplateResolutionTraceStep[];
  readonly selectedKey?: string;
  readonly selectionRule?:
    | 'adminOverride'
    | 'applicability'
    | 'specificityTieBreak'
    | 'priorityTieBreak'
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
 * Loose semver-style comparator for tenant `VersionLabel`.
 * Splits on `.`/`+`/`-` and compares numeric segments numerically;
 * non-numeric suffixes compare lexicographically so `1.2.0` > `1.2.0-beta`.
 * Missing labels compare as lower than any labelled entry.
 */
export function compareVersionLabels(a: string | undefined, b: string | undefined): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
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
    return { matches: true, declared: false };
  }
  if (value === undefined) return { matches: false, declared: true };
  return { matches: declared.includes(value), declared: true };
}

function scoreCandidate(
  entry: PublisherTemplateRegistryRow,
  input: TemplateResolverInput,
): { matches: boolean; score: number; reason?: string } {
  if (entry.Destination !== input.Destination) {
    return { matches: false, score: 0, reason: 'destinationMismatch' };
  }

  // ContentTypes is mandatory per tenant schema; registry rows always declare it.
  const contentTypes = applicabilityMatches(entry.ContentTypes, input.ArticleContentType);
  if (!contentTypes.matches) {
    return { matches: false, score: 0, reason: 'contentTypeMismatch' };
  }

  const spotlight = applicabilityMatches(entry.SpotlightTypes, input.SpotlightType);
  if (!spotlight.matches) {
    return { matches: false, score: 0, reason: 'spotlightTypeMismatch' };
  }

  const stage = applicabilityMatches(entry.ProjectStages, input.ProjectStage);
  if (!stage.matches) {
    return { matches: false, score: 0, reason: 'projectStageMismatch' };
  }

  const subject = applicabilityMatches(entry.ArticleSubjects, input.ArticleSubject);
  if (!subject.matches) {
    return { matches: false, score: 0, reason: 'articleSubjectMismatch' };
  }

  const declaredCount =
    (contentTypes.declared ? 1 : 0) +
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
    if (!overrideEntry.IsActive) {
      steps.push({
        entryKey: overrideKey,
        status: 'rejected',
        reason: 'overrideInactive',
      });
      return {
        ok: false,
        reason: 'overrideInactive',
        message: `Admin override '${overrideKey}' is not active (IsActive=false).`,
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

  // Rules 2-4 — active + destination + applicability.
  const candidates: Array<{
    entry: PublisherTemplateRegistryRow;
    score: number;
    index: number;
  }> = [];

  registry.forEach((entry, index) => {
    if (!entry.IsActive) {
      steps.push({
        entryKey: entry.TemplateKey,
        status: 'rejected',
        reason: 'inactive',
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
      priority: entry.TemplatePriority,
    });
    candidates.push({ entry, score, index });
  });

  if (candidates.length === 0) {
    return {
      ok: false,
      reason: 'noCandidate',
      message: 'No active template registry entry matched the article.',
      trace: { input, steps },
    };
  }

  // Rule 5 — specificity tie-break.
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

  // Rule 6 — priority tie-break (higher wins).
  const maxPriority = mostSpecific.reduce(
    (max, c) => (c.entry.TemplatePriority > max ? c.entry.TemplatePriority : max),
    Number.NEGATIVE_INFINITY,
  );
  const topPriority = mostSpecific.filter((c) => c.entry.TemplatePriority === maxPriority);

  if (topPriority.length === 1) {
    const winner = topPriority[0]!.entry;
    return {
      ok: true,
      entry: winner,
      trace: {
        input,
        steps,
        selectedKey: winner.TemplateKey,
        selectionRule: 'priorityTieBreak',
      },
    };
  }

  // Rule 7 — version tie-break (by VersionLabel).
  const sortedByVersion = topPriority
    .slice()
    .sort((a, b) => {
      const cmp = compareVersionLabels(b.entry.VersionLabel, a.entry.VersionLabel);
      if (cmp !== 0) return cmp;
      // Rule 8 — stable order.
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

/**
 * Ordinary authoring/publish resolution path.
 *
 * Intentionally ignores any persisted article `TemplateKey` and
 * resolves strictly from current discriminators so stale keys cannot
 * survive metadata changes unless an explicit override flow exists.
 */
export function resolveTemplateSystemManaged(
  input: SystemManagedTemplateResolverInput,
  registry: readonly PublisherTemplateRegistryRow[],
): TemplateResolutionResult {
  return resolveTemplate(
    {
      TemplateKey: undefined,
      ...input,
    },
    registry,
  );
}
