# Prompt 04 — Capture Closure and Next-Phase Handoff

## Objective

Document the implementation outcome and validation result for the cumulative all-webparts package, then define the correct next phase based on the actual tenant result.

## Required closure outputs

Create a final completion/handoff note that includes:

### 1. Architecture outcome
State clearly:
- what cumulative model was implemented
- how it differs from the single-target proof-case model
- how the first two successful proof cases informed the cumulative implementation

### 2. Package outcome
State clearly:
- package version
- number of packaged homepage webparts
- whether all intended homepage webparts were included

### 3. Tenant outcome
State clearly:
- whether all webparts validated successfully
- which ones passed
- which ones failed, if any
- whether hero + rail remained healthy as regressions

### 4. Known remaining issues
List only real, evidenced remaining issues.

### 5. Next-phase recommendation
If all webparts validate:
- recommend cleanup/hardening phase
- recommend retirement of proof-case-only scaffolding that is no longer needed

If some fail:
- recommend a focused remediation phase aimed at the specific failing webparts or cumulative-architecture defect layer

## Hard constraints

- Do not overstate success.
- Do not say the cumulative model is complete if some webparts remain unvalidated or failing.
- Do not recommend cleanup/removal of transitional scaffolding until the cumulative package is actually proven in tenant.
