# 07 — Implementation Sequence and Dependency Map

## Purpose

This file defines the recommended execution order and the dependency logic between the prompt waves. The local agent should not reorder these prompts unless current repo truth proves an earlier prompt is already fully closed.

---

# 1. Prompt Sequence

## Prompt 00 — Repo-Truth Drift Lock and Execution Plan
**Purpose:** Confirm current `main`, inspect required seams, map actual edit footprint, and document drift.  
**Code edits:** No required runtime edits.  
**Dependency:** None.

## Prompt 01 — Reset Shell to Single-Page Command Surface
**Purpose:** Remove visible product dependence on tab/dropdown module navigation and focused route shell posture.  
**Dependency:** Prompt 00.

## Prompt 02 — Replace Telemetry Hero with Compact Production Header
**Purpose:** Replace route-dependent hero with locked compact page header.  
**Dependency:** Prompt 01.

## Prompt 03 — Consolidate Adobe Sign Into One Module Card
**Purpose:** Collapse Adobe fragmentation into one card owning all module states.  
**Dependency:** Prompt 01 and Prompt 02.

## Prompt 04 — Refactor My Projects Into Disciplined Launch-Pad Card
**Purpose:** Reduce footprint, compress low-density states, preserve launch actions.  
**Dependency:** Prompt 01 and Prompt 02.

## Prompt 05 — Recompose Bento Grid and Primary Page Choreography
**Purpose:** Ensure only the two target cards render in locked order/spans.  
**Dependency:** Prompts 03 and 04.

## Prompt 06 — Remove Obsolete UI Artifacts and Reconcile Tests/Docs
**Purpose:** Delete or reconcile dead runtime artifacts and update assertions/docs to the new target architecture.  
**Dependency:** Prompts 01–05.

## Prompt 07 — Final Validation, Package Build, and Hosted-Evidence Readiness
**Purpose:** Run complete verification, package build, and closeout report.  
**Dependency:** Prompts 01–06.

---

# 2. Primary Dependency Notes

## Shell Before Module Consolidation

Do not attempt Adobe consolidation before Prompt 01 establishes that the primary page is the only rendered command surface. Otherwise, Adobe could be rebuilt while still constrained by a rejected route model.

## Header Before Layout Choreography

Do not validate final page composition until Prompt 02 removes the oversized hero. The spacing and first-viewport posture depend on that header reset.

## Module Cards Before Grid Choreography

Do not freeze final bento spans until Prompt 03 and Prompt 04 land the cards that actually occupy those spans.

## Cleanup After Functional Closure

Do not aggressively delete old files in Prompt 01–05 if they still assist migration. Prompt 06 is the dedicated cleanup and reconciliation pass after runtime posture is closed.

---

# 3. Commit / Delivery Guidance

A commit after each prompt is acceptable if the user's local workflow prefers incremental closeouts. The package does not require a single monolithic commit. The local agent should:

- report changed files per prompt;
- report validation executed per prompt;
- avoid unrelated formatting churn;
- never claim hosted validation unless actually performed.

---

# 4. Runtime Safety Constraints

The package is UI-posture-focused. It must not:

- alter backend OAuth semantics unless a compile/runtime seam requires a safe callsite adjustment;
- change Adobe Sign token storage architecture;
- change SharePoint list provisioning;
- mutate production tenant content;
- invent new API endpoints;
- broaden source-of-record responsibility.

---

# 5. Required Final Build Validation

The final prompt must run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```
