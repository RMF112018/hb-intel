# Prompt-04-Close-Workbook-Governance-And-Distribution-Gaps

## Objective

Close the remaining workbook-governance gaps now that the backend parser contract is stronger.

## Governing authorities

- workbook parser contract code
- uploaded workbook structure
- template distribution expectations for field users

## Required work

1. Update the distributed workbook so `ParserMeta` is hidden while preserving formulas, names, and validations.
2. Document the governed workbook contract:
   - accepted template marker
   - accepted parser contract version
   - required named ranges
   - required parser seams
3. Add a regression checklist or automated validation where practical.

## Required outcome

- workbook distribution matches the intended hidden-support-sheet posture
- future workbook edits cannot silently break parser authority

## Proof of closure required

- updated workbook evidence
- exact validation checklist or automated guard added
- exact contract statement after closure

## Prohibitions

- no visible field-user workflow changes unless explicitly required
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
