# Prompt 04 — Comprehensive Provisioning Saga Test Build

```text
You are acting as a senior test-architecture, user-workflow, backend-continuity, and release-validation engineer for HB Intel.

## Objective

Create comprehensive, repo-consistent test coverage for the Monday-critical provisioning workflow, including:

1. user-side workflow commands
2. invalid user entries / validation failures
3. provisioning saga continuity
4. admin recovery paths
5. regression tests for every validated deficiency fixed in Prompts 02 and 03

## Important instruction

Do not re-read files that are still within your current context or memory.
Reuse active context when available.
Only inspect additional files when required to build or align tests.

## Test-scope boundary

This test build is only for the Monday-critical provisioning saga path and its directly involved surfaces:

- SPFx Estimating
- SPFx Accounting
- SPFx Admin
- backend request lifecycle
- provisioning saga orchestration
- timer continuity where relevant

## Required test categories

### A. User-command flow tests
Cover all important user-driven saga commands and transitions, including at minimum:

#### Estimating / requester side
- create new project setup request with valid data
- clarification-return / revision path
- requester-side request detail visibility
- correct behavior when requester-scoped retrieval is used

#### Accounting / controller side
- queue visibility by state
- open review detail
- approve request with valid project number
- reject invalid project number path
- clarification request submission
- hold / external setup path
- failed request escalation path to Admin

#### Admin side
- list runs
- filter runs by tab / state
- open detail modal
- retry
- archive
- acknowledge escalation
- force-state override

### B. Invalid user-entry tests
Cover at minimum:
- missing required form fields
- invalid project number format
- invalid or incomplete submit payloads
- invalid state-transition attempts
- invalid admin action inputs where applicable
- any other validated user-side edge case needed for Monday readiness

### C. Backend continuity tests
Create or update comprehensive backend tests proving the saga:
- starts correctly
- initializes provisioning status correctly
- reconciles request state correctly
- calls the appropriate steps in the correct order
- handles step success correctly
- handles step failure correctly
- triggers compensation correctly where designed
- handles Step 5 deferral correctly
- handles timer-based Step 5 completion / failure correctly
- handles retry and escalation correctly
- handles admin recovery commands correctly
- pushes / records progress and final status correctly

### D. Deficiency-regression tests
For each deficiency validated in Prompt 01 and fixed in Prompts 02 / 03:
- add or update a test that would have failed before the fix or that proves the bug was previously unguarded
- verify the corrected behavior now passes

## Test implementation expectations

- First inspect the existing repo test stack and use repo-native patterns.
- Prefer extending existing Vitest / component / backend integration conventions already in the repo.
- Do not introduce a new heavy test framework unless absolutely necessary and justified.
- Keep tests maintainable and clearly named around business behavior.

## Required outputs

### 1. Test matrix
Before coding, produce a concise matrix of:
- scenario ID
- scenario description
- layer
- file(s) to test
- expected result

### 2. Implement the tests
Add or update the needed test files.

### 3. Run the tests
Run the focused test suites required to validate the Monday-critical path.

### 4. Final evidence report
Provide:
- test files added / updated
- scenarios covered
- commands run
- pass / fail results
- uncovered gaps, if any
- recommendation on whether the Monday-critical path is now test-covered well enough for delivery

## Guardrails

- Do not stop at happy-path testing.
- Do not stop at UI tests only.
- Do not stop at backend unit tests only.
- Build the user-command and backend-continuity coverage together.
- Ensure the tests explicitly protect against the validated deficiencies from Prompt 01.
```