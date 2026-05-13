# HB Intel My Dashboard — B05 Implementation Prompt Package

**Package purpose:**  
This package instructs a local code agent to implement the repository-facing documentation alignment work required for:

```text
B05 — Adobe Sign Integration Architecture, Identity Mapping, OAuth, Agreement Search, and Source Handoff Development
```

**Package posture:**  
This is a **documentation/planning implementation package**, not a runtime integration package. It does **not** instruct the agent to build Adobe OAuth, token storage, grant persistence, Adobe API clients, or production routes. It instructs the agent to:

1. add the authoritative B05 batch artifact to the My Dashboard dev-plan folder,
2. refresh the My Dashboard dev-plan authority index for B04 and B05,
3. reconcile the comprehensive My Dashboard outline where older draft language conflicts with B05’s closed decisions,
4. prune or reclassify outline “open items” that are already closed by B02/B04/B05,
5. validate that the repository now communicates B05’s integration architecture clearly and durably.

---

## 1. Repo assumptions used by this package

### Repository
```text
Repository: RMF112018/hb-intel
Branch: main
Audit date: 2026-05-12
Continuation anchor for B05: 4514a4fda765a0ac40801006374f277beddd7c5a
```

### Live repo posture verified before package generation
The repo currently contains:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/
├── README.md
├── B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md
├── B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md
├── B03_My_Work_Shell_Navigation_And_UX_Development.md
├── B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md
└── HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

The B05 artifact is **not yet the canonical committed dev-plan batch artifact** on the target repo posture addressed by this package. The package therefore treats B05’s first implementation task as creating:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
```

using the authoritative attached B05 artifact supplied to the local agent.

---

## 2. Why this package is needed

B05 closes material integration-architecture decisions that are not yet durably reflected across the My Dashboard planning seams:

- delegated Adobe OAuth is the live auth baseline,
- the Acrobat Sign app posture is `CUSTOMER`,
- actor-to-grant binding is stable-identity based (`tenant context + oid`), not email/UPN keyed,
- app-only HB tokens are not eligible for user-specific Adobe queue reads,
- provider authorization must be grant-record based, not fallback search by email,
- production-live queue access is gated on app registration, redirect URI, secure token store, and backend prerequisites,
- Adobe retrieval baseline is bounded `POST v6/search`,
- row-level handoff URLs are optional and backend-validated only,
- guessed Adobe URLs and signing-URL-as-default-row-CTA behavior are prohibited.

The existing outline still contains older draft language that:
- recommends actor claim priority using `preferred_username` / `upn` / `email`,
- leaves OAuth inclusion as an unresolved architecture choice,
- implies a sort posture that B05 explicitly warns not to claim without live verification,
- under-specifies source handoff and signing URL constraints,
- preserves an “open items” list that still contains decisions already closed by B02/B04/B05.

---

## 3. Package contents

| File | Purpose |
|---|---|
| `README.md` | This package guide |
| `00_B05_Implementation_Package_Overview.md` | Objective, repo-truth findings, package posture |
| `01_B05_Repo_Truth_Implementation_Plan.md` | Exact files to create/update and sequencing |
| `02_B05_Document_Authority_And_Cross_Reference_Map.md` | Authority chain, batch ownership, outline reconciliation map |
| `03_B05_Validation_And_Closeout_Requirements.md` | Validation commands, acceptance checks, closeout format |
| `04_B05_Implementation_Gap_Register.md` | Gap-by-gap remediation register |
| `05_B05_Targeted_Web_Verification_Notes.md` | Narrow verification notes for the time-sensitive Adobe/Microsoft claims B05 preserves |
| `Prompt_01_Add_B05_Authoritative_Batch_Artifact.md` | Add canonical B05 planning artifact |
| `Prompt_02_Refresh_Dev_Plan_README_For_B04_B05_Authority.md` | Update authority index |
| `Prompt_03_Update_Outline_Batch_Authority_For_B03_B04_B05.md` | Refresh outline authority posture |
| `Prompt_04_Reconcile_Outline_Sections_15_16_17_20_And_Open_Items.md` | Replace stale outline draft posture with B05-compatible authority |
| `Prompt_05_Validate_B05_Documentation_Alignment_And_Closeout.md` | Final validation and closeout |

---

## 4. Recommended execution order

Execute prompts **sequentially**:

1. `Prompt_01_Add_B05_Authoritative_Batch_Artifact.md`
2. `Prompt_02_Refresh_Dev_Plan_README_For_B04_B05_Authority.md`
3. `Prompt_03_Update_Outline_Batch_Authority_For_B03_B04_B05.md`
4. `Prompt_04_Reconcile_Outline_Sections_15_16_17_20_And_Open_Items.md`
5. `Prompt_05_Validate_B05_Documentation_Alignment_And_Closeout.md`

### Dependency logic
- Prompt 01 places the canonical B05 artifact.
- Prompt 02 makes the folder authority index acknowledge B04 and B05.
- Prompt 03 makes the outline’s batch-authority header accurate.
- Prompt 04 updates the outline body/open-items posture to align with B05.
- Prompt 05 proves the final docs state is coherent and docs-only.

No prompt should be skipped.

---

## 5. Files/docs expected to change

### Create
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
```

### Update
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md

docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

No other repo paths are expected to change.

---

## 6. Explicitly out of scope

The local agent must not:

- implement OAuth initiation routes,
- implement OAuth callback routes,
- build grant stores or refresh-token persistence,
- add Adobe client secrets or environment wiring,
- create Adobe API service code,
- modify `backend/functions` runtime code,
- modify `apps/my-dashboard` runtime code,
- add or change SPFx manifests, package-solution files, or lockfiles,
- implement source URL policy helpers,
- create test fixtures or production tests for the future live integration,
- rewrite B01–B04 batch artifacts unless a narrow cross-reference correction is explicitly required by the prompts,
- broaden the task into B06/B07/B08 implementation work.

---

## 7. What “done” means

B05 documentation implementation is complete only when:

1. the canonical B05 artifact exists in the My Dashboard dev-plan folder,
2. the folder README indexes B04 and B05 and states B05’s section ownership,
3. the comprehensive outline’s batch-authority section includes B03, B04, and B05,
4. outline Sections 15, 16, 17, and 20 do not contradict B05’s closed integration decisions,
5. the outline no longer presents already-closed B05/B04/B02 items as unresolved open decisions,
6. docs-only scope is preserved,
7. validation outputs prove the resulting authority chain and drift fixes.

---

## 8. Residual non-documentation dependencies that remain after this package

These are **not blockers to committing B05 planning documentation**, but they remain production-live implementation prerequisites:

- Acrobat Sign `CUSTOMER` app registration,
- approved redirect URI,
- backend-side client secret availability,
- secure grant-store selection/provisioning,
- refresh-token encryption strategy,
- test account(s) and live smoke scenarios,
- final empirical verification of the narrowest Adobe `POST v6/search` criteria,
- confirmation of row-level source-open URL availability if the product wants item-specific launch affordances.

These belong to later implementation/security/resilience/test packages, not this documentation package.

---

## 9. Recommended final local-agent closure shape

The final agent report should include:

1. **Verdict:** PASS / FAIL
2. **Branch / HEAD**
3. **Docs created**
4. **Docs updated**
5. **Validation commands executed**
6. **Validation results**
7. **Confirmation that runtime code/manifests/lockfiles were untouched**
8. **Residual production-live dependencies intentionally left out of scope**
9. **Recommended commit summary and description**

Suggested commit title:

```text
docs(my-dashboard): add B05 Adobe integration architecture plan and reconcile authority
```
