# Prompt — Decision Lock Scheduling, Prominence, and Age-Off Closure

## Objective
Finish the decision-locked scheduling, prominence, and standard age-off behavior so the runtime enforces the locked public/homepage rules rather than only modeling them in helpers and types.

## Repo truth
Work directly against the live repo:
- `https://github.com/RMF112018/hb-intel`

Do not re-read files that are already in your current context or memory.

## Governing authority
Use repo truth and at minimum:
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- current live `@hbc/ui-kit`
- current live `docs/reference/ui-kit/`


## Scope
- `apps/hb-webparts/src/homepage/helpers/kudosProminenceRules.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` if new configurable properties are needed

## Non-negotiable requirements
- Implement configurable standard-approved age-off behavior as a real runtime property and predicate, not just a desired future rule.
- Wire scheduled prominence collision handling into actual publish/go-live behavior.
- Preserve max-featured and max-pinned rules.
- Do not let scheduled items consume slots before they go live.
- Ensure the public/homepage view and archive behavior remain aligned with the lock after age-off.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- runtime implementation for age-off
- runtime implementation for scheduled go-live prominence collision behavior
- property/config changes as needed
- tests for age-off and prominence edge cases

## Verification
- prove age-off hides standard-approved items from homepage visibility when appropriate
- prove aged-off items remain available where the lock requires archive/history visibility
- prove scheduled featured/pinned collision behavior now executes rather than existing only as an unused helper
