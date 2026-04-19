# Audit-01 — Package vs Repo Reconciliation

## Purpose

Determine which findings from the attached packages remain correct, which are incomplete, and which new issues the old packages failed to raise explicitly.

## Findings from the attached packages that remain correct

### A. Correct: the active homepage seam shifted away from the old flagship rail path

The old packages were correct to say that the hosted homepage no longer routes its launcher through `PriorityActionsRail.tsx` as the homepage runtime authority.

That is still true.

The real hosted launcher path now runs through the homepage wrapper and the dedicated homepage launcher band + ui-kit surface.

### B. Correct: the launcher chip primitive is structurally weak

The current equal-width pill band is still the wrong visual/product pattern for a premium, compact, utility-first launcher.

The prior package correctly identified that the existing chip row wastes width when the primary count is low and reads more like a decorative utility strip than a disciplined command surface.

### C. Correct: icon strategy is materially wrong

The prior package correctly identified that current icon selection is still too generic and too weakly tied to service identity.

This remains one of the clearest remaining quality failures.

### D. Correct: overflow exists technically but not yet as a premium secondary launcher

The prior package correctly recognized that the current overflow panel is functional but under-developed as a product surface.

## Findings that were valid but under-described

### A. The adapter seam

The old package correctly pointed at `priorityActionsLauncherAdapter.ts`, but it under-described how much value is lost there.

This seam is not just a mapping helper. It is the main semantic bottleneck between the normalized SharePoint-backed item model and the rendered homepage launcher.

### B. Host-fit and wrapper seams

The old package was correct to preserve the wrapper-owned entry stack and outer-envelope behavior. But it did not fully translate that into an execution rule: **structural redesign must happen inside the launcher family, not by breaking the wrapper boundary**.

### C. Regression and proof coverage

The old package called for better proof, but it did not fully isolate:

- contradiction tests for visible-count rules
- richer adapter-contract tests
- link-semantics tests
- hosted cutover proof beyond “the surface version marker exists”

## Findings that were missing or materially under-prioritized

### 1. Authoring contract drift

The transition to the homepage launcher effectively retired parts of the old per-device authored layout matrix for the homepage path, yet the config contract still exposes those knobs.

The prior package did not escalate this as a first-order governance issue.

### 2. Internal visible-count contradiction

The current repo still contains more than one count regime for launcher visibility. That contradiction should not survive another implementation wave.

The prior package did not name this clearly enough.

### 3. Open-in-new-tab semantics

The normalized data model is richer than the current homepage chip model. The prior package focused on icon semantics but did not push hard enough on link-behavior semantics.

### 4. Label rescue / truncation behavior

The prior package treated truncation mostly as a visual symptom. It should have been treated as an explicit accessibility and scanability closure unit.

### 5. Stale seam language and back-compat residue

There are still comments and compatibility shims that reflect the transition from the older rail model. The prior package did not force a clearer cleanup of this explanatory and governance drift.

## Structural verdict on the attached prompt package

The old prompt package was **better than average** but still too compressed for clean closure.

Its main shortcomings were:

- not enough prompt space given to contract/governance drift
- not enough prompt space given to label/accessibility detail
- no dedicated prompt for count-rule reconciliation
- no dedicated prompt for model expansion beyond the five-field chip contract

## Resulting package decision

The old package structure is superseded.

This enhanced package increases prompt count and redistributes the work into cleaner closure units so the local code agent cannot satisfy the objective with a superficial visual pass.
