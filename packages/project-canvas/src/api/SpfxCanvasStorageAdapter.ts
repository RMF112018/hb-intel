/**
 * Phase 3 Stage 5.4 — SPFx canvas persistence adapter.
 *
 * localStorage-based canvas layout persistence for SPFx webparts.
 * Per P3-C3 §6.2: offline via localStorage, online sync target is
 * SharePoint list (adapter interface ready, sync implementation
 * is Phase 3 runtime scope).
 *
 * Governing: P3-C3 §6.2
 */

import type { ICanvasUserConfig } from '../types/index.js';
import type { ICanvasPersistenceAdapter } from './CanvasPersistenceAdapter.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ISpfxCanvasStorageAdapter extends ICanvasPersistenceAdapter {}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

const KEY_PREFIX = 'hbc-canvas-spfx-';

function buildKey(projectId: string, userId: string): string {
  return `${KEY_PREFIX}${projectId}-${userId}`;
}

/**
 * Create an SPFx canvas storage adapter backed by localStorage.
 *
 * Falls back gracefully: corrupt or missing data returns null,
 * triggering role-default generation in the canvas hook.
 */
export function createSpfxCanvasStorageAdapter(): ISpfxCanvasStorageAdapter {
  return {
    async getConfig(projectId: string, userId: string): Promise<ICanvasUserConfig | null> {
      try {
        const raw = localStorage.getItem(buildKey(projectId, userId));
        if (!raw) return null;
        const config = JSON.parse(raw) as ICanvasUserConfig;
        // Basic validation
        if (!config.projectId || !config.userId || !Array.isArray(config.tiles)) {
          return null;
        }
        return config;
      } catch {
        return null;
      }
    },

    async saveConfig(config: ICanvasUserConfig): Promise<void> {
      try {
        localStorage.setItem(
          buildKey(config.projectId, config.userId),
          JSON.stringify(config),
        );
      } catch {
        // localStorage full or unavailable — fail silently
      }
    },

    async resetConfig(projectId: string, userId: string): Promise<void> {
      try {
        localStorage.removeItem(buildKey(projectId, userId));
      } catch {
        // fail silently
      }
    },
  };
}
