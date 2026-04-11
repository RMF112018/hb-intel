# Prompt 00 — Post-Implementation Repo Truth and Test-Basis Lock

## Objective

Before building the final comprehensive suite, validate that the prerequisite implementation work is truly present at local HEAD and lock the authoritative test basis.

## Your tasks

1. Validate local HEAD against the expected post-refactor state:
   - dedicated People & Culture public surface
   - dedicated HB Kudos public surface
   - People & Culture HR operating companion
   - HB Kudos companion / moderation surface
   - preliminary workflow test harness
2. Validate that the extracted SharePoint schema artifacts exist and remain usable.
3. Produce a concise repo-truth and test-basis report.
4. Stop if the prerequisites are not proven.

## Required outputs

Create:
- `docs/architecture/reviews/people-kudos-comprehensive-test-suite-basis-lock.md`

The report must state:
- which prerequisite packages/prompts are now materially reflected at local HEAD
- which application surfaces are present and authoritative
- what preliminary test assets already exist
- what schema/report artifacts exist
- what gaps/blockers remain before the final suite can be built

## Rules

- Do not start building the final suite if prerequisite implementation work is missing.
- Do not guess which refactors happened; prove them from the repo.
- Name the real affected surfaces and paths.
- Keep the report tight and explicit.
