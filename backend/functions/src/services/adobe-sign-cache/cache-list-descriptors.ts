/**
 * My Dashboard | Adobe Sign cache — SharePoint list descriptors (B05.15).
 *
 * Defines the four operational SharePoint lists that back the Adobe Sign
 * webhook-backed projection cache on the MyDashboard site:
 *
 *   1. `MyDashboardAdobeSignUserCache`              — one row per connected actor.
 *   2. `MyDashboardAdobeSignAgreementProjectionCache` — agreement/action-level rows.
 *   3. `MyDashboardAdobeSignWebhookSubscriptions`   — HB-managed webhook subscription registry.
 *   4. `MyDashboardAdobeSignSyncRuns`               — operational run ledger.
 *
 * Source of truth for the field contract is the package documents under
 * `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.15 - a-s-webhook-cache/`
 * (sections 12.1–12.4) and the `SharePoint_Adobe_Sign_*_Schema.json` resource
 * files in that package. SPFx surfaces NEVER write to these lists directly;
 * all reads/writes go through the backend Functions seam.
 *
 * Governance (not REST-enforced by the provisioner; see operator how-to):
 *   - Lists are NOT hidden (operator visibility).
 *   - Permission inheritance MUST be broken with restricted role assignments.
 *   - End users have no direct list permission; backend-mediated read only.
 *
 * Uniqueness:
 *   - `AdobeActorKey`   on UserCache             carries `EnforceUniqueValues=true`.
 *   - `ProjectionKey`   on AgreementProjection   carries `EnforceUniqueValues=true`.
 *   - `SubscriptionKey` on WebhookSubscriptions  carries `EnforceUniqueValues=true`.
 *   - `RunId`           on SyncRuns              carries `EnforceUniqueValues=true`.
 *
 * @module services/adobe-sign-cache/cache-list-descriptors
 */

import type { IListDefinition } from '../sharepoint-service.js';

// ─── Host site (locked to MyDashboard) ─────────────────────────────────────

export const MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_HOST_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard';

export function getMyDashboardAdobeSignCacheListHostSiteUrl(): string {
  return MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_HOST_SITE_URL;
}

// ─── List titles ───────────────────────────────────────────────────────────

export const MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE = 'MyDashboardAdobeSignUserCache';
export const MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE =
  'MyDashboardAdobeSignAgreementProjectionCache';
export const MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE =
  'MyDashboardAdobeSignWebhookSubscriptions';
export const MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE = 'MyDashboardAdobeSignSyncRuns';

// ─── Choice vocabularies (exported for reuse by Prompt 03–10 workers) ──────

export const ADOBE_SIGN_CACHE_HYDRATION_STATES = [
  'NotStarted',
  'Hydrating',
  'Ready',
  'RefreshPending',
  'Failed',
] as const;
export type AdobeSignCacheHydrationState = (typeof ADOBE_SIGN_CACHE_HYDRATION_STATES)[number];

export const ADOBE_SIGN_CACHED_SOURCE_STATUSES = [
  'available',
  'partial',
  'configuration-required',
  'authorization-required',
  'principal-unresolved',
  'source-unavailable',
  'backend-unavailable',
] as const;
export type AdobeSignCachedSourceStatus = (typeof ADOBE_SIGN_CACHED_SOURCE_STATUSES)[number];

export const ADOBE_SIGN_CACHE_FRESHNESS_STATES = [
  'Fresh',
  'Aging',
  'Stale',
  'Unknown',
] as const;
export type AdobeSignCacheFreshnessState = (typeof ADOBE_SIGN_CACHE_FRESHNESS_STATES)[number];

export const ADOBE_SIGN_CACHE_PROJECTION_BUCKETS = [
  'PendingAction',
  'RecentCompletion',
  'Inactive',
] as const;
export type AdobeSignCacheProjectionBucket = (typeof ADOBE_SIGN_CACHE_PROJECTION_BUCKETS)[number];

export const ADOBE_SIGN_CACHE_ACTION_HANDOFF_POSTURES = [
  'ResolveOnClick',
  'ViewOnly',
  'Unavailable',
] as const;
export type AdobeSignCacheActionHandoffPosture =
  (typeof ADOBE_SIGN_CACHE_ACTION_HANDOFF_POSTURES)[number];

export const ADOBE_SIGN_CACHE_SYNC_OUTCOMES = ['Success', 'Partial', 'Failure', 'Skipped'] as const;
export type AdobeSignCacheSyncOutcome = (typeof ADOBE_SIGN_CACHE_SYNC_OUTCOMES)[number];

export const ADOBE_SIGN_WEBHOOK_SCOPES = ['USER'] as const;
export type AdobeSignWebhookScope = (typeof ADOBE_SIGN_WEBHOOK_SCOPES)[number];

export const ADOBE_SIGN_WEBHOOK_RESOURCE_FAMILIES = ['AGREEMENT'] as const;
export type AdobeSignWebhookResourceFamily =
  (typeof ADOBE_SIGN_WEBHOOK_RESOURCE_FAMILIES)[number];

export const ADOBE_SIGN_WEBHOOK_REMOTE_STATES = [
  'Active',
  'Inactive',
  'Missing',
  'Unknown',
] as const;
export type AdobeSignWebhookRemoteState = (typeof ADOBE_SIGN_WEBHOOK_REMOTE_STATES)[number];

export const ADOBE_SIGN_WEBHOOK_LOCAL_PROCESSING_STATES = [
  'Active',
  'IgnoredAfterDisconnect',
  'RemoteDeactivationFailed',
  'Suspended',
  'Orphaned',
] as const;
export type AdobeSignWebhookLocalProcessingState =
  (typeof ADOBE_SIGN_WEBHOOK_LOCAL_PROCESSING_STATES)[number];

export const ADOBE_SIGN_WEBHOOK_VERIFICATION_OUTCOMES = [
  'Success',
  'NotFound',
  'Mismatch',
  'Failure',
] as const;
export type AdobeSignWebhookVerificationOutcome =
  (typeof ADOBE_SIGN_WEBHOOK_VERIFICATION_OUTCOMES)[number];

export const ADOBE_SIGN_CACHE_SYNC_RUN_TYPES = [
  'InitialHydration',
  'WebhookRefresh',
  'ManualRefresh',
  'Reconciliation',
  'EnsureWebhook',
  'VerifyWebhook',
] as const;
export type AdobeSignCacheSyncRunType = (typeof ADOBE_SIGN_CACHE_SYNC_RUN_TYPES)[number];

export const ADOBE_SIGN_CACHE_REFRESH_SCOPES = [
  'AgreementTargeted',
  'UserWide',
  'SubscriptionOnly',
] as const;
export type AdobeSignCacheRefreshScope = (typeof ADOBE_SIGN_CACHE_REFRESH_SCOPES)[number];

// ─── Governance posture (not REST-enforced; runbook-driven) ────────────────

export interface IAdobeSignCacheListGovernance {
  readonly hidden: false;
  readonly breakPermissionInheritance: true;
  readonly runtimeReadModel: 'backend-only';
}

export const MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_GOVERNANCE: IAdobeSignCacheListGovernance = {
  hidden: false,
  breakPermissionInheritance: true,
  runtimeReadModel: 'backend-only',
};

// ─── List 1: MyDashboardAdobeSignUserCache ─────────────────────────────────

export const MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_DESCRIPTOR: IListDefinition = {
  title: MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
  description:
    'Actor-level Adobe Sign cache snapshot for My Dashboard card home preview. Backend-mediated; operator/system-facing.',
  template: 100,
  fields: [
    {
      internalName: 'AdobeActorKey',
      displayName: 'Adobe Actor Key',
      type: 'Text',
      required: true,
      indexed: true,
      unique: true,
    },
    { internalName: 'UserPrincipalName', displayName: 'User Principal Name', type: 'Text' },
    {
      internalName: 'UserPrincipalNameNormalized',
      displayName: 'User Principal Name Normalized',
      type: 'Text',
      indexed: true,
    },
    {
      internalName: 'IsActive',
      displayName: 'Is Active',
      type: 'Boolean',
      required: true,
      indexed: true,
    },
    {
      internalName: 'CacheHydrationState',
      displayName: 'Cache Hydration State',
      type: 'Choice',
      required: true,
      choices: [...ADOBE_SIGN_CACHE_HYDRATION_STATES],
    },
    {
      internalName: 'CachedSourceStatus',
      displayName: 'Cached Source Status',
      type: 'Choice',
      required: true,
      choices: [...ADOBE_SIGN_CACHED_SOURCE_STATUSES],
    },
    {
      internalName: 'FreshnessState',
      displayName: 'Freshness State',
      type: 'Choice',
      required: true,
      indexed: true,
      choices: [...ADOBE_SIGN_CACHE_FRESHNESS_STATES],
    },
    { internalName: 'ActionQueuePreviewJson', displayName: 'Action Queue Preview JSON', type: 'MultiLineText' },
    { internalName: 'ActionQueueSummaryJson', displayName: 'Action Queue Summary JSON', type: 'MultiLineText' },
    { internalName: 'ActionQueueWarningsJson', displayName: 'Action Queue Warnings JSON', type: 'MultiLineText' },
    { internalName: 'RecentCompletionsPreviewJson', displayName: 'Recent Completions Preview JSON', type: 'MultiLineText' },
    { internalName: 'RecentCompletionsSummaryJson', displayName: 'Recent Completions Summary JSON', type: 'MultiLineText' },
    { internalName: 'RecentCompletionsWarningsJson', displayName: 'Recent Completions Warnings JSON', type: 'MultiLineText' },
    { internalName: 'PendingActionCount', displayName: 'Pending Action Count', type: 'Number' },
    { internalName: 'RecentCompletionCount', displayName: 'Recent Completion Count', type: 'Number' },
    { internalName: 'LastSuccessfulAdobeRefreshUtc', displayName: 'Last Successful Adobe Refresh UTC', type: 'DateTime' },
    { internalName: 'LastWebhookRefreshUtc', displayName: 'Last Webhook Refresh UTC', type: 'DateTime' },
    { internalName: 'LastManualRefreshUtc', displayName: 'Last Manual Refresh UTC', type: 'DateTime' },
    { internalName: 'LastReconciliationRefreshUtc', displayName: 'Last Reconciliation Refresh UTC', type: 'DateTime' },
    {
      internalName: 'NextReconciliationDueUtc',
      displayName: 'Next Reconciliation Due UTC',
      type: 'DateTime',
      indexed: true,
    },
    {
      internalName: 'LastSyncOutcome',
      displayName: 'Last Sync Outcome',
      type: 'Choice',
      choices: [...ADOBE_SIGN_CACHE_SYNC_OUTCOMES],
    },
    { internalName: 'LastSyncFailureCode', displayName: 'Last Sync Failure Code', type: 'Text' },
    { internalName: 'LastSyncFailureSummary', displayName: 'Last Sync Failure Summary', type: 'MultiLineText' },
    {
      internalName: 'CacheSchemaVersion',
      displayName: 'Cache Schema Version',
      type: 'Number',
      required: true,
    },
    {
      internalName: 'ProjectionRevision',
      displayName: 'Projection Revision',
      type: 'Number',
      required: true,
    },
  ],
};

// ─── List 2: MyDashboardAdobeSignAgreementProjectionCache ──────────────────

export const MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_DESCRIPTOR: IListDefinition = {
  title: MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
  description:
    'Agreement/action/completion-level cached projections sourced from Adobe Sign webhook + reconciliation refresh.',
  template: 100,
  fields: [
    {
      internalName: 'ProjectionKey',
      displayName: 'Projection Key',
      type: 'Text',
      required: true,
      indexed: true,
      unique: true,
    },
    {
      internalName: 'AdobeActorKey',
      displayName: 'Adobe Actor Key',
      type: 'Text',
      required: true,
      indexed: true,
    },
    {
      internalName: 'UserPrincipalNameNormalized',
      displayName: 'User Principal Name Normalized',
      type: 'Text',
      indexed: true,
    },
    {
      internalName: 'AgreementId',
      displayName: 'Agreement ID',
      type: 'Text',
      required: true,
      indexed: true,
    },
    { internalName: 'RecipientActionKey', displayName: 'Recipient Action Key', type: 'Text', required: true },
    {
      internalName: 'ProjectionBucket',
      displayName: 'Projection Bucket',
      type: 'Choice',
      required: true,
      indexed: true,
      choices: [...ADOBE_SIGN_CACHE_PROJECTION_BUCKETS],
    },
    { internalName: 'AgreementName', displayName: 'Agreement Name', type: 'Text', required: true },
    { internalName: 'AgreementStatus', displayName: 'Agreement Status', type: 'Text' },
    { internalName: 'RequiredAction', displayName: 'Required Action', type: 'Text' },
    { internalName: 'AdobeRecipientStatus', displayName: 'Adobe Recipient Status', type: 'Text' },
    {
      internalName: 'ActionHandoffPosture',
      displayName: 'Action Handoff Posture',
      type: 'Choice',
      choices: [...ADOBE_SIGN_CACHE_ACTION_HANDOFF_POSTURES],
    },
    { internalName: 'ActionHandoffReason', displayName: 'Action Handoff Reason', type: 'Text' },
    { internalName: 'SourceOpenUrl', displayName: 'Source Open URL', type: 'URL' },
    { internalName: 'SenderDisplayName', displayName: 'Sender Display Name', type: 'Text' },
    { internalName: 'SenderEmail', displayName: 'Sender Email', type: 'Text' },
    { internalName: 'CreatedAtAdobeUtc', displayName: 'Created At Adobe UTC', type: 'DateTime' },
    { internalName: 'ModifiedAtAdobeUtc', displayName: 'Modified At Adobe UTC', type: 'DateTime' },
    { internalName: 'ExpirationAtAdobeUtc', displayName: 'Expiration At Adobe UTC', type: 'DateTime' },
    { internalName: 'CompletedAtAdobeUtc', displayName: 'Completed At Adobe UTC', type: 'DateTime' },
    {
      internalName: 'SortDateUtc',
      displayName: 'Sort Date UTC',
      type: 'DateTime',
      indexed: true,
    },
    { internalName: 'SortPriority', displayName: 'Sort Priority', type: 'Number' },
    {
      internalName: 'IsActiveProjection',
      displayName: 'Is Active Projection',
      type: 'Boolean',
      required: true,
      indexed: true,
    },
    {
      internalName: 'FreshnessState',
      displayName: 'Freshness State',
      type: 'Choice',
      indexed: true,
      choices: [...ADOBE_SIGN_CACHE_FRESHNESS_STATES],
    },
    { internalName: 'LastSuccessfulAdobeRefreshUtc', displayName: 'Last Successful Adobe Refresh UTC', type: 'DateTime' },
    { internalName: 'LastWebhookEventUtc', displayName: 'Last Webhook Event UTC', type: 'DateTime' },
    { internalName: 'LastManualRefreshUtc', displayName: 'Last Manual Refresh UTC', type: 'DateTime' },
    { internalName: 'LastReconciliationRefreshUtc', displayName: 'Last Reconciliation Refresh UTC', type: 'DateTime' },
    {
      internalName: 'LastSyncOutcome',
      displayName: 'Last Sync Outcome',
      type: 'Choice',
      choices: [...ADOBE_SIGN_CACHE_SYNC_OUTCOMES],
    },
    { internalName: 'LastSyncFailureCode', displayName: 'Last Sync Failure Code', type: 'Text' },
    { internalName: 'LastSyncFailureSummary', displayName: 'Last Sync Failure Summary', type: 'MultiLineText' },
    { internalName: 'PreviewItemJson', displayName: 'Preview Item JSON', type: 'MultiLineText' },
    { internalName: 'AgreementSnapshotJson', displayName: 'Agreement Snapshot JSON', type: 'MultiLineText' },
    { internalName: 'ParticipantsSnapshotJson', displayName: 'Participants Snapshot JSON', type: 'MultiLineText' },
    { internalName: 'DocumentsSnapshotJson', displayName: 'Documents Snapshot JSON', type: 'MultiLineText' },
    { internalName: 'WriteCapabilitySnapshotJson', displayName: 'Write Capability Snapshot JSON', type: 'MultiLineText' },
    { internalName: 'ProviderPayloadSchemaVersion', displayName: 'Provider Payload Schema Version', type: 'Number' },
    {
      internalName: 'CacheSchemaVersion',
      displayName: 'Cache Schema Version',
      type: 'Number',
      required: true,
    },
  ],
};

// ─── List 3: MyDashboardAdobeSignWebhookSubscriptions ──────────────────────

export const MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_DESCRIPTOR: IListDefinition = {
  title: MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE,
  description:
    'HB-managed USER-scoped Adobe webhook subscription registry. One row per connected actor.',
  template: 100,
  fields: [
    {
      internalName: 'SubscriptionKey',
      displayName: 'Subscription Key',
      type: 'Text',
      required: true,
      indexed: true,
      unique: true,
    },
    {
      internalName: 'AdobeActorKey',
      displayName: 'Adobe Actor Key',
      type: 'Text',
      required: true,
      indexed: true,
    },
    {
      internalName: 'UserPrincipalNameNormalized',
      displayName: 'User Principal Name Normalized',
      type: 'Text',
      indexed: true,
    },
    {
      internalName: 'AdobeWebhookId',
      displayName: 'Adobe Webhook ID',
      type: 'Text',
      indexed: true,
    },
    {
      internalName: 'WebhookScope',
      displayName: 'Webhook Scope',
      type: 'Choice',
      required: true,
      choices: [...ADOBE_SIGN_WEBHOOK_SCOPES],
    },
    {
      internalName: 'ResourceFamily',
      displayName: 'Resource Family',
      type: 'Choice',
      required: true,
      choices: [...ADOBE_SIGN_WEBHOOK_RESOURCE_FAMILIES],
    },
    {
      internalName: 'WebhookUrl',
      displayName: 'Webhook URL',
      type: 'URL',
      required: true,
    },
    { internalName: 'ConfiguredEventFilterJson', displayName: 'Configured Event Filter JSON', type: 'MultiLineText' },
    { internalName: 'PayloadOptionsJson', displayName: 'Payload Options JSON', type: 'MultiLineText' },
    {
      internalName: 'RemoteState',
      displayName: 'Remote State',
      type: 'Choice',
      required: true,
      choices: [...ADOBE_SIGN_WEBHOOK_REMOTE_STATES],
    },
    {
      internalName: 'LocalProcessingState',
      displayName: 'Local Processing State',
      type: 'Choice',
      required: true,
      indexed: true,
      choices: [...ADOBE_SIGN_WEBHOOK_LOCAL_PROCESSING_STATES],
    },
    { internalName: 'LastEnsureUtc', displayName: 'Last Ensure UTC', type: 'DateTime' },
    { internalName: 'LastVerifiedUtc', displayName: 'Last Verified UTC', type: 'DateTime' },
    {
      internalName: 'NextVerificationDueUtc',
      displayName: 'Next Verification Due UTC',
      type: 'DateTime',
      indexed: true,
    },
    {
      internalName: 'LastVerificationOutcome',
      displayName: 'Last Verification Outcome',
      type: 'Choice',
      choices: [...ADOBE_SIGN_WEBHOOK_VERIFICATION_OUTCOMES],
    },
    { internalName: 'LastFailureCode', displayName: 'Last Failure Code', type: 'Text' },
    { internalName: 'LastFailureSummary', displayName: 'Last Failure Summary', type: 'MultiLineText' },
    {
      internalName: 'IsManagedByHbIntel',
      displayName: 'Is Managed By HB Intel',
      type: 'Boolean',
      required: true,
      indexed: true,
    },
    {
      internalName: 'CacheSchemaVersion',
      displayName: 'Cache Schema Version',
      type: 'Number',
      required: true,
    },
  ],
};

// ─── List 4: MyDashboardAdobeSignSyncRuns ──────────────────────────────────

export const MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_DESCRIPTOR: IListDefinition = {
  title: MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE,
  description:
    'Operational refresh/subscription/reconciliation run ledger for Adobe Sign cache program.',
  template: 100,
  fields: [
    {
      internalName: 'RunId',
      displayName: 'Run ID',
      type: 'Text',
      required: true,
      indexed: true,
      unique: true,
    },
    {
      internalName: 'CorrelationId',
      displayName: 'Correlation ID',
      type: 'Text',
      indexed: true,
    },
    { internalName: 'WorkItemId', displayName: 'Work Item ID', type: 'Text' },
    {
      internalName: 'RunType',
      displayName: 'Run Type',
      type: 'Choice',
      required: true,
      indexed: true,
      choices: [...ADOBE_SIGN_CACHE_SYNC_RUN_TYPES],
    },
    {
      internalName: 'RefreshScope',
      displayName: 'Refresh Scope',
      type: 'Choice',
      choices: [...ADOBE_SIGN_CACHE_REFRESH_SCOPES],
    },
    {
      internalName: 'AdobeActorKey',
      displayName: 'Adobe Actor Key',
      type: 'Text',
      indexed: true,
    },
    {
      internalName: 'UserPrincipalNameNormalized',
      displayName: 'User Principal Name Normalized',
      type: 'Text',
    },
    { internalName: 'AgreementId', displayName: 'Agreement ID', type: 'Text' },
    { internalName: 'SubscriptionKey', displayName: 'Subscription Key', type: 'Text' },
    {
      internalName: 'StartedUtc',
      displayName: 'Started UTC',
      type: 'DateTime',
      indexed: true,
    },
    { internalName: 'CompletedUtc', displayName: 'Completed UTC', type: 'DateTime' },
    {
      internalName: 'Outcome',
      displayName: 'Outcome',
      type: 'Choice',
      required: true,
      indexed: true,
      choices: [...ADOBE_SIGN_CACHE_SYNC_OUTCOMES],
    },
    { internalName: 'ResultStage', displayName: 'Result Stage', type: 'Text' },
    { internalName: 'ProviderCallsMade', displayName: 'Provider Calls Made', type: 'Number' },
    { internalName: 'SharePointReadsMade', displayName: 'SharePoint Reads Made', type: 'Number' },
    { internalName: 'SharePointWritesMade', displayName: 'SharePoint Writes Made', type: 'Number' },
    { internalName: 'RowsInserted', displayName: 'Rows Inserted', type: 'Number' },
    { internalName: 'RowsUpdated', displayName: 'Rows Updated', type: 'Number' },
    { internalName: 'RowsSoftDeactivated', displayName: 'Rows Soft Deactivated', type: 'Number' },
    { internalName: 'FailureCode', displayName: 'Failure Code', type: 'Text' },
    { internalName: 'FailureSummary', displayName: 'Failure Summary', type: 'MultiLineText' },
  ],
};

// ─── Multi-list barrel ─────────────────────────────────────────────────────

export const MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS: readonly IListDefinition[] = [
  MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_DESCRIPTOR,
];

export const MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_TITLES: readonly string[] =
  MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS.map((d) => d.title);
