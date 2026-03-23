/**
 * P3-E4-T08 annotation anchor and carry-forward logic for executive review.
 */

import type {
  FinancialAnnotationAnchorType,
  ICarriedForwardAnnotation,
  IFinancialAnnotationAnchor,
} from '../types/index.js';

export const FINANCIAL_ANNOTATIONS_SCOPE = 'financial/annotations';

/** Create a version-aware annotation anchor (T08 §15.4). */
export const createAnnotationAnchor = (
  forecastVersionId: string,
  anchorType: FinancialAnnotationAnchorType,
  refs: {
    readonly canonicalBudgetLineId?: string;
    readonly fieldKey?: string;
    readonly sectionKey?: string;
    readonly blockKey?: string;
  },
): IFinancialAnnotationAnchor => ({
  forecastVersionId,
  anchorType,
  ...refs,
});

/**
 * Check whether an annotation anchor resolves on a new version (T08 §15.5 step 1).
 * For field-level anchors, checks if the canonicalBudgetLineId exists in the new version's line roster.
 * Section and block anchors always resolve (they are structural, not line-dependent).
 */
export const resolveAnchorOnVersion = (
  anchor: IFinancialAnnotationAnchor,
  newVersionLineIds: ReadonlySet<string>,
): { resolved: boolean } => {
  if (anchor.anchorType === 'field' && anchor.canonicalBudgetLineId) {
    return { resolved: newVersionLineIds.has(anchor.canonicalBudgetLineId) };
  }
  // Section and block anchors always resolve
  return { resolved: true };
};

/**
 * Carry forward annotations from a source confirmed version to a new derived version (T08 §15.5).
 * Returns carried-forward records for resolved anchors; unresolvable anchors are excluded.
 */
export const carryForwardAnnotations = (
  sourceAnnotations: readonly {
    readonly annotationId: string;
    readonly anchor: IFinancialAnnotationAnchor;
    readonly value?: unknown;
  }[],
  sourceForecastVersionId: string,
  targetForecastVersionId: string,
  newVersionLineIds: ReadonlySet<string>,
  newVersionValues?: ReadonlyMap<string, unknown>,
): ICarriedForwardAnnotation[] => {
  const result: ICarriedForwardAnnotation[] = [];

  for (const annotation of sourceAnnotations) {
    const resolution = resolveAnchorOnVersion(annotation.anchor, newVersionLineIds);

    if (!resolution.resolved) {
      // Unresolvable — archived, no disposition required
      continue;
    }

    // Check if annotated value changed materially
    let valueChangedFlag = false;
    if (annotation.anchor.canonicalBudgetLineId && annotation.anchor.fieldKey && newVersionValues) {
      const compositeKey = `${annotation.anchor.canonicalBudgetLineId}:${annotation.anchor.fieldKey}`;
      const newValue = newVersionValues.get(compositeKey);
      valueChangedFlag = newValue !== undefined && newValue !== annotation.value;
    }

    result.push({
      newAnnotationId: crypto.randomUUID(),
      sourceAnnotationId: annotation.annotationId,
      sourceForecastVersionId,
      targetForecastVersionId,
      inheritanceStatus: 'Inherited',
      pmDispositionStatus: 'Pending',
      valueChangedFlag,
    });
  }

  return result;
};
