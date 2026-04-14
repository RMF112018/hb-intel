# Prompt 05 — Resolve scheduled-state dead branch

## Objective

Resolve the contradiction where `scheduled` remains schema-declared and readable but is operationally dead and omitted from important authoring safeguards.

## Governing authority / required reference docs

- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

## Files and code paths to inspect

- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `any slug-governance code and tests touched by draft grouping/state scans`

## Exact defect to close

`scheduled` still exists in the schema and code contracts, but there is no scheduler/executor. The current UI omits scheduled rows from the queue and from the slug-collision scan, which means the branch is neither fully supported nor fully quarantined.

## Required implementation outcome

Choose and implement one explicit repo-truth policy:

Option A — implement scheduled publishing end to end
or
Option B — quarantine legacy scheduled rows explicitly and consistently

Unless there is already near-complete scheduler infrastructure in the local repo, prefer **Option B** for this prompt:
- no silent omission from queue logic
- no omission from slug-governance scans
- explicit legacy messaging where relevant
- no inbound transition into scheduled unless an executor is actually present

## Validation / proof of closure requirements

You must prove:
1. scheduled rows are no longer silently excluded from safety logic
2. operators can see or consciously handle scheduled legacy rows
3. slug governance no longer ignores scheduled records
4. the chosen policy is documented clearly in code comments and closure docs

## Deliverables / closure docs to create

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/closure-resolve-scheduled-state-dead-branch.md`
- include the chosen policy, reasons, and impacted files/tests

## Guardrails

- Work in the live local repo.
- Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Conduct an exhaustive scrub of the affected code path before making changes.
- Prove closure of this issue before moving to the next prompt.
- Do not make unrelated changes.
