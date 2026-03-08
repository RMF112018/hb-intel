# PH7-SF-01: `@hbc/sharepoint-docs` — SharePoint Document Lifecycle Management

**Priority Tier:** 1 — Foundation (must exist before any domain module)
**Package:** `packages/sharepoint-docs/`
**Interview Decision:** Q26 — Option B confirmed
**Mold Breaker Source:** UX-MB §5 (Offline-Safe Workflows); con-tech-ux-study §10.4 (Form State Preservation)

---

## Problem Solved

Multiple modules require document attachment and storage before a SharePoint project site exists. The BD Manager attaches RFP/RFQ/ITB documents to a Go/No-Go Scorecard at lead origination — no project has been provisioned yet, no SharePoint site exists. Without explicit infrastructure, these documents have no defined home.

This problem recurs across the platform:
- BD leads have documents before a project is created
- Estimating pursuits accumulate bid documents before project setup
- Living Strategic Intelligence contributions may include supporting documents
- `@hbc/data-seeding` uploads files that need structured storage destinations
- `@hbc/workflow-handoff` assembles document link packages that must resolve to real SharePoint locations

Without `@hbc/sharepoint-docs`, each module independently solves the pre-provisioning storage problem — creating inconsistent folder structures, unmaintainable migration logic, and broken document links when provisioning completes.

---

## Mold Breaker Rationale

The UX study (con-tech §10.4) identifies form state preservation as "the single highest-impact PWA opportunity." Document loss is the most severe form of state loss — a partially attached document package to a BD scorecard that fails silently is a trust-destroying event. The ux-mold-breaker.md principle §7.4 ("Offline-safe by default") and §7.6 ("Transparency") both apply: the system must always know where a document is, and users must always be able to find what they attached.

---

## Applicable Modules

| Module | Use Case | Context Type |
|---|---|---|
| Business Development | RFP/RFQ/ITB attachments to Go/No-Go Scorecard | `bd-lead` |
| Business Development | Living Strategic Intelligence document attachments | `bd-lead` |
| Estimating | Bid document attachments to Active Pursuits | `estimating-pursuit` |
| Project Hub | All post-provisioning project documents | `project` |
| `@hbc/workflow-handoff` | Document link assembly for cross-module handoff packages | All |
| `@hbc/data-seeding` | Storage destination for uploaded seed files | All |

---

## Interface Contract

```typescript
// packages/sharepoint-docs/src/types/IDocumentContext.ts

export type DocumentContextType =
  | 'bd-lead'
  | 'estimating-pursuit'
  | 'project'
  | 'system';

export interface IDocumentContextConfig {
  /** Unique identifier for the context instance (e.g., scorecard ID, pursuit ID, project ID) */
  contextId: string;
  /** Type determines folder naming convention and storage location */
  contextType: DocumentContextType;
  /** Human-readable label for the context (e.g., "BD Lead: Acme Corp HQ") */
  contextLabel: string;
  /** SharePoint site URL — null for pre-provisioning contexts */
  siteUrl: string | null;
  /** Relative path within the site's document library */
  libraryPath?: string;
  /** Permissions to apply to created folder */
  permissions?: IDocumentPermissions;
}

export interface IDocumentPermissions {
  /** SharePoint group names with Read access */
  readGroups: string[];
  /** SharePoint group names with Contribute access */
  contributeGroups: string[];
  /** SharePoint group names with Full Control */
  fullControlGroups: string[];
}

export interface IUploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string; // ISO 8601
  uploadedBy: string; // user UPN
  contextId: string;
  contextType: DocumentContextType;
  /** Absolute SharePoint URL to this document */
  sharepointUrl: string;
  /** Relative path within the context folder */
  relativePath: string;
  /** If migrated post-provisioning, the project document library URL */
  migratedUrl?: string;
}

export interface IDocumentMigrationConfig {
  /** Source context (pre-provisioning) */
  sourceContextId: string;
  /** Destination project context */
  destinationProjectId: string;
  /** Destination SharePoint site URL (post-provisioning) */
  destinationSiteUrl: string;
  /** Whether to copy (keep source) or move (delete source) */
  strategy: 'copy' | 'move';
  /** Whether to create a two-way navigation link after migration */
  createBidirectionalLink: boolean;
}
```

---

## Package Architecture

```
packages/sharepoint-docs/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                          # barrel
│   ├── types/
│   │   ├── IDocumentContext.ts
│   │   ├── IUploadedDocument.ts
│   │   ├── IDocumentMigrationConfig.ts
│   │   └── index.ts
│   ├── api/
│   │   ├── SharePointDocsApi.ts          # Graph API wrapper
│   │   ├── FolderManager.ts              # create/resolve folder by context
│   │   └── MigrationService.ts          # post-provisioning migration + linking
│   ├── hooks/
│   │   ├── useDocumentContext.ts         # resolve/create context folder
│   │   ├── useDocumentUpload.ts          # upload with progress + retry
│   │   └── useDocumentList.ts           # list documents in context
│   └── components/
│       ├── HbcDocumentAttachment.tsx     # drag-drop upload + file list UI
│       ├── HbcDocumentList.tsx           # read-only document list
│       └── index.ts
```

---

## Component Specifications

### `HbcDocumentAttachment`

A drag-and-drop document attachment component with upload progress, retry on failure, and context-aware destination routing.

**Props:**
```typescript
interface HbcDocumentAttachmentProps {
  contextConfig: IDocumentContextConfig;
  /** Accepted MIME types — defaults to common construction doc types */
  acceptedTypes?: string[];
  /** Max file size in bytes — defaults to 50MB */
  maxFileSize?: number;
  /** Max simultaneous uploads — defaults to 3 */
  maxConcurrent?: number;
  /** Called when uploads complete */
  onUploadComplete?: (documents: IUploadedDocument[]) => void;
  /** Whether attachment is allowed at current workflow stage */
  disabled?: boolean;
  /** Optional caption shown below drop zone */
  caption?: string;
}
```

**Behavior:**
- Renders a drop zone with visual drag-over feedback
- Shows per-file upload progress bars
- Retries failed uploads up to 3 times with exponential backoff
- Calls `useDocumentContext` to ensure context folder exists before first upload
- Shows `HbcConnectivityBar` integration: queues uploads when offline via `@hbc/session-state`, retries on reconnect
- Integrates with `@hbc/complexity`: Essential mode shows simplified drop zone only; Expert mode exposes folder path and SharePoint link

### `HbcDocumentList`

A read-only list of documents attached to a context, with download links and migration status indicators.

**Props:**
```typescript
interface HbcDocumentListProps {
  contextId: string;
  contextType: DocumentContextType;
  /** Whether to show migration status badge */
  showMigrationStatus?: boolean;
  /** Whether to show two-way link to migrated destination */
  showBidirectionalLink?: boolean;
}
```

---

## Pre-Provisioning Storage Architecture

Before a project is provisioned, documents are stored in a designated staging area in HB Intel's root SharePoint site collection:

```
/sites/hb-intel/
└── Shared Documents/
    ├── BD Leads/
    │   └── {ScorcardId}-{LeadName}-{YYYY-MM-DD}/
    │       ├── RFP/
    │       ├── RFQ/
    │       ├── ITB/
    │       └── Supporting/
    ├── Estimating Pursuits/
    │   └── {PursuitId}-{ProjectName}-{YYYY-MM-DD}/
    │       ├── Bid Documents/
    │       └── Supporting/
    └── System/
```

---

## Post-Provisioning Migration

When project provisioning completes (triggered by the Estimating Project Setup workflow), `MigrationService` performs the following sequence:

1. Locates all documents in the source context folder (BD lead or Estimating pursuit)
2. Copies them to the provisioned project's SharePoint document library under `/BD Heritage/` and `/Estimating/` respectively
3. Creates a SharePoint item-level link from each source document to its migrated copy (bidirectional navigation)
4. Updates `IUploadedDocument.migratedUrl` in the HB Intel data layer
5. Notifies `@hbc/workflow-handoff` that document URLs have been updated (so any handoff packages referencing these documents resolve to the new canonical location)
6. Optionally marks source documents as "Migrated — view in project" with a navigation link

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/workflow-handoff` | Provides resolved document URLs for handoff package assembly; receives post-migration URL updates |
| `@hbc/data-seeding` | Routes uploaded seed files to context-appropriate folders via `useDocumentContext` |
| `@hbc/related-items` | Document attachments appear as related items on any record that has them |
| `@hbc/notification-intelligence` | Upload failures and migration completion events are registered as Digest-tier notifications |
| `@hbc/session-state` | Pending uploads are persisted to session state for retry on reconnect |
| PH9b `useFormDraft` | Document upload state is included in form draft persistence |

---

## SPFx Constraints

- All SharePoint Graph API calls route through Azure Functions backend (`packages/api/`) — no direct Graph API calls from SPFx webparts
- File uploads use chunked upload for files >4MB via the Graph API `createUploadSession` endpoint
- Folder creation uses `@microsoft/sp-http` compatible Graph API calls when running in SPFx context
- Import from `@hbc/ui-kit/app-shell` not `@hbc/ui-kit` in SPFx shell contexts

---

## SharePoint Schema

**SharePoint List: `HbcDocumentRegistry`** (in root site collection)

| Column | Type | Description |
|---|---|---|
| `DocumentId` | Single line | GUID — primary key |
| `ContextId` | Single line | ID of the owning record (scorecard ID, pursuit ID, etc.) |
| `ContextType` | Choice | `bd-lead` / `estimating-pursuit` / `project` |
| `FileName` | Single line | Original file name |
| `FileSize` | Number | Bytes |
| `SharePointUrl` | Hyperlink | Absolute URL to document |
| `MigratedUrl` | Hyperlink | Post-provisioning URL (null until migrated) |
| `UploadedBy` | Person | Uploader |
| `UploadedAt` | Date/Time | UTC timestamp |
| `MigrationStatus` | Choice | `pending` / `migrated` / `not-applicable` |

---

## Module Adoption Guide

**Step 1: Register a document context when a record is created**
```typescript
import { useDocumentContext } from '@hbc/sharepoint-docs';

const { contextFolder, isCreating } = useDocumentContext({
  contextId: scorecard.id,
  contextType: 'bd-lead',
  contextLabel: `BD Lead: ${scorecard.projectName}`,
  siteUrl: null, // pre-provisioning
});
```

**Step 2: Render the attachment component**
```typescript
import { HbcDocumentAttachment } from '@hbc/sharepoint-docs';

<HbcDocumentAttachment
  contextConfig={contextFolder}
  acceptedTypes={['application/pdf', '.docx', '.xlsx']}
  onUploadComplete={(docs) => updateScorecardDocuments(docs)}
/>
```

**Step 3: Wire migration on provisioning**
```typescript
import { MigrationService } from '@hbc/sharepoint-docs';

// Called from provisioning saga when project site is created
await MigrationService.migrate({
  sourceContextId: scorecard.id,
  destinationProjectId: newProject.id,
  destinationSiteUrl: newProject.sharepointSiteUrl,
  strategy: 'copy',
  createBidirectionalLink: true,
});
```

---

## Priority & ROI

**Priority:** P0 — Blocks BD, Estimating, and Project Hub document workflows
**Estimated build effort:** 4–5 sprint-weeks (Graph API integration, migration service, component)
**ROI:** Prevents document loss at the most critical pre-provisioning stages; eliminates per-module document infrastructure duplication; enables reliable `@hbc/workflow-handoff` document link assembly

---

## Definition of Done

- [ ] `IDocumentContextConfig` contract defined and exported
- [ ] `FolderManager` creates BD lead and Estimating pursuit folders on demand
- [ ] `HbcDocumentAttachment` renders drop zone, progress bars, and retry logic
- [ ] `HbcDocumentList` renders attached documents with migration status
- [ ] `MigrationService.migrate()` copies documents, creates bidirectional links, updates registry
- [ ] `HbcDocumentRegistry` SharePoint list deployed via setup script
- [ ] Chunked upload (>4MB) implemented via Graph API upload session
- [ ] Offline queue via `@hbc/session-state` — uploads retry on reconnect
- [ ] `@hbc/complexity` integration — Essential/Standard/Expert modes respected
- [ ] Unit tests ≥95% coverage on `FolderManager` and `MigrationService`
- [ ] Playwright E2E: upload → migration → bidirectional link verification

---

## ADR Reference

Create `docs/architecture/adr/0010-sharepoint-docs-pre-provisioning-storage.md` documenting the decision to use a staging area in the root site collection for pre-provisioning documents, the migration strategy, and the bidirectional link pattern.
