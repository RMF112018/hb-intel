# 01 — Proposed Implementation Plan

## Objective

Implement a disciplined first remediation pass that materially improves the My Dashboard UX without prematurely committing to speculative backend architecture changes.

This plan is intentionally closed-decision and sequenced. It is not a brainstorming document.

---

# Implementation Principles

1. **Fix proven issues first.**
2. **Do not confuse latency measurement with latency remediation.**
3. **Make the dashboard feel intentional even when dependency reads are slow.**
4. **Preserve the compact two-card primary page.**
5. **Preserve existing successful Adobe Sign actionability and completed-view toggle behavior.**
6. **Do not introduce persistent caching yet.**
7. **Instrument before major backend rearchitecture.**

---

# Phase 1 — Render Both Primary Cards During Loading and Error Variants

## Current problem

`MyWorkHomeSurface` renders only Adobe while home readiness is `loading` or `error`.

## Required change

Make the surface render:

```text
My Projects card
Adobe Sign card
```

for:
- `loading`
- `error`
- `ready`
- `non-ready`

The readiness marker should remain, but it must no longer remove My Projects from the DOM.

## Target behavior

### Loading variant
- Hidden marker remains:
  - `data-my-work-readiness-state="loading"`
- My Projects card renders immediately and owns its existing compact loading block:
  - `data-my-projects-compact-state="loading"`
- Adobe card renders and remains in:
  - `data-adobe-sign-action-queue-state="loading"`

### Error variant
- Hidden marker remains:
  - `data-my-work-readiness-state="error"`
- My Projects card renders and starts its independent project-links read.
- Adobe card renders with backend-unavailable state.

## Required test updates

### `MyWorkHomeSurface.test.tsx`
Update tests so loading/error variants now assert:

```text
['my-projects-home', 'adobe-sign-action-queue']
```

instead of Adobe-only.

Add assertions that:
- My Projects card is present in loading variant.
- Its card-local compact loading block is present.

### `MyWorkSurfaceRouter.test.tsx`
Update router tests so unresolved home-envelope state still:
- shows the loading marker,
- does **not** falsely show a ready source-status marker,
- **does** mount My Projects,
- **does** allow My Projects to call its own `getMyProjectLinks()`.

---

# Phase 2 — Unify My Projects Client Ownership

## Current problem

`MyProjectsHomeCard` creates its own client via the factory instead of consuming the app-level client provider.

## Required change

Replace local client construction with:

```ts
const client = useMyWorkReadModelClient();
```

from:

```text
apps/my-dashboard/src/runtime/MyWorkReadModelClientProvider.tsx
```

## Required removals

Remove unnecessary `getApiToken` plumbing from:
- `MyProjectsHomeCardProps`
- `MyWorkHomeSurfaceProps`
- `MyWorkSurfaceRouterProps`
- the call from `MyWorkShell` into `MyWorkSurfaceRouter`

Retain `getApiToken` where it is genuinely still needed:
- `MyWorkShell` for Adobe Sign OAuth start
- `MyWorkReadModelClientProvider` for backend client construction

## Required test updates

### `MyProjectsHomeCard.test.tsx`
Currently mocks the client factory. Replace that with a provider-wrapped render helper using a stub client.

The tests should assert card behavior through the public runtime seam, not through local factory mocking.

---

# Phase 3 — Add Frontend Load Performance Marks

## Goal

Create a privacy-safe timing layer to prove whether load choreography improved and to quantify module-level usefulness.

## Closed decision

Use browser User Timing APIs:
- `performance.mark`
- `performance.measure`

Do **not** build a telemetry transport in this pass.

## Recommended helper

Create:

```text
apps/my-dashboard/src/runtime/myWorkPerformanceMarks.ts
```

Provide safe no-op wrappers:

```ts
markMyWork(name: string, detail?: Record<string, unknown>): void
measureMyWork(name: string, startMark: string, endMark: string, detail?: Record<string, unknown>): void
```

Requirements:
- no-op if `performance` unavailable,
- no thrown exceptions,
- details may include route IDs/module IDs/status classes only,
- no PII, project values, Adobe agreement values, or raw URLs.

## Required marks

### Shell
- `my-dashboard:shell:mounted`

### Backend client
For each route:
- `my-dashboard:request:<routeId>:start`
- `my-dashboard:request:<routeId>:end`
- `my-dashboard:request:<routeId>:duration`

Route IDs:
- `home`
- `project-links`
- `adobe-sign-recent-completions`

### Module usefulness
- `my-dashboard:module:my-projects:useful`
- `my-dashboard:module:adobe-sign-action-queue:useful`

A module becomes “useful” when it has resolved to one of:
- available with items,
- available empty,
- partial,
- auth/configuration/principal actionable state,
- source/backend unavailable with clear action state.

It should not wait for perfect success only.

---

# Phase 4 — Add Backend Stage-Duration Telemetry

## Goal

Make the backend sufficiently observable to identify the dominant latency component in a single App Insights evidence pass.

## 4A. Adobe path

Extend existing safe Adobe diagnostic emissions with durations.

### Required duration measurements
- principal resolution duration,
- token acquisition duration,
- refresh duration where applicable,
- Adobe search duration,
- full action-queue adapter duration.

### Recommended method
Add `durationMs` to existing event payloads rather than introducing redundant event families where practical.

Examples:
- `adobeSign.read.principalResolution.result`
- `adobeSign.read.tokenAcquisition.result`
- `adobeSign.read.refresh.result`
- `adobeSign.read.search.result`
- `adobeSign.read.actionQueue.result`

## 4B. Project Links path

Add new safe summary events through the existing Project Links diagnostics reporter.

### Recommended events

#### `myProjectLinks.read.sources.result`
Fields:
- `projectsDurationMs`
- `registryDurationMs`
- `projectsStatus`
- `registryStatus`
- `projectsRowCount`
- `registryRowCount`
- `projectsBounded`
- `registryBounded`

#### `myProjectLinks.read.reconcile.result`
Fields:
- `durationMs`
- `matchedItemCount`
- `sourceStatus`
- optional safe summary counts if already available and non-sensitive.

## 4C. Do not over-instrument yet

Do not immediately implement:
- GraphListClient per-request dependency telemetry,
- route serialization timing,
- Function host startup probes,
- cache telemetry.

Those become follow-on steps only if Phase 4 data still leaves root cause ambiguous.

---

# Phase 5 — Validation and Evidence Closeout

Run all required validations.

Then gather:

1. A fresh browser HAR or Network export for My Dashboard.
2. A screenshot or devtools capture showing both cards immediately present.
3. Application Insights queries for:
   - `/home` handler duration,
   - `/project-links` handler duration,
   - Adobe stage durations,
   - Project Links stage durations.

Fill out:
- `supporting/Performance_Evidence_Closeout_Template.md`

---

# Phase 6 — Follow-On Decision Gate

After evidence exists, determine whether to launch a second remediation package for:

## Option A — Project Links source optimization
Use if:
- source-loader durations dominate.

Likely moves:
- reduce source scan breadth,
- preproject user-to-project assignments,
- server-side cache,
- Graph metadata promise memoization.

## Option B — Adobe upstream optimization
Use if:
- token/search duration dominates.

Likely moves:
- token cache validation,
- refresh behavior review,
- bounded search tuning,
- Adobe API latency posture.

## Option C — Cold-start/hosting evaluation
Use only if:
- first request after idle is significantly slower than warm requests,
- handler stage durations do not explain total request duration,
- Azure telemetry shows host startup behavior matters.

---

# Completion Criteria

This implementation plan is complete only when:

- Both cards render during loading and error variants.
- `/project-links` can begin while `/home` remains pending.
- My Projects uses the shared provider client.
- Frontend User Timing marks exist.
- Backend stage durations exist.
- Test suites and type checks pass.
- Evidence closeout is prepared for a second-pass architecture decision.
