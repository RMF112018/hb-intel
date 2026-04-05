# Phase 00 Implementation Summary — UI Kit / Doctrine / SPFx Contract Reconciliation

## Objective
Phase 00 locks the architectural and documentation contract required to start the SharePoint shell blueprint implementation safely.

This phase is not about broad feature implementation.  
It is about making the repo tell **one coherent story** about:

- what `@hbc/ui-kit` exposes
- which entry points homepage work may use
- how SPFx-hosted homepage work differs from shell-extension work
- which doctrine rules remain binding
- which doctrine rules need a specific SPFx-hosted overlay

---

## Core Problem Being Solved
The audit found that the current repo direction is strong, but future implementation will be unstable if the agent begins Phase 01+ without resolving the following kinds of contradictions:

- source and docs imply a homepage-specific UI-kit lane, but the package contract and repo references are not fully aligned
- homepage guidance and actual package consumption patterns are not fully synchronized
- SPFx constraint language is not consistently expressed across UI-kit references
- the doctrine/reference structure is not yet clean enough to serve as a durable governing base for premium SharePoint homepage work

If left unresolved, these gaps will cause:
- import drift
- stale docs
- design-system misuse
- shell/homepage responsibility bleed
- avoidable rework in later phases

---

## Scope
Phase 00 includes only the work necessary to establish authoritative repo truth.

### In scope
- package entry-point truth
- import/export contract truth
- homepage vs shell-extension boundary truth
- documentation taxonomy and supersession clarity
- SPFx-hosted homepage doctrine overlay
- narrow config/code changes required to make those truths real

### Out of scope
- final homepage visual polish
- shell-extension implementation
- broad webpart refactors
- page-template rollout
- full governance operating model
- packaging/performance hardening beyond what is required to lock the contract

---

## Required Outputs
Phase 00 should leave the repo with the following classes of outputs:

### 1. Repo-truth reconciliation outputs
- one authoritative statement of UI-kit entry points
- one authoritative statement of homepage product scope vs shell-extension scope
- one authoritative statement of current supported SharePoint customization posture

### 2. Package contract outputs
- actual package export truth aligned with docs
- actual usage/import truth aligned with docs
- explicit statements about allowed and prohibited homepage imports
- supporting enforcement mechanisms where appropriate

### 3. Doctrine outputs
- an SPFx-hosted homepage doctrine overlay
- clear distinction between:
  - binding rules
  - directional guidance
  - homepage-specific overlays
  - shell-extension-specific guidance
- explicit supersession or rewrites for stale/conflicting docs

---

## Prompt Sequence

### Prompt 1
`Phase-00-01-Repo-Truth-Reconciliation.md`

Purpose:
- identify and reconcile contradictions across code, package contracts, and docs
- create the authoritative architecture/doctrine baseline for the rest of the phase

### Prompt 2
`Phase-00-02-UI-Kit-Export-and-Import-Contract-Lock.md`

Purpose:
- make the UI-kit entry-point model real, explicit, and enforceable
- remove ambiguity about homepage imports and package boundaries

### Prompt 3
`Phase-00-03-SPFx-Homepage-Doctrine-Overlay-Plan.md`

Purpose:
- convert the clarified contract into a durable SPFx-hosted homepage doctrine overlay
- protect quality while eliminating over-restrictive or contradictory guidance

---

## Hard Gates
Phase 00 must not be closed unless all of the following are true:

1. The repo’s documentation and package contract match.
2. The homepage lane has a clearly documented entry-point policy.
3. Broad `@hbc/ui-kit` imports vs constrained homepage imports are clearly resolved.
4. SPFx-hosted homepage constraints are documented in a way that future agents can apply without guessing.
5. No stale doc remains in a state that could plausibly misdirect later implementation work.

---

## Recommended Working Style
The code agent should work with the following approach:

- audit first, change second
- prefer exact edits over broad rewrites unless taxonomy cleanup is clearly justified
- replace ambiguity with direct language
- leave behind supersession notes when replacing old doc authority
- avoid re-reading files already in active context unless needed to verify a change
- avoid widening scope to adjacent phases

---

## Acceptance Criteria

### Repo truth
- the current package export map and the docs say the same thing
- homepage consumers have one clear allowed entry strategy
- shell-related guidance does not leak into homepage usage without explanation

### Documentation truth
- reference docs are internally consistent
- doctrine hierarchy is understandable
- stale or conflicting statements are removed, replaced, or clearly superseded

### Implementation readiness
- Phase 01 can begin without needing to re-litigate UI-kit entry points or homepage boundaries
- Phase 02 can build premium design foundations on a stable doctrine base

---

## Recommended Closure Note
At the end of the final prompt, the agent should generate a concise phase closure note that includes:

- contradictions resolved
- files changed
- authoritative paths going forward
- residual issues intentionally deferred to later phases
