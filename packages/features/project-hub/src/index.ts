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
