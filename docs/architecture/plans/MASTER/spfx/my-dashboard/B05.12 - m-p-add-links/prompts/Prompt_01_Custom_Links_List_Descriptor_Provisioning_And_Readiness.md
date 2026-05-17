# Prompt 01 — Custom Links List Descriptor, Provisioning, and Readiness

## Objective
Implement the dedicated `My Projects Custom Links` list descriptor, operator provisioner, readiness verifier, docs, and tests.

## Mandatory rules
1. Do not re-read files still in context unless exact lines are required or repo state changed.
2. Use the locked field contract from the package.
3. Do not alter Projects or Legacy Registry schemas.
4. Do not run live tenant apply unless explicitly authorized.
5. Fail closed on wrong-type drift.

## Required implementation
- Add list descriptor:
  - `My Projects Custom Links`
- Use built-in `Title` as the custom-link title.
- Add all custom fields in `02_SharePoint_Custom_Links_List_Schema.md`.
- Add provision script:
  - dry-run
  - apply
  - JSON output
- Add readiness verifier/report.
- Add docs:
  - schema reference
  - admin provisioning runbook
- Add tests.

## Validation
Run targeted tests for:
- descriptor,
- provisioner,
- verifier,
- formatting/typecheck as applicable.

## Output format
Return:

# Prompt 01 Closeout — List Descriptor, Provisioning, and Readiness
## 1. Executive Verdict
## 2. Files Changed
## 3. Provisioned Schema
## 4. Validation Results
## 5. Operator Commands
## 6. Remaining Work for Prompt 02
