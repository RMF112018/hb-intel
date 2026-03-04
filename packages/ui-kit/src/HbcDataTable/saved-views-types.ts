/**
 * Saved Views — Type definitions
 * PH4.7 §7.3 Step 11 | Blueprint §1d
 */
import type { DensityTier } from '../HbcCommandBar/types.js';

/** Persisted view configuration for a table */
export interface SavedViewConfig {
  columns: string[];
  columnOrder: string[];
  columnWidths: Record<string, number>;
  filters: unknown;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  groupBy?: string;
  densityOverride?: DensityTier;
}

/** A single saved view entry */
export interface SavedViewEntry {
  id: string;
  userId: string;
  toolId: string;
  scope: 'personal' | 'project' | 'organization';
  projectId?: string;
  name: string;
  config: SavedViewConfig;
  isDefault: boolean;
}

/** Persistence adapter interface for saved views */
export interface SavedViewsPersistenceAdapter {
  load: (toolId: string, userId: string, projectId?: string) => Promise<SavedViewEntry[]>;
  save: (entry: SavedViewEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
}
