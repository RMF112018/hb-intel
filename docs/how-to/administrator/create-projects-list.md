# Create Projects List

## Purpose

This one-time procedure creates and verifies the SharePoint `Projects` list schema required for D-PH6-08 request lifecycle persistence.

## Prerequisites

- Managed Identity or service principal has list creation permissions on `SHAREPOINT_TENANT_URL`.
- `SHAREPOINT_TENANT_URL` is configured in the shell environment.
- Repository dependencies are installed.

## Run Script

From repository root:

```bash
pnpm exec tsx scripts/create-projects-list.ts
```

## Schema Created

List: `Projects`

Required fields:
- `Title` (built-in)
- `ProjectId`
- `ProjectName`
- `ProjectStage`

Optional fields:
- `ProjectNumber`
- `ProjectLocation`
- `ProjectType` (`GC`, `CM`, `Design-Build`, `Other`)
- `SubmittedBy`
- `SubmittedAt`
- `RequestState` (`Submitted`, `UnderReview`, `NeedsClarification`, `AwaitingExternalSetup`, `ReadyToProvision`, `Provisioning`, `Completed`, `Failed`)
- `GroupMembersJson`
- `ClarificationNote`
- `CompletedBy`
- `CompletedAt`
- `BdCreatedBy`
- `SiteUrl`

## Verification

1. Open SharePoint list settings and confirm all fields exist.
2. POST a request to `/api/project-setup-requests` and confirm a row appears.
3. PATCH `/api/project-setup-requests/{requestId}/state` through at least one transition and confirm `RequestState` updates.
