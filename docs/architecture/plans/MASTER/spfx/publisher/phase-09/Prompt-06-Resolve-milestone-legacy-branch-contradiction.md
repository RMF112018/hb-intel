# Prompt 06 — Resolve milestone legacy branch contradiction

## Objective

Resolve the contradiction where `milestoneSpotlight` is described as legacy/read-compatible only but is not hard-blocked consistently by the current runtime.

## Governing authority / required reference docs

- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`

## Files and code paths to inspect

- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `any milestone-specific tests or registry assumptions impacted`

## Exact defect to close

Current comments and labels say milestone content is legacy-only, but the controller path only warns. Milestone-specific required-field enforcement has been removed, yet publish gating does not explicitly reject legacy milestone content types.

## Required implementation outcome

Choose and implement one explicit repo-truth policy:

Option A — fully implement milestone authoring/persistence/validation
or
Option B — hard-block milestone publish/legacy authoring in the current sprint

Unless the local repo already contains near-complete milestone UI + persistence + tests, prefer **Option B**:
- hard-block publish for milestone legacy rows
- make the UI/controller behavior match the comments
- ensure save/preview behavior does not imply supported live execution when it is not actually supported

## Validation / proof of closure requirements

You must prove:
1. the chosen milestone policy is enforced in code, not just in comments
2. milestone legacy rows cannot drift through live publish unintentionally
3. normal operational content types still work
4. comments, warnings, and runtime behavior now agree

## Deliverables / closure docs to create

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/closure-resolve-milestone-legacy-branch-contradiction.md`
- include the chosen policy, tests, and any follow-on work explicitly deferred

## Guardrails

- Work in the live local repo.
- Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Conduct an exhaustive scrub of the affected code path before making changes.
- Prove closure of this issue before moving to the next prompt.
- Do not make unrelated changes.
