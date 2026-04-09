# Prompt 05 — Validation, Packaging, and Operator Guide

Use the local repo at HEAD as the final authority.

## Objective

Validate the new PnP Operations SPFx webpart end to end, confirm packaging/build correctness, and produce a concise operator guide.

## Required validation scope

Validate all of the following:

1. **SPFx shell**
   - loads correctly
   - uses `@hbc/ui-kit`
   - target input works
   - action selection works
   - result states are coherent

2. **Backend seam**
   - request/response path works
   - errors are surfaced clearly
   - unauthorized access is handled cleanly

3. **Extraction actions**
   - each live action runs successfully or fails with a clear actionable reason
   - output files are created
   - manifests are correct
   - downloads are exposed cleanly

4. **Packaging/build**
   - solution builds cleanly
   - the expected SPFx package contains the intended component registration
   - no stale artifact condition is present

5. **Operator guidance**
   - run prerequisites are documented
   - supported actions are documented
   - known limits are documented

## Required documentation deliverable

Create a concise operator guide covering:

- purpose of the webpart,
- required permissions/prerequisites,
- supported actions,
- how to enter a target site,
- what each action exports,
- where downloads appear,
- known limitations,
- and recommended next actions.

## Validation rules

- Do not claim build/package success without proving the built output contains the intended webpart/component.
- Do not claim live extraction success if only mock mode was exercised.
- Be explicit about what was tested live versus in mock/dev mode.
- Capture remaining gaps directly.

## Deliverables

Create:

1. validation evidence,
2. packaging/build proof,
3. an operator guide,
4. and a concise completion report.

## Final response requirements

Report:

- tested flows,
- live vs mock coverage,
- packaging proof,
- operator guide location,
- remaining risks/gaps,
- and recommended next actions.
