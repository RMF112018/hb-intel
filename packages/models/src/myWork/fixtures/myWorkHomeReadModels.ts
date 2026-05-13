/**
 * My Work — home read model fixture envelopes.
 *
 * Deterministic, contract-only home envelopes composing actor, home
 * summary, source readiness, and the Adobe queue home projection.
 * Adobe queue items and summary are derived from the queue fixture
 * envelopes so home / focused-queue scenarios stay in lockstep.
 *
 * @module myWork/fixtures/myWorkHomeReadModels
 */

import type {
  MyWorkActorSummary,
  MyWorkAdobeSignActionQueueHomeProjection,
  MyWorkAdobeSignActionQueueSummary,
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
  MyWorkReadModelWarning,
  MyWorkSourceReadinessItem,
} from '../index.js';

import {
  ADOBE_SIGN_QUEUE_AVAILABLE,
  ADOBE_SIGN_QUEUE_PARTIAL,
  MY_WORK_FIXTURE_GENERATED_AT_UTC,
} from './adobeSignActionQueueReadModels.js';

const FIXTURE_ACTOR: MyWorkActorSummary = {
  displayName: 'Avery Project Lead',
  principalName: 'avery.lead@hb.example.com',
  hbcUserId: 'hb-user-fixture-1',
};

const ZERO_QUEUE_SUMMARY: MyWorkAdobeSignActionQueueSummary = {
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

const buildHomeEnvelope = (params: {
  readonly sourceStatus: MyWorkReadModelSourceStatus;
  readonly totalActionItemCount: number;
  readonly readinessWarnings: readonly MyWorkReadModelWarning[];
  readonly projection: MyWorkAdobeSignActionQueueHomeProjection;
  readonly envelopeWarnings: readonly MyWorkReadModelWarning[];
}): MyWorkReadModelEnvelope<MyWorkHomeReadModel> => {
  const readiness: MyWorkSourceReadinessItem = {
    sourceSystem: 'adobe-sign',
    sourceStatus: params.sourceStatus,
    warnings: params.readinessWarnings,
  };
  return {
    mode: 'fixture',
    sourceStatus: params.sourceStatus,
    readOnly: true,
    warnings: params.envelopeWarnings,
    generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    data: {
      actor: FIXTURE_ACTOR,
      summary: { totalActionItemCount: params.totalActionItemCount },
      sourceReadiness: [readiness],
      adobeSignActionQueue: params.projection,
    },
  };
};

const ZEROED_PROJECTION: MyWorkAdobeSignActionQueueHomeProjection = {
  summary: ZERO_QUEUE_SUMMARY,
  previewItems: [],
  previewItemLimit: 5,
};

const AVAILABLE_PROJECTION: MyWorkAdobeSignActionQueueHomeProjection = {
  summary: ADOBE_SIGN_QUEUE_AVAILABLE.data.summary,
  previewItems: ADOBE_SIGN_QUEUE_AVAILABLE.data.items.slice(0, 5),
  previewItemLimit: 5,
};

const PARTIAL_PROJECTION: MyWorkAdobeSignActionQueueHomeProjection = {
  summary: ADOBE_SIGN_QUEUE_PARTIAL.data.summary,
  previewItems: ADOBE_SIGN_QUEUE_PARTIAL.data.items,
  previewItemLimit: 5,
};

export const MY_WORK_HOME_AVAILABLE: MyWorkReadModelEnvelope<MyWorkHomeReadModel> =
  buildHomeEnvelope({
    sourceStatus: 'available',
    totalActionItemCount: 6,
    readinessWarnings: [],
    projection: AVAILABLE_PROJECTION,
    envelopeWarnings: [],
  });

export const MY_WORK_HOME_EMPTY: MyWorkReadModelEnvelope<MyWorkHomeReadModel> = buildHomeEnvelope({
  sourceStatus: 'available',
  totalActionItemCount: 0,
  readinessWarnings: [],
  projection: ZEROED_PROJECTION,
  envelopeWarnings: [],
});

export const MY_WORK_HOME_PARTIAL: MyWorkReadModelEnvelope<MyWorkHomeReadModel> = buildHomeEnvelope(
  {
    sourceStatus: 'partial',
    totalActionItemCount: 3,
    readinessWarnings: [{ code: 'partial-source-data' }],
    projection: PARTIAL_PROJECTION,
    envelopeWarnings: [{ code: 'partial-source-data' }],
  },
);

export const MY_WORK_HOME_CONFIGURATION_REQUIRED: MyWorkReadModelEnvelope<MyWorkHomeReadModel> =
  buildHomeEnvelope({
    sourceStatus: 'configuration-required',
    totalActionItemCount: 0,
    readinessWarnings: [{ code: 'configuration-required' }],
    projection: ZEROED_PROJECTION,
    envelopeWarnings: [{ code: 'configuration-required' }],
  });

export const MY_WORK_HOME_AUTHORIZATION_REQUIRED: MyWorkReadModelEnvelope<MyWorkHomeReadModel> =
  buildHomeEnvelope({
    sourceStatus: 'authorization-required',
    totalActionItemCount: 0,
    readinessWarnings: [{ code: 'authorization-required' }],
    projection: ZEROED_PROJECTION,
    envelopeWarnings: [{ code: 'authorization-required' }],
  });

export const MY_WORK_HOME_PRINCIPAL_UNRESOLVED: MyWorkReadModelEnvelope<MyWorkHomeReadModel> =
  buildHomeEnvelope({
    sourceStatus: 'principal-unresolved',
    totalActionItemCount: 0,
    readinessWarnings: [{ code: 'principal-unresolved' }],
    projection: ZEROED_PROJECTION,
    envelopeWarnings: [{ code: 'principal-unresolved' }],
  });

export const MY_WORK_HOME_SOURCE_UNAVAILABLE: MyWorkReadModelEnvelope<MyWorkHomeReadModel> =
  buildHomeEnvelope({
    sourceStatus: 'source-unavailable',
    totalActionItemCount: 0,
    readinessWarnings: [{ code: 'source-unavailable' }],
    projection: ZEROED_PROJECTION,
    envelopeWarnings: [{ code: 'source-unavailable' }],
  });

export const MY_WORK_HOME_BACKEND_UNAVAILABLE: MyWorkReadModelEnvelope<MyWorkHomeReadModel> =
  buildHomeEnvelope({
    sourceStatus: 'backend-unavailable',
    totalActionItemCount: 0,
    readinessWarnings: [{ code: 'backend-unavailable' }],
    projection: ZEROED_PROJECTION,
    envelopeWarnings: [{ code: 'backend-unavailable' }],
  });
