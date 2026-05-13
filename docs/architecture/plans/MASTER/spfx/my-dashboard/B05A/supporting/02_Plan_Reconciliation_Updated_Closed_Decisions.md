# HB Intel My Dashboard — My Projects Dual-Launch Module
# Plan Reconciliation / Updated Closed Decisions

**Prepared:** May 13, 2026  
**Baseline plan:** `B05A_My_Projects_Dual_Launch_Module_Comprehensive_Development_Plan.md`  
**Purpose:** Reconcile the attached closed-decision plan against current repo truth and authoritative Microsoft provisioning research before authoring implementation prompts.

---

# 1. Reconciliation Verdict

## 1.1 Final disposition

**The attached comprehensive development plan remains valid as the controlling target architecture.**

No core product objective should be reopened. The final prompt package must preserve:

- the **My Projects** module identity;
- placement on the **My Work home surface**;
- the actor-scoped backend route:
  - `GET /api/my-work/me/project-links`;
- frontend read-model method:
  - `getMyProjectLinks()`;
- assignment resolution across:
  - `Projects`;
  - `Legacy Project Fallback Registry`;
- the fourteen-role multi-value UPN taxonomy;
- two independent launch controls per project:
  - SharePoint;
  - Procore;
- the exact Procore URL pattern:
  - `https://app.procore.com/{procoreProject}/project/home`;
- flagship UI/UX acceptance at:
  - **48+/56**;
  - no hard-stop failures;
- no new persistent assignment-index list in this implementation.

## 1.2 Why reconciliation is still required

The repo audit identified several **implementation-critical clarifications** that the plan’s final build package must encode explicitly. These do **not** change the plan’s intent. They remove ambiguity that could cause the local code agent to:

- overclaim the provisioning app’s current permission posture;
- conflate two separate `HB SharePoint Creator` seams;
- fail to remediate a real schema descriptor/live-schema drift;
- extend My Work through the wrong backend provider abstraction;
- mutate home-level source-readiness contracts unnecessarily;
- assume hosted package/version parity that is not current repo truth.

---

# 2. Preserved Closed Decisions

The following plan decisions remain unchanged and binding.

| # | Preserved Decision |
|---:|---|
| 1 | Module name remains **My Projects**. |
| 2 | Surface placement remains **My Work home surface**. |
| 3 | Route remains `GET /api/my-work/me/project-links`. |
| 4 | Frontend client method remains `getMyProjectLinks()`. |
| 5 | Actor identity remains backend-derived from validated auth claims, not query/path overrides. |
| 6 | Both `Projects` and `Legacy Project Fallback Registry` remain assignment-capable sources. |
| 7 | Assignment uses the full fourteen-role taxonomy from the plan. |
| 8 | Both lists receive the canonical fourteen `...Upns` multi-value role fields. |
| 9 | New role fields remain JSON-serialized `string[]` in Note/MultiLineText columns. |
| 10 | `procoreProject` remains the raw Procore project token/identifier. |
| 11 | Procore launch URL remains the exact pattern supplied by the user. |
| 12 | Matched Registry rows mirror Projects authority; legacy-only rows preserve operator-maintained fields. |
| 13 | The current legacy discovery writer hard-coded match-state override must be corrected. |
| 14 | My Projects UI must materially exceed Project Sites and align with the HB Intel Homepage quality bar as a benchmark, not as a cloned homepage composition. |
| 15 | No new persistent assignment-index list is introduced in MVP. |
| 16 | Closure requires benchmark-grade evidence, tests, hosted validation, and scorecard proof. |

---

# 3. Required Refinements Added by Repo Truth and Research

# 3.1 Refinement A — Distinguish the two `HB SharePoint Creator` seams

## What changed

The final implementation package must explicitly distinguish:

1. **My Dashboard SPFx protected-API permission seam**
   - `apps/my-dashboard/config/package-solution.json`
   - Web API permission request:
     - Resource: `HB SharePoint Creator`
     - Scope: `access_as_user`

2. **Legacy fallback/provisioning app-only identity seam**
   - `docs/how-to/administrator/create-legacy-fallback-lists.md`
   - `backend/functions/src/services/legacy-fallback/hosting-config.ts`
   - Active pilot identity:
     - Display name: `HB SharePoint Creator`
     - App/client ID: `08c399eb-a394-4087-b859-659d493f8dc7`
   - Current posture:
     - `pilot-interim`
   - Target posture:
     - `least-privilege-sites-selected`

## Why it changed

The phrase `HB SharePoint Creator` appears in both frontend protected-API packaging and backend/app-only provisioning contexts. They are related in product planning, but they are not interchangeable runtime seams.

## Implementation effect

The prompt package must prevent the local agent from:

- treating the SPFx `access_as_user` declaration as the provisioner’s app-only authorization proof;
- treating the app-only pilot identity as the same thing as the client-side API permission request;
- writing deployment instructions that collapse the two into one undocumented posture.

---

# 3.2 Refinement B — `Sites.Selected` is a target posture, not assumed current schema-write proof

## What changed

The prompt package must preserve the repo’s documented longer-term selected-resource target posture, but it must **not** claim that selected-resource consent automatically satisfies the specific schema-write actions required for this initiative.

## Why it changed

Authoritative Microsoft documentation establishes:

- selected scopes require explicit resource grants;
- selected roles include `read`, `write`, `owner`, and `fullcontrol`;
- Graph create/update list-column endpoint tables enumerate broad application permissions such as:
  - `Sites.Manage.All`;
  - `Sites.FullControl.All`.

## Implementation effect

The provisioning prompt must include a **permission verification gate**:

1. confirm the current repo-documented posture;
2. confirm the tenant/operator-granted app permissions actually available to the `HB SharePoint Creator` path;
3. confirm whether those permissions are sufficient for:
   - schema verification;
   - column creation/update;
   - list item backfill/mirroring;
4. if the current selected-resource posture is under adoption, verify the actual site-level grants and endpoint behavior before relying on it for schema mutation.

The package must not propose a new app registration. It must use the existing app path and document any required operator prerequisite.

---

# 3.3 Refinement C — Add an explicit `FolderWebUrl` descriptor/live-schema drift guard

## What changed

The plan’s provisioning workstream must explicitly call out the live contract drift:

- live list schema reference documents `FolderWebUrl` as a **Text** field;
- `LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR` declares `FolderWebUrl` as **URL**;
- the provisioning compatibility helper only treats desired `URL` as compatible with live `URL`, not `Text`;
- the current provisioner script can emit unresolved mutations or require intentional `--allow-type-drift`.

## Why it changed

This is a current repo-truth drift condition that could interfere with schema-alter runs while adding the My Projects fields.

## Implementation effect

The provisioning prompt must instruct the local agent to:

- detect and report this drift before any live schema mutation;
- decide, within the package’s closed scope, whether:
  - the descriptor should be reconciled to the live text contract;
  - or a separate, explicitly operator-approved remediation is required;
- prevent silent drift acceptance in evidence.

**Closed package decision:**  
Do **not** widen this initiative into a destructive `FolderWebUrl` type replacement. Treat the drift as a gated provisioning-readiness issue, preserve current operational behavior, and document any unresolved type drift clearly if it remains.

---

# 3.4 Refinement D — Project-links must extend the current My Work provider/route architecture, not invent a parallel backend

## What changed

The plan remains correct that `project-links` should be a new protected My Work read-model route, but the prompt package must be more exact about current repo structure:

- current route host registers only:
  - `my-work/me/home`;
  - `my-work/me/adobe-sign/action-queue`;
- current backend host instantiates:
  - `MyWorkMockReadModelProvider`;
- current provider interface has methods only for:
  - `getMyWorkHome(...)`;
  - `getAdobeSignActionQueue(...)`.

## Why it changed

A naive prompt could ask for a “new backend service” without extending the existing My Work provider seam, causing architecture drift.

## Implementation effect

The prompt package must require:

- extension of:
  - `MyWorkReadModels.ts`;
  - route map / response map;
  - frontend client interface;
  - backend provider interface;
  - fixture client;
  - backend client;
  - backend route registration;
- creation of a **project-links-specific live provider/service** that can read from HB Central sources;
- preservation of existing current behavior for home/Adobe queue;
- explicit route and provider tests proving:
  - no actor override surface exists;
  - actor comes from validated claims;
  - new route returns a correctly wrapped My Work read-model envelope.

---

# 3.5 Refinement E — Keep My Projects readiness local to the new read model unless a follow-on home-summary change is deliberately scoped

## What changed

The attached plan correctly calls for source readiness and degraded-state handling, but the current home read model’s `sourceReadiness` taxonomy is Adobe-specific:

```ts
sourceSystem: 'adobe-sign'
```

## Why it changed

Broadening the home-level readiness model from Adobe-only to multi-source in this initiative would create avoidable drift across the current B04/B05 My Work stack.

## Implementation effect

The prompt package must instruct the agent:

- the **My Projects route read model** owns its own source-readiness structure;
- the **My Projects UI surface** owns its own readiness/degraded banner;
- do not expand the existing **My Work home summary** readiness taxonomy unless a prompt explicitly targets that as a later isolated architecture change.

This keeps the initiative focused and avoids contaminating currently closed Adobe-specific home contracts.

---

# 3.6 Refinement F — Hosted package/runtime truth must be audited, not presumed

## What changed

The prompt package must instruct the agent to verify current package/runtime truth rather than assuming version alignment patterns imported from PCC.

Current repo truth observed:

- `apps/my-dashboard/config/package-solution.json`
  - solution version: `1.0.0.002`
  - feature version: `1.0.0.1`
- `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json`
  - web part manifest version: `1.0.0.002`

## Why it changed

My Dashboard package/version posture is not identical to PCC’s later-phase alignment conventions. Hosted validation must respect the app’s own current conventions.

## Implementation effect

The package must instruct the agent to:

- audit package/manifest/version truth before any build or hosted evidence closure;
- update versions only when repo conventions and the implementation path require it;
- report the final package/manifest/runtime posture in closeout evidence;
- avoid importing PCC-specific version assumptions unless repo truth proves they apply.

---

# 4. Updated Closed Decision Register

The original plan’s 36 decisions remain in effect. The audit adds the following **implementation-clarifying decisions**.

| # | Added Closed Decision |
|---:|---|
| 37 | The final package must distinguish the SPFx `HB SharePoint Creator` API permission seam from the backend/app-only `HB SharePoint Creator` provisioner identity seam. |
| 38 | The package must treat `least-privilege-sites-selected` as a repo-documented target posture, not as already-proven schema-write sufficiency. |
| 39 | Live provisioning readiness must explicitly audit the current `FolderWebUrl` descriptor/live-schema drift and may not silently ignore it. |
| 40 | The `project-links` backend route must extend the existing My Work provider/client/route architecture rather than invent a parallel host. |
| 41 | My Projects source readiness remains local to the new project-links read model and UI surface for this initiative. |
| 42 | Hosted validation must prove current My Dashboard package/manifest/runtime truth using My Dashboard conventions, not assumptions imported from PCC. |

---

# 5. Final Reconciled Target Architecture

```text
My Dashboard SPFx UI
  -> My Work home surface
  -> My Projects flagship module
  -> IMyWorkReadModelClient.getMyProjectLinks()
  -> MyWorkBackendReadModelClient or fixture fallback
  -> GET /api/my-work/me/project-links
  -> withAuth + telemetry route host
  -> actor principal from validated auth claims
  -> project-links live provider/service
      -> Projects source read
      -> Legacy Project Fallback Registry source read
      -> normalized role matching
      -> matched-row merge + legacy-only eligibility
      -> SharePoint action assembly
      -> Procore URL assembly
      -> warning/state/readiness synthesis
  -> MyWorkReadModelEnvelope<MyProjectLinksReadModel>
  -> premium My Projects UI rendering
```

---

# 6. Final Reconciliation Verdict

**Proceed with prompt package generation.**

The attached plan is **accepted as the controlling target architecture**, subject only to the six clarifying refinements above. These refinements close repo-truth and platform-permission ambiguity without reopening the user’s product decisions.
