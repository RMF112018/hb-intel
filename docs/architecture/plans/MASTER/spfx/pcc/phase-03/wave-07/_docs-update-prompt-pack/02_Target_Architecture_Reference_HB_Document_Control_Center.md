# 02 — Complete Target Architecture Reference: HB Document Control Center

This file is the controlling reference for updating Phase 3 / Wave 7 planning, blueprint, and roadmap documentation.

## 1. Objective

**HB Document Control Center** is the project-site document module for formal SharePoint project records, user-specific OneDrive working files, internal document-control approval workflows, project-level source binding, external document-system visibility, role-aware file actions, and document auditability.

The module is **not** a replacement for SharePoint, OneDrive, Procore, Document Crunch, Adobe Sign, or any external system of record. It is the governed working interface and coordination layer around those sources.

## 2. Final Module Name

```text
HB Document Control Center
```

Former labels such as `Documents / Document Control Center` should be treated as legacy planning language where appropriate.

## 3. Final Architecture Statement

> **HB Document Control Center** is the project-site document-control module for internal project files, personal project working files, approval workflows, and external document-system visibility. SharePoint project libraries remain the formal project record. OneDrive stores user-specific working files in a root folder named `My Project Files`, with one nested folder per project. Microsoft Graph is the backend-mediated file access layer. PCC/HB workflow records provide approval state, routing, source binding, and audit history. External systems such as Procore, Document Crunch, and Adobe Sign remain linked systems of record unless later phases explicitly approve deeper integration.

## 4. Governing Architecture Decisions

1. **Three-lane model:** Project Record, My Project Files, External Systems.
2. **Project Record source of truth:** formal project files live in SharePoint project-site document libraries.
3. **My Project Files source of truth:** user working files live in each user's OneDrive at `OneDrive > My Project Files > {ProjectNumber}-{ProjectName}`.
4. **External source of truth:** Procore, Document Crunch, and Adobe Sign remain external systems of record.
5. **Source binding:** every project must have a backend-controlled Project Document Source Registry. SPFx must not hard-code or self-discover source links.
6. **Backend-mediated file operations:** SPFx calls PCC backend routes; backend enforces project context, source binding, permissions, allowed actions, throttling, and audit logging.
7. **Wave 7 execution posture:** start with source registry/read-model foundation, lane UI, role/action model, My Project Files binding, and workflow/audit models. Controlled writes follow only after permissions/audit/error-state/source-binding models are locked.
8. **Project Coordinator:** use Project Coordinator, not Project Engineer. Project Coordinator initially maps to `project-team-member` and `project_team_member`.
9. **Reviewer roles:** Estimator, Chief Estimator, Director of Preconstruction, Project Coordinator, Legal Reviewer, Compliance Reviewer, and Leadership Reviewer are Document Control reviewer roles, not necessarily global PCC personas in Wave 7.
10. **Deferred external roles:** External Design Team, Owner / Client Viewer, and Subcontractor Limited are represented but deferred/no default Wave 7 authority.

## 5. Lane Architecture

### Lane 1 — Project Record

Purpose: the formal internal project record.

Source: SharePoint project-site document libraries.

Includes:
- formal file browsing;
- project document search;
- upload to governed project libraries;
- Microsoft 365 open/download;
- governed copy-link;
- required metadata;
- internal review workflows;
- approved version tracking;
- workflow state;
- audit trail.

Excludes:
- personal drafts;
- ungoverned file sharing;
- Procore replacement;
- formal submittal/RFI/drawing replacement unless separately approved.

### Lane 2 — My Project Files

Purpose: user-specific working-file lane for notes, drafts, calculations, informal markups, and other project-related working files that are not part of the formal project record.

OneDrive root folder:

```text
My Project Files
```

Project folder format:

```text
{ProjectNumber}-{ProjectName}
```

Example:

```text
26-000-00-Stadium Enclave
```

Required UI label:

```text
My Project Files
```

Required warning text:

```text
Files in My Project Files are working files for this project. They are not part of the formal project record unless submitted to Project Record.
```

Hard guardrail:

> The project-site instance of **HB Document Control Center** must never expose the user’s full OneDrive `My Project Files` root folder or folders for other projects. It may only resolve and display the folder mapped to the currently loaded project.

Formalization action:

```text
Submit to Project Record
```

Behavior:
1. user selects a file from `My Project Files`;
2. user clicks `Submit to Project Record`;
3. user provides required metadata;
4. user selects/accepts destination SharePoint library;
5. backend copies the file into Project Record;
6. formal document metadata is created;
7. optional internal review workflow starts;
8. audit event is written;
9. original OneDrive file remains unless user deletes/archives it.

Initial rule: **copy, not move**.

### Lane 3 — External Systems

Purpose: source-status and launch lane for external document systems.

Sources:
- Procore
- Document Crunch
- Adobe Sign
- future approved systems

Includes:
- source cards;
- project binding status;
- launch/deep-link;
- missing configuration state;
- access issue state;
- request access / mapping correction prompts;
- later read-only status if approved.

Excludes for Wave 7:
- external writeback;
- mirroring;
- sync;
- external file management;
- Adobe Sign execution;
- Procore document replacement;
- Document Crunch data replication.

## 6. Project Document Source Registry

The module binds to correct sources through a backend-controlled registry.

```ts
interface ProjectDocumentSourceRegistry {
  projectId: string;
  projectNumber: string;
  projectName: string;
  procoreProjectId?: string;

  sharePoint: SharePointProjectBinding;
  myProjectFilesPolicy: MyProjectFilesBindingPolicy;
  externalSources: ExternalDocumentSourceBinding[];

  createdAtUtc: string;
  updatedAtUtc: string;
  lastValidatedAtUtc?: string;
}

interface SharePointProjectBinding {
  siteId: string;
  siteUrl: string;
  defaultDriveId: string;
  documentLibraries: SharePointDocumentLibraryBinding[];
}

interface SharePointDocumentLibraryBinding {
  libraryKey: string;
  displayName: string;
  driveId: string;
  listId?: string;
  rootFolderDriveItemId?: string;
  relativePath?: string;
  sourceOfRecord: true;
  allowedActions: DocumentControlActionId[];
}

interface MyProjectFilesBindingPolicy {
  enabled: boolean;
  rootFolderName: 'My Project Files';
  projectFolderNamePattern: '{projectNumber}-{projectName}';
}

interface UserProjectWorkingFolderBinding {
  userId: string;
  userPrincipalName: string;
  projectId: string;
  projectNumber: string;
  projectName: string;
  oneDriveDriveId: string;
  rootFolderName: 'My Project Files';
  rootFolderDriveItemId: string;
  projectFolderName: string;
  projectFolderDriveItemId: string;
  folderPath: string;
  status: 'active' | 'pending' | 'failed' | 'archived';
}

interface ExternalDocumentSourceBinding {
  sourceId: 'procore' | 'document-crunch' | 'adobe-sign';
  displayName: string;
  sourceOfRecordLabel: string;
  enabled: boolean;
  bindingMode: 'launch-only' | 'read-only-status' | 'writeback-approved';
  projectReferenceKey: string;
  launchUrl?: string;
  externalIds: Record<string, string>;
  status: 'configured' | 'missing-config' | 'access-issue' | 'disabled';
  statusMessage?: string;
}
```

## 7. Binding Flow

```text
User opens HB Document Control Center
↓
SPFx receives current project context
↓
SPFx calls backend:
GET /api/pcc/projects/{projectId}/document-control
↓
Backend loads Project Document Source Registry
↓
Backend validates user/project access
↓
Backend resolves SharePoint, OneDrive, and external source bindings
↓
Backend returns project-specific read model
↓
SPFx renders only approved lanes, sources, and actions
```

## 8. Configuration Storage Decision

Use a hybrid storage model:

| Layer | Role |
|---|---|
| Central PCC registry | Authoritative project source bindings |
| Project site | Local project context and optional cached/display references |
| Backend | Resolver, validator, policy enforcer |
| SPFx | UI only |

Do not allow individual SharePoint project sites to become uncontrolled source-of-truth records for external bindings.

## 9. Backend API Contract

Recommended route family:

```text
GET  /api/pcc/projects/{projectId}/document-control
GET  /api/pcc/projects/{projectId}/document-control/sources
GET  /api/pcc/projects/{projectId}/document-control/project-record/items
GET  /api/pcc/projects/{projectId}/document-control/my-project-files/items

POST /api/pcc/projects/{projectId}/document-control/my-project-files/initialize
POST /api/pcc/projects/{projectId}/document-control/my-project-files/submit-to-project-record

POST /api/pcc/projects/{projectId}/document-control/project-record/upload
POST /api/pcc/projects/{projectId}/document-control/project-record/submit-review
POST /api/pcc/projects/{projectId}/document-control/project-record/review-decision

POST /api/pcc/projects/{projectId}/document-control/sources/revalidate
POST /api/pcc/projects/{projectId}/document-control/sources/repair
```

Initial Wave 7 can keep write routes contract-only or mock-backed unless explicitly authorized for live operations.

## 10. Metadata Model

Project-level metadata:
- `projectId`
- `projectNumber`
- `projectName`
- `procoreProjectId`
- `sharePointSiteId`
- `defaultDocumentLibraryId`
- `documentControlEnabled`
- `myProjectFilesEnabled`
- `externalSystemsEnabled`
- `retentionPolicyRef`
- `createdAtUtc`
- `updatedAtUtc`

Formal project file metadata:
- `projectId`
- `projectNumber`
- `projectName`
- `procoreProjectId`
- `sharePointSiteId`
- `driveId`
- `driveItemId`
- `listItemId`
- `fileName`
- `fileExtension`
- `documentType`
- `discipline`
- `formalRecordStatus`
- `internalApprovalStatus`
- `currentReviewerUserId`
- `submittedByUserId`
- `submittedAtUtc`
- `approvedByUserId`
- `approvedAtUtc`
- `versionLabel`
- `eTag`
- `retentionLabel`
- `sensitivityLabel`
- `workflowId`
- `auditTrailId`

Personal working file metadata:
- `userId`
- `userPrincipalName`
- `projectId`
- `projectNumber`
- `projectName`
- `procoreProjectId`
- `oneDriveDriveId`
- `rootFolderDriveItemId`
- `projectFolderDriveItemId`
- `driveItemId`
- `fileName`
- `workspaceType`
- `formalRecordStatus`
- `canSubmitToProjectRecord`
- `createdAtUtc`
- `lastModifiedAtUtc`

## 11. Document Type Taxonomy

Initial internal document types:
- Internal Memo
- Meeting Notes
- Meeting Minutes
- Internal Report
- Cost Backup
- Schedule Backup
- Estimate Backup
- Procurement Backup
- Owner Correspondence Draft
- Subcontractor Correspondence Draft
- Legal / Contract Review Draft
- Compliance Document
- Leadership Review Package
- Project Administration File
- General Working File

Do not include formal submittals, RFIs, drawings, contracts, or external contractual distribution workflows in Wave 7 unless separately approved.

## 12. Internal Approval Workflow

Workflow states:
- Draft
- Submitted
- Under Review
- Approved
- Rejected
- Returned for Revision
- Superseded
- Archived

Final review types:
- PM Review
- PX Review
- Operations Review
- Accounting / Admin Review
- Lead Estimator Review
- Chief Estimator Review
- Legal Review
- Compliance Review
- Leadership Review
- Custom Internal Review

Default routing:
| Document Type | Default Route |
|---|---|
| Estimate Backup | Lead Estimator Review → Chief Estimator Review |
| Procurement Backup | PM Review → PX Review |
| Legal / Contract Review Draft | Legal Review → Leadership Review |
| Compliance Document | Compliance Review |
| Internal Report | PM Review → PX Review |
| Leadership Review Package | Leadership Review |
| Project Administration File | PM Review |
| General Working File | Submitter-selected route |

PM/PX/Admin may override route before submission where policy allows.

## 13. Versioning Policy

Approval attaches to a specific file version/eTag.

Rules:
- approved decision applies only to the reviewed version;
- later edits create a new draft/unapproved version;
- prior approval remains tied to the earlier version;
- superseded versions remain visible in history;
- editing an approved file should trigger new draft status or require resubmission.

## 14. Search, Upload, Refresh, and Resilience

Search:
- Wave 7 initial: source-bound browsing/listing by SharePoint library or current OneDrive project folder.
- Later: backend-mediated project-scoped Microsoft search.
- External search: deferred.

Upload:
- define max file size, blocked/allowed types, small/large upload routes, retry behavior, cleanup, metadata timing, and audit event timing before implementing live uploads.

Path/folder rules:
- root folder: `My Project Files`;
- project folder: `{ProjectNumber}-{ProjectName}`;
- invalid characters stripped/replaced;
- project number controls uniqueness;
- project rename does not auto-rename folders;
- shallow folder depth;
- root and other-project exposure forbidden.

Refresh:
- page load refresh;
- user-triggered refresh;
- source health check on request;
- Graph delta tracking/webhooks deferred.

Resilience states:
- `available`
- `loading`
- `missing-config`
- `access-issue`
- `source-unavailable`
- `throttled`
- `partial-results`
- `folder-not-created`
- `folder-creation-failed`
- `pending-initialization`
- `disabled`

## 15. Audit Model

Minimum required audit events:
- Source registry created/updated
- Source health check run
- Source binding repaired
- OneDrive root folder created
- Project-specific OneDrive folder created
- Formal file uploaded
- Personal file submitted to Project Record
- Metadata updated
- Review started
- Reviewer assigned
- Review approved/rejected/returned
- File superseded
- Copy governed link

Decision required:
- Download formal record

Optional:
- External link opened

Recommendation:
- audit formal `copy link`;
- consider auditing formal downloads;
- do not over-audit personal working file opens/downloads unless IT/legal requires it.

## 16. Sharing-Link Policy

Wave 7 should prefer:
- `Open in SharePoint`
- `Open in OneDrive`

If `Copy Link` is enabled:
- company-scoped only;
- permission-respecting only;
- no anonymous links;
- no external links unless explicitly approved;
- audit event required;
- role/action matrix must allow it.

## 17. Admin Repair / Reconciliation

Admin repair actions:
- re-detect SharePoint libraries;
- rebind SharePoint drive/list IDs;
- create missing `My Project Files` root folder;
- create missing project folder;
- revalidate Procore Project ID;
- update external launch URL;
- mark external source as not used;
- re-run source health check;
- resolve duplicate/misnamed project folder.

Repair must be scoped to current project/source and must not perform broad tenant mutation.

## 18. Fixture / Mock Strategy

Wave 7 should preserve fixture/default posture.

Required fixtures:
- sample three-lane read model;
- sample source registry;
- sample SharePoint library bindings;
- sample `My Project Files` bindings;
- sample external source states;
- sample permission/action matrix;
- sample review workflows;
- sample audit events;
- sample missing-config/access-issue/throttled states.

Tests should prove:
- no live Graph calls by default;
- no external writeback;
- no root `My Project Files` exposure;
- no other-project folder exposure;
- no broad source discovery in frontend;
- no unauthorized actions rendered.

## 19. Role Model

Role source hierarchy:

```text
Document Control actor role
↓
PCC persona
↓
Project-scoped role
↓
Permission template / SharePoint group
↓
Reviewer assignment / workflow assignment
↓
Backend action authorization
```

Role modeling decision: canonical PCC persona model remains the base product vocabulary. Wave 7 adds Document Control actor roles for document-specific review/action routing without requiring all of them to become global PCC personas immediately.

## 20. Complete Role Set for Permission Matrix

| Code | Role |
|---|---|
| R01 | PCC Admin |
| R02 | IT / Tenant Admin |
| R03 | Executive Oversight |
| R04 | Project Executive |
| R05 | Project Manager |
| R06 | Superintendent |
| R07 | Project Accounting |
| R08 | Project Team Member |
| R09 | Project Viewer / Viewer |
| R10 | Safety / QAQC |
| R11 | Manager of Operational Excellence |
| R12 | Estimating Coordinator |
| R13 | Estimator |
| R14 | Lead Estimator |
| R15 | Chief Estimator |
| R16 | Director of Preconstruction |
| R17 | Legal Reviewer |
| R18 | Compliance Reviewer |
| R19 | Leadership Reviewer |
| R20 | External Contributor |
| R21 | External Design Team |
| R22 | Owner / Client Viewer |
| R23 | Subcontractor Limited |

## 21. Permission Matrix Legend

| Symbol | Meaning |
|---|---|
| `Y` | Allowed by default if project/source access exists |
| `A` | Allowed only when assigned to the file/workflow/review |
| `O` | Own/current-user files only |
| `R` | Request only |
| `C` | Configurable; must be explicitly assigned |
| `S` | Support/admin repair only |
| `D` | Deferred / no default Wave 7 authority |
| `N` | Not allowed |
| `HARD-NO` | Forbidden by architecture, not merely unavailable |

Anything not explicitly allowed is `N`.

## 22. Action Codes

Project Record:
- PR01 View Project Record lane
- PR02 Browse/search formal project files
- PR03 Open/download formal file
- PR04 Upload formal file
- PR05 Edit formal file metadata
- PR06 Rename formal file
- PR07 Delete/archive formal file
- PR08 Copy governed formal file link
- PR09 Submit file for internal review
- PR10 Approve/reject/return assigned review
- PR11 View formal file audit trail
- PR12 Export audit/evidence package

My Project Files:
- MP01 Initialize OneDrive root/project folder
- MP02 View current project's `My Project Files` folder
- MP03 Browse root `My Project Files` folder
- MP04 Browse other project folders
- MP05 Upload personal working file
- MP06 Open/download personal working file
- MP07 Rename personal working file
- MP08 Delete/archive personal working file
- MP09 Submit personal file to Project Record

Source Binding / Repair:
- SB01 View source binding/status
- SB02 Configure SharePoint binding
- SB03 Configure Procore Project ID
- SB04 Configure Adobe Sign binding
- SB05 Configure Document Crunch binding
- SB06 Revalidate source health
- SB07 Repair/recreate OneDrive project folder
- SB08 Override missing/broken source state

External Systems:
- EX01 View external source card
- EX02 Launch external source
- EX03 Request access/mapping correction
- EX04 External writeback/sync/mirror

Workflow/Admin:
- WF01 View Reviews & Approvals
- WF02 Assign/reassign reviewer
- WF03 Configure document types
- WF04 Configure review templates
- WF05 Override review decision
- WF06 View business audit
- WF07 Configure retention/sensitivity display
- WF08 Configure file-action policies

## 23. Complete Permission Matrix by Role

### R01 — PCC Admin
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 Y, PR05 Y, PR06 Y, PR07 Y, PR08 Y, PR09 Y, PR10 A/C, PR11 Y, PR12 Y
- My Project Files: MP01 S, MP02 O/S, MP03 HARD-NO in project-site UI, MP04 HARD-NO in project-site UI, MP05 O/S, MP06 O/S, MP07 O/S, MP08 O/S, MP09 O/S
- Source Binding: SB01 Y, SB02 Y, SB03 Y, SB04 Y, SB05 Y, SB06 Y, SB07 Y, SB08 Y
- External Systems: EX01 Y, EX02 Y, EX03 Y, EX04 N
- Workflow/Admin: WF01 Y, WF02 Y, WF03 Y, WF04 Y, WF05 Y, WF06 Y, WF07 Y, WF08 Y

### R02 — IT / Tenant Admin
- Project Record: PR01 C, PR02 C, PR03 C, PR04 N, PR05 N, PR06 N, PR07 N, PR08 N, PR09 N, PR10 N, PR11 Y, PR12 Y
- My Project Files: MP01 S, MP02 S, MP03 HARD-NO in project-site UI, MP04 HARD-NO in project-site UI, MP05 S, MP06 S, MP07 S, MP08 S, MP09 S
- Source Binding: SB01 Y, SB02 Y, SB03 S, SB04 S, SB05 S, SB06 Y, SB07 Y, SB08 Y
- External Systems: EX01 Y, EX02 C, EX03 Y, EX04 N
- Workflow/Admin: WF01 C, WF02 N, WF03 N, WF04 N, WF05 N, WF06 Y, WF07 Y, WF08 Y

### R03 — Executive Oversight
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 N, PR05 N, PR06 N, PR07 N, PR08 C, PR09 N, PR10 A, PR11 Y, PR12 C
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O/C
- Source Binding: SB01 Y, SB02 N, SB03 N, SB04 N, SB05 N, SB06 R, SB07 R, SB08 N
- External Systems: EX01 Y, EX02 Y, EX03 R, EX04 N
- Workflow/Admin: WF01 Y, WF02 N, WF03 N, WF04 N, WF05 N, WF06 Y, WF07 N, WF08 N

### R04 — Project Executive
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 Y, PR05 Y, PR06 C, PR07 C, PR08 Y, PR09 Y, PR10 A/Y for PX Review, PR11 Y, PR12 C
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O
- Source Binding: SB01 Y, SB02 R/C, SB03 C, SB04 R/C, SB05 R/C, SB06 Y, SB07 R, SB08 R/C
- External Systems: EX01 Y, EX02 Y, EX03 Y, EX04 N
- Workflow/Admin: WF01 Y, WF02 Y, WF03 C, WF04 C, WF05 C, WF06 Y, WF07 R, WF08 C

### R05 — Project Manager
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 Y, PR05 Y, PR06 C, PR07 C, PR08 Y, PR09 Y, PR10 A/Y for PM Review, PR11 Y, PR12 C
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O
- Source Binding: SB01 Y, SB02 R/C, SB03 C, SB04 R/C, SB05 R/C, SB06 Y, SB07 R, SB08 R/C
- External Systems: EX01 Y, EX02 Y, EX03 Y, EX04 N
- Workflow/Admin: WF01 Y, WF02 Y, WF03 C, WF04 C, WF05 C, WF06 Y, WF07 R, WF08 C

### R06 — Superintendent
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 Y, PR05 C, PR06 N, PR07 N, PR08 C, PR09 Y, PR10 A, PR11 C, PR12 N
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O
- Source Binding: SB01 Y, SB02 N, SB03 R, SB04 R, SB05 R, SB06 R, SB07 R, SB08 N
- External Systems: EX01 Y, EX02 Y, EX03 R, EX04 N
- Workflow/Admin: WF01 Y, WF02 N, WF03 N, WF04 N, WF05 N, WF06 N/C, WF07 N, WF08 N

### R07 — Project Accounting
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 C, PR05 C, PR06 N, PR07 N, PR08 C, PR09 C, PR10 A for Accounting/Admin Review, PR11 Y, PR12 C
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O
- Source Binding: SB01 Y, SB02 N, SB03 N, SB04 R, SB05 R, SB06 R, SB07 R, SB08 N
- External Systems: EX01 Y, EX02 Y, EX03 R, EX04 N
- Workflow/Admin: WF01 Y, WF02 N, WF03 N, WF04 N, WF05 N, WF06 C, WF07 N, WF08 N

### R08 — Project Team Member
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 C, PR05 C, PR06 N, PR07 N, PR08 C, PR09 C, PR10 A, PR11 C, PR12 N
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O
- Source Binding: SB01 Y, SB02 N, SB03 R, SB04 R, SB05 R, SB06 R, SB07 R, SB08 N
- External Systems: EX01 Y, EX02 Y, EX03 R, EX04 N
- Workflow/Admin: WF01 Y, WF02 N, WF03 N, WF04 N, WF05 N, WF06 N, WF07 N, WF08 N

### R09 — Project Viewer / Viewer
- Project Record: PR01 Y, PR02 Y, PR03 C, PR04 N, PR05 N, PR06 N, PR07 N, PR08 N/C, PR09 N, PR10 N, PR11 C, PR12 N
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O/C
- Source Binding: SB01 C, SB02 N, SB03 N, SB04 N, SB05 N, SB06 R, SB07 R, SB08 N
- External Systems: EX01 C, EX02 C, EX03 R, EX04 N
- Workflow/Admin: WF01 C, WF02 N, WF03 N, WF04 N, WF05 N, WF06 N, WF07 N, WF08 N

### R10 — Safety / QAQC
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 Y, PR05 C, PR06 N, PR07 N, PR08 C, PR09 Y, PR10 A, PR11 C, PR12 N
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O
- Source Binding: SB01 Y, SB02 N, SB03 R, SB04 R, SB05 R, SB06 R, SB07 R, SB08 N
- External Systems: EX01 Y, EX02 Y, EX03 R, EX04 N
- Workflow/Admin: WF01 Y, WF02 N, WF03 N, WF04 N, WF05 N, WF06 N/C, WF07 N, WF08 N

### R11 — Manager of Operational Excellence
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 C, PR05 C, PR06 C, PR07 C, PR08 C, PR09 C, PR10 A/C, PR11 Y, PR12 C
- My Project Files: MP01 O/S, MP02 O/S, MP03 HARD-NO, MP04 HARD-NO, MP05 O/S, MP06 O/S, MP07 O/S, MP08 O/S, MP09 O/S
- Source Binding: SB01 Y, SB02 R/C, SB03 R/C, SB04 R/C, SB05 R/C, SB06 Y, SB07 R/C, SB08 C
- External Systems: EX01 Y, EX02 Y, EX03 Y, EX04 N
- Workflow/Admin: WF01 Y, WF02 C, WF03 C, WF04 C, WF05 C, WF06 Y, WF07 R, WF08 C

### R12 — Estimating Coordinator
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 C, PR05 C, PR06 N, PR07 N, PR08 C, PR09 C, PR10 A, PR11 C, PR12 N
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O
- Source Binding: SB01 Y, SB02 R/C during preconstruction, SB03 R/C, SB04 R, SB05 R, SB06 R/C, SB07 R, SB08 R/C
- External Systems: EX01 Y, EX02 Y, EX03 R, EX04 N
- Workflow/Admin: WF01 Y, WF02 C, WF03 N, WF04 N, WF05 N, WF06 N, WF07 N, WF08 N

### R13 — Estimator
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 C, PR05 C, PR06 N, PR07 N, PR08 C, PR09 C, PR10 A, PR11 C, PR12 N
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O
- Source Binding: SB01 C, SB02 N, SB03 R, SB04 R, SB05 R, SB06 R, SB07 R, SB08 N
- External Systems: EX01 C, EX02 C, EX03 R, EX04 N
- Workflow/Admin: WF01 A/C, WF02 N, WF03 N, WF04 N, WF05 N, WF06 N, WF07 N, WF08 N

### R14 — Lead Estimator
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 C, PR05 C, PR06 C, PR07 N, PR08 C, PR09 C, PR10 A/Y for Lead Estimator Review, PR11 C, PR12 C
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O
- Source Binding: SB01 Y, SB02 R/C during preconstruction, SB03 R/C, SB04 R, SB05 R, SB06 R/C, SB07 R, SB08 R/C
- External Systems: EX01 Y, EX02 Y, EX03 R, EX04 N
- Workflow/Admin: WF01 Y, WF02 C, WF03 C, WF04 C for estimating templates, WF05 N, WF06 C, WF07 N, WF08 N

### R15 — Chief Estimator
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 C, PR05 C, PR06 C, PR07 N, PR08 C, PR09 C, PR10 A/Y for Chief Estimator Review, PR11 C, PR12 C
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O
- Source Binding: SB01 Y, SB02 R/C during preconstruction, SB03 R/C, SB04 R, SB05 R, SB06 R/C, SB07 R, SB08 R/C
- External Systems: EX01 Y, EX02 Y, EX03 R, EX04 N
- Workflow/Admin: WF01 Y, WF02 C, WF03 C, WF04 C for estimating templates, WF05 C, WF06 C, WF07 N, WF08 N

### R16 — Director of Preconstruction
- Project Record: PR01 Y, PR02 Y, PR03 Y, PR04 C, PR05 C, PR06 C, PR07 N, PR08 C, PR09 C, PR10 A/C, PR11 C, PR12 C
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O
- Source Binding: SB01 Y, SB02 R/C, SB03 R/C, SB04 R, SB05 R, SB06 R/C, SB07 R, SB08 R/C
- External Systems: EX01 Y, EX02 Y, EX03 R, EX04 N
- Workflow/Admin: WF01 Y, WF02 C, WF03 C, WF04 C for preconstruction templates, WF05 C, WF06 C, WF07 N, WF08 N

### R17 — Legal Reviewer
- Project Record: PR01 A/C, PR02 A/C, PR03 A/C, PR04 N/C, PR05 C, PR06 N, PR07 N, PR08 C, PR09 N, PR10 A/Y for Legal Review, PR11 A/C, PR12 C
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O/C
- Source Binding: SB01 C, SB02 N, SB03 N, SB04 R, SB05 R, SB06 R, SB07 R, SB08 N
- External Systems: EX01 C, EX02 C, EX03 R, EX04 N
- Workflow/Admin: WF01 A/C, WF02 N, WF03 N, WF04 N, WF05 N, WF06 C, WF07 N, WF08 N

### R18 — Compliance Reviewer
- Project Record: PR01 A/C, PR02 A/C, PR03 A/C, PR04 N/C, PR05 C, PR06 N, PR07 N, PR08 C, PR09 N, PR10 A/Y for Compliance Review, PR11 A/C, PR12 C
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O/C
- Source Binding: SB01 C, SB02 N, SB03 N, SB04 R, SB05 R, SB06 R, SB07 R, SB08 N
- External Systems: EX01 C, EX02 C, EX03 R, EX04 N
- Workflow/Admin: WF01 A/C, WF02 N, WF03 N, WF04 N, WF05 N, WF06 C, WF07 N, WF08 N

### R19 — Leadership Reviewer
- Project Record: PR01 A/C, PR02 A/C, PR03 A/C, PR04 N, PR05 C, PR06 N, PR07 N, PR08 C, PR09 N, PR10 A/Y for Leadership Review, PR11 A/C, PR12 C
- My Project Files: MP01 O, MP02 O, MP03 HARD-NO, MP04 HARD-NO, MP05 O, MP06 O, MP07 O, MP08 O, MP09 O/C
- Source Binding: SB01 C, SB02 N, SB03 R, SB04 R, SB05 R, SB06 R, SB07 R, SB08 N
- External Systems: EX01 C, EX02 C, EX03 R, EX04 N
- Workflow/Admin: WF01 A/C, WF02 N, WF03 N, WF04 N, WF05 N, WF06 C, WF07 N, WF08 N

### R20 — External Contributor
- Project Record: PR01 C, PR02 C, PR03 C, PR04 D/C, PR05 D/C, PR06 N, PR07 N, PR08 N, PR09 D/C, PR10 A/C, PR11 N/C, PR12 N
- My Project Files: MP01 N, MP02 N, MP03 HARD-NO, MP04 HARD-NO, MP05 N, MP06 N, MP07 N, MP08 N, MP09 N
- Source Binding: SB01 N/C, SB02 N, SB03 N, SB04 N, SB05 N, SB06 R, SB07 N, SB08 N
- External Systems: EX01 C, EX02 C, EX03 R, EX04 N
- Workflow/Admin: WF01 A/C, WF02 N, WF03 N, WF04 N, WF05 N, WF06 N, WF07 N, WF08 N

### R21 — External Design Team
- Project Record: PR01 D, PR02 D, PR03 D, PR04 D, PR05 D, PR06 N, PR07 N, PR08 N, PR09 D, PR10 D/A, PR11 D, PR12 N
- My Project Files: MP01 N, MP02 N, MP03 HARD-NO, MP04 HARD-NO, MP05 N, MP06 N, MP07 N, MP08 N, MP09 N
- Source Binding: SB01 D, SB02 N, SB03 N, SB04 N, SB05 N, SB06 R, SB07 N, SB08 N
- External Systems: EX01 D, EX02 D, EX03 R, EX04 N
- Workflow/Admin: WF01 D/A, WF02 N, WF03 N, WF04 N, WF05 N, WF06 N, WF07 N, WF08 N

### R22 — Owner / Client Viewer
- Project Record: PR01 D, PR02 D, PR03 D, PR04 N, PR05 N, PR06 N, PR07 N, PR08 N, PR09 N, PR10 D/A, PR11 D, PR12 N
- My Project Files: MP01 N, MP02 N, MP03 HARD-NO, MP04 HARD-NO, MP05 N, MP06 N, MP07 N, MP08 N, MP09 N
- Source Binding: SB01 D, SB02 N, SB03 N, SB04 N, SB05 N, SB06 R, SB07 N, SB08 N
- External Systems: EX01 D, EX02 D, EX03 R, EX04 N
- Workflow/Admin: WF01 D/A, WF02 N, WF03 N, WF04 N, WF05 N, WF06 N, WF07 N, WF08 N

### R23 — Subcontractor Limited
- Project Record: PR01 D, PR02 D, PR03 D, PR04 D, PR05 N, PR06 N, PR07 N, PR08 N, PR09 D, PR10 D/A, PR11 N, PR12 N
- My Project Files: MP01 N, MP02 N, MP03 HARD-NO, MP04 HARD-NO, MP05 N, MP06 N, MP07 N, MP08 N, MP09 N
- Source Binding: SB01 D, SB02 N, SB03 N, SB04 N, SB05 N, SB06 R, SB07 N, SB08 N
- External Systems: EX01 D, EX02 D, EX03 R, EX04 N
- Workflow/Admin: WF01 D/A, WF02 N, WF03 N, WF04 N, WF05 N, WF06 N, WF07 N, WF08 N

## 24. Universal Hard-No Rules

These apply regardless of role unless a separate non-project-site support/admin process is approved.

| Rule | Status |
|---|---|
| Browse full OneDrive root from project-site module | HARD-NO |
| Browse full `My Project Files` root from project-site module | HARD-NO |
| Browse another project's `My Project Files` folder | HARD-NO |
| Browse another user's OneDrive through normal project UI | HARD-NO |
| External writeback/sync/mirror in Wave 7 | HARD-NO |
| Procore replacement workflow | HARD-NO |
| Document Crunch replication | HARD-NO |
| Adobe Sign agreement execution in Wave 7 | HARD-NO |
| Anonymous sharing links | HARD-NO |
| SPFx direct broad Graph file execution | HARD-NO |
| Automatic external sharing | HARD-NO |
| Automatic deletion of OneDrive working files when removed from project | HARD-NO |

## 25. Wave 7 Acceptance Criteria

Wave 7 should not be considered ready unless:

- Module renamed to **HB Document Control Center**.
- Three lanes defined: `Project Record`, `My Project Files`, `External Systems`.
- Project Document Source Registry model defined.
- Source binding read model defined.
- `Procore Project ID` added to metadata.
- Full role/action permission matrix added.
- Project Coordinator included instead of Project Engineer.
- Review roles and review types represented.
- External/deferred roles represented but not granted default access.
- `My Project Files` root/other-project exposure guardrail included.
- Backend-mediated Graph posture documented.
- Source health states documented.
- Audit event model documented.
- File action matrix documented.
- Sharing-link policy documented.
- Upload rules documented or explicitly deferred.
- Versioning policy documented.
- Admin repair workflow documented.
- Fixtures/read models planned before live operations.
- Tests required for no root exposure, no other-project exposure, no external writeback, and no default live Graph calls.

## 26. Recommended Wave 7 Implementation Sequence

1. Scope lock / repo-truth gate.
2. Role/action model.
3. Source registry model.
4. Read models and fixtures.
5. SPFx lane UI.
6. Backend route contracts.
7. My Project Files initialization.
8. Controlled file actions.
9. Closeout.
