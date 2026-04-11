# Prompt — Final Verification and Closure Report

## Objective
After all remediation prompts are complete, perform a final repo-truth verification pass and write a closure report that states exactly what is now closed, what remains open, and what proof exists.

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
- all files touched by prior remediation prompts
- the current Decision Lock Appendix
- current `@hbc/ui-kit` and `docs/reference/ui-kit/` doctrine
- rebuilt packaging artifacts and freshness proof

## Non-negotiable requirements
- Do not declare full closure without runtime, authoring, test, and packaging proof.
- Call out any remaining partial compliance honestly.
- Separate fully closed items from still-deferred items.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- final closure report under `docs/architecture/reviews/`
- matrix of closed / partial / open items
- verification commands and outcomes
- changed-file inventory
- recommendation on whether HB Kudos is now production-ready

## Verification
- re-run relevant tests
- re-run packaging proof
- re-check property-pane authoring truth
- re-check decision-lock, doctrine, and packaging alignment
