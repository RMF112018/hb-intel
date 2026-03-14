/**
 * W0-G3-T06: Pure complexity gate visibility helpers.
 *
 * These functions compute visibility for summary fields and history content
 * without importing React components. Surfaces use this data to decide what
 * to render with HbcComplexityGate.
 *
 * Traceability: docs/architecture/plans/MVP/G3/W0-G3-T06-Summary-View-Expandable-History-and-Complexity-Rules.md
 */
import { evaluateGate } from '@hbc/complexity';
import type { ComplexityTier } from '@hbc/complexity';
import type { ISummaryFieldDescriptor } from './summary-field-registry.js';
import type { IHistoryContentDescriptor } from './history-level-registry.js';

/** Check if a summary field is visible at the given complexity tier. */
export function isSummaryFieldVisible(
  field: ISummaryFieldDescriptor,
  tier: ComplexityTier,
): boolean {
  return evaluateGate(tier, {
    minTier: field.minTier,
    maxTier: field.maxTier,
  });
}

/** Check if a history content item is visible at the given complexity tier. */
export function isHistoryContentVisible(
  content: IHistoryContentDescriptor,
  tier: ComplexityTier,
): boolean {
  return evaluateGate(tier, {
    minTier: content.minTier,
    maxTier: content.maxTier,
  });
}

/** Filter summary fields to only those visible at the given tier. */
export function getVisibleSummaryFields(
  fields: readonly ISummaryFieldDescriptor[],
  tier: ComplexityTier,
): ISummaryFieldDescriptor[] {
  return fields.filter((f) => isSummaryFieldVisible(f, tier));
}

/** Filter history content to only those visible at the given tier. */
export function getVisibleHistoryContent(
  content: readonly IHistoryContentDescriptor[],
  tier: ComplexityTier,
): IHistoryContentDescriptor[] {
  return content.filter((c) => isHistoryContentVisible(c, tier));
}
