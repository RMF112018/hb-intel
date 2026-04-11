# Prompt — Legacy Remnants, Comments, and Repo Drift Cleanup

## Objective
Clean up legacy Kudos remnants, stale commentary, and repo drift that weakens confidence in the current HB Kudos implementation and confuses future maintenance.

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
- legacy or alternate-lane Kudos files such as `apps/hb-webparts/src/webparts/kudosPage/*` if still present
- stale comments/docstrings in current Kudos runtime files
- stale closure/test docs or reports that overstate completion
- any exports or file references no longer used by current runtime wiring

## Non-negotiable requirements
- Do not silently delete potentially important legacy files without documenting the rationale.
- Either retire remnants cleanly or mark them explicitly as legacy/non-runtime.
- Update stale commentary where it no longer matches code truth.
- Reduce ambiguity about what is active runtime vs dead or superseded implementation.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- cleanup changes
- documentation of retired/retained remnants
- updated comments/docstrings/reports where needed

## Verification
- identify every remnant or stale artifact cleaned up
- show active runtime path after cleanup
- run touched-scope verification
