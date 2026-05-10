/**
 * Phase 06 Prompt 03 — analytics accessibility / motion utilities.
 *
 * Verbatim preview/degraded copy strings (locked by tests) and helpers
 * for reduced-motion detection and sample-data explanation gating.
 * No DOM rendering; safe to import server-side.
 */

import type { PccAnalyticsState } from './pccAnalyticsTypes';

export const PCC_ANALYTICS_PREVIEW_LABEL = 'Preview analytics · sample project data';

export const PCC_ANALYTICS_PREVIEW_DESCRIPTION =
  'This preview uses deterministic sample project data until the source read model is connected.';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface ShouldDisableAnimationArgs {
  readonly forceAnimationDisabled?: boolean;
}

export function shouldDisableAnimation(args: ShouldDisableAnimationArgs = {}): boolean {
  return Boolean(args.forceAnimationDisabled) || prefersReducedMotion();
}

export interface SampleDataExplanation {
  readonly label: string;
  readonly description: string;
}

export function buildSampleDataExplanation(viewModel: {
  readonly state: PccAnalyticsState;
  readonly sampleData: boolean;
}): SampleDataExplanation | undefined {
  const showsExplanation =
    viewModel.sampleData || viewModel.state === 'preview' || viewModel.state === 'degraded';
  if (!showsExplanation) return undefined;
  return {
    label: PCC_ANALYTICS_PREVIEW_LABEL,
    description: PCC_ANALYTICS_PREVIEW_DESCRIPTION,
  };
}
