# HB Kudos Prompt Package — Wave 4
## Legacy containment, model-grade closure, validation tightening, and runtime/manifest preservation

## Objective

This package comprehensively addresses **Wave 4** of the HB Kudos audit findings.

### Wave 4 findings in scope
21. Split-runtime coexistence is understandable, but it increases drift risk
22. The implementation is functionally advanced, but it is not yet a model-grade homepage surface
23. The validation foundation exists, but closure must be tightened
24. Registration and manifest adjacency are correct

Wave 4 is the final **containment, quality-bar, and closure** wave.
It assumes Waves 1–3 have already been completed or are being treated as locked foundations.

## Repo source of truth

Live repo:
- `https://github.com/RMF112018/hb-intel.git`

Branch:
- `main`

## Governing authority

The following docs remain binding for this package:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/ui-kit/Presentation-Lane-Standard.md`
4. `docs/reference/ui-kit/README.md`

Wave 4 must preserve the doctrine/design-system corrections from Wave 1, the structural/productization improvements from Wave 2, and the cohesion/accessibility/host-safe improvements from Wave 3.

## Real implementation footprint to treat as in-scope

### Public Kudos runtime and related seams
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used

### Companion runtime and related seams
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

### Shared Kudos UI / behavior seams
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`

### Runtime, packaging, and validation seams
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- `apps/dev-harness/src/tabs/KudosTab.tsx`
- `apps/dev-harness/src/harness/kudosHarness.ts`
- relevant lint / typecheck / test / harness / Playwright seams already used by the repo

## Out of scope for Wave 4

Do not expand this package into unrelated product changes.

Explicitly out of scope:
- new feature work
- SharePoint list schema redesign
- workflow-model redesign
- speculative platform migration
- unrelated homepage webpart refactors outside the real Kudos footprint
- large post-closure enhancements that are not required to call Kudos production-grade

## Mandatory guardrails

- Use the live repo `main` branch as source of truth.
- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Preserve current webpart IDs, manifest linkage, mount wiring, list-binding model, role/capability model, audit-event model, and harness runtime assumptions.
- Preserve the split public-vs-companion runtime model unless a narrowly scoped containment improvement is required; do not collapse them.
- Preserve manifest adjacency and registration correctness.
- Do not break packaged SharePoint behavior while tightening closure.
- Do not weaken the authored presentation-lane standard in the name of final cleanup.
- Do not produce a superficial “closure report” without real validation.

## Execution order

1. Read `Plan-Summary.md`
2. Read `Wave4-Audit-Summary.md`
3. Execute `Prompt-01-Authority-Lock-and-Wave4-Execution-Rules.md`
4. Execute `Prompt-02-Split-Runtime-Containment-and-Drift-Risk-Reduction.md`
5. Execute `Prompt-03-Model-Grade-Homepage-Surface-Standard-and-Reference-Quality-Closure.md`
6. Execute `Prompt-04-Validation-Packaging-and-Release-Readiness-Closure.md`
