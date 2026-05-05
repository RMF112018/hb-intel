# 02 — Current Project Context Inventory

## Inventory basis

This inventory reflects repo truth at `a79d62155` from the PCC source tree.

## Shell-level context

| Field | Current source | Current behavior | Gap |
|---|---|---|---|
| Project name | `PCC_PROJECT_PLACEHOLDER.projectName` | Displays `Project Control Center` in shell header. | App identity, not selected project identity. |
| Subtitle | `PCC_PROJECT_PLACEHOLDER.subtitle` | Displays `Project overview`. | Generic; not phase/status/persona-specific. |
| Date scope | `PCC_PROJECT_PLACEHOLDER.dateScope` | Displays `Last 12 Months` on larger modes. | Not tied to project source freshness. |
| Pills | `PCC_PROJECT_PLACEHOLDER.pills` | Displays `Reference`, `PCC`. | Not lifecycle/status/source-state aware. |
| Active surface label | `PCC_MVP_SURFACES[activeSurfaceId].displayName` | Updates per nav selection. | Good baseline. |
| Active surface purpose | `PCC_MVP_SURFACES[activeSurfaceId].description` | Updates per nav selection. | Some descriptions are too long or generic for constrained header. |
| Selected project id | `usePccShellState.selectedProjectId` | Stored in hook but not materially rendered by shell/surfaces. | Must be threaded or explicitly deferred. |

## Shared surface context header

Current component:

```text
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx
```

Current props:

```ts
surfaceId
projectLabel
postureLabel
sourceStatusLabel
sourceConfidenceLabel
lastUpdatedLabel
```

Current output markers:

```text
data-pcc-surface-context
data-pcc-surface-context-id
data-pcc-context-project
data-pcc-context-surface
data-pcc-context-surface-description
data-pcc-context-posture
data-pcc-context-source-status
data-pcc-context-source-confidence
data-pcc-context-last-updated
```

Current gaps:

- no normalized project number/project name fields;
- no project lifecycle/status field;
- no next action / limitation / operator guidance field;
- no mode/sourceStatus enum typing at the header boundary;
- string-only posture labels;
- no explicit responsive variant prop;
- no heading-level contract.

## Surface inventory

| Surface | Context header present | Project identity visible | Phase/status visible | Surface purpose visible | Operational state visible | Next action / limitation visible | Source confidence/freshness visible | Current issue |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Project Home | Yes | Yes, from `SAMPLE_PROJECT_PROFILE` / read model profile. | Yes in hero pills. | Yes via registry description. | Yes via posture copy and preview state. | Partial. | Partial; `lastUpdatedLabel` uses scheduled completion in current card. | Best implementation, but should align to shared contract. |
| Team & Access | Yes | Hard-coded project number label. | No. | Yes. | Yes via `PccPreviewState`. | Partial through preview copy and lane restrictions. | Generic `Reference`. | Needs normalized project context instead of hard-coded label. |
| Documents | Yes | Hard-coded project number label. | No. | Yes. | Yes, maps loading/error/source-unavailable. | Partial cue. | Generic posture strings; sourceStatus considered. | Needs normalized context and better source status mapping. |
| Project Readiness | Yes | Hard-coded project number label. | Partial through readiness hero active gate. | Yes. | Yes for loading/error/preview. | Partial through captions. | Generic posture strings; deeper cards carry evidence confidence. | Needs shared lifecycle/status and last-refresh rules. |
| Approvals | Yes | Hard-coded project number label. | No. | Yes. | Yes for loading/error/preview/unavailable. | Partial through disabled affordances. | Generic posture strings. | Needs normalized project context and explicit action limitation. |
| External Systems | Yes | Uses `header.projectId ?? 26-000-00`. | No. | Yes. | Partial. | Yes: opens source systems in new tab or state card. | Generic posture strings. | Needs project number/name display and source mapping clarity. |
| Control Center Settings | Yes | Hard-coded project number label. | No. | Yes. | Yes through preview/missing-config. | Yes: admin-managed. | Generic posture strings. | Needs clear governance/non-execution posture. |
| Site Health | Yes | Hard-coded project number label. | No. | Yes. | Yes through severity metrics. | Yes: admin tooling. | Last run from sample health summary. | Needs clear distinction between site-health scan timestamp and project context timestamp. |

## Duplicated or conflicting header layers

| Layer | Component | Purpose | Risk |
|---|---|---|---|
| Shell header | `PccProjectIntelligenceHeader` | App/project identity and active surface context. | Currently placeholder-driven; may compete with per-surface header if both use long descriptions. |
| Surface context header | `PccSurfaceContextHeader` | Project + surface + posture + source context inside active card. | Useful but string-only and repeated in each surface. |
| Card header | `PccDashboardCard` title/eyebrow | Card-level scan path. | May duplicate surface title where hero card title repeats surface label. |
| Preview state | `PccPreviewState` | Section-level state and limitation. | Not integrated into surface header next-action/limitation contract. |

## Current tests

| Test | Coverage | Gap |
|---|---|---|
| `PccSurfaceContextHeader.contract.test.tsx` | All surface ids render context markers and exactly one active panel. | Marker-only; no semantic project values, no heading order, no source/status mapping. |
| `PccPreviewState.states.test.tsx` | State copy, role/aria, reason/nextStep. | Does not prove surface header next-action integration. |
| Shell nav/responsive tests | Active nav and responsive mode. | Does not prove project context persists after route changes. |
| Surface-specific tests | Varies by surface. | Need consistent expectations for context header and operational posture. |

## Main remediation target

Create or harden a shared `PccProjectContext` / `PccSurfaceHeaderViewModel` boundary that supplies every surface header with consistent values and reduces surface-level hard-coded copy.
