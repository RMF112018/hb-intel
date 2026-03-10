// ─────────────────────────────────────────────────────────────────────────────
// Ambient module declaration for @hbc/versioned-record in examples/.
//
// The versioned-record package is NOT a runtime dependency of workflow-handoff.
// This declaration provides only the types and API surface used by the
// reference configs so that examples/ can be type-checked without pulling
// the full versioned-record source tree into this project's compilation.
//
// When the consuming packages (business-development, estimating, project-hub)
// are created in Phase 4/5, they will import directly from @hbc/versioned-record.
// ─────────────────────────────────────────────────────────────────────────────

declare module '@hbc/versioned-record' {
  export type VersionTag =
    | 'draft'
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'archived'
    | 'handoff'
    | 'superseded';

  export type VersionTrigger =
    | 'on-submit'
    | 'on-approve'
    | 'on-reject'
    | 'on-handoff'
    | 'on-explicit-save'
    | 'on-stage-change';

  export interface IBicOwner {
    userId: string;
    displayName: string;
    role: string;
  }

  export interface IVersionSnapshot<T> {
    snapshotId: string;
    version: number;
    createdAt: string;
    createdBy: IBicOwner;
    changeSummary: string;
    tag: VersionTag;
    snapshot: T;
  }

  export interface IVersionedRecordConfig<T> {
    recordType: string;
    triggers: VersionTrigger[];
    generateChangeSummary?: (previous: T | null, current: T) => string;
    excludeFields?: ReadonlyArray<keyof T>;
    maxVersions?: number;
    getStakeholders: (snapshot: IVersionSnapshot<T>) => string[];
    onVersionCreated?: (snapshot: IVersionSnapshot<T>) => void;
  }

  export interface ICreateSnapshotInput<T> {
    recordType: string;
    recordId: string;
    config: IVersionedRecordConfig<T>;
    snapshot: T;
    tag: VersionTag;
    changeSummary: string;
    createdBy: IBicOwner;
  }

  export const VersionApi: {
    createSnapshot<T>(input: ICreateSnapshotInput<T>): Promise<IVersionSnapshot<T>>;
  };
}
