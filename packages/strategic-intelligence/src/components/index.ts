import type { IStrategicIntelligenceState } from '../types/index.js';

export interface StrategicIntelligencePanelModel {
  snapshotId: string;
  livingEntryCount: number;
  commitmentCount: number;
  approvalQueueCount: number;
  syncStatus: IStrategicIntelligenceState['syncStatus'];
}

export const createStrategicIntelligencePanelModel = (
  input: IStrategicIntelligenceState
): StrategicIntelligencePanelModel => ({
  snapshotId: input.heritageSnapshot.snapshotId,
  livingEntryCount: input.livingEntries.length,
  commitmentCount: input.commitmentRegister.length,
  approvalQueueCount: input.approvalQueue.length,
  syncStatus: input.syncStatus,
});
