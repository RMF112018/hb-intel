# 11 — Prompt — Phase 5 — Prove Reuse with a Second Homepage Consumer

## Objective
Demonstrate that the extracted shared SharePoint platform layer can serve another homepage list-backed surface without becoming a generic CRUD framework.

## Repo authority
Use the live `main` branch of:
- `https://github.com/RMF112018/hb-intel.git`

## Required instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Recommended proof target
Use a narrow mechanics-only pilot on Project Spotlight or another homepage list-backed webpart that currently uses weaker list/data seams.

## File focus
At minimum inspect:
- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`
- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`
- the target webpart runtime(s)
- the new platform package

## Target proof
Prove that the platform layer can be reused for:
- endpoint construction
- list binding discipline
- host/bootstrap resolution
- shared fetch/result/error primitives
- optional invalidation/cache discipline

## Hard rules
- Do not force the second consumer into Kudos contracts.
- Do not create a universal adapter abstraction.
- Do not flatten the second webpart’s persona or local orchestration.
- Reuse mechanics only.

## Required validation
- second consumer still renders correctly
- no regression in its persona-specific behavior
- reuse is explicit and narrow
- no generic “frameworkization” drift appears in the code
