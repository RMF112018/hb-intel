# HB Kudos Prompt Package — Wave 3
## Experience cohesion, accessibility consistency, interaction clarity, and host-safe hardening

## Objective

This package comprehensively addresses **Wave 3** of the HB Kudos audit findings.

### Wave 3 findings in scope
15. The public experience is compositionally fragmented
16. “View all”, article reading, archive, and composer shells are not yet harmonized as one design language
17. There is evidence of accessibility intent, but it is not systematic enough
18. Companion controls are semantically serviceable, but visually and behaviorally fragmented
19. The “Read more” and flyout-body patterns need stronger content accessibility discipline
20. Host-safe behavior is real, but the implementation is brittle

This package is intentionally limited to Wave 3.
It assumes Wave 1 and Wave 2 have already been completed or are being treated as locked foundations.

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

Wave 3 must preserve Wave 1 doctrine/design-system corrections and Wave 2 structural/productization improvements.

## Real implementation footprint to treat as in-scope

### Public Kudos runtime and experience surfaces
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used

### Companion runtime and experience surfaces
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

### Shared local UI seams
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

### Context / runtime seams to preserve
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- `apps/dev-harness/src/tabs/KudosTab.tsx`
- `apps/dev-harness/src/harness/kudosHarness.ts`

## Out of scope for Wave 3

Do not expand this package into later waves unless a narrowly related fix is unavoidable.

Explicitly out of scope:
- broad runtime architecture refactors that belong to Wave 2
- split-runtime retirement strategy
- large service/writer redesign
- broad validation/harness expansion beyond what is needed to close Wave 3
- aggregate production-readiness/closure work that belongs to later waves
- unrelated SharePoint schema or workflow changes

## Mandatory guardrails

- Use the live repo `main` branch as source of truth.
- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Preserve current webpart IDs, manifest linkage, mount wiring, list-binding model, role/capability model, audit-event model, and dev-harness assumptions.
- Preserve Wave 1 doctrine/design-system posture.
- Preserve Wave 2 component and orchestration improvements.
- Do not flatten the public surface into timid enterprise card UI.
- Do not weaken the companion’s operational depth.
- Do not “solve” accessibility by stripping interaction richness.
- Do not remove host-safe protections unless replaced with a clearer, more reliable equivalent.

## Execution order

1. Read `Plan-Summary.md`
2. Read `Wave3-Audit-Summary.md`
3. Execute `Prompt-01-Authority-Lock-and-Wave3-Execution-Rules.md`
4. Execute `Prompt-02-Public-Experience-Cohesion-and-Flyout-Harmonization.md`
5. Execute `Prompt-03-Accessibility-System-and-Interaction-Clarity-Pass.md`
6. Execute `Prompt-04-Companion-Control-and-Host-Safe-Hardening.md`
7. Execute `Prompt-05-Wave3-Validation-and-Closure.md`
