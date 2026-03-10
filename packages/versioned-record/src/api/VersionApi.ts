import type { IVersionMetadata, IVersionSnapshot, IRestoreSnapshotInput, IRestoreSnapshotResult } from '../types';

// Full implementation in T07
export const VersionApi = {
  createSnapshot: async (..._args: unknown[]) => { throw new Error('Not implemented — see T07'); },
  getMetadataList: async (_recordType: string, _recordId: string): Promise<IVersionMetadata[]> => { throw new Error('Not implemented — see T07'); },
  getSnapshot: async <T>(_recordType: string, _recordId: string, _version: number): Promise<IVersionSnapshot<T>> => { throw new Error('Not implemented — see T07'); },
  getSnapshotById: async <T>(_snapshotId: string): Promise<IVersionSnapshot<T>> => { throw new Error('Not implemented — see T07'); },
  restoreSnapshot: async <T>(_input: IRestoreSnapshotInput<T>): Promise<IRestoreSnapshotResult<T>> => { throw new Error('Not implemented — see T07'); },
};
