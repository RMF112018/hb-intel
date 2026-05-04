# Prompt 13F — Cross-Module Remediation, Validation, and Closeout

## Objective

Patch existing module posture across Waves 6-13 and close the Procore data-layer remediation package.

## Required Work

1. Remediate module docs/tests/surfaces per `artifacts/module_remediation_contract.json`.
2. Verify Buyout Log uses common Procore data-layer source-lineage/object-link/curated-summary contracts and does not invent conflicting Procore semantics.
3. Add closeout documentation.
4. Confirm all guardrails: no live runtime, no SDK, no write-back, no full mirror, no direct SPFx-to-Procore.
5. Produce next-gate recommendation for controlled non-production live-read proof.

## Validation

Run all package-relevant validation commands:
- @hbc/models if models touched.
- @hbc/functions if backend touched.
- @hbc/spfx-project-control-center if SPFx touched.
- Prettier and JSON validation for docs/artifacts.
- Lockfile MD5 before/after.

## Closeout

Return commit summary, commit description, files changed, validation results, residual risks, and live-read readiness status.
