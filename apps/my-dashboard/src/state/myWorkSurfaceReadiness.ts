/**
 * Surface-readiness selector.
 *
 * Maps an envelope-loading state (from `useMyWorkReadModelEnvelope`) into the
 * vocabulary the surfaces and router consume. Implements the readiness
 * mapping required by the B05 Prompt 03 contract:
 *
 *   sourceStatus                  | surface variant
 *   ------------------------------|-----------------
 *   available                     | ready
 *   partial                       | ready (sourceStatus forwarded for partial signaling in Prompt 04)
 *   configuration-required        | non-ready
 *   authorization-required        | non-ready
 *   principal-unresolved          | non-ready
 *   source-unavailable            | non-ready
 *   backend-unavailable           | non-ready
 *
 * Loading and error are envelope-state concerns (not source-status concerns)
 * and surface as their own variants — `'loading'` and `'error'` — never as a
 * re-tagged `configuration-required` per the prompt's explicit guardrail.
 *
 * @module state/myWorkSurfaceReadiness
 */

import type { MyWorkReadModelEnvelope, MyWorkReadModelSourceStatus } from '@hbc/models/myWork';

import type { EnvelopeState } from '../runtime/useMyWorkReadModelEnvelope.js';

export type MyWorkSurfaceReadinessVariant = 'loading' | 'ready' | 'non-ready' | 'error';

export interface MyWorkSurfaceReadiness<T> {
  readonly variant: MyWorkSurfaceReadinessVariant;
  /** Present when variant is `'ready'` or `'non-ready'`. */
  readonly sourceStatus?: MyWorkReadModelSourceStatus;
  /** Present when variant is `'ready'` or `'non-ready'`. */
  readonly envelope?: MyWorkReadModelEnvelope<T>;
  /** Present only when variant is `'error'`. */
  readonly error?: Error;
}

const READY_STATUSES: ReadonlySet<MyWorkReadModelSourceStatus> =
  new Set<MyWorkReadModelSourceStatus>(['available', 'partial']);

export function mapSourceStatusToVariant(
  status: MyWorkReadModelSourceStatus,
): 'ready' | 'non-ready' {
  return READY_STATUSES.has(status) ? 'ready' : 'non-ready';
}

export function selectSurfaceReadiness<T>(state: EnvelopeState<T>): MyWorkSurfaceReadiness<T> {
  if (state.status === 'loading') {
    return { variant: 'loading' };
  }
  if (state.status === 'error') {
    return { variant: 'error', error: state.error };
  }
  return {
    variant: mapSourceStatusToVariant(state.envelope.sourceStatus),
    sourceStatus: state.envelope.sourceStatus,
    envelope: state.envelope,
  };
}
