/**
 * SF18-T06 checklist and admin-config deterministic model helpers.
 *
 * @design D-SF18-T06, D-SF18-T04, D-SF18-T03, D-SF18-T02
 */
import type {
  IBidReadinessChecklistItem,
  IBidReadinessViewState,
  IBidReadinessChecklistDefinition,
} from '../../types/index.js';

function resolveCategory(criterionId: string): IBidReadinessChecklistItem['category'] {
  if (criterionId === 'cost-sections-populated' || criterionId === 'bid-documents-attached') {
    return 'scope-completeness';
  }
  if (criterionId === 'subcontractor-coverage') {
    return 'coverage';
  }
  if (criterionId === 'ce-sign-off') {
    return 'governance';
  }
  return 'compliance';
}

export function createChecklistItems(
  viewState: IBidReadinessViewState,
): IBidReadinessChecklistItem[] {
  return viewState.criteria.map((entry) => ({
    checklistItemId: `checklist-${entry.criterion.criterionId}`,
    criterionId: entry.criterion.criterionId,
    label: entry.criterion.label,
    category: resolveCategory(entry.criterion.criterionId),
    weight: entry.criterion.weight,
    isBlocker: entry.criterion.isBlocker,
    isComplete: entry.isComplete,
    rationale: '',
    scoringInfluence: Number(((entry.criterion.weight / 100) * 100).toFixed(2)),
    actionHref: entry.actionHref,
  }));
}

export function sortChecklistItems(
  items: readonly IBidReadinessChecklistItem[],
): IBidReadinessChecklistItem[] {
  return [...items].sort((left, right) => {
    if (left.isBlocker !== right.isBlocker) {
      return left.isBlocker ? -1 : 1;
    }
    if (left.weight !== right.weight) {
      return right.weight - left.weight;
    }
    return left.label.localeCompare(right.label);
  });
}

export function groupChecklistItems(
  items: readonly IBidReadinessChecklistItem[],
): Readonly<Record<'blockers' | 'incomplete' | 'complete', readonly IBidReadinessChecklistItem[]>> {
  const blockers: IBidReadinessChecklistItem[] = [];
  const incomplete: IBidReadinessChecklistItem[] = [];
  const complete: IBidReadinessChecklistItem[] = [];

  for (const item of items) {
    if (item.isBlocker) {
      blockers.push(item);
    }
    if (item.isComplete) {
      complete.push(item);
    } else {
      incomplete.push(item);
    }
  }

  return {
    blockers,
    incomplete,
    complete,
  };
}

export function computeChecklistCompletion(items: readonly IBidReadinessChecklistItem[]): number {
  if (items.length === 0) {
    return 0;
  }

  const completeCount = items.filter((item) => item.isComplete).length;
  return Number(((completeCount / items.length) * 100).toFixed(2));
}

export function applyChecklistDraft(
  items: readonly IBidReadinessChecklistItem[],
  draft: Readonly<Record<string, Pick<IBidReadinessChecklistItem, 'isComplete' | 'rationale'>>>,
): IBidReadinessChecklistItem[] {
  return items.map((item) => {
    const override = draft[item.checklistItemId];
    if (!override) {
      return item;
    }

    return {
      ...item,
      isComplete: override.isComplete,
      rationale: override.rationale,
    };
  });
}

export function validateAdminChecklistDefinitions(
  definitions: readonly IBidReadinessChecklistDefinition[],
): string[] {
  const errors: string[] = [];

  if (definitions.length === 0) {
    errors.push('At least one checklist definition is required.');
  }

  const seen = new Set<string>();
  for (const definition of definitions) {
    if (seen.has(definition.checklistItemId)) {
      errors.push(`Duplicate checklist definition id: ${definition.checklistItemId}`);
    }
    seen.add(definition.checklistItemId);

    if (definition.order < 0) {
      errors.push(`Checklist order must be non-negative: ${definition.checklistItemId}`);
    }
  }

  if (!definitions.some((definition) => definition.blocking)) {
    errors.push('At least one blocking checklist definition is required.');
  }

  return errors;
}
