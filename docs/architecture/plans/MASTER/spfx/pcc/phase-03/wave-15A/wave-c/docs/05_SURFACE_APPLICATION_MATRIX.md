# 05 — Surface Application Matrix

## Purpose

This matrix tells the local code agent exactly how the shared project context/header contract should apply to each current PCC surface.

## Common application rules

Every surface must:

- render exactly one active panel marker for its route;
- include exactly one primary surface context header for that route;
- display project number/name from the shared project context source;
- display surface label and purpose from the centralized surface registry or a shared surface-purpose map;
- display posture/source/freshness conservatively;
- expose next action or limitation where applicable;
- preserve direct `PccDashboardCard` children under `PccBentoGrid`.

## Surface-by-surface requirements

### 1. Project Home

Files:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
```

Requirements:

- Use project profile data as the source of project number, name, phase/status, type, client, and location.
- Do not use scheduled completion date as a generic last-updated label unless the label says `Scheduled completion`.
- Surface header should distinguish project identity from project facts.
- Preserve hero footprint and `data-pcc-active-surface-panel="project-home"`.

### 2. Team & Access

Files:

```text
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessReadModelContent.tsx
```

Requirements:

- Replace hard-coded project label with shared project context.
- State that invite/review execution is governed by access roles and administrator settings.
- Preserve read-only/deferred restrictions in lane cards.
- Validate that the surface reads as the selected project's team/access control center.

### 3. Documents

Files:

```text
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts
```

Requirements:

- Replace hard-coded project label with shared project context.
- Map `sourceStatus` to conservative source posture.
- If `source-unavailable`, show next step such as `Confirm document control source configuration`.
- Keep the three-lane Document Control Center mental model.

### 4. Project Readiness

Files:

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts
apps/project-control-center/src/surfaces/projectReadiness/lifecycleReadinessAdapter.ts
```

Requirements:

- Replace hard-coded readiness project labels with shared context.
- Surface active lifecycle gate, overall posture, blocker count, and evidence confidence as content facts.
- Header source confidence must not duplicate or conflict with evidence confidence.
- Preserve loading/error hero behavior.

### 5. Approvals

Files:

```text
apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx
apps/project-control-center/src/surfaces/approvals/approvalsAdapter.ts
```

Requirements:

- Replace hard-coded approvals project labels with shared context.
- Header must state no execution authority where actions are disabled.
- Preserve `PccDisabledAffordance` for disabled actions.
- Keep decision-history and lineage seam cards clearly deferred.

### 6. External Systems

Files:

```text
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx
apps/project-control-center/src/surfaces/externalSystems/launchPadAdapter.ts
```

Requirements:

- Use shared project context; `header.projectId` alone is not enough for user-facing identity.
- State that links open source systems in a new tab.
- Do not imply synchronization/writeback.
- Preserve launch-pad route and card structure.

### 7. Control Center Settings

Files:

```text
apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx
```

Requirements:

- Replace hard-coded governance project label with shared context.
- State that saving/updating is administrator-managed unless repo truth provides a real action path.
- Clearly show missing configuration posture where applicable.
- Do not add write controls.

### 8. Site Health

Files:

```text
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx
```

Requirements:

- Replace hard-coded project label with shared context.
- Distinguish project context from site health scan metadata.
- Last run may use `SAMPLE_SITE_HEALTH_SUMMARY.lastRunUtc`, labelled as scan last run.
- State that scans/repairs are managed by SharePoint admin tooling unless repo truth proves in-app controls exist.

## Acceptance matrix

| Surface | Must show project #/name | Must show lifecycle/status when available | Must show posture | Must show source/freshness | Must show next action/limitation | Must pass constrained screenshot |
|---|---:|---:|---:|---:|---:|---:|
| Project Home | Yes | Yes | Yes | Yes | Yes | Yes |
| Team & Access | Yes | If available | Yes | Yes | Yes | Yes |
| Documents | Yes | If available | Yes | Yes | Yes | Yes |
| Project Readiness | Yes | Yes | Yes | Yes | Yes | Yes |
| Approvals | Yes | If available | Yes | Yes | Yes | Yes |
| External Systems | Yes | If available | Yes | Yes | Yes | Yes |
| Control Center Settings | Yes | If available | Yes | Yes | Yes | Yes |
| Site Health | Yes | If available | Yes | Yes | Yes | Yes |
