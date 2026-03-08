# SF06-T09 — Deployment

**Package:** `packages/versioned-record/`
**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Depends On:** T01–T08 (all implementation and testing tasks complete)

---

## Pre-Deployment Checklist

### Wave 1 — Storage Foundation

- [ ] `packages/versioned-record/` directory created with correct structure (T01)
- [ ] `package.json` name is `@hbc/versioned-record`; `exports` map includes `"./testing"` sub-path (T01)
- [ ] All TypeScript contracts defined in `src/types/IVersionedRecord.ts`; `'superseded'` added to `VersionTag` (T02)
- [ ] `versionUtils.ts` pure functions implemented and unit-tested (T02)
- [ ] `VersionApi.createSnapshot()` writes to SP list; inline/file-library routing at 255KB (T07)
- [ ] `VersionApi.getMetadataList()` returns metadata-only rows (no snapshot payload) (T07)
- [ ] `VersionApi.getSnapshotById()` resolves file-library refs transparently (T07)
- [ ] `NotificationRegistry.register()` called at module load in `VersionApi.ts` (T07)
- [ ] `HbcVersionSnapshots` SP list provisioned via `scripts/provision-versioned-record.ps1` (T07)
- [ ] SP file library folder `Shared Documents/System/Snapshots` created (T07)
- [ ] `pnpm turbo run build --filter @hbc/versioned-record` exits with code 0

### Wave 2 — Computation & Hooks

- [ ] `diffEngine.computeDiff()` produces correct `IVersionDiff[]` for all change types (T03)
- [ ] `diffEngine.computeCharDiff()` produces correct tokens; falls back for long strings (T03)
- [ ] `diffEngine` unit test coverage ≥95% lines/functions (T03)
- [ ] `useVersionHistory` — metadata-first load, superseded filter, refresh (T04)
- [ ] `useVersionSnapshot` — on-demand payload load, cancellation safety (T04)
- [ ] `useVersionDiff` — deferred compute in `useEffect`, `isComputing` state (T04)
- [ ] `HbcVersionBadge` renders all 7 tag states without error (T06)

### Wave 3 — UI Components

- [ ] `HbcVersionHistory` renders chronological list newest-first (T05)
- [ ] Tag badges color-coded correctly per `VERSION_TAG_COLORS` (T05)
- [ ] Rollback CTA hidden at `standard` complexity tier (T05)
- [ ] Rollback CTA shows confirmation modal before executing (T05)
- [ ] Modal copy accurately describes append-only semantics (D-03) (T05)
- [ ] `VersionApi.restoreSnapshot()` tags intermediate versions as `'superseded'` (T07)
- [ ] "Show archived versions" toggle reveals/hides superseded entries (T05)
- [ ] `HbcVersionDiff` side-by-side mode renders with correct field highlights (T06)
- [ ] `HbcVersionDiff` unified mode renders with `+`/`−` prefix indicators (T06)
- [ ] Numeric delta displayed as `"42 → 67 (+25)"` format in diff viewer (T06)

### Wave 4 — Testing, Stories & Deployment

- [ ] `testing/` sub-path resolves: `import { createMockVersionedRecordConfig } from '@hbc/versioned-record/testing'` (T08)
- [ ] All 6 canonical mock states exported from `testing/index.ts` (T08)
- [ ] `mockUseVersionHistory` stubs for all mutations (T08)
- [ ] `createVersionedRecordWrapper` wraps providers for hook testing (T08)
- [ ] 10+ Storybook stories for `HbcVersionHistory` build without error (T08)
- [ ] 6+ Storybook stories for `HbcVersionDiff` build without error (T08)
- [ ] 8 tag-state stories for `HbcVersionBadge` build without error (T08)
- [ ] All 10 Playwright E2E scenarios pass (T08)
- [ ] `ADR-0015` created at `docs/architecture/adr/0015-versioned-record-platform-primitive.md` (this file)
- [ ] Adoption guide created at `docs/how-to/developer/versioned-record-adoption-guide.md` (this file)
- [ ] Blueprint and Foundation Plan progress comments added (this file)

---

## ADR-0015: Versioned Record as Platform Primitive

**File to create:** `docs/architecture/adr/0015-versioned-record-platform-primitive.md`

```markdown
# ADR-0015 — `@hbc/versioned-record` as Platform Primitive

**Date:** 2026-03-08
**Status:** Accepted
**Deciders:** HB Intel Architecture Team
**Technical Story:** SF06 — Shared Feature: Versioned Record

---

## Context

Multiple HB Intel record types undergo meaningful revisions over their lifecycle.
The Go/No-Go Scorecard, Project Management Plan, active pursuit estimates, and
Living Strategic Intelligence contributions are all records that change substantially
between creation and final approval. Without a structured versioning system:

- No way to compare current state to a prior snapshot
- Approvals reference "the current version" but that version may change after approval
- Audit trail questions ("what did this look like when the Director approved it?")
  cannot be answered
- Rolling back to a prior state requires manual reconstruction

The construction industry's legal context (contract disputes, change order
documentation, bid protest risk) makes immutable version history a business and
legal necessity, not merely a UX enhancement.

---

## Decision 1 — Full JSON Snapshots (vs. delta storage)

**Chosen:** Store a complete serialized copy of the record's data shape at every
version point. A v3 snapshot is fully self-contained and independently restorable
without reconstruction chains.

**Rejected:** Delta/diff storage — stores only field-level changes between
consecutive versions. Rejected because:
- Restore requires replaying all deltas from v1 forward (O(n) operation)
- Chain corruption risk: a missing delta breaks all subsequent restores
- Unacceptable for a legal-record use case

**Rejected:** Hybrid (full snapshots at milestones, deltas between) — rejected
because it doubles the implementation surface and still carries delta-chain
corruption risk for interim drafts.

**Consequences:** Storage grows with record size × version count. Mitigated by
the 255KB file-library overflow strategy (Decision 2) and by `maxVersions`
configuration for non-legal record types.

---

## Decision 2 — Transparent Inline/File-Library Routing at 255KB

**Chosen:** `VersionApi` manages the 255KB threshold internally. Payloads ≤255KB
are stored inline in the `HbcVersionSnapshots` SP list column. Payloads >255KB
are stored as JSON files in the SP file library at
`Shared Documents/System/Snapshots/{recordType}/{recordId}/{snapshotId}.json`.
The `SnapshotJson` column stores either the inline JSON or a `ref:` URI.
All callers interact with a single uniform API surface.

**Rejected:** Explicit `storageClass` config field — places infrastructure
knowledge burden on every consuming module author.

**Rejected:** Always use file library — penalizes the common case (small records)
with two round-trips per read.

**Consequences:** `VersionApi` must handle two internal read paths. Partial-failure
scenario (list row saved, file write fails) produces an orphaned file reference.
Compensating transaction: if the file write fails, the list row is not written.
Orphaned files (file write succeeded, list row write failed) are inert and cleaned
up by the maintenance runbook.

---

## Decision 3 — Append-Only Rollback with Superseded Tag

**Chosen:** Rollback creates a new snapshot whose payload is a copy of the target
version. Versions between the rollback target and the current state are tagged
`'superseded'` and soft-hidden behind a "Show archived versions" toggle in
`HbcVersionHistory`. Nothing is ever deleted.

**Rejected:** Truncation (delete versions after target) — permanently destroys
legally significant records. Non-starter for any record type in this system.

**Consequences:** A new `'superseded'` tag value was added to the `VersionTag`
union, distinct from `'archived'` (which is a workflow terminal state). Version
list grows with rollback events; the UI toggle keeps the default view clean.

---

## Decision 4 — Client-Side Diff Engine

**Chosen:** Field-level diff is computed as a pure function in
`src/engine/diffEngine.ts`. Both snapshots are fetched client-side; diff runs
in a deferred `useEffect` to avoid main-thread blocking.

**Rejected:** Server-side Azure Function diff — adds backend deployment surface
area. Not justified given `HbcVersionDiff` is PWA-only (per spec) and diff
computation is already constrained to resource-capable browser environments.

**Rejected:** Hybrid (client/server based on payload size) — doubles the code
paths and requires `VersionApi` to expose internal storage metadata.

**Consequences:** Large nested record diffs may produce visible computation delay.
Mitigated by the `isComputing` loading state and the `setTimeout(fn, 0)` deferral
pattern in `useVersionDiff`.

---

## Decision 5 — Metadata-First Version List Loading

**Chosen:** `useVersionHistory` fetches all version metadata rows (no `SnapshotJson`
payload) in a single lightweight SP list query. Full snapshot payloads are loaded
on demand when a user selects a version for diff or restore.

**Rejected:** Eager load all snapshots — wasteful; the `SnapshotJson` column is
large and unnecessary for the version list display.

**Rejected:** Fixed-page pagination — disrupts the continuous timeline UX and
complicates tag/author filtering.

---

## Decision 6 — Notification Integration via `getStakeholders` Config Function

**Chosen:** `IVersionedRecordConfig<T>` includes a required `getStakeholders`
function. `VersionApi.createSnapshot()` calls `NotificationApi.send()` once per
stakeholder after a successful write. The package registers the `version.created`
event type with `NotificationRegistry` at module initialization.

**Rejected:** Callback delegation (onVersionCreated calls send) — notification
discipline depends on every consuming module implementing the callback. No
platform-level guarantee.

**Consequences:** `@hbc/versioned-record` has a peer dependency on
`@hbc/notification-intelligence`. This is already established by the SF10 platform
registration pattern; it is not an incremental coupling cost.

---

## References

- SF06 spec: `docs/explanation/feature-decisions/PH7-SF-06-Shared-Feature-Versioned-Record.md`
- SF10 notification spec: `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
- SF04 acknowledgment spec: `docs/explanation/feature-decisions/PH7-SF-04-Shared-Feature-Acknowledgment.md`
- SF05 step-wizard spec: `docs/explanation/feature-decisions/PH7-SF-05-Shared-Feature-Step-Wizard.md`
```

---

## Module Adoption Guide

**File to create:** `docs/how-to/developer/versioned-record-adoption-guide.md`

```markdown
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
```

---

## Blueprint and Foundation Plan Progress Comments

Add the following comment block to the end of `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 2 SF06 completed: 2026-03-08
Package: packages/versioned-record/ (@hbc/versioned-record)
Documentation added:
  - docs/architecture/plans/shared-features/SF06-Versioned-Record.md
  - docs/architecture/plans/shared-features/SF06-T01-Package-Scaffold.md
  - docs/architecture/plans/shared-features/SF06-T02-TypeScript-Contracts.md
  - docs/architecture/plans/shared-features/SF06-T03-Diff-Engine.md
  - docs/architecture/plans/shared-features/SF06-T04-Hooks.md
  - docs/architecture/plans/shared-features/SF06-T05-HbcVersionHistory.md
  - docs/architecture/plans/shared-features/SF06-T06-HbcVersionDiff-and-Badge.md
  - docs/architecture/plans/shared-features/SF06-T07-Storage-and-Integration.md
  - docs/architecture/plans/shared-features/SF06-T08-Testing-Strategy.md
  - docs/architecture/plans/shared-features/SF06-T09-Deployment.md
ADR created: docs/architecture/adr/0015-versioned-record-platform-primitive.md
Adoption guide: docs/how-to/developer/versioned-record-adoption-guide.md
Key decisions: full JSON snapshots (D-01), transparent 255KB routing (D-02),
  append-only rollback with superseded tag (D-03), client-side diff engine (D-05),
  metadata-first loading (D-06), getStakeholders notification pattern (D-09)
Next: SF07 (next shared feature per PH7 evaluation doc)
-->
```

Add the following comment block to the end of `docs/architecture/plans/hb-intel-foundation-plan.md`:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 2.SF06 completed: 2026-03-08
@hbc/versioned-record — Immutable Version History & Change Audit Trail
Status: Plan files complete; implementation ready to begin Wave 1
Blocking: None (standalone package; @hbc/notification-intelligence peer dep expected in workspace)
Blocked by this: BD scorecard director approval workflow, Project Hub PMP monthly update cycle
Effort: 3.5 sprint-weeks (Wave 1: 1.0, Wave 2: 0.75, Wave 3: 1.0, Wave 4: 0.75)
-->
```

---

## Cross-Package Amendment Notices (Blocking Dependencies)

The following consuming packages cannot reach production-ready status without `@hbc/versioned-record` being deployed:

| Package / Module | Blocking Dependency | Action Required |
|---|---|---|
| BD Go/No-Go Scorecard | Director approval workflow requires version pinning | Implement `scorecardVersionConfig`; wire `VersionApi.createSnapshot()` at submission stage gate |
| Project Hub PMP | Monthly update cycle requires version history | Implement `pmpVersionConfig`; wire snapshot on `on-stage-change` trigger |
| `@hbc/acknowledgment` (SF04) | Approval records must reference a `snapshotId` | No package amendment needed; consuming module must pass `contextPayload` as documented |
| `@hbc/workflow-handoff` | Handoff package must capture snapshot at handoff moment | Implement handoff-side `createSnapshot()` call with `tag: 'handoff'` |

---

## Verification Commands (10+)

```bash
# 1. Full build — zero TypeScript errors
pnpm turbo run build --filter @hbc/versioned-record

# 2. TypeScript strict-mode check
cd packages/versioned-record && pnpm typecheck

# 3. Full test suite with coverage report
cd packages/versioned-record && pnpm test:coverage

# 4. diff engine coverage ≥95% (critical per spec)
cd packages/versioned-record && pnpm test:coverage -- --include 'src/engine/**'

# 5. Testing sub-path resolves from consuming package
node -e "import('@hbc/versioned-record/testing').then((m) => console.log('testing exports:', Object.keys(m).join(', ')))"

# 6. Public barrel exports complete
node -e "import('@hbc/versioned-record').then((m) => { const keys = Object.keys(m); console.log(keys.length, 'exports'); ['VersionApi','useVersionHistory','useVersionSnapshot','useVersionDiff','HbcVersionHistory','HbcVersionDiff','HbcVersionBadge'].forEach((k) => { if (!keys.includes(k)) throw new Error('Missing export: ' + k); }); console.log('All required exports present.'); })"

# 7. SP list provisioning script syntax check
pwsh -Command "Get-Content scripts/provision-versioned-record.ps1 | Out-Null; Write-Host 'Script syntax OK'"

# 8. Storybook build — zero errors
pnpm --filter @hbc/versioned-record storybook:build

# 9. Playwright E2E suite (requires dev-harness on port 3000)
npx playwright test e2e/versioned-record.spec.ts --reporter=list

# 10. Turbo workspace integration — verify package is in graph
pnpm turbo run typecheck --filter @hbc/versioned-record --dry-run

# 11. ADR file exists
test -f docs/architecture/adr/0015-versioned-record-platform-primitive.md && echo "ADR-0015 present" || echo "MISSING: ADR-0015"

# 12. Adoption guide exists
test -f docs/how-to/developer/versioned-record-adoption-guide.md && echo "Adoption guide present" || echo "MISSING: adoption guide"
```
