# Prompt — Decision Lock Recipient Model Closure

## Objective
Bring the HB Kudos recipient model into actual decision-lock compliance by removing the current invalid assumption that an individual email is always required and ensuring any supported non-empty recipient bucket combination is valid.

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
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- any shared composer primitives/config consumed from `@hbc/ui-kit/homepage` if changes are required

## Non-negotiable requirements
- Allow any non-empty supported recipient bucket combination: individual, team, department, project group, or mixed.
- Do not require at least one individual email.
- Preserve typed bucket discipline.
- Do not regress existing individual-recipient resolution.
- Ensure validation, preview, submission payload building, and recipient summary rendering all remain aligned.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- validation changes
- submission payload/build changes if required
- tests proving non-individual-only recipient combinations now work
- updated comments/docstrings where current text still describes obsolete limitations

## Verification
- prove team-only, department-only, project-group-only, and mixed submissions validate and submit correctly
- prove empty submissions still fail correctly
- run targeted tests for composer validation and submission payload shaping
