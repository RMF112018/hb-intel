/**
 * Article Publisher adapter — barrel.
 *
 * App identity:        Article Publisher (the SPFx authoring app)
 * Destination identity: Project Spotlight is the only destination
 *                       implemented today; Company Pulse is a planned
 *                       future destination.
 * Data model identity:  the tenant `HB Article*` lists keyed by
 *                       `ArticleId`; never `Post*` / `PostId`.
 *
 * Re-exports cover typed contracts, list descriptors, mappers,
 * repositories, the template resolver, the publish/preview/republish
 * pipelines, the page-shell + page-creation services, the workflow
 * state machine, validation, the TeamViewer integration, and the
 * tenant promotion-rule selector.
 */

export * from './publisherEnums';
export * from './destinationSiteUrls';
export * from './publisherContracts';
export * from './publisherListDescriptors';
export * from './publisherRowMappers';
export * from './publisherRepositories';
export * from './templateResolver';
export * from './publishResolutionContext';
export * from './pageGeneration/index';
export * from './pageBindingWriter';
export * from './republishPolicy';
export * from './publishOrchestrator';
export * from './publisherWriters';
export * from './workflowStateMachine';
export * from './validation/validationEngine';
export * from './preview/previewBuilder';
export * from './teamViewerAdapter';
export * from './promotionRuleSelector';
