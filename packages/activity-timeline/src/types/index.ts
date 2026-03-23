/**
 * SF28-T02 scope — Event and query contracts.
 *
 * Re-exports canonical activity spine types from @hbc/models (P3-D1).
 * Package-specific extensions will be added here as SF28-T02 is implemented.
 */
export type {
  ActivityCategory,
  ActivitySignificance,
  IProjectActivityEvent,
  IActivityRuntimeContext,
  IActivityQuery,
  IActivityEventTypeMetadata,
  IActivitySourceAdapter,
  IActivitySourceRegistration,
  IActivityFeedResult,
} from '@hbc/models';
