# Prompt 05 — End-to-End Validation and Performance Evidence Closeout

## Role

Act as a senior QA/performance validation engineer and release-closeout writer working in `RMF112018/hb-intel`.

## Objective

Validate the completed remediation package end to end and prepare a clean performance evidence closeout that can drive the next architecture decision.

This is primarily a validation and documentation prompt. Make only small documentation fixes if necessary; do not begin a new architecture refactor here.

## Governing Package Files

Use:
- `03_Validation_Matrix_And_Acceptance_Criteria.md`
- `supporting/HAR_Capture_And_Browser_Waterfall_Checklist.md`
- `supporting/Application_Insights_Validation_Queries.md`
- `supporting/Performance_Evidence_Closeout_Template.md`

## Required Validation Steps

### 1. Run full package validation
```bash
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions check-types
```

### 2. Verify the improved UX contract in repo truth
Confirm:
- both cards render during loading,
- both cards render during error,
- My Projects starts its independent read path early,
- Adobe completed-read remains deferred.

### 3. Inspect frontend instrumentation
Confirm:
- mark/measure registry exists,
- names match the package plan,
- no PII or payload data appears in detail objects.

### 4. Inspect backend instrumentation
Confirm:
- Adobe stage duration fields exist,
- Project Links source/reconcile events exist,
- no sensitive data appears in payloads.

### 5. Prepare evidence closeout
Populate:
```text
supporting/Performance_Evidence_Closeout_Template.md
```
or create a derived closeout markdown file under the repo's appropriate docs/evidence path if one already exists and matches project conventions.

## If Live HAR/App Insights Are Not Available

Do not fabricate metrics.

Instead:
- state what has been validated from repo truth,
- list the exact evidence still needed,
- include the ready-to-run HAR and KQL instructions from the package.

## Required Output

### Executive Closeout
### Validation Commands and Results
### Confirmed UX Improvements
### Confirmed Telemetry Improvements
### Evidence Captured or Still Needed
### Go / No-Go for Next Optimization Package
### Recommended Commit Message or Documentation Commit
