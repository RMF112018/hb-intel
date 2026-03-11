/**
 * mockRelationshipRegistry — D-SF14-T01, D-10 (testing sub-path)
 *
 * Pre-configured mock registry for testing relationship resolution.
 */
import type { IRelationshipDefinition } from '../src/types/index.js';

export const mockRelationshipRegistry = {
  registerBidirectionalPair: (
    _definition: IRelationshipDefinition,
    _reverseOverrides?: Partial<Pick<IRelationshipDefinition, 'label'>>,
  ): void => {
    // no-op mock
  },
  registerAISuggestionHook: (_recordType: string, _hookId: string): void => {
    // no-op mock
  },
  getRelationships: (_sourceRecordType: string): IRelationshipDefinition[] => [],
  getAll: (): IRelationshipDefinition[] => [],
};
