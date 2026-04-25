/**
 * Homepage publish-payload DTO builder for Safety Field Excellence.
 *
 * Produces a `SafetyFieldExcellenceHomepagePayload` suitable for
 * persistence into `Safety Field Excellence Weekly Highlights
 * .HomepagePayloadJson`. The DTO is intentionally a domain-owned shape;
 * Prompt 05 owns the SPFx adapter that maps it onto the homepage
 * `SafetyFieldExcellenceConfig` consumer contract.
 *
 * The builder strips raw checklist JSON, raw findings text, inspector or
 * employee names, and any backend diagnostic payloads. It refuses to
 * build a published payload from an `ineligible` or `do-not-publish`
 * candidate — that is a programming error in the caller.
 */

import type { SafetyReportingPeriod } from '../domain/types.js';
import type {
  SafetyExcellenceCandidateScore,
  SafetyExcellenceCtaLink,
  SafetyExcellenceDataConfidence,
  SafetyExcellenceFreshness,
  SafetyExcellencePrimarySpotlight,
  SafetyExcellenceSecondarySignal,
  SafetyExcellenceTopLineSummary,
  SafetyFieldExcellenceHomepagePayload,
} from './types.js';

const DEFAULT_HEADING = 'Safety and Field Excellence';
const MAX_SECONDARY_SIGNALS = 4;

export interface BuildHomepagePayloadOptions {
  readonly heading?: string;
  readonly primary: SafetyExcellenceCandidateScore;
  readonly secondary?: ReadonlyArray<SafetyExcellenceCandidateScore>;
  readonly reportingPeriod: SafetyReportingPeriod;
  readonly freshUntil?: string;
  readonly sectionCta?: SafetyExcellenceCtaLink;
}

export function buildHomepagePayload(
  options: BuildHomepagePayloadOptions,
): SafetyFieldExcellenceHomepagePayload {
  if (
    options.primary.eligibilityStatus === 'ineligible' ||
    options.primary.publishRecommendation === 'do-not-publish'
  ) {
    throw new Error(
      'buildHomepagePayload refuses to publish an ineligible or do-not-publish candidate.',
    );
  }

  const dataConfidence = mapDataConfidence(options.primary);
  const freshness = buildFreshness(options.reportingPeriod, options.freshUntil);
  const periodLabel = options.reportingPeriod.periodLabel || undefined;

  const topLineSummary: SafetyExcellenceTopLineSummary = {
    statusLabel: dataConfidenceLabel(dataConfidence),
    statusVariant: dataConfidence === 'high' ? 'success' : 'info',
    summaryText: shortSummary(options.primary),
    lastUpdatedLabel: periodLabel ? `Week of ${periodLabel}` : undefined,
  };

  const primarySpotlight = buildPrimarySpotlight(options.primary, freshness);

  const secondarySignals = (options.secondary ?? [])
    .filter((candidate) => candidate.publishRecommendation !== 'do-not-publish')
    .filter((candidate) => candidate.eligibilityStatus !== 'ineligible')
    .slice(0, MAX_SECONDARY_SIGNALS)
    .map((candidate, index) => buildSecondarySignal(candidate, freshness, index));

  const degradedNotice =
    dataConfidence === 'low'
      ? 'Recognition is published with reduced data confidence; verify before broad communication.'
      : undefined;

  return {
    heading: options.heading ?? DEFAULT_HEADING,
    topLineSummary,
    primarySpotlight,
    secondarySignals,
    sectionCta: options.sectionCta,
    dataConfidence,
    degradedNotice,
    periodLabel,
    weekStartDate: options.reportingPeriod.weekStartDate,
    weekEndDate: options.reportingPeriod.weekEndDate,
    isPreview: false,
  };
}

function buildPrimarySpotlight(
  candidate: SafetyExcellenceCandidateScore,
  freshness: SafetyExcellenceFreshness,
): SafetyExcellencePrimarySpotlight {
  return {
    id: `excellence-primary-${candidate.sourceInspectionIds[0] ?? candidate.generatedAt}`,
    title: composeTitle(candidate),
    summary: candidate.reasonSummary,
    urgency: 'routine',
    context: {
      project: composeTitle(candidate),
      scope: 'Safety Field Excellence',
    },
    indicator: {
      label: indicatorLabel(candidate),
      variant: candidate.publishRecommendation === 'primary' ? 'success' : 'info',
    },
    freshness,
  };
}

function buildSecondarySignal(
  candidate: SafetyExcellenceCandidateScore,
  freshness: SafetyExcellenceFreshness,
  order: number,
): SafetyExcellenceSecondarySignal {
  return {
    id: `excellence-secondary-${order}-${candidate.sourceInspectionIds[0] ?? candidate.generatedAt}`,
    title: composeTitle(candidate),
    summary: shortSummary(candidate),
    compactSummary: shortSummary(candidate),
    urgency: 'routine',
    context: {
      project: composeTitle(candidate),
      scope: 'Safety Field Excellence',
    },
    indicator: {
      label: indicatorLabel(candidate),
      variant: 'info',
    },
    freshness,
    order,
  };
}

function composeTitle(candidate: SafetyExcellenceCandidateScore): string {
  // intentionally avoids inspector/employee names; project-scoped only.
  return `Project ${candidate.publishRecommendation === 'primary' ? '· Primary' : '· Recognized'}`;
}

function shortSummary(candidate: SafetyExcellenceCandidateScore): string {
  return `Composite ${candidate.compositeScore.toFixed(1)} across ${candidate.inspectionCountWindow} accepted inspection${candidate.inspectionCountWindow === 1 ? '' : 's'}.`;
}

function indicatorLabel(candidate: SafetyExcellenceCandidateScore): string {
  switch (candidate.publishRecommendation) {
    case 'primary':
      return 'Primary recognition';
    case 'secondary':
      return 'Supporting recognition';
    case 'monitor':
      return 'Monitoring';
    case 'do-not-publish':
      return 'Held';
  }
}

function mapDataConfidence(
  candidate: SafetyExcellenceCandidateScore,
): SafetyExcellenceDataConfidence {
  if (candidate.dataQualityScore >= 80 && candidate.activityEvidenceStatus === 'proven') {
    return 'high';
  }
  if (candidate.dataQualityScore >= 60) return 'medium';
  return 'low';
}

function dataConfidenceLabel(confidence: SafetyExcellenceDataConfidence): string {
  switch (confidence) {
    case 'high':
      return 'Verified weekly recognition';
    case 'medium':
      return 'Weekly recognition (review recommended)';
    case 'low':
      return 'Weekly recognition (limited confidence)';
  }
}

function buildFreshness(
  period: SafetyReportingPeriod,
  freshUntil: string | undefined,
): SafetyExcellenceFreshness {
  return {
    source: 'live',
    updatedAt: period.publishedAt ?? period.weekEndDate,
    expiresAt: freshUntil,
  };
}
