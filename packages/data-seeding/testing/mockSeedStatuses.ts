import type { SeedStatus } from '../src/types';

/**
 * Canonical set of 7 SeedStatus fixtures — one per status value.
 *
 * State machine:
 *   idle → validating → previewing → importing → complete | partial | failed
 *
 * D-10: These are the standardized test states for all component and hook tests.
 */
export interface MockSeedStatuses {
  idle: SeedStatus;
  validating: SeedStatus;
  previewing: SeedStatus;
  importing: SeedStatus;
  complete: SeedStatus;
  partial: SeedStatus;
  failed: SeedStatus;
}

export const mockSeedStatuses: MockSeedStatuses = {
  idle: 'idle',
  validating: 'validating',
  previewing: 'previewing',
  importing: 'importing',
  complete: 'complete',
  partial: 'partial',
  failed: 'failed',
};
