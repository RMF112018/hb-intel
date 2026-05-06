# PCC Card Tier Contract Remediation Package — Package Manifest

## Package Objective

This package instructs the local code agent to remediate the Project Control Center shared card and bento card usage contract across all current PCC surfaces, based on the completed Prompt 02 audit.

The implementation objective is to close the resolution issue by ensuring every card element in the current PCC route surface set has an explicit, testable, doctrine-aligned `tier`, `region`, `footprint`, heading, state, and active-panel posture.

## Resolution Scope

This package covers the current PCC surfaces and embedded subregions under:

- `apps/project-control-center/src/layout/`
- `apps/project-control-center/src/shell/`
- `apps/project-control-center/src/surfaces/projectHome/`
- `apps/project-control-center/src/surfaces/teamAccess/`
- `apps/project-control-center/src/surfaces/documents/`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/surfaces/approvals/`
- `apps/project-control-center/src/surfaces/externalSystems/`
- `apps/project-control-center/src/surfaces/controlCenterSettings/`
- `apps/project-control-center/src/surfaces/siteHealth/`
- `apps/project-control-center/src/surfaces/responsibilityMatrix/`
- `apps/project-control-center/src/surfaces/constraintsLog/`
- `apps/project-control-center/src/surfaces/buyoutLog/`
- `apps/project-control-center/src/tests/`

## Prompt Execution Order

Execute the prompt files in this order:

1. `prompts/Prompt_01_Primitive_Contract_Instrumentation_And_Visual_Tier_Hardening.md`
2. `prompts/Prompt_02_Route_Command_Card_Lockdown.md`
3. `prompts/Prompt_03_State_Deferred_Reference_Reclassification.md`
4. `prompts/Prompt_04_Project_Readiness_Embedded_Subregion_Classification.md`
5. `prompts/Prompt_05_Cross_Surface_Tests_Accessibility_And_Bento_Invariants.md`
6. `prompts/Prompt_06_Closeout_Documentation_Validation_And_Resolution_Closure.md`

## Required Final Outcome

At completion:

- Every PCC `PccDashboardCard` usage in current routeable and embedded PCC surfaces has explicit `tier` and `region`.
- Every active surface has exactly one active-panel carrier.
- Every active-panel carrier resolves to a route command posture or a deliberate state posture.
- No deferred, reference, policy, lineage, HBI-boundary, unavailable, loading, error, missing-config, or restricted card resolves as default Tier 2 operational content.
- The primitive emits enough contract markers for tests to distinguish explicit classification from default fallback.
- Cross-surface tests prove the contract.
- Visual tier styling is stronger and still token-driven.
- No runtime mutation, live integration, SDK, writeback, or launch-link behavior is introduced.
- A closeout document is created with validation evidence and residual hosted-evidence requirements.
- The local agent commits the completed remediation using the commit-message format specified in this package.

## Non-Negotiable Constraints

- Do not introduce live backend writes or command behavior.
- Do not add Procore, SharePoint, Microsoft Graph, PnP, Sage, Document Crunch, Adobe Sign, or external SDK calls.
- Do not convert preview/inert controls into live controls.
- Do not add live `http(s)` anchors where launch behavior is intentionally disabled or preview-only.
- Do not introduce wrappers between `[data-pcc-bento-grid]` and `[data-pcc-card]` children.
- Do not introduce `grid-auto-flow: dense`.
- Do not remove row-span collapse resistance.
- Do not treat `hierarchy` as the new canonical classification model; it remains backward-compatible legacy input only.
- Do not re-read files that are still available in your current context or memory unless the file may have changed or you need exact current contents for editing.

## Validation Commands

Run targeted validation before and after meaningful changes:

```bash
git status --short
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
pnpm exec prettier --check \
  apps/project-control-center/src/layout \
  apps/project-control-center/src/shell \
  apps/project-control-center/src/surfaces \
  apps/project-control-center/src/tests
git diff --check
```

If workspace scripts differ, inspect `package.json` and use the closest existing workspace commands without weakening the validation intent.

## Final Commit Requirement

Use this commit structure:

```text
Commit Summary

feat(pcc): remediate shared card tier contract across PCC surfaces

Commit Description

Implement the PCC card tier / region / footprint contract remediation across all current Project Control Center route surfaces and embedded subregions.

- Adds shared card contract instrumentation so tests can distinguish explicit tier / region declarations from legacy hierarchy or default fallback.
- Strengthens token-driven Tier 1 / Tier 2 / Tier 3 / state / deferred / detail / rail visual hierarchy.
- Migrates route command, operational, reference, deferred, state, and embedded workbench cards to explicit tier and region declarations.
- Adds cross-surface tests for active-panel ownership, direct bento children, tier / region classification, heading levels, deferred-state integrity, and no dense grid behavior.
- Adds closeout documentation with validation evidence and hosted-evidence follow-up requirements.

Validation:
- <paste exact commands and pass/fail results>
```
