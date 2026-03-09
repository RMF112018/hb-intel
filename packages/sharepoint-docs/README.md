# @hbc/sharepoint-docs

**Version:** 0.1.0
**Status:** Tier-1 Platform Primitive
**Phase:** PH7.4 — Shared-Feature Tier-1 Normalization

---

## Purpose

`@hbc/sharepoint-docs` is the platform-wide document lifecycle management primitive for HB Intel. It wraps Microsoft Graph document operations into a unified lifecycle covering:

- **Pre-provisioning staging** — queue documents before SharePoint sites exist
- **Upload** — managed file upload with size/extension validation
- **Migration** — scheduled document migration with checkpoint tracking
- **Offline queue** — offline-first document operations with sync-on-reconnect
- **Conflict resolution** — detect and resolve concurrent edits
- **Folder management** — create and manage SharePoint folder structures
- **Permission management** — document-level permission control

Any feature that creates, reads, uploads, or manages SharePoint-hosted documents **must** use this package rather than implementing local Graph API calls.

---

## Concern Area

Document lifecycle management: upload, listing, offline queue, migration tracking, conflict resolution, folder management, permission management.

---

## Installation

```bash
pnpm add @hbc/sharepoint-docs
```

### Peer Dependencies

- `react` ^18.3.0
- `react-dom` ^18.3.0

### Internal Dependencies

- `@hbc/auth` — authentication context for Graph API calls
- `@hbc/models` — shared TypeScript data contracts
- `@hbc/data-access` — ports/adapters data layer
- `@hbc/ui-kit` — design system components

---

## Quick Start

### 1. Wrap your feature with the provider

```tsx
import { SharePointDocsProvider } from '@hbc/sharepoint-docs';

function MyFeature() {
  return (
    <SharePointDocsProvider>
      <DocumentSection />
    </SharePointDocsProvider>
  );
}
```

### 2. Use hooks to interact with documents

```tsx
import {
  useDocumentUpload,
  useDocumentList,
  useDocumentContext,
} from '@hbc/sharepoint-docs';

function DocumentSection() {
  const { documents } = useDocumentList();
  const { upload, isUploading } = useDocumentUpload();

  return (
    <div>
      <HbcDocumentList documents={documents} />
      <button onClick={() => upload(file)} disabled={isUploading}>
        Upload
      </button>
    </div>
  );
}
```

### 3. Use pre-built components

```tsx
import {
  HbcDocumentAttachment,
  HbcDocumentList,
  HbcUploadQueue,
  HbcConflictResolutionPanel,
  HbcMigrationSummaryBanner,
} from '@hbc/sharepoint-docs';
```

---

## Public API

### Types

All types are exported from the package root:

- `IDocumentContext` — provider context shape
- `IUploadedDocument` — uploaded document metadata
- `IDocumentMigration` — migration record
- `IMigrationCheckpoint` — migration progress checkpoint
- `IOfflineQueueEntry` — offline queue item
- `IConflict` — conflict detection result
- `ITombstone` — deleted document record

### Constants

- `fileSizeLimits` — maximum file sizes by type
- `blockedExtensions` — file extensions blocked from upload
- `migrationSchedule` — default migration timing configuration
- `registryColumns` — SharePoint list column definitions

### API Layer

- `FolderManager` — create and manage folder structures
- `SharePointDocsApi` — core document CRUD operations
- `RegistryClient` — document registry list operations
- `MigrationLogClient` — migration log tracking
- `TombstoneWriter` — deleted document tombstone records
- `ConflictDetector` — concurrent edit conflict detection
- `PermissionManager` — document permission control

### Services

- `UploadService` — managed file upload with validation
- `OfflineQueueManager` — offline-first queue with sync
- `MigrationService` — document migration execution
- `MigrationScheduler` — scheduled migration coordination
- `ConflictResolver` — conflict resolution strategies

### Hooks

- `useDocumentContext()` — access the document provider context
- `useDocumentUpload()` — upload files with progress tracking
- `useDocumentList()` — query and filter document lists
- `useOfflineQueue()` — manage offline document queue
- `useMigrationStatus()` — monitor migration progress

### Components

- `HbcDocumentAttachment` — file attachment UI with drag-and-drop
- `HbcDocumentList` — sortable, filterable document list
- `HbcUploadQueue` — upload progress queue display
- `HbcConflictResolutionPanel` — conflict resolution UI
- `HbcMigrationSummaryBanner` — migration status banner
- `DocumentsPanelSection` — SPFx-optimized panel section

---

## SPFx Usage

For SPFx webpart contexts, import the panel section component:

```tsx
import { DocumentsPanelSection } from '@hbc/sharepoint-docs';
```

SPFx contexts should follow the [`@hbc/ui-kit/app-shell` entry-point guidance](../../docs/reference/ui-kit/entry-points.md) for constrained bundle sizes.

---

## Cross-References

- [Platform Primitives Registry](../../docs/reference/platform-primitives.md)
- [Current-State Architecture Map](../../docs/architecture/current-state-map.md) §3 Category C
- [SF01 Master Plan](../../docs/architecture/plans/shared-features/SF01-SharePoint-Docs.md)

<!-- PH7.4 — Package README created as part of Shared-Feature Tier-1 Normalization (§7.4.2) -->
