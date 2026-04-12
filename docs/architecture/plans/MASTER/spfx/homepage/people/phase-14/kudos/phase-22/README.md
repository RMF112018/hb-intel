# HB Kudos Prompt Package — Wave 5
## Cross-wave execution governance, regression control, acceptance, and handoff

## Important note

The original **24 audit findings are fully allocated through Waves 1–4**.

This package is therefore **not a new remediation wave derived from a new block of audit findings**.
It is the only sensible **post-audit Wave 5**:
- master execution governance across Waves 1–4
- cross-wave regression control
- final acceptance criteria
- handoff / persistence rules so the code remains stable after closure

## Objective

Provide a disciplined, implementation-aware control package that governs:
- execution order across Waves 1–4
- regression prevention between waves
- acceptance thresholds before closing the HB Kudos workstream
- handoff rules so the final implementation can persist as long-lived production code

## Repo source of truth

Live repo:
- `https://github.com/RMF112018/hb-intel.git`

Branch:
- `main`

## Governing authority

The following docs remain binding:
1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/ui-kit/Presentation-Lane-Standard.md`
4. `docs/reference/ui-kit/README.md`

## Real implementation footprint governed by this package

### Public runtime
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used

### Companion runtime
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

### Shared UI / behavior seams
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`

### Runtime / packaging / validation seams
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- `apps/dev-harness/src/tabs/KudosTab.tsx`
- `apps/dev-harness/src/harness/kudosHarness.ts`

## Out of scope

This is not a new feature package.
This is not a new architecture wave.
This is not a substitute for Waves 1–4.

Do not use this package to:
- invent new HB Kudos features
- redesign SharePoint list schema
- replace the split runtime model
- reopen already-closed wave work without evidence of regression
- make speculative enhancements unrelated to acceptance and long-term stability

## Mandatory guardrails

- Use the live repo `main` branch as source of truth.
- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Preserve the completed outcomes of Waves 1–4.
- Do not allow later-wave work to regress earlier-wave doctrine, structure, cohesion, accessibility, host-safe, manifest, or packaging gains.
- Do not claim final closure without real validation evidence.
- Do not use this package to justify broad new code churn after the four real waves are complete.

## Execution order

1. Read `Plan-Summary.md`
2. Read `Wave5-Intent-and-Scope-Summary.md`
3. Execute `Prompt-01-Master-Wave-Orchestration-and-Regression-Control.md`
4. Execute `Prompt-02-Final-Acceptance-Gates-and-Closure-Standard.md`
5. Execute `Prompt-03-Handoff-Persistence-and-Post-Closure-Governance.md`
