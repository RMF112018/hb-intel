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
