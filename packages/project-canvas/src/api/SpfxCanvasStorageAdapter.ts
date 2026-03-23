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

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ISpfxCanvasStorageAdapter {
  /** Retrieve canvas config for a project+user. Returns null if not found or corrupt. */
  getConfig(projectId: string, userId: string): ICanvasUserConfig | null;
  /** Save canvas config for a project+user. */
  saveConfig(config: ICanvasUserConfig): void;
  /** Reset (remove) canvas config for a project+user. */
  resetConfig(projectId: string, userId: string): void;
}

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
    getConfig(projectId: string, userId: string): ICanvasUserConfig | null {
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

    saveConfig(config: ICanvasUserConfig): void {
      try {
        localStorage.setItem(
          buildKey(config.projectId, config.userId),
          JSON.stringify(config),
        );
      } catch {
        // localStorage full or unavailable — fail silently
      }
    },

    resetConfig(projectId: string, userId: string): void {
      try {
        localStorage.removeItem(buildKey(projectId, userId));
      } catch {
        // fail silently
      }
    },
  };
}
