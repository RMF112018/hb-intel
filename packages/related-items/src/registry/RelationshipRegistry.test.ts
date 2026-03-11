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
