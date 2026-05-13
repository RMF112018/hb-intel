# HB Intel My Dashboard — My Projects Dual-Launch Module
# Risks, Prerequisites, and Operator-Owned Steps

**Prepared:** May 13, 2026  
**Purpose:** Identify the non-code dependencies, live tenant gates, sequencing risks, and operator-owned actions that must be carried into the implementation prompt package.

---

# 1. Executive Risk Verdict

## 1.1 Overall risk posture

The My Projects initiative is **architecturally sound**, but it is not purely local code work. The package must manage six material risk classes:

1. **Provisioning permission readiness**
2. **SharePoint schema drift**
3. **`procoreProject` semantic migration**
4. **Legacy fallback writer truth correction**
5. **Cross-layer My Work route/provider integration**
6. **Hosted SharePoint validation and package/runtime truth**

None of these risks invalidates the initiative. They require explicit sequencing, evidence, and operator-gated execution.

---

# 2. Permission and App-Prerequisite Risks

# 2.1 Existing `HB SharePoint Creator` path must be used

## Binding posture
Any proposed list provisioning, field creation, schema verification, or backfill write path must use the existing `HB SharePoint Creator` app permission path.

## Repo-truth distinctions to preserve

### A. SPFx web API permission request
- App: My Dashboard SPFx package
- File:
  - `apps/my-dashboard/config/package-solution.json`
- Declaration:
  - Resource: `HB SharePoint Creator`
  - Scope: `access_as_user`

### B. App-only legacy fallback/provisioning identity
- Runbook:
  - `docs/how-to/administrator/create-legacy-fallback-lists.md`
- Config:
  - `backend/functions/src/services/legacy-fallback/hosting-config.ts`
- Pilot app identity:
  - Display name: `HB SharePoint Creator`
  - App/client ID: `08c399eb-a394-4087-b859-659d493f8dc7`
- Current posture:
  - `pilot-interim`
- Target posture:
  - `least-privilege-sites-selected`

## Risk
A developer could incorrectly treat these as a single auth mechanism and produce invalid deployment/provisioning guidance.

## Required mitigation
Prompt 01 must force an explicit current-vs-target permission audit and name both seams separately.

---

# 2.2 Current tenant-granted permissions are operator truth, not repo truth

## Risk
The repo documents a posture and an intended app path, but it does not itself prove what permissions are currently granted in Entra ID or what site-level grants are active.

## Required mitigation
Before live provisioning/backfill:

- confirm actual tenant-granted application permissions;
- confirm whether HBCentral site grants exist if selected-resource posture is in use;
- confirm the app can perform:
  - schema read;
  - schema write;
  - list/item backfill write.

This must be operator-verified and recorded in implementation evidence.

---

# 2.3 Selected-resource posture cannot be overclaimed

## Risk
Microsoft’s selected-resource model requires explicit resource grants, and endpoint permission tables for schema mutation still present broad application permissions as the formal endpoint posture. The package must not imply selected consent alone is enough for schema management.

## Required mitigation
Prompt 01 must state:

- selected posture is the longer-term repo-documented target;
- explicit site grants are required;
- selected roles must be verified in tenant;
- schema mutation sufficiency must be proven before using selected posture for column creation/update.

---

# 3. SharePoint Schema and Provisioning Risks

# 3.1 `FolderWebUrl` descriptor/live-schema drift

## Observed drift
- Live schema reference:
  - `FolderWebUrl` documented as `Text`
- Descriptor:
  - `FolderWebUrl` declared as `URL`
- Provisioning compatibility:
  - desired `URL` only accepts live `URL`, not live `Text`

## Risk
Running the existing provisioner while adding My Projects fields can surface unresolved mutations or produce unclear type-drift evidence.

## Required mitigation
Prompt 02 must:

- inspect and report this drift;
- preserve current operational behavior;
- avoid destructive column recreation within My Projects scope;
- decide whether descriptor/docs alignment should be changed or whether the drift remains an explicit unresolved operator issue;
- require provisioning evidence to mention the final state.

---

# 3.2 Projects list schema write path is less mature than legacy-fallback provisioning path

## Risk
The repo contains a mature governed descriptor/provisioner path for legacy fallback lists, but the Projects list schema expansion needed for My Projects may require extending existing schema tooling or introducing a narrowly scoped operator-run script.

## Required mitigation
Prompt 02 must determine the most repo-native method to govern Projects list column expansion and must not silently add one-off mutation code without documentation, validation, and repeat-run behavior.

---

# 3.3 Live list mutation must remain operator-owned

## Operator-owned actions
The local code agent must not autonomously execute live tenant mutation commands unless the prompt explicitly defines a gated operator-run step.

Examples:

```bash
pnpm exec tsx scripts/provision-legacy-fallback-lists.ts
pnpm exec tsx scripts/provision-legacy-fallback-lists.ts --allow-type-drift
```

Potential new scripts created by the implementation may include an explicit dry-run/apply contract, but live `--apply` usage remains operator-owned.

---

# 4. Data Migration Risks

# 4.1 `procoreProject` semantic migration

## Current conflict
- Provisioning model:
  - `procoreProject?: 'Yes' | 'No'`
- Projects persistence:
  - `procoreProject` is a text column

## Target
- `procoreProject?: string`
- Raw project identifier/token
- URL assembled downstream

## Risk
A broad blind rename/refactor could:
- break existing project setup UI assumptions;
- corrupt legacy Yes/No values;
- produce invalid Procore URLs from stale data.

## Required mitigation
Prompt 04 must:

- inventory all Yes/No uses;
- change semantics intentionally;
- identify whether any UI wording must become “Procore project ID/token” rather than “already exists in Procore”;
- define migration handling for pre-existing Yes/No-like stored values;
- make invalid tokens unavailable rather than constructing launch URLs.

---

# 4.2 Projects role backfill must be idempotent

## Required migration mappings
- `leadEstimatorUpn` → `leadEstimatorUpns`
- `supportingEstimatorUpns` → `estimatorUpns`
- `projectManagerUpn` → `projectManagerUpns`
- `projectExecutiveUpn` → `projectExecutiveUpns`

## Risk
Repeat runs or partial migration could duplicate values or overwrite canonical arrays that were already manually corrected.

## Required mitigation
Prompt 05 must require:

- normalize/merge, never blindly replace;
- deterministic sort/dedupe;
- dry-run summary counts;
- repeat-run idempotency tests;
- no erasure of canonical arrays already populated.

---

# 4.3 Registry matched-row mirror vs legacy-only preservation

## Risk
The system has two valid authority models:

- matched Registry rows:
  - Projects authoritative;
- legacy-only Registry rows:
  - operator-maintained fields authoritative.

A careless sync/backfill could blank manual legacy-only assignments or leave matched rows stale.

## Required mitigation
Prompt 06 and Prompt 07 must require:

- mirror matched rows from Projects;
- preserve legacy-only operator values;
- never overwrite legacy-only values with blanks merely because no Projects row exists;
- prove this with tests.

---

# 5. Legacy Fallback Writer Truth Risks

# 5.1 Current hard-coded match override is incompatible with My Projects eligibility

## Observed current behavior
`discovery-repository.ts` writes:

- `MatchStatus: 'matched'`
- `MatchConfidence: 'high'`
- `MatchMethod: 'no-match'`

regardless of the actual matching result.

## Risk
My Projects could treat ineligible Registry rows as qualified or misrepresent source truth.

## Required mitigation
Prompt 07 must:

- remove the hard-coded override;
- persist actual matching-engine output;
- update tests that currently tolerate or encode the override;
- preserve visibility into matching notes/provenance.

---

# 6. My Work Architecture Integration Risks

# 6.1 Current backend host is mock-provider based

## Current truth
The route host currently uses:

- `MyWorkMockReadModelProvider`

and exposes only:

- home route;
- Adobe action queue route.

## Risk
A developer could:
- create a parallel route host;
- bypass existing provider interfaces;
- leave project-links fixture-only;
- or disturb the current home/Adobe routes.

## Required mitigation
Prompt 08 through Prompt 10 must:

- extend existing route map and response map;
- extend provider/client interfaces;
- introduce project-links live provider/service in a repo-native way;
- preserve current existing route behavior;
- prove all three protected GET routes register cleanly after implementation.

---

# 6.2 Home-level source readiness is currently Adobe-specific

## Risk
Expanding global home source-readiness shape prematurely could force avoidable downstream changes.

## Required mitigation
Keep My Projects readiness local to:

- `MyProjectLinksReadModel.sourceReadiness`
- the My Projects surface degraded-state banner.

Do not broaden the home-level source readiness taxonomy in this initiative unless a later prompt explicitly scopes it.

---

# 7. UI/UX and Hosted Validation Risks

# 7.1 Risk of falling below the requested flagship standard

## Risk
A “good enough card” implementation could satisfy data behavior but fail the user’s explicit product objective.

## Required mitigation
Prompt 12 through Prompt 14 must require:

- full-width flagship surface;
- signature header and metrics;
- polished degraded-state banner;
- authoritative launch rows;
- distinct SharePoint/Procore actions;
- role chips and overflow;
- inline View All disclosure;
- anti-generic-card posture;
- container-aware breakpoint behavior;
- reduced-motion and keyboard-safe interactions.

---

# 7.2 Hosted SharePoint behavior cannot be inferred from local unit tests

## Risk
The module may render correctly in Vite/unit tests but fail in the actual SharePoint host due to width, package, or token/runtime seams.

## Required mitigation
Prompt 15 must require hosted validation, when operator prerequisites exist, including:

- package/runtime truth check;
- screenshots or evidence across meaningful width modes;
- no horizontal overflow;
- action accessibility;
- expansion stability;
- shell non-regression;
- hosted state credibility.

---

# 7.3 Package version posture must be repo-truth-specific

## Observed current posture
- solution: `1.0.0.002`
- web part manifest: `1.0.0.002`
- feature: `1.0.0.1`

## Risk
Blindly importing PCC packaging conventions could create false expectations or incorrect version alignment claims.

## Required mitigation
Prompt 15 and Prompt 16 must:

- inspect actual My Dashboard package files;
- report package/manifest/feature truth;
- bump versions only when implementation/deployment rules require it;
- avoid claiming version alignment unless repo truth demonstrates it.

---

# 8. Environment Variables and Live Configuration Dependencies

The package must explicitly inspect and document the relevant environment/config seams, especially those already validated in `hosting-config.ts`.

## 8.1 Core legacy fallback hosting/config keys

- `HBC_LEGACY_FALLBACK_HOSTING_ENV`
- `HBC_LEGACY_FALLBACK_FUNCTION_APP_NAME`
- `HBC_LEGACY_FALLBACK_FUNCTION_HOST_URL`
- `HBC_LEGACY_FALLBACK_HBCENTRAL_SITE_URL`
- `SHAREPOINT_TENANT_URL`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `HBC_LEGACY_FALLBACK_GRAPH_SCOPE`
- `HBC_LEGACY_FALLBACK_AUTH_POSTURE`
- `HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID`
- `HBC_LEGACY_FALLBACK_TARGET_AUTH_MODEL`
- `HBC_LEGACY_FALLBACK_TARGET_AUTH_MODEL_NOTES`

## 8.2 Provisioner credential seam

Existing provisioning script supports:

- `SHAREPOINT_BEARER_TOKEN`, or
- `DefaultAzureCredential`

The implementation package must document which seam is being used by the operator and must not expose secrets in artifacts.

---

# 9. Sequencing Risks

## 9.1 Critical ordering

These must happen in order:

1. permission/readiness gate;
2. descriptor/schema contracts;
3. shared role and Procore semantics;
4. migration/backfill behavior;
5. writer truth correction;
6. read-model contracts;
7. backend implementation;
8. frontend implementation;
9. evidence/closure.

## 9.2 Parallel work risk

Parallel My Dashboard or SharePoint list work can create drift in:

- route map;
- source readiness models;
- package versions;
- SPFx surface composition;
- provisioning scripts.

Every prompt must instruct the agent to protect unrelated active work and report out-of-scope drift rather than absorbing it silently.

---

# 10. Operator-Owned Step Register

| Operator-Owned Step | Why Operator-Owned |
|---|---|
| Confirm tenant-granted `HB SharePoint Creator` app permissions | Entra tenant truth is not in repo |
| Confirm selected-resource site grants if applicable | Requires live tenant inspection |
| Run live schema provisioner scripts | Mutates SharePoint tenant |
| Run live backfill/mirroring `--apply` operations | Mutates list content |
| Approve intentional type-drift handling | Could affect production schema posture |
| Deploy/redeploy My Dashboard package to app catalog | Tenant operation |
| Approve/execute hosted evidence lane if storage/auth state is required | Live host access |
| Confirm production Procore project-token migration handling for existing Yes/No data | Business/data decision in tenant |

---

# 11. Final Risk Verdict

**Proceed, but only with the prompt sequence and gates defined in this package.**

The initiative’s architecture is sound. The principal implementation risks are real but bounded, and they can be controlled through:

- early provisioning/permission proof;
- explicit schema drift accounting;
- idempotent migrations;
- truth-state writer remediation;
- repo-native My Work integration;
- hosted, evidence-backed closure.
