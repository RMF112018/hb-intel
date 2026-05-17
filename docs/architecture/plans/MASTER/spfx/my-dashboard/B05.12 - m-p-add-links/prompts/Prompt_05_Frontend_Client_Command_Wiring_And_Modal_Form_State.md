# Prompt 05 — Frontend Client Command Wiring and Modal Form State

## Objective
Extend the frontend My Work client seam for custom-link command calls and implement reusable create/edit modal state logic.

## Required implementation
- Add client interface methods:
  - create custom link
  - update custom link
  - delete custom link
- Implement backend client POST/PATCH/DELETE.
- Implement fixture client deterministic fallback behavior.
- Add command-result normalization.
- Add create/edit modal component or state hook:
  - title
  - URL
  - visibility
  - inline validation
  - helper copy
  - save/error states

## Exact helper copy
Use:
`Use this to add trusted project resources such as additional SharePoint sites, permitting sites, private provider portals, and other project-specific destinations.`

## Mandatory rules
1. Do not add tile disclosure rendering yet; Prompt 06 owns that.
2. Keep modal reusable for create and edit.
3. No optimistic local mutation unless current repo data ownership strongly supports it and is documented.
4. Preserve backend/fallback client posture.

## Output format
Return:

# Prompt 05 Closeout — Frontend Client Commands and Modal State
## 1. Executive Verdict
## 2. Client Methods Added
## 3. Modal/Form State Implemented
## 4. Files Changed
## 5. Test Results
## 6. Remaining Work for Prompt 06
