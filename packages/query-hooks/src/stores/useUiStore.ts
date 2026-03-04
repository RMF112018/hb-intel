/**
 * UI state store — Blueprint §2e, PH3 §3.1 Step 7.
 *
 * Manages transient UI state: detail panels, modals, and global loading.
 * Not persisted — resets on page reload.
 */

import { create } from 'zustand';

export interface UiState {
  /** Currently open detail panel (domain + entity id), or null. */
  detailPanel: { domain: string; id: string | number } | null;
  /** Currently open modal key, or null. */
  modal: string | null;
  /** Global loading overlay flag. */
  globalLoading: boolean;

  openDetailPanel: (domain: string, id: string | number) => void;
  closeDetailPanel: () => void;
  openModal: (key: string) => void;
  closeModal: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  detailPanel: null,
  modal: null,
  globalLoading: false,

  openDetailPanel: (domain, id) => set({ detailPanel: { domain, id } }),
  closeDetailPanel: () => set({ detailPanel: null }),
  openModal: (key) => set({ modal: key }),
  closeModal: () => set({ modal: null }),
  setGlobalLoading: (globalLoading) => set({ globalLoading }),
}));
