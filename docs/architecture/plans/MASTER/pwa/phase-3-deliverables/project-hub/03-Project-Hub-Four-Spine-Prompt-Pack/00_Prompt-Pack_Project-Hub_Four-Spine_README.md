# Project Hub Four-Spine Prompt Pack

This prompt pack is sequenced so the local code agent validates the audit findings first, then implements the missing and incomplete spine work, then proves the result with end-to-end validation.

## Prompt Order

1. `01_Prompt_Project-Hub_Four-Spine_Validation-and-Execution-Plan.md`
   - validate the audit findings
   - confirm repo truth
   - lock the execution order and touchpoints

2. `02_Prompt_Project-Hub_Activity-Spine_Implementation.md`
   - implement the missing canonical Activity spine
   - wire it to the home/runtime and related event seams

3. `03_Prompt_Project-Hub_Work-Queue_Related-Items_Health_Home-Integration.md`
   - finish Work Queue mandatory home registration
   - upgrade Related Items to mandatory home enforcement
   - validate and correct Health placement
   - push the live Project Hub home toward governed canvas runtime behavior

4. `04_Prompt_Project-Hub_Four-Spine_End-to-End_Test-and-Validation.md`
   - create comprehensive end-to-end validation
   - execute tests
   - report true operational readiness

## Common Intent Across All Prompts
Every prompt requires the agent to:
- validate the audit findings before acting
- govern all UI through `@hbc/ui-kit`
- follow the doctrine in `docs/reference/ui-kit/UI-Kit-*.md`
- complete the four-spine integration set in repo-truth alignment
- create and validate comprehensive tests

## Notes
- The prompts are intentionally split by dependency order.
- Prompt 01 is planning/validation only.
- Prompts 02 and 03 are implementation prompts.
- Prompt 04 is the end-to-end validation and readiness proof.
