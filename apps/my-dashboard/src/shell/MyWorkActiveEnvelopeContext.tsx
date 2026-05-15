/**
 * Active envelope context for the single primary-page command surface.
 *
 * The shell mounts the home envelope provider unconditionally and publishes
 * its `EnvelopeState<T>` via context so the hero band and the surface
 * router both consume from the same fetch — no duplication.
 *
 * The focused-Adobe provider/hook/context exports remain so any
 * still-orphaned consumer (Prompt 03 deletes them) keeps compiling.
 *
 * @module shell/MyWorkActiveEnvelopeContext
 */

import { createContext, useContext, type ReactNode } from 'react';

import {
  type MyWorkAdobeSignActionQueueReadModel,
  type MyWorkHomeReadModel,
  type MyWorkReadModelDataPath,
  type MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';

import {
  useAdobeSignActionQueueEnvelope,
  useMyWorkHomeEnvelope,
  type EnvelopeState,
} from '../runtime/useMyWorkReadModelEnvelope.js';

/**
 * Shared "active envelope's data-path" value usable from any subtree
 * mounted under either provider. `'unknown'` covers loading, error, and
 * resolved envelopes that omitted the optional `dataPath` field.
 */
export type MyWorkActiveEnvelopeDataPath = MyWorkReadModelDataPath | 'unknown';

const MyWorkActiveDataPathContext = createContext<MyWorkActiveEnvelopeDataPath | null>(null);

function resolveDataPath<T>(state: EnvelopeState<T>): MyWorkActiveEnvelopeDataPath {
  if (state.status !== 'success') return 'unknown';
  const env: MyWorkReadModelEnvelope<T> = state.envelope;
  return env.dataPath ?? 'unknown';
}

/**
 * Returns the active route's envelope data-path classification. Safe to
 * call outside both envelope providers — returns `'unknown'` so the
 * shell can stamp a stable DOM marker before the first effect resolves.
 */
export function useMyWorkActiveEnvelopeDataPath(): MyWorkActiveEnvelopeDataPath {
  return useContext(MyWorkActiveDataPathContext) ?? 'unknown';
}

// ─── Home envelope context ────────────────────────────────────────────────

const MyWorkHomeEnvelopeContext = createContext<EnvelopeState<MyWorkHomeReadModel> | undefined>(
  undefined,
);

export function MyWorkHomeEnvelopeProvider({ children }: { readonly children: ReactNode }) {
  const state = useMyWorkHomeEnvelope();
  const dataPath = resolveDataPath(state);
  return (
    <MyWorkHomeEnvelopeContext.Provider value={state}>
      <MyWorkActiveDataPathContext.Provider value={dataPath}>
        {children}
      </MyWorkActiveDataPathContext.Provider>
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
  const dataPath = resolveDataPath(state);
  return (
    <MyWorkFocusedAdobeEnvelopeContext.Provider value={state}>
      <MyWorkActiveDataPathContext.Provider value={dataPath}>
        {children}
      </MyWorkActiveDataPathContext.Provider>
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

// ─── Active envelope provider ─────────────────────────────────────────────

/**
 * Mounts the home envelope provider so the hero band and the surface
 * router consume the same envelope from context — one fetch per shell
 * render.
 */
export function MyWorkActiveEnvelopeProvider({ children }: { readonly children: ReactNode }) {
  return <MyWorkHomeEnvelopeProvider>{children}</MyWorkHomeEnvelopeProvider>;
}
