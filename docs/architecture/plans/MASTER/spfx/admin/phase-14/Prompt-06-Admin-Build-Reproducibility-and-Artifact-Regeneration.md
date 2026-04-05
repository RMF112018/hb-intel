# Prompt 06 — Admin Build Reproducibility and Artifact Regeneration

## Objective

Regenerate the Admin `.sppkg` from the reconciled repo, compare it against the baseline artifact, and prove reproducible repo → binary generation.


## Non-Negotiable Working Rules

- Do not re-read files that are already in your current context or memory unless needed to verify a contradiction, confirm exact wording, inspect a newly changed file, or capture exact evidence for a report.
- Do not make assumptions about the package, build, or runtime contract. Prove every material conclusion.
- Distinguish clearly between:
  1. confirmed package fact
  2. confirmed repo fact
  3. confirmed doc intent
  4. inferred recommendation
  5. unresolved issue
- Prefer narrow, high-signal code changes over broad speculative edits.
- Do not collapse multiple unresolved root-cause areas into one mixed remediation step.
- Preserve forensic traceability from finding → code change → regenerated artifact → validation evidence.


## Required Inputs

Use all prior Prompt 01–05 outputs and the frozen baseline package inventory.

## Required Tasks

1. Run the authoritative Admin packaging pipeline.
2. Generate a fresh Admin `.sppkg`.
3. Unpack and inspect the regenerated package.
4. Compare the regenerated package against:
   - the pre-remediation audited package
   - the reconciled source
   - current docs
5. Classify every difference as:
   - intended remediation change
   - neutral build variance
   - regression
   - unresolved mismatch
6. Fix any remaining mismatches until the generated package is intentionally aligned with repo truth.

## Deliverables

Create or update:

- regenerated Admin `.sppkg`
- `phase-14/build/admin-regenerated-package-inventory.md`
- `phase-14/build/admin-package-comparison-report.md`
- `phase-14/build/admin-reproducibility-proof.md`

## Hard Gates

This prompt is not complete unless:
- the repo successfully generates the Admin package
- the generated package’s runtime contract matches the chosen implementation
- all material package differences are explained and classified

## Required Final Report

Return:
- package generation command(s)
- generated artifact path
- exact comparison outcome
- any remaining mismatches, if any
