# HB Intel My Dashboard — My Projects Dual-Launch Module
# Comprehensive Prompt Package Architecture

**Prepared:** May 13, 2026  
**Package type:** Multi-prompt Claude Code Opus 4.7 implementation package  
**Total prompts:** 17 implementation prompts + 1 optional fresh-reviewer audit prompt  
**Primary target:** `apps/my-dashboard/` My Work home surface, with supporting model/backend/provisioning changes

---

# 1. Package Design Principles

The prompt package is designed to:

- preserve the attached plan’s locked product decisions;
- execute in a safe, reviewable, prompt-by-prompt sequence;
- keep live tenant mutations gated and operator-owned;
- force early resolution of permission/schema drift before code paths depend on them;
- separate:
  - planning gates,
  - provisioning/schema,
  - contract/model work,
  - backend provider/route work,
  - frontend/UI work,
  - hosted validation,
  - final closure;
- prevent opportunistic refactors outside My Projects scope;
- remain compatible with parallel work in adjacent My Dashboard or HB Intel initiatives.

Every prompt includes:

- objective;
- repo-truth references;
- implementation scope;
- expected file families;
- required non-goals;
- detailed execution steps;
- concrete validation commands where repo-truth permits;
- evidence requirements;
- commit/closeout expectations;
- guardrails and risk notes.

Every prompt also instructs the code agent:

> Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

# 2. Prompt Sequence Overview

| Prompt | Title | Primary Type | Depends On | Expected Outcome |
|---:|---|---|---|---|
| 00 | Repo-Truth / Plan Reconciliation Gate | Audit / Docs | None | Session-specific scope lock, repo-truth delta note, and prompt-run readiness confirmation |
| 01 | Provisioning Auth Readiness and HB SharePoint Creator Permission Proof | Provisioning / Research / Docs | 00 | Confirm current app posture, permission sufficiency, site-grant prerequisites, and operator gates |
| 02 | Source List Schema Expansion and Descriptor/Docs Reconciliation | Schema / Provisioning | 01 | Add target descriptor/docs/contracts for both lists; reconcile or flag drift safely |
| 03 | Canonical Project-Team Role Taxonomy and UPN Normalization Contract | Models / Utilities | 02 | Introduce shared 14-role taxonomy and parse/normalize helpers |
| 04 | `procoreProject` Semantic Reconciliation and Migration Impact | Models / Forms / Contracts | 03 | Convert Yes/No semantics to raw Procore token semantics across affected contracts/docs/tests |
| 05 | Projects Role-Array Backfill and Compatibility Migration | Migration / Script / Tests | 03, 04 | Idempotent Projects canonical role-array backfill from legacy scalar/multi fields |
| 06 | Legacy Registry Mirror/Preservation Backfill Strategy | Migration / Script / Tests | 02, 03, 04, 05 | Matched-row mirror and legacy-only preservation strategy implemented with safe dry-run/apply posture |
| 07 | Discovery Writer Match-Truth Correction and Preservation Guardrails | Backend Service / Tests | 06 | Remove forced match-state override; persist truthful match metadata; preserve manual values |
| 08 | My Work Project-Links Contracts, Fixtures, and Route Map | Shared Models / Fixtures | 03, 04, 07 | Add project-links DTOs, warning codes, route path/response map, fixture scenarios |
| 09 | Backend Project-Links Data Provider and Reconciliation Engine | Backend Service / Tests | 08 | Live provider/service resolves assignments, merges sources, assembles launch actions |
| 10 | Backend Route Registration, Auth Claim Discipline, and Route Tests | Backend Host / Tests | 09 | Register protected route and prove actor scoping/no override surface |
| 11 | Frontend Read-Model Client and Fallback Integration | Frontend API | 08, 10 | Add `getMyProjectLinks()` across app-local client, backend client, and fixture client |
| 12 | My Projects Home-Surface Flagship Composition | Frontend UI | 11 | Introduce full-width My Projects module into My Work home surface |
| 13 | Launch Rows, Dual Actions, Role Chips, Disclosure, and State Matrix | Frontend UI / Interaction | 12 | Build project rows, dual launch controls, role chips, inline expansion, complete state rendering |
| 14 | Container-Fit Choreography, Premium Polish, and Doctrine Alignment | UI Polish / Responsive | 13 | Achieve flagship breakpoint behavior and premium finish without generic card-grid regression |
| 15 | Validation Matrix, Hosted Evidence, and Package/Runtime Truth | Validation / Evidence | 14 | Run repo-truth validation, hosted evidence collection, packaging/runtime proof |
| 16 | Final Closure Audit, Scorecard, README, and Commit Guidance | Closure / Docs | 15 | Produce final scorecard/closeout, update README/evidence references, and recommend commit posture |
| R1 | Optional Fresh Reviewer — Implementation Package Audit | Independent Review | Entire package | Fresh-session auditor verifies package completeness before code-agent execution |

---

# 3. Workstream Architecture

## 3.1 Workstream A — Scope and provisioning readiness

### Prompts
- Prompt 00
- Prompt 01

### Objective
Close the only issues that could invalidate downstream implementation:

- stale assumptions;
- provisioning app permissions;
- selected-resource posture ambiguity;
- site-grant prerequisites;
- operator-owned live execution boundaries.

### Outputs
- repo-truth session note;
- permission/readiness evidence;
- exact operator prerequisite register;
- explicit statement of whether implementation can proceed without live provisioning execution.

---

## 3.2 Workstream B — Source-list contracts and canonical project-role vocabulary

### Prompts
- Prompt 02
- Prompt 03
- Prompt 04

### Objective
Create the shared vocabulary and storage contracts required by every later layer.

### Outputs
- both list descriptors/docs updated for fourteen canonical role arrays;
- Legacy Registry target `procoreProject` column contract;
- shared role taxonomy and normalization helpers;
- `procoreProject` type/semantic reconciliation across provisioning contracts.

---

## 3.3 Workstream C — Migration/backfill and legacy-fallback truth remediation

### Prompts
- Prompt 05
- Prompt 06
- Prompt 07

### Objective
Protect correctness of downstream read models by fixing storage and writer behavior first.

### Outputs
- idempotent Projects role-array backfill;
- matched Registry mirror strategy;
- legacy-only manual field preservation;
- corrected discovery writer match semantics;
- tests for all preservation and truth-state behavior.

---

## 3.4 Workstream D — Read-model contracts and backend implementation

### Prompts
- Prompt 08
- Prompt 09
- Prompt 10

### Objective
Introduce the new My Work project-links route in a repo-native way.

### Outputs
- `MyProjectLinksReadModel`;
- route path and response map additions;
- fixture matrix;
- live backend provider/service;
- route registration under existing My Work host;
- auth/claim discipline and route tests.

---

## 3.5 Workstream E — Frontend integration and flagship UI

### Prompts
- Prompt 11
- Prompt 12
- Prompt 13
- Prompt 14

### Objective
Deliver the user-visible module with the requested premium quality bar.

### Outputs
- frontend API method;
- My Work home integration;
- flagship header/metrics/degraded-state banner;
- project launch rows;
- SharePoint/Procore actions;
- role chip overflow;
- inline View All disclosure;
- responsive choreography across all My Work modes;
- reduced-motion and keyboard-respectful interaction states.

---

## 3.6 Workstream F — Validation, hosted evidence, and final closure

### Prompts
- Prompt 15
- Prompt 16

### Objective
Close the initiative with proof, not impressions.

### Outputs
- validation command outcomes;
- schema/provisioning truth report;
- hosted screenshots/evidence if operator prerequisites exist;
- package/runtime version proof;
- final UI doctrine scorecard;
- README/authority updates;
- final PASS/FAIL closeout and commit guidance.

---

# 4. Prompt Dependency Chain

```text
Prompt 00
  -> Prompt 01
    -> Prompt 02
      -> Prompt 03
        -> Prompt 04
          -> Prompt 05
            -> Prompt 06
              -> Prompt 07
                -> Prompt 08
                  -> Prompt 09
                    -> Prompt 10
                      -> Prompt 11
                        -> Prompt 12
                          -> Prompt 13
                            -> Prompt 14
                              -> Prompt 15
                                -> Prompt 16
```

## 4.1 Controlled concurrency

The sequence is intentionally mostly linear. Limited safe overlap may exist only when a human operator explicitly manages it:

- Prompt 08 model/fixture drafting can begin after Prompt 03 and Prompt 04 if Prompt 07 is clearly not changing any role vocabulary or warning codes.
- Prompt 12 UI shell composition can be prototyped against fixtures after Prompt 11 is complete, even if Prompt 09/10 route work is still under review.
- Prompt 15 hosted evidence must **not** begin until UI and route work are integrated and packaging truth is clear.

---

# 5. Prompt Categories

| Category | Prompts |
|---|---|
| Audit / Reconciliation | 00 |
| Provisioning / Permission Readiness | 01 |
| Schema / Descriptor / Docs | 02 |
| Shared Models / Canonical Utilities | 03, 04, 08 |
| Migration / Backfill | 05, 06 |
| Backend Service | 07, 09, 10 |
| Frontend Client | 11 |
| Frontend UI / Responsive / Polish | 12, 13, 14 |
| Validation / Evidence / Closure | 15, 16 |
| Optional Reviewer | R1 |

---

# 6. Why the Package Uses 17 Prompts

The initiative is not a single “add card” feature. It spans:

- live SharePoint schema posture;
- shared models;
- existing provisioning-domain contract remediation;
- data migration;
- legacy-discovery truth correction;
- backend route/provider work;
- frontend API work;
- premium UI composition;
- hosted validation and closure evidence.

Compressing this into a small prompt count would:

- blur operator-gated live work with repo code work;
- make review harder;
- increase risk of context loss in the local agent;
- create larger commits with mixed concerns;
- raise the probability of regressions in My Dashboard, Project Sites, and provisioning code.

Seventeen prompts is the right reviewable granularity for a flagship implementation.

---

# 7. Expected Artifact Outcome After Prompt 16

If all prompts pass, the repo should contain:

## 7.1 Data/source posture
- canonical role-array contracts for both source lists;
- Legacy Registry `procoreProject` contract;
- backfill/mirroring scripts or equivalent operator-safe implementation;
- truthful discovery writer behavior.

## 7.2 Read-model posture
- new `project-links` route and contract;
- live actor-scoped backend provider;
- fixture scenarios and fallback behavior;
- deterministic merge/dedupe/sorting behavior.

## 7.3 UI posture
- My Projects full-width module on My Work home;
- two explicit launch actions per project;
- high-quality source/readiness and unavailable-state handling;
- container-aware responsive choreography;
- flagship SPFx doctrine acceptance.

## 7.4 Validation posture
- unit/backend/frontend tests;
- package/manifest/runtime truth report;
- hosted evidence when operator prerequisites exist;
- scorecard proof at **48+/56** or a clearly documented FAIL condition.

---

# 8. Optional Fresh Reviewer Prompt

The optional reviewer prompt is included because this package spans multiple domains and makes a meaningful distinction between:

- repo facts;
- external platform facts;
- operator-owned tenant facts.

Use the reviewer prompt before executing Prompt 00 when a fresh independent audit is desired.
