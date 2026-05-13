# HB Intel My Dashboard — B07 Implementation Prompt Package

**Package purpose:**  
This package instructs a local code agent to reconcile the already-committed **Batch 07** development-planning artifact and align the surrounding My Dashboard plan suite with the current live repo truth.

**B07 authority:**  
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
```

**Primary repo-truth issue:**  
B07 is already committed, but portions of its repo-truth discussion describe the My Dashboard runtime as it existed at the B07 continuation anchor rather than the current `main` branch. Since the B07 planning snapshot, My Work navigation, shell state, shell composition, primary navigation, and hero-band runtime have landed. B07 must now preserve its original audit anchor while clearly reconciling those post-anchor runtime facts.

---

# 1. Repository context

```text
Repository: RMF112018/hb-intel
Target branch: main
B07 continuation anchor: 9a1cefddd8c484623875bee6036ed4aee3b73660
B07 repo artifact commit observed on main: d59cdf7a3b0aa1acea357ab1083022c5fa4fbe3b
```

## Current live-main facts that shape this package

### A. B07 already exists
The canonical B07 artifact is present in the dev-plan folder. This package must **not** create a duplicate B07 file.

### B. B07 contains one known predecessor filename drift
B07 currently references a non-live long-form B05 filename. The live repo uses:

```text
B05_Adobe_Sign_Integration_Architecture_Development.md
```

That cross-reference must be corrected.

### C. B07’s repo-truth runtime snapshot is now stale against `main`
The committed B07 artifact still says:
- the visible app body remains the B02 placeholder host,
- the real My Work shell and navigation are not yet present.

Those statements no longer match current `main`.

Current live repo truth includes:
- `MyDashboardApp.tsx` mounting `MyWorkShell`,
- `MyWorkNavigation.ts` registry,
- `useMyWorkShellState.ts`,
- `MyWorkShell.tsx`,
- `MyWorkPrimaryNavigation.tsx`,
- `MyWorkHeroBand.tsx`.

### D. Some B07 runtime gaps remain real
The following are still not established by current repo truth and remain legitimate future implementation or validation seams:
- hosted My Dashboard evidence lane under `e2e/my-dashboard-live/`,
- curated evidence root under `docs/architecture/evidence/my-dashboard-live/`,
- runtime package-version proof seam on `__hbIntel_myDashboard`,
- broader package-truth critical path coverage for the now-landed shell runtime,
- later My Work read-model clients, surface router / bento runtime, Adobe queue card/module, and live evidence implementation where not yet landed.

### E. README and outline remain behind B07
The My Dashboard `dev-plan/README.md` still indexes only through B03, and the comprehensive outline’s batch-authority table still stops at B02. Both must be reconciled through B07.

---

# 2. What this package implements

The local code agent should execute the prompts in order to:

1. correct B07’s stale B05 predecessor filename reference,
2. reconcile B07’s repo-truth findings to current `main` without erasing its original continuation anchor,
3. clarify which B07 validation gaps remain unresolved versus which shell/runtime facts have already landed,
4. refresh the My Dashboard dev-plan README authority index through B07,
5. update the outline’s batch authority posture through B07,
6. reconcile outline Sections 6, 8, 25, 26, and 27 with B07’s closed validation/evidence/phase-sequencing decisions,
7. validate docs-only scope and produce a deterministic closeout.

---

# 3. Package contents

| File | Purpose |
|---|---|
| `README.md` | This package guide |
| `00_B07_Implementation_Package_Overview.md` | Package posture, repo-truth summary, objective |
| `01_B07_Repo_Truth_Implementation_Plan.md` | Exact docs to update and sequencing |
| `02_B07_Document_Authority_And_Cross_Reference_Map.md` | Authority chain, B07 carry-forward map, section ownership |
| `03_B07_Validation_And_Closeout_Requirements.md` | Validation checklist and closeout requirements |
| `04_B07_Implementation_Gap_Register.md` | Gap-by-gap implementation register |
| `05_B07_Targeted_Web_Verification_Notes.md` | Verification notes for hosted SPFx, Playwright, and WAI/W3C claims |
| `Prompt_01_Reconcile_B07_Artifact_To_Current_Main_And_Correct_B05_Predecessor_Path.md` | Fix B07 itself |
| `Prompt_02_Refresh_Dev_Plan_README_And_Outline_Authority_Through_B07.md` | Refresh authority index/table |
| `Prompt_03_Reconcile_Outline_Sections_6_8_25_With_B07_Validation_Contract.md` | Update hosting, packaging, and validation sections |
| `Prompt_04_Reconcile_Outline_Sections_26_27_And_B07_Dependent_Closure_Items.md` | Update sequence/risk and B07-closed items |
| `Prompt_05_Validate_B07_Documentation_Alignment_And_Closeout.md` | Validation and final closeout |

---

# 4. Recommended execution order

1. `Prompt_01_Reconcile_B07_Artifact_To_Current_Main_And_Correct_B05_Predecessor_Path.md`
2. `Prompt_02_Refresh_Dev_Plan_README_And_Outline_Authority_Through_B07.md`
3. `Prompt_03_Reconcile_Outline_Sections_6_8_25_With_B07_Validation_Contract.md`
4. `Prompt_04_Reconcile_Outline_Sections_26_27_And_B07_Dependent_Closure_Items.md`
5. `Prompt_05_Validate_B07_Documentation_Alignment_And_Closeout.md`

---

# 5. Expected changed files

## Required updates
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md

docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md

docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

No runtime source, package manifests, lockfiles, evidence code, Playwright code, or package orchestrator code should change in this documentation reconciliation package.

---

# 6. B07 decisions the repo must visibly inherit

B07 closes the following plan decisions:

- **Hosted communication-site proof is mandatory** for final acceptance.
- **Workbench/local/package-only proof is insufficient** for final acceptance.
- **My Dashboard gets a dedicated live evidence lane**:
  ```text
  e2e/my-dashboard-live/
  docs/architecture/evidence/my-dashboard-live/
  ```
- **Runtime marker identity is not enough by itself**; hosted package-version proof must be exposed before final hosted acceptance.
- **Package-truth critical runtime path coverage must evolve** with the real runtime and is now immediately relevant because shell/navigation/hero runtime already exists.
- **Live user-specific Adobe queue evidence may not become a privacy leak**.
- **Validation taxonomy is mandatory and layered**: models, shell, UI, clients, routes, provider/adapter, resilience, package truth, and hosted Playwright evidence.
- **Screenshot evidence is review support, not blind certainty**, and must be paired with structural measurements.
- **Development sequencing is dependency-gated**, not chronological by convenience.
- **Final Definition of Done requires hosted curated evidence**, not inference.

---

# 7. Explicitly out of scope

The local code agent must not:

- implement `e2e/my-dashboard-live/`,
- implement runtime package-version fields,
- modify `tools/build-spfx-package.ts`,
- modify `apps/my-dashboard/`,
- modify package versions or manifests,
- create evidence directories,
- implement Playwright lanes,
- implement read-model clients or Adobe queue runtime,
- resolve tenant/app catalog/permission state,
- turn the outline into a duplicate of the full B07 artifact.

Those items may be identified as downstream implementation needs, but they are not code changes in this documentation alignment package.

---

# 8. Closure standard

B07 documentation reconciliation is complete only when:

1. B07 no longer references the stale long-form B05 predecessor filename.
2. B07 distinguishes its original `9a1cef...` audit-anchor snapshot from current `main`.
3. B07 no longer presents current `main` as if the My Work shell/navigation/hero runtime were absent.
4. B07 explicitly preserves still-open runtime/evidence gaps: hosted lane, runtime version proof, package critical path expansion, and later module/client/evidence implementation.
5. The dev-plan README indexes B04, B05, B06, and B07 accurately.
6. The outline batch-authority table identifies B03 through B07.
7. Outline Sections 6, 8, 25, 26, and 27 visibly inherit B07.
8. Any outline “open item” directly closed by B07 is removed or reframed.
9. Validation confirms docs-only scope.

---

# 9. Recommended final local-agent closeout

The final local-agent report should include:

1. **Verdict:** PASS / FAIL
2. **Branch / HEAD**
3. **Docs updated**
4. **B07 predecessor filename correction**
5. **B07 repo-truth reconciliation summary**
6. **README authority-index updates**
7. **Outline authority-table updates**
8. **Section 6 / 8 / 25 / 26 / 27 reconciliation**
9. **Any B07-closed open-item cleanup**
10. **Validation commands and results**
11. **Proof that runtime code/manifests/lockfiles were untouched**
12. **Residual out-of-scope drift, if any**
13. **Recommended commit summary and description**

Suggested commit title:

```text
docs(my-dashboard): reconcile B07 validation and evidence authority
```
