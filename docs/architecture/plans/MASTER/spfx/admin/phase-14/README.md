# Phase 14 Admin SPFx Remediation Prompt Package

This package contains a sequenced set of markdown prompt files for a local code agent to validate and resolve the production-readiness findings identified in the Admin SPFx `.sppkg` audit.

## Package Objective

Drive the Admin SPFx application to a release-safe state by resolving:

1. package ↔ repo drift
2. loader/runtime contract ambiguity
3. missing or unproven SPFx API permission posture
4. unproven SPFx token acquisition path for backend calls
5. non-reproducible packaging/build pipeline
6. insufficient release evidence for go / no-go deployment

## Working Doctrine

- Treat the live repo as authoritative source truth.
- Treat the Admin `.sppkg` under audit as the authoritative deployment artifact until the repo either reproduces it or intentionally supersedes it.
- Do not accept “looks correct” as evidence. Prove claims with code, build output, regenerated artifacts, and validation records.
- Do not re-read files that are already in your current context or memory unless needed to verify a contradiction, capture exact evidence, or inspect a newly changed file.
- Do not make speculative changes across broad areas of the repo without first proving boundary ownership and impact.
- Preserve explicit traceability from finding → remediation → validation evidence.

## Recommended Execution Order

1. `Prompt-01-Forensic-Baseline-and-Artifact-Truth-Freeze.md`
2. `Prompt-02-Admin-SPFx-Packaging-Pipeline-Reconciliation.md`
3. `Prompt-03-Admin-Webpart-Loader-Contract-Decision-and-Implementation.md`
4. `Prompt-04-Admin-SPFx-API-Permission-and-Token-Path-Remediation.md`
5. `Prompt-05-Admin-Runtime-Configuration-and-Backend-Connectivity-Validation.md`
6. `Prompt-06-Admin-Build-Reproducibility-and-Artifact-Regeneration.md`
7. `Prompt-07-Admin-Release-Evidence-and-Operational-Readiness-Package.md`
8. `Prompt-08-Phase-14-Final-Verification-and-Go-No-Go-Assessment.md`

## Expected Outputs

The agent should create or update, as appropriate:

- Admin packaging and build pipeline files
- Admin SPFx runtime and backend auth wiring
- release evidence and validation documentation
- a freshly regenerated `hb-intel-admin.sppkg`
- a final go / no-go package supported by hard evidence

## Hard Gates

A final production-ready determination is not allowed unless all of the following are proven:

- a single authoritative Admin SPFx runtime contract exists
- the repo can reproducibly generate the shipped package
- the generated package aligns with repo truth
- the Admin solution declares and uses the correct SPFx API permissions
- backend-bound Admin calls use a valid SPFx-acquired bearer token path
- runtime configuration for production is explicit and validated
- release evidence is complete enough for support and rollback
