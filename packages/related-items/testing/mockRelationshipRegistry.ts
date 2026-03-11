/**
 * mockRelationshipRegistry — D-SF14-T01, D-10 (testing sub-path)
 *
 * Pre-configured mock registry for testing relationship resolution.
 */
import type { IRelationshipDefinition } from '../src/types/index.js';
import type { AISuggestionResolver } from '../src/registry/index.js';

export const mockRelationshipRegistry = {
  registerBidirectionalPair: (
    _definition: IRelationshipDefinition,
    _reverseOverrides?: Partial<Pick<IRelationshipDefinition, 'label' | 'visibleToRoles' | 'governanceMetadata'>>,
  ): void => {
    // no-op mock
  },
  registerAISuggestionHook: (_hookId: string, _resolver: AISuggestionResolver): void => {
    // no-op mock
  },
  getAISuggestionHook: (_hookId: string): AISuggestionResolver | undefined => undefined,
  getBySourceRecordType: (_sourceRecordType: string): IRelationshipDefinition[] => [],
  getRelationships: (_sourceRecordType: string): IRelationshipDefinition[] => [],
  getAll: (): IRelationshipDefinition[] => [],
  _clearForTests: (): void => {
    // no-op mock
  },
};
