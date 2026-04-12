# HB Kudos Prompt Package — Wave 2
## UI-layer architecture, component decomposition, and shared-seam cleanup

## Objective

This package comprehensively addresses **Wave 2** of the HB Kudos audit findings.

### Wave 2 findings in scope
6. `HbKudosCompanion.tsx` is materially overgrown
7. `HbKudos.tsx` is also carrying too many responsibilities
8. The public surface is visually stronger than generic enterprise card UI, but it is not systemically premium
9. The companion surface is functionally rich but visually under-governed
10. `KUDOS_GOV_TOKENS` is better than duplicated literals everywhere, but it is still not a governed token system
11. Variant logic is not formalized
12. Production debug logging is still embedded in the people-search seam
13. Hook discipline is uneven
14. Shared service modules are doing too much

This package is intentionally limited to Wave 2.
It assumes Wave 1 has already been completed or is being treated as the locked foundation.

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

Wave 2 must build on top of the Wave 1 doctrine/design-system posture rather than undoing it.

## Real implementation footprint to treat as in-scope

### Public Kudos runtime
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used

### Companion runtime
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

### Shared Kudos UI seams
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

### Shared behavior / data seams
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`

### Context / runtime seams to preserve
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- `apps/dev-harness/src/tabs/KudosTab.tsx`
- `apps/dev-harness/src/harness/kudosHarness.ts`

## Out of scope for Wave 2

Do not expand this package into later waves unless a narrowly related fix is unavoidable.

Explicitly out of scope:
- broad composition polish beyond what is necessary to productize the refactor
- archive / feed / composer harmonization as a full experience pass
- systematic accessibility closure
- broad host-safe layout redesign
- split-runtime retirement strategy
- major validation/harness expansion beyond what is needed to close Wave 2
- unrelated SharePoint list schema or workflow model changes

## Mandatory guardrails

- Use the live repo `main` branch as source of truth.
- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Preserve current webpart IDs, manifest linkage, mount wiring, list-binding model, role/capability model, audit-event model, and dev-harness fetch-interception architecture.
- Preserve the Wave 1 doctrine and design-system posture; do not regress iconography, token discipline, or variant discipline.
- Do not perform a wholesale product rewrite.
- Do not collapse public and companion surfaces into a single component.
- Do not flatten the public surface into generic card UI.
- Do not redesign working workflow semantics just to make files smaller.
- Do not leave production debug logging or weak hook discipline behind in shared runtime seams.

## Execution order

1. Read `Plan-Summary.md`
2. Read `Wave2-Audit-Summary.md`
3. Execute `Prompt-01-Authority-Lock-and-Wave2-Execution-Rules.md`
4. Execute `Prompt-02-Public-Runtime-Decomposition-and-Orchestration-Refactor.md`
5. Execute `Prompt-03-Companion-Runtime-Decomposition-and-Workspace-Productization.md`
6. Execute `Prompt-04-Shared-Kudos-UI-Seams-and-Variant-Hardening.md`
7. Execute `Prompt-05-Shared-Behavior-Seams-Scrub-and-Service-Decomposition.md`
8. Execute `Prompt-06-Wave2-Validation-and-Closure.md`
