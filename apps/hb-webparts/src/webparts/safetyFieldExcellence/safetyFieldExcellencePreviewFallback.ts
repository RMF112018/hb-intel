/**
 * Frontend preview-fallback config for Safety Field Excellence.
 *
 * Used when:
 *  - source mode is `dynamic-only` and no published highlight exists,
 *  - source mode is `dynamic-with-curated-fallback` and the host has no
 *    curated config to fall back to,
 *  - the dynamic adapter encounters an auth/network/invalid-payload
 *    failure in `dynamic-only` mode.
 *
 * The preview must be clearly labeled "preview / awaiting published
 * weekly data", must not name a fake winning project, and must include
 * representative evidence categories. CTA is supplied by config; we do
 * not fabricate links.
 */

import type { HomepageCtaLink } from '../../homepage/models/contentModels.js';
import type { SafetyFieldExcellenceConfig } from '../../homepage/webparts/operationalAwarenessContracts.js';

const PREVIEW_HEADING = 'Safety and Field Excellence';
const PREVIEW_SUMMARY =
  'Once weekly Safety records are published, this surface will highlight verified field-safety performance based on inspection consistency, active-jobsite evidence, finding response, and data quality.';

export interface BuildSafetyExcellencePreviewFallbackOptions {
  readonly heading?: string;
  readonly safetyHubUrl?: string;
  readonly safetyHubLabel?: string;
}

export function buildSafetyExcellencePreviewFallbackConfig(
  options: BuildSafetyExcellencePreviewFallbackOptions = {},
): SafetyFieldExcellenceConfig {
  const sectionCta: HomepageCtaLink | undefined = options.safetyHubUrl
    ? {
        label: options.safetyHubLabel ?? 'Open Safety hub',
        href: options.safetyHubUrl,
      }
    : undefined;

  return {
    heading: options.heading ?? PREVIEW_HEADING,
    topLineSummary: {
      statusLabel: 'Preview — awaiting published weekly data',
      statusVariant: 'info',
      summaryText: PREVIEW_SUMMARY,
      lastUpdatedLabel: 'Awaiting published weekly data',
    },
    primarySpotlight: {
      id: 'safety-excellence-preview',
      title: 'Weekly Safety Excellence Preview',
      summary: PREVIEW_SUMMARY,
      compactSummary: 'Preview of the weekly Safety Excellence highlight.',
      urgency: 'routine',
      metadata: 'Preview content — not a live project recognition',
      indicator: { label: 'Preview', variant: 'info' },
      freshness: { source: 'curated' },
    },
    // Each preview signal carries a distinct indicator variant so the
    // surface reads as a productized preview of four evidence categories,
    // not as flat-gray filler tiles. Urgency stays `'routine'` — the
    // preview is not an alarm.
    secondarySignals: [
      {
        id: 'safety-preview-inspection-consistency',
        title: 'Inspection consistency',
        summary:
          'Published highlights will consider rolling inspection performance, not a single score.',
        urgency: 'routine',
        indicator: { label: 'Example · Inspection', variant: 'info' },
      },
      {
        id: 'safety-preview-activity-evidence',
        title: 'Active field exposure',
        summary:
          'The model will look for evidence that meaningful work was active on site.',
        urgency: 'routine',
        indicator: { label: 'Example · Exposure', variant: 'success' },
      },
      {
        id: 'safety-preview-corrective-response',
        title: 'Finding response',
        summary:
          'Corrective-action behavior and finding severity will inform recognition.',
        urgency: 'routine',
        indicator: { label: 'Example · Response', variant: 'warning' },
      },
      {
        id: 'safety-preview-finding-severity',
        title: 'Finding severity trend',
        summary:
          'Trend in high- and medium-severity findings will be a recognition input.',
        urgency: 'routine',
        indicator: { label: 'Example · Trend', variant: 'neutral' },
      },
    ],
    sectionCta,
    maxSecondaryItems: 4,
  };
}
