/**
 * @hbc/ai-assist — Constants (SF15-T02)
 *
 * Constant groups derived from authoritative type unions.
 */

import type { AiTrustLevel, AiOutputType } from '../types/index.js';

/** Default configuration for AI assist behavior. */
export const AI_ASSIST_DEFAULTS = {
  maxConcurrentActions: 1,
  defaultTrustLevel: 'essential' as AiTrustLevel,
  streamingEnabled: true,
  auditEnabled: true,
} as const;

/** Enumeration of trust levels for progressive disclosure. */
export const AI_TRUST_LEVELS: readonly AiTrustLevel[] = [
  'essential',
  'standard',
  'expert',
] as const;

/** Categories for grouping AI actions in the action menu. */
export const AI_ACTION_CATEGORIES = {
  analysis: 'Analysis',
  generation: 'Generation',
  assessment: 'Assessment',
} as const;

/** All valid AI output types. */
export const AI_OUTPUT_TYPES: readonly AiOutputType[] = [
  'text',
  'bullet-list',
  'structured-object',
] as const;

/** Confidence badge values for Trust Meter (D-03). */
export const AI_CONFIDENCE_BADGES = ['high', 'medium', 'low'] as const;

/** Policy decision outcomes for governance controls (D-05). */
export const AI_POLICY_DECISIONS = ['allowed', 'blocked', 'approval-required'] as const;

/** Action invocation outcome values. */
export const AI_ACTION_OUTCOMES = ['success', 'cancelled', 'failed'] as const;
