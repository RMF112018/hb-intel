# Monday-Critical Provisioning Saga Prompt Set

This prompt set is sequenced for the Monday delivery path only:

1. **Prompt 01** validates the audit findings against repo truth and produces a deficiency register.
2. **Prompt 02** fixes validated backend / repository / saga deficiencies.
3. **Prompt 03** fixes validated SPFx surface deficiencies in Estimating, Accounting, and Admin.
4. **Prompt 04** builds comprehensive user-side, saga continuity, and regression tests.
5. **Prompt 05** runs the focused validation suite, verifies outcomes, and produces the release-evidence summary.

## Recommended order

- Run **Prompt 01** first and do not skip it.
- Run **Prompt 02** only after Prompt 01 finishes.
- Run **Prompt 03** after Prompt 02.
- Run **Prompt 04** after Prompt 03.
- Run **Prompt 05** last.

## Shared priorities across all prompts

- Monday-critical scope only:
  - complete provisioning saga
  - SPFx Estimating surface involved in the saga
  - SPFx Accounting surface involved in the saga
  - SPFx Admin surface involved in the saga
- Validate every claim against repo truth before changing code.
- Fix only deficiencies that are **validated** or **partially validated** by evidence.
- Do not re-read files that are still in your current context or memory window.
- Prefer existing repo patterns, utilities, and test stacks over introducing new frameworks.

## Deliverable expectation

Each prompt is written so it can be copied directly into a fresh or ongoing local code-agent session.
