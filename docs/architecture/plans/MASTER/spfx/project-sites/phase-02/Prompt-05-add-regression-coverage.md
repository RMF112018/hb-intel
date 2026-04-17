# Prompt 05 — Add Stability Regression Coverage

## Objective
Add targeted regression coverage for the exact runtime and layout seams that allowed the current instability to ship.

## Governing Authorities / Relevant Docs
- current tests under:
  - `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`
  - `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.test.ts`
  - `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.test.ts`
  - `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.test.tsx`
- current runtime files:
  - `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
  - `apps/project-sites/src/mount.tsx`
  - `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`

## Critical Operating Instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Exact Coverage Gaps to Close
1. repeated shell render does not recreate root / `QueryClient`
2. layout hook does not emit no-op state updates
3. wide desktop with short content does not collapse spuriously into compact mode
4. scope/sort changes do not force grid remount
5. repaired motion/remount behavior stays closed

## Required Implementation Outcome
Add focused tests that verify the repaired behavior rather than merely mocking around it.

The final suite should meaningfully exercise:
- lifecycle safety
- layout stability
- transition stability

## Validation / Proof of Closure Requirements
Provide:
- new test file list
- summary of each new regression case
- passing test output
- a brief explanation of why the new tests would have caught the defects identified in the audit

## Explicit Non-Goals
- no broad test refactor unless strictly necessary
- no unrelated snapshot churn
