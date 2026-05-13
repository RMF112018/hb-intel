# HB Intel My Dashboard — My Projects Dual-Launch Module
# Exhaustive Repo-Truth Audit Findings

**Prepared:** May 13, 2026  
**Audit target:** `apps/my-dashboard/` My Work home surface + supporting backend/model/provisioning seams  
**Baseline artifact:** `B05A_My_Projects_Dual_Launch_Module_Comprehensive_Development_Plan.md`  
**Prompt objective:** Produce an execution-ready Claude Code Opus 4.7 build package, not application code.

---

# 1. Executive Audit Verdict

## 1.1 Verdict

**PASS WITH TARGETED REFINEMENTS.**

The attached comprehensive development plan is materially aligned with the live repo truth and should remain the controlling target architecture for the My Projects initiative. Its core decisions are correct:

- My Projects belongs on the **My Work home surface**.
- The module should be **backend-mediated** and **actor-scoped**.
- The route should be:
  - `GET /api/my-work/me/project-links`
- The frontend client method should be:
  - `getMyProjectLinks()`
- The module must reconcile:
  - `Projects`
  - `Legacy Project Fallback Registry`
- It must expose **two explicit launch actions per project**:
  - SharePoint site/folder
  - Procore project home
- It must implement the **fourteen-role assignment taxonomy** and not rely on the older scalar-only role model.
- It must correct the existing `procoreProject` semantic drift and the legacy discovery writer's hard-coded match-state override.

The repo audit does, however, expose several implementation-critical refinements that must be added to the final prompt package so the local code agent does not accidentally build from an over-simplified or stale interpretation.

---

# 2. Repo-Truth Sources Inspected

## 2.1 My Dashboard / My Work shell

- `apps/my-dashboard/README.md`
- `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/layout/MyWorkCard.tsx`
- `apps/my-dashboard/src/layout/myWorkFootprints.ts`
- `apps/my-dashboard/src/layout/useMyWorkContainerBreakpoint.ts`

## 2.2 My Work read-model clients and contracts

- `packages/models/src/myWork/MyWorkReadModels.ts`
- `apps/my-dashboard/src/api/myWorkReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts`
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.test.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-mock-read-model-provider.ts`

## 2.3 Source-list contracts and provisioning seams

- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- `backend/functions/src/services/projects-list-contract.ts`
- `packages/models/src/provisioning/IProvisioning.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `scripts/provision-legacy-fallback-lists.ts`
- `backend/functions/src/services/legacy-fallback/provisioning-compatibility.ts`

## 2.4 Legacy fallback discovery and Project Sites semantics precedent

- `backend/functions/src/services/legacy-fallback/discovery-repository.ts`
- `packages/spfx/src/webparts/projectSites/projectSitesResolver.ts`

## 2.5 Provisioner authentication posture

- `docs/how-to/administrator/create-legacy-fallback-lists.md`
- `backend/functions/src/services/legacy-fallback/hosting-config.ts`
- `apps/my-dashboard/config/package-solution.json`

## 2.6 UI doctrine / quality closure

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

## 2.7 Validation / package posture

- `apps/my-dashboard/package.json`
- `backend/functions/package.json`
- `packages/models/package.json`
- `packages/features/estimating/package.json`
- `apps/estimating/package.json`
- `apps/my-dashboard/config/package-solution.json`
- `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json`
- `docs/architecture/plans/MASTER/spfx/my-dashboard/B07/03_B07_Validation_And_Closeout_Requirements.md`

---

# 3. Findings That Confirm the Attached Plan

## 3.1 My Dashboard already has the correct My Work shell seam

The plan is right to target the **My Work home surface** rather than invent a new app route or separate shell. Live code confirms:

- `MyWorkSurfaceRouter` returns `MyWorkHomeSurface` for home state.
- `MyWorkHomeSurface` already composes cards into the bento layout.
- Focused modules are represented through module IDs and shell state rather than free-form view routing.
- A My Projects module can be integrated as a full-width home-surface card/surface without breaking shell ownership.

**Implementation consequence:**  
The My Projects UI should enter through the home surface composition, not through a new unrelated shell.

---

## 3.2 The My Work read-model route/client architecture exists and must be extended

The live repo already has:

- a shared read-model envelope family in `@hbc/models/myWork`;
- route path registry:
  - `home`
  - `adobe-sign-action-queue`
- backend and fixture client implementations;
- protected backend routes with:
  - `withAuth(...)`
  - `withTelemetry(...)`
  - actor derivation from validated claims;
- route tests that explicitly reject actor override semantics.

**Implementation consequence:**  
The package must extend the existing My Work read-model family with `project-links`; it must not create a bespoke fetch/client pattern.

---

## 3.3 Actor scoping from validated backend claims is already the repo-standard posture

The route host currently derives the actor from:

- `auth.claims.upn`
- `auth.claims.oid`
- `auth.claims.displayName`

and existing route tests prove that actor/user/principal/email/upn query params are ignored.

**Implementation consequence:**  
The new project-links route should follow the same pattern. The attached plan’s prohibition on actor override query/path parameters is not only correct; it is already native to the codebase.

---

## 3.4 The attached source-list gap analysis is accurate

### Projects list today
The live Projects schema contains:

- `projectExecutiveUpn`
- `projectManagerUpn`
- `leadEstimatorUpn`
- `supportingEstimatorUpns`
- `procoreProject`

It does **not** contain the full fourteen pluralized canonical role arrays.

### Legacy Project Fallback Registry today
The live Registry schema contains:

- matching metadata,
- folder/web URL metadata,
- active-state metadata,
- no fourteen-role assignment array set,
- no `procoreProject`.

**Implementation consequence:**  
The plan’s list-schema expansion workstreams are required and not optional.

---

## 3.5 The `procoreProject` semantic conflict is real and must be remediated

Live repo truth shows a direct semantic split:

- `IProjectSetupRequest.procoreProject?: 'Yes' | 'No'`
- Projects list contract persists `procoreProject` as a text field and comments it as a Yes/No flag.
- The attached My Projects plan requires `procoreProject` to be the **raw Procore project token** used in:
  - `https://app.procore.com/{procoreProject}/project/home`

**Implementation consequence:**  
The final prompt package must preserve the attached plan’s remediation:
- convert the canonical meaning of `procoreProject` to raw token string;
- update types, docs, mappers, tests, and any project-setup UX semantics that currently assume Yes/No;
- derive a boolean "has Procore" state from presence of the token where needed.

---

## 3.6 The legacy discovery writer hard-overrides truthful matching states

`discovery-repository.ts` currently hard-writes:

- `MatchStatus: 'matched'`
- `MatchConfidence: 'high'`
- `MatchMethod: 'no-match'`

even when the matching input says otherwise.

**Implementation consequence:**  
The attached plan is correct: this writer must be corrected before My Projects can rely on Registry match state for eligibility and source reconciliation.

---

## 3.7 Project Sites is the correct semantics precedent but not the UI target

`projectSitesResolver.ts` already proves repo-native patterns for:

- strong vs heuristic linkage,
- deterministic fallback selection,
- synthetic legacy-only emission,
- dedupe ordering,
- source authority precedence.

**Implementation consequence:**  
Prompt instructions should cite Project Sites as a **semantics reference only**:
- reuse reconciliation concepts;
- do not import SPFx Project Sites UI components into My Dashboard;
- do not allow Project Sites’ visual standard to cap the new module.

---

## 3.8 The UI doctrine and 48+/56 closure bar are repo-native

The repo's SPFx doctrine confirms:

- premium authored composition;
- explicit breakpoint/container-fit behavior;
- no generic enterprise card-grid posture;
- complete state model;
- evidence-backed closure;
- flagship/benchmark-grade threshold at `48+/56` with no hard-stop failures.

**Implementation consequence:**  
The plan's premium UI requirement is not aspirational. It maps directly to current doctrine and should be enforced in the package.

---

# 4. Audit Refinements That Must Be Added to the Prompt Package

## 4.1 Refine the HB SharePoint Creator discussion: two seams exist and must not be conflated

The repo exposes **two different HB SharePoint Creator-related seams**:

### A. My Dashboard SPFx package API access request
`apps/my-dashboard/config/package-solution.json` requests:
- resource: `HB SharePoint Creator`
- scope: `access_as_user`

This is the SPFx web API permission request needed for My Dashboard to call a protected downstream API.

### B. Legacy fallback app-only provisioner identity
The legacy fallback docs/config define:
- app name: `HB SharePoint Creator`
- app/client ID: `08c399eb-a394-4087-b859-659d493f8dc7`
- current posture: `pilot-interim`
- target posture: `least-privilege-sites-selected`

This is the app-only provisioning/runtime identity used by the legacy fallback lane.

### Required package correction
The final prompt package must:
- distinguish these two seams explicitly;
- use the app-only `HB SharePoint Creator` posture for provisioning/backfill/operator-run schema work;
- avoid implying that the SPFx `access_as_user` permission request itself authorizes list schema mutation.

---

## 4.2 Do not overclaim the current `Sites.Selected` posture

Repo truth says the current operational posture is:
- **pilot-interim**, not final selected-resource posture.

Microsoft docs show:
- selected scopes need explicit resource grants;
- those grants require consent + resource assignment + token;
- selected-role models include `read`, `write`, `owner`, `fullcontrol`.

However, the Graph endpoint permission tables for creating/updating list columns still enumerate broad application permissions such as:
- `Sites.Manage.All`
- `Sites.FullControl.All`

### Required package correction
The implementation package must:
- document current repo posture vs target posture;
- instruct the agent to verify the active app-only permission grant and site access before any live provisioning;
- treat the future `Sites.Selected` posture as a target model requiring explicit operator verification, not as an already-proven schema-management substitute.

---

## 4.3 Add a known adjacent drift guard: `FolderWebUrl` descriptor vs live schema

Repo truth currently contains a non-trivial drift risk:

- `legacy-project-fallback-registry.md` documents `FolderWebUrl` as **Text**.
- `list-descriptors.ts` declares `FolderWebUrl` as **URL**.
- The schema doc explains the column was recreated as Text after a broken untyped/Graph issue.

The existing provisioner supports unresolved type-drift reporting and `--allow-type-drift`.

### Required package correction
Prompt 02 must:
- force an explicit recheck of the `FolderWebUrl` descriptor/live-schema discrepancy;
- avoid accidentally mutating the column type during the My Projects initiative unless the agent establishes a direct, necessary remediation and documents it;
- permit the My Projects read model to consume the folder URL as a string regardless of descriptor history.

---

## 4.4 Close the backend provider strategy so My Projects does not become fixture-only

Current My Work backend routes instantiate:
- `MyWorkMockReadModelProvider`

That is acceptable for existing B04 fixture routes, but My Projects requires a **real SharePoint-backed read model**.

### Required package correction
The final package must require a **repo-conformant composite provider wiring strategy**:

- Extend the My Work provider contract with `getMyProjectLinks(...)`.
- Preserve existing mock behavior for already-fixture-backed routes unless separately targeted.
- Introduce a live project-links provider/service for the new route.
- Wire the route host so:
  - home/Adobe continue to behave as current repo truth dictates;
  - project-links returns the real backend-mediated actor-scoped read model.
- Provide fixture scenarios for frontend fallback/testing without degrading the live route into fixture-only behavior.

This is a plan refinement required by the current code shape.

---

## 4.5 Explicitly keep My Projects readiness inside its own read model

The current `MyWorkHomeReadModel` source-readiness type is Adobe-centric.  
The attached plan already defines source readiness inside `MyProjectLinksReadModel`.

### Closed decision
Do **not** broaden the home-level `MyWorkSourceReadinessItem` taxonomy as part of this initiative.  
My Projects owns:
- project-source readiness,
- partial source warnings,
- bounded-source warning,
- degraded-state banner

inside the new `MyProjectLinksReadModel` and UI module.

This prevents unrelated home-model churn.

---

## 4.6 Hosted package/version truth must be audited, not assumed

Current My Dashboard package posture:

- package solution version: `1.0.0.002`
- webpart manifest version: `1.0.0.002`
- package feature version: `1.0.0.1`

### Required package correction
Hosted validation prompts must:
- inspect and report the then-current package/manifest/feature versions;
- follow the My Dashboard package conventions actually present in repo truth;
- avoid copy-pasting PCC-specific version-alignment assumptions unless the repo has been changed to make them binding for My Dashboard.

---

# 5. Exact Answers to the Required Audit Questions

## 5.1 Architecture fit

### Where should the module live?
Inside:
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`

with module-specific components under a dedicated My Projects feature folder, most likely:
- `apps/my-dashboard/src/modules/myProjects/`

### Which existing components should be extended?
- `MyWorkHomeSurface`
- My Work bento layout footprint overrides
- My Work read-model client factory paths
- Home-level module composition, but not shell ownership

### Which backend/provider seams should be extended?
- `MY_WORK_READ_MODEL_ROUTE_PATHS`
- `IMyWorkReadModelClient`
- backend client + fixture client
- My Work provider contract
- My Work route host and route tests

---

## 5.2 Data contract fit

### DTOs/route maps that need to exist
Create or extend:
- `MyProjectLinksReadModel`
- `MyProjectLinkItem`
- `MyProjectAssignmentRoleId`
- `MyProjectLinkWarning`
- route key: `'project-links'`
- route path: `'my-work/me/project-links'`
- frontend method: `getMyProjectLinks()`

### Does the attached plan align?
Yes. The plan aligns strongly with the existing envelope pattern:
- `MyWorkReadModelEnvelope<T>`
- source readiness/status pattern
- warning arrays
- deterministic fixture scenarios

### Repo-conformant refinement
The new read model must:
- live under `packages/models/src/myWork/`
- export through the existing myWork barrel structure;
- preserve immutable/read-only DTO style.

---

## 5.3 Source-list contract fit

### Existing Projects fields
Current relevant fields:
- `projectExecutiveUpn`
- `projectManagerUpn`
- `leadEstimatorUpn`
- `supportingEstimatorUpns`
- `procoreProject`
- `SiteUrl`
- project identity fields.

### Existing Registry fields
Current relevant fields:
- `ProjectNumber`
- `LegacyYear`
- `FolderWebUrl`
- `MatchStatus`
- `MatchConfidence`
- `MatchedProjectListItemId`
- `MatchMethod`
- `IsActive`

### Required new fields
Both lists need the fourteen canonical role-array fields.  
Registry additionally needs:
- `procoreProject`

### Existing fields retained as compatibility fields
Retain in Projects:
- `projectExecutiveUpn`
- `projectManagerUpn`
- `leadEstimatorUpn`
- `supportingEstimatorUpns`

### Required migration/backfill
- scalar/legacy Projects assignments -> canonical role arrays;
- matched Registry rows mirror Projects role arrays + Procore token;
- legacy-only Registry rows preserve operator-managed values.

---

## 5.4 Procore fit

### Current meaning in repo
Conflicted:
- provisioning model: Yes/No
- list persistence: text column, still described as flag

### Target meaning
Raw Procore project token string used to assemble the project home URL.

### Code/docs/tests requiring attention
At minimum:
- `packages/models/src/provisioning/IProvisioning.ts`
- Projects contract comments/types
- any project setup field maps/UI depending on Yes/No
- tests/mappers/snapshots/docs asserting old semantics
- Registry descriptor/docs for the new `procoreProject` field

### Compatibility layer?
No separate compatibility field should be added in this initiative.  
Boolean "has Procore" semantics should be derived from presence/validity of the token.

---

## 5.5 Legacy fallback fit

### Does current writer persist truthful matching?
No. It currently overwrites truth with `matched/high/no-match`.

### Required correction
Persist actual matching-engine output and preserve domain states:
- matched
- unmatched
- review-required
- ignored
- disabled

### Matched Registry rows
Mirror:
- canonical role arrays
- `procoreProject`

from authoritative Projects rows.

### Legacy-only rows
Preserve:
- operator-maintained role arrays
- operator-maintained Procore token

and never blank them during discovery refresh.

---

## 5.6 Provisioning fit

### Existing tools to reuse
- `scripts/provision-legacy-fallback-lists.ts`
- legacy fallback list descriptor framework
- provisioning compatibility/type drift reporting

### Required sequence
1. Verify current HB SharePoint Creator app-only posture and tenant prerequisites.
2. Reconcile descriptor/schema drift and expand descriptors/docs.
3. Provision columns through existing app-only path.
4. Run dry-run backfill scripts.
5. Run operator-approved apply backfills.
6. Validate live schema and data summaries.
7. Capture evidence.

### Operator prerequisites
- live credentials/token or managed identity access;
- actual granted app permissions;
- HBCentral site access;
- approval to mutate tenant lists.

---

## 5.7 UI/UX fit

### Required design improvements
- signature full-width launch surface;
- metric strip;
- clear SharePoint vs Procore CTA separation;
- source/provenance badges;
- role chips with overflow;
- degraded-state banner;
- inline expansion;
- honest unavailable states;
- responsive/container-fit behavior across existing My Work modes.

### Homepage standard qualities to import
- authored composition;
- premium surface hierarchy;
- strong width usage;
- refined interaction behavior;
- complete state model;
- hosted-runtime credibility.

### What not to import
- homepage-specific hero shell rules;
- literal homepage composition;
- homepage-only dependency assumptions.

---

## 5.8 Testing and closure fit

Required:
- model/unit tests;
- mapper/repository tests;
- provisioning descriptor tests;
- route tests;
- source failure/partial tests;
- dedupe/reconciliation tests;
- UI rendering/state tests;
- responsive container-fit proof;
- hosted My Dashboard evidence;
- scored doctrine artifact at 48+/56 with no hard stops;
- README/evidence map updates.

---

# 6. Final Audit Conclusion

The attached plan remains the correct controlling architecture.  
The prompt package should execute it with six additional guardrails:

1. Distinguish the two HB SharePoint Creator seams.
2. Do not overclaim the current selected-permission posture.
3. Guard against `FolderWebUrl` descriptor/live-schema drift.
4. Close the backend provider strategy so project-links is live, not fixture-only.
5. Keep project-links readiness inside its own read model.
6. Audit package/version truth instead of assuming PCC-style alignment.

With those refinements, the plan is ready to become a build-grade Claude Code Opus 4.7 prompt package.
