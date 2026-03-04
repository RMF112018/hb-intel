/**
 * Form draft persistence store — Blueprint §2e, PH3 §3.1 Step 7.
 *
 * Stores unsaved form data keyed by `domain:entityId` so that
 * navigating away and returning preserves work-in-progress.
 */

import { create } from 'zustand';

export interface FormDraftState {
  /** Drafts keyed by composite key `"domain:entityId"`. */
  drafts: Record<string, Record<string, unknown>>;
  /** Dirty flags per composite key. */
  dirty: Record<string, boolean>;

  setDraft: (key: string, data: Record<string, unknown>) => void;
  getDraft: (key: string) => Record<string, unknown> | undefined;
  removeDraft: (key: string) => void;
  isDirty: (key: string) => boolean;
  clearAllDrafts: () => void;
}

export const useFormDraftStore = create<FormDraftState>()((set, get) => ({
  drafts: {},
  dirty: {},

  setDraft: (key, data) =>
    set((state) => ({
      drafts: { ...state.drafts, [key]: data },
      dirty: { ...state.dirty, [key]: true },
    })),

  getDraft: (key) => get().drafts[key],

  removeDraft: (key) =>
    set((state) => {
      const nextDrafts = { ...state.drafts };
      const nextDirty = { ...state.dirty };
      delete nextDrafts[key];
      delete nextDirty[key];
      return { drafts: nextDrafts, dirty: nextDirty };
    }),

  isDirty: (key) => get().dirty[key] ?? false,

  clearAllDrafts: () => set({ drafts: {}, dirty: {} }),
}));
