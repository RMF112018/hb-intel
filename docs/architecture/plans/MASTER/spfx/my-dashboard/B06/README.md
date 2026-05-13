# HB Intel My Dashboard — B06 Implementation Prompt Package

**Package purpose:**  
This package instructs a local code agent to implement the remaining **Batch 06 documentation reconciliation work** for:

```text
B06 — HB Intel My Dashboard Operational Resilience, Security, Telemetry, Privacy, and Risk Development
```

**Repo posture used by this package:**  
The canonical B06 planning artifact already exists on live `main`. This package must **not** duplicate or re-add B06. It hardens the surrounding My Dashboard planning documentation so the repo accurately inherits B06’s closed operational, security, telemetry, privacy, and risk decisions.

---

# 1. Repository context

```text
Repository: RMF112018/hb-intel
Branch: main
B06 repo continuation anchor: 43fdc9cfe4227ba82ef5fb15c2dc7f911f9cfe75
```

## Repo-truth findings that shape this package

### Finding 1 — B06 already exists in the repo
The canonical artifact is already present at:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
```

### Finding 2 — B06 carries one predecessor filename drift that should be corrected
The B06 front matter refers to a long-form B05 filename that is not the current repo path. The live repo B05 artifact is:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
```

B06 should be corrected to reference that actual file name wherever it currently uses the outdated longer B05 name.

### Finding 3 — The My Dashboard dev-plan README is stale
The folder README currently indexes only through B03 even though B04, B05, and B06 now exist. It must be updated.

### Finding 4 — The comprehensive outline’s batch-authority table is stale
The outline’s batch authority posture currently identifies only B01 and B02. It must be extended through B06.

### Finding 5 — The outline does not yet inherit B06’s closed decisions
The outline still requires reconciliation for:
- **Section 18** route/error taxonomy refinements,
- **Section 22** refresh/caching/staleness/throttling rules,
- **Section 23** security/privacy/telemetry contract,
- **Section 27** risk exposure register.

### Finding 6 — The outline’s open-items section still carries B06-closed decisions
At minimum, B06 closes:
- final source-unavailable transport posture for expected integration/source states,
- final MVP queue cache posture.

Those must not remain presented as unresolved.

---

# 2. What this package implements

The local code agent should execute the prompts in order to:

1. correct B06’s internal predecessor filename drift,
2. refresh the My Dashboard `dev-plan/README.md` authority index through B06,
3. update the outline’s batch-authority posture through B06,
4. reconcile the outline’s Section 18 route taxonomy with B06,
5. reconcile the outline’s Sections 22, 23, and 27 with B06,
6. prune B06-closed open items,
7. validate that the B06 documentation chain is consistent, docs-only, and ready for downstream use.

---

# 3. Package contents

| File | Purpose |
|---|---|
| `README.md` | This package guide |
| `00_B06_Implementation_Package_Overview.md` | Package posture, repo-truth summary, objective |
| `01_B06_Repo_Truth_Implementation_Plan.md` | Exact docs to update and sequencing |
| `02_B06_Document_Authority_And_Cross_Reference_Map.md` | Authority chain, B06 carry-forward map, section ownership |
| `03_B06_Validation_And_Closeout_Requirements.md` | Validation checklist and closeout requirements |
| `04_B06_Implementation_Gap_Register.md` | Gap-by-gap implementation register |
| `05_B06_Targeted_Web_Verification_Notes.md` | Narrow verification notes supporting B06’s load-bearing external claims |
| `Prompt_01_Correct_B06_Predecessor_Path_And_Refresh_Dev_Plan_Authority_Index.md` | Fix B06 B05 filename drift and update README |
| `Prompt_02_Update_Outline_Batch_Authority_Through_B06.md` | Extend outline authority posture/table through B06 |
| `Prompt_03_Reconcile_Outline_Section_18_With_B06_Operational_Taxonomy.md` | Update Section 18 refinements |
| `Prompt_04_Reconcile_Outline_Sections_22_23_27_And_Prune_B06_Closed_Open_Items.md` | Update operational/security/risk sections and open items |
| `Prompt_05_Validate_B06_Documentation_Alignment_And_Closeout.md` | Validation and final closeout |

---

# 4. Recommended execution order

Execute the prompts sequentially:

1. `Prompt_01_Correct_B06_Predecessor_Path_And_Refresh_Dev_Plan_Authority_Index.md`
2. `Prompt_02_Update_Outline_Batch_Authority_Through_B06.md`
3. `Prompt_03_Reconcile_Outline_Section_18_With_B06_Operational_Taxonomy.md`
4. `Prompt_04_Reconcile_Outline_Sections_22_23_27_And_Prune_B06_Closed_Open_Items.md`
5. `Prompt_05_Validate_B06_Documentation_Alignment_And_Closeout.md`

---

# 5. Expected changed files

## Required updates
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md

docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md

docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

No runtime source, packages, manifests, lockfiles, backend implementation, or test code should change.

---

# 6. B06 decisions the repo must now visibly inherit

B06 closes the following decisions:

- **Refresh posture:** load on render; manual refresh only in the focused Adobe module; no auto-polling in MVP.
- **Cache posture:** no durable queue cache, no persisted last-known queue replay, no browser persistence of queue rows.
- **Freshness posture:** `generatedAtUtc` required; `isStale` reserved for genuine stale data, not page age.
- **Throttling posture:** recognize 429, honor `Retry-After`, bound retries, avoid retry storms.
- **Webhook posture:** future-state only; no webhook runtime in MVP.
- **Telemetry posture:** classification-first, content-minimized, no tokens/provider bodies/row metadata in telemetry.
- **Evidence posture:** inherit PCC sanitization doctrine and add My Dashboard queue-specific restrictions.
- **Error posture:** sanitize provider errors before they can enter generic telemetry wrappers.
- **Route taxonomy refinement:** source/business degradation remains HTTP 200 + typed envelope; auth/query/system failures retain 401/400/500 semantics.
- **Risk posture:** token leakage, stale-data misrepresentation, retry amplification, unsafe URLs, and evidence privacy are explicit hard gates.

---

# 7. Explicitly out of scope

The local code agent must not:

- create or modify `apps/my-dashboard`,
- implement Adobe OAuth,
- implement queue refresh UI,
- implement retry logic,
- implement token storage,
- implement telemetry code,
- implement evidence harness code,
- modify backend runtime behavior,
- modify package manifests,
- adjust B05 integration architecture beyond correcting direct B06 cross-reference filename drift where required,
- turn the outline into a duplicate of the full B06 artifact.

---

# 8. Closure standard

B06 documentation reconciliation is complete only when:

1. B06 no longer points to a nonexistent long-form B05 predecessor filename.
2. The dev-plan README indexes B04, B05, and B06 and reflects their authority roles.
3. The outline batch-authority table identifies B03, B04, B05, and B06.
4. Outline Section 18 captures B06’s operational/error-taxonomy refinements.
5. Outline Section 22 reflects no auto-polling, manual focused refresh only, no durable cache, freshness semantics, throttling/retry posture, and webhook future-state.
6. Outline Section 23 reflects B06’s security/privacy/telemetry minimization posture.
7. Outline Section 27 reflects B06’s implementation-grade operational risk emphasis.
8. B06-closed items are no longer listed as unresolved in the outline’s open-items section.
9. Validation confirms docs-only scope.

---

# 9. Recommended final local-agent closeout

The final local-agent report should include:

1. **Verdict:** PASS / FAIL
2. **Branch / HEAD**
3. **Docs updated**
4. **Exact B06 predecessor reference correction**
5. **README authority index updates**
6. **Outline authority table updates**
7. **Section 18 / 22 / 23 / 27 changes**
8. **Open-item cleanup**
9. **Validation commands and results**
10. **Proof that runtime code/manifests/lockfiles were untouched**
11. **Recommended commit summary and description**

Suggested commit title:

```text
docs(my-dashboard): reconcile B06 resilience and security authority
```
