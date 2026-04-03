# Prompt-07 — App-Binding Verification and Drift Checks

## Objective

Implement the verification and drift-detection slice for first-class app bindings so the Admin control plane can confirm that published bindings are still correct and identify when repair/reapply is needed.

## Important execution rules

- Keep verification/drift logic in the backend/control plane.
- Reuse the Phase 6 verification/evidence pattern where practical.
- **Do not re-read files that are still within active context or memory unless they changed, the context is stale, or the scope widened.**
- Distinguish binding drift from general infrastructure failure.

## Inputs

Use:
- the app-binding architecture and repair policy docs
- the binding store/API from Prompt-04
- the install publication integration from Prompt-05
- the Phase 6 preflight/verification pattern

## Required work

### A. Implement binding verification
Support checks such as:
- active binding record present
- required fields present and valid
- bound Function App URL still matches intended environment posture
- API audience still matches intended app registration posture
- target app binding status not superseded or stale

### B. Implement drift detection
Support a structured finding model for drift such as:
- missing binding
- stale binding
- field mismatch
- superseded but still referenced binding
- unresolved publication failure

### C. Implement repair/reapply support
Provide the backend action(s) needed to:
- reapply active binding
- replace with regenerated binding where appropriate
- update drift status/evidence after repair

### D. Documentation output
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-verification-and-drift.md`

Explain:
- what is verified,
- what counts as drift,
- what repair/reapply does,
- and how this relates to the broader Phase 6 verification pattern.

## Required boundaries

- Do not treat every infrastructure issue as a binding issue.
- Do not hide drift findings in generic dashboards with no repair path.
- Do not auto-repair high-risk binding changes without clear policy support.

## Validation

Add focused tests for:
- verification outcomes
- drift classification
- repair/reapply behavior
- evidence/audit updates

Run the smallest targeted validation set and document it.

## Completion condition

Stop after verification/drift and repair support exist, are documented, and are validated.
Do not build the admin UX in this prompt.
