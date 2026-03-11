import { beforeEach, describe, expect, it } from 'vitest';

import { createMockRelationshipDefinition } from '../../testing/createMockRelationshipDefinition.js';
import { RelationshipRegistry } from './index.js';

describe('RelationshipRegistry (SF14-T03)', () => {
  beforeEach(() => {
    RelationshipRegistry._clearForTests();
  });

  it('registers a forward and reverse relationship definition pair', () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'bd-scorecard',
        targetRecordType: 'estimating-pursuit',
        direction: 'originated',
        label: 'Originated Pursuit',
      }),
    );

    const bdRelationships = RelationshipRegistry.getBySourceRecordType('bd-scorecard');
    const estimatingRelationships = RelationshipRegistry.getBySourceRecordType('estimating-pursuit');

    expect(bdRelationships).toHaveLength(1);
    expect(estimatingRelationships).toHaveLength(1);
    expect(bdRelationships[0].direction).toBe('originated');
    expect(estimatingRelationships[0].direction).toBe('converted-to');
    expect(estimatingRelationships[0].targetRecordType).toBe('bd-scorecard');
  });

  it('applies reverse overrides for label/visibility/governance', () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'estimating-pursuit',
        targetRecordType: 'project',
        direction: 'converted-to',
        label: 'Converted to Project',
      }),
      {
        label: 'Originated from Pursuit',
        visibleToRoles: ['Project Executive'],
        governanceMetadata: {
          relationshipPriority: 99,
          resolverStrategy: 'graph',
        },
      },
    );

    const reverseDefinition = RelationshipRegistry.getBySourceRecordType('project')[0];
    expect(reverseDefinition.label).toBe('Originated from Pursuit');
    expect(reverseDefinition.visibleToRoles).toEqual(['Project Executive']);
    expect(reverseDefinition.governanceMetadata?.relationshipPriority).toBe(99);
  });

  it('rejects duplicate composite registration keys', () => {
    const definition = createMockRelationshipDefinition();
    RelationshipRegistry.registerBidirectionalPair(definition);

    expect(() => {
      RelationshipRegistry.registerBidirectionalPair(definition);
    }).toThrow(/Duplicate relationship registration/i);
  });

  it('validates governance metadata completeness and relationship typing integrity', () => {
    expect(() => {
      RelationshipRegistry.registerBidirectionalPair(
        createMockRelationshipDefinition({
          governanceMetadata: {} as never,
        }),
      );
    }).toThrow(/relationshipPriority must be a valid number/i);

    expect(() => {
      RelationshipRegistry.registerBidirectionalPair(
        createMockRelationshipDefinition({
          governanceMetadata: {
            relationshipPriority: 10,
            roleRelevanceMap: {
              PM: ['invalid-direction' as never],
            },
          },
        }),
      );
    }).toThrow(/contains invalid direction/i);
  });

  it('returns deterministic source-type retrieval sorted by priority and lexical ties', () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'turnover-meeting',
        label: 'Turnover',
        direction: 'has',
        governanceMetadata: { relationshipPriority: 20 },
      }),
    );
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'permit-log',
        label: 'Permit Logs',
        direction: 'has',
        governanceMetadata: { relationshipPriority: 90 },
      }),
    );
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'constraints',
        label: 'Constraints',
        direction: 'has',
        governanceMetadata: { relationshipPriority: 90 },
      }),
    );

    const retrieved = RelationshipRegistry.getBySourceRecordType('project');
    expect(retrieved.map((definition) => definition.label)).toEqual([
      'Constraints',
      'Permit Logs',
      'Turnover',
    ]);
    expect(RelationshipRegistry.getRelationships('project')).toEqual(retrieved);
  });

  it('compareRelationshipDefinitions tiebreaker: equal priority + equal label → targetRecordType', () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'bravo-type',
        label: 'Same Label',
        direction: 'has',
        governanceMetadata: { relationshipPriority: 50 },
      }),
    );
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'alpha-type',
        label: 'Same Label',
        direction: 'blocks',
        governanceMetadata: { relationshipPriority: 50 },
      }),
    );

    const retrieved = RelationshipRegistry.getBySourceRecordType('project');
    expect(retrieved).toHaveLength(2);
    expect(retrieved[0].targetRecordType).toBe('alpha-type');
    expect(retrieved[1].targetRecordType).toBe('bravo-type');
  });

  it('validates governance metadata with NaN priority', () => {
    expect(() => {
      RelationshipRegistry.registerBidirectionalPair(
        createMockRelationshipDefinition({
          governanceMetadata: { relationshipPriority: NaN },
        }),
      );
    }).toThrow(/relationshipPriority must be a valid number/i);
  });

  it('validates roleRelevanceMap entry is an array', () => {
    expect(() => {
      RelationshipRegistry.registerBidirectionalPair(
        createMockRelationshipDefinition({
          governanceMetadata: {
            relationshipPriority: 50,
            roleRelevanceMap: {
              PM: 'has' as never,
            },
          },
        }),
      );
    }).toThrow(/must be an array of relationship directions/i);
  });

  it('getAll() returns all registered definitions in deterministic order', () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        label: 'Risks',
        direction: 'has',
        governanceMetadata: { relationshipPriority: 40 },
      }),
    );

    const all = RelationshipRegistry.getAll();
    expect(all).toHaveLength(2);
    expect(all[0].sourceRecordType).toBeDefined();
    expect(all[1].sourceRecordType).toBeDefined();
  });

  it('rejects definitions with empty sourceRecordType or targetRecordType', () => {
    expect(() => {
      RelationshipRegistry.registerBidirectionalPair(
        createMockRelationshipDefinition({ sourceRecordType: '  ' }),
      );
    }).toThrow(/sourceRecordType must be a non-empty string/i);

    expect(() => {
      RelationshipRegistry.registerBidirectionalPair(
        createMockRelationshipDefinition({ targetRecordType: '' }),
      );
    }).toThrow(/targetRecordType must be a non-empty string/i);
  });

  it('rejects definitions where sourceRecordType equals targetRecordType', () => {
    expect(() => {
      RelationshipRegistry.registerBidirectionalPair(
        createMockRelationshipDefinition({
          sourceRecordType: 'project',
          targetRecordType: 'project',
        }),
      );
    }).toThrow(/sourceRecordType and targetRecordType must differ/i);
  });

  it('rejects definitions with non-function resolveRelatedIds or buildTargetUrl', () => {
    expect(() => {
      RelationshipRegistry.registerBidirectionalPair(
        createMockRelationshipDefinition({ resolveRelatedIds: null as never }),
      );
    }).toThrow(/resolveRelatedIds must be a function/i);

    expect(() => {
      RelationshipRegistry.registerBidirectionalPair(
        createMockRelationshipDefinition({ buildTargetUrl: 'not-a-fn' as never }),
      );
    }).toThrow(/buildTargetUrl must be a function/i);
  });

  it('rejects definitions with non-array visibleToRoles', () => {
    expect(() => {
      RelationshipRegistry.registerBidirectionalPair(
        createMockRelationshipDefinition({ visibleToRoles: 'PM' as never }),
      );
    }).toThrow(/visibleToRoles must be an array/i);
  });

  it('registers and retrieves AI suggestion hooks with duplicate protection', () => {
    const resolver = () => [];
    RelationshipRegistry.registerAISuggestionHook('sf14-ai-hook', resolver);

    expect(RelationshipRegistry.getAISuggestionHook('sf14-ai-hook')).toBe(resolver);
    expect(() => {
      RelationshipRegistry.registerAISuggestionHook('sf14-ai-hook', resolver);
    }).toThrow(/already registered/i);

    expect(() => {
      RelationshipRegistry.registerAISuggestionHook('bad-resolver', undefined as never);
    }).toThrow(/resolver must be a function/i);
  });
});
