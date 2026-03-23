/**
 * SF26-T03 — Storage adapter interface.
 *
 * Governing: SF26-T03, L-04
 */

import type { ISavedViewDefinition } from '../types/index.js';

export interface ISavedViewsStorageAdapter {
  readonly storageSystemId: string;
  loadViews(moduleKey: string, workspaceKey: string): Promise<ISavedViewDefinition[]>;
  saveView(view: ISavedViewDefinition): Promise<ISavedViewDefinition>;
  deleteView(viewId: string): Promise<void>;
  setDefault(viewId: string, moduleKey: string, workspaceKey: string): Promise<void>;
  clearDefault(moduleKey: string, workspaceKey: string): Promise<void>;
}
