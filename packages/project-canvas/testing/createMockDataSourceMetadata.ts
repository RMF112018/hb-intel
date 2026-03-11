/**
 * createMockDataSourceMetadata — D-SF13-T08, D-08, D-10 (testing sub-path)
 *
 * Factory for mock data-source metadata instances with Partial overrides.
 */
import type { DataSourceBadge, IDataSourceTooltip } from '../src/types/IProjectCanvas.js';

export interface MockDataSourceMetadata {
  badge: DataSourceBadge;
  tooltip: IDataSourceTooltip;
}

export function createMockDataSourceMetadata(
  overrides: Partial<MockDataSourceMetadata> = {},
): MockDataSourceMetadata {
  return {
    badge: 'Live',
    tooltip: {
      badge: 'Live',
      label: 'Live Data',
      description: 'Auto synced',
      showLastSync: true,
      showSourceSystem: true,
      showQuickControls: false,
    },
    ...overrides,
  };
}
