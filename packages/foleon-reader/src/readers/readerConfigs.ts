import type {
  FoleonContentType,
  FoleonReaderKey,
} from '../types/foleon-content.types.js';
import type { FoleonPlacementKey } from '../types/foleon-placement.types.js';

export interface FoleonReaderModuleConfig {
  readonly readerKey: FoleonReaderKey;
  readonly contentTypeKey: FoleonContentType;
  readonly placementKey: FoleonPlacementKey;
  readonly title: string;
}

export const FOLEON_READER_CONFIGS = {
  projectSpotlight: {
    readerKey: 'project-spotlight',
    contentTypeKey: 'Project Spotlight',
    placementKey: 'Project Spotlight Active',
    title: 'Project Spotlight',
  },
  companyPulse: {
    readerKey: 'company-pulse',
    contentTypeKey: 'Company Pulse',
    placementKey: 'Company Pulse Active',
    title: 'Company Pulse',
  },
  leadershipMessage: {
    readerKey: 'leadership-message',
    contentTypeKey: 'Leadership',
    placementKey: 'Leadership Message Active',
    title: 'Leadership Message',
  },
} as const satisfies Record<string, FoleonReaderModuleConfig>;

export type FoleonReaderConfigId = keyof typeof FOLEON_READER_CONFIGS;

export function getFoleonReaderConfig(id: FoleonReaderConfigId): FoleonReaderModuleConfig {
  return FOLEON_READER_CONFIGS[id];
}
