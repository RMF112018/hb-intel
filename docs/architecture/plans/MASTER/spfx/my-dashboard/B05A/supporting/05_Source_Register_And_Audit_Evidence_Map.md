# HB Intel My Dashboard — My Projects Dual-Launch Module
# Source Register and Audit Evidence Map

**Prepared:** May 13, 2026  
**Purpose:** Provide a compact source-to-finding map for the audit package and implementation prompts.

---

# 1. Attached Baseline Artifacts

| Artifact | Role in package |
|---|---|
| `Fresh_Session_Prompt_My_Dashboard_My_Projects_Prompt_Package_Audit.md` | Governing objective for this package |
| `B05A_My_Projects_Dual_Launch_Module_Comprehensive_Development_Plan.md` | Closed-decision baseline architecture and product plan |

---

# 2. Repo-Truth Evidence Map

## 2.1 My Dashboard / My Work surface architecture

| Source | Audit use |
|---|---|
| `apps/my-dashboard/README.md` | Confirms My Dashboard is a standalone SPFx app and carries protected API permission posture |
| `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx` | Confirms home/focused module routing seam |
| `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx` | Confirms current My Work home composition seam |
| `apps/my-dashboard/src/layout/MyWorkCard.tsx` | Confirms current card primitive/data attribute seam |
| `apps/my-dashboard/src/layout/myWorkFootprints.ts` | Confirms footprint/span system and 1/2/6/8/10/12 column structure |
| `apps/my-dashboard/src/layout/useMyWorkContainerBreakpoint.ts` | Confirms container-aware responsive mode vocabulary |

### Key findings
- My Projects belongs on the **home surface**, not a separate top-level route.
- The module must fit the existing **My Work bento/grid composition**.
- The existing responsive mode vocabulary should be reused.

---

## 2.2 My Work read-model contract/client/provider seams

| Source | Audit use |
|---|---|
| `packages/models/src/myWork/MyWorkReadModels.ts` | Confirms shared envelope, warning/status vocabulary, route map, response map |
| `apps/my-dashboard/src/api/myWorkReadModelClient.ts` | Confirms frontend client interface and route IDs |
| `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts` | Confirms bearer-protected GET client and fallback behavior |
| `apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts` | Confirms fixture fallback integration pattern |
| `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts` | Confirms current protected route host behavior |
| `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.test.ts` | Confirms route registration/auth query discipline test posture |
| `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts` | Confirms provider interface |
| `backend/functions/src/hosts/my-work-read-model/read-models/my-work-mock-read-model-provider.ts` | Confirms current mock-provider implementation |

### Key findings
- The package must **extend** current read-model infrastructure, not create a parallel one.
- Current route host is mock-provider based and exposes only two routes.
- New project-links work requires:
  - new shared DTOs;
  - route-map addition;
  - frontend client addition;
  - backend provider/interface addition;
  - protected route registration and tests.

---

## 2.3 Projects source-list contracts

| Source | Audit use |
|---|---|
| `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md` | Tenant-backed Projects schema snapshot |
| `backend/functions/src/services/projects-list-contract.ts` | Projects persistence mapping and current optional extension fields |
| `packages/models/src/provisioning/IProvisioning.ts` | Project setup domain model and current field semantics |

### Key findings
- Existing Projects list contains:
  - `projectExecutiveUpn`
  - `projectManagerUpn`
  - `leadEstimatorUpn`
  - `supportingEstimatorUpns`
  - `procoreProject`
- It does **not** yet contain the fourteen canonical `...Upns` role arrays from the plan.
- `procoreProject` semantic conflict is real:
  - provisioning model = `'Yes' | 'No'`
  - persistence contract = text field.

---

## 2.4 Legacy Registry source-list contracts and provisioning tooling

| Source | Audit use |
|---|---|
| `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md` | Tenant-backed Legacy Registry schema snapshot |
| `backend/functions/src/services/legacy-fallback/list-descriptors.ts` | Governed list descriptor |
| `scripts/provision-legacy-fallback-lists.ts` | Existing live provisioning script |
| `backend/functions/src/services/legacy-fallback/provisioning-compatibility.ts` | Descriptor/live-type compatibility rules |

### Key findings
- Registry does **not** yet contain:
  - canonical role arrays;
  - `procoreProject`.
- Current schema reference says:
  - `FolderWebUrl` = Text.
- Current descriptor says:
  - `FolderWebUrl` = URL.
- Provisioning compatibility treats:
  - desired `URL` as compatible only with live `URL`, not `Text`.
- The provisioner script already supports:
  - `DefaultAzureCredential`;
  - `SHAREPOINT_BEARER_TOKEN`;
  - JSON mutation reports;
  - `--allow-type-drift`.

---

## 2.5 Legacy fallback writer and truth-state behavior

| Source | Audit use |
|---|---|
| `backend/functions/src/services/legacy-fallback/discovery-repository.ts` | Registry upsert and sync write behavior |

### Key findings
- The writer currently force-persists:
  - `MatchStatus: 'matched'`
  - `MatchConfidence: 'high'`
  - `MatchMethod: 'no-match'`
- This directly conflicts with the target My Projects eligibility model.
- Prompt package must require remediation before project-links relies on Registry match states.

---

## 2.6 Project Sites as semantics precedent

| Source | Audit use |
|---|---|
| `packages/spfx/src/webparts/projectSites/projectSitesResolver.ts` | Source merge/dedupe/launch precedence precedent |

### Key findings
- Project Sites provides useful semantic precedent for:
  - strong linkage;
  - heuristic linkage;
  - synthetic legacy-only rows;
  - duplicate suppression;
  - best fallback candidate selection.
- It must **not** become the UI benchmark for My Projects.

---

## 2.7 Provisioner identity and app posture

| Source | Audit use |
|---|---|
| `docs/how-to/administrator/create-legacy-fallback-lists.md` | Active runbook and provisioner app identity |
| `backend/functions/src/services/legacy-fallback/hosting-config.ts` | Current env seam, app ID, posture, target auth model |
| `apps/my-dashboard/config/package-solution.json` | SPFx protected-API permission declaration |

### Key findings
- The package must distinguish:
  - SPFx `access_as_user` web API permission request;
  - app-only provisioner identity.
- The app-only identity:
  - `HB SharePoint Creator`
  - `08c399eb-a394-4087-b859-659d493f8dc7`
- Current posture:
  - `pilot-interim`
- Target posture:
  - `least-privilege-sites-selected`.

---

## 2.8 UI doctrine and acceptance closure

| Source | Audit use |
|---|---|
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` | Host-aware premium SPFx design doctrine |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md` | Non-homepage operational widget/app overlay |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md` | 56-point scoring and 48+/56 flagship threshold |

### Key findings
- My Projects must be treated as a **flagship SPFx widget/surface**.
- It must avoid a generic enterprise card-grid posture.
- It must produce evidence-backed closure at:
  - **48+/56**
  - no hard-stop failures.

---

## 2.9 Package/runtime validation posture

| Source | Audit use |
|---|---|
| `apps/my-dashboard/package.json` | My Dashboard build/check/test commands |
| `backend/functions/package.json` | Functions build/check/test commands |
| `packages/models/package.json` | Models build/check/test commands |
| `packages/features/estimating/package.json` | Estimating feature validation commands |
| `apps/estimating/package.json` | Project setup app validation commands |
| `apps/my-dashboard/config/package-solution.json` | Current solution/feature package versions |
| `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json` | Current webpart manifest version/full bleed support |

### Key findings
- Prompt validation commands can be concrete and repo-native.
- Hosted/package truth must use the My Dashboard package’s own current posture:
  - solution `1.0.0.002`;
  - webpart manifest `1.0.0.002`;
  - feature `1.0.0.1`.

---

# 3. External Research Evidence Map

| Research Topic | Required Implementation Interpretation |
|---|---|
| Microsoft Graph list-column read permissions | Lower-privilege schema verification differs from schema mutation |
| Microsoft Graph create/update list-column permissions | Schema mutation must be permission-gated |
| Microsoft Graph list creation permissions | List creation is also stronger than read-only access |
| Selected scopes/resource-specific grants | Consent alone is insufficient; explicit resource grant is required |
| Selected roles | `read`, `write`, `owner`, `fullcontrol` |
| Selected posture vs endpoint tables | Do not overclaim schema-write sufficiency from selected-resource posture without tenant verification |

---

# 4. Prompt Package Traceability Matrix

| Package Element | Anchored Finding |
|---|---|
| Prompt 01 | Current vs target `HB SharePoint Creator` posture and Microsoft permission proof |
| Prompt 02 | Missing source-list fields + `FolderWebUrl` drift |
| Prompt 03 | Canonical role taxonomy and JSON-array normalization |
| Prompt 04 | `procoreProject` semantic conflict |
| Prompt 05 | Projects compatibility/backfill |
| Prompt 06 | Registry mirror/preserve logic |
| Prompt 07 | Discovery writer hard-coded override |
| Prompt 08–11 | Existing My Work route/client/provider seams |
| Prompt 12–14 | My Work home placement + flagship SPFx doctrine |
| Prompt 15–16 | Hosted/package truth + 48+/56 closure evidence |

---

# 5. Audit Conclusion

This package is evidence-backed and ready to direct a local code agent through implementation. The prompt package is deliberately more specific than the attached baseline plan in areas where current repo truth or authoritative Microsoft guidance creates implementation risk.
