# PH7-SF-06: `@hbc/versioned-record` — Immutable Version History & Change Audit Trail

**Priority Tier:** 1 — Foundation (must exist before any record type needs revision history)
**Package:** `packages/versioned-record/`
**Interview Decision:** Q5 — Option B confirmed
**Mold Breaker Source:** UX-MB §12 (Implementation Truth Layer); ux-mold-breaker.md Signature Solution #12; con-tech-ux-study §9 (Audit Trail gaps)

---

## Problem Solved

Multiple HB Intel records undergo meaningful revisions over their lifecycle — the Go/No-Go Scorecard is revised as market intelligence improves, the Project Management Plan is updated as project conditions change, estimates are revised as scope evolves. Without a structured versioning system:

- There is no way to compare current state to a prior snapshot
- Approvals reference "the current version" but that version may have changed after approval
- Audit trail questions ("what did this look like when the Director approved it?") cannot be answered
- Rolling back to a prior state requires manual reconstruction

**Confirmed Phase 7 use cases:**
- Go/No-Go Scorecard: each submission cycle creates a version snapshot; Director approval is pinned to a specific version
- Project Management Plan: each monthly update creates a reviewable version
- Estimating pursuits: bid revisions tracked as versions
- Living Strategic Intelligence contributions: each contribution recorded as a versioned entry

The construction industry's competitive context (contract disputes, change order documentation, bid protest risk) makes immutable version history not just a UX feature but a legal and business necessity.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #12 (Implementation Truth Layer) specifies: "Every decision, approval, and status change is permanently recorded with authorship, timestamp, and context." Operating Principle §7.6 (Transparency) requires that the system surface not just current state but the history of how it arrived at that state.

The con-tech UX study §9 identifies audit trail depth as a consistent weakness across all evaluated platforms — Procore's RFI and submittal history is strong, but version history on first-party records (cost events, contract items) is shallow and non-comparative.

`@hbc/versioned-record` makes deep, comparable version history a platform-wide primitive at zero incremental cost per adopting module.

---

## Applicable Modules

| Module | Record Type | Versioning Trigger |
|---|---|---|
| Business Development | Go/No-Go Scorecard | Each director review submission |
| Business Development | Living Strategic Intelligence | Each approved contribution |
| Project Hub | Project Management Plan (PMP) | Each monthly update cycle |
| Project Hub | Turnover Meeting package | Finalization (single version, immutable) |
| Estimating | Active Pursuit | Each bid revision |
| `@hbc/workflow-handoff` | Handoff package | Each handoff event (captures state at handoff moment) |

---

## Interface Contract

```typescript
// packages/versioned-record/src/types/IVersionedRecord.ts

export interface IVersionSnapshot<T> {
  /** Auto-incremented version number (v1, v2, ...) */
  version: number;
  /** ISO 8601 timestamp */
  createdAt: string;
  /** User who created this version */
  createdBy: IBicOwner;
  /** Human-readable change summary (provided by author or auto-generated) */
  changeSummary: string;
  /** Optional tag: 'draft' | 'submitted' | 'approved' | 'rejected' | 'archived' */
  tag?: VersionTag;
  /** Full serialized snapshot of the record at this version */
  snapshot: T;
}

export type VersionTag = 'draft' | 'submitted' | 'approved' | 'rejected' | 'archived' | 'handoff';

export interface IVersionedRecordConfig<T> {
  /** Unique record type identifier (used as namespace in storage) */
  recordType: string;
  /** Version creation triggers */
  triggers: VersionTrigger[];
  /** Function to generate a change summary from two snapshots */
  generateChangeSummary?: (previous: T | null, current: T) => string;
  /** Fields to exclude from snapshot (e.g., UI-only state) */
  excludeFields?: Array<keyof T>;
  /** Maximum versions to retain (older purged); 0 = unlimited */
  maxVersions?: number;
}

export type VersionTrigger =
  | 'on-submit'
  | 'on-approve'
  | 'on-reject'
  | 'on-handoff'
  | 'on-explicit-save'
  | 'on-stage-change';

export interface IVersionDiff {
  fieldName: string;
  label: string;
  previousValue: string;
  currentValue: string;
  changeType: 'added' | 'removed' | 'modified';
}
```

---

## Package Architecture

```
packages/versioned-record/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IVersionedRecord.ts
│   │   └── index.ts
│   ├── api/
│   │   └── VersionApi.ts                 # CRUD for version snapshots
│   ├── hooks/
│   │   ├── useVersionHistory.ts          # loads version list for a record
│   │   ├── useVersionSnapshot.ts         # loads a specific version's snapshot
│   │   └── useVersionDiff.ts             # computes field-level diff between two versions
│   └── components/
│       ├── HbcVersionHistory.tsx         # version list sidebar panel
│       ├── HbcVersionDiff.tsx            # side-by-side field diff viewer
│       ├── HbcVersionBadge.tsx           # current version badge for record headers
│       └── index.ts
```

---

## Component Specifications

### `HbcVersionHistory` — Version List Panel

A collapsible sidebar panel showing the complete version history for a record.

```typescript
interface HbcVersionHistoryProps<T> {
  recordType: string;
  recordId: string;
  config: IVersionedRecordConfig<T>;
  /** Called when user selects a version to view */
  onVersionSelect?: (version: IVersionSnapshot<T>) => void;
  /** Whether to allow rolling back to a selected version */
  allowRollback?: boolean;
  onRollback?: (version: IVersionSnapshot<T>) => void;
}
```

**Visual behavior:**
- Chronological list (newest first) of version entries
- Each entry: version number (v1, v2...), tag badge, author avatar + name, timestamp (relative + absolute on hover), change summary
- Tag badges color-coded: Approved → green; Rejected → red; Draft → grey; Submitted → blue; Handoff → purple
- Clicking an entry opens `HbcVersionDiff` comparing that version to the next (or to current)
- Rollback CTA (if `allowRollback`): opens confirmation modal before restoring

### `HbcVersionDiff` — Side-by-Side Field Diff

```typescript
interface HbcVersionDiffProps<T> {
  recordType: string;
  recordId: string;
  versionA: number;
  versionB: number;
  config: IVersionedRecordConfig<T>;
  /** Display mode: side-by-side or unified (like git diff) */
  diffMode?: 'side-by-side' | 'unified';
}
```

**Visual behavior:**
- Two-column layout: Version A (left) vs Version B (right)
- Changed fields highlighted: additions in green, removals in red, modifications in amber
- Unchanged fields rendered in muted grey (collapsible)
- Numeric fields show delta: "42 → 67 (+25)"
- Text fields show character-level diff highlighting

### `HbcVersionBadge` — Record Header Badge

```typescript
interface HbcVersionBadgeProps {
  currentVersion: number;
  currentTag?: VersionTag;
  onClick?: () => void; // Opens version history panel
}
```

**Visual behavior:**
- Compact chip: "v3 · Approved" or "v2 · Draft"
- Clicking opens the `HbcVersionHistory` panel

---

## Storage Architecture

Version snapshots are stored in a SharePoint list `HbcVersionSnapshots` in the root site collection:

| Column | Type | Description |
|---|---|---|
| `SnapshotId` | Single line | GUID — primary key |
| `RecordType` | Choice | Namespace (e.g., `bd-scorecard`, `project-pmp`) |
| `RecordId` | Single line | ID of the parent record |
| `Version` | Number | Auto-incremented per RecordId |
| `Tag` | Choice | `draft` / `submitted` / `approved` / `rejected` / `archived` / `handoff` |
| `ChangeSummary` | Multiple lines | Human or auto-generated summary |
| `CreatedBy` | Person | Author |
| `CreatedAt` | Date/Time | UTC timestamp |
| `SnapshotJson` | Multiple lines | Full JSON snapshot (may be chunked for large records) |

For large snapshots (>255KB), the JSON is stored as a SharePoint file in `sites/hb-intel/Shared Documents/System/Snapshots/`.

---

## Module Adoption Guide

**Step 1: Define versioning config**
```typescript
import { IVersionedRecordConfig } from '@hbc/versioned-record';
import { IGoNoGoScorecard } from '../types';

export const scorecardVersionConfig: IVersionedRecordConfig<IGoNoGoScorecard> = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit', 'on-approve', 'on-reject'],
  generateChangeSummary: (prev, current) => {
    if (!prev) return 'Initial version';
    const scoreChange = current.totalScore - prev.totalScore;
    return `Score updated from ${prev.totalScore} to ${current.totalScore} (${scoreChange > 0 ? '+' : ''}${scoreChange})`;
  },
  excludeFields: ['isDirty', 'localDraftId'],
  maxVersions: 0, // unlimited — legal record
};
```

**Step 2: Trigger a version snapshot**
```typescript
import { VersionApi } from '@hbc/versioned-record';

// On scorecard submission
await VersionApi.createSnapshot({
  recordType: 'bd-scorecard',
  recordId: scorecard.id,
  config: scorecardVersionConfig,
  snapshot: scorecard,
  tag: 'submitted',
  changeSummary: `Submitted for director review by ${currentUser.displayName}`,
  createdBy: { userId: currentUser.id, displayName: currentUser.displayName, role: currentUser.role },
});
```

**Step 3: Render version history in detail view**
```typescript
import { HbcVersionHistory, HbcVersionBadge } from '@hbc/versioned-record';

// In the record header
<HbcVersionBadge
  currentVersion={scorecard.currentVersion}
  currentTag={scorecard.currentVersionTag}
  onClick={() => setVersionPanelOpen(true)}
/>

// Version history panel
<HbcVersionHistory
  recordType="bd-scorecard"
  recordId={scorecard.id}
  config={scorecardVersionConfig}
  allowRollback={currentUser.role === 'Director of Preconstruction'}
/>
```

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/workflow-handoff` | Handoff events capture a version snapshot of the record at handoff moment; handoff package links to that specific version |
| `@hbc/acknowledgment` | Approval acknowledgments are pinned to a specific version number; audit trail shows "Approved v2 on [date]" |
| `@hbc/complexity` | Essential: version badge only; Standard: version history panel; Expert: full diff viewer with rollback |
| `@hbc/notification-intelligence` | New version creation → Digest-tier notification to record stakeholders |
| `@hbc/search` | Version history is searchable by tag, author, and date range |

---

## SPFx Constraints

- `HbcVersionDiff` is PWA-only (too complex for SPFx webpart context)
- `HbcVersionHistory` and `HbcVersionBadge` are SPFx-compatible via `@hbc/ui-kit/app-shell`
- Snapshot API calls route through Azure Functions backend — no direct SharePoint list writes from webparts

---

## Priority & ROI

**Priority:** P0 — Required before BD scorecard director approval workflow and Project Hub PMP monthly update cycle can be considered production-ready; legal necessity for construction records
**Estimated build effort:** 3–4 sprint-weeks (API, three components, diff engine, storage schema)
**ROI:** Provides legally defensible audit trail for all critical records; eliminates need for manual version tracking in email; enables "what did it look like when?" questions that currently cannot be answered

---

## Definition of Done

- [ ] `IVersionedRecordConfig<T>` contract defined and exported
- [ ] `VersionApi.createSnapshot()` stores immutable snapshot with correct tag
- [ ] `useVersionHistory` loads paginated version list for a record
- [ ] `useVersionSnapshot` loads a specific version's full snapshot
- [ ] `useVersionDiff` computes field-level diff between two version numbers
- [ ] `HbcVersionHistory` renders chronological version list with tag badges
- [ ] `HbcVersionDiff` renders side-by-side and unified diff modes
- [ ] `HbcVersionBadge` renders current version chip in record headers
- [ ] `HbcVersionSnapshots` SharePoint list deployed via setup script
- [ ] Large snapshot handling: JSON files stored in SharePoint file library when >255KB
- [ ] Rollback: confirmation modal + audit event logged
- [ ] `@hbc/acknowledgment` integration: approval events pinned to version number
- [ ] `@hbc/complexity` integration verified
- [ ] Unit tests ≥95% on diff engine (field-level comparison logic)
- [ ] Storybook: version list, diff viewer, badge in all tag states

---

## ADR Reference

Create `docs/architecture/adr/0015-versioned-record-platform-primitive.md` documenting the decision to store full JSON snapshots rather than field-level deltas, the SharePoint list storage strategy, the large-snapshot file storage fallback, and the legal rationale for unlimited version retention on BD and Project Hub records.
