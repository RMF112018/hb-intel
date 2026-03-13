import type {
  AutopsyVersionTag,
  IBicOwner,
  IAutopsyRecordSnapshot,
  IAutopsyVersionEnvelope,
  IAutopsyVersionMutationResult,
  IVersionMetadata,
  IVersionSnapshot,
} from '../../types/index.js';

const clone = <T>(value: T): T => structuredClone(value);

export const mapAutopsyStatusToVersionTag = (
  status: IAutopsyRecordSnapshot['autopsy']['status']
): AutopsyVersionTag => {
  switch (status) {
    case 'draft':
      return 'draft';
    case 'review':
    case 'overdue':
      return 'submitted';
    case 'approved':
    case 'published':
      return 'approved';
    case 'superseded':
      return 'superseded';
    case 'archived':
      return 'archived';
  }
};

export const createAutopsyVersionMetadata = (
  recordId: string,
  version: number,
  createdAt: string,
  createdBy: IBicOwner,
  changeSummary: string,
  tag: AutopsyVersionTag
): IVersionMetadata => ({
  snapshotId: `${recordId}-v${version}`,
  version,
  createdAt,
  createdBy,
  changeSummary,
  tag,
});

export const createInitialAutopsyVersionEnvelope = (
  snapshot: IAutopsyRecordSnapshot,
  createdAt: string,
  createdBy: IBicOwner,
  changeSummary: string
): IAutopsyVersionEnvelope => {
  const metadata = createAutopsyVersionMetadata(
    snapshot.autopsy.autopsyId,
    1,
    createdAt,
    createdBy,
    changeSummary,
    mapAutopsyStatusToVersionTag(snapshot.autopsy.status)
  );
  const versionSnapshot: IVersionSnapshot<IAutopsyRecordSnapshot> = {
    snapshotId: metadata.snapshotId,
    version: metadata.version,
    createdAt: metadata.createdAt,
    createdBy: metadata.createdBy,
    changeSummary: metadata.changeSummary,
    tag: metadata.tag,
    snapshot: clone(snapshot),
  };

  return {
    recordType: 'post-bid-autopsy',
    recordId: snapshot.autopsy.autopsyId,
    currentVersion: metadata,
    versions: [metadata],
    snapshots: [versionSnapshot],
  };
};

export const appendAutopsyVersionEnvelope = (
  envelope: IAutopsyVersionEnvelope,
  snapshot: IAutopsyRecordSnapshot,
  createdAt: string,
  createdBy: IBicOwner,
  changeSummary: string,
  tag = mapAutopsyStatusToVersionTag(snapshot.autopsy.status)
): IAutopsyVersionMutationResult => {
  const version = envelope.currentVersion.version + 1;
  const metadata = createAutopsyVersionMetadata(
    envelope.recordId,
    version,
    createdAt,
    createdBy,
    changeSummary,
    tag
  );
  const versionSnapshot: IVersionSnapshot<IAutopsyRecordSnapshot> = {
    snapshotId: metadata.snapshotId,
    version: metadata.version,
    createdAt: metadata.createdAt,
    createdBy: metadata.createdBy,
    changeSummary: metadata.changeSummary,
    tag: metadata.tag,
    snapshot: clone(snapshot),
  };

  return {
    record: clone(snapshot),
    tag,
    version: {
      ...envelope,
      currentVersion: metadata,
      versions: [...envelope.versions, metadata],
      snapshots: [...envelope.snapshots, versionSnapshot],
    },
  };
};
