/**
 * Per-active-module envelope context.
 *
 * The shell mounts exactly one provider (home or focused Adobe) chosen from
 * `activeModuleId`. The provider owns the appropriate envelope hook and
 * publishes its `EnvelopeState<T>` via context so the hero band adapter and
 * the surface router route both consume from the same fetch — no
 * duplication.
 *
 * @module shell/MyWorkActiveEnvelopeContext
 */

import { createContext, useContext, type ReactNode } from 'react';

import {
  normalizeMyWorkModuleId,
  type MyWorkAdobeSignActionQueueReadModel,
  type MyWorkHomeReadModel,
  type MyWorkModuleId,
} from '@hbc/models/myWork';

import {
  useAdobeSignActionQueueEnvelope,
  useMyWorkHomeEnvelope,
  type EnvelopeState,
} from '../runtime/useMyWorkReadModelEnvelope.js';

// ─── Home envelope context ────────────────────────────────────────────────

const MyWorkHomeEnvelopeContext = createContext<EnvelopeState<MyWorkHomeReadModel> | undefined>(
  undefined,
);

export function MyWorkHomeEnvelopeProvider({ children }: { readonly children: ReactNode }) {
  const state = useMyWorkHomeEnvelope();
  return (
    <MyWorkHomeEnvelopeContext.Provider value={state}>
      {children}
    </MyWorkHomeEnvelopeContext.Provider>
  );
}

export function useMyWorkHomeEnvelopeContext(): EnvelopeState<MyWorkHomeReadModel> {
  const state = useContext(MyWorkHomeEnvelopeContext);
  if (!state) {
    throw new Error(
      'useMyWorkHomeEnvelopeContext: missing <MyWorkHomeEnvelopeProvider>. The home envelope context is only available on the home route.',
    );
  }
  return state;
}

// ─── Focused Adobe Sign envelope context ──────────────────────────────────

const MyWorkFocusedAdobeEnvelopeContext = createContext<
  EnvelopeState<MyWorkAdobeSignActionQueueReadModel> | undefined
>(undefined);

export function MyWorkFocusedAdobeEnvelopeProvider({ children }: { readonly children: ReactNode }) {
  const state = useAdobeSignActionQueueEnvelope();
  return (
    <MyWorkFocusedAdobeEnvelopeContext.Provider value={state}>
      {children}
    </MyWorkFocusedAdobeEnvelopeContext.Provider>
  );
}

export function useMyWorkFocusedAdobeEnvelopeContext(): EnvelopeState<MyWorkAdobeSignActionQueueReadModel> {
  const state = useContext(MyWorkFocusedAdobeEnvelopeContext);
  if (!state) {
    throw new Error(
      'useMyWorkFocusedAdobeEnvelopeContext: missing <MyWorkFocusedAdobeEnvelopeProvider>. The focused Adobe envelope context is only available on the Adobe Sign focused-module route.',
    );
  }
  return state;
}

// ─── Active envelope provider router ──────────────────────────────────────

/**
 * Mounts the envelope provider for the currently active surface so both
 * the hero band and the surface router consume the same envelope from
 * context — one fetch per active route.
 */
export function MyWorkActiveEnvelopeProvider({
  activeModuleId,
  children,
}: {
  readonly activeModuleId?: MyWorkModuleId;
  readonly children: ReactNode;
}) {
  const normalized = normalizeMyWorkModuleId(activeModuleId);
  if (normalized === 'adobe-sign-action-queue') {
    return <MyWorkFocusedAdobeEnvelopeProvider>{children}</MyWorkFocusedAdobeEnvelopeProvider>;
  }
  return <MyWorkHomeEnvelopeProvider>{children}</MyWorkHomeEnvelopeProvider>;
}
