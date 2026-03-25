/**
 * @hbc/features-project-hub
 *
 * Shared feature package surface for the Project Hub domain.
 * SF21 health-pulse boundaries are exported here as package-level domain modules.
 *
 * @see docs/architecture/plans/shared-features/SF21-T01-Package-Scaffold.md
 */

export { projectHubProjectsEmptyStateConfig } from './empty-state/index.js';

export * from './health-pulse/index.js';

export { ProjectActivityRegistry, aggregateActivityFeed } from './activity/index.js';

export * from './financial/index.js';

export * from './schedule/index.js';

export * from './constraints/index.js';

export * from './permits/index.js';

export * from './safety/index.js';

export * from './closeout/index.js';

export * from './startup/index.js';

export * from './subcontract-readiness/index.js';

export * from './warranty/index.js';

export * from './qc/index.js';

export * from './annotation-integration/index.js';

export * from './executive-review/index.js';

export * from './document-launch/index.js';

export * from './document-zones/index.js';

export * from './document-entry/index.js';

export * from './document-references/index.js';

export * from './document-vocabulary/index.js';

export * from './document-publish-seams/index.js';

export * from './document-preview-adaptive/index.js';

export * from './reports/index.js';

export * from './spfx-lane/index.js';
