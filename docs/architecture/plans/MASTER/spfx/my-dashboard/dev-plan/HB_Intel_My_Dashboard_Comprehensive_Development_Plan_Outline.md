# HB Intel My Dashboard — My Work Shell + Adobe Sign Action Queue
## Comprehensive Development Plan Outline

**Prepared:** 2026-05-12  
**Target SharePoint host:** `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard`  
**Target initiative:** New HB Intel **My Dashboard** SPFx domain, **My Work shell**, and **Adobe Sign Action Queue** module  
**Plan posture:** Closed-decision implementation outline intended to be expanded into the authoritative comprehensive development plan

---

# Batch Authority Posture

This outline is an umbrella scaffold and full-plan topic map for HB Intel My Dashboard. It is not the detailed authority for sections that have been developed into batch artifacts. Where a batch artifact exists for a section, that batch artifact is the detailed authority; this outline retains the scaffold and the unfinished sections only.

If implementation drift is observed between this outline, a batch artifact, and the current working tree, **live repo truth** (current files, manifests, exports, tests, configs, and canonical current-state documentation) outranks both this outline and the batch artifacts and must be reconciled into the plan, not the other way around.

| Artifact | Developed authority |
|---|---|
| `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Sections 0–5 |
| `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | Sections 6, 7, 8, 14, and 19 |
| This outline | Umbrella scaffold and full-plan topic map |

**Precedence:** live repo truth > applicable detailed batch artifact > this outline > older or historical references. The outline cannot override a more detailed batch artifact for any section that batch has developed; later batches must explicitly acknowledge the closed decisions they inherit and must not silently re-litigate them.

See the folder-level authority index at `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md` for the full reading order and the closed B01 foundation decisions that constrain every subsequent batch.

---

# 0. Document Control

## 0.1 Document Title
**HB Intel My Dashboard — My Work Shell and Adobe Sign Action Queue Comprehensive Development Plan**

## 0.2 Initiative Scope
This plan governs:

1. A new standalone SPFx application domain for **My Dashboard**
2. A new internal **My Work shell**
3. A user-specific **Adobe Sign Action Queue** module
4. The backend read-model host and Adobe integration boundaries required to support the module
5. Packaging, deployment, hosted validation, and evidence expectations

## 0.3 Target Host
- SharePoint communication site:  
  `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard`

## 0.4 Status of Major Decisions
| Decision Area | Status |
|---|---|
| New app domain vs. PCC extension | Closed — new app domain |
| Shell basis | Closed — PCC shell construction |
| Communication-site hosting reference | Closed — use HB Homepage lessons only as secondary reference |
| Adobe module identity | Closed — `adobe-sign-action-queue` |
| Backend route family | Closed — `my-work/me/...` |
| SPFx to backend auth | Closed — protected API token contract required |
| Adobe live auth baseline | Closed for plan — delegated user OAuth baseline, abstracted behind provider seam |
| Direct Adobe calls from SPFx | Prohibited |
| In-HB signing/approval | Out of scope for MVP |
| Webhook-backed synchronization | Deferred future enhancement |
| Personal-work primitive compatibility | Closed — must preserve compatibility with existing `@hbc/my-work-feed` / Personal Work Hub; no competing cross-module personal-work primitive |

---

# 1. Executive Summary

## 1.1 Strategic Purpose
**My Dashboard** should become HB Intel’s personal operating layer: a user-centered command surface that aggregates items requiring the authenticated employee’s attention across connected work systems.

The first release should establish the reusable shell and integration pattern, not merely place a single card on a SharePoint page.

## 1.2 Product Positioning
- **Project Control Center** = project operating layer
- **My Dashboard** = personal operating layer
- **My Work shell** = reusable personal command experience inside My Dashboard
- **Adobe Sign Action Queue** = first production-shaped user-specific external work queue
- **Personal Work Hub / `@hbc/my-work-feed`** = existing HB Intel personal-work architecture that My Dashboard must align with and must not silently duplicate or contradict

## 1.3 MVP Outcome
At completion of this initiative, a signed-in HB user should be able to:

- Open the MyDashboard communication site
- View a polished **My Work** experience inside a standalone HB Intel web part
- See whether Adobe Sign agreements require their action
- Understand the action type and relative urgency
- Open the source agreement in Adobe Sign where a validated source URL is available
- Receive clear end-user messaging when the integration is not configured, authorization is required, data is unavailable, or no work is pending

## 1.4 Architectural Objective
The implementation should prove a repeatable architecture for future personal-work modules while preserving current HB Intel doctrine:

- Backend-mediated external-system access
- No third-party secrets in SPFx
- Typed read-model contracts
- Fixture-first / backend-opt-in development posture
- Safe degraded states
- Hosted SharePoint proof, not workbench-only confidence

---

# 2. Repo-Truth Audit and Architectural Basis

## 2.1 Primary Architectural Basis — PCC Shell
The My Work shell should use the same shell construction concepts currently established in the Project Control Center:

- Command surface
- Navigation / module launcher
- Hero band
- Semantic active-panel canvas
- Bento-style dashboard field
- Container-aware responsive behavior
- Shell state controlling active primary surface and module selection

### PCC reference files
- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/state/usePccShellState.ts`
- `apps/project-control-center/src/PccApp.tsx`

## 2.2 Secondary Reference — HB Homepage Shell
The repository also contains a sophisticated communication-site shell implementation within the HB Homepage workstream.

### HB Homepage reference relevance
Use it for:
- communication-site full-width behavior lessons
- wide-layout composition awareness
- shell evidence discipline
- occupant/band orchestration concepts where helpful for validating page-host fit

### HB Homepage reference limits
Do **not** use it as the basis for:
- My Work navigation grammar
- My Work shell identity
- My Work module routing
- My Work surface semantics

### Reference file
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`

## 2.3 New Domain vs. PCC Extension
The implementation must create a new application domain:

```text
apps/my-dashboard
```

### Rationale
This cannot be implemented inside PCC because:

- PCC is project-contextual
- My Dashboard is user-contextual
- target SharePoint hosts differ
- navigation grammar differs
- read-model parameters differ
- lifecycle and release cadence should remain separable
- the Adobe Sign module in PCC is currently a project-level launch-only concept, not a personal action queue

## 2.4 Existing PCC Adobe Module Must Remain Distinct
PCC already contains a module ID:

```text
adobe-sign
```

That concept remains:
- project-contextual
- Document Control-adjacent
- launch-only

The My Dashboard module must be:

```text
adobe-sign-action-queue
```

That concept is:
- user-contextual
- read-model-driven
- action-oriented
- designed to show agreements requiring the current user’s action

---

# 3. Canonical Naming and Product Taxonomy

## 3.1 Canonical Names
| Concept | Canonical Name |
|---|---|
| SharePoint site | My Dashboard |
| SPFx product/web part | HB Intel My Dashboard |
| Internal shell | My Work shell |
| Initial surface | My Work Home |
| First module | Adobe Sign Action Queue |

## 3.2 Canonical IDs
| Concept | ID |
|---|---|
| App/domain folder | `my-dashboard` |
| Shell namespace | `my-work` |
| Primary home surface | `my-work-home` |
| Adobe Sign module | `adobe-sign-action-queue` |

## 3.3 Copy Rules
The UI should use:
- **My Dashboard** for top-level page/product identity
- **My Work** for shell and workspace language
- **Adobe Sign** as the end-user brand label
- **Action Queue** or **Agreements requiring your action** as the functional descriptor

## 3.4 Prohibited Naming Drift
Do not create inconsistent internal labels such as:
- `personal-dashboard`
- `my-items`
- `user-dashboard`
- `pending-signatures`
- `Adobe Queue`
- `Signing Center`

unless expressly approved in a later UX/copy decision.

---

# 4. Scope Lock

## 4.1 In-Scope
The initiative includes:

- New `apps/my-dashboard` domain
- Standalone SPFx packaging and runtime marker
- My Work shell with PCC-like construction
- My Work shell state and router
- My Work navigation registry
- My Work read-model model namespace
- My Work backend read-model host
- Adobe Sign Action Queue card
- Adobe Sign focused queue module
- Fixture mode and backend mode
- SPFx protected backend API token acquisition
- Backend authenticated actor resolution
- Adobe delegated OAuth provider seam
- Adobe Sign agreement search client
- Hosted communication-site deployment validation
- Testing and evidence documentation

> **Personal-work primitive guardrail:** This initiative does not authorize a competing cross-module personal-work primitive beside `@hbc/my-work-feed` / Personal Work Hub. Later read-model and module decisions must preserve compatibility with the existing primitive or explicitly justify a constrained, narrowly-scoped boundary before implementation proceeds.

## 4.2 Out-of-Scope for MVP
The following are explicitly out of scope:

- In-HB signing of agreements
- In-HB approval of agreements
- Editing Adobe Sign agreements
- Sending or cancelling agreements
- Viewing full agreement document contents inside My Dashboard
- Cross-user or manager proxy queue access
- Admin impersonation
- Configurable user email overrides
- Automated reminders or escalations
- Adobe webhook ingestion
- Shared queue persistence store unless separately approved
- Cross-platform unified “My Tasks” aggregation beyond Adobe Sign
- PCC integration of this queue in the same phase
- Teams personal app packaging in the first implementation
- URL-route-deep-link persistence for selected My Work module

---

# 5. Target Users, User Stories, and UX Intent

## 5.1 Primary User
Authenticated HB employee using the MyDashboard communication site.

## 5.2 Primary User Story
> As an HB employee, I want to see Adobe Sign agreements that require my action so I can prioritize and open the source agreement efficiently.

## 5.3 Supporting User Stories
- As a user with no pending agreements, I want a clear empty state so I know the queue is current.
- As a user who has not yet authorized Adobe Sign access, I want a clear explanation that authorization is required.
- As a user when Adobe Sign is unavailable, I want a non-alarming degraded-state explanation.
- As a user with multiple pending agreements, I want quick prioritization by action type and recency.

## 5.4 User Experience Principles
- Clear, polished, end-user-facing copy
- Avoid developer/debug language
- Actionable but not overburdened
- Source-system authority remains explicit
- No false implication that HB Intel can complete Adobe actions internally
- Progressive enhancement: summary first, details as needed

---

# 6. Communication Site Hosting and SharePoint Deployment Contract

## 6.1 Target Site
```text
https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard
```

## 6.2 Target Page Placement
The final comprehensive plan should lock one of the following before coding begins:

### Preferred
- Place the web part on the communication site home page in a full-width section.

### Acceptable alternative
- Place the web part on a dedicated dashboard page within the MyDashboard site if the site home page is reserved for other content.

The plan must record the final page URL for hosted Playwright validation and deployment evidence.

## 6.3 Manifest Requirements
The My Dashboard web part manifest must include:

```json
"supportsFullBleed": true
```

## 6.4 Supported Hosts
MVP supported hosts:
```json
"supportedHosts": ["SharePointWebPart"]
```

Teams support is deferred.

## 6.5 Feature Deployment Posture
Recommended baseline:
- standalone solution package
- `skipFeatureDeployment: true`
- toolbox-visible web part
- communication-site page placement by site owner/admin

## 6.6 App Catalog and Permission Approval Dependencies
Before production-host validation:
- `.sppkg` uploaded to tenant app catalog or approved deployment channel
- API permission request approved in SharePoint admin center
- target communication site allowed to use the package
- page updated with the web part

## 6.7 Full-Width Validation Requirement
Validation must occur on the actual SharePoint communication site page. Workbench-only results are not sufficient for final acceptance.

---

# 7. Repository Structure and File Placement

## 7.1 New App Domain
```text
apps/my-dashboard/
```

## 7.2 App-Level Structure
```text
apps/my-dashboard/
├── config/
│   └── package-solution.json
├── src/
│   ├── MyDashboardApp.tsx
│   ├── mount.tsx
│   ├── api/
│   │   ├── index.ts
│   │   ├── myWorkReadModelClient.ts
│   │   ├── myWorkReadModelClientFactory.ts
│   │   ├── myWorkBackendReadModelClient.ts
│   │   └── myWorkFixtureReadModelClient.ts
│   ├── config/
│   │   ├── runtimeConfig.ts
│   │   └── productionReadiness.ts
│   ├── shell/
│   │   ├── MyWorkShell.tsx
│   │   ├── MyWorkShell.module.css
│   │   ├── MyWorkHeroBand.tsx
│   │   ├── MyWorkHorizontalTabs.tsx
│   │   ├── MyWorkModuleLauncher.tsx
│   │   └── MyWorkSurfaceRouter.tsx
│   ├── state/
│   │   └── useMyWorkShellState.ts
│   ├── preview/
│   │   └── myWorkShellPreviewViewModel.ts
│   ├── surfaces/
│   │   └── home/
│   │       ├── MyWorkHomeSurface.tsx
│   │       ├── MyWorkHomeSurface.module.css
│   │       ├── myWorkHomeAdapter.ts
│   │       └── useMyWorkHomeReadModel.ts
│   ├── modules/
│   │   └── adobeSign/
│   │       ├── AdobeSignActionQueueModule.tsx
│   │       ├── AdobeSignActionQueueCard.tsx
│   │       ├── AdobeSignActionQueueSummary.tsx
│   │       ├── AdobeSignActionQueueList.tsx
│   │       ├── AdobeSignActionQueueEmptyState.tsx
│   │       ├── AdobeSignActionQueueStateCard.tsx
│   │       ├── adobeSignActionQueueAdapter.ts
│   │       ├── useAdobeSignActionQueueReadModel.ts
│   │       └── *.module.css
│   └── webparts/
│       └── myDashboard/
│           └── MyDashboardWebPart.manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 7.3 Shared Model Namespace
```text
packages/models/src/myWork/
├── MyWorkNavigation.ts
├── MyWorkReadModels.ts
├── MyWorkReadModels.test.ts
├── MyWorkFixtures.ts
└── index.ts
```

## 7.4 Backend Host Namespace
```text
backend/functions/src/hosts/my-work-read-model/
├── my-work-read-model-routes.ts
├── my-work-read-model-routes.test.ts
├── read-models/
│   ├── my-work-mock-read-model-provider.ts
│   ├── my-work-read-model-provider.ts
│   └── adobe-sign/
│       ├── adobe-sign-action-queue-provider.ts
│       ├── adobe-sign-action-queue-adapter.ts
│       ├── adobe-sign-agreement-search-client.ts
│       ├── adobe-sign-principal-resolver.ts
│       ├── adobe-sign-token-store.ts
│       ├── adobe-sign-oauth-service.ts
│       └── adobe-sign-types.ts
└── README.md
```

---

# 8. Packaging and Runtime Registration Contract

## 8.1 Shared SPFx Packaging Orchestrator
Modify:
```text
tools/build-spfx-package.ts
```

Add a domain entry:

```ts
{
  dir: 'my-dashboard',
  camel: 'myDashboard',
  pascal: 'MyDashboard',
  packagingModel: 'single',
  freshBuildRequired: true,
}
```

## 8.2 Package Identity
Recommended package naming:
```text
hb-intel-my-dashboard.sppkg
```

## 8.3 Runtime Marker
Recommended global runtime marker:
```text
__hbIntel_myDashboard
```

## 8.4 Critical Runtime Path Registration
The package-truth proof should include at minimum:
- `apps/my-dashboard/src/mount.tsx`
- `apps/my-dashboard/src/MyDashboardApp.tsx`
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts`
- `apps/my-dashboard/src/api/myWorkReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`
- `apps/my-dashboard/vite.config.ts`
- `apps/my-dashboard/package.json`

## 8.5 Versioning
The package version, feature version, and web part manifest version must remain aligned as a gated deployment requirement.

## 8.6 Packaging Validation
The development plan must include:
- package build command
- package-truth proof generation
- expected `.sppkg` location
- validation that the packaged bundle contains the My Dashboard runtime marker

---

# 9. Shell Architecture — My Work

## 9.1 Core Shell Components
```text
MyDashboardApp
└── MyWorkShell
    ├── MyWorkCommandSurface
    │   ├── MyWorkHorizontalTabs
    │   ├── MyWorkModuleLauncher
    │   └── MyWorkHeroBand
    └── MyWorkCanvas
        └── MyWorkBentoGrid
            └── MyWorkSurfaceRouter output
```

## 9.2 Shell Semantics
The shell should:
- expose one semantic active panel owner
- preserve accessibility semantics equivalent to PCC shell posture
- treat shell-level content and dashboard cards as separate layers
- avoid duplicate first-card “header” redundancy

## 9.3 Shell State
Create:
```text
useMyWorkShellState.ts
```

### State fields
- `activePrimaryTabId`
- `activeModuleId`
- `previewMode`
- optional `selectedFocusRegion` only if needed later; omit for MVP unless deliberate

### MVP state decision
- In-memory only
- No URL routing
- No persisted preferences
- No browser localStorage state

## 9.4 Data Attributes
Create namespaced selectors:
- `data-my-work-shell`
- `data-my-work-shell-mode`
- `data-my-work-command-surface`
- `data-my-work-hero`
- `data-my-work-active-surface-panel`
- `data-my-work-bento-grid`
- `data-my-work-card`
- `data-my-work-module`
- `data-my-work-adobe-sign-queue`

## 9.5 Responsive Behavior
The My Work shell should:
- use the same responsive doctrine as PCC where practical
- support communication-site widths cleanly
- avoid horizontal overflow
- avoid phantom whitespace bands
- maintain usable card choreography on desktop, laptop, tablet, and mobile breakpoints

## 9.6 Shell Ownership Boundary
The shell owns:
- layout
- responsive mode
- active surface/module state
- command surface
- hero composition
- bento canvas composition

Modules own:
- their own content adapters
- state cards
- row/table/list rendering
- module-specific filters and labels

The shell must not reach into module internals to resolve content-fit issues.

---

# 10. My Work Navigation Model

## 10.1 Navigation Registry Namespace
```text
packages/models/src/myWork/MyWorkNavigation.ts
```

## 10.2 MVP Primary Surface
```text
my-work-home
```

## 10.3 MVP Live Module
```text
adobe-sign-action-queue
```

## 10.4 Module State Vocabulary
Recommended module states:
- `available`
- `preview`
- `read-only`
- `configuration-required`
- `authorization-required`
- `source-unavailable`
- `deferred`

## 10.5 MVP Navigation Behavior
Closed decision:
- The shell has one primary dashboard surface at MVP.
- The Adobe Sign module is selectable.
- Selecting the module updates in-memory shell state.
- The focused module renders within the shell’s active panel rather than opening a separate page or dialog.
- The dashboard card “View queue” affordance selects the focused Adobe module state.

## 10.6 Future Navigation Extensibility
Reserve architectural room for:
- My Responsibilities
- Pending Approvals
- To-Do / Action Center
- Upcoming Deadlines
- External Platform Work Queue Summary

But do not present empty or speculative UI modules in MVP.

---

# 11. Hero and My Work Home Surface Specification

## 11.1 Hero Identity
### Primary title
**My Dashboard**

### Secondary title
**My Work**

### Description
Production-grade copy explaining the purpose of the personal operating layer.

## 11.2 Hero Summary Data
The hero may show:
- current user display name if naturally available
- total active work items from the My Work home read model
- latest refresh timestamp

### Hero rule
Do not duplicate detailed Adobe-specific breakdowns in the hero if those appear immediately in the Adobe queue card.

## 11.3 My Work Home Bento Choreography
The final plan should lock exact MVP card order and footprints.

### Recommended MVP home card order
1. **Work Summary Card**
2. **Adobe Sign Action Queue Card**
3. **Connection / Source Readiness Card** only when a meaningful source state needs explanation

### Recommended default wide-layout posture
- Work Summary: medium or support footprint
- Adobe Sign Action Queue: primary / large footprint
- Source Readiness: compact/support footprint when needed

### Recommended behavior in focused Adobe module state
- The home cards are replaced by the focused Adobe module cards within the active shell panel.
- The hero remains shell-level and does not disappear.

---

# 12. My Work Read-Model Architecture

## 12.1 New Envelope Type
Create a My Work envelope separate from PCC’s project-scoped envelope.

```ts
export interface MyWorkReadModelEnvelope<T> {
  readonly mode: 'fixture' | 'backend';
  readonly sourceStatus:
    | 'available'
    | 'configuration-required'
    | 'authorization-required'
    | 'principal-unresolved'
    | 'source-unavailable'
    | 'backend-unavailable'
    | 'partial';
  readonly readOnly: true;
  readonly warnings: readonly string[];
  readonly generatedAtUtc: string;
  readonly data: T;
}
```

## 12.2 Core Read Models
Create:
- `MyWorkHomeReadModel`
- `MyWorkAdobeSignActionQueueReadModel`

## 12.3 Home Read Model
Recommended:
```ts
export interface MyWorkHomeReadModel {
  readonly actor: {
    readonly displayName?: string;
    readonly email?: string;
  };
  readonly summary: {
    readonly totalActionItems: number;
    readonly connectedSourceCount: number;
    readonly degradedSourceCount: number;
  };
  readonly adobeSign: {
    readonly sourceStatus: MyWorkSourceStatus;
    readonly pendingActionCount: number;
    readonly awaitingSignatureCount: number;
    readonly awaitingApprovalCount: number;
    readonly otherActionCount: number;
  };
}
```

## 12.4 Adobe Sign Action Queue Read Model
Recommended:
```ts
export interface MyWorkAdobeSignActionQueueReadModel {
  readonly summary: MyWorkAdobeSignActionQueueSummary;
  readonly items: readonly MyWorkAdobeSignActionQueueItem[];
  readonly refresh: {
    readonly generatedAtUtc: string;
    readonly isStale: boolean;
  };
  readonly connection: {
    readonly state:
      | 'connected'
      | 'configuration-required'
      | 'authorization-required'
      | 'principal-unresolved'
      | 'source-unavailable';
    readonly endUserMessage?: string;
  };
  readonly pagination: {
    readonly hasMore: boolean;
    readonly nextCursor?: string;
  };
}
```

---

# 13. Adobe Sign Queue Item and Summary Contracts

## 13.1 Queue Item Model
```ts
export interface MyWorkAdobeSignActionQueueItem {
  readonly agreementId: string;
  readonly agreementName: string;
  readonly senderName?: string;
  readonly senderEmail?: string;
  readonly requiredAction:
    | 'signature'
    | 'approval'
    | 'acceptance'
    | 'acknowledgement'
    | 'form-filling'
    | 'delegation';
  readonly rawAdobeStatus: string;
  readonly createdAtUtc?: string;
  readonly modifiedAtUtc?: string;
  readonly expirationAtUtc?: string;
  readonly sourceOpenUrl?: string;
}
```

## 13.2 Summary Model
```ts
export interface MyWorkAdobeSignActionQueueSummary {
  readonly totalPending: number;
  readonly awaitingSignature: number;
  readonly awaitingApproval: number;
  readonly awaitingOtherAction: number;
  readonly expiringSoon?: number;
}
```

## 13.3 Status Mapping Table
| Adobe status | My Work category | UI label |
|---|---|---|
| `WAITING_FOR_MY_SIGNATURE` | `signature` | Awaiting your signature |
| `WAITING_FOR_MY_APPROVAL` | `approval` | Awaiting your approval |
| `WAITING_FOR_MY_ACCEPTANCE` | `acceptance` | Awaiting your acceptance |
| `WAITING_FOR_MY_ACKNOWLEDGEMENT` | `acknowledgement` | Awaiting your acknowledgement |
| `WAITING_FOR_MY_FORM_FILLING` | `form-filling` | Awaiting your form input |
| `WAITING_FOR_MY_DELEGATION` | `delegation` | Awaiting delegation |

## 13.4 Urgency Rules
The plan should define:
- whether expiration date is treated as due date
- whether “expiring soon” means within 7 calendar days unless another window is approved
- whether overdue is shown only when the source date clearly supports it

Recommended:
- Use `expirationAtUtc` as a source-defined urgency signal only.
- `expiringSoon` = expiration date within 7 calendar days.
- Do not invent a due date where Adobe provides none.

---

# 14. SPFx → Backend Authentication Contract

## 14.1 Why This Must Be Explicit
The My Work backend routes are user-specific and must derive the current actor from validated bearer-token claims. This cannot be implemented as unauthenticated plain fetch.

## 14.2 Required Production Pattern
The My Dashboard app should acquire an API-audience-scoped token from SPFx and send:

```http
Authorization: Bearer <token>
```

with all backend route calls.

## 14.3 Recommended Reuse Pattern
Follow the established Project Setup production auth pattern using:
- `createSpfxApiTokenProvider(...)`
- API audience URI
- backend mode readiness checks
- explicit fallback when production prerequisites fail

## 14.4 Required Runtime Inputs
- `functionAppBaseUrl`
- `apiAudience`
- `backendMode`
- `allowBackendModeSwitch` if intentionally supported in development only

## 14.5 Mount-Level Responsibility
`mount.tsx` should:
- receive SPFx context
- create the API token provider
- pass token acquisition capability to the app/backend provider layer
- never expose bearer tokens to component props that do not require them

## 14.6 Backend Client Responsibility
`myWorkBackendReadModelClient.ts` should:
- request a fresh token through injected provider
- send the Authorization header
- not persist the token
- not log the token
- surface backend-unavailable envelopes when route execution cannot complete safely

## 14.7 Permission Approval Contract
The SPFx solution package must request permission to the protected backend API audience, and that permission must be approved by tenant admin before production route validation.

---

# 15. Authenticated Actor → Adobe Principal Resolution Contract

## 15.1 Actor Derivation
Backend routes must derive the actor from validated Entra claims in `AuthContext`.

## 15.2 Recommended Claim Priority
The comprehensive plan should lock the final claim precedence. Recommended baseline:

1. normalized `preferred_username`, when corporate email shaped
2. normalized `upn`, if valid and same tenant context
3. normalized `email`, if present and validated

No user-supplied email parameter may override this.

## 15.3 Normalization Rules
- trim whitespace
- lowercase
- preserve original for display only if needed
- reject blank, malformed, or non-HB-tenant actors as unresolved unless guest support is deliberately approved later

## 15.4 Adobe Principal Resolution Interface
```ts
interface IAdobeSignPrincipalResolver {
  resolveForAuthenticatedActor(actor: AuthenticatedActor): Promise<AdobeSignPrincipalResolution>;
}
```

## 15.5 Principal Resolution Outcomes
- `resolved`
- `authorization-required`
- `principal-unresolved`
- `configuration-required`
- `source-unavailable`

## 15.6 No Cross-User Fallback
If the current actor cannot be resolved to an Adobe principal, return a safe read-model state. Never fall back to a shared principal or admin account for queue content.

---

# 16. Adobe Authentication Architecture Gate

## 16.1 Closed Baseline for Plan
The comprehensive plan should assume:
- **delegated user OAuth** as the live integration baseline

## 16.2 Why Delegated OAuth Is the Safer Plan Baseline
It most directly aligns with:
- “my queue” semantics
- actor-specific access
- minimal impersonation risk
- source-system accountability

## 16.3 Required Backend Components
- OAuth authorization initiation endpoint if user onboarding is in scope
- OAuth callback handler
- token persistence abstraction
- token refresh service
- principal resolver
- Adobe API client

## 16.4 MVP Decision on OAuth Onboarding
The comprehensive plan must lock one of these two implementation paths:

### Recommended MVP path
- Build the module UI and all authorization-required states.
- Implement live OAuth/token machinery only if the Adobe app registration and callback hosting details are confirmed before execution.

### If those details are already available
- Include onboarding CTA and complete authorization flow in the MVP implementation.

## 16.5 Token Storage
The plan must specify:
- where refresh tokens are stored
- encryption expectations
- whether Azure Key Vault, secure database fields, or another approved store is used
- token access is backend-only

## 16.6 Token Lifecycle Rules
- no token persistence in SPFx
- no token logging
- refresh logic server-side only
- failed refresh maps to authorization-required state

---

# 17. Adobe Sign API Query Contract

## 17.1 Query Purpose
Retrieve agreements that require action from the authenticated user.

## 17.2 Actionable Status Filter
The API client must support the following target statuses:
- `WAITING_FOR_MY_SIGNATURE`
- `WAITING_FOR_MY_APPROVAL`
- `WAITING_FOR_MY_ACCEPTANCE`
- `WAITING_FOR_MY_ACKNOWLEDGEMENT`
- `WAITING_FOR_MY_FORM_FILLING`
- `WAITING_FOR_MY_DELEGATION`

## 17.3 Retrieval Method
Use a bounded agreement search strategy rather than broad unfiltered retrieval.

## 17.4 MVP Page Size
Recommended:
- backend first page default: 25 items
- dashboard preview: top 5 items after normalization
- focused module: first page items only unless pagination is explicitly added in MVP

## 17.5 Sort Order
Recommended:
1. nearest expiration date first where available
2. otherwise latest modified date descending
3. otherwise created date descending

## 17.6 Pagination
The read model must include:
- `hasMore`
- `nextCursor` only when the backend genuinely supports continuation

MVP may:
- expose `hasMore`
- defer UI pagination if the initial scope prioritizes shell/module proof over complete browsing

The final plan must state this explicitly.

## 17.7 Required Source Fields
The Adobe adapter should request or derive enough information to populate:
- agreement ID
- agreement name
- sender identity where available
- current action status
- modified date
- expiration date where available
- safe source-open link when available

## 17.8 Regional Access Point
The backend must resolve and use the correct Adobe API base/access point for the authorized user/account. Do not hardcode a single shard/base URI in frontend code.

---

# 18. Backend Route Family and Error Taxonomy

## 18.1 Route Family
```http
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
```

## 18.2 Route Host Pattern
Mirror the PCC backend host structure:
- route registration helper
- `withAuth`
- telemetry wrapper
- request ID extraction
- success and standardized error responses

## 18.3 No User Query Parameters
Prohibited:
```http
GET /api/my-work/users/{email}/adobe-sign/action-queue
GET /api/my-work/me/adobe-sign/action-queue?email=...
```

## 18.4 HTTP and Read-Model Response Matrix
| Scenario | HTTP | Read-model status | UI state |
|---|---:|---|---|
| Valid user, queue available | 200 | `available` | Ready |
| Queue empty | 200 | `available` | Empty |
| Adobe not configured | 200 | `configuration-required` | Configuration state |
| User authorization absent/expired | 200 | `authorization-required` | Authorization state |
| Actor cannot map to principal | 200 | `principal-unresolved` | Resolution state |
| Adobe temporary outage | 200 or 502 — final plan must lock one | `source-unavailable` | Degraded state |
| Partial Adobe data | 200 | `partial` | Partial warning |
| Missing/invalid HB API bearer token | 401 | standard API auth error | App auth failure |
| Authenticated but feature denied by policy | 403 | standard API authorization error | Access denied |
| Unhandled backend exception | 500 | standard API error | General error |

### Recommendation
Use HTTP 200 plus degraded envelope for expected source-system business states, and reserve 4xx/5xx for HB API transport/auth/logic failures.

---

# 19. Runtime Configuration and Production Readiness Contract

## 19.1 Runtime Config Inputs
Define and document:
- `MY_DASHBOARD_BACKEND_MODE`
- `MY_DASHBOARD_FUNCTION_APP_URL`
- `MY_DASHBOARD_API_AUDIENCE`
- `MY_DASHBOARD_ALLOW_BACKEND_MODE_SWITCH`
- `MY_DASHBOARD_ADOBE_SIGN_INTEGRATION_ENABLED`

## 19.2 Mode Values
Recommended:
- `fixture`
- `backend`

## 19.3 Production Readiness Check
The app should determine:
- backend URL present
- API audience present
- SPFx API token provider available
- backend mode allowed
- integration enabled where applicable

## 19.4 Production Blocked Behavior
If backend mode is requested but prerequisites are missing:
- downgrade to fixture/degraded mode only where explicitly desired
- emit visible diagnostic only in development as appropriate
- render production-safe end-user state, not technical stack text

## 19.5 Property Pane Scope
MVP recommendation:
- do not expose backend URL, API audience, or Adobe auth configuration in the web part property pane
- these are governed deployment/runtime settings, not site-owner knobs

---

# 20. Adobe Sign Source Handoff Contract

## 20.1 CTA Label
- **Open in Adobe Sign**

## 20.2 Row-Level CTA Rule
Render the CTA only when the backend provides a validated `sourceOpenUrl`.

## 20.3 No Guessed Links
Do not synthesize or guess per-agreement web URLs on the client.

## 20.4 Fallback Behavior
If the backend cannot supply a safe item URL:
- suppress the CTA for that item, or
- provide a separate general “Open Adobe Sign” launch affordance only if explicitly approved and validated

## 20.5 New Window Behavior
Source-system links should open in a new browser tab/window with accessible labeling.

---

# 21. UI Module Specification — Adobe Sign Action Queue

## 21.1 Dashboard Card View
The home card should include:
- module title
- total pending count
- signature count
- approval count
- other action count
- top 3–5 agreements
- View Queue affordance
- current source status message when not available

## 21.2 Focused Module View
Recommended card composition:
1. Adobe Sign Queue Summary Card
2. Agreement Action List Card
3. Connection / State Card only when a non-ready condition exists
4. Optional future analytics/aging card — deferred unless accepted into scope later

## 21.3 Filters
MVP focused module filters:
- All
- Signature
- Approval
- Other action

## 21.4 Empty State
Production copy should clearly state:
- no Adobe Sign agreements currently require the user’s action

## 21.5 Authorization Required State
Production copy should clearly state:
- Adobe Sign access has not yet been authorized or authorization expired
- what the next step is, if onboarding CTA exists

## 21.6 Configuration Required State
Production copy should clearly state:
- the Adobe Sign integration is not currently available in My Dashboard
- contact/help posture if appropriate

## 21.7 Degraded Source State
Production copy should avoid technical detail and state:
- current source information could not be refreshed
- try again later / last known view unavailable, depending on final caching strategy

---

# 22. Refresh, Caching, Staleness, and Throttling Rules

## 22.1 Frontend Refresh Behavior
MVP:
- load on shell/module render
- manual refresh button in focused module only if UX approves
- no automatic high-frequency polling

## 22.2 Client-Side Debounce
If a manual refresh action exists:
- debounce repeated clicks
- prevent duplicate in-flight requests

## 22.3 Backend Cache Decision
The final plan must explicitly lock:
- no persistent queue cache in MVP, or
- short-lived backend cache with defined TTL

### Recommended MVP
- no durable persistence
- optional short-lived in-memory/provider-level protection only if available in the backend framework without architectural side effects

## 22.4 Staleness Indicator
The read model should carry:
- `generatedAtUtc`
- `isStale`

The UI may display:
- “Last refreshed [time]” in focused module
- avoid overusing timestamps on the dashboard card

## 22.5 Rate Limiting / 429 Handling
Backend Adobe client must:
- honor `Retry-After` when applicable
- avoid uncontrolled immediate retries
- convert throttling into a controlled degraded source state

## 22.6 Webhook Future State
Document webhook-backed sync/cache as a follow-on feature for:
- notifications
- proactive refresh
- near-real-time queue recency
- lower repeated API demand

---

# 23. Security, Privacy, and Telemetry Contract

## 23.1 Data Minimization
The read model should include only what is needed to support the queue UI:
- agreement ID
- agreement title
- sender display/contact where necessary
- action state
- limited dates
- source-open link where validated

## 23.2 Prohibited Exposure
Do not return or persist:
- Adobe bearer tokens
- refresh tokens
- raw OAuth secrets
- unnecessary full raw agreement payloads
- agreement document contents

## 23.3 Logging Rules
Allowed telemetry:
- route name
- correlation/request ID
- success/failure class
- latency
- high-level result counts
- source state

Prohibited telemetry:
- agreement titles
- sender emails
- full Adobe response bodies
- tokens
- user refresh tokens
- query bodies containing sensitive fields unless scrubbed to non-sensitive diagnostics

## 23.4 Auditability
The backend should log enough operational detail to diagnose:
- authorization failures
- principal resolution failures
- source outages
- throttling events
- malformed provider responses

without leaking queue contents.

---

# 24. Fixture Matrix and Mock Data Requirements

## 24.1 Required Fixture Scenarios
The fixture provider should include deterministic scenarios for:

1. Ready state with mixed queue items
2. Empty queue
3. Signature-heavy queue
4. Approval-heavy queue
5. Long agreement titles
6. Missing sender display name
7. Missing expiration date
8. Authorization required
9. Configuration required
10. Principal unresolved
11. Source unavailable
12. Partial response with warnings

## 24.2 Fixture Data Quality
Fixture content should be:
- production-like
- realistic for HB office workflows
- non-sensitive
- deterministic for tests and screenshots

## 24.3 No Placeholder Copy
Avoid:
- lorem ipsum
- fake “test 123”
- developer notes in end-user visible fixture labels

---

# 25. Validation Matrix and Definition of Done

## 25.1 Unit Test Coverage
### Models
- envelope status unions
- action category mappings
- queue summary calculations
- expiring-soon logic
- adapter normalization

### Shell
- state initialization
- module selection normalization
- fallback behavior for invalid module IDs

### UI
- state card rendering
- item filter behavior
- CTA visibility rules
- empty/configuration/authorization states

## 25.2 Client API Tests
- route URL construction
- auth header inclusion
- token provider failure handling
- malformed JSON fallback
- malformed envelope fallback
- non-2xx handling
- backend-unavailable envelope behavior

## 25.3 Backend Route Tests
- route auth gate
- actor extraction
- no actor query override
- route success envelope
- authorization-required business state
- principal-unresolved business state
- source-unavailable business state

## 25.4 Adobe Adapter Tests
- status mapping
- field normalization
- summary calculation
- null-safe handling of optional source fields
- throttling handling
- refresh token failure mapping
- invalid access point handling

## 25.5 Hosted Playwright Evidence
Recommended lane:
```text
e2e/my-dashboard-live/
```

Suggested checks:
- shell smoke
- communication-site full-width posture
- hero + command surface presence
- bento card presence
- Adobe Sign dashboard card visibility
- focused module navigation
- empty state screenshot
- authorization-required screenshot
- responsive breakpoint checks
- no horizontal overflow
- package/version runtime marker proof

## 25.6 Definition of Done
The initiative is complete only when:
- app builds
- package generates through orchestrator
- versions align
- permissions are documented and approved for validation
- backend routes pass tests
- UI fixtures and live-backed states render correctly
- communication-site hosted proof exists
- sanitized evidence is committed or otherwise curated per existing repo doctrine
- documentation is complete

---

# 26. Development Phase Sequence

## Phase 0 — Scope Lock and Repo-Truth Gate
- confirm all closed decisions
- confirm target site/page
- confirm app/domain naming
- confirm Adobe delegated OAuth baseline for plan
- confirm no PCC runtime modifications beyond optional docs/reference updates

## Phase 1 — My Dashboard SPFx Domain Scaffolding
- app folder
- package metadata
- manifest
- mount/runtime marker
- orchestrator registration
- build/package proof

## Phase 2 — My Work Shell Foundation
- shell components
- navigation skeleton
- hero band
- bento canvas
- state hook/router
- responsive semantics
- selector contract

## Phase 3 — My Work Models and Read-Model Client Seam
- shared models
- fixture models
- frontend client interface
- backend client with token provider
- config/runtime readiness

## Phase 4 — My Work Home Surface
- home read model
- summary card
- dashboard choreography
- shell-level hero summary integration

## Phase 5 — Adobe Sign Action Queue UI Module
- dashboard card
- focused module
- summary + list
- filters
- all UI states
- adapter unit tests

## Phase 6 — Backend My Work Read-Model Host
- authenticated routes
- mock provider
- standardized responses
- route tests

## Phase 7 — Adobe OAuth and Live Integration Backbone
- principal resolver
- token service
- token storage abstraction
- Sign API client
- agreement search adapter
- source state translation
- live provider tests

## Phase 8 — Hosted SharePoint Deployment and Evidence
- app package deployment
- target page placement
- hosted verification
- Playwright lane
- screenshot and runtime proof

## Phase 9 — Documentation, Handoff, and Future Roadmap
- README
- runbook
- auth contract note
- live integration support guide
- future module roadmap

---

# 27. Risk Exposure Register

## 27.1 Highest Risk — Adobe Auth Readiness
Risk:
- Adobe app registration, redirect URI, scope approval, or token storage details may not be finalized.

Mitigation:
- implement provider seams and state handling first
- block live adapter finalization until the auth prerequisites are confirmed

## 27.2 SPFx API Permission Approval
Risk:
- protected backend calls fail if SharePoint admin approval is incomplete.

Mitigation:
- include package permission checklist
- include hosted validation preflight

## 27.3 Identity Mapping Drift
Risk:
- Microsoft 365 actor does not resolve cleanly to Acrobat Sign principal.

Mitigation:
- dedicated principal resolution contract
- no fallback impersonation
- clear unresolved state

## 27.4 Adobe Rate-Limit / Source Availability
Risk:
- API throttling or outage creates unreliable UI.

Mitigation:
- bounded search
- controlled degraded states
- no polling loops
- webhook roadmap for later

## 27.5 Shell Architecture Drift
Risk:
- developer adopts HB Homepage shell patterns instead of PCC shell patterns.

Mitigation:
- explicit architecture basis section
- direct shell implementation rules
- secondary reference limitations documented

---

# 28. Standards and Best Practices

## 28.1 HB Intel UI Doctrine
- tokens over raw colors
- professional end-user copy
- no developer placeholder copy
- accessible interaction patterns
- shell/card ownership boundaries preserved

## 28.2 Integration Doctrine
- source-system authority preserved
- read-only queue in HB Intel
- source actions completed in Adobe Sign
- no writeback unless separately approved

## 28.3 Auth Doctrine
- bearer-protected backend routes
- tokens acquired through governed SPFx auth pathway
- Adobe auth handled server-side only

## 28.4 Evidence Doctrine
- hosted proof for communication-site feature
- sanitized evidence
- no credential leakage in logs or artifacts
- package truth proof maintained

---

# 29. Open Items That Must Be Resolved Before the Final Comprehensive Plan Is Considered Complete

The final comprehensive plan should not leave these unresolved. They must be explicitly decided before implementation prompts are generated:

1. Final target SharePoint page URL inside the MyDashboard site
2. Whether the Adobe OAuth onboarding flow itself is included in MVP or deferred behind authorization-required state
3. Final backend source-unavailable transport choice:
   - HTTP 200 + degraded envelope
   - or certain source failures as 5xx
4. Final backend queue cache posture:
   - no cache
   - or defined short-lived TTL cache
5. Final exact claim precedence for actor email resolution
6. Final expiration/urgency threshold if “expiring soon” is rendered
7. Final focused module pagination posture:
   - first page only with `hasMore`
   - or interactive pagination in MVP
8. Final property-pane exposure posture:
   - recommended no operational backend config exposure

---

# 30. Final Target Outcome

The final implementation should produce:

- a standalone **HB Intel My Dashboard** SPFx package
- a polished **My Work shell** hosted on the MyDashboard communication site
- a secure, user-specific **Adobe Sign Action Queue**
- protected authenticated API calls from SPFx to HB Functions
- backend-mediated Adobe access with delegated OAuth baseline
- a reusable architectural foundation for future personal-work modules
- test, package, and hosted evidence parity consistent with HB Intel’s current engineering discipline

---

# 31. Recommended Next Artifact

After this outline is approved, the next artifact should be:

> **A complete comprehensive development plan that fills every section above with final decisions, implementation requirements, file-level change maps, acceptance gates, and developer instructions—without leaving any material architecture decisions open.**
