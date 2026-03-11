/**
 * createMockRelationshipDefinition — D-SF14-T01, D-10 (testing sub-path)
 *
 * Factory for mock IRelationshipDefinition instances with Partial overrides.
 */
import type { IRelationshipDefinition } from '../src/types/index.js';

export function createMockRelationshipDefinition(
  overrides: Partial<IRelationshipDefinition> = {},
): IRelationshipDefinition {
  return {
    sourceRecordType: 'bd-scorecard',
    targetRecordType: 'estimating-pursuit',
    label: 'Originated Pursuit',
    direction: 'originated',
    targetModule: 'estimating',
    resolveRelatedIds: () => ['mock-pursuit-001'],
    buildTargetUrl: (id: string) => `/estimating/pursuits/${id}`,
    visibleToRoles: ['BD Manager', 'Chief Estimator'],
    governanceMetadata: {
      relationshipPriority: 90,
      resolverStrategy: 'sharepoint',
    },
    ...overrides,
  };
}
