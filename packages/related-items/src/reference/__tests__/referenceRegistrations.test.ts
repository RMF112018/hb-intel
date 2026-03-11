/**
 * Reference registrations tests — D-SF14-T07
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { RelationshipRegistry } from '../../registry/index.js';
import {
  MOCK_BD_SCORECARD_001,
  MOCK_ESTIMATING_PURSUIT_001,
  MOCK_ESTIMATING_PURSUIT_002,
} from '../mockSourceRecords.js';
import {
  registerReferenceRelationships,
  _resetReferenceRegistrationFlagForTests,
} from '../referenceRegistrations.js';
import {
  registerReferenceAIHooks,
  _resetReferenceAIHookFlagForTests,
} from '../referenceAISuggestionHook.js';

describe('registerReferenceRelationships', () => {
  beforeEach(() => {
    RelationshipRegistry._clearForTests();
    _resetReferenceRegistrationFlagForTests();
    _resetReferenceAIHookFlagForTests();
  });

  it('creates forward "originated" entry for BD → Estimating pair', () => {
    registerReferenceRelationships();

    const definitions = RelationshipRegistry.getBySourceRecordType('bd-scorecard');
    const forward = definitions.find(
      (d) => d.targetRecordType === 'estimating-pursuit' && d.direction === 'originated',
    );

    expect(forward).toBeDefined();
    expect(forward!.label).toBe('Originated Pursuit');
    expect(forward!.governanceMetadata?.relationshipPriority).toBe(90);
  });

  it('creates reverse "converted-to" entry for Estimating → BD pair', () => {
    registerReferenceRelationships();

    const definitions = RelationshipRegistry.getBySourceRecordType('estimating-pursuit');
    const reverse = definitions.find(
      (d) => d.targetRecordType === 'bd-scorecard' && d.direction === 'converted-to',
    );

    expect(reverse).toBeDefined();
    expect(reverse!.label).toBe('Originated from Scorecard');
  });

  it('creates forward "converted-to" entry for Estimating → Project pair', () => {
    registerReferenceRelationships();

    const definitions = RelationshipRegistry.getBySourceRecordType('estimating-pursuit');
    const forward = definitions.find(
      (d) => d.targetRecordType === 'project' && d.direction === 'converted-to',
    );

    expect(forward).toBeDefined();
    expect(forward!.label).toBe('Converted to Project');
    expect(forward!.governanceMetadata?.relationshipPriority).toBe(95);
  });

  it('creates reverse "originated" entry for Project → Estimating pair', () => {
    registerReferenceRelationships();

    const definitions = RelationshipRegistry.getBySourceRecordType('project');
    const reverse = definitions.find(
      (d) => d.targetRecordType === 'estimating-pursuit' && d.direction === 'originated',
    );

    expect(reverse).toBeDefined();
    expect(reverse!.label).toBe('Originated from Pursuit');
    expect(reverse!.governanceMetadata?.relationshipPriority).toBe(80);
  });

  it('is idempotent — second call is a no-op', () => {
    registerReferenceRelationships();
    const countAfterFirst = RelationshipRegistry.getAll().length;

    registerReferenceRelationships();
    const countAfterSecond = RelationshipRegistry.getAll().length;

    expect(countAfterSecond).toBe(countAfterFirst);
  });

  it('resolveRelatedIds extracts pursuitIds from BD scorecard', () => {
    registerReferenceRelationships();

    const definitions = RelationshipRegistry.getBySourceRecordType('bd-scorecard');
    const forward = definitions.find((d) => d.direction === 'originated')!;
    const ids = forward.resolveRelatedIds(MOCK_BD_SCORECARD_001);

    expect(ids).toEqual(['est-pur-001', 'est-pur-002']);
  });

  it('resolveRelatedIds extracts convertedProjectId from pursuit', () => {
    registerReferenceRelationships();

    const definitions = RelationshipRegistry.getBySourceRecordType('estimating-pursuit');
    const forward = definitions.find(
      (d) => d.targetRecordType === 'project' && d.direction === 'converted-to',
    )!;
    const ids = forward.resolveRelatedIds(MOCK_ESTIMATING_PURSUIT_001);

    expect(ids).toEqual(['proj-001']);
  });

  it('resolveRelatedIds returns empty array for pursuit without converted project', () => {
    registerReferenceRelationships();

    const definitions = RelationshipRegistry.getBySourceRecordType('estimating-pursuit');
    const forward = definitions.find(
      (d) => d.targetRecordType === 'project' && d.direction === 'converted-to',
    )!;
    const ids = forward.resolveRelatedIds(MOCK_ESTIMATING_PURSUIT_002);

    expect(ids).toEqual([]);
  });

  it('buildTargetUrl produces correct URLs', () => {
    registerReferenceRelationships();

    const bdDefs = RelationshipRegistry.getBySourceRecordType('bd-scorecard');
    const forward = bdDefs.find((d) => d.direction === 'originated')!;

    expect(forward.buildTargetUrl('est-pur-001')).toBe('/estimating/pursuits/est-pur-001');

    const estDefs = RelationshipRegistry.getBySourceRecordType('estimating-pursuit');
    const projForward = estDefs.find(
      (d) => d.targetRecordType === 'project' && d.direction === 'converted-to',
    )!;

    expect(projForward.buildTargetUrl('proj-001')).toBe('/projects/proj-001');
  });

  it('visibleToRoles set correctly on forward and reverse definitions', () => {
    registerReferenceRelationships();

    const bdDefs = RelationshipRegistry.getBySourceRecordType('bd-scorecard');
    const forward = bdDefs.find((d) => d.direction === 'originated')!;
    expect(forward.visibleToRoles).toEqual(['BD Manager', 'Chief Estimator', 'Director of Preconstruction']);

    const projDefs = RelationshipRegistry.getBySourceRecordType('project');
    const reverse = projDefs.find((d) => d.direction === 'originated')!;
    expect(reverse.visibleToRoles).toEqual(['Project Manager', 'Project Executive']);
  });

  it('AI hook registered and returns items with aiConfidence', () => {
    registerReferenceRelationships();
    registerReferenceAIHooks();

    const resolver = RelationshipRegistry.getAISuggestionHook('bd-pursuit-ai-suggest');
    expect(resolver).toBeDefined();

    const items = resolver!({
      sourceRecordType: 'bd-scorecard',
      sourceRecordId: 'bd-sc-001',
      sourceRecord: MOCK_BD_SCORECARD_001,
      role: 'BD Manager',
    });

    const resolvedItems = Array.isArray(items) ? items : [];
    expect(resolvedItems.length).toBeGreaterThan(0);
    expect(resolvedItems[0].aiConfidence).toBe(0.82);
    expect(resolvedItems[0].relationshipLabel).toBe('AI Suggestion');
  });
});
