# SF-01: `@hbc/sharepoint-docs` — Implementation Summary

**Package:** `packages/sharepoint-docs/`
**Tier:** 1 — Foundation (must exist before any domain module begins)
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Spec source:** `docs/explanation/feature-decisions/PH7-SF-01-Shared-Feature-SharePoint-Docs.md`
**Evaluation source:** `docs/explanation/feature-decisions/PH7-Shared-Features-Evaluation.md`
**Plan version:** 1.0 — 2026-03-08
**Interview conducted:** 2026-03-08 (12-question structured product-owner interview — all decisions locked)
**Status:** Ready for implementation

---

## 1. Purpose & Problem Solved

`@hbc/sharepoint-docs` is the platform-wide document lifecycle management package. It solves a critical gap that would otherwise be solved inconsistently by every module independently: **how do documents get stored before a SharePoint project site exists?**

A BD Manager attaches an RFP to a Go/No-Go Scorecard on day one. No project has been provisioned. No SharePoint site exists. Without this package, that document has no defined home — it either gets lost, stored in a personal OneDrive, or placed in an ad-hoc folder that breaks when provisioning eventually runs.

This package provides:

- A structured pre-provisioning staging area in the HB Intel root site
- A consistent document attachment component with offline support
- An automated overnight migration service that moves documents into the provisioned project site
- A federated Document Registry for full lifecycle audit trail
- A tombstone pattern that keeps the staging folder navigable after migration
- A conflict resolution queue for filename collisions during migration
- SPFx-compatible components with lazy loading and a standalone webpart option

Every module that handles documents before or after provisioning uses this package. Building it once prevents architectural debt from accumulating across BD, Estimating, and Project Hub.

---

## 2. Locked Interview Decisions

All 12 decisions below are final. Any deviation requires a new interview and an updated ADR.

| # | Decision Topic | Locked Decision |
|---|---|---|
| D-01 | Post-migration source handling | **Move & Archive** — source file is moved to project site; original replaced with a tombstone placeholder file containing a clickable link to the migrated location |
| D-02 | Migration trigger | **Smart Auto with pre-notification** — migration is scheduled in the 10 PM–2 AM window by default; users receive a notification during business hours before migration runs; they may trigger immediately, reschedule, or pause |
| D-03 | Offline upload behavior | **Informed Queue** — files queued locally with a transparent status indicator; 50 MB queue cap; 48-hour queue retention; automatic sync on reconnect; user can manage and remove queued items |
| D-04 | Staging area permissions | **Structured Visibility (3-tier)** — record owner + explicit collaborators: full read/write on their folder; department managers/directors: read-only across all department staging folders; company executives (VP+): read-only across all staging areas; all others: no access |
| D-05 | Module scope | **BD + Estimating now; Project Hub deferred** — architecture designed for Option C (all-module) extensibility without a rewrite; Project Hub `IDocumentContext` implementations are a defined future extension point |
| D-06 | Filename collision handling | **Conflict Queue** — collisions detected during migration are surfaced in the migration summary notification; both Estimating PM and Project Manager are notified; unresolved conflicts fall back to "project site wins" after 48 hours; every resolution decision is logged |
| D-07 | Document Registry design | **Federated Single List** — one `HBCDocumentRegistry` list in the root HB Intel site, indexed on `ModuleType`, `RecordId`, `ProjectId`, `MigratedAt`; companion `HBCMigrationLog` list for migration-event writes only |
| D-08 | Project Hub scope | **Deferred** — no Project Hub `IDocumentContext` implementations in this phase; architecture supports them; documented as a named extension point |
| D-09 | SPFx surface | **Inline default + standalone webpart option** — document panel embedded inline in each record webpart, lazy-loaded on first interaction; same component also registered as `HBCDocumentManagerWebpart` for flexible page layouts; all SPFx imports use `@hbc/ui-kit/app-shell` |
| D-10 | File types and sizes | **Broad allowlist, two-tier size system** — all types except executables/scripts allowed; <250 MB: standard chunked upload; 250 MB–1 GB: user confirmation + progress reporting required; >1 GB: blocked with clear message; offline queue cap: 50 MB |
| D-11 | Failed migration retry | **Checkpoint resume + escalating alerts** — per-file state tracked in `HBCMigrationLog`; automatic backoff retries (30 min → 2 hrs → next night window); after 1st auto-retry fails: warning to Estimating PM + Project Manager; after 3 failures over 48 hrs: escalation to department Director + manual retry button surfaced in HB Intel |
| D-12 | Staging folder naming | **`yyyymmdd_{SanitizedName}_{UploadingUserLastName}`** — e.g., `20260308_Riverside-Medical-Center-Expansion_Martinez`; date-first for natural chronological sort; no record ID in folder name (registry is authoritative mapping); name sanitized (special chars stripped, spaces → underscores, truncated at 80 chars); folder name is stable even if record is renamed in HB Intel |

---

## 3. Architecture Overview

```
packages/sharepoint-docs/
├── package.json                          # @hbc/sharepoint-docs
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                          # Public barrel export
│   ├── types/
│   │   ├── IDocumentContext.ts           # Core context interface contract
│   │   ├── IUploadedDocument.ts          # Document record model
│   │   ├── IDocumentMigration.ts         # Migration config + result types
│   │   ├── IOfflineQueueEntry.ts         # Offline queue entry model
│   │   ├── IConflict.ts                  # Conflict queue entry model
│   │   ├── ITombstone.ts                 # Tombstone record model
│   │   ├── IMigrationCheckpoint.ts       # Per-file checkpoint state
│   │   └── index.ts
│   ├── constants/
│   │   ├── fileSizeLimits.ts             # SIZE_STANDARD, SIZE_CONFIRM, SIZE_MAX, SIZE_OFFLINE_MAX
│   │   ├── blockedExtensions.ts          # .exe, .bat, .cmd, .ps1, .sh, .vbs, .msi, .dll, .scr, .com
│   │   ├── migrationSchedule.ts          # WINDOW_START=22, WINDOW_END=2, CONFLICT_TTL_HRS=48
│   │   └── registryColumns.ts            # SharePoint list column name constants
│   ├── api/
│   │   ├── SharePointDocsApi.ts          # Graph API wrapper (folder CRUD, file upload sessions)
│   │   ├── FolderManager.ts              # Create/resolve context folders; naming; permissions
│   │   ├── PermissionManager.ts          # Apply 3-tier permission model to staging folders
│   │   ├── RegistryClient.ts             # Read/write HBCDocumentRegistry list
│   │   ├── MigrationLogClient.ts         # Read/write HBCMigrationLog list
│   │   ├── TombstoneWriter.ts            # Create tombstone .url files post-migration
│   │   └── ConflictDetector.ts           # Filename collision detection at migration time
│   ├── services/
│   │   ├── UploadService.ts              # Chunked upload engine; file validation; progress events
│   │   ├── OfflineQueueManager.ts        # Local queue; 50MB cap; 48hr TTL; sync-on-reconnect
│   │   ├── MigrationService.ts           # Checkpoint resume; tombstone; conflict queue; alerts
│   │   ├── MigrationScheduler.ts         # 10PM–2AM window; pre-notification; manual override
│   │   └── ConflictResolver.ts           # Conflict TTL watchdog; fallback "project site wins"
│   ├── hooks/
│   │   ├── useDocumentContext.ts         # Resolve/create context folder; return IDocumentContextConfig
│   │   ├── useDocumentUpload.ts          # Upload with progress, retry, offline fallback
│   │   ├── useDocumentList.ts            # List documents in a context; poll migration status
│   │   ├── useOfflineQueue.ts            # Expose queue state; add/remove/retry entries
│   │   └── useMigrationStatus.ts         # Poll migration log for a given contextId
│   └── components/
│       ├── HbcDocumentAttachment/
│       │   ├── HbcDocumentAttachment.tsx  # Drag-drop upload + file list + offline queue indicator
│       │   ├── DropZone.tsx               # Drop target with drag-over feedback
│       │   ├── UploadProgressRow.tsx      # Per-file progress bar + retry button
│       │   ├── LargeFileConfirmDialog.tsx # Confirmation modal for 250MB–1GB files
│       │   └── index.ts
│       ├── HbcDocumentList/
│       │   ├── HbcDocumentList.tsx        # Read-only file list with migration status badges
│       │   ├── TombstoneRow.tsx           # Renders tombstone entries with project site link
│       │   ├── MigrationStatusBadge.tsx   # Pending / Migrated / Conflict / Failed badges
│       │   └── index.ts
│       ├── HbcUploadQueue/
│       │   ├── HbcUploadQueue.tsx         # Offline queue status panel (persistent indicator)
│       │   ├── QueueEntry.tsx             # Individual queued file row with remove button
│       │   └── index.ts
│       ├── HbcConflictResolutionPanel/
│       │   ├── HbcConflictResolutionPanel.tsx  # List of conflicts with resolution buttons
│       │   ├── ConflictRow.tsx                 # Keep staging / Keep project / Keep both
│       │   └── index.ts
│       ├── HbcMigrationSummaryBanner.tsx  # Post-migration summary: migrated / skipped / conflicts
│       └── index.ts
```

---

## 4. Staging Area Structure in SharePoint

All pre-provisioning documents live in the HB Intel root site collection under the following structure. The `yyyymmdd_{SanitizedName}_{UploadingUserLastName}` folder naming convention is enforced by `FolderManager` at creation time.

```
/sites/hb-intel/Shared Documents/
├── BD Leads/
│   ├── 20260308_Riverside-Medical-Center-Expansion_Martinez/
│   │   ├── RFP/
│   │   ├── RFQ/
│   │   ├── ITB/
│   │   └── Supporting/
│   └── 20260115_HB-Corporate-HQ-Bid_Patel/
│       └── ...
├── Estimating Pursuits/
│   ├── 20260201_Downtown-Mixed-Use-Tower_Johnson/
│   │   ├── Bid Documents/
│   │   └── Supporting/
│   └── ...
└── System/
    └── (reserved for @hbc/data-seeding and system-level operations)
```

After migration, a tombstone `.url` file replaces each migrated document:

```
BD Leads/20260308_Riverside-Medical-Center-Expansion_Martinez/RFP/
  ├── 📄 Project-RFP-Final.pdf.migrated.url   ← tombstone (clickable link to project site)
  └── 📄 Addendum-1.pdf.migrated.url
```

---

## 5. SharePoint List Schema

### `HBCDocumentRegistry` (root HB Intel site)

Primary audit trail for all document lifecycle events. Indexed columns are marked ★.

| Column | Internal Name | Type | Description |
|---|---|---|---|
| ★ `ModuleType` | `HbcModuleType` | Choice | `bd-lead` · `estimating-pursuit` · `project` · `system` |
| ★ `RecordId` | `HbcRecordId` | Single line (indexed) | Owning record GUID (scorecard ID, pursuit ID, project ID) |
| ★ `ProjectId` | `HbcProjectId` | Single line (indexed) | Resolved project ID (null until provisioned) |
| `DocumentId` | `HbcDocumentId` | Single line | GUID primary key for this document entry |
| `FileName` | `HbcFileName` | Single line | Original file name at upload time |
| `SanitizedFolderName` | `HbcFolderName` | Single line | The `yyyymmdd_{Name}_{LastName}` folder name |
| `FileSize` | `HbcFileSize` | Number | File size in bytes |
| `MimeType` | `HbcMimeType` | Single line | MIME type string |
| `SharePointUrl` | `HbcSharePointUrl` | Hyperlink | Absolute URL to current document location |
| `StagingUrl` | `HbcStagingUrl` | Hyperlink | Original staging URL (preserved after migration) |
| `MigratedUrl` | `HbcMigratedUrl` | Hyperlink | Post-provisioning project site URL (null until migrated) |
| ★ `MigrationStatus` | `HbcMigrationStatus` | Choice (indexed) | `pending` · `scheduled` · `in-progress` · `migrated` · `conflict` · `failed` · `not-applicable` |
| `TombstoneUrl` | `HbcTombstoneUrl` | Hyperlink | URL of the tombstone .url file created post-migration |
| `ConflictResolution` | `HbcConflictResolution` | Choice | `keep-staging` · `keep-project` · `keep-both` · `pending` · `auto-project-site-wins` |
| `ConflictResolvedBy` | `HbcConflictResolvedBy` | Person | User who resolved the conflict (null if auto-resolved) |
| `UploadedBy` | `HbcUploadedBy` | Person | Uploader (the record creator at folder creation time) |
| ★ `UploadedAt` | `HbcUploadedAt` | Date/Time (indexed) | UTC timestamp of upload |
| `MigratedAt` | `HbcMigratedAt` | Date/Time | UTC timestamp of successful migration |
| `DisplayName` | `HbcDisplayName` | Single line | Current record display name (updated on rename; folder name is not changed) |

### `HBCMigrationLog` (root HB Intel site)

High-volume append-only log for migration saga events. Kept separate from the main registry to avoid list performance degradation.

| Column | Internal Name | Type | Description |
|---|---|---|---|
| `MigrationJobId` | `HbcJobId` | Single line | GUID for this migration batch |
| `RecordId` | `HbcRecordId` | Single line | Source record being migrated |
| `DocumentId` | `HbcDocumentId` | Single line | Document being processed |
| `FileCheckpoint` | `HbcCheckpoint` | Choice | `pending` · `in-progress` · `completed` · `failed` · `skipped-conflict` |
| `AttemptNumber` | `HbcAttemptNumber` | Number | 1 = first attempt; increments on retry |
| `AttemptedAt` | `HbcAttemptedAt` | Date/Time | Timestamp of this attempt |
| `ErrorMessage` | `HbcErrorMessage` | Multi-line | SharePoint/Graph API error message if failed |
| `ScheduledWindow` | `HbcScheduledWindow` | Single line | e.g., `2026-03-09T22:00–02:00` |
| `NotifiedPM` | `HbcNotifiedPM` | Yes/No | Whether the PM pre-notification was sent |
| `EscalatedToDirector` | `HbcEscalated` | Yes/No | Whether the 3-failure escalation was sent |

---

## 6. Integration Points

| Package | Integration Type | Direction | Details |
|---|---|---|---|
| `@hbc/workflow-handoff` (SF-08) | Document URL resolution | Bidirectional | Provides resolved `sharepointUrl` for handoff packages; receives `migratedUrl` updates post-migration so handoff links always resolve to canonical location |
| `@hbc/data-seeding` (SF-09) | Storage routing | Inbound | Seed file uploads routed to context-appropriate staging folders via `useDocumentContext` |
| `@hbc/related-items` (SF-14) | Document surfacing | Outbound | Attached documents appear as related items on any record that references them |
| `@hbc/notification-intelligence` (SF-10) | Event notifications | Outbound | Upload failures, migration pre-notifications, migration completions, conflict alerts, and escalation alerts registered as Digest-tier notifications |
| `@hbc/session-state` (SF-12) | Offline queue persistence | Bidirectional | Pending offline uploads persisted via session-state; queue restores on reconnect or browser restart |
| `PH9b useFormDraft` | Draft persistence | Outbound | Document upload state (pending, queued, completed) included in form draft persistence payload |
| `@hbc/complexity` (SF-03) | UI mode adaptation | Inbound | Essential mode: simplified drop zone only; Standard: full component; Expert: exposes folder path + raw SharePoint URL |
| Provisioning Saga | Migration trigger | Inbound | Saga calls `MigrationScheduler.schedule()` on project provisioning completion, passing source context IDs and destination site URL |
| `@hbc/auth` | User identity | Inbound | Uploading user's UPN and last name read from auth context for folder naming and permission assignment |

---

## 7. SPFx Constraints Summary

- All Graph API calls route through Azure Functions backend (`packages/api/`) — no direct Graph API calls from SPFx webparts
- File uploads via Graph API `createUploadSession` for files >4 MB (chunked)
- SPFx component imports must use `@hbc/ui-kit/app-shell` not `@hbc/ui-kit` (per CLAUDE.md §6.1)
- Document panel lazy-loaded in SPFx context — full document bundle only downloads on first panel open
- Standalone `HBCDocumentManagerWebpart` registered separately in SPFx manifest
- Folder creation uses Graph API calls compatible with `@microsoft/sp-http` context when running inside SharePoint

---

## 8. Effort Estimates

| Task File | Task Name | Estimated Effort |
|---|---|---|
| SF01-T01 | Package Scaffold | 0.5 sprint-weeks |
| SF01-T02 | TypeScript Contracts | 0.5 sprint-weeks |
| SF01-T03 | SharePoint Infrastructure | 0.5 sprint-weeks |
| SF01-T04 | Upload Service | 1.0 sprint-weeks |
| SF01-T05 | Migration Service | 1.5 sprint-weeks |
| SF01-T06 | React Hooks & Components | 1.0 sprint-weeks |
| SF01-T07 | SPFx Integration | 0.5 sprint-weeks |
| SF01-T08 | Offline Queue | 0.5 sprint-weeks |
| SF01-T09 | Testing Strategy | 1.0 sprint-weeks |
| SF01-T10 | Deployment | 0.25 sprint-weeks |
| **Total** | | **~7.25 sprint-weeks** |

> The original spec estimated 4–5 sprint-weeks. The additional ~2.25 sprint-weeks are attributable to the interview-confirmed scope additions: Move & Archive tombstone pattern (D-01), Smart Auto scheduling with pre-notification (D-02), Informed Queue with management UI (D-03), 3-tier permission model (D-04), Conflict Queue with resolution UI (D-06), Federated Registry with MigrationLog (D-07), two-tier file size system with large-file confirmation (D-10), and checkpoint resume with escalating alerts (D-11).

---

## 9. Implementation Phasing

### Wave 1 — Foundation (Weeks 1–3)
Build the skeleton and the two most critical services. All other packages can begin consuming this package once Wave 1 is complete.

- SF01-T01: Package Scaffold
- SF01-T02: TypeScript Contracts
- SF01-T03: SharePoint Infrastructure (list provisioning scripts)
- SF01-T04: Upload Service (chunked upload, file validation, folder naming)

### Wave 2 — Migration & Offline (Weeks 3–5)
Build the migration engine and offline queue. These are the highest-complexity components.

- SF01-T05: Migration Service (checkpoint resume, tombstone, conflict queue, scheduling, alerts)
- SF01-T08: Offline Queue (local queue, 50 MB cap, 48-hr TTL, sync-on-reconnect)

### Wave 3 — UI & Integration (Weeks 5–7)
Build the React components and hooks, then wire SPFx surfaces.

- SF01-T06: React Hooks & Components
- SF01-T07: SPFx Integration (inline + standalone webpart)

### Wave 4 — Testing & Deployment (Weeks 7–8)
Full test suite and deployment runbook.

- SF01-T09: Testing Strategy
- SF01-T10: Deployment

---

## 10. Definition of Done (Package Level)

- [ ] All TypeScript contracts exported from `packages/sharepoint-docs/src/index.ts`
- [ ] `FolderManager` creates BD lead and Estimating pursuit staging folders with `yyyymmdd_{SanitizedName}_{UploadingUserLastName}` naming
- [ ] 3-tier permission model applied automatically on folder creation
- [ ] `UploadService` handles chunked uploads for >4 MB; two-tier confirmation for >250 MB; hard block at >1 GB
- [ ] Offline queue with 50 MB cap, 48-hr TTL, automatic sync on reconnect
- [ ] `MigrationService` executes Move & Archive pattern: file moved, tombstone `.url` file created at source
- [ ] Migration scheduled in 10 PM–2 AM window with pre-notification to PM
- [ ] Checkpoint resume: failed migrations retry with backoff; per-file state in `HBCMigrationLog`
- [ ] Conflict Queue: filename collisions surface to PM + Estimating PM; 48-hr auto-resolution fallback
- [ ] Escalation: 3 retry failures trigger Director notification + manual retry button in HB Intel
- [ ] `HbcDocumentAttachment` renders correctly in Essential / Standard / Expert complexity modes
- [ ] `HbcConflictResolutionPanel` allows PM to resolve each conflict; decision logged
- [ ] `HBCDocumentRegistry` and `HBCMigrationLog` lists provisioned with correct schema and indexes
- [ ] Inline document panel lazy-loaded in SPFx webpart context
- [ ] Standalone `HBCDocumentManagerWebpart` registered and functional
- [ ] Unit tests ≥95% coverage on `FolderManager`, `UploadService`, `MigrationService`, `OfflineQueueManager`
- [ ] Playwright E2E: upload → offline queue → reconnect sync → migration → tombstone → conflict resolution
- [ ] ADR created: `docs/architecture/adr/0010-sharepoint-docs-pre-provisioning-storage.md`
- [ ] `pnpm turbo run build` passes with zero errors

---

## 11. Task File Index

| File | Contents |
|---|---|
| `SF01-T01-Package-Scaffold.md` | Directory structure, package.json, tsconfig, turbo pipeline, entry points |
| `SF01-T02-TypeScript-Contracts.md` | All interfaces, enums, type utilities — complete TypeScript source |
| `SF01-T03-SharePoint-Infrastructure.md` | List schemas, PnP provisioning scripts, permission setup, Azure AD group requirements |
| `SF01-T04-Upload-Service.md` | FolderManager, SharePointDocsApi, UploadService, PermissionManager, chunked upload |
| `SF01-T05-Migration-Service.md` | MigrationService, MigrationScheduler, TombstoneWriter, ConflictDetector, ConflictResolver, escalating alerts |
| `SF01-T06-React-Hooks-and-Components.md` | All hooks and all React components — complete source and prop specs |
| `SF01-T07-SPFx-Integration.md` | Inline webpart wiring, standalone webpart manifest, lazy loading, bundle analysis |
| `SF01-T08-Offline-Queue.md` | OfflineQueueManager, connectivity detection, local storage strategy, sync-on-reconnect |
| `SF01-T09-Testing-Strategy.md` | Vitest unit tests, Playwright E2E scenarios, coverage targets, mocking strategy |
| `SF01-T10-Deployment.md` | Pre-deployment checklist, list provisioning commands, Azure AD setup, verification protocol |

---

## 12. ADR Requirement

Create `docs/architecture/adr/0010-sharepoint-docs-pre-provisioning-storage.md` documenting:

- The decision to use a staging area in the root site collection (vs. per-record OneDrive, vs. Azure Blob Storage)
- The Move & Archive tombstone pattern (vs. copy-and-keep, vs. true delete)
- The federated single-list registry with companion MigrationLog (vs. per-module lists)
- The `yyyymmdd_{SanitizedName}_{UploadingUserLastName}` folder naming convention
- The 3-tier permission model
- The Smart Auto migration scheduling with 10 PM–2 AM default window
- The Conflict Queue pattern with 48-hour fallback

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan authored: 2026-03-08
Interview conducted: 2026-03-08 (12 questions, all decisions locked)
Wave 1 status: In progress
  - SF01-T01 Package Scaffold: COMPLETE (2026-03-08)
    - 51 new files created, 2 existing files modified
    - All verification commands pass (typecheck, build, test, turbo build)
  - SF01-T02 TypeScript Contracts: COMPLETE (2026-03-08)
    - 12 files replaced: 7 type stubs + 1 type barrel + 4 constant stubs
    - Added registryColumns.ts export to src/index.ts barrel
    - All verification commands pass (typecheck, build, turbo build — 25/25 tasks green)
  - SF01-T03 SharePoint Infrastructure: COMPLETE (2026-03-08)
    - 9 new files created in packages/sharepoint-docs/infrastructure/
    - 5 PowerShell scripts, 2 PnP XML templates, 1 JSON config, 1 README
    - All verification commands pass (typecheck, build, turbo build — 25/25 tasks green)
  - SF01-T04 Upload Service: COMPLETE (2026-03-08)
    - 5 stub files replaced with full implementations
    - 3 plan code-block issues fixed (named args, fullControlGroups, uuid)
    - 2 additional TypeScript type fixes applied
    - All verification commands pass (typecheck, build, turbo build — 25/25 tasks green)
Documentation added: docs/architecture/plans/shared-features/SF01-Sharepoint-Docs.md
ADR required: docs/architecture/adr/0010-sharepoint-docs-pre-provisioning-storage.md
Wave 2 status: In progress
  - SF01-T05 Migration Service: COMPLETE (2026-03-08)
    - 6 stub files replaced with full implementations + 2 methods added to RegistryClient
    - 4 plan code-block issues fixed (uuid→crypto.randomUUID, pendingDocs type, missing methods, IConflictResolution typing)
    - All verification commands pass (typecheck, build, turbo build — 25/25 tasks green)
Wave 3 status: In progress
  - SF01-T06 React Hooks & Components: COMPLETE (2026-03-08)
    - 2 new files created (internal hooks: useSharePointDocsServices, useNetworkStatus)
    - 21 files modified (1 API method, 5 hooks, 11 components, 1 barrel, 2 plan docs)
    - 8 gaps fixed: missing internal dir, getJobByContextId, useOfflineQueue placeholder,
      HbcUploadQueue/QueueEntry stubs, TombstoneRow, UploadProgressRow, refetchInterval x2
    - All verification commands pass (typecheck, build, turbo build — 25/25 tasks green)
Next: SF01-T07 (SPFx Integration, Wave 3) or SF01-T08 (Offline Queue, Wave 2)
-->
