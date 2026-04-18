# Plan Summary — Wave 01 Enhanced Replacement

## Objective

Correct the live flagship homepage experience without destabilizing the shell architecture, and do so in a way that reflects current repo truth rather than stale assumptions.

## Repo-truth findings that change the plan

### Already implemented on `main`
- The entry-stack orchestration seam already exists.
- `PriorityActionsRail` already exists as a public webpart.
- SharePoint list readers for Priority Actions config and items already exist.
- `PriorityActionsRailAdmin` already exists.
- Shell entry-state policy and shell conformance tests already exist.
- Rail ↔ shell vocabulary alignment already exists at the governance level.

### Still open or only partially closed
- The **live flagship page cutover** away from OOB Quick Links is not proven closed in repo truth.
- The rail still uses coarse viewport-width bucketing at runtime.
- The shell still does not appear to have a first-class **content-state signal** for early-lane promotion / demotion.
- First-lane composition still appears to be driven by preset order + comfort logic, not by non-empty-first value selection.
- Acceptance proof is still too fragmented to certify the complete flagship experience.

### Repo/doc drift that must be corrected
The SharePoint Priority Actions list-schema docs still describe public list-read adapters as pending, even though the public list-read seams already exist in code. Any touched docs must be updated as part of closure.

## Why the attached package was insufficient

1. It treated parts of the command-band system as if they still needed foundational implementation.
2. It did not separate **contract design** from **resolver behavior** for first-lane recomposition.
3. It under-specified page-level cutover proof for the flagship page.
4. It framed acceptance work too broadly instead of targeting the remaining integrated proof gap.
5. It did not explicitly call out repo/document drift.

## External best-practice inputs incorporated into this replacement package

### Reflow / constrained-state acceptance
Use the W3C WCAG reflow floor as a hard acceptance consideration for constrained states:
- 320 CSS px width
- 256 CSS px height

### Container-aware adaptation
Use container-aware or shell-state-aware logic where feasible rather than relying only on viewport-wide media assumptions.

### Full-width SharePoint behavior
Any flagship hero assumptions about full-width placement must continue to respect SharePoint full-width webpart requirements.

### Top-tasks posture
The action layer should behave like a ranked, governed top-tasks system, not a directory of equal-weight destinations.

### Stability and responsiveness
Acceptance proof should explicitly look for layout instability and delayed interaction feedback in the entry stack and action layer.

## Issue inventory

### Issue Group 1 — Entry-stack vertical budget
The laptop baseline still needs a tighter brand + action + value first screen.

**Prompt:** `Prompt-01-Entry-Stack-Vertical-Budget-and-Hero-Governance.md`

### Issue Group 2 — Flagship action-layer cutover
The repo contains the governed action system, but the flagship page-level cutover and proof are not yet sufficiently closed.

**Prompt:** `Prompt-02-Flagship-Page-Action-Layer-Cutover-and-Proof.md`

### Issue Group 3 — Runtime rail alignment
The rail still resolves live runtime conditions through coarse viewport buckets instead of a tighter shell/container-aware mechanism.

**Prompt:** `Prompt-03-PriorityActionsRail-Container-Aware-Alignment.md`

### Issue Group 4 — Content-state signal contract
The shell needs a formal way to know whether a candidate zone is strong, empty, invalid, or low-signal.

**Prompt:** `Prompt-04-First-Lane-Content-State-Contract.md`

### Issue Group 5 — First-lane promotion / demotion resolver
Once the shell can observe candidate state, it must use that signal to promote stronger legal occupants into premium early positions.

**Prompt:** `Prompt-05-First-Lane-Recomposition-Resolver.md`

### Issue Group 6 — Integrated flagship acceptance proof
Existing tests are not enough by themselves to certify the full entry-stack experience.

**Prompt:** `Prompt-06-Integrated-Flagship-Acceptance-Proof.md`

## Sequencing rationale

1. **Budget first.**  
   The vertical budget sets the target for the rest of the stack.

2. **Cut over the live action layer next.**  
   There is no point validating the flagship experience while the wrong live action layer may still exist.

3. **Then harden rail alignment.**  
   Once the correct surface is live, its runtime behavior must align to shell conditions.

4. **Define the shell-visible content-state contract before changing selection logic.**  
   This keeps recomposition explainable and testable.

5. **Implement recomposition after the contract exists.**

6. **Run integrated acceptance last.**  
   Acceptance should certify the real combined system, not a partial stage.

## Required validation checkpoints

- Measured first-screen proof at the standard laptop baseline
- Verified action-band visibility budgets by key viewport / shell states
- Verified portrait and short-height single-column behavior
- Verified empty / invalid / low-signal early-lane occupants are no longer blindly prioritized
- Verified no prohibited pairings or prominence-rule regressions
- Verified touched docs no longer describe already-live Priority Actions seams as pending
