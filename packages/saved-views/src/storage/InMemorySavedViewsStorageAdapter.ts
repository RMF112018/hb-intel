/**
 * SF26-T03 — In-memory storage adapter (dev/test).
 *
 * Governing: SF26-T03, L-04
 */

import type { ISavedViewDefinition } from '../types/index.js';
import type { ISavedViewsStorageAdapter } from './ISavedViewsStorageAdapter.js';

export class InMemorySavedViewsStorageAdapter implements ISavedViewsStorageAdapter {
  readonly storageSystemId = 'in-memory';
  private views = new Map<string, ISavedViewDefinition>();

  async loadViews(moduleKey: string, workspaceKey: string): Promise<ISavedViewDefinition[]> {
    return Array.from(this.views.values())
      .filter(v => v.moduleKey === moduleKey && v.workspaceKey === workspaceKey)
      .sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso));
  }

  async saveView(view: ISavedViewDefinition): Promise<ISavedViewDefinition> {
    const saved = { ...view, updatedAtIso: new Date().toISOString() };
    this.views.set(view.viewId, saved);
    return saved;
  }

  async deleteView(viewId: string): Promise<void> {
    this.views.delete(viewId);
  }

  async setDefault(viewId: string, moduleKey: string, workspaceKey: string): Promise<void> {
    for (const v of this.views.values()) {
      if (v.moduleKey === moduleKey && v.workspaceKey === workspaceKey && v.isDefault) {
        this.views.set(v.viewId, { ...v, isDefault: false });
      }
    }
    const target = this.views.get(viewId);
    if (target) this.views.set(viewId, { ...target, isDefault: true });
  }

  async clearDefault(moduleKey: string, workspaceKey: string): Promise<void> {
    for (const v of this.views.values()) {
      if (v.moduleKey === moduleKey && v.workspaceKey === workspaceKey && v.isDefault) {
        this.views.set(v.viewId, { ...v, isDefault: false });
      }
    }
  }

  clear(): void { this.views.clear(); }
  size(): number { return this.views.size; }
}
