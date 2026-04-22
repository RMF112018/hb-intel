import type { ISafetyInspectionRepository } from './ports/ISafetyInspectionRepository.js';
import { MockSafetyInspectionRepository } from './adapters/mock/MockSafetyInspectionRepository.js';
import {
  SharePointSafetyInspectionRepository,
  type SharePointAdapterOptions,
} from './adapters/sharepoint/SharePointSafetyInspectionRepository.js';

export type SafetyAdapterMode = 'mock' | 'sharepoint';

export interface CreateRepositoryOptions {
  readonly mode?: SafetyAdapterMode;
  readonly sharepoint?: SharePointAdapterOptions;
}

export function createSafetyInspectionRepository(
  options: CreateRepositoryOptions = {},
): ISafetyInspectionRepository {
  const mode = options.mode ?? 'mock';
  if (mode === 'sharepoint') {
    if (!options.sharepoint) {
      throw new Error(
        'SharePoint adapter requested but no SpHttpClient was provided. Pass { sharepoint: { client } }.',
      );
    }
    return new SharePointSafetyInspectionRepository(options.sharepoint);
  }
  return new MockSafetyInspectionRepository();
}
