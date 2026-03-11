/**
 * Reference bidirectional pair registrations — D-SF14-T07, D-08
 *
 * Production-ready example registrations for the two canonical pairs:
 * - BD Scorecard ↔ Estimating Pursuit (originated)
 * - Estimating Pursuit ↔ Project (converted-to)
 *
 * Both pairs are idempotent — safe to call multiple times.
 */
import { RelationshipRegistry } from '../registry/index.js';
import type { IBdScorecardRecord, IEstimatingPursuitRecord } from './types.js';

let _registered = false;

/**
 * Register the two canonical bidirectional relationship pairs.
 * Idempotent — subsequent calls are no-ops.
 */
export function registerReferenceRelationships(): void {
  if (_registered) {
    return;
  }

  // ── Pair 1: BD Scorecard → Estimating Pursuit ────────────────
  RelationshipRegistry.registerBidirectionalPair(
    {
      sourceRecordType: 'bd-scorecard',
      targetRecordType: 'estimating-pursuit',
      label: 'Originated Pursuit',
      direction: 'originated',
      targetModule: 'estimating',
      resolveRelatedIds: (sourceRecord: unknown): string[] => {
        const record = sourceRecord as IBdScorecardRecord;
        return Array.isArray(record?.pursuitIds) ? [...record.pursuitIds] : [];
      },
      buildTargetUrl: (id: string): string => `/estimating/pursuits/${id}`,
      visibleToRoles: ['BD Manager', 'Chief Estimator', 'Director of Preconstruction'],
      governanceMetadata: {
        relationshipPriority: 90,
        resolverStrategy: 'sharepoint',
        roleRelevanceMap: {
          'BD Manager': ['originated'],
          'Chief Estimator': ['converted-to'],
        },
        aiSuggestionHook: 'bd-pursuit-ai-suggest',
      },
    },
    {
      label: 'Originated from Scorecard',
      visibleToRoles: ['Chief Estimator', 'BD Manager', 'Director of Preconstruction'],
    },
  );

  // ── Pair 2: Estimating Pursuit → Project ─────────────────────
  RelationshipRegistry.registerBidirectionalPair(
    {
      sourceRecordType: 'estimating-pursuit',
      targetRecordType: 'project',
      label: 'Converted to Project',
      direction: 'converted-to',
      targetModule: 'projects',
      resolveRelatedIds: (sourceRecord: unknown): string[] => {
        const record = sourceRecord as IEstimatingPursuitRecord;
        return record?.convertedProjectId ? [record.convertedProjectId] : [];
      },
      buildTargetUrl: (id: string): string => `/projects/${id}`,
      visibleToRoles: ['Chief Estimator', 'Project Manager', 'VP of Operations'],
      governanceMetadata: {
        relationshipPriority: 95,
        resolverStrategy: 'sharepoint',
      },
    },
    {
      label: 'Originated from Pursuit',
      visibleToRoles: ['Project Manager', 'Project Executive'],
      governanceMetadata: {
        relationshipPriority: 80,
        resolverStrategy: 'sharepoint',
      },
    },
  );

  _registered = true;
}

/** @internal Reset idempotency guard for isolated test runs. */
export function _resetReferenceRegistrationFlagForTests(): void {
  _registered = false;
}
