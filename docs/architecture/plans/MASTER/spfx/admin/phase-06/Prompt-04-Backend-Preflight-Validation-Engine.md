# Prompt-04 — Backend Preflight Validation Engine

## Objective

Implement the backend preflight validation engine for Phase 6 so the Admin app can assess environment readiness before install/bootstrap is launched.

## Important execution rules

- Keep privileged or sensitive checks in the backend.
- Reuse existing adapters and services where practical.
- Distinguish hard blockers from warnings.
- Do not turn preflight into a browser-only checklist.

## Inputs

Use:
- Phase 6 architecture docs
- shared contracts from Prompt-03
- `backend/functions/README.md`
- current backend services, especially:
  - `service-factory.ts`
  - SharePoint service
  - Graph service
  - persistence services
  - any existing validation or probe-related endpoints

## Required capability

Implement a preflight engine that can produce structured findings across at least these categories:

1. **Backend configuration presence**
   - required environment values
   - adapter mode posture
   - expected URLs / IDs / resource identifiers

2. **Managed identity / auth posture**
   - required identity selection/configuration assumptions
   - required app permission prerequisites
   - token acquisition viability where safely testable

3. **SharePoint posture**
   - app catalog reachability/posture
   - package/app identifier readiness
   - API access posture visibility or pending-request visibility if available
   - any HB Intel-managed site dependency checks that belong in install readiness

4. **Graph / Entra posture**
   - rollout-critical permissions or consent prerequisites
   - minimum access governance assumptions
   - any already-supported grant flow dependencies

5. **Persistence / run infrastructure posture**
   - table storage availability
   - audit storage or audit write dependency posture
   - signal/progress channel posture if applicable

6. **Install-lane compatibility posture**
   - any repo/runtime condition that would make install execution invalid or misleading

## Required implementation outputs

Implement the backend function/API support needed for:
- starting a preflight run or direct validation request
- retrieving validation status and findings
- storing results durably enough for SPFx review if the contract requires it

## Severity model

Every finding must clearly indicate at least:
- category
- severity
- blocking vs non-blocking
- machine-readable code
- human-readable summary
- recommended operator action
- whether manual checkpoint or admin approval may resolve it

## Documentation output

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-preflight-validator.md`

This doc must explain:
- what is validated,
- how blockers vs warnings are decided,
- what remains intentionally observational,
- and how the SPFx UI should consume the results.

## Boundaries

- Do not automate actual install steps here.
- Do not silently “fix” configuration during preflight unless the architecture explicitly allows it and you document it.
- Do not expose secrets to the frontend.

## Validation

Run the smallest targeted validation set for touched backend surfaces:
- build/typecheck/tests for the touched backend area
- any focused test coverage for validation logic
- document what was run and why

## Completion condition

Stop after the validator exists, is documented, and its targeted validation passes.
Do not implement the install orchestrator in this prompt.
