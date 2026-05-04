# 01 — Global Shell and Navigation Wireframe Contract

## Locked Decisions Applied

| Decision | Locked Direction |
|---|---|
| MVP posture | Estimating Workbench is included in MVP scope. |
| First implementation | SharePoint/SPFx inside PCC. |
| PCC placement | Mount under `Project Readiness > Estimating Workbench`; no new top-level PCC navigation surface in MVP. |
| Cost-code hierarchy | MVP uses internal HB Cost Codes first; Sage mapping follows in a future phase. |
| Day-one templates | Commercial and Multifamily. |
| Workbook import | Template migration only; no active project workbook import in MVP. |
| Data posture | Workbook-like UX over canonical PCC estimating data records. |
| HBI posture | Grounded review/summarization only; no pricing authority, no award authority. |

## Objective

Define the shared PCC shell and navigation model used by every Estimating Workbench screen. This screen group is the frame that prevents the feature from becoming a disconnected estimating portal.

## Scope

This group covers:

- PCC host shell.
- Top app header.
- Left navigation rail.
- Project Readiness placement.
- Estimating Workbench secondary tab navigation.
- Global search/profile/notification placement.
- Persistent footer/MVP guardrail messaging.

## Primary Layout

```text
HB Intel / PCC Header
├── HB logo / product name
├── Project selector
├── Active project identity
├── Project stage chip: Preconstruction
├── Search this project
├── Notifications
└── User profile

Left PCC Rail
├── Project Home
├── Team & Access
├── Documents
├── Project Readiness  ← active
├── Approvals
├── External Systems
├── Control Center Settings
└── Site Health

Project Readiness > Estimating Workbench Tabs
├── Home
├── Template Selector
├── Estimate Builder
├── Cost Summary
├── Bid Leveling
├── Handoff Preview
└── Template Admin
```

## Navigation Rules

| Rule | Direction |
|---|---|
| Entry point | `Project Readiness > Estimating Workbench > Home`. |
| MVP top-level PCC nav | Do not create a new left-rail item for Estimating Workbench. |
| Secondary tabs | Estimating Workbench tabs are shown only after user enters Project Readiness / Estimating Workbench. |
| Project-stage behavior | `lead` and `estimating` may show upstream/provisioning-limited states; `preconstruction` is full MVP working state; `active_construction` is mostly review/handoff/history. |
| Breadcrumb | Each screen must show `PCC > Project Readiness > Estimating Workbench > {Screen}` in title or shell metadata. |
| Deep links | Screen URLs/state keys must allow direct opening to an estimate version, bid package, or validation issue where permission allows. |

## Shared Page Regions

| Region | Required Behavior |
|---|---|
| Header | Persistent across all screens; no estimator-specific chrome. |
| Left Rail | PCC navigation only; Estimating Workbench does not fork the PCC shell. |
| Secondary Tabs | Active tab has underline/accent; inactive tabs remain visible for context. |
| Main Canvas | 12-column bento/grid-style content area; no horizontal browser overflow. |
| Footer Guardrail | Show MVP guardrail text where useful: Commercial/Multifamily only; template migration only. |

## Shared Screen States

- Loading project context.
- Loading estimate context.
- No estimate created.
- No template selected.
- Read-only project stage.
- User lacks estimating access.
- Estimate version frozen.
- Estimate archived/superseded.
- Data stale / validation required.
- SharePoint read error.

## Developer Notes

- Build inside existing PCC surface architecture.
- Use fixture-first behavior before SharePoint-backed persistence.
- Do not add direct Sage/Procore writeback routes.
- Shell should be compatible with SPFx-hosted canvas constraints and responsive width changes.
- Keep the Estimating Workbench route/state shape distinct from source-system integration routes.

## Acceptance Criteria

- User can identify the active project, project stage, active PCC rail item, and active Estimating Workbench tab at all times.
- Estimating Workbench screens do not appear as an independent departmental workspace.
- Navigation works for Commercial and Multifamily template contexts.
- Unauthorized users see a clear read-only or unavailable state without hidden controls.
