import type { IHandoffConfig } from '../src/types/IWorkflowHandoff';

/**
 * Creates a mock IHandoffConfig with all callbacks stubbed.
 * All callbacks have correct signatures matching actual IHandoffConfig:
 * - onAcknowledged returns `{ destinationRecordId: string }`
 * - onRejected returns `Promise<void>`
 *
 * @example
 * const config = createMockHandoffConfig({ routeLabel: 'BD → Estimating' });
 */
export function createMockHandoffConfig<TSource = unknown, TDest = unknown>(
  overrides?: Partial<IHandoffConfig<TSource, TDest>>
): IHandoffConfig<TSource, TDest> {
  return {
    sourceModule: 'business-development',
    sourceRecordType: 'bd-scorecard',
    destinationModule: 'estimating',
    destinationRecordType: 'estimating-pursuit',
    routeLabel: 'BD Win → Estimating Pursuit',
    acknowledgeDescription: 'An Estimating Pursuit will be created and pre-populated with the data below.',
    mapSourceToDestination: (source: TSource) => ({ ...(source as Record<string, unknown>) } as Partial<TDest>),
    resolveDocuments: async () => [],
    resolveRecipient: () => ({
      userId: 'mock-recipient-001',
      displayName: 'Jane Estimating',
      role: 'Estimating Coordinator',
    }),
    validateReadiness: () => null,
    onAcknowledged: async () => ({ destinationRecordId: 'mock-dest-001' }),
    onRejected: async () => {},
    ...overrides,
  };
}
