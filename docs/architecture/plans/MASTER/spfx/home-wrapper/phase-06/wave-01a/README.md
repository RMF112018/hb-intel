# Homepage Canvas Cutover Prompt Package

## Objective
Forcefully instruct a local code agent to **prove or complete** the live HB Central homepage page-canvas cutover from **OOB SharePoint Quick Links** to **PriorityActionsRail**, without touching Project Spotlight scope.

## Scope Lock
This package is intentionally narrow.

In scope:
- homepage page-canvas cutover proof or completion
- page authoring / provisioning / automation seams required to perform that cutover
- PriorityActionsRail placement and page-level validation
- documentation and evidence proving the live homepage canvas is in the intended state

Out of scope:
- Project Spotlight data contracts
- Project Spotlight rendering defects
- publisher/list-model remediation
- unrelated homepage shell redesign
- unrelated refactors

## Target End State
The HBCentral homepage canvas must be in this page order:

1. **HB Signature Hero** in the top full-width section
2. **PriorityActionsRail** in the next standard/flexible page section
3. **hbHomepage** in the next full-width section

The final state must also satisfy all of the following:
- the OOB Quick Links instance previously occupying the middle action layer is no longer present on the homepage page canvas
- the PriorityActionsRail instance is actually authored on the page, not merely deployable in the toolbox
- the page is published after cutover
- the repo contains a repeatable mechanism to prove or re-apply the cutover
- the repo contains evidence showing the live homepage canvas is in the intended state

## Why this package exists
Repo truth already proves that:
- `PriorityActionsRail` exists as an independent homepage webpart
- the homepage architecture is intentionally per-webpart and independently mounted
- package/build proof alone does **not** prove the live SharePoint page canvas has been re-authored

This package closes that exact gap.

## Execution Order
1. `00-Plan-Summary.md`
2. `01-Prompt-Establish-Authoritative-Cutover-Mechanism.md`
3. `02-Prompt-Implement-Homepage-Canvas-Cutover.md`
4. `03-Prompt-Prove-Completion-and-Regression-Guard.md`

## Expected Agent Posture
- no deferrals
- no “manual follow-up later” escape hatches
- no widening into Project Spotlight work
- no stopping at packaging proof
- no claiming completion without page-canvas evidence

## Required Completion Standard
The work is not done until the agent has either:
- proven the homepage page was already cut over and documented the proof, **or**
- completed the cutover and published proof that Quick Links is gone and PriorityActionsRail is in place

## Authoritative Mechanism (established by this wave)
- Runbook (authoritative): `docs/how-to/administrator/homepage-action-layer-cutover.md`
- Regression guard (operator runbook): `docs/how-to/administrator/homepage-action-layer-regression-guard.md`
- Evidence folder: `evidence/` (stubs `before-state.md`, `after-state.md` are filled by the operator after each tenant-connected run)
- Seam: `@hbc/pnp-runner-local`
  - Proof (read-only): action `sharepoint-control:proof:homepage-action-layer` / alias `sharepoint:pnp:homepage-action-layer-proof`
  - Apply (idempotent): action `sharepoint-control:provisioning:flagship-action-layer-cutover` / alias `sharepoint:pnp:flagship-action-layer-cutover`
