/**
 * Polished preview / no-data payload for Safety Field Excellence.
 *
 * Used by Prompt 05 when no published weekly highlight exists. The
 * preview must communicate future-state intent, never name a real
 * project as a winner, and meet homepage-grade tone.
 */

import type {
  SafetyExcellenceCtaLink,
  SafetyExcellenceSecondarySignal,
  SafetyExcellenceTopLineSummary,
  SafetyFieldExcellencePreviewPayload,
} from './types.js';

const DEFAULT_HEADING = 'Safety and Field Excellence';
const DEFAULT_CTA_LABEL = 'Open Safety hub';

const PREVIEW_TOP_LINE: SafetyExcellenceTopLineSummary = {
  statusLabel: 'Preview — awaiting published weekly data',
  statusVariant: 'info',
  summaryText:
    'Once weekly Safety records are published, this surface will highlight the project ' +
    'with the strongest verified field-safety performance — based on inspection consistency, ' +
    'active-jobsite evidence, finding response, and data quality.',
};

const PREVIEW_SECONDARY_SIGNALS: ReadonlyArray<SafetyExcellenceSecondarySignal> = [
  {
    id: 'excellence-preview-inspection-consistency',
    title: 'Inspection consistency',
    summary: 'Rolling-week trend of accepted inspection performance.',
    urgency: 'routine',
    indicator: { label: 'Future signal', variant: 'info' },
    order: 0,
  },
  {
    id: 'excellence-preview-corrective-action',
    title: 'Corrective-action response',
    summary: 'How quickly identified findings are addressed and closed.',
    urgency: 'routine',
    indicator: { label: 'Future signal', variant: 'info' },
    order: 1,
  },
  {
    id: 'excellence-preview-active-exposure',
    title: 'Active field exposure',
    summary: 'Confirmed jobsite activity during the recognition window.',
    urgency: 'routine',
    indicator: { label: 'Future signal', variant: 'info' },
    order: 2,
  },
  {
    id: 'excellence-preview-finding-severity',
    title: 'Finding severity trend',
    summary: 'Change in high- and medium-severity findings over time.',
    urgency: 'routine',
    indicator: { label: 'Future signal', variant: 'info' },
    order: 3,
  },
];

export interface BuildPreviewPayloadOptions {
  readonly heading?: string;
  readonly ctaHref?: string;
  readonly ctaLabel?: string;
}

export function buildPreviewPayload(
  options: BuildPreviewPayloadOptions = {},
): SafetyFieldExcellencePreviewPayload {
  const sectionCta: SafetyExcellenceCtaLink | undefined = options.ctaHref
    ? {
        label: options.ctaLabel ?? DEFAULT_CTA_LABEL,
        href: options.ctaHref,
      }
    : undefined;

  return {
    heading: options.heading ?? DEFAULT_HEADING,
    topLineSummary: PREVIEW_TOP_LINE,
    secondarySignals: PREVIEW_SECONDARY_SIGNALS,
    sectionCta,
    dataConfidence: 'low',
    isPreview: true,
  };
}
