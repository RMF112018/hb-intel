# Prompt 05 — Runtime Validation and Observability

## Objective

Add runtime safeguards and diagnostics so field-contract failures are obvious, safe, and easy to troubleshoot in later environments.

## Context

This prompt begins only after Prompt 04 is complete and the functional mapping/tests are in place.

## Critical instructions

- Do not re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Keep runtime validation proportional and maintainable.
- Do not leak secrets or sensitive request content in logs.
- Prefer precise, operator-useful diagnostics over noisy generic errors.

## Required work

1. Add validation for critical expected fields where appropriate.
2. Add structured diagnostics for:
   - missing schema fields
   - malformed SharePoint items
   - invalid type conversions
   - null/empty required-value failures
   - stale mapping assumptions
3. Improve error messages so developers/operators can distinguish contract failures quickly.
4. Add short troubleshooting notes for future maintainers.

## Required deliverables

- Runtime validation helpers or checks
- Improved diagnostics/logging
- Troubleshooting note

## Acceptance criteria

- Schema drift and mapping failures are diagnosable.
- Critical field-contract failures do not fail silently.
- Logging remains safe and operationally useful.
