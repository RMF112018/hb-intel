// Full implementation in T02
export type VersionTag = 'draft' | 'submitted' | 'approved' | 'rejected' | 'archived' | 'handoff' | 'superseded';
export type VersionTrigger = 'on-submit' | 'on-approve' | 'on-reject' | 'on-handoff' | 'on-explicit-save' | 'on-stage-change';
export interface IBicOwner { userId: string; displayName: string; role: string; }
export interface IVersionSnapshot<T> { snapshotId: string; version: number; createdAt: string; createdBy: IBicOwner; changeSummary: string; tag: VersionTag; snapshot: T; }
export interface IVersionMetadata { snapshotId: string; version: number; createdAt: string; createdBy: IBicOwner; changeSummary: string; tag: VersionTag; storageRef?: string; }
export interface IVersionedRecordConfig<T> { recordType: string; triggers: VersionTrigger[]; generateChangeSummary?: (previous: T | null, current: T) => string; excludeFields?: Array<keyof T>; maxVersions?: number; getStakeholders: (snapshot: IVersionSnapshot<T>) => string[]; onVersionCreated?: (snapshot: IVersionSnapshot<T>) => void; }
export interface IVersionDiff { fieldName: string; label: string; previousValue: string; currentValue: string; changeType: 'added' | 'removed' | 'modified'; }
