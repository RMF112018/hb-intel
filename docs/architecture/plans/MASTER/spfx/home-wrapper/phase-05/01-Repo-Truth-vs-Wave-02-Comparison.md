# 01 — Repo Truth vs Attached Wave 02 Package

## Comparison posture

This document compares the attached Wave 02 package against the live `main` branch and identifies:

- confirmed issue themes
- underdeveloped issue treatment
- missing issues
- misframed issues

## A. Confirmed themes from the attached package

### 1. Shell governance metadata still matters
This theme is valid.

Live repo truth already includes an occupant registry and protected/configurable shell decisions, but those seams are still not rich enough for a future maintainer configuration surface.

**Repo truth evidence**
- `shell/occupantRegistry.ts`
- `shell/protectedDecisions.ts`
- `shellTypes.ts`

### 2. Persisted layout boundaries still matter
This theme is valid.

The shell already parses `presetId` and `bandOverrides`, but the input boundary is still too permissive and too lightly versioned for persisted future control-panel use.

**Repo truth evidence**
- `shellTypes.ts`
- `shellSchema.ts`
- `shellValidation.ts`

### 3. Preview and validation still matter
This theme is valid in principle.

However, the attached package framed this as though those seams did not exist yet.

**Repo truth evidence**
- `previewShellLayout()`
- `previewBandOverride()`
- `validatePresetStructure()`
- `shellValidation.test.ts`

### 4. Closure artifacts still matter
This theme is valid.

The live shell has validation tests, but not yet a complete shell-only conformance package against breakpoint doctrine and entry-stack rules.

## B. Underdeveloped treatment in the attached package

### 1. Governance registry was framed too generically
The attached Prompt 01 was too broad and too future-facing.

It did not distinguish clearly enough between:

- metadata the shell already owns
- metadata the shell still needs
- metadata the shell should **not** own because it would drift into module redesign

### 2. Persisted boundary work lacked a policy model
The attached Prompt 02 correctly asked for bounded persistence, but it did not require:

- a versioned shell-layout payload
- an explicit reject taxonomy
- code-governed vs configurable decision classification
- authoritative examples of allowed vs prohibited persisted changes

### 3. Preview work was underexplained
The attached Prompt 03 treated preview as missing functionality.

The stronger treatment is not “add preview.”
It is “upgrade existing preview into governance-grade preview, conformance-grade preview, and rejection-grade preview.”

### 4. Closure work was too soft
The attached Prompt 04 asked for closure artifacts, but it did not define a strong enough proof model.

It did not require:

- breakpoint-state proofs
- reflow-state proofs
- first-lane visibility proofs
- entry-stack coordination proofs
- persisted-boundary rejection proofs

## C. Missing issues in the attached package

### 1. Shared entry-stack breakpoint contract
This is the biggest missing issue.

The doctrine and breakpoint spec govern the homepage entry stack as:

1. flagship hero
2. top actions / utility band
3. first shell lane

But the runtime still mounts the hero, priority actions rail, and shell as separate surfaces with no shared shell-owned contract.

**Why this matters**
The shell cannot claim full shell-entry compliance while the first-view behavior is coordinated only indirectly.

### 2. Cross-surface breakpoint mismatch
`hbHomepage` is container-aware.
`PriorityActionsRail` uses viewport/device class logic.
The hero has its own behavior and doctrine requirements.

There is no single shared breakpoint contract for the entry sequence.

### 3. Preset canonicalization and semantic-role discipline
The approved presets exist, but the shell package did not explicitly address:

- canonical semantic-role use
- empty-band policy
- duplicate semantic-role discipline
- what a maintainer may and may not mutate inside a preset-derived layout

### 4. Shell-owned mode negotiation
The shell computes comfort and render-mode decisions, but it still exposes them mainly as data attributes.
The package missed the need for a formal seam that turns shell-fit decisions into a reusable runtime contract.

### 5. Stronger validation/test/proof program
The package mentioned validation but not enough proof categories.

A stronger package must require:

- breakpoint policy tests
- slot comfort tests
- persisted policy rejection tests
- entry-stack contract tests
- conformance artifacts suitable for review

## D. Misframed issues in the attached package

### 1. “Add shell preview” is stale
The shell already has preview helpers.

The real issue is to strengthen and widen the preview surface.

### 2. “Prepare for future control panel” is too narrow as the lead framing
That future-readiness work still matters, but it should not dominate the framing.

The shell’s current higher-priority gap is doctrinal and runtime:
it does not yet own a shared contract for the full entry stack.

### 3. “Closure artifacts” was framed like documentation-only work
That is too soft.

The required closure is not just written summary.
It is executable, testable, inspectable conformance proof.

## E. Final comparison judgment

The attached package was a usable starting point, not a sufficient execution package.

It correctly identified the direction.
It did not correctly identify the current maturity of the shell, the largest current gap, or the level of evidence the replacement package should require.
