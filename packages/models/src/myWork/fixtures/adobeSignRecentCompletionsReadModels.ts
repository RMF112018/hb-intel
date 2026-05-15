/**
 * My Work — Adobe Sign Recent Completions fixture envelopes.
 *
 * Deterministic, contract-only sample envelopes for the focused Adobe
 * Sign recent-completions surface.
 *
 * @module myWork/fixtures/adobeSignRecentCompletionsReadModels
 */

import type {
  MyWorkAdobeSignRecentCompletionsItem,
  MyWorkAdobeSignRecentCompletionsReadModel,
  MyWorkAdobeSignRecentCompletionsSummary,
  MyWorkReadModelEnvelope,
  MyWorkReadModelWarning,
} from '../index.js';

export { MY_WORK_FIXTURE_GENERATED_AT_UTC } from './adobeSignActionQueueReadModels.js';
import { MY_WORK_FIXTURE_GENERATED_AT_UTC } from './adobeSignActionQueueReadModels.js';

const ZERO_SUMMARY: MyWorkAdobeSignRecentCompletionsSummary = {
  countBasis: 'returned-items',
  completedAgreementCount: 0,
  windowDays: 30,
};

const COMPLETED_ITEM_1: MyWorkAdobeSignRecentCompletionsItem = {
  itemId: 'adobe-sign:completed-agreement-1',
  sourceSystem: 'adobe-sign',
  agreementId: 'completed-agreement-1',
  agreementName: 'Subcontract Change Order 014',
  completionState: 'completed',
  sender: {
    displayName: 'Jordan Sender',
    emailAddress: 'jordan@hb.example.com',
  },
  modifiedAtUtc: '2026-05-11T18:00:00.000Z',
  sourceOpenUrl: 'https://adobesign.example.com/agreements/completed-agreement-1',
};

const COMPLETED_ITEM_2: MyWorkAdobeSignRecentCompletionsItem = {
  itemId: 'adobe-sign:completed-agreement-2',
  sourceSystem: 'adobe-sign',
  agreementId: 'completed-agreement-2',
  agreementName: 'Project Closeout Acknowledgement',
  completionState: 'completed',
  modifiedAtUtc: '2026-05-10T14:30:00.000Z',
};

const COMPLETED_ITEM_3: MyWorkAdobeSignRecentCompletionsItem = {
  itemId: 'adobe-sign:completed-agreement-3',
  sourceSystem: 'adobe-sign',
  agreementId: 'completed-agreement-3',
  agreementName: 'Vendor Insurance Renewal',
  completionState: 'completed',
  sender: {
    displayName: 'Taylor Sender',
    emailAddress: 'taylor@hb.example.com',
  },
  modifiedAtUtc: '2026-05-08T09:15:00.000Z',
};

const COMPLETED_ITEMS_THREE: readonly MyWorkAdobeSignRecentCompletionsItem[] = [
  COMPLETED_ITEM_1,
  COMPLETED_ITEM_2,
  COMPLETED_ITEM_3,
];

const COMPLETED_ITEMS_TWO: readonly MyWorkAdobeSignRecentCompletionsItem[] = [
  COMPLETED_ITEM_1,
  COMPLETED_ITEM_2,
];

const SUMMARY_THREE: MyWorkAdobeSignRecentCompletionsSummary = {
  countBasis: 'returned-items',
  completedAgreementCount: 3,
  windowDays: 30,
};

const SUMMARY_TWO: MyWorkAdobeSignRecentCompletionsSummary = {
  countBasis: 'returned-items',
  completedAgreementCount: 2,
  windowDays: 30,
};

const buildRecentCompletionsEnvelope = (params: {
  readonly sourceStatus: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>['sourceStatus'];
  readonly items: readonly MyWorkAdobeSignRecentCompletionsItem[];
  readonly summary: MyWorkAdobeSignRecentCompletionsSummary;
  readonly pagination: MyWorkAdobeSignRecentCompletionsReadModel['pagination'];
  readonly freshnessState: MyWorkAdobeSignRecentCompletionsReadModel['freshness']['state'];
  readonly warnings: readonly MyWorkReadModelWarning[];
}): MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> => ({
  mode: 'fixture',
  sourceStatus: params.sourceStatus,
  readOnly: true,
  warnings: params.warnings,
  generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
  data: {
    moduleId: 'adobe-sign-recent-completions',
    summary: params.summary,
    items: params.items,
    pagination: params.pagination,
    freshness: {
      state: params.freshnessState,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    },
  },
});

export const ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> =
  buildRecentCompletionsEnvelope({
    sourceStatus: 'available',
    items: COMPLETED_ITEMS_THREE,
    summary: SUMMARY_THREE,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'fresh',
    warnings: [],
  });

export const ADOBE_SIGN_RECENT_COMPLETIONS_EMPTY: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> =
  buildRecentCompletionsEnvelope({
    sourceStatus: 'available',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'fresh',
    warnings: [],
  });

export const ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE_PAGED: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> =
  buildRecentCompletionsEnvelope({
    sourceStatus: 'available',
    items: COMPLETED_ITEMS_TWO,
    summary: SUMMARY_TWO,
    pagination: { pageSize: 2, hasMore: true, nextCursor: 'cursor-completed-page-2' },
    freshnessState: 'fresh',
    warnings: [],
  });

export const ADOBE_SIGN_RECENT_COMPLETIONS_PARTIAL: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> =
  buildRecentCompletionsEnvelope({
    sourceStatus: 'partial',
    items: COMPLETED_ITEMS_TWO,
    summary: SUMMARY_TWO,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'fresh',
    warnings: [{ code: 'partial-source-data' }],
  });

export const ADOBE_SIGN_RECENT_COMPLETIONS_CONFIGURATION_REQUIRED: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> =
  buildRecentCompletionsEnvelope({
    sourceStatus: 'configuration-required',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'unknown',
    warnings: [{ code: 'configuration-required' }],
  });

export const ADOBE_SIGN_RECENT_COMPLETIONS_AUTHORIZATION_REQUIRED: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> =
  buildRecentCompletionsEnvelope({
    sourceStatus: 'authorization-required',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'unknown',
    warnings: [{ code: 'authorization-required' }],
  });

export const ADOBE_SIGN_RECENT_COMPLETIONS_PRINCIPAL_UNRESOLVED: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> =
  buildRecentCompletionsEnvelope({
    sourceStatus: 'principal-unresolved',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'unknown',
    warnings: [{ code: 'principal-unresolved' }],
  });

export const ADOBE_SIGN_RECENT_COMPLETIONS_SOURCE_UNAVAILABLE: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> =
  buildRecentCompletionsEnvelope({
    sourceStatus: 'source-unavailable',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'unknown',
    warnings: [{ code: 'source-unavailable' }],
  });

export const ADOBE_SIGN_RECENT_COMPLETIONS_BACKEND_UNAVAILABLE: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> =
  buildRecentCompletionsEnvelope({
    sourceStatus: 'backend-unavailable',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'unknown',
    warnings: [{ code: 'backend-unavailable' }],
  });
