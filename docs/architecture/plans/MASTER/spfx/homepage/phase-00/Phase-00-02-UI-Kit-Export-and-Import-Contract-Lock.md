# Phase-00-02 — UI-Kit Export and Import Contract Lock

## Objective
Lock the `@hbc/ui-kit` package contract and the corresponding consumer import rules so that:

- package exports are real and accurate
- documentation matches the published contract
- homepage consumers have a single clear allowed import strategy
- prohibited import patterns are explicit
- future phases cannot drift back into ambiguity

This prompt should be run only after Prompt 1 is complete.

---

## Context
The repo direction implies a constrained homepage UI-kit lane, but the audit identified contract ambiguity between:

- actual package export behavior
- documented entry-point behavior
- homepage consumer guidance
- actual consumer dependency/import posture

This prompt exists to make that contract real and durable.

---

## Hard Rules
- Work from the repo state produced by Prompt 1.
- Do **not** re-read files that are already in your current context or memory unless needed to verify a specific change or resolve a contradiction.
- Do **not** widen scope into homepage redesign or shell-extension implementation.
- Do **not** “solve” ambiguity with vague language; solve it with explicit contract truth.
- Do **not** leave package behavior and docs out of sync.

---

## Primary Repo Areas In Scope
Likely focus areas include, but are not limited to:

- `packages/ui-kit/package.json`
- UI-kit entry-point source files
- UI-kit reference docs
- `apps/hb-webparts/package.json`
- homepage consumer files that import UI-kit surfaces
- lint/config/docs files that should encode or document import guardrails

---

## Tasks

### 1. Confirm the intended entry-point model
Based on Prompt 1’s authoritative boundary work, confirm the intended model for:

- broad `@hbc/ui-kit`
- constrained homepage entry point(s)
- shell-safe / SPFx-constrained entry point(s)
- theme/icon entry points as applicable

### 2. Make the export map truthful
Update the package contract so the published export map matches the intended entry-point model.

If a homepage entry point is meant to be real, make it real and documented.  
If it is not meant to be part of the contract, remove or rewrite any doc that says otherwise.

### 3. Make consumer guidance truthful
Update docs and consuming surfaces so the repo clearly states:

- which imports are allowed for homepage work
- which imports are prohibited for homepage work
- when broad `@hbc/ui-kit` is acceptable
- when constrained entry points are required

### 4. Add guardrails
Implement the narrowest durable guardrails needed to reduce future drift.

Examples may include:
- lint restrictions
- import-policy docs
- entry-point reference tables
- comments or reference notes in consuming package docs

Use judgment.  
Do not over-engineer.  
Do leave the repo safer than it is today.

### 5. Reconcile consuming package posture
If `apps/hb-webparts` currently advertises one import policy but implements another, reconcile that now.

### 6. Remove remaining ambiguity
Any doc or README that still plausibly implies a different import/export truth must be updated or superseded.

---

## Required Deliverables
Leave the repo with the following outcomes:

1. A truthful `@hbc/ui-kit` entry-point/export contract
2. Truthful homepage consumer import guidance
3. Explicit allowed/prohibited import guidance for homepage surfaces
4. Minimal supporting enforcement or guardrails to reduce future drift
5. Updated docs that a future agent can follow without interpretation-heavy guesswork

---

## Acceptance Criteria
This prompt is complete only when:

- the published package contract and the docs match
- homepage work has one clear allowed import strategy
- prohibited import patterns are named explicitly
- `apps/hb-webparts` is no longer out of sync with the documented contract
- a reviewer can tell exactly how future homepage work is supposed to consume UI-kit surfaces

---

## Required End-of-Prompt Output
At the end of your work, provide a concise closure summary that includes:

- package export changes made
- consumer import changes made
- docs updated
- guardrails added
- the final authoritative statement of the homepage import policy
- any intentionally deferred items that belong to Prompt 3 or later phases
