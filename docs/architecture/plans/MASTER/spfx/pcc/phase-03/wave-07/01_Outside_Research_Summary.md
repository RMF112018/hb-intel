# 01 — Outside Research Summary

## Purpose

This research summary records the external technical/product context that should shape the local implementation prompts for **PCC Phase 3 / Wave 7 — HB Document Control Center**.

The conclusions reinforce the conservative Wave 7 posture:

- backend-mediated source binding;
- no broad direct SPFx Graph execution;
- no live file operations in the UI implementation prompts;
- no external writeback/sync/mirror;
- least-privilege future Graph permissions;
- safe degraded-state handling before runtime file operations.

## Microsoft Graph / SharePoint / OneDrive Findings

### 1. Graph `driveItem` and `drive` model

Microsoft Graph represents files and folders in OneDrive and SharePoint document libraries as `driveItem` resources. A `drive` represents a user OneDrive or a SharePoint document library.

Source:

```text
https://learn.microsoft.com/en-us/graph/api/resources/driveitem
https://learn.microsoft.com/en-us/graph/api/resources/drive
```

Implementation implication:

- The HB Document Control Center should not hard-code or self-discover drive/item bindings from SPFx.
- The backend-controlled Project Document Source Registry is the right architectural boundary.
- UI should render current project-scoped registry data only.

Caution / guardrail:

- A drive/item model can expose broad file trees if improperly scoped.
- My Project Files must resolve only the current user's current project folder, never the full root or other project folders.

### 2. SharePoint selected permissions

Microsoft Graph supports selected permissions for SharePoint and OneDrive resources, allowing more granular access than broad tenant-wide permissions. Consent to a selected-permission scope does not itself grant access to specific resources; access must also be assigned.

Source:

```text
https://learn.microsoft.com/en-us/graph/permissions-selected-overview
```

Implementation implication:

- Later live Graph operations should use least-privilege selected permissions where practical.
- Wave 7 UI should remain read-model/fixture driven until selected-permission posture and resource assignment patterns are designed.

Caution / guardrail:

- Do not introduce broad Graph permissions or direct SPFx file operations in Wave 7 UI prompts.

### 3. Delegated vs application permission posture

Microsoft Graph supports delegated permissions acting on behalf of a signed-in user and application permissions acting as an app/service principal.

Source:

```text
https://learn.microsoft.com/en-us/graph/permissions-overview
```

Implementation implication:

- Future backend routes must explicitly define whether file actions are delegated user-context operations, application-context service operations, or a hybrid.
- UI read models should expose action availability rather than infer authorization locally.

Caution / guardrail:

- Wave 7 UI must not perform runtime authorization enforcement beyond rendering read-model guardrails.

### 4. Microsoft Search / file search

Microsoft Graph Search can query content, but search scope and permissions must be respected.

Source:

```text
https://learn.microsoft.com/en-us/graph/search-concept-files
```

Implementation implication:

- Later project document search should be backend-mediated and project-scoped.
- Initial Wave 7 UI should represent search as preview/deferred unless backend contract explicitly supports it.

Caution / guardrail:

- Do not implement direct frontend Graph search.

### 5. Upload sessions / large file upload

Microsoft Graph uses upload sessions for resumable large-file uploads.

Source:

```text
https://learn.microsoft.com/en-us/graph/api/driveitem-createuploadsession
```

Implementation implication:

- Live upload is a later gated implementation, not part of current UI/read-model prompts.
- Before live upload, define max file size, blocked file types, retry behavior, cleanup, metadata timing, and audit events.

Caution / guardrail:

- Do not add live upload buttons/handlers in Wave 7 UI.

### 6. Sharing link creation

Microsoft Graph `createLink` can create or reuse sharing links for drive items.

Source:

```text
https://learn.microsoft.com/en-us/graph/api/driveitem-createlink
```

Implementation implication:

- Copy-link actions must remain governed, role-aware, company-scoped, and audit-backed.
- UI may render disabled/preview copy-link availability from read model, but must not execute link generation.

Caution / guardrail:

- Do not create anonymous or external links.
- Do not implement live `createLink` calls in SPFx.

### 7. Permissions listing sensitivity

Graph can list permissions on drive items, but permission visibility is sensitive and must be scoped.

Source:

```text
https://learn.microsoft.com/en-us/graph/api/driveitem-list-permissions
```

Implementation implication:

- Later permission detail screens should be backend-mediated and role-gated.
- Wave 7 UI should avoid exposing raw permission payloads.

Caution / guardrail:

- Do not leak raw Graph permission data in the UI.

### 8. Throttling and retry guidance

Microsoft Graph returns throttling responses such as HTTP 429 and may include retry guidance.

Source:

```text
https://learn.microsoft.com/en-us/graph/throttling
```

Implementation implication:

- Source states such as `throttled`, `partial-results`, and `source-unavailable` are necessary before live file operations.
- UI should show safe, user-facing degraded states.

Caution / guardrail:

- Do not expose raw Graph errors.
- Do not implement live operations before retry/backoff and audit policy are designed.

### 9. SharePoint versioning / approval / checkout

SharePoint supports library versioning, content approval, and checkout behavior.

Sources:

```text
https://support.microsoft.com/office/how-versioning-works-in-lists-and-libraries-0f6cd105-974f-44a4-aadb-43ac5bdfd247
https://support.microsoft.com/office/require-approval-of-items-in-a-site-list-or-library-cd0761c4-8c3f-4ea3-9435-13c28aa23d08
https://support.microsoft.com/office/check-out-check-in-or-discard-changes-to-files-in-a-sharepoint-library-7e2c12a9-a874-4393-9511-1378a700f6de
```

Implementation implication:

- Reviews & Approvals UI should represent workflow/review state without pretending to be SharePoint-native approval execution.
- Approved version tracking should remain tied to version/eTag concepts in later implementation.

Caution / guardrail:

- No live approval/check-in/check-out execution in Wave 7 UI prompts.

### 10. Purview retention / sensitivity

Microsoft Purview supports retention and sensitivity controls across Microsoft 365.

Sources:

```text
https://learn.microsoft.com/en-us/purview/retention
https://learn.microsoft.com/en-us/purview/sensitivity-labels
```

Implementation implication:

- Retention/sensitivity display can be represented as metadata/future capability.
- Policy enforcement belongs in later backend/security review.

Caution / guardrail:

- Do not alter retention labels or sensitivity labels in Wave 7.

## External Systems Findings

### Procore

Procore’s Documents tool supports document storage/management, versions, checkout/locking, permissions, distribution, and tracking. Procore project identity is represented through project-scoped IDs in Procore API contexts.

Sources:

```text
https://learn.procore.com/documents-tool
https://developers.procore.com/documentation/getting-started
```

Implementation implication:

- Procore remains an external system of record.
- Wave 7 should render configured/missing/access states and launch/status only.
- `procoreProjectId` belongs in the Project Document Source Registry / external binding metadata.

Caution / guardrail:

- No Procore writeback.
- No Procore sync/mirror.
- No SPFx Procore API calls or secrets.

### Adobe Acrobat Sign

Adobe Acrobat Sign provides APIs and webhooks for agreement lifecycle events and status, but API access and agreement execution require separate authorization and governance.

Sources:

```text
https://developer.adobe.com/acrobat-sign/docs/
https://developer.adobe.com/acrobat-sign/docs/overview/acrobat_sign_events/
```

Implementation implication:

- Adobe Sign can be represented as an external source card with status/launch/deferred execution.
- Agreement execution and webhook handling are later integration work.

Caution / guardrail:

- No Adobe Sign agreement execution in Wave 7.
- No Adobe Sign API runtime, secrets, or writeback.

### Document Crunch

Document Crunch publicly describes construction contract/document workflows and integrations, including Procore-related integration posture.

Sources:

```text
https://www.documentcrunch.com/
https://www.documentcrunch.com/integrations
```

Implementation implication:

- Document Crunch should remain a linked external system in Wave 7.
- Render status/launch/missing-config/access-issue only.

Caution / guardrail:

- No runtime replication of Document Crunch data.
- No Document Crunch writeback/sync/mirror.

## Comparable Document-Control / Common Data Environment Findings

### Common Data Environment principles

Construction document management / CDE patterns emphasize controlled information containers, source-of-record clarity, workflow states, revision control, auditability, and role-aware access.

Sources:

```text
https://www.thenbs.com/knowledge/common-data-environments
https://www.bsigroup.com/en-GB/insights-and-media/insights/brochures/iso-19650-building-information-modelling/
```

Implementation implication:

- HB Document Control Center’s three-lane architecture is sound:
  - Project Record = formal source-of-record lane.
  - My Project Files = personal working-file lane.
  - External Systems = linked external source-of-record lane.
- Metadata and review state should be first-class, not afterthoughts.
- Personal working files must be clearly separated from formal project records.

Caution / guardrail:

- Do not blur My Project Files into formal record without explicit Submit to Project Record workflow.
- Do not mirror external systems into SharePoint without later authorization.

## Summary of Implementation Implications

The local agent should implement Wave 7 in the following conservative order:

1. SPFx fixture/read-model parity with backend Wave 7 shape.
2. Three-lane UI shell from read-model fields.
3. Permission/action rendering from read-model availability.
4. Safe degraded-source state rendering.
5. Reviews & Approvals summary.
6. Closeout and validation.

Do not implement live Microsoft Graph, SharePoint REST, PnP, Procore, Adobe Sign, or Document Crunch runtime behavior in this wave.
