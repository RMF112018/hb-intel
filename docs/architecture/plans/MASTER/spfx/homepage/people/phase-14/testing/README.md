# People & Culture + HB Kudos Comprehensive Test Suite Prompt Package

## Purpose

This package is the **post-implementation comprehensive testing package** for the refactored People & Culture / HB Kudos application surfaces.

It is intended to be executed **only after** all prompts in the following implementation packages have been completed:

- `people-culture-split-initiation-prompt-package.zip`
- `hb-kudos-companion-prompt-package-v2.zip`
- `people-culture-companion-prompt-package.zip`
- the preliminary workflow-test-harness task based on the extracted SharePoint schemas

This package is **not** for product implementation. It is for converting the preliminary workflow harness into a **comprehensive, maintainable, role-aware, regression-capable test suite** for the refactored application surfaces.

## Required preconditions

Do **not** execute this package until the agent can prove all of the following at local HEAD:

1. The structural split has been completed.
2. The dedicated public **People & Culture** surface exists.
3. The dedicated public **HB Kudos** surface exists.
4. The **People & Culture HR operating companion** exists.
5. The **HB Kudos companion / moderation** surface exists.
6. The preliminary workflow test harness exists and is runnable.
7. The SharePoint schemas for the relevant lists have already been extracted and documented.

If any precondition is not true, the agent must stop and produce a narrow blocker report instead of improvising.

## Package contents

- `README.md`
- `Plan-Summary.md`
- `Execution-Prerequisites-and-Scope-Lock.md`
- `Prompt-00-Post-Implementation-Repo-Truth-and-Test-Basis-Lock.md`
- `Prompt-01-Test-Architecture-and-Shared-Harness-Foundation.md`
- `Prompt-02-HB-Kudos-Comprehensive-Workflow-Suite.md`
- `Prompt-03-People-and-Culture-Comprehensive-Workflow-Suite.md`
- `Prompt-04-Companion-Surfaces-and-Role-Based-Workflow-Suite.md`
- `Prompt-05-Packaging-Deployment-Smoke-and-Test-Data-Management.md`
- `Prompt-06-Closure-Report-and-Suite-Operations-Guide.md`

## Governing stance

The agent must work from these assumptions unless local HEAD proves a narrow conflict:

1. The split architecture is already authoritative.
2. The test suite must reflect the refactored product boundaries rather than the legacy merged People & Culture surface.
3. The preliminary workflow harness is a seed, not the final result.
4. The final test suite must clearly separate:
   - public-surface behavior
   - companion/admin workflow behavior
   - shared data/workflow lifecycle behavior
   - packaging/deployment smoke validation
5. The suite must prioritize real workflow coverage, deterministic execution, safe synthetic data, and maintainability over test-framework theatrics.

## Recommended execution order

1. `Prompt-00-Post-Implementation-Repo-Truth-and-Test-Basis-Lock.md`
2. `Prompt-01-Test-Architecture-and-Shared-Harness-Foundation.md`
3. `Prompt-02-HB-Kudos-Comprehensive-Workflow-Suite.md`
4. `Prompt-03-People-and-Culture-Comprehensive-Workflow-Suite.md`
5. `Prompt-04-Companion-Surfaces-and-Role-Based-Workflow-Suite.md`
6. `Prompt-05-Packaging-Deployment-Smoke-and-Test-Data-Management.md`
7. `Prompt-06-Closure-Report-and-Suite-Operations-Guide.md`

## Mandatory operating rules for the agent

1. Use local repo HEAD as the final authority.
2. Do not re-read files that are still within your active context window or memory unless you need to verify a specific detail that is genuinely uncertain.
3. Do not broaden this into a generic enterprise QA platform.
4. Do not guess SharePoint field mappings if the extracted schema artifacts do not prove them.
5. Do not let the suite silently depend on manual UI clicks where API/list-level verification is more stable.
6. Do not claim comprehensive coverage unless the suite names the covered workflows explicitly.
7. Do not touch non-test SharePoint items.
8. Do not claim packaging/deployment smoke coverage unless package contents and deployment seams are actually validated.

## Expected outcome after this package

After execution of this package, the repo should have:

- a maintained, modular comprehensive workflow test suite
- explicit coverage for the refactored public and companion surfaces
- clear separation between proven coverage and still-deferred coverage
- safe synthetic test-data conventions
- operator-facing documentation for how to run, extend, and troubleshoot the suite
- a final validation report tied to named application surfaces and workflows
