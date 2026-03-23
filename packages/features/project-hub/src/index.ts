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
