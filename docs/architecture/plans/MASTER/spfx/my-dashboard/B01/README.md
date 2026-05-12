# HB Intel My Dashboard — B01 Implementation Prompt Package

**Package purpose:**  
This package instructs a local code agent to implement the remaining **B01 — My Dashboard Foundation, Scope, and Repo-Truth Development** documentation alignment work in `RMF112018/hb-intel`.

**Package posture:**  
This is a **documentation/planning implementation package**, not a runtime feature package. Live `main` already contains:

- `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md`
- `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md`
- `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md`

The remaining B01 implementation work is therefore **authority-chain hardening, cross-reference correction, drift prevention, and validation**. Do **not** add a duplicate B01 artifact or begin runtime My Dashboard implementation.

---

## 1. Repo assumptions used by this package

### Repository
```text
Repository: RMF112018/hb-intel
Branch: main
Audit date: 2026-05-12
```

### Repo-truth basis
The package was designed against the current live `main` planning/doc posture, including:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/
├── B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md
├── B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md
└── HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

No folder-level `README.md` / plan authority index was found in the target `dev-plan/` directory during audit.

---

## 2. What this package implements

The local agent should execute the prompts in order to:

1. create the missing My Dashboard dev-plan authority/index README,
2. update the comprehensive outline so it visibly defers to B01 and B02 where those batches now carry detailed authority,
3. correct stale My Work reference posture that still contradicts implemented repo truth,
4. correct My Work Feed ADR-number drift in active SF29 planning docs,
5. run documentation-only validation and produce a closure report.

---

## 3. Package contents

| File | Purpose |
|---|---|
| `manifest.json` | Package identity: title, semantic version, file inventory |
| `README.md` | This package guide |
| `00_B01_Implementation_Package_Overview.md` | Objective, repo-truth findings, package posture |
| `01_B01_Repo_Truth_Implementation_Plan.md` | Exact files to create/update and sequencing |
| `02_B01_Document_Authority_And_Cross_Reference_Map.md` | Canonical authority chain and taxonomy map |
| `03_B01_Validation_And_Closeout_Requirements.md` | Validation commands, closure proof, commit expectations |
| `04_B01_Implementation_Gap_Register.md` | Issue-by-issue implementation register |
| `05_B01_Targeted_Web_Verification_Notes.md` | Narrow web-verification notes that support B01’s retained research posture |
| `Prompt_01_Create_My_Dashboard_Dev_Plan_Readme_And_Authority_Index.md` | Create folder-level plan authority README |
| `Prompt_02_Update_My_Dashboard_Outline_For_Batch_Authority_And_Handoff.md` | Update outline to reflect batch authority and B01 taxonomy |
| `Prompt_03_Correct_My_Work_Authority_Drift_And_Legacy_Contract_References.md` | Supersede stale alignment contract and correct active cross-references |
| `Prompt_04_Correct_SF29_ADR_Reference_Drift.md` | Correct active SF29 ADR-0114 → ADR-0115 drift |
| `Prompt_05_Validate_B01_Documentation_Alignment_And_Closeout.md` | Run validation, verify docs-only scope, prepare closure |

---

## 4. Recommended execution order

Execute prompts **sequentially**:

1. `Prompt_01_...`
2. `Prompt_02_...`
3. `Prompt_03_...`
4. `Prompt_04_...`
5. `Prompt_05_...`

### Dependency logic
- Prompt 01 creates the folder authority index that later work should reference.
- Prompt 02 updates the outline to match the now-explicit batch authority chain.
- Prompt 03 resolves the largest live doc contradiction around My Work authority.
- Prompt 04 corrects a separate but related ADR drift in active SF29 docs.
- Prompt 05 validates the full B01 documentation posture after all changes are in place.

No prompt should be skipped.

---

## 5. Files/docs expected to change

### Create
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

### Update
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

docs/reference/workflow-experience/my-work-alignment-contract.md
docs/reference/work-hub/runway-definition.md
docs/reference/provisioning/work-hub-publication-contract.md
docs/reference/workflow-experience/primitive-integration-checklist.md

docs/architecture/plans/shared-features/SF29-My-Work-Feed.md
docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md
```

No runtime source, packages, manifests, lockfiles, app scaffolds, or SPFx implementation files should change.

---

## 6. Explicitly out of scope

The local agent must not:

- create `apps/my-dashboard`,
- implement a My Dashboard web part,
- add My Work shell components,
- add Adobe Sign runtime or OAuth code,
- create backend routes or read models,
- modify package manifests or SPFx packaging code,
- rewrite B02 runtime decisions,
- broaden this work into a general My Work/PWA refactor,
- rewrite archive documents merely because they preserve historical text.

---

## 7. What “done” means

B01 documentation implementation is complete only when:

- the My Dashboard `dev-plan/` folder has an authoritative README/index,
- that README clearly explains B01, B02, the outline, and live-repo precedence,
- the master outline visibly defers to batch artifacts and preserves B01 taxonomy decisions,
- the stale My Work alignment contract is unmistakably superseded/archival,
- active docs no longer imply that My Work Feed is merely future or provisional,
- active SF29 docs point to ADR-0115 rather than a nonexistent My Work ADR-0114 path,
- validation outputs prove the changed repo state,
- the final local-agent closeout states explicitly that no runtime code was added or changed.

---

## 8. How this prepares later B02–B08 work

This package prevents later planning and implementation sessions from:

- treating the outline as more authoritative than B01/B02,
- silently reopening B01 closed product/taxonomy decisions,
- confusing My Dashboard with PCC or Personal Work Hub,
- creating a second personal-work platform primitive beside `@hbc/my-work-feed`,
- relying on a stale alignment contract,
- carrying forward wrong ADR references into downstream prompts.

Later batch work should start from:

1. live repo truth,
2. this dev-plan folder README,
3. B01 for Sections 0–5,
4. the relevant later batch artifact for the sections under development,
5. the outline only as the umbrella scaffold.

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
8. **Any residual drift identified but intentionally out of scope**
9. **Recommended commit summary and description**

Suggested commit title:

```text
docs(my-dashboard): harden B01 authority chain and My Work reference truth
```
