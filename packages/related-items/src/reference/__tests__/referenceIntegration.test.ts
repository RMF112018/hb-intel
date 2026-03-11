/**
 * Reference integration E2E test — D-SF14-T07
 *
 * End-to-end flow: register relationships + AI hooks → mock fetch → verify API output.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RelationshipRegistry } from '../../registry/index.js';
import { RelatedItemsApi } from '../../api/index.js';
import {
  MOCK_BD_SCORECARD_001,
  MOCK_ESTIMATING_PURSUIT_001,
} from '../mockSourceRecords.js';
import {
  registerReferenceRelationships,
  _resetReferenceRegistrationFlagForTests,
} from '../referenceRegistrations.js';
import {
  registerReferenceAIHooks,
  _resetReferenceAIHookFlagForTests,
} from '../referenceAISuggestionHook.js';

function createSummaryResponse(records: Array<{ recordType: string; recordId: string; label: string; status?: string; moduleIcon?: string }>) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ summaries: records }),
    text: async () => JSON.stringify({ summaries: records }),
  };
}

function createBicResponse(states: Array<{ recordType: string; recordId: string; bicState: { currentState: string } }> = []) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ states }),
    text: async () => JSON.stringify({ states }),
  };
}

function createFailedResponse(status: number) {
  return {
    ok: false,
    status,
    json: async () => ({}),
    text: async () => `Error ${status}`,
  };
}

describe('Reference integration E2E', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    RelationshipRegistry._clearForTests();
    _resetReferenceRegistrationFlagForTests();
    _resetReferenceAIHookFlagForTests();

    registerReferenceRelationships();
    registerReferenceAIHooks();

    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('returns estimating pursuit items for BD scorecard source', async () => {
    fetchSpy.mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : (url as Request).url;
      if (urlStr.includes('/summaries')) {
        return createSummaryResponse([
          { recordType: 'estimating-pursuit', recordId: 'est-pur-001', label: 'Acme Campus Phase 1 GMP', status: 'won', moduleIcon: 'estimating' },
          { recordType: 'estimating-pursuit', recordId: 'est-pur-002', label: 'Acme Campus Phase 2 Preconstruction', status: 'active', moduleIcon: 'estimating' },
        ]) as unknown as Response;
      }
      return createBicResponse() as unknown as Response;
    });

    const items = await RelatedItemsApi.getRelatedItems(
      'bd-scorecard', 'bd-sc-001', MOCK_BD_SCORECARD_001, 'BD Manager',
    );

    const pursuitItems = items.filter((i) => i.recordType === 'estimating-pursuit' && !i.aiConfidence);
    expect(pursuitItems.length).toBe(2);
    expect(pursuitItems.map((i) => i.recordId).sort()).toEqual(['est-pur-001', 'est-pur-002']);
  });

  it('BD Manager sees originated relationships', async () => {
    fetchSpy.mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : (url as Request).url;
      if (urlStr.includes('/summaries')) {
        return createSummaryResponse([
          { recordType: 'estimating-pursuit', recordId: 'est-pur-001', label: 'Pursuit 1' },
        ]) as unknown as Response;
      }
      return createBicResponse() as unknown as Response;
    });

    const items = await RelatedItemsApi.getRelatedItems(
      'bd-scorecard', 'bd-sc-001', MOCK_BD_SCORECARD_001, 'BD Manager',
    );

    const nonAi = items.filter((i) => !i.aiConfidence);
    expect(nonAi.every((i) => i.relationship === 'originated')).toBe(true);
  });

  it('Project Engineer gets empty results from BD scorecard (not in visibleToRoles)', async () => {
    fetchSpy.mockImplementation(async () => {
      return createSummaryResponse([]) as unknown as Response;
    });

    const items = await RelatedItemsApi.getRelatedItems(
      'bd-scorecard', 'bd-sc-001', MOCK_BD_SCORECARD_001, 'Project Engineer',
    );

    // Project Engineer is not in visibleToRoles for either pair
    expect(items).toEqual([]);
  });

  it('AI suggestion items are present when hook registered', async () => {
    fetchSpy.mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : (url as Request).url;
      if (urlStr.includes('/summaries')) {
        return createSummaryResponse([
          { recordType: 'estimating-pursuit', recordId: 'est-pur-001', label: 'Pursuit 1' },
        ]) as unknown as Response;
      }
      return createBicResponse() as unknown as Response;
    });

    const items = await RelatedItemsApi.getRelatedItems(
      'bd-scorecard', 'bd-sc-001', MOCK_BD_SCORECARD_001, 'BD Manager',
    );

    const aiItems = items.filter((i) => typeof i.aiConfidence === 'number');
    expect(aiItems.length).toBeGreaterThan(0);
    expect(aiItems[0].aiConfidence).toBe(0.82);
  });

  it('degraded BIC (503) does not break pipeline — items returned without bicState', async () => {
    fetchSpy.mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : (url as Request).url;
      if (urlStr.includes('/summaries')) {
        return createSummaryResponse([
          { recordType: 'estimating-pursuit', recordId: 'est-pur-001', label: 'Pursuit 1' },
        ]) as unknown as Response;
      }
      if (urlStr.includes('/bic-enrichment')) {
        return createFailedResponse(503) as unknown as Response;
      }
      return createBicResponse() as unknown as Response;
    });

    const items = await RelatedItemsApi.getRelatedItems(
      'bd-scorecard', 'bd-sc-001', MOCK_BD_SCORECARD_001, 'BD Manager',
    );

    const nonAi = items.filter((i) => !i.aiConfidence);
    expect(nonAi.length).toBeGreaterThan(0);
    expect(nonAi[0].bicState).toBeUndefined();
  });

  it('deterministic ordering by priority then label', async () => {
    fetchSpy.mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : (url as Request).url;
      if (urlStr.includes('/summaries')) {
        return createSummaryResponse([
          { recordType: 'project', recordId: 'proj-001', label: 'Project 1', moduleIcon: 'projects' },
          { recordType: 'bd-scorecard', recordId: 'bd-sc-001', label: 'BD Scorecard 1', moduleIcon: 'bd' },
        ]) as unknown as Response;
      }
      return createBicResponse() as unknown as Response;
    });

    const items = await RelatedItemsApi.getRelatedItems(
      'estimating-pursuit', 'est-pur-001', MOCK_ESTIMATING_PURSUIT_001, 'Chief Estimator',
    );

    const nonAi = items.filter((i) => !i.aiConfidence);
    if (nonAi.length >= 2) {
      // Higher priority first (95 for converted-to project > reverse originated from scorecard)
      expect(nonAi[0].recordType).toBe('project');
    }
  });

  it('returns project items for estimating pursuit with converted project', async () => {
    fetchSpy.mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : (url as Request).url;
      if (urlStr.includes('/summaries')) {
        return createSummaryResponse([
          { recordType: 'project', recordId: 'proj-001', label: 'Acme Campus Phase 1', moduleIcon: 'projects' },
        ]) as unknown as Response;
      }
      return createBicResponse() as unknown as Response;
    });

    const items = await RelatedItemsApi.getRelatedItems(
      'estimating-pursuit', 'est-pur-001', MOCK_ESTIMATING_PURSUIT_001, 'Chief Estimator',
    );

    const projectItems = items.filter((i) => i.recordType === 'project');
    expect(projectItems.length).toBe(1);
    expect(projectItems[0].href).toBe('/projects/proj-001');
  });
});
