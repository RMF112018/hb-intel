# How to Adopt `@hbc/versioned-record` in a Module

**Audience:** HB Intel module developers
**Package:** `@hbc/versioned-record`
**Prerequisites:** `@hbc/notification-intelligence` available in workspace

---

## Step 1 — Define a versioning config

Create a `IVersionedRecordConfig<T>` for your record type. Place it alongside
your record type definitions.

```typescript
import type { IVersionedRecordConfig } from '@hbc/versioned-record';
import type { IGoNoGoScorecard } from '../types';

export const scorecardVersionConfig: IVersionedRecordConfig<IGoNoGoScorecard> = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit', 'on-approve', 'on-reject'],

  generateChangeSummary: (prev, current) => {
    if (!prev) return 'Initial version';
    const delta = current.totalScore - prev.totalScore;
    return `Score updated from ${prev.totalScore} to ${current.totalScore} (${delta > 0 ? '+' : ''}${delta})`;
  },

  excludeFields: ['isDirty', 'localDraftId'],
  maxVersions: 0, // unlimited — legal record

  getStakeholders: (snapshot) => {
    // Return userId strings for everyone who should receive a digest notification
    return [snapshot.createdBy.userId, ...scorecardTeam.map((u) => u.userId)];
  },
};
```

## Step 2 — Trigger a snapshot at business events (D-08)

Call `VersionApi.createSnapshot()` at meaningful business events, not at every
UI interaction. For wizard-driven records, call at stage-gate transitions.

```typescript
import { VersionApi } from '@hbc/versioned-record';

// On director submission (stage gate: draft → submitted)
const snapshot = await VersionApi.createSnapshot({
  recordType: 'bd-scorecard',
  recordId: scorecard.id,
  config: scorecardVersionConfig,
  snapshot: scorecard,
  tag: 'submitted',
  changeSummary: scorecardVersionConfig.generateChangeSummary?.(
    previousScorecard, scorecard
  ) ?? 'Submitted for review',
  createdBy: {
    userId: currentUser.id,
    displayName: currentUser.displayName,
    role: currentUser.role,
  },
});
```

## Step 3 — Pin acknowledgments to the version (D-07)

If your record uses `@hbc/acknowledgment` for director approval, pass the
`snapshotId` and `version` in `contextPayload`:

```typescript
openAcknowledgment({
  recordType: 'bd-scorecard',
  recordId: scorecard.id,
  requestedFrom: directorUser,
  contextPayload: {
    version: snapshot.version,
    snapshotId: snapshot.snapshotId,
  },
});
```

To display "Approved v2 on [date]" in the audit trail, read
`acknowledgment.contextPayload.version`.

## Step 4 — Add the version badge to the record header

```tsx
import { HbcVersionBadge } from '@hbc/versioned-record';

<HbcVersionBadge
  currentVersion={scorecard.currentVersion}
  currentTag={scorecard.currentVersionTag}
  onClick={() => setVersionPanelOpen(true)}
/>
```

## Step 5 — Render the version history panel

```tsx
import { HbcVersionHistory } from '@hbc/versioned-record';

{versionPanelOpen && (
  <HbcVersionHistory
    recordType="bd-scorecard"
    recordId={scorecard.id}
    config={scorecardVersionConfig}
    allowRollback={currentUser.role === 'Director of Preconstruction'}
    currentUser={currentUser}
    onRollback={(result) => {
      // Refresh scorecard from server after rollback
      void refetchScorecard();
    }}
  />
)}
```

## Step 6 — Testing your integration

```typescript
import {
  createMockVersionedRecordConfig,
  multiVersionState,
  mockUseVersionHistory,
} from '@hbc/versioned-record/testing';

// In your test file:
vi.mock('@hbc/versioned-record', () => ({
  useVersionHistory: vi.fn().mockReturnValue(
    mockUseVersionHistory.mockReturnValue()
  ),
  HbcVersionBadge: ({ currentVersion }: { currentVersion: number }) =>
    <span>v{currentVersion}</span>,
  HbcVersionHistory: () => <div data-testid="version-history" />,
}));
```

---

## SPFx Constraints

- `HbcVersionBadge` and `HbcVersionHistory` are SPFx-compatible via `@hbc/ui-kit/app-shell`
- `HbcVersionDiff` is PWA-only — do not render it in SPFx webpart contexts
- Import from `@hbc/ui-kit/app-shell` for SPFx-constrained surfaces
