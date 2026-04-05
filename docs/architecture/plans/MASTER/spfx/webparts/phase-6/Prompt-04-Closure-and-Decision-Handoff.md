# Prompt 04 — Closure and Decision Handoff

## Objective

Capture the outcome of the cumulative loader-regression remediation and define the correct next phase.

## Required closure sections

### 1. Remediation outcome
State:
- what cumulative defect layer was fixed
- what files changed
- whether the fix was narrow or required broader adaptation

### 2. Package outcome
State:
- package version
- number of homepage webparts included
- whether cumulative package truth is coherent

### 3. Tenant outcome
State:
- which webparts passed
- which webparts failed, if any
- whether hero + rail remained healthy as regressions
- whether the cumulative package is now tenant-proven

### 4. Remaining issues
List only evidenced remaining issues.

### 5. Next-phase recommendation
If cumulative package is healthy:
- recommend stabilization / cleanup / transitional-scaffolding retirement

If cumulative package still fails:
- recommend another focused remediation phase, naming the exact remaining defect layer

## Hard constraints

- Do not overstate success.
- Do not recommend cleanup if the cumulative package is still failing in tenant.
- Do not generalize beyond the evidence.
