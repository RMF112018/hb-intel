# Phase 07-03 — Release Checklist and Runtime Integrity

## Objective

Close Phase 07 by turning packaging truth and bundle governance into a practical release-hardening package for ongoing deployment and regression prevention.

## Repo scope

- `apps/hb-webparts/**`
- `apps/hb-shell-extension/**`
- SharePoint-facing release docs and verification docs
- any current-state references that should capture the hardened release posture

## Required questions

1. What must be checked before releasing homepage or shell-extension builds?
2. What runtime integrity conditions define a valid deployment?
3. What symptoms indicate a loader-contract, emitted-asset, or placeholder activation regression?
4. What evidence should be recorded in future completion notes?
5. What is the minimum reusable release package that reduces repeated audit work?

## Required work

### A. Create a release checklist
Document the repeatable release process for both packages, including:

- pre-build checks
- build outputs to confirm
- solution/package metadata checks
- proof that lane-specific contracts remain intact
- runtime smoke expectations
- documentation reconciliation checks

### B. Create runtime integrity guidance
Document what must be true after deployment, including:

- homepage package mounts the intended webparts only
- shell-extension package mounts top/bottom safely and independently
- expected CSS/JS artifacts are present
- no unsupported shell takeover behavior is introduced
- safe empty/no-op behavior remains intact

### C. Record failure signatures and triage cues
Create a small failure-reference section for issues such as:

- missing global mount API
- wrong emitted asset expectation
- broad import regression
- unexpected CSS omission or duplication
- placeholder availability mismatch
- proof-case entry confusion
- stale docs causing bad release assumptions

### D. Close the phase with a reusable evidence model
Completion notes should include:

- package versions touched
- asset sizes
- emitted asset inventory reference
- release checklist reference
- runtime integrity validation summary
- any remaining risks deferred to Phase 08

## Deliverables

Create:

- `Phase-07-Release-Checklist.md`
- `Phase-07-Runtime-Integrity-Guide.md`
- `Phase-07-03-Completion-Note.md`

Optional but recommended if helpful:

- `Phase-07-Failure-Signature-and-Triage-Guide.md`

Update as needed:

- docs navigation
- current-state doc classification entries
- any package README release sections

## Verification requirements

Run and report:

- `check-types`
- `lint`
- `build`
- `test`

If there are no code changes in this prompt, still verify document consistency against repo truth.

## Hard rules

- do not collapse Lane A and Lane B release criteria into one vague checklist
- keep the checklist practical and operator-usable
- preserve the Phase 08 boundary: full accessibility audit and QA remain next phase work
