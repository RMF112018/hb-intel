/**
 * Public surface of the Safety Field Excellence domain package.
 *
 * Pure-domain only: no React, no SPFx, no backend Function App, no
 * `apps/hb-webparts` imports.
 */

export {
  generateCandidateScore,
  averageAcceptedPercent,
} from './generate.js';
export { rankCandidates } from './ranking.js';
export { buildHomepagePayload } from './homepagePayload.js';
export type { BuildHomepagePayloadOptions } from './homepagePayload.js';
export { buildPreviewPayload } from './previewPayload.js';
export type { BuildPreviewPayloadOptions } from './previewPayload.js';
export {
  EXCELLENCE_GENERATOR_VERSION,
  EXCELLENCE_REASON_CODES,
} from './types.js';
export type {
  ExcellenceReasonCode,
  SafetyActivityEvidence,
  SafetyActivityEvidenceSource,
  SafetyActivityEvidenceStatus,
  SafetyExcellenceCandidateInput,
  SafetyExcellenceCandidateScore,
  SafetyExcellenceContextMetadata,
  SafetyExcellenceCtaLink,
  SafetyExcellenceDataConfidence,
  SafetyExcellenceEligibilityStatus,
  SafetyExcellenceFreshness,
  SafetyExcellencePrimarySpotlight,
  SafetyExcellencePublishRecommendation,
  SafetyExcellenceSecondarySignal,
  SafetyExcellenceStatusSignal,
  SafetyExcellenceStatusVariant,
  SafetyExcellenceTopLineSummary,
  SafetyExcellenceUrgency,
  SafetyFieldExcellenceHomepagePayload,
  SafetyFieldExcellencePreviewPayload,
  SafetyFieldExcellencePublishStatus,
  SafetyFieldExcellencePublishedPayloadDraft,
} from './types.js';
