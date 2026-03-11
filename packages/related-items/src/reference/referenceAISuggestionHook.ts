/**
 * Reference AI suggestion hook — D-SF14-T07, D-09
 *
 * Demo AI hook returning synthetic items with aiConfidence for the
 * BD Scorecard → Estimating Pursuit relationship.
 *
 * Hook ID: `bd-pursuit-ai-suggest`
 */
import { RelationshipRegistry } from '../registry/index.js';
import type { IRelatedItem } from '../types/index.js';

let _registered = false;

/**
 * Register the reference AI suggestion hook.
 * Idempotent — subsequent calls are no-ops.
 */
export function registerReferenceAIHooks(): void {
  if (_registered) {
    return;
  }

  RelationshipRegistry.registerAISuggestionHook(
    'bd-pursuit-ai-suggest',
    ({ sourceRecordType, sourceRecordId }): IRelatedItem[] => {
      if (sourceRecordType !== 'bd-scorecard') {
        return [];
      }

      return [
        {
          recordType: 'estimating-pursuit',
          recordId: `ai-suggest-${sourceRecordId}`,
          label: 'AI-Suggested Related Pursuit',
          status: 'pending',
          href: `/estimating/pursuits/ai-suggest-${sourceRecordId}`,
          moduleIcon: 'ai-assist',
          relationship: 'references',
          relationshipLabel: 'AI Suggestion',
          aiConfidence: 0.82,
        },
      ];
    },
  );

  _registered = true;
}

/** @internal Reset idempotency guard for isolated test runs. */
export function _resetReferenceAIHookFlagForTests(): void {
  _registered = false;
}
