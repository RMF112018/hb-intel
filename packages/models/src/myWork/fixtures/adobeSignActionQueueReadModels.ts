/**
 * My Work — Adobe Sign Action Queue fixture envelopes.
 *
 * Deterministic, contract-only sample envelopes for the focused Adobe
 * Sign action queue surface. Covers the nine B04 scenario states
 * required by downstream consumers (frontend read-model client,
 * backend mock provider, B05 UI) before a live Adobe data plane
 * exists.
 *
 * Determinism: all timestamps stamp `MY_WORK_FIXTURE_GENERATED_AT_UTC`;
 * item IDs follow `adobe-sign:<agreementId>`; no `Date.now`, no
 * `Math.random`, no `new Date(...)`.
 *
 * @module myWork/fixtures/adobeSignActionQueueReadModels
 */

import type {
  MyWorkAdobeSignActionQueueItem,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkAdobeSignActionQueueSummary,
  MyWorkReadModelEnvelope,
  MyWorkReadModelWarning,
} from '../index.js';

export const MY_WORK_FIXTURE_GENERATED_AT_UTC = '2026-05-12T12:00:00.000Z' as const;

const ZERO_SUMMARY: MyWorkAdobeSignActionQueueSummary = {
  countBasis: 'returned-items',
  totalActionItemCount: 0,
  signatureCount: 0,
  approvalCount: 0,
  acceptanceCount: 0,
  acknowledgementCount: 0,
  formFillingCount: 0,
  delegationCount: 0,
  expiringSoonCount: 0,
};

const QUEUE_ITEM_SIGNATURE: MyWorkAdobeSignActionQueueItem = {
  itemId: 'adobe-sign:agreement-signature-1',
  sourceSystem: 'adobe-sign',
  agreementId: 'agreement-signature-1',
  agreementName: 'Master Services Agreement',
  requiredAction: 'signature',
  adobeRecipientStatus: 'WAITING_FOR_MY_SIGNATURE',
  sender: {
    displayName: 'Pat Sender',
    emailAddress: 'pat@hb.example.com',
  },
  createdAtUtc: '2026-05-08T09:00:00.000Z',
  modifiedAtUtc: '2026-05-10T09:00:00.000Z',
  expirationAtUtc: '2026-05-15T12:00:00.000Z',
  sourceOpenUrl: 'https://adobesign.example.com/agreements/agreement-signature-1',
};

const QUEUE_ITEM_APPROVAL: MyWorkAdobeSignActionQueueItem = {
  itemId: 'adobe-sign:agreement-approval-1',
  sourceSystem: 'adobe-sign',
  agreementId: 'agreement-approval-1',
  agreementName: 'Subcontract Approval Packet',
  requiredAction: 'approval',
  adobeRecipientStatus: 'WAITING_FOR_MY_APPROVAL',
  sender: {
    displayName: 'Robin Sender',
    emailAddress: 'robin@hb.example.com',
  },
  createdAtUtc: '2026-05-09T09:00:00.000Z',
  modifiedAtUtc: '2026-05-11T09:00:00.000Z',
  expirationAtUtc: '2026-05-17T12:00:00.000Z',
  sourceOpenUrl: 'https://adobesign.example.com/agreements/agreement-approval-1',
};

const QUEUE_ITEM_ACCEPTANCE: MyWorkAdobeSignActionQueueItem = {
  itemId: 'adobe-sign:agreement-acceptance-1',
  sourceSystem: 'adobe-sign',
  agreementId: 'agreement-acceptance-1',
  agreementName: 'Vendor Terms Acceptance',
  requiredAction: 'acceptance',
  adobeRecipientStatus: 'WAITING_FOR_MY_ACCEPTANCE',
  sender: {
    displayName: 'Sam Sender',
    emailAddress: 'sam@hb.example.com',
  },
  createdAtUtc: '2026-05-05T09:00:00.000Z',
  modifiedAtUtc: '2026-05-06T09:00:00.000Z',
  expirationAtUtc: '2026-06-05T12:00:00.000Z',
  sourceOpenUrl: 'https://adobesign.example.com/agreements/agreement-acceptance-1',
};

const QUEUE_ITEM_ACKNOWLEDGEMENT: MyWorkAdobeSignActionQueueItem = {
  itemId: 'adobe-sign:agreement-acknowledgement-1',
  sourceSystem: 'adobe-sign',
  agreementId: 'agreement-acknowledgement-1',
  agreementName: 'Site Safety Acknowledgement',
  requiredAction: 'acknowledgement',
  adobeRecipientStatus: 'WAITING_FOR_MY_ACKNOWLEDGEMENT',
  sender: {
    displayName: 'Casey Sender',
    emailAddress: 'casey@hb.example.com',
  },
  createdAtUtc: '2026-05-04T09:00:00.000Z',
  modifiedAtUtc: '2026-05-04T09:00:00.000Z',
  expirationAtUtc: '2026-06-04T12:00:00.000Z',
};

const QUEUE_ITEM_FORM_FILLING: MyWorkAdobeSignActionQueueItem = {
  itemId: 'adobe-sign:agreement-form-filling-1',
  sourceSystem: 'adobe-sign',
  agreementId: 'agreement-form-filling-1',
  agreementName: 'Insurance Disclosure Form',
  requiredAction: 'form-filling',
  adobeRecipientStatus: 'WAITING_FOR_MY_FORM_FILLING',
  sender: {
    displayName: 'Drew Sender',
    emailAddress: 'drew@hb.example.com',
  },
  createdAtUtc: '2026-05-03T09:00:00.000Z',
  modifiedAtUtc: '2026-05-03T09:00:00.000Z',
  expirationAtUtc: '2026-06-03T12:00:00.000Z',
  sourceOpenUrl: 'https://adobesign.example.com/agreements/agreement-form-filling-1',
};

const QUEUE_ITEM_DELEGATION: MyWorkAdobeSignActionQueueItem = {
  itemId: 'adobe-sign:agreement-delegation-1',
  sourceSystem: 'adobe-sign',
  agreementId: 'agreement-delegation-1',
  agreementName: 'Signature Delegation Request',
  requiredAction: 'delegation',
  adobeRecipientStatus: 'WAITING_FOR_MY_DELEGATION',
  sender: {
    displayName: 'Erin Sender',
    emailAddress: 'erin@hb.example.com',
  },
  createdAtUtc: '2026-05-02T09:00:00.000Z',
  modifiedAtUtc: '2026-05-02T09:00:00.000Z',
  expirationAtUtc: '2026-06-02T12:00:00.000Z',
  sourceOpenUrl: 'https://adobesign.example.com/agreements/agreement-delegation-1',
};

const QUEUE_ITEMS_SIX: readonly MyWorkAdobeSignActionQueueItem[] = [
  QUEUE_ITEM_SIGNATURE,
  QUEUE_ITEM_APPROVAL,
  QUEUE_ITEM_ACCEPTANCE,
  QUEUE_ITEM_ACKNOWLEDGEMENT,
  QUEUE_ITEM_FORM_FILLING,
  QUEUE_ITEM_DELEGATION,
];

const QUEUE_ITEMS_FIRST_THREE: readonly MyWorkAdobeSignActionQueueItem[] = [
  QUEUE_ITEM_SIGNATURE,
  QUEUE_ITEM_APPROVAL,
  QUEUE_ITEM_ACCEPTANCE,
];

const SUMMARY_SIX: MyWorkAdobeSignActionQueueSummary = {
  countBasis: 'returned-items',
  totalActionItemCount: 6,
  signatureCount: 1,
  approvalCount: 1,
  acceptanceCount: 1,
  acknowledgementCount: 1,
  formFillingCount: 1,
  delegationCount: 1,
  expiringSoonCount: 2,
};

const SUMMARY_FIRST_THREE: MyWorkAdobeSignActionQueueSummary = {
  countBasis: 'returned-items',
  totalActionItemCount: 3,
  signatureCount: 1,
  approvalCount: 1,
  acceptanceCount: 1,
  acknowledgementCount: 0,
  formFillingCount: 0,
  delegationCount: 0,
  expiringSoonCount: 2,
};

const buildQueueEnvelope = (params: {
  readonly sourceStatus: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>['sourceStatus'];
  readonly items: readonly MyWorkAdobeSignActionQueueItem[];
  readonly summary: MyWorkAdobeSignActionQueueSummary;
  readonly pagination: MyWorkAdobeSignActionQueueReadModel['pagination'];
  readonly freshnessState: MyWorkAdobeSignActionQueueReadModel['freshness']['state'];
  readonly warnings: readonly MyWorkReadModelWarning[];
}): MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> => ({
  mode: 'fixture',
  sourceStatus: params.sourceStatus,
  readOnly: true,
  warnings: params.warnings,
  generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
  data: {
    moduleId: 'adobe-sign-action-queue',
    summary: params.summary,
    items: params.items,
    pagination: params.pagination,
    freshness: {
      state: params.freshnessState,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    },
  },
});

export const ADOBE_SIGN_QUEUE_AVAILABLE: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> =
  buildQueueEnvelope({
    sourceStatus: 'available',
    items: QUEUE_ITEMS_SIX,
    summary: SUMMARY_SIX,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'fresh',
    warnings: [],
  });

export const ADOBE_SIGN_QUEUE_EMPTY: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> =
  buildQueueEnvelope({
    sourceStatus: 'available',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'fresh',
    warnings: [],
  });

export const ADOBE_SIGN_QUEUE_AVAILABLE_PAGED: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> =
  buildQueueEnvelope({
    sourceStatus: 'available',
    items: QUEUE_ITEMS_FIRST_THREE,
    summary: SUMMARY_FIRST_THREE,
    pagination: { pageSize: 3, hasMore: true, nextCursor: 'cursor-page-2' },
    freshnessState: 'fresh',
    warnings: [],
  });

export const ADOBE_SIGN_QUEUE_PARTIAL: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> =
  buildQueueEnvelope({
    sourceStatus: 'partial',
    items: QUEUE_ITEMS_FIRST_THREE,
    summary: SUMMARY_FIRST_THREE,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'fresh',
    warnings: [{ code: 'partial-source-data' }],
  });

export const ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> =
  buildQueueEnvelope({
    sourceStatus: 'configuration-required',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'unknown',
    warnings: [{ code: 'configuration-required' }],
  });

export const ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> =
  buildQueueEnvelope({
    sourceStatus: 'authorization-required',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'unknown',
    warnings: [{ code: 'authorization-required' }],
  });

export const ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> =
  buildQueueEnvelope({
    sourceStatus: 'principal-unresolved',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'unknown',
    warnings: [{ code: 'principal-unresolved' }],
  });

export const ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> =
  buildQueueEnvelope({
    sourceStatus: 'source-unavailable',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'unknown',
    warnings: [{ code: 'source-unavailable' }],
  });

export const ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> =
  buildQueueEnvelope({
    sourceStatus: 'backend-unavailable',
    items: [],
    summary: ZERO_SUMMARY,
    pagination: { pageSize: 25, hasMore: false },
    freshnessState: 'unknown',
    warnings: [{ code: 'backend-unavailable' }],
  });
