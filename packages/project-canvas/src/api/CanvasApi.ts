/**
 * CanvasApi — D-SF13-T03, D-03 (persistence), D-05 (mandatory governance)
 *
 * Object-export API for canvas user configuration persistence and governance.
 */
import type { ICanvasUserConfig, ICanvasTileDefinition, DataSourceBadge, IDataSourceTooltip } from '../types/index.js';
import type { RecommendationSignal } from '../constants/index.js';

const CANVAS_API_BASE = '/api/canvas';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${CANVAS_API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`CanvasApi error ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

export const CanvasApi = {
  /** Retrieve user config for a project — D-03 */
  async getConfig(userId: string, projectId: string): Promise<ICanvasUserConfig | null> {
    return apiFetch<ICanvasUserConfig | null>(
      `/configs?userId=${encodeURIComponent(userId)}&projectId=${encodeURIComponent(projectId)}`,
    );
  },

  /** Save user config — D-03 */
  async saveConfig(config: ICanvasUserConfig): Promise<void> {
    await apiFetch<void>('/configs', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  /** Reset user to role defaults — D-02 */
  async resetToRoleDefault(userId: string, projectId: string, role: string): Promise<ICanvasUserConfig> {
    return apiFetch<ICanvasUserConfig>('/configs/reset', {
      method: 'POST',
      body: JSON.stringify({ userId, projectId, role }),
    });
  },

  /** Get mandatory tiles for a role — D-05 */
  async getRoleMandatoryTiles(role: string): Promise<ICanvasTileDefinition[]> {
    return apiFetch<ICanvasTileDefinition[]>(
      `/governance/mandatory?role=${encodeURIComponent(role)}`,
    );
  },

  /** Apply mandatory tiles to all projects for a role — D-05 */
  async applyMandatoryTilesToAllProjects(role: string): Promise<void> {
    await apiFetch<void>('/governance/mandatory/apply-all', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  /** Get recommendations for a user/project — D-02 (PH Pulse, phase, usage) */
  async getCanvasRecommendations(
    userId: string,
    projectId: string,
  ): Promise<{ tileKey: string; signal: RecommendationSignal; reason: string }[]> {
    return apiFetch(
      `/recommendations?userId=${encodeURIComponent(userId)}&projectId=${encodeURIComponent(projectId)}`,
    );
  },

  /** Get data-source metadata for a tile — D-08 */
  async getTileDataSourceMetadata(
    projectId: string,
    tileKey: string,
  ): Promise<{ badge: DataSourceBadge; tooltip: IDataSourceTooltip }> {
    return apiFetch(
      `/tiles/${encodeURIComponent(tileKey)}/data-source?projectId=${encodeURIComponent(projectId)}`,
    );
  },
} as const;

export type ICanvasApi = typeof CanvasApi;
