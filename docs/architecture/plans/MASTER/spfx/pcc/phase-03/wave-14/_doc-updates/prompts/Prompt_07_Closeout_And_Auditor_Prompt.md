# Prompt 07 — Documentation Closeout and Fresh-Session Auditor Package

## Objective

Close the Phase 14 documentation update with validation evidence and prepare the next fresh-session auditor prompt.

## Required Inputs

- outputs from Prompts 01-06;
- current repo truth;
- validation command results;
- lockfile MD5 before/after.

## Required Work

1. Confirm all intended docs were updated.
2. Confirm machine-readable JSON artifacts are valid.
3. Confirm Wave 13G relationship is documented.
4. Confirm no runtime/code/package/tenant/external writeback scope was introduced.
5. Confirm HBI no-authority rules appear in relevant docs.
6. Confirm wireframes are referenced and complete.
7. Create `Wave_14_Documentation_Closeout.md`.
8. Create a fresh-session auditor prompt under the Wave 14 planning path.

## Required Closeout Content

- repo truth;
- files changed;
- validation results;
- lockfile MD5 before/after;
- blocked scope attestation;
- residual risks;
- recommended next implementation phase;
- fresh-session auditor instructions.

## Validation

- Prettier check touched markdown/json.
- JSON validation.
- `git diff --check`.
- Lockfile MD5 unchanged.

## Closeout

Return commit summary/description only after validation passes.
