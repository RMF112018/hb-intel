# 09 — Prompt — Phase 3 — Formalize the Kudos Domain Adapter Layer

## Objective
Create a clean, typed Kudos domain-adapter boundary that sits above the shared SharePoint platform layer and below the webpart-local orchestration layer.

## Repo authority
Use the live `main` branch of:
- `https://github.com/RMF112018/hb-intel.git`

## Required instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Scope
Formalize adapter-style exports for the Kudos content family only.

## File focus
At minimum inspect:
- `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosRoleResolver.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosCapabilities.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosProminenceRules.ts`

## Required adapter shape
Create explicit typed adapter exports for:
- kudos reads
- draft submission
- governance actions
- audit timeline reads
- binding validation

## Hard rules
- Do not create a universal homepage adapter.
- Do not convert domain methods into stringly-typed generic list calls.
- Do not move queue/public/component orchestration into the domain adapter.
- Keep `kudosContracts.ts` authoritative for domain typing.

## Required scrubbing
Unify the Kudos domain entrypoints so local webparts no longer need to know about several low-level files to perform one business action.

## Required outputs
- clean adapter entrypoint(s)
- updated imports
- tests for adapter behavior
- short closure report explaining:
  - platform layer responsibilities,
  - adapter responsibilities,
  - local orchestration responsibilities
