import type {
  LegacyFallbackMatchConfidence,
  LegacyFallbackMatchMethod,
} from '@hbc/models/provisioning';

/**
 * Prompt 01 parser + matching contract assumptions.
 *
 * Discovery/sync execution is deferred. This module only locks canonical
 * assumptions and helper transforms for later implementation phases.
 */

export const LEGACY_PROJECT_NUMBER_REGEX = /^\d{2}-\d{3}-\d{2}\b/;

export const LEGACY_NAME_NORMALIZATION_RULES = [
  'trim-whitespace',
  'collapse-repeated-space',
  'lowercase',
  'remove-decorative-punctuation',
  'replace-ampersand-with-and',
  'strip-leading-project-number-token',
] as const;

const DECORATIVE_PUNCTUATION_REGEX = /[.,!?()\[\]{}"'`~]/g;

export function stripLeadingProjectNumberToken(rawName: string): string {
  return rawName.replace(LEGACY_PROJECT_NUMBER_REGEX, '').trim();
}

export function normalizeLegacyCandidateName(rawName: string): string {
  const trimmed = rawName.trim();
  const withoutProjectNumber = stripLeadingProjectNumberToken(trimmed);

  return withoutProjectNumber
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(DECORATIVE_PUNCTUATION_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const MATCH_METHOD_CONFIDENCE: Readonly<Record<LegacyFallbackMatchMethod, LegacyFallbackMatchConfidence>> = {
  'project-number-exact': 'high',
  'normalized-title-year': 'medium',
  'manual-bind': 'high',
  'manual-override': 'medium',
  'no-match': 'none',
};
