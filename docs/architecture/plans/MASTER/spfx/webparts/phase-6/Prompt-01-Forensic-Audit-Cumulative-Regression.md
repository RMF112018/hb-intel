# Prompt 01 — Forensic Audit of the Cumulative Regression

## Objective

Conduct a narrow forensic audit of the **latest cumulative `hb-webparts` package** and identify the exact cumulative loader-contract defect that caused the SharePoint render failure to return.

Use the first two successful proof cases as baselines for comparison.

## Required inputs

Audit all of the following together:

### Repo truth
Primary file:
- `tools/build-spfx-package.ts`

Supporting files:
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/config/package-solution.json`

### Package truth
- latest built cumulative `hb-webparts.sppkg`

### Runtime truth
- latest tenant screenshot showing returned SharePoint render failure
- latest console/runtime evidence if available
- prior successful proof-case notes for hero + rail

## Required audit questions

### A. What changed between the successful proof cases and the failing cumulative package?
You must explicitly compare:
- direct-loader proof-case path
- cumulative multi-manifest path

### B. What is the exact defect layer?
Classify whether the failure is primarily:
- manifest identity mismatch
- entryModuleId mismatch
- scriptResources mismatch
- shim generation defect
- packaged asset omission
- SharePoint runtime alias resolution failure
- mount dispatcher defect after successful load
- compound defect

### C. What is the minimum correct remediation target?
Do not write the remediation code in this prompt.
Define exactly what the next implementation prompt must fix.

## Required output

Produce a concise forensic note with:

1. baseline-success vs cumulative-failure comparison
2. source/package/runtime delta table
3. primary defect hypothesis
4. secondary possibilities, if any
5. exact remediation target

## Hard constraints

- Do not treat package build success as proof of runtime correctness.
- Do not assume a component bug unless evidence points there.
- Do not claim the issue is only cache-related without direct evidence.
- Do not propose a broad refactor unless a narrow remediation is impossible.
