# HB Intel My Dashboard — My Work Shell and Adobe Sign Action Queue

## Authoritative Comprehensive Development Plan

---

# 1. Title Page and Document Control

| Field                                | Value                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Document title                       | **HB Intel My Dashboard — My Work Shell and Adobe Sign Action Queue Comprehensive Development Plan**   |
| Artifact status                      | Final reconciled authoritative development plan                                                        |
| Prepared                             | **2026-05-13**                                                                                         |
| Initiative                           | HB Intel **My Dashboard** SPFx domain, **My Work shell**, and **Adobe Sign Action Queue** first module |
| Final repo-truth continuation anchor | `d59cdf7a3b0aa1acea357ab1083022c5fa4fbe3b`                                                             |
| Governing prior batch outputs        | Batch 01 through Batch 07                                                                              |
| Target SharePoint site               | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard`                                          |
| Final target hosted page             | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/Home.aspx`                      |
| Plan posture                         | Closed-decision planning artifact; no runtime implementation and no code-agent prompt package          |
| Downstream use                       | Authoritative source for later implementation-package decomposition and code-agent prompts             |

## 1.1 Document Purpose

This plan is the final architectural, implementation-readiness, and validation synthesis for the My Dashboard initiative. It reconciles:

- the original comprehensive outline,
- the Batch 01–07 development-planning artifacts,
- current repository truth at commit `d59cdf7a3b0aa1acea357ab1083022c5fa4fbe3b`,
- targeted vendor verification completed on **2026-05-13**,
- and the cross-batch contradictions that must not be carried into later implementation work.

This document is intended to eliminate the need for another architecture-discovery phase before generating a focused implementation prompt package.

## 1.2 Authority Hierarchy

The authority order for this initiative is:

1. **Current live repo truth** at the implementation start point.
2. **This final comprehensive development plan**.
3. **Applicable batch artifacts B01–B07** where they remain consistent with this reconciled plan.
4. **The prior umbrella outline**, now superseded as a final authority artifact.
5. **Historical prompt packages and intermediate planning notes**.

Where this final plan explicitly corrects earlier batch language because repository truth advanced after that batch was written, this plan governs.

## 1.3 Final Reconciliation Note

Batch 07 correctly described the repository at commit `9a1cefddd8c484623875bee6036ed4aee3b73660`. The repo then advanced before the Batch 08 synthesis. At commit `d59cdf7a3b0aa1acea357ab1083022c5fa4fbe3b`, the My Dashboard domain already contains a meaningful first tranche of B03 shell/navigation implementation:

- `apps/my-dashboard/src/MyDashboardApp.tsx`
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.tsx`
- `apps/my-dashboard/src/state/useMyWorkShellState.ts`
- `packages/models/src/myWork/MyWorkNavigation.ts`

Therefore, any prior language stating that the “real My Work shell” is wholly absent is no longer correct. The shell is **partially implemented**, while several planned downstream layers remain unbuilt.

---

# 2. Executive Summary

## 2.1 Strategic Purpose

**My Dashboard** should become HB Intel’s personal operating layer: a user-centered command surface that aggregates work requiring the authenticated employee’s attention across connected source systems.

The first implementation should establish:

- a repeatable personal-work shell architecture,
- a protected backend/read-model pattern,
- an external-system integration pattern,
- and a hosted evidence discipline suitable for future personal-work modules.

The **Adobe Sign** module lane is the first module because it is:

- clearly user-specific,
- source-system governed,
- read-only in HB Intel,
- operationally valuable,
- and complex enough to establish the architecture rigorously.

## 2.2 Final MVP Outcome

At successful MVP completion, a signed-in HB employee should be able to:

- open the My Dashboard SharePoint communication-site home page,
- view a polished **My Work** shell inside the standalone **HB Intel My Dashboard** web part,
- see a meaningful home-surface summary of work requiring attention,
- inspect Adobe Sign agreements that require the current user’s action,
- switch to a completed-agreements view in the same card header,
- understand the action category, source state, refresh state, and urgency cue where source data supports it,
- stay on the home surface and switch views within one Adobe Sign card,
- open Adobe Sign through a source handoff only where the backend provides a validated URL,
- receive clear, professional state messaging when:
  - no queue items are present,
  - configuration is incomplete,
  - authorization is required,
  - principal resolution fails,
  - the source is unavailable,
  - or backend transport is unavailable.

## 2.3 Final Architectural Thesis

The implementation must follow six non-negotiable principles:

1. **My Dashboard is user-contextual, not project-contextual.**
2. **The browser never owns Adobe secrets or tokens.**
3. **The UI consumes typed HB Intel read models, not raw Adobe payloads.**
4. **Source-system authority remains explicit.**
5. **Operational degradation is modeled intentionally, not hidden behind false empty states.**
6. **Hosted SharePoint validation and sanitized evidence are release gates, not optional polish.**

## 2.4 Current Repo Truth at the Final Synthesis Anchor

At `d59cdf7...`, repo truth already includes:

- standalone `apps/my-dashboard`,
- SPFx package metadata and web part manifest,
- `supportsFullBleed: true`,
- `HB SharePoint Creator` / `access_as_user` API permission request,
- runtime config and production-readiness seams,
- SPFx API token-provider mounting logic,
- package-orchestrator registration for `my-dashboard`,
- My Work shell container,
- My Work grouped navigation/menu behavior,
- My Work shell in-memory state,
- typed My Work navigation registry.

Still absent or incomplete at the final synthesis anchor:

- My Work hero/home view-model composition,
- My Work bento/home surface implementation,
- My Work read-model DTO contracts and fixtures,
- My Work frontend read-model clients,
- backend My Work read-model route host,
- Adobe Sign OAuth/grant store/provider implementation,
- Adobe Sign queue/completed card UI,
- My Dashboard hosted Playwright evidence lane,
- runtime package version proof seam for hosted validation,
- final repo documentation authority reconciliation.

---

# 3. Repo-Truth Audit Basis

## 3.1 Audit Objective

The final reconciliation audit validated the most load-bearing repo areas required by the attached Batch 08 objective:

- shell basis,
- packaging/auth/runtime basis,
- read-model/backend basis,
- validation/evidence basis,
- cross-batch terminology and architecture consistency.

## 3.2 Shell Basis — Final Findings

### Primary shell basis: PCC

The My Work shell should continue to inherit **PCC shell construction concepts**, not PCC product semantics.

The most relevant PCC precedents are:

- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/state/usePccShellState.ts`

My Dashboard should inherit:

- command-surface composition,
- grouped navigation concepts,
- active-panel semantic ownership,
- shell/router separation,
- container-responsive behavior,
- module selection inside the shell.

My Dashboard must **not** inherit:

- project-contextual data assumptions,
- PCC-specific project tab taxonomy,
- PCC’s project-selected state,
- legacy PCC `previewMode` assumptions where they do not belong.

### Secondary shell reference: HB Homepage

The HB Homepage shell remains a valid **secondary** reference for:

- communication-site layout reality,
- full-width host fit,
- shell orchestration discipline,
- evidence planning for page-host behavior.

It is not the My Work shell basis and must not become the navigation grammar or product structure.

## 3.3 My Dashboard Shell Repo Reality

The final plan must now recognize already-landed repo files:

```text
apps/my-dashboard/src/MyDashboardApp.tsx
apps/my-dashboard/src/shell/MyWorkShell.tsx
apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.tsx
apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.module.css
apps/my-dashboard/src/shell/useMyWorkContainerBreakpoint.ts
apps/my-dashboard/src/state/useMyWorkShellState.ts
packages/models/src/myWork/MyWorkNavigation.ts
packages/models/src/myWork/index.ts
```

These files already establish:

- a shell root and canvas,
- active panel semantics,
- navigation menu state,
- keyboard interactions for module menu behavior,
- typed module and primary-surface metadata,
- one MVP primary surface: `my-work-home`,
- one MVP module: `adobe-sign-action-queue`.

## 3.4 Packaging, Runtime, and Auth Basis — Final Findings

Current repo truth confirms:

- `apps/my-dashboard/config/package-solution.json`
- `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json`
- `apps/my-dashboard/src/mount.tsx`
- `apps/my-dashboard/src/config/runtimeConfig.ts`
- `apps/my-dashboard/src/config/productionReadiness.ts`
- `tools/build-spfx-package.ts`

The package is already configured as:

- standalone solution,
- `skipFeatureDeployment: true`,
- toolbox-visible,
- SharePoint-hosted,
- full-width capable,
- protected backend API access requester,
- fresh-build packaging target.

The API permission request is already aligned to:

```json
{
  "resource": "HB SharePoint Creator",
  "scope": "access_as_user"
}
```

The runtime config seam already supports:

```ts
functionAppUrl;
backendMode;
allowBackendModeSwitch;
apiAudience;
```

The final plan keeps this architecture unchanged.

## 3.5 Backend/Auth Basis — Final Findings

The backend already provides reliable protected-route precedents:

- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/middleware/request-id.ts`
- `backend/functions/src/utils/withTelemetry.ts`

Important repo-truth implications:

- bearer extraction and JWT validation already exist,
- `API_AUDIENCE` and tenant validation are enforced,
- `IValidatedClaims` includes:
  - `upn`,
  - `oid`,
  - `roles`,
  - optional `displayName`,
  - optional `jobTitle`,
  - optional `scp`,
  - optional `idtyp`,
- the validator distinguishes app-only token posture,
- lifecycle telemetry can capture sanitized route outcomes,
- request IDs are already standardized.

## 3.6 Read-Model and Route-Host Basis — Final Findings

PCC provides the correct precedent for My Work:

- typed read-model clients,
- route ID registries,
- fixture/backend client factory,
- backend host registration,
- `withAuth(withTelemetry(...))`,
- success/error response helpers,
- deterministic fixture behavior,
- graceful degraded client fallbacks.

Relevant files include:

- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClientFactory.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`

The final My Work plan should mirror the **architecture family**, not import PCC’s domain-specific types.

## 3.7 Validation and Evidence Basis — Final Findings

PCC’s live evidence harness remains the strongest precedent:

```text
e2e/pcc-live/
docs/architecture/evidence/pcc-live/
```

The My Dashboard lane should reuse:

- self-skip behavior when hosted env is absent,
- externalized storage-state auth files,
- curated evidence writers,
- redaction rules,
- structural runtime proof,
- package-version prechecks,
- screenshot-support plus DOM measurement,
- operator-pending conditional lanes.

The final My Dashboard hosted lane should be introduced under:

```text
e2e/my-dashboard-live/
docs/architecture/evidence/my-dashboard-live/
```

---

# 4. Product Taxonomy and Scope Lock

## 4.1 Canonical Product Vocabulary

| Concept                            | Canonical term                                             |
| ---------------------------------- | ---------------------------------------------------------- |
| SharePoint site                    | **My Dashboard**                                           |
| SPFx product/web part              | **HB Intel My Dashboard**                                  |
| Internal shell                     | **My Work shell**                                          |
| First surface                      | **My Work Home**                                           |
| First module                       | **Adobe Sign Action Queue**                                |
| Source handoff button language     | **Open in Adobe Sign** or **Open agreement in Adobe Sign** |
| Authenticated HB user              | **Authenticated actor**                                    |
| Mapped Adobe OAuth-backed identity | **Adobe principal**                                        |
| UI/backend data contract           | **Read-model envelope**                                    |

## 4.2 Canonical IDs

| Concept           | ID                        |
| ----------------- | ------------------------- |
| App/domain folder | `my-dashboard`            |
| Shell namespace   | `my-work`                 |
| Primary surface   | `my-work-home`            |
| First module      | `adobe-sign-action-queue` |

## 4.3 Distinct from PCC Adobe Sign

PCC may retain its own `adobe-sign` project-adjacent launch concept. My Dashboard’s `adobe-sign-action-queue` is different:

| Dimension             | PCC `adobe-sign`                 | My Dashboard `adobe-sign-action-queue` |
| --------------------- | -------------------------------- | -------------------------------------- |
| Context               | Project                          | User                                   |
| Purpose               | Project-related launch/reference | Current employee action queue          |
| Data posture          | Launch-oriented                  | Read-model-driven                      |
| Actor logic           | Project context                  | Authenticated person context           |
| Live integration need | Not equivalent                   | Delegated Adobe principal mapping      |

They must not be collapsed into a single product concept.

## 4.4 In-Scope for MVP

The MVP includes:

- standalone `apps/my-dashboard`,
- SPFx packaging and hosted deployment posture,
- My Work shell and grouped module navigation,
- My Work Home surface,
- Adobe Sign single-card module with in-header `Action Queue` / `Completed` views,
- typed My Work read-model contracts,
- frontend My Work read-model client factory,
- backend My Work read-model host,
- exact protected route family,
- delegated Adobe OAuth architecture,
- backend grant store abstraction,
- Adobe Sign search adapter/provider seam,
- source-state translation,
- safe handoff URL policy,
- fixture and backend modes,
- hosted communication-site validation lane,
- package/runtime evidence,
- implementation closeout documentation.

## 4.5 Explicitly Out of Scope for MVP

The MVP excludes:

- in-HB signing of agreements,
- in-HB approval of agreements,
- editing or cancelling agreements,
- sending new agreements,
- viewing full agreement document bodies in My Dashboard,
- cross-user queue access,
- manager proxy mode,
- admin impersonation,
- configurable user email overrides,
- automated reminders/escalations,
- Adobe webhook ingestion,
- durable cached queue persistence,
- universal “My Tasks” aggregation across all platforms,
- Teams personal app packaging,
- URL-persisted selected module state,
- action completion/writeback from HB Intel to Adobe Sign.

---

# 5. User Stories and UX Intent

## 5.1 Primary User

Authenticated HB employee using the My Dashboard communication site.

## 5.2 Primary User Story

> As an HB employee, I want to see Adobe Sign agreements that require my action so I can prioritize and open the source agreement efficiently.

## 5.3 Supporting User Stories

- As a user with no pending Adobe Sign work, I want a clear empty state so I know the queue is current.
- As a user, I want completed Adobe Sign agreements from the last 30 days to be available in the same card without opening another module route.
- As a user who has not authorized Adobe Sign, I want a clear authorization-required state rather than a blank module.
- As a user whose Adobe identity cannot be mapped, I want a calm, specific principal-resolution state rather than an opaque failure.
- As a user when the Adobe source is degraded, I want the dashboard to say so honestly.
- As a user with many pending agreements, I want the home card to stay compact and truthful while still providing source handoff where available.
- As a user, I want handoff links only when they are valid and safe.

## 5.4 UX Intent

The experience should be:

- professional and restrained,
- highly legible,
- source-authority aware,
- clear about read-only posture,
- responsive within a SharePoint full-width host,
- informative without being noisy,
- polished enough to establish the My Work shell as a flagship personal operating layer.

## 5.5 UX Copy Doctrine

Copy must avoid developer vocabulary such as:

- “provider failure,”
- “mock read model,”
- “OAuth grant missing,”
- “backend unavailable envelope.”

User-facing copy should instead say, as applicable:

- “Adobe Sign access needs to be connected.”
- “We could not confirm your Adobe Sign connection.”
- “Adobe Sign is temporarily unavailable.”
- “No agreements currently require your action.”
- “Open in Adobe Sign.”

Technical terms remain available in structured logs/tests/docs, not in end-user UI.

---

# 6. SharePoint Hosting and Deployment Contract

## 6.1 Final Target Site and Page

### Site

```text
https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard
```

### Page

```text
https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/Home.aspx
```

This plan closes the prior open item: **the home page is the final target host page**.

## 6.2 Full-Width Placement

The My Dashboard web part should be placed in a full-width communication-site section. Microsoft’s current SPFx guidance requires:

```json
"supportsFullBleed": true
```

for full-width placement, and confirms that the SharePoint workbench is not sufficient for final full-width validation; hosted communication-site testing is required. [M1]

## 6.3 Manifest Requirements

MVP manifest posture remains:

```json
"supportedHosts": ["SharePointWebPart"],
"supportsFullBleed": true
```

Teams support remains deferred.

## 6.4 Package Deployment Posture

The deployed package should remain:

- a standalone SPFx solution package,
- `skipFeatureDeployment: true`,
- toolbox-visible,
- manually placed on the MyDashboard home page by the authorized site owner/admin.

## 6.5 API Permission Approval

The SPFx solution already requests:

```text
Resource: HB SharePoint Creator
Scope: access_as_user
```

SharePoint admin approval remains required through the API access process before protected backend calls can succeed in hosted runtime. [M2]

## 6.6 Hosted Acceptance Gate

The initiative is not ready for release based on:

- local Vite success,
- workbench success,
- package build success,
- or unit tests alone.

Hosted acceptance requires:

- package deployment,
- page placement,
- permission approval,
- hosted runtime marker proof,
- hosted version proof,
- hosted responsive validation,
- hosted evidence output.

---

# 7. Repository and File Placement Contract

## 7.1 Current Repo Files Already Present

The final plan assumes the following are already in repo truth and should be preserved:

```text
apps/my-dashboard/
├── config/package-solution.json
├── src/
│   ├── mount.tsx
│   ├── MyDashboardApp.tsx
│   ├── config/
│   │   ├── runtimeConfig.ts
│   │   └── productionReadiness.ts
│   ├── shell/
│   │   ├── MyWorkShell.tsx
│   │   ├── MyWorkShell.module.css
│   │   ├── MyWorkPrimaryNavigation.tsx
│   │   ├── MyWorkPrimaryNavigation.module.css
│   │   └── useMyWorkContainerBreakpoint.ts
│   ├── state/
│   │   └── useMyWorkShellState.ts
│   └── webparts/myDashboard/
│       └── MyDashboardWebPart.manifest.json
packages/models/src/myWork/
├── MyWorkNavigation.ts
└── index.ts
```

## 7.2 Required Remaining App-Side File Families

### Shell/home additions

```text
apps/my-dashboard/src/
├── shell/
│   ├── MyWorkHeroBand.tsx
│   ├── MyWorkHeroBand.module.css
│   └── MyWorkSurfaceRouter.tsx
├── layout/
│   ├── MyWorkBentoGrid.tsx
│   └── MyWorkDashboardCard.tsx
├── surfaces/home/
│   ├── MyWorkHomeSurface.tsx
│   ├── MyWorkHomeSurface.module.css
│   ├── MyWorkSummaryCard.tsx
│   ├── MyWorkSourceReadinessCard.tsx
│   ├── myWorkHomeAdapter.ts
│   └── useMyWorkHomeReadModel.ts
```

### Frontend API/client additions

```text
apps/my-dashboard/src/api/
├── myWorkReadModelClient.ts
├── myWorkReadModelClientFactory.ts
├── myWorkBackendReadModelClient.ts
├── myWorkFixtureReadModelClient.ts
└── myWorkReadModelStateMapping.ts
```

### Adobe module additions

```text
apps/my-dashboard/src/modules/adobeSign/
├── AdobeSignActionQueueCard.tsx
├── AdobeSignActionQueueCard.module.css
├── AdobeSignActionQueueModule.tsx
├── AdobeSignActionQueueModule.module.css
├── AdobeSignActionQueueSummary.tsx
├── AdobeSignActionQueueList.tsx
├── AdobeSignActionQueueStateCard.tsx
├── AdobeSignActionQueueEmptyState.tsx
├── AdobeSignActionQueueFilters.tsx
├── adobeSignActionQueueAdapter.ts
└── useAdobeSignActionQueueReadModel.ts
```

## 7.3 Required Shared Model Placement

```text
packages/models/src/myWork/
├── MyWorkNavigation.ts                # exists
├── MyWorkReadModels.ts                # required
├── AdobeSignActionQueue.ts            # required
├── MyWorkReadModels.test.ts           # required
├── AdobeSignActionQueue.test.ts       # required
├── index.ts                           # exists; must expand exports
└── fixtures/
    ├── index.ts
    ├── myWorkHomeReadModels.ts
    └── adobeSignActionQueueReadModels.ts
```

## 7.4 Required Backend Host Placement

```text
backend/functions/src/hosts/my-work-read-model/
├── my-work-read-model-routes.ts
├── my-work-read-model-routes.test.ts
├── README.md
└── read-models/
    ├── my-work-read-model-provider.ts
    ├── my-work-mock-read-model-provider.ts
    └── adobe-sign/
        ├── adobe-sign-action-queue-provider.ts
        ├── adobe-sign-action-queue-adapter.ts
        ├── adobe-sign-agreement-search-client.ts
        ├── adobe-sign-principal-resolver.ts
        ├── adobe-sign-oauth-service.ts
        ├── adobe-sign-token-store.ts
        ├── adobe-sign-source-url-policy.ts
        └── adobe-sign-types.ts
```

## 7.5 Required Hosted Evidence Placement

```text
e2e/my-dashboard-live/
├── my-dashboard-live.env.ts
├── my-dashboard-live.page-object.ts
├── my-dashboard-live.surface-smoke.spec.ts
├── my-dashboard-live.runtime-proof.spec.ts
├── my-dashboard-live.focused-module.spec.ts
├── my-dashboard-live.breakpoints.spec.ts
├── my-dashboard-live.accessibility.spec.ts
├── my-dashboard-live.content-copy.spec.ts
├── my-dashboard-live.conditional.spec.ts
├── my-dashboard-live.screenshot.spec.ts
├── my-dashboard-live.evidence-writer.ts
├── my-dashboard-live.sanitization.ts
├── my-dashboard-live.package-completeness.ts
└── README.md

docs/architecture/evidence/my-dashboard-live/
└── my-dashboard-live-v<package-version>-<timestamp>/
```

---

# 8. Packaging and Runtime Registration Contract

## 8.1 Current Package Identity

Current package posture should remain:

| Item                                 | Value                                  |
| ------------------------------------ | -------------------------------------- |
| Solution name                        | `hb-intel-my-dashboard`                |
| Solution version at synthesis anchor | `1.0.0.1`                              |
| Web part manifest version            | `1.0.0.1`                              |
| Zipped package                       | `solution/hb-intel-my-dashboard.sppkg` |
| Web part ID                          | `412eb9fd-2eb2-4f7d-a4f1-7865e339a369` |

## 8.2 Existing Runtime Marker

`apps/my-dashboard/src/mount.tsx` already publishes:

```text
__hbIntel_myDashboard
```

with:

```ts
runtimeMarkerId;
```

This should remain.

## 8.3 Required Runtime Version Proof Enhancement

Before hosted validation can be considered complete, the global runtime marker must expose a governed version proof such as:

```ts
runtimePackageVersion;
```

or an equivalent compile-time/runtime-bound value derived from the package version authority.

Hosted evidence must assert:

- marker exists,
- `runtimeMarkerId` equals manifest web part ID,
- runtime package version equals expected package version,
- no marker/version mismatch exists.

## 8.4 Build Orchestrator Registration

`tools/build-spfx-package.ts` already includes:

```ts
{
  dir: 'my-dashboard',
  camel: 'myDashboard',
  pascal: 'MyDashboard',
  packagingModel: 'single',
  freshBuildRequired: true,
}
```

This should be preserved.

## 8.5 Package Truth Proof — Required Expansion

The current critical runtime paths correctly prove the B02 scaffold. Because B03 shell/navigation code is now in repo truth, the package proof list should be expanded to include at least:

```text
apps/my-dashboard/src/shell/MyWorkShell.tsx
apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.tsx
apps/my-dashboard/src/state/useMyWorkShellState.ts
packages/models/src/myWork/MyWorkNavigation.ts
```

As later implementation lands, the proof list should also include:

```text
apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModule.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
```

## 8.6 Metadata Drift Fix Required

`apps/my-dashboard/config/package-solution.json` currently describes the feature as deploying to **HBCentral**. That is taxonomy drift.

The implementation plan must correct the feature description to match:

- **My Dashboard**
- the **MyDashboard communication site**
- and the standalone **HB Intel My Dashboard** domain.

---

# 9. My Work Shell Architecture

## 9.1 Shell Architecture Objective

The My Work shell must become the reusable operating container for personal work modules inside My Dashboard.

The shell owns:

- overall layout,
- command-surface hierarchy,
- active panel semantics,
- primary surface selection,
- module focus selection,
- responsive shell mode,
- hero placement,
- bento/canvas boundaries.

Modules own:

- source-specific data mapping,
- module-specific states,
- summary/list rendering,
- filtering,
- pagination,
- refresh controls,
- CTA visibility.

## 9.2 Final Shell Composition

Target composition:

```text
MyDashboardApp
└── MyWorkShell
    ├── MyWorkCommandSurface
    │   ├── MyWorkPrimaryNavigation        # partially present
    │   └── MyWorkHeroBand                 # required
    └── MyWorkCanvas
        └── MyWorkActiveSurfacePanel
            └── MyWorkBentoGrid / Focused Module Surface
```

## 9.3 Current Implemented Shell Semantics

Already present:

- `data-my-work-shell`
- `data-my-work-shell-mode`
- `data-my-work-view-state`
- `data-my-work-command-surface`
- `data-my-work-canvas`
- `data-my-work-active-surface-panel`

The final implementation should preserve these selectors and extend them carefully.

## 9.4 Required Shell Additions

Required additions include:

- hero band,
- active surface router,
- bento/grid container,
- surface-specific home composition,
- focused-module composition branch,
- loading/refresh status surfaces where appropriate.

## 9.5 Responsive Behavior

The shell must be container-aware and function in:

- phone,
- tablet portrait,
- tablet landscape,
- small laptop,
- standard laptop,
- large laptop,
- desktop,
- ultrawide.

The implementation should align with the responsive discipline already established across PCC and My Dashboard’s current `useMyWorkContainerBreakpoint.ts`.

## 9.6 Accessibility Semantics

The shell must preserve and test:

- `tablist` / `tab` / `tabpanel`,
- `aria-selected`,
- `aria-controls`,
- `aria-labelledby`,
- keyboard activation with `Enter` / `Space`,
- keyboard menu behavior for grouped modules,
- no invalid nested interactivity,
- clear visible focus states.

The WAI-ARIA Tabs Pattern remains the accessibility reference for this model. [W1]

---

# 10. Navigation Model

## 10.1 Current MVP Navigation Registry

Already present in repo:

- primary surface: `my-work-home`,
- module: `adobe-sign-action-queue`.

Current registry state:

| Item            | Current repo value        |
| --------------- | ------------------------- |
| Primary surface | `my-work-home`            |
| Module          | `adobe-sign-action-queue` |
| Module state    | `read-only`               |
| Source system   | `Adobe Sign`              |
| Selectable      | `true`                    |

## 10.2 MVP Navigation Behavior

Closed behavior:

- one primary tab at MVP,
- one selectable module,
- grouped module menu under the primary surface,
- module selection updates in-memory shell state,
- focused module renders inside the active panel,
- selecting the primary surface clears focused module state,
- no URL persistence in MVP.

## 10.3 Navigation State Vocabulary

The registry should continue to support:

- `available`
- `preview`
- `read-only`
- `configuration-required`
- `authorization-required`
- `principal-unresolved`
- `source-unavailable`
- `deferred`

## 10.4 Future Extensibility

Future modules may include:

- My Responsibilities,
- My Approvals,
- Upcoming Deadlines,
- external platform work queue summaries.

Those modules are **not** rendered as hollow placeholders in MVP.

---

# 11. Hero and My Work Home Surface Specification

## 11.1 Hero Purpose

The hero should anchor:

- page identity,
- active workspace identity,
- broad personal-work purpose,
- refresh/source-state context at a restrained level.

## 11.2 Hero Text

### Primary title

```text
My Dashboard
```

### Secondary title

```text
My Work
```

### Description

Use production-grade copy similar in intent to:

> A personal command surface for work that needs your attention across connected HB systems.

Exact copy may be refined during UI implementation, but the purpose must remain stable.

## 11.3 Hero Data

Permitted hero facts:

- authenticated user display name where naturally available,
- total currently surfaced action items,
- last refreshed timestamp,
- broad source-health summary only when useful.

Avoid:

- duplicating detailed Adobe queue breakdowns that belong in the queue card,
- technical runtime/debug copy,
- exposing authorization internals.

## 11.4 Home Surface Bento Choreography

### Ready / partial source states

Render:

1. **Work Summary Card**
2. **Adobe Sign Action Queue Card**

Optional if materially helpful:

3. **Source Readiness Card**

### Non-ready Adobe states

Render:

1. **Work Summary Card**
2. **Adobe Queue State Card**
3. **Source Readiness Card**

## 11.5 Home Card Purposes

### Work Summary Card

- total action-item count,
- connected/degraded source count,
- concise orientation.

### Adobe Sign Action Queue Card

- pending count,
- actionable type mix,
- up to five preview items if available,
- “View queue” affordance.

### Source Readiness Card

- configuration/authorization/principal/source status summary,
- calm explanation,
- where appropriate, an authorize/reconnect action only if the live OAuth implementation is enabled.

---

# 12. Read-Model Architecture

## 12.1 Core Architectural Decision

My Dashboard must use a dedicated **My Work read-model contract family**, not raw source payloads and not a duplicate of the existing cross-module `@hbc/my-work-feed` product primitive.

This is a BFF/read-model layer tailored to the My Dashboard UI.

## 12.2 Final Route Family

```http
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
```

No actor/user override may exist in path or query.

## 12.3 Envelope Contract

Final envelope posture:

```ts
export interface MyWorkReadModelEnvelope<T> {
  readonly mode: 'fixture' | 'backend';
  readonly sourceStatus:
    | 'available'
    | 'partial'
    | 'configuration-required'
    | 'authorization-required'
    | 'principal-unresolved'
    | 'source-unavailable'
    | 'backend-unavailable';
  readonly readOnly: true;
  readonly warnings: readonly MyWorkReadModelWarning[];
  readonly generatedAtUtc: string;
  readonly data: T;
}
```

## 12.4 Warning Contract

Warnings should use structured codes, for example:

- `partial-source-data`
- `configuration-required`
- `authorization-required`
- `principal-unresolved`
- `source-unavailable`
- `backend-unavailable`
- `stale-cache-used`
- `result-set-truncated`
- `source-open-url-omitted`
- `unsupported-source-status-filtered`

Warnings are for stable contract mapping, logging, and test assertions. They are not raw UI copy.

## 12.5 Home Read Model

The home read model must include:

- actor display snapshot,
- overall summary counts,
- source readiness entries,
- Adobe Sign home projection:
  - summary,
  - preview items,
  - status.

This allows the home queue card to render without requiring an immediate second route call.

## 12.6 Focused Queue Read Model

The Adobe queue read model must include:

- queue summary,
- item collection,
- pagination metadata,
- refresh/freshness metadata,
- source handoff eligibility fields,
- no UI copy,
- no raw upstream payloads.

## 12.7 Frontend Client Contract

Final frontend interface:

```ts
getMyWorkHome()
getAdobeSignActionQueue(query?)
```

where queue query supports only:

```ts
pageSize?
cursor?
```

No user email, user ID, arbitrary sort override, arbitrary source filter, or raw search pass-through is allowed.

## 12.8 Fixture vs Backend Mode

Mode semantics:

| Mode      | Meaning                                                           |
| --------- | ----------------------------------------------------------------- |
| `fixture` | UI consumes deterministic fixture output or safe client fallback. |
| `backend` | UI successfully consumed protected backend route output.          |

The frontend envelope mode does **not** express whether the backend itself used a mock provider or live Adobe provider.

---

# 13. Adobe Sign Queue Contracts

## 13.1 Action Queue Item Contract

The queue item must include stable normalized fields such as:

```ts
agreementId
agreementName
senderName?
senderEmail?
requiredAction
rawAdobeStatus
createdAtUtc?
modifiedAtUtc?
expirationAtUtc?
sourceOpenUrl?
```

## 13.2 Required Action Categories

Final MVP action categories:

- `signature`
- `approval`
- `acceptance`
- `acknowledgement`
- `form-filling`
- `delegation`

## 13.3 Exact Adobe Status Union

The MVP queue supports exactly:

- `WAITING_FOR_MY_SIGNATURE`
- `WAITING_FOR_MY_APPROVAL`
- `WAITING_FOR_MY_ACCEPTANCE`
- `WAITING_FOR_MY_ACKNOWLEDGEMENT`
- `WAITING_FOR_MY_FORM_FILLING`
- `WAITING_FOR_MY_DELEGATION`

Adobe documents these recipient states as current-user action-required statuses. [A4]

## 13.4 Explicitly Deferred Adobe Statuses

Do not silently add:

- `WAITING_FOR_MY_VERIFICATION`
- `WAITING_FOR_PREFILL`

Those require a deliberate product decision, DTO update, UX review, and fixture/test expansion.

## 13.5 Summary Contract

The summary model should support:

```ts
totalPending;
awaitingSignature;
awaitingApproval;
awaitingOtherAction;
expiringSoon;
countBasis;
```

`countBasis` must make clear whether counts are:

- based on the currently returned page,
- or provider-wide totals proven by the backend/provider.

The UI must not misstate page-local counts as global counts.

## 13.6 Urgency Threshold — Final Decision

This plan closes the urgency threshold:

```text
Expiring soon = expiration date within 7 calendar days.
```

Rules:

- only show this cue when `expirationAtUtc` is source-supported,
- do not invent due dates,
- do not claim “overdue” unless the source date has passed and the item still returns as actionable,
- sort display may use urgency locally, but upstream sort claims must remain aligned with what Adobe search actually supports.

---

# 14. SPFx Backend Authentication Contract

## 14.1 Browser-to-Backend Pattern

The browser must acquire an API-audience-scoped token through the governed SPFx auth path and send:

```http
Authorization: Bearer <token>
```

with protected backend read-model requests.

## 14.2 Existing Mount Wiring

`apps/my-dashboard/src/mount.tsx` already:

- bootstraps SPFx auth,
- resolves permissions,
- creates the API token provider when `apiAudience` is configured,
- passes `getApiToken` into the app.

This wiring remains the architectural foundation.

## 14.3 Runtime Inputs

Required runtime inputs remain:

```ts
functionAppUrl;
backendMode;
allowBackendModeSwitch;
apiAudience;
```

No additional browser-owned Adobe token/config key should be introduced.

## 14.4 Token Handling Rules

The My Dashboard app must:

- acquire tokens on demand through the provider seam,
- never persist bearer tokens in application storage,
- never log tokens,
- never pass tokens deeper into component trees than required,
- surface safe readiness failures where the token provider cannot initialize.

## 14.5 Backend Validation

The backend already validates:

- issuer,
- audience,
- tenant,
- subject claims,
- token shape.

The My Work routes should use this existing foundation rather than build parallel auth logic.

---

# 15. Authenticated Actor → Adobe Principal Resolution Contract

## 15.1 Final Principal-Mapping Decision

Adobe queue access must be keyed to a stable HB actor identity, not mutable email-like claims.

### Final MVP actor key

```text
configured tenant ID + claims.oid
```

Microsoft recommends stable identity keys such as `tid` + `oid` and warns against using `email`, `preferred_username`, or `upn` for authorization-bound data decisions. [M3] [M4]

## 15.2 Use of UPN / Display Name

Permitted:

- display text,
- diagnostics,
- consent UI explanation,
- operator-safe support references where appropriate.

Not permitted:

- authorization key,
- grant lookup key,
- cross-user source resolution key.

## 15.3 App-Only Token Posture

The Adobe queue is user-contextual. Therefore:

- app-only tokens are not acceptable queue principals,
- `idtyp === 'app'` or absent delegated-user identity maps to a non-ready actor/principal result,
- the route must not query Adobe on behalf of an app-only identity for this user queue.

## 15.4 Principal Resolver Responsibilities

The resolver must:

1. receive validated backend claims,
2. derive stable actor key,
3. reject non-delegated queue posture,
4. look up the actor’s Adobe grant record,
5. return one of:
   - `resolved`,
   - `authorization-required`,
   - `principal-unresolved`,
   - `configuration-required`,
   - `source-unavailable`.

## 15.5 No Fallback Impersonation

Prohibited:

- shared Adobe account fallback,
- admin impersonation,
- email search fallback,
- tenant-wide account query fallback for an unresolved actor.

If the actor cannot be mapped safely, the UI receives a principal-resolution state.

---

# 16. Adobe Authentication Architecture Gate

## 16.1 Final Authentication Baseline

The live Adobe integration must use:

```text
Delegated Adobe OAuth authorization-code flow
```

This supports the “my queue” product promise.

## 16.2 Acrobat Sign App Type

Final app posture:

```text
CUSTOMER
```

Adobe describes CUSTOMER applications as applications for an organization’s own account or internal use/testing. PARTNER posture is for multi-account/other-customer access and carries different certification implications. [A1]

## 16.3 OAuth Scope Baseline

Minimum queue-read scope:

```text
agreement_read:self
```

No broader scope should be introduced unless a verified implementation dependency requires it.

## 16.4 Required Backend OAuth Components

The implementation must provide:

- authorization-start endpoint,
- callback endpoint,
- state validation,
- code exchange,
- secure grant record persistence,
- refresh-token lifecycle service,
- reauthorization handling,
- source-state translation.

## 16.5 OAuth Callback Data to Preserve

The backend should persist or safely process:

- authorization state,
- `api_access_point`,
- `web_access_point`,
- token metadata,
- granted scopes,
- refresh-token lifecycle timestamps.

Adobe documents access-point context as part of OAuth/token flows and its multi-sharded API architecture requires the correct access point for subsequent API requests. [A2] [A3]

## 16.6 Token Storage Posture

Access tokens and refresh tokens are credentials.

Final rules:

- no Adobe token storage in SPFx,
- no token logging,
- encrypted refresh-token storage server-side,
- transient access-token use server-side only,
- refresh failure maps to `authorization-required`.

Adobe documents one-hour access tokens and 60-day inactivity expiry for refresh tokens. [A2]

## 16.7 MVP Inclusion vs Release Gate — Final Resolution

The **architecture and implementation scope** include the OAuth onboarding path.

The **release posture** is gated:

- fixture/configuration-state UI may ship before live Adobe dependencies are operational,
- production-live Adobe provider completion requires:
  - CUSTOMER app registration,
  - client credentials in approved secret management,
  - redirect URI,
  - grant store,
  - token encryption,
  - hosted live validation.

This closes the prior open item without forcing a false claim that every external tenant prerequisite already exists.

---

# 17. Adobe Sign Query Contract

## 17.1 Final Retrieval Endpoint

Use:

```text
POST v6/search
```

as the primary live retrieval endpoint for the queue.

Adobe’s current best-practice guidance distinguishes `GET v6/agreements` from `POST v6/search` and recommends search when filtered agreement retrieval is needed by status, role, ownership, dates, or other advanced criteria. [A3]

## 17.2 Search Criteria

The provider should construct bounded search requests that target:

- actor-relevant agreements,
- agreement asset type,
- exact six-status actionable union,
- role/ownership posture where needed,
- controlled pagination,
- source-supported sort options only.

## 17.3 Page Size

Final MVP defaults:

| Surface                        | Page size                           |
| ------------------------------ | ----------------------------------- |
| Dashboard home preview         | Up to 5 items after normalization   |
| Focused queue initial page     | 25 items                            |
| Focused queue subsequent pages | Cursor-based controlled “Load more” |

## 17.4 Pagination — Final Decision

The focused Adobe queue will support:

```text
Explicit cursor-based “Load more” pagination in MVP.
```

It will not use infinite scroll.

Rationale:

- the backend route already has a cursor contract,
- explicit pagination preserves user control,
- it avoids an overloaded home card,
- it supports larger queues without introducing a full table product.

## 17.5 Sort Posture

The plan must avoid overstating what upstream search guarantees. The provider may use Adobe-supported sort fields if verified in the live query contract, and the UI may locally emphasize urgency cues.

Final plan language:

- do not promise “nearest expiration first” unless the implemented Adobe search request proves that upstream behavior,
- local presentation may surface expiring-soon cues using normalized `expirationAtUtc`.

## 17.6 Detail Enrichment Limits

Do not introduce unbounded per-agreement detail loops.

Any enrichment beyond the base search result must be:

- bounded,
- justified,
- tested,
- and controlled by operational budgets.

## 17.7 Access Point Handling

The provider must use the correct Adobe API access point and must not hardcode a single regional shard. Adobe’s current guidance emphasizes use of the account/user-specific access point context. [A3]

---

# 18. Backend Route and Error Taxonomy

## 18.1 Route Family

```http
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
```

## 18.2 Route Registration Pattern

Follow PCC route-host precedent:

- `app.http(...)`,
- `methods: ['GET']`,
- `authLevel: 'anonymous'` at registration,
- actual route protection through `withAuth(...)`,
- lifecycle telemetry through `withTelemetry(...)`,
- request ID propagation,
- standardized success/error helper usage.

## 18.3 Source-State vs HTTP-State Separation

### HTTP 200 + typed envelope

Expected business/source states:

- available,
- empty queue,
- partial,
- configuration-required,
- authorization-required,
- principal-unresolved,
- source-unavailable.

### HTTP 400

Use for malformed client query input, such as:

- invalid page size,
- malformed cursor form if validation is possible.

### HTTP 401

Use for:

- missing bearer token,
- malformed bearer token,
- failed token validation.

### HTTP 403

Use if a future policy layer rejects an otherwise authenticated caller for a governed route. Do not invent this path unless the policy exists.

### HTTP 500

Use for:

- unhandled HB backend failures that cannot be translated into an expected source-state envelope.

## 18.4 Final Source-Unavailable Transport Decision

This plan closes the prior open item:

```text
Expected upstream Adobe source degradation returns HTTP 200 with a valid degraded My Work envelope.
```

This preserves stable UI state rendering and aligns with the previously defined B04/B06 contract.

## 18.5 No Raw Provider Leakage

The route layer must not leak:

- raw Adobe error bodies,
- tokens,
- OAuth codes,
- source-open URLs,
- queue row payload dumps,
- sender identity details in generic errors.

---

# 19. Runtime Config and Production Readiness

## 19.1 Current Runtime Config Contract

Already implemented:

```ts
functionAppUrl?: string
backendMode?: 'production' | 'ui-review'
allowBackendModeSwitch?: boolean
apiAudience?: string
```

This contract should remain stable.

## 19.2 Backend Mode Behavior

| Mode         | Purpose                                                       |
| ------------ | ------------------------------------------------------------- |
| `production` | Protected backend route activation when readiness checks pass |
| `ui-review`  | Deterministic review/fixture posture where enabled            |

## 19.3 Production Readiness Checks

The app already evaluates:

- Function App URL presence,
- API token provider presence.

This should be extended only where necessary to report additional My Dashboard readiness, not to put Adobe secrets in the browser.

## 19.4 New Readiness Gates Required

The final implementation should distinguish:

### Frontend production readiness

- function app URL configured,
- API audience configured,
- SPFx token provider created,
- backend mode allowed.

### Adobe provider readiness

- Adobe CUSTOMER app configured server-side,
- OAuth endpoints configured,
- grant store available,
- encryption/secret storage available,
- required scopes approved,
- live provider explicitly enabled.

Frontend UI may render a clear configuration-required state when Adobe provider readiness is not satisfied.

---

# 20. Source Handoff Contract

## 20.1 Core Rule

A row-level handoff CTA may render only when the backend provides a validated source URL.

## 20.2 DTO Seam

The queue item may include:

```ts
sourceOpenUrl?: string
```

This field remains optional and may be absent without degrading the underlying queue item itself.

## 20.3 Prohibited Behavior

The UI must not:

- guess Adobe portal URLs,
- synthesize row URLs from agreement IDs,
- use signing URLs as a generic queue-row open contract,
- display unsafe or unvalidated URLs.

## 20.4 Signing URL Posture

Adobe’s signing URL flow is associated with hosted signing behavior and timing constraints; it is not a general-purpose durable row-open URL. [A3]

Therefore:

```text
Signing URL is not the default queue-row CTA contract.
```

## 20.5 Module-Level Launch

A module-level launch such as:

```text
Open Adobe Sign
```

may be supported if derived from a backend-vetted `web_access_point` posture and validated against the source URL policy.

## 20.6 URL Validation Policy

The backend must validate URLs using rules analogous to PCC external URL policy:

- HTTPS only,
- allowed host posture,
- no credential-bearing query values,
- no malformed URL pass-through,
- no opaque untrusted redirects.

---

# 21. Adobe Sign Module UI Specification

## 21.1 Home Card

The dashboard card should contain:

- module title,
- read-only/source-authority cue,
- pending total,
- action-type summary,
- expiring-soon indicator where supported,
- preview items up to five,
- “View queue” affordance.

## 21.2 Focused Module

The focused module should contain:

1. **Queue Summary**
2. **Source / connection state cue**
3. **Filters or compact segmentation where useful**
4. **Action item list**
5. **Explicit Load more pagination**
6. **Manual Refresh**
7. **State card / empty state when appropriate**

## 21.3 Focused Queue Filters

MVP filters should remain limited and derived from normalized queue data. Recommended:

- all,
- signature,
- approval,
- other action.

Do not add arbitrary source query inputs or unbounded custom search in MVP.

## 21.4 State Cards

Dedicated state cards should exist for:

- empty,
- configuration-required,
- authorization-required,
- principal-unresolved,
- source-unavailable,
- backend-unavailable,
- partial/degraded.

## 21.5 CTA Copy

Permitted row CTA labels:

- `Open in Adobe Sign`
- `Open agreement in Adobe Sign`

Avoid:

- `Open`
- `View`
- `Click here`

unless an accessible-name strategy explicitly preserves purpose.

## 21.6 Read-Only Authority Cue

The UI must make clear:

```text
Queue visibility is provided in HB Intel. Agreement actions remain in Adobe Sign.
```

This cue may be styled as a compact module subtext or support line.

---

# 22. Refresh, Cache, Staleness, and Throttling Contract

## 22.1 Refresh Behavior — Final Decision

MVP behavior:

- load home/read-model state on render,
- load focused queue when user enters the focused module,
- support **manual refresh in the focused module only**,
- prevent duplicate in-flight refreshes,
- debounce repeated clicks.

## 22.2 Auto-Polling — Final Decision

```text
No auto-polling in MVP.
```

Adobe’s current throttling/polling posture supports avoiding unnecessary repeated API scans; provider guidance emphasizes respecting retry timing and avoiding excessive polling. [A5] [A6]

## 22.3 Cache Posture — Final Decision

```text
No durable queue cache in MVP.
```

No persisted “last known queue” may be shown as if current.

A later short-lived/cache or webhook-backed design requires a separate architecture decision and privacy/staleness review.

## 22.4 Staleness Semantics

Required fields:

- `generatedAtUtc`
- `isStale`

Rules:

- `generatedAtUtc` is always populated.
- `isStale` is only true for a real stale-data condition.
- “Last refreshed” is appropriate for non-stale available responses.
- stale/provider-unavailable data must never be represented as current.

## 22.5 Rate-Limit Handling

The Adobe provider must:

- recognize `429`,
- honor `Retry-After`,
- avoid tight retry loops,
- use bounded transient retries only where safe,
- return controlled degraded source state where recovery exceeds the route’s interactive budget.

Adobe’s best-practice guidance explicitly advises use of `Retry-After`, backoff, and avoidance of hammering APIs after `429`. [A5]

## 22.6 October 2025 GET Polling Note

Adobe’s release notes indicate additional polling-policy treatment for GET endpoints in late 2025. The queue’s `POST v6/search` posture, no-auto-polling decision, and controlled manual refresh remain directionally aligned with that evolving provider stance. [A6]

---

# 23. Security, Privacy, and Telemetry Contract

## 23.1 Security Foundation

The implementation must preserve:

- browser-to-HB backend API token separation,
- backend-only Adobe token handling,
- stable actor mapping,
- no cross-user fallback,
- no secret material in SPFx,
- no source URL guessing.

## 23.2 Telemetry Allowlist

Permitted telemetry fields include:

- route name,
- operation name,
- correlation ID,
- duration,
- status class,
- source-state category,
- provider failure classification,
- count metrics,
- retryable/non-retryable category,
- throttled occurrence indicator.

## 23.3 Telemetry Prohibitions

Do not log:

- bearer tokens,
- Adobe access tokens,
- refresh tokens,
- OAuth authorization codes,
- raw OAuth callback URLs,
- raw provider error bodies,
- agreement names,
- sender names,
- sender emails,
- source-open URLs,
- live queue row payloads,
- credential-bearing query strings.

## 23.4 Sanitized Error Discipline

Because generic telemetry wrappers can record error messages, provider/adaptor code must throw only sanitized operational errors.

Raw source messages must be normalized before reaching:

- telemetry,
- evidence writers,
- generic error catch blocks.

## 23.5 Evidence Redaction Requirements

My Dashboard curated evidence must inherit PCC’s sanitization doctrine:

- redact emails,
- redact token-like blobs,
- redact auth/session/cookie keywords,
- strip query strings,
- exclude storage-state/auth artifacts,
- exclude raw queue payloads,
- filter unsafe artifact paths.

## 23.6 Personal Data Minimization

The queue is a user-personalized work surface. Evidence and telemetry should prefer:

- classifications,
- counts,
- stable state codes,

over content-bearing artifacts.

---

# 24. Fixture Matrix

## 24.1 Fixture Design Objective

Fixtures must be deterministic, scenario-specific, isolated, and sufficient to drive:

- shared model tests,
- UI state tests,
- backend route tests,
- hosted conditional review lanes.

## 24.2 Required Home Fixtures

| Fixture                            | Purpose                             |
| ---------------------------------- | ----------------------------------- |
| Home available with queue preview  | Normal home dashboard               |
| Home available with no Adobe items | Valid empty queue home state        |
| Home partial                       | Source partially degraded           |
| Home configuration required        | Integration not configured          |
| Home authorization required        | OAuth authorization missing/expired |
| Home principal unresolved          | HB actor not mapped to Adobe grant  |
| Home source unavailable            | Adobe provider unavailable          |
| Home backend unavailable fallback  | Frontend safe fallback behavior     |

## 24.3 Required Queue Fixtures

| Fixture                                   | Purpose                         |
| ----------------------------------------- | ------------------------------- |
| Queue populated with all six action types | Status/action mapping           |
| Queue empty                               | Empty state                     |
| Queue with expiring-soon examples         | Urgency rules                   |
| Queue paginated                           | Load more/cursor path           |
| Queue partial with warning                | Degraded but usable state       |
| Queue authorization required              | Connect/reauthorize UI          |
| Queue principal unresolved                | Resolver failure state          |
| Queue configuration required              | Provider disabled/missing setup |
| Queue source unavailable                  | Upstream outage                 |
| Queue backend unavailable fallback        | Frontend transport degradation  |

## 24.4 Determinism Rules

Fixtures must use:

- fixed generated timestamps,
- stable IDs,
- stable page cursors,
- controlled summary counts,
- no real user or agreement data.

---

# 25. Validation Matrix and Definition of Done

## 25.1 Validation Philosophy

Validation is not a late-stage smoke test. It is an implementation discipline spanning:

- contract tests,
- runtime package proof,
- protected route tests,
- UI behavior tests,
- source-state tests,
- hosted SharePoint evidence.

## 25.2 Required Validation Categories

| Category               | Required proof                                                         |
| ---------------------- | ---------------------------------------------------------------------- |
| Model contracts        | Unions, envelope shape, fixture shape, readonly posture                |
| Navigation registry    | Canonical IDs, selectable states, safe normalization                   |
| Shell state            | Primary selection, module selection, clear behavior                    |
| Shell semantics        | Active panel, tab semantics, menu keyboard interactions                |
| Home surface           | Correct card choreography by source state                              |
| Queue UI               | State cards, list, summary, CTA visibility, Load more                  |
| Frontend clients       | URL construction, auth header injection, fallback behavior             |
| Backend routes         | Exact GET routes, `withAuth`, telemetry wrapper, status taxonomy       |
| Adobe adapter/provider | Principal mapping, search query construction, source-state translation |
| OAuth                  | Start/callback/token lifecycle under controlled tests                  |
| Packaging              | `.sppkg`, runtime marker, critical path proof                          |
| Hosted live lane       | Page load, marker/version, fit, states, evidence                       |
| Evidence sanitation    | No secret/data leakage                                                 |

## 25.3 Hosted Environment Variables

Recommended My Dashboard lane:

```text
MY_DASHBOARD_LIVE_SITE_URL
MY_DASHBOARD_LIVE_PAGE_URL
MY_DASHBOARD_LIVE_STORAGE_STATE
MY_DASHBOARD_EXPECTED_PACKAGE_VERSION
MY_DASHBOARD_EVIDENCE_OUTPUT_DIR
```

Conditional/review-state vars may be added only where useful and should self-skip when absent.

## 25.4 Runtime Package Proof

Hosted validation must assert:

- global marker present,
- runtime marker ID correct,
- runtime package version correct,
- expected package version matches package-solution source,
- evidence output writes safe proof metadata.

## 25.5 Screenshot Use

Screenshots are useful review support but must not be sole proof. Playwright notes visual comparisons can vary by environment. [P3]

My Dashboard screenshot evidence must be paired with:

- DOM measurements,
- clipping checks,
- scroll-width checks,
- active-panel bounding box checks,
- state metadata.

## 25.6 Definition of Done

The MVP is complete only when:

1. repo-truth implementation matches this final plan,
2. all package/app manifest versions align,
3. SPFx package builds cleanly,
4. protected API permission request posture is correct,
5. read-model, route, UI, provider, and OAuth tests pass,
6. package-truth proof passes,
7. hosted MyDashboard home-page validation passes,
8. runtime marker/version proof passes,
9. curated sanitized evidence is generated,
10. operator-pending dependencies, if any, are documented precisely,
11. no unresolved architecture decision remains materially relevant to implementation.

---

# 26. Development Phase Sequence

## 26.1 Phase 0 — Planning Authority Reconciliation

Before code implementation prompts are generated:

- update the My Dashboard `dev-plan/README.md` authority index,
- reconcile the legacy outline authority table,
- point readers to this final comprehensive plan,
- correct any batch filename drift,
- preserve this artifact as the controlling synthesis.

## 26.2 Phase 1 — Shell Completion and Home-Surface Structure

Build:

- hero band,
- surface router,
- bento/dashboard layout components,
- work summary/home-card choreography,
- current shell integration without regressing already-landed B03 work.

## 26.3 Phase 2 — Shared My Work Read-Model Contracts and Fixtures

Build:

- `MyWorkReadModels.ts`,
- `AdobeSignActionQueue.ts`,
- fixtures,
- contract tests,
- root model exports.

## 26.4 Phase 3 — Frontend Read-Model Client Layer

Build:

- client interfaces,
- fixture client,
- backend client,
- client factory,
- state mapping,
- frontend hooks for home and queue.

## 26.5 Phase 4 — Backend My Work Read-Model Host

Build:

- protected route host,
- route tests,
- mock provider,
- standardized envelope responses,
- error/source-state translation.

## 26.6 Phase 5 — Adobe Queue UI

Build:

- home card,
- focused module,
- summary/list/state cards,
- filters,
- manual refresh,
- Load more pagination,
- CTA policies.

## 26.7 Phase 6 — Adobe Principal/OAuth/Provider Backbone

Build:

- actor normalization,
- principal resolver,
- grant store abstraction,
- OAuth start/callback,
- token refresh service,
- Adobe search client,
- adapter,
- safe source URL policy.

## 26.8 Phase 7 — Operational Hardening

Build/test:

- rate-limit translation,
- retry budgets,
- telemetry allowlist,
- sanitized errors,
- privacy discipline,
- degraded-state edge cases.

## 26.9 Phase 8 — Packaging and Hosted Evidence Lane

Build/test:

- runtime version stamp,
- package truth expansion,
- hosted evidence harness,
- sanitized evidence writers,
- full-width host fit proofs,
- conditional review-state lane.

## 26.10 Phase 9 — Final Documentation and Handoff

Produce:

- app README,
- backend host README,
- OAuth/support runbook,
- hosted evidence closeout,
- known prerequisites list,
- future roadmap for webhook/background enhancements.

---

# 27. Risk Register

## 27.1 R-01 — Adobe App Registration Readiness

| Field      | Detail                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------ |
| Risk       | OAuth app, redirect URI, secrets, or tenant approvals are not ready.                       |
| Impact     | Live Adobe provider cannot be declared complete.                                           |
| Mitigation | Build architecture/provider seams; gate live enablement; fixture-mode UI remains valuable. |

## 27.2 R-02 — Refresh Token Storage and Secret Handling

| Field      | Detail                                                                |
| ---------- | --------------------------------------------------------------------- |
| Risk       | Delegated refresh-token persistence is under-designed.                |
| Impact     | Security exposure or unstable live provider.                          |
| Mitigation | Explicit backend grant store, encryption, no frontend token exposure. |

## 27.3 R-03 — Actor/Adobe Principal Mapping Failure

| Field      | Detail                                                                     |
| ---------- | -------------------------------------------------------------------------- |
| Risk       | Authenticated HB actor cannot be safely mapped to Adobe OAuth grant.       |
| Impact     | Incorrect personalization or false queue results.                          |
| Mitigation | Stable `tenant + oid` key; no shared fallback; principal-unresolved state. |

## 27.4 R-04 — Source URL Safety

| Field      | Detail                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------- |
| Risk       | Unsafe guessed URLs or misuse of signing URLs.                                            |
| Impact     | Security/UX failure.                                                                      |
| Mitigation | Backend-validated URLs only; row CTA optional; signing URL not default row-open contract. |

## 27.5 R-05 — Adobe Throttling and Polling Policy

| Field      | Detail                                                                          |
| ---------- | ------------------------------------------------------------------------------- |
| Risk       | Repeated refresh requests or naive retries cause 429s or worsening limits.      |
| Impact     | Provider degradation and poor user experience.                                  |
| Mitigation | No auto-polling, manual refresh only, debounce, `Retry-After`, bounded retries. |

## 27.6 R-06 — Queue Misrepresentation Through Stale Data

| Field      | Detail                                                                        |
| ---------- | ----------------------------------------------------------------------------- |
| Risk       | Cached or partial data is shown as current.                                   |
| Impact     | User acts on misleading information.                                          |
| Mitigation | No durable cache in MVP; explicit freshness metadata; honest source-state UX. |

## 27.7 R-07 — Telemetry or Evidence Leakage

| Field      | Detail                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------- |
| Risk       | Agreement names, sender identity, URLs, or tokens enter logs/evidence.                      |
| Impact     | Privacy/security breach.                                                                    |
| Mitigation | Explicit telemetry allow/prohibit matrix; evidence sanitization; no raw row payload output. |

## 27.8 R-08 — Local-Only False Confidence

| Field      | Detail                                                         |
| ---------- | -------------------------------------------------------------- |
| Risk       | Workbench/local validation misses communication-site behavior. |
| Impact     | Release failure in target SharePoint host.                     |
| Mitigation | Hosted full-width validation is a hard gate.                   |

## 27.9 R-09 — Runtime Package Drift

| Field      | Detail                                                       |
| ---------- | ------------------------------------------------------------ |
| Risk       | Hosted page loads an older or mismatched package.            |
| Impact     | Evidence proves wrong runtime.                               |
| Mitigation | Runtime package version stamp and hosted equality assertion. |

## 27.10 R-10 — Repository Planning Drift

| Field      | Detail                                                          |
| ---------- | --------------------------------------------------------------- |
| Risk       | README/outline/batch naming stay stale after final synthesis.   |
| Impact     | Later implementation prompts inherit obsolete assumptions.      |
| Mitigation | Phase 0 authority reconciliation before code prompt generation. |

---

# 28. Standards and Best Practices

## 28.1 HB Intel UI Doctrine

- tokenized styling over raw design drift,
- professional end-user copy,
- no placeholder developer language,
- strong hierarchy and whitespace discipline,
- accessible interaction states,
- shell/card ownership boundaries preserved.

## 28.2 Integration Doctrine

- backend-mediated source access,
- read-only HB Intel posture,
- source actions remain in Adobe Sign,
- no guessed handoff links,
- no writeback unless separately approved.

## 28.3 Identity and Auth Doctrine

- audience/tenant/subject validation remains backend-owned,
- stable actor key uses tenant context + `oid`,
- email/UPN claims are not authorization keys,
- delegated Adobe access is actor-specific,
- tokens are backend credentials.

Microsoft’s current guidance materially supports this posture. [M3] [M4]

## 28.4 Adobe Provider Best Practices

- use the correct access point,
- use `POST v6/search` for filtered queue retrieval,
- preserve exact status union,
- honor `Retry-After`,
- avoid polling-heavy patterns,
- keep signing URLs out of generic row-open behavior. [A2] [A3] [A5]

## 28.5 Testing Doctrine

- prefer role/text locators where semantically meaningful,
- use stable data attributes for product-proof seams,
- keep auth state outside source control,
- treat screenshot evidence as review support, not sole truth. [P1] [P2] [P3]

## 28.6 Accessibility Doctrine

- WAI-ARIA tabs semantics,
- descriptive CTA purpose,
- status announcements that do not steal focus,
- no keyboard traps,
- visible focus and selected states. [W1]

---

# 29. Final Open-Item Resolution Register

This section closes the open items identified in the earlier outline.

| Prior open item                           | Final resolution                                                                                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Final SharePoint page URL                 | **Closed:** `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/Home.aspx`                                                              |
| Adobe OAuth onboarding in MVP             | **Closed:** architecture and implementation scope include OAuth onboarding; live enablement is gated on external app/secret/redirect/grant-store readiness |
| Source-unavailable transport              | **Closed:** HTTP 200 + typed degraded envelope for expected source degradation                                                                             |
| Queue cache posture                       | **Closed:** no durable queue cache in MVP                                                                                                                  |
| Actor email-claim precedence              | **Closed:** no authorization key based on email/UPN; use configured tenant context + `oid`                                                                 |
| Expiring-soon threshold                   | **Closed:** 7 calendar days, only when source expiration date exists                                                                                       |
| Focused queue pagination                  | **Closed:** cursor-based explicit `Load more` pagination in MVP; no infinite scroll                                                                        |
| Property-pane operational config exposure | **Closed:** no operational backend/Adobe auth config exposure in property pane                                                                             |
| Runtime package version proof             | **Closed:** required before hosted final acceptance                                                                                                        |
| Package feature description drift         | **Closed:** implementation cleanup required to remove HBCentral wording                                                                                    |
| Batch 07 stale “shell absent” wording     | **Closed:** corrected by repo truth; shell/nav/state spine exists and final plan treats it as landed                                                       |

## 29.1 Deliberate Deferrals

The following remain deliberately deferred, not accidentally unresolved:

- Teams personal app packaging,
- webhooks/event-driven sync,
- short-lived/durable queue caching,
- cross-platform personal work aggregation beyond Adobe Sign,
- manager/proxy queue access,
- URL-deep-linked module state,
- direct in-HB agreement actions.

## 29.2 Known External Blockers

A live production Adobe provider cannot be declared complete until:

- Acrobat Sign CUSTOMER app registration exists,
- callback URL is approved/configured,
- client secret/credentials are stored correctly,
- grant/token store is implemented and secured,
- live test actor is authorized,
- hosted SharePoint + live backend validation is completed.

---

# 30. Final Target Outcome

The final implementation should produce:

- a standalone **HB Intel My Dashboard** SPFx package,
- a polished **My Work shell** on the MyDashboard SharePoint home page,
- a secure, user-specific **Adobe Sign Action Queue**,
- protected SPFx-to-backend authenticated reads,
- backend-mediated Adobe delegated OAuth access,
- safe source handoff behavior,
- resilient degraded-state rendering,
- a reusable architecture for later personal-work modules,
- package/runtime proof,
- hosted SharePoint evidence,
- and an implementation-ready documentation trail.

Success means the platform demonstrates not only a useful Adobe queue, but the repeatable **personal operating layer** architecture HB Intel can extend in later phases.

---

# 31. Recommended Next Artifact After Plan Completion

The next artifact should be:

> **A comprehensive implementation prompt package for a local code agent, decomposed into focused prompts by phase and dependency gate, using this final plan as the sole controlling architecture source.**

The prompt package should not reopen architecture decisions. It should translate this plan into:

- targeted implementation prompts,
- exact file families,
- sequencing gates,
- validation commands,
- closeout templates,
- commit-message guidance,
- and explicit no-drift guardrails.

---

# Appendix A — Repo Files and Docs Audited

## A.1 My Dashboard App and Runtime

- `apps/my-dashboard/src/mount.tsx`
- `apps/my-dashboard/src/MyDashboardApp.tsx`
- `apps/my-dashboard/src/config/runtimeConfig.ts`
- `apps/my-dashboard/src/config/productionReadiness.ts`
- `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json`
- `apps/my-dashboard/config/package-solution.json`

## A.2 Current My Work Shell / Navigation Repo Truth

- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.tsx`
- `apps/my-dashboard/src/state/useMyWorkShellState.ts`
- `packages/models/src/myWork/MyWorkNavigation.ts`
- `packages/models/src/myWork/index.ts`

## A.3 Packaging and Auth Precedents

- `tools/build-spfx-package.ts`
- `packages/auth/src/spfx/apiTokenProvider.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/middleware/request-id.ts`
- `backend/functions/src/utils/withTelemetry.ts`

## A.4 PCC Shell / Router / Client Precedents

- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/state/usePccShellState.ts`
- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClientFactory.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`

## A.5 Evidence Precedents

- `e2e/pcc-live/pcc-live.evidence-writer.ts`
- `e2e/pcc-live/pcc-evidence.registry.ts`
- `e2e/pcc-live/pcc-live.scorecard-report.spec.ts`
- `e2e/pcc-live/README.md`

## A.6 Governing Planning Artifacts

- Batch 01 through Batch 07 My Dashboard development-planning artifacts
- Original My Dashboard comprehensive outline
- Batch 08 fresh-session final reconciliation prompt

---

# Appendix B — External Research Source Register

## B.1 Microsoft / SharePoint / SPFx

| ID  | Source                                                                | Use                                                                              |
| --- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| M1  | Microsoft Learn — _Use web parts with the full-width column_          | Full-width communication-site support; `supportsFullBleed`; workbench limitation |
| M2  | Microsoft Learn — _Manage access to Microsoft Entra ID-secured APIs_  | SharePoint admin API permission approval                                         |
| M3  | Microsoft Learn — _Secure applications and APIs by validating claims_ | `tid` + `oid`, subject validation, warning against email/UPN authorization       |
| M4  | Microsoft Learn — _ID token claims reference_                         | Mutable claim caution for `preferred_username` / `email`                         |

## B.2 Adobe Acrobat Sign

| ID  | Source                                                                                     | Use                                                                          |
| --- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| A1  | Adobe — _Partner Application Quickstart_                                                   | CUSTOMER vs PARTNER app domain posture                                       |
| A2  | Adobe — _Managing OAuth Tokens_                                                            | Access token and refresh-token lifecycle                                     |
| A3  | Adobe — _Acrobat Sign API Best Practices_                                                  | Base URI/access point, `POST v6/search`, signing URL posture, retry behavior |
| A4  | Adobe — _API Agreement Statuses, Recipient Statuses, Agreement Events, and Webhook Events_ | Exact current-user actionable recipient statuses                             |
| A5  | Adobe — _API Usage_ / current throttling guidance                                          | 429, `Retry-After`, polling caution                                          |
| A6  | Adobe — _Acrobat Sign Release Notes_                                                       | Late-2025 polling-policy posture for GET endpoints                           |

## B.3 Testing / Accessibility

| ID  | Source                            | Use                                                      |
| --- | --------------------------------- | -------------------------------------------------------- |
| P1  | Playwright — _Authentication_     | Storage-state sensitivity and repository exclusion       |
| P2  | Playwright — _Locators_           | Prefer role-based locators and explicit stable selectors |
| P3  | Playwright — _Visual comparisons_ | Screenshot environmental variability                     |
| W1  | W3C WAI-ARIA APG — _Tabs Pattern_ | Tablist/tab/tabpanel semantics and keyboard expectations |

---

# Appendix C — Master Decision Register

| ID   | Decision                                                                                            | Status |
| ---- | --------------------------------------------------------------------------------------------------- | ------ |
| D-01 | My Dashboard is a standalone SPFx domain                                                            | Closed |
| D-02 | My Work is the internal shell/workspace                                                             | Closed |
| D-03 | Adobe Sign Action Queue is first module                                                             | Closed |
| D-04 | PCC shell is primary shell basis                                                                    | Closed |
| D-05 | HB Homepage shell is secondary host-fit reference only                                              | Closed |
| D-06 | Target hosted page is MyDashboard `/SitePages/Home.aspx`                                            | Closed |
| D-07 | Full-width communication-site placement required                                                    | Closed |
| D-08 | SharePoint host only; Teams deferred                                                                | Closed |
| D-09 | Protected API permission remains `HB SharePoint Creator` / `access_as_user`                         | Closed |
| D-10 | Runtime config keys remain `functionAppUrl`, `backendMode`, `allowBackendModeSwitch`, `apiAudience` | Closed |
| D-11 | Read-model routes are exactly `my-work/me/home` and `my-work/me/adobe-sign/action-queue`            | Closed |
| D-12 | Read-model source-status taxonomy fixed                                                             | Closed |
| D-13 | Query actor override prohibited                                                                     | Closed |
| D-14 | Actor key uses tenant context + `oid`                                                               | Closed |
| D-15 | UPN/email not used for authorization key                                                            | Closed |
| D-16 | App-only tokens not eligible for user queue reads                                                   | Closed |
| D-17 | Adobe auth uses delegated OAuth auth-code flow                                                      | Closed |
| D-18 | Adobe app posture is CUSTOMER                                                                       | Closed |
| D-19 | Search baseline uses `POST v6/search`                                                               | Closed |
| D-20 | Exact six Adobe action statuses retained                                                            | Closed |
| D-21 | Row handoff URL is optional and backend-validated                                                   | Closed |
| D-22 | Signing URLs not default row-open contract                                                          | Closed |
| D-23 | No auto-polling                                                                                     | Closed |
| D-24 | No durable queue cache in MVP                                                                       | Closed |
| D-25 | Manual refresh in focused module only                                                               | Closed |
| D-26 | Expiring soon = within 7 calendar days                                                              | Closed |
| D-27 | Focused module uses explicit Load more pagination                                                   | Closed |
| D-28 | Hosted runtime version proof required                                                               | Closed |
| D-29 | Hosted evidence lane under `e2e/my-dashboard-live`                                                  | Closed |
| D-30 | HBCentral package-description drift must be corrected                                               | Closed |

---

# Appendix D — Implementation Dependency Matrix

| Implementation stream  | Depends on                                                        |
| ---------------------- | ----------------------------------------------------------------- |
| Authority docs cleanup | Final plan artifact                                               |
| Shell completion       | Existing MyWorkShell/navigation/state                             |
| Home surface           | Shell router + home read-model contract                           |
| Shared model contracts | Final read-model decisions                                        |
| Frontend clients       | Shared contracts + runtime config                                 |
| Backend route host     | Shared contracts + auth middleware precedent                      |
| Adobe OAuth/provider   | Backend host + stable actor mapping + secure token-store decision |
| Adobe queue UI         | Read-model contract + shell/home surface                          |
| Refresh/pagination UX  | Queue UI + route query contract                                   |
| Hosted evidence lane   | Runtime marker/version seam + deployed package                    |
| Final release closeout | All prior streams + sanitized evidence                            |

---

# Appendix E — Suggested Prompt-Package Decomposition

This appendix does **not** provide prompts. It provides the recommended implementation package architecture.

## E.1 Prompt Group 00 — Authority and Repo-Truth Alignment

- reconcile README/outline/final-plan authority,
- correct stale HBCentral feature description planning note,
- establish exact continuation baseline.

## E.2 Prompt Group 01 — My Work Shell Completion

- hero band,
- surface router,
- bento layout,
- responsive/semantic tests.

## E.3 Prompt Group 02 — Shared My Work Read-Model Contracts

- DTOs,
- warning taxonomy,
- fixtures,
- exports,
- tests.

## E.4 Prompt Group 03 — Frontend Client and Hooks

- fixture/backend clients,
- state mapping,
- home/queue hooks,
- fallback semantics.

## E.5 Prompt Group 04 — Backend My Work Host

- protected routes,
- route registration,
- mock provider,
- response taxonomy,
- tests.

## E.6 Prompt Group 05 — Home Surface and Adobe Queue UI

- cards,
- focused module,
- states,
- filters,
- manual refresh,
- pagination.

## E.7 Prompt Group 06 — Adobe OAuth and Live Provider Backbone

- actor resolver,
- grant store,
- OAuth flow,
- token refresh,
- search client,
- URL policy.

## E.8 Prompt Group 07 — Operational Hardening

- throttle/retry behavior,
- telemetry safety,
- error sanitization,
- privacy and source-state tests.

## E.9 Prompt Group 08 — Packaging, Runtime Proof, and Hosted Evidence

- runtime version stamp,
- critical runtime path expansion,
- My Dashboard live evidence harness,
- hosted validation lane.

## E.10 Prompt Group 09 — Documentation, Runbooks, and Closeout

- app/backend READMEs,
- OAuth support runbook,
- deployment checklist,
- evidence closeout,
- implementation handoff.

---

# Final Closing Statement

This plan closes the architecture. Future prompt packages should implement it, not reinterpret it.
