# 02 — Current State Component and Language Inventory

## Purpose

Inventory current PCC state components, mapping utilities, disabled-control helpers, and product-language sources.

## Shared Components and Utilities

| File | Role | Current finding | Required local verification |
|---|---|---|---|
| `apps/project-control-center/src/ui/PccPreviewState.tsx` | Shared state display primitive | Eight-state catalog with product-grade default copy and `reason` / `nextStep` slots. | Confirm local exact strings and determine whether target taxonomy requires an alias or expanded wrapper. |
| `apps/project-control-center/src/ui/PccPreviewState.module.css` | State visual styles | Supports root/header/title/description/reason/nextStep/action styling. | Verify no severity style is one-off or visually dominant beyond operational need. |
| `apps/project-control-center/src/ui/PccDisabledAffordance.tsx` | Inert action helper | Requires `reason`, optional `nextStep`, renders `aria-disabled`, `aria-describedby`; strips click handler. | Confirm all disabled controls use this or an equivalent approved pattern. |
| `apps/project-control-center/src/ui/PccDisabledAffordance.module.css` | Disabled affordance styles | Provides button/chip treatments plus reason/next-step copy. | Verify compact layouts do not hide the reason text. |
| `apps/project-control-center/src/ui/pccSurfacePostureCopy.ts` | Central posture copy | Provides `reference`, `loading`, `error`, `unavailable` copy for headers. | Determine whether `live`, `readOnly`, `degraded`, `blocked`, `setupRequired` should be added. |
| `apps/project-control-center/src/api/pccReadModelStateMapping.ts` | Read-model source status mapping | Maps source statuses to `PccPreviewStateKind`; `source-unavailable` maps to `unavailable-fixture`. | Verify user-facing state and DOM markers do not expose fixture vocabulary. |
| `apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts` | Documents source-state copy | Provides lane-specific copy for health, disabled, and envelope status. | Confirm all Documents lane UI consumes this copy. |
| `apps/project-control-center/src/tests/PccPreviewState.states.test.tsx` | State catalog tests | Exact-string matrix and accessibility attributes are covered. | Add tests if expanded taxonomy is introduced. |

## State Kinds Observed in Current Code

Current `PccPreviewState` states:

| Current kind | User-facing badge | Target taxonomy mapping | Comment |
|---|---|---|---|
| `preview` | Reference | `preview` or `readOnly` depending usage | Current copy is "Reference view"; verify product-owner preference. |
| `empty` | Empty | `empty` | Clear. |
| `loading` | Loading | `loading` | Clear; uses `aria-busy`. |
| `error` | Error | `error` | Clear; uses `role="alert"`. |
| `missing-config` | Setup needed | `setupRequired` | Good candidate for alias/rename at model layer. |
| `unavailable-fixture` | Unavailable | `unavailable` | Internal key is developer-facing; user copy is acceptable but key may leak through `data-pcc-state`. |
| `unauthorized-persona` | Restricted | `blocked` or `permission` | Target taxonomy does not list `permission`, but SPFx standard requires authorization handling. Preserve or map explicitly. |
| `not-yet-implemented-operation` | Unavailable | `readOnly` / `blocked` / `disabledAction` | Needs careful surface-specific classification. |

## Product Language Sources

| Area | Current language source | Action |
|---|---|---|
| Surface headers | `pccSurfacePostureCopy` plus `PccSurfaceContextHeader` props | Verify all routed surfaces use centralized copy. |
| State cards | `PccPreviewState` | Verify all empty/loading/error/setup/unavailable cards use shared component or approved variant. |
| Disabled actions | `PccDisabledAffordance` | Enforce usage and tests. |
| Documents lane health | `sourceStateMessaging.ts` | Keep surface-local; do not move into `@hbc/models`. |
| Readiness/lifecycle adapters | Adapter constants | Verify product copy and severity semantics. |
| Team & Access lanes | Lane card copy | Verify no "preview-safe", "inert preview", or "in this preview" remains in visible copy. |
| External Systems | Launch pad/cards/drawer copy | Verify not dominated by "unavailable" and explains owner/data direction/activation state. |
| Site Health | Overview/drift/security cards | Verify severity and action path are operationally explicit. |

## Forbidden Primary UI Vocabulary to Re-Check

Run local grep excluding tests, docs, comments, and internal-only type literals where appropriate:

```bash
rg -n --glob '!**/*.test.*' --glob '!**/*.md'   '"Read-only preview"|"Fixture default"|"Preview confidence"|"Pending envelope"|"Read-model available"|"Envelope confidence"|"Runtime envelope timestamp"|"Not connected in this prompt"|"in this preview"|"in this prompt"|"preview-safe"|"fixture-driven"|"preview mode"|"Inert preview"|">Preview only<"|\bWave [0-9]+\b|\bPrompt [0-9]+\b'   apps/project-control-center/src
```

Any hit in user-visible JSX, aria text, button text, card text, or surface header text is a Wave E defect unless it is deliberately hidden in admin diagnostics.
