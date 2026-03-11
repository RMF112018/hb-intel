/**
 * createMockCanvasConfig — D-SF13-T01, D-10 (testing sub-path)
 *
 * Factory for mock ICanvasUserConfig instances with Partial overrides.
 */
import type { ICanvasUserConfig } from '../src/types/IProjectCanvas.js';

export function createMockCanvasConfig(
  overrides: Partial<ICanvasUserConfig> = {},
): ICanvasUserConfig {
  return {
    userId: 'user-001',
    projectId: 'project-001',
    tiles: [],
    ...overrides,
  };
}
