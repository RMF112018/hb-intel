/**
 * Typed fixture factory for SF18-T08 estimating-pursuit readiness inputs.
 *
 * @design D-SF18-T08
 */
import type { IEstimatingPursuitReadinessInput } from '../src/bid-readiness/adapters/index.js';

export function createMockEstimatingPursuitForReadiness(
  overrides: Partial<IEstimatingPursuitReadinessInput> = {},
): IEstimatingPursuitReadinessInput {
  return {
    pursuitId: 'mock-estimating-pursuit',
    dueAt: '2026-03-20T00:00:00.000Z',
    costSectionsPopulated: true,
    bidBondConfirmed: true,
    addendaAcknowledged: true,
    subcontractorCoverageMet: true,
    bidDocumentsAttached: true,
    ceSignOff: true,
    ...overrides,
  };
}
