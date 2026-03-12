/**
 * Typed fixture factory for SF18 health-indicator state tests.
 *
 * @design D-SF18-T03
 */
import { mapPursuitToHealthIndicatorItem } from '../src/bid-readiness/adapters/index.js';
import type {
  IHealthIndicatorState,
  VersionedRecord,
} from '../src/types/index.js';

const DEFAULT_VERSION: VersionedRecord = {
  recordId: 'mock-pursuit',
  version: 1,
  updatedAt: new Date(0).toISOString(),
  updatedBy: 'test:fixture',
  source: 'testing-fixture',
  correlationId: 'fixture-1',
};

export function createMockHealthIndicatorState(
  overrides: Partial<IHealthIndicatorState> = {},
): IHealthIndicatorState {
  const base = mapPursuitToHealthIndicatorItem({
    pursuitId: 'mock-pursuit',
    costSectionsPopulated: true,
    bidBondConfirmed: true,
    addendaAcknowledged: true,
    subcontractorCoverageMet: false,
    bidDocumentsAttached: true,
    ceSignOff: false,
    version: DEFAULT_VERSION,
  });

  return {
    ...base,
    ...overrides,
    criteria: overrides.criteria ?? base.criteria,
    blockers: overrides.blockers ?? base.blockers,
    version: overrides.version ?? base.version,
  };
}
