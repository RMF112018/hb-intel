import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockRelationshipDefinition } from '../../testing/createMockRelationshipDefinition.js';
import { RelationshipRegistry } from '../registry/index.js';
import { RelatedItemsApi } from './RelatedItemsApi.js';

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('RelatedItemsApi (SF14-T03)', () => {
  beforeEach(() => {
    RelationshipRegistry._clearForTests();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    RelationshipRegistry._clearForTests();
    vi.restoreAllMocks();
  });

  it('retrieves related items, batches summaries by strategy, and applies BIC enrichment', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'bd-scorecard',
        targetRecordType: 'estimating-pursuit',
        direction: 'originated',
        label: 'Originated Pursuit',
        governanceMetadata: {
          relationshipPriority: 95,
          resolverStrategy: 'sharepoint',
        },
        resolveRelatedIds: () => ['p-1', 'p-2'],
      }),
    );
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'bd-scorecard',
        targetRecordType: 'project',
        direction: 'converted-to',
        label: 'Converted Project',
        governanceMetadata: {
          relationshipPriority: 40,
          resolverStrategy: 'hybrid',
        },
        resolveRelatedIds: () => ['proj-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        const payload = JSON.parse(String(init?.body));
        const requestedIds = payload.requests.flatMap((request: { recordIds: string[] }) => request.recordIds);
        const summaries = requestedIds.map((id: string) => ({
          recordType: id.startsWith('proj') ? 'project' : 'estimating-pursuit',
          recordId: id,
          label: `Item ${id}`,
          status: 'Active',
          moduleIcon: 'test-module',
        }));

        return jsonResponse({ summaries });
      }

      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({
          states: [
            {
              recordType: 'estimating-pursuit',
              recordId: 'p-1',
              bicState: { currentState: 'watch', nextMove: 'review' },
            },
          ],
        });
      }

      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems(
      'bd-scorecard',
      'scorecard-1',
      { id: 'scorecard-1' },
      'BD Manager',
    );

    expect(results).toHaveLength(3);
    expect(results[0].relationshipLabel).toBe('Originated Pursuit');
    expect(results[0].bicState?.currentState).toBe('watch');

    const summaryCalls = fetchMock.mock.calls.filter(
      (call) => String(call[0]).endsWith('/api/related-items/summaries'),
    );
    expect(summaryCalls).toHaveLength(2);
  });

  it('applies role visibility and role relevance filters', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'permit-log',
        direction: 'has',
        label: 'Permit Logs',
        visibleToRoles: ['Project Executive'],
        governanceMetadata: {
          relationshipPriority: 80,
          resolverStrategy: 'graph',
          roleRelevanceMap: {
            PM: ['has'],
            Superintendent: ['references'],
          },
        },
        resolveRelatedIds: () => ['permit-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({
          summaries: [
            {
              recordType: 'permit-log',
              recordId: 'permit-1',
              label: 'Permit 1',
              moduleIcon: 'permits',
            },
          ],
        });
      }

      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }

      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const denied = await RelatedItemsApi.getRelatedItems(
      'project',
      'project-1',
      {},
      'PM',
    );
    const allowed = await RelatedItemsApi.getRelatedItems(
      'project',
      'project-1',
      {},
      'Project Executive',
    );

    expect(denied).toHaveLength(0);
    expect(allowed).toHaveLength(1);
  });

  it('returns deterministic partial results when one strategy batch fails', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'constraints',
        direction: 'has',
        label: 'Constraints',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 90, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => ['constraint-1'],
      }),
    );
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 80, resolverStrategy: 'graph' },
        resolveRelatedIds: () => ['risk-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        const payload = JSON.parse(String(init?.body));
        const strategy = payload.requests[0]?.resolverStrategy;

        if (strategy === 'graph') {
          return new Response('graph failure', { status: 500 });
        }

        return jsonResponse({
          summaries: [
            {
              recordType: 'constraints',
              recordId: 'constraint-1',
              label: 'Constraint 1',
              moduleIcon: 'constraints',
            },
          ],
        });
      }

      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }

      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems(
      'project',
      'project-1',
      {},
      'PM',
    );

    expect(results).toHaveLength(1);
    expect(results[0].recordId).toBe('constraint-1');
  });

  it('includes AI suggestion payloads when aiSuggestionHook is configured', async () => {
    RelationshipRegistry.registerAISuggestionHook('sf14-ai', async () => [
      {
        recordType: 'project',
        recordId: 'ai-project-1',
        label: 'AI Suggested Project',
        href: '/projects/ai-project-1',
        moduleIcon: 'ai-assist',
        relationship: 'references',
        relationshipLabel: 'AI Suggestion',
        aiConfidence: 0.87,
      },
    ]);
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'bd-scorecard',
        targetRecordType: 'estimating-pursuit',
        direction: 'originated',
        governanceMetadata: {
          relationshipPriority: 90,
          resolverStrategy: 'sharepoint',
          aiSuggestionHook: 'sf14-ai',
        },
        resolveRelatedIds: () => [],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({ summaries: [] });
      }
      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems(
      'bd-scorecard',
      'scorecard-1',
      {},
      'BD Manager',
    );

    expect(results).toHaveLength(1);
    expect(results[0].recordId).toBe('ai-project-1');
    expect(results[0].aiConfidence).toBe(0.87);
  });

  it('returns empty array when no matching relationships exist', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems(
      'non-existent',
      'record-1',
      {},
      'PM',
    );

    expect(results).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normalizes summary response when API returns a raw array instead of { summaries }', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 70, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => ['risk-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse([
          {
            recordType: 'risk',
            recordId: 'risk-1',
            label: 'Risk One',
            moduleIcon: 'risk',
          },
        ]);
      }

      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }

      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toHaveLength(1);
    expect(results[0].recordId).toBe('risk-1');
  });

  it('normalizes summary response when API returns an unexpected shape', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 70, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => ['risk-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({ unexpected: true });
      }

      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }

      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toEqual([]);
  });

  it('excludes definitions when roleRelevanceMap does not include current direction', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'safety-log',
        direction: 'has',
        label: 'Safety Logs',
        visibleToRoles: undefined,
        governanceMetadata: {
          relationshipPriority: 70,
          resolverStrategy: 'sharepoint',
          roleRelevanceMap: {
            Superintendent: ['references'],
          },
        },
        resolveRelatedIds: () => ['safety-1'],
      }),
    );

    const fetchMock = vi.fn(async () => jsonResponse({ summaries: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems(
      'project',
      'project-1',
      {},
      'Superintendent',
    );

    expect(results).toEqual([]);
  });

  it('handles resolveRelatedIds throwing an exception gracefully', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'doc',
        direction: 'has',
        label: 'Documents',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 50, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => {
          throw new Error('resolver failed');
        },
      }),
    );

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('skips summary records with missing recordType or recordId', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 70, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => ['risk-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({
          summaries: [
            null,
            { recordType: 'risk' },
            { recordId: 'risk-1' },
            { recordType: 'risk', recordId: 'risk-1', label: 'Valid Risk' },
          ],
        });
      }

      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }

      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe('Valid Risk');
  });

  it('uses fallback label when summary label is empty', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 70, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => ['risk-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({
          summaries: [
            { recordType: 'risk', recordId: 'risk-1', label: '  ' },
          ],
        });
      }

      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }

      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe('risk risk-1');
  });

  it('handles AI suggestion hook failure gracefully', async () => {
    RelationshipRegistry.registerAISuggestionHook('failing-hook', async () => {
      throw new Error('AI service unavailable');
    });
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: {
          relationshipPriority: 70,
          resolverStrategy: 'sharepoint',
          aiSuggestionHook: 'failing-hook',
        },
        resolveRelatedIds: () => [],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({ summaries: [] });
      }
      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }
      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toEqual([]);
  });

  it('deduplicates related items by composite key', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 70, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => ['risk-1', 'risk-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({
          summaries: [
            { recordType: 'risk', recordId: 'risk-1', label: 'Risk 1' },
          ],
        });
      }
      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }
      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toHaveLength(1);
  });

  it('applies isVisibleForRole with no role provided (all visible)', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: ['PM'],
        governanceMetadata: {
          relationshipPriority: 70,
          resolverStrategy: 'sharepoint',
          roleRelevanceMap: { PM: ['has'] },
        },
        resolveRelatedIds: () => ['risk-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({
          summaries: [{ recordType: 'risk', recordId: 'risk-1', label: 'Risk 1' }],
        });
      }
      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }
      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {});
    expect(results).toHaveLength(1);
  });

  it('skips unregistered AI suggestion hooks gracefully', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: {
          relationshipPriority: 70,
          resolverStrategy: 'sharepoint',
          aiSuggestionHook: 'nonexistent-hook',
        },
        resolveRelatedIds: () => ['risk-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({
          summaries: [{ recordType: 'risk', recordId: 'risk-1', label: 'Risk 1' }],
        });
      }
      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }
      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toHaveLength(1);
    expect(results[0].recordId).toBe('risk-1');
  });

  it('AI suggestion items use defaults for missing fields', async () => {
    RelationshipRegistry.registerAISuggestionHook('default-hook', async () => [
      {
        recordType: 'project',
        recordId: 'ai-1',
        label: 'AI Project',
      } as never,
    ]);
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: {
          relationshipPriority: 70,
          resolverStrategy: 'sharepoint',
          aiSuggestionHook: 'default-hook',
        },
        resolveRelatedIds: () => [],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({ summaries: [] });
      }
      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }
      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toHaveLength(1);
    expect(results[0].relationshipLabel).toBe('AI Suggestion');
    expect(results[0].relationship).toBe('references');
    expect(results[0].moduleIcon).toBe('ai-assist');
    expect(results[0].href).toBe('');
  });

  it('filters invalid AI suggestion items (null, missing recordType/recordId)', async () => {
    RelationshipRegistry.registerAISuggestionHook('partial-hook', async () => [
      null as never,
      { recordType: 'project' } as never,
      { recordId: 'ai-2' } as never,
      {
        recordType: 'project',
        recordId: 'ai-valid',
        label: 'Valid AI',
        href: '/valid',
        moduleIcon: 'ai',
        relationship: 'references' as const,
        relationshipLabel: 'AI Suggestion',
      },
    ]);
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: {
          relationshipPriority: 70,
          resolverStrategy: 'sharepoint',
          aiSuggestionHook: 'partial-hook',
        },
        resolveRelatedIds: () => [],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({ summaries: [] });
      }
      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }
      throw new Error(`Unexpected: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toHaveLength(1);
    expect(results[0].recordId).toBe('ai-valid');
  });

  it('sorts items by relationshipLabel when same priority, different labels', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 50, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => ['risk-1'],
      }),
    );
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'constraint',
        direction: 'blocks',
        label: 'Constraints',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 50, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => ['constraint-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({
          summaries: [
            { recordType: 'risk', recordId: 'risk-1', label: 'Risk 1', moduleIcon: 'risk' },
            { recordType: 'constraint', recordId: 'constraint-1', label: 'Constraint 1', moduleIcon: 'constraints' },
          ],
        });
      }
      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }
      throw new Error(`Unexpected: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toHaveLength(2);
    // Same priority → sorted by relationshipLabel alphabetically
    expect(results[0].relationshipLabel).toBe('Constraints');
    expect(results[1].relationshipLabel).toBe('Risks');
  });

  it('applies compareRelatedItems recordId tiebreaker for identical labels', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 70, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => ['risk-2', 'risk-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({
          summaries: [
            { recordType: 'risk', recordId: 'risk-1', label: 'Same Label', moduleIcon: 'risk' },
            { recordType: 'risk', recordId: 'risk-2', label: 'Same Label', moduleIcon: 'risk' },
          ],
        });
      }
      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }
      throw new Error(`Unexpected: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toHaveLength(2);
    // Same label → tiebroken by recordId alphabetically
    expect(results[0].recordId).toBe('risk-1');
    expect(results[1].recordId).toBe('risk-2');
  });

  it('normalizeStringArray filters non-string values from resolved IDs', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 70, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => [42 as never, null as never, 'valid-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({
          summaries: [{ recordType: 'risk', recordId: 'valid-1', label: 'Valid Risk' }],
        });
      }
      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return jsonResponse({ states: [] });
      }
      throw new Error(`Unexpected: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toHaveLength(1);
    expect(results[0].recordId).toBe('valid-1');
  });

  it('resolveRelatedIds returning non-array is normalized safely', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'risk',
        direction: 'has',
        label: 'Risks',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 70, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => 'single-id' as never,
      }),
    );

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-1', {}, 'PM');
    expect(results).toEqual([]);
  });

  it('skips invalid/empty resolved IDs and safely handles bic enrichment failures', async () => {
    RelationshipRegistry.registerBidirectionalPair(
      createMockRelationshipDefinition({
        sourceRecordType: 'project',
        targetRecordType: 'permit-log',
        direction: 'has',
        visibleToRoles: undefined,
        governanceMetadata: { relationshipPriority: 60, resolverStrategy: 'sharepoint' },
        resolveRelatedIds: () => ['  ', 'permit-1', 'permit-1'],
      }),
    );

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith('/api/related-items/summaries')) {
        return jsonResponse({
          summaries: [
            {
              recordType: 'permit-log',
              recordId: 'permit-1',
              label: 'Permit One',
              moduleIcon: 'permits',
            },
          ],
        });
      }

      if (path.endsWith('/api/related-items/bic-enrichment')) {
        return new Response('bic unavailable', { status: 503 });
      }

      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await RelatedItemsApi.getRelatedItems('project', 'project-2', {}, 'PM');
    expect(results).toHaveLength(1);
    expect(results[0].recordId).toBe('permit-1');
    expect(results[0].bicState).toBeUndefined();
  });
});
