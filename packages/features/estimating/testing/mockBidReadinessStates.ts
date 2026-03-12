/**
 * Canonical SF18-T08 bid-readiness scenario states.
 *
 * Provides deterministic, reusable view-state fixtures for Storybook and tests.
 *
 * @design D-SF18-T08
 */
import { BID_READINESS_SYNC_INDICATORS } from '../src/constants/index.js';
import {
  mapHealthIndicatorStateToBidReadinessView,
  mapPursuitToHealthIndicatorItem,
} from '../src/bid-readiness/adapters/index.js';
import { createMockEstimatingPursuitForReadiness } from './createMockEstimatingPursuitForReadiness.js';

function createState(params: Parameters<typeof createMockEstimatingPursuitForReadiness>[0]) {
  return mapHealthIndicatorStateToBidReadinessView(
    mapPursuitToHealthIndicatorItem(createMockEstimatingPursuitForReadiness(params)),
  );
}

export const mockBidReadinessStates = {
  ready: createState({
    pursuitId: 'p-ready',
    costSectionsPopulated: true,
    bidBondConfirmed: true,
    addendaAcknowledged: true,
    subcontractorCoverageMet: true,
    bidDocumentsAttached: true,
    ceSignOff: true,
  }),
  nearlyReady: createState({
    pursuitId: 'p-nearly-ready',
    costSectionsPopulated: true,
    bidBondConfirmed: true,
    addendaAcknowledged: true,
    subcontractorCoverageMet: false,
    bidDocumentsAttached: false,
    ceSignOff: true,
  }),
  attentionNeeded: createState({
    pursuitId: 'p-attention-needed',
    costSectionsPopulated: true,
    bidBondConfirmed: false,
    addendaAcknowledged: false,
    subcontractorCoverageMet: true,
    bidDocumentsAttached: true,
    ceSignOff: false,
  }),
  notReady: createState({
    pursuitId: 'p-not-ready',
    costSectionsPopulated: false,
    bidBondConfirmed: false,
    addendaAcknowledged: false,
    subcontractorCoverageMet: false,
    bidDocumentsAttached: false,
    ceSignOff: false,
  }),
  overdueAttentionNeeded: createState({
    pursuitId: 'p-overdue',
    dueAt: '2026-03-01T00:00:00.000Z',
    costSectionsPopulated: true,
    bidBondConfirmed: false,
    addendaAcknowledged: true,
    subcontractorCoverageMet: false,
    bidDocumentsAttached: true,
    ceSignOff: false,
  }),
  dueWithin48hWithBlockers: createState({
    pursuitId: 'p-due-48h',
    dueAt: '2026-03-13T00:00:00.000Z',
    costSectionsPopulated: true,
    bidBondConfirmed: false,
    addendaAcknowledged: true,
    subcontractorCoverageMet: false,
    bidDocumentsAttached: true,
    ceSignOff: false,
  }),
  savedLocallyOptimistic: {
    ...createState({
      pursuitId: 'p-saved-local',
      ceSignOff: false,
    }),
    syncIndicator: BID_READINESS_SYNC_INDICATORS[1],
  },
  queuedToSyncReplayPending: {
    ...createState({
      pursuitId: 'p-queued-sync',
      ceSignOff: false,
    }),
    syncIndicator: BID_READINESS_SYNC_INDICATORS[2],
  },
} as const;
