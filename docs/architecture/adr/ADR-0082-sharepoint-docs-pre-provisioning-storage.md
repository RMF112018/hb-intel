# ADR-0082: SharePoint Document Pre-Provisioning Storage Strategy

**Status:** Accepted
**Date:** 2026-03-08
**Deciders:** Product Owner interview (2026-03-08, 12 questions, all decisions locked)
**Phase:** SF01 — @hbc/sharepoint-docs
**Supersedes:** N/A
**Note on numbering:** ADR-0010 is occupied by `ADR-0010-ci-cd-pipeline.md` (Phase 8, 2026-03-03).
This ADR was originally referenced as ADR-0010 in SF01 plan files; the correct sequential
number is ADR-0082 (after ADR-0081-complexity-dial, created PH7.4R). All SF01 plan file
references corrected in PH7.7 — see PH7.7-SharePoint-Docs-Hardening.md Amendment E.

---

## Context

Multiple HB Intel modules (BD Scorecard, Estimating Pursuit) require document attachment
before a SharePoint project site has been provisioned. Without a structured staging strategy,
these documents would have no authoritative home, no permissions model, and no migration path
when the project site is eventually created.

The HB Intel root site collection (`VITE_HBINTEL_SITE_URL`) is available from day one of
any user's workflow and is therefore the correct staging ground. The 12 decisions below
govern exactly how documents are staged, migrated, and governed within it.

---

## Decisions

All 12 decisions were locked via structured product-owner interview (2026-03-08). They are
considered immutable for the lifetime of SF01; any change requires a superseding ADR.

### D-01: Move & Archive (tombstone .url files at source after migration)

Files are physically moved to the provisioned project site upon migration. A `.url` shortcut
file (Windows Internet Shortcut format) is written at the original staging location. The
shortcut's target URL points to the file's new location on the project site. This preserves
navigability from the staging folder without duplicating storage.

### D-02: Smart Auto scheduling — 10 PM–2 AM migration window with pre-notification

The system automatically schedules migrations within a nightly window (10 PM–2 AM local time,
controlled by Azure Function timer trigger `WEBSITE_TIME_ZONE`). A pre-notification is sent
to the record owner before the window opens. The scheduler uses `MigrationScheduler` (D-11
checkpoint resume for reliability).

### D-03: Informed Queue offline pattern with 50 MB cap and 48-hr TTL

The `OfflineQueueManager` holds uploads when the browser is offline. Maximum queued payload:
50 MB. Entries older than 48 hours are discarded with a user notification. The user is shown
a queue indicator when entries are pending.

### D-04: 3-tier permission model

Every staging folder receives three tiers of access:
- **Tier 1 (Contribute):** Record owner + explicit collaborators — full read/write.
- **Tier 2 (Read):** Department managers and directors — read-only across department staging.
- **Tier 3 (Read):** Company executives (VP+) — read-only across all staging areas.

Applied by `PermissionManager.applyDefaultPermissions()` at folder creation time. Custom
permissions override the default model when `IDocumentContextConfig.permissions` is set.

### D-05: BD + Estimating scope now; Project Hub extensibility designed in

Initial scope covers `bd-lead` and `estimating-pursuit` context types. The `DocumentContextType`
union and `getParentPath()` switch are designed for extension. `project` and `system` context
types are available for future use.

### D-06: Conflict Queue with 48-hr fallback to "project site wins"

If a filename conflict is detected at the migration destination, the conflict is registered in
`HBCDocumentRegistry` (status: `conflict`). The record owner has 48 hours to resolve it.
After 48 hours, the conflict auto-resolves in favour of the project site version (the staged
file is tombstoned without migrating). `ConflictDetector` and `ConflictResolver` implement this.

### D-07: Federated single registry list + companion MigrationLog

A single SharePoint list (`HBCDocumentRegistry`) is the authoritative record for all staged
documents across all modules. A companion list (`HBCMigrationLog`) tracks per-file migration
checkpoints (D-11). Both lists live on the HB Intel root site.

### D-08: Project Hub deferred — architecture extension point documented

Project Hub document management is explicitly out of scope for SF01. The `DocumentContextType`
union includes `'project'` as a reserved value; `FolderManager` handles it. Full Project Hub
integration is a future work item.

### D-09: SPFx inline default (lazy-loaded) + standalone webpart option

The `@hbc/sharepoint-docs` package exports SPFx-compatible entry points via
`@hbc/ui-kit/app-shell`. The document attachment panel is lazy-loaded inside SPFx webparts
(inline default). A standalone webpart option is available for scenarios requiring a dedicated
document management view.

### D-10: Broad allowlist; two-tier size system

- Files are allowed unless explicitly blocked (allowlist approach).
- Blocked: file extensions in `BLOCKED_EXTENSIONS`, MIME types in `BLOCKED_MIME_TYPES`.
- Standard limit: 250 MB — uploads above this require explicit user confirmation.
- Hard limit: 1 GB — uploads above this are rejected unconditionally.
- Files ≤4 MB use single-request upload; files >4 MB use chunked upload sessions.

### D-11: Checkpoint resume + escalating alerts (PM → Director after 3 failures)

`MigrationLogClient` tracks per-file checkpoints: `pending` → `in-progress` → `completed`
or `skipped-conflict`. On resume, only `pending` files are retried — guaranteeing exactly-once
migration semantics. After 3 consecutive migration failures for a context, the system escalates
from notifying the PM to notifying the Director.

### D-12: Folder naming: yyyymmdd_{SanitizedName}_{UploadingUserLastName}

Format: `yyyymmdd_{SanitizedName}_{UploadingUserLastName}`
- Date: record creation date at folder creation time, formatted `yyyymmdd`.
- SanitizedName: `contextLabel` with spaces → underscores, special chars stripped, max 80 chars.
- LastName: `ownerLastName` with diacritics normalized and non-alpha chars stripped, max 30 chars.
- Folder name is **immutable** after creation, even if the record is renamed in HB Intel.

---

## Consequences

- All modules handling pre-provisioning documents **must** use `@hbc/sharepoint-docs`. No
  per-module document storage implementations are permitted (Tier-1 platform primitive rule).
- `HBCDocumentRegistry` and `HBCMigrationLog` SharePoint lists must be provisioned on the
  HB Intel root site before any domain module deploys.
- Azure Function timer triggers are required: `processNightlyMigration` (cron `0 22 * * *`)
  and `resolveExpiredConflicts` (cron `0 * * * *`).
- `VITE_HBINTEL_SITE_URL` must be set in every environment before mounting
  `<SharePointDocsProvider>`. Validation is enforced by `assertHbIntelSiteUrl()` at the
  app composition root (added PH7.7).
- `MigrationService.getDefaultDestinationPath()` must remain unimplemented until
  `MigrationScheduler` provides context-type-based destination routing (PH7.7 Amendment B,
  LEAK 4). The destination path must be explicitly set on `IScheduledMigration`.

---

<!-- IMPLEMENTATION PROGRESS & NOTES
ADR-0082 created: 2026-03-09
Phase: PH7.7 (SharePoint Docs Boundary Cleanup & Config Hardening)
Corrects prior plan file references that used ADR-0010 (occupied by ci-cd-pipeline).
All 7 correction locations in SF01-T10-Deployment.md and SF01-Sharepoint-Docs.md
updated in PH7.7 — see PH7.7-SharePoint-Docs-Hardening.md Amendment E.
-->
