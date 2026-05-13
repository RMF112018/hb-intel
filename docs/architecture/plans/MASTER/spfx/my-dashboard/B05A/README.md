# HB Intel My Dashboard — My Projects Dual-Launch Module
# Audit, Reconciliation, and Claude Code Prompt Package

**Prepared:** May 13, 2026  
**Package status:** Execution-ready implementation prompt package  
**Target repo:** `hb-intel`  
**Target application:** `apps/my-dashboard/`  
**Target surface:** My Work home surface  
**Target module:** **My Projects**  
**Agent target:** Claude Code Opus 4.7

---

# 1. Package Purpose

This package converts the attached My Projects development plan into a repo-truth-validated, permission-aware, implementation-ready prompt sequence for a local code agent.

The package is designed to produce a flagship-grade **My Projects** dual-launch module that:

- displays only projects assigned to the authenticated user;
- resolves assignments across:
  - `Projects`;
  - `Legacy Project Fallback Registry`;
- supports the approved fourteen-role project-team taxonomy;
- exposes two explicit launch actions per rendered project:
  - SharePoint site/folder;
  - Procore project home;
- uses:
  - `GET /api/my-work/me/project-links`;
  - `getMyProjectLinks()`;
- preserves backend actor scoping from validated auth claims;
- delivers UI/UX that materially exceeds Project Sites and targets flagship SPFx acceptance;
- closes with tests, hosted validation, evidence, and scorecard proof.

---

# 2. Package Contents

## 2.1 Supporting materials

| File | Purpose |
|---|---|
| `supporting/00_Repo_Truth_Audit_Findings.md` | Exhaustive current repo-truth audit |
| `supporting/01_External_Research_Validation_Summary.md` | Microsoft permissions / selected-resource research validation |
| `supporting/02_Plan_Reconciliation_Updated_Closed_Decisions.md` | Final plan reconciliation and six added implementation clarifications |
| `supporting/03_Prompt_Package_Architecture.md` | Prompt sequence, dependencies, workstreams, expected outcome |
| `supporting/04_Risks_Prerequisites_Operator_Owned_Steps.md` | Permission, migration, sequencing, and hosted-validation risk register |
| `supporting/05_Source_Register_And_Audit_Evidence_Map.md` | Source-to-finding traceability map |

## 2.2 Prompt package

| Prompt | File |
|---:|---|
| 00 | `prompts/Prompt_00_Repo_Truth_Plan_Reconciliation_Gate.md` |
| 01 | `prompts/Prompt_01_Provisioning_Auth_Readiness_HB_SharePoint_Creator_Permission_Proof.md` |
| 02 | `prompts/Prompt_02_Source_List_Schema_Expansion_Descriptor_Docs_Reconciliation.md` |
| 03 | `prompts/Prompt_03_Canonical_Project_Team_Role_Taxonomy_UPN_Normalization_Contract.md` |
| 04 | `prompts/Prompt_04_ProcoreProject_Semantic_Reconciliation_Migration_Impact.md` |
| 05 | `prompts/Prompt_05_Projects_Role_Array_Backfill_Compatibility_Migration.md` |
| 06 | `prompts/Prompt_06_Legacy_Registry_Mirror_Preservation_Backfill_Strategy.md` |
| 07 | `prompts/Prompt_07_Discovery_Writer_Match_Truth_Correction_Preservation_Guardrails.md` |
| 08 | `prompts/Prompt_08_My_Work_Project_Links_Contracts_Fixtures_Route_Map.md` |
| 09 | `prompts/Prompt_09_Backend_Project_Links_Data_Provider_Reconciliation_Engine.md` |
| 10 | `prompts/Prompt_10_Backend_Route_Registration_Auth_Claim_Discipline_Route_Tests.md` |
| 11 | `prompts/Prompt_11_Frontend_Read_Model_Client_Fallback_Integration.md` |
| 12 | `prompts/Prompt_12_My_Projects_Home_Surface_Flagship_Composition.md` |
| 13 | `prompts/Prompt_13_Launch_Rows_Dual_Actions_Role_Chips_Disclosure_State_Matrix.md` |
| 14 | `prompts/Prompt_14_Container_Fit_Choreography_Premium_Polish_Doctrine_Alignment.md` |
| 15 | `prompts/Prompt_15_Validation_Matrix_Hosted_Evidence_Package_Runtime_Truth.md` |
| 16 | `prompts/Prompt_16_Final_Closure_Audit_Scorecard_README_Commit_Guidance.md` |

## 2.3 Optional fresh reviewer prompt

| File | Purpose |
|---|---|
| `Optional_Fresh_Reviewer_Prompt_My_Projects_Package_Audit.md` | Independent package audit before implementation execution |

---

# 3. Closed Target Architecture

## 3.1 Final product identity

- User-facing title:
  - **My Projects**
- Surface:
  - My Dashboard → My Work home surface
- Backend route:
  - `GET /api/my-work/me/project-links`
- Frontend client method:
  - `getMyProjectLinks()`
- Internal module ID:
  - `my-project-links`

## 3.2 Read-model-first architecture

```text
My Dashboard SPFx UI
  -> My Work read-model client
  -> protected backend route
  -> actor from validated auth claims
  -> Projects + Legacy Registry reads
  -> normalized role matching
  -> merge / dedupe / launch action assembly
  -> MyProjectLinksReadModel
  -> flagship My Projects UI surface
```

## 3.3 Launch destinations

Each rendered project exposes:

1. SharePoint
   - project site;
   - or legacy fallback folder.

2. Procore
   - assembled from:
     ```text
     https://app.procore.com/{procoreProject}/project/home
     ```

---

# 4. Critical Audit Conclusions Carried into the Package

## 4.1 The attached plan remains valid

The baseline comprehensive development plan is accepted as the controlling target architecture. The audit did not reopen core product decisions.

## 4.2 Six clarifications were added

1. Distinguish the two `HB SharePoint Creator` seams:
   - SPFx protected-API permission request;
   - app-only provisioning identity.
2. Treat `least-privilege-sites-selected` as a target posture, not already-proven schema-write sufficiency.
3. Explicitly audit current `FolderWebUrl` descriptor/live-schema drift.
4. Extend the existing My Work provider/client/route architecture instead of creating a parallel backend.
5. Keep My Projects readiness local to the new project-links read model, rather than broadening the existing home-level Adobe readiness model.
6. Audit My Dashboard package/runtime truth using My Dashboard’s own current versioning posture.

---

# 5. Recommended Execution Order

Execute prompts in this exact order unless a fresh repo-truth audit proves a necessary change.

```text
00 → 01 → 02 → 03 → 04 → 05 → 06 → 07
   → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16
```

## 5.1 Why the sequence matters

- Prompt 01 must close provisioning/auth assumptions before schema/migration prompts.
- Prompt 02 must establish repo-side schema targets before migration scripts.
- Prompt 03/04 provide the shared role and Procore semantics used by every later layer.
- Prompt 05/06/07 protect data truth before the read-model route depends on it.
- Prompt 08/09/10 build contracts/backend before the frontend surface consumes them.
- Prompt 11 connects clients.
- Prompt 12/13/14 build the flagship module and polish it.
- Prompt 15/16 close with validation and scorecard evidence.

---

# 6. Operator-Owned Live Actions

The local code agent should not autonomously execute live tenant mutations unless a prompt explicitly defines a gated operator-run action and the operator authorizes it.

## 6.1 Operator-owned checklist

- confirm current `HB SharePoint Creator` tenant-granted permissions;
- confirm HBCentral site grants if selected-resource posture is being used;
- approve and execute live schema provisioning;
- approve and execute Projects backfill `--apply`;
- approve and execute Registry mirror/backfill `--apply`;
- approve any live discovery run used for truth-state validation;
- deploy/redeploy the My Dashboard `.sppkg` if hosted evidence requires it;
- capture hosted evidence if storage/auth setup is operator-held.

## 6.2 Existing provisioner seam

The current provisioner lane supports:

- `SHAREPOINT_BEARER_TOKEN`; or
- `DefaultAzureCredential`.

The package does not store secrets and must never commit credentials.

---

# 7. Key Technical Risks Managed by This Package

| Risk | Package control |
|---|---|
| Provisioning permissions insufficient or overclaimed | Prompt 01 |
| `FolderWebUrl` descriptor/live schema drift | Prompt 02 |
| `procoreProject` Yes/No conflict | Prompt 04 |
| Projects role migration correctness | Prompt 05 |
| Registry mirror vs manual preservation | Prompt 06 |
| Discovery writer false match states | Prompt 07 |
| Parallel backend route architecture drift | Prompts 08–10 |
| UI drops below flagship quality | Prompts 12–14 |
| Local-only false confidence | Prompts 15–16 |

---

# 8. Validation Command Reference

The prompts use repo-verified commands wherever possible.

## 8.1 Models

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

## 8.2 Functions

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

## 8.3 My Dashboard

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard lint
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
```

## 8.4 Estimating / project setup when Prompt 04 touches that layer

```bash
pnpm --filter @hbc/features-estimating check-types
pnpm --filter @hbc/features-estimating test
pnpm --filter @hbc/spfx-project-setup build
pnpm --filter @hbc/spfx-project-setup test
```

---

# 9. Final Success Criteria

The implementation sequence is successful only when:

- repo-side source-list target contracts are complete;
- canonical role taxonomy is implemented;
- `procoreProject` semantics are reconciled;
- migration/backfill workflows exist and are operator-safe;
- legacy writer truth is corrected;
- `GET /api/my-work/me/project-links` exists and is actor-scoped;
- frontend client consumes project-links;
- My Projects renders on the My Work home surface;
- every item exposes distinct SharePoint and Procore action slots;
- all required state variants render;
- responsive choreography is credible;
- hosted evidence exists or is explicitly operator-pending;
- scorecard closure reaches:
  - **48+/56**
  - no hard-stop failures.

---

# 10. Recommended Use Pattern

## 10.1 Standard execution

1. Start a fresh local agent session.
2. Provide Prompt 00 and this README/package.
3. Execute prompt-by-prompt.
4. Review each closeout before advancing.
5. Keep live tenant actions gated and operator-owned.

## 10.2 Optional preflight reviewer pass

Before Prompt 00, use:

```text
Optional_Fresh_Reviewer_Prompt_My_Projects_Package_Audit.md
```

to obtain a fresh independent PASS/PASS-WITH-REVISIONS/FAIL review of the package.

---

# 11. Package Verdict

**Execution-ready.**

This package is sufficiently complete to guide a local Claude Code Opus 4.7 agent through the full My Projects dual-launch implementation without leaving material architecture, sequencing, or validation decisions open.
