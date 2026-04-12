# HB Kudos Prompt Package — Wave 1
## Doctrine, design-system, styling, and premium-stack remediation

## Objective

This package comprehensively addresses **Wave 1** of the HB Kudos audit findings.

### Wave 1 findings in scope
1. Direct doctrine violation: Unicode / pseudo-icon usage remains in the public surface
2. Token discipline is materially weak
3. The styling layer is the single biggest UI-quality liability
4. The surfaces import from `@hbc/ui-kit/homepage`, but mostly bypass the spirit of the shared system
5. The mandated premium homepage stack is not materially used where it is clearly relevant

This package is intentionally limited to Wave 1.
It establishes the correct UI-system and doctrine foundation for all later HB Kudos remediation waves.

## Repo source of truth

Live repo:
- `https://github.com/RMF112018/hb-intel.git`

Branch:
- `main`

## Governing authority

The following docs are binding for this package:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/ui-kit/Presentation-Lane-Standard.md`
4. `docs/reference/ui-kit/README.md`

## Real implementation footprint to treat as in-scope

### Public Kudos surface
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used

### Companion / governance surface
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

### Shared Kudos UI seams
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

### Context / runtime seams to preserve
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`

## Out of scope for Wave 1

Do not expand this package into later waves unless a narrowly related fix is unavoidable.

Explicitly out of scope:
- broad workflow-model rewrites
- SharePoint list schema changes
- broader public/composer/controller decomposition
- broader companion reducer/action-routing refactor
- backend / writer redesign
- people-search service redesign beyond scrub necessary for Wave 1
- full accessibility closure pass
- full Playwright / harness expansion
- broad UI polish beyond what is required to satisfy doctrine and design-system obligations

## Mandatory guardrails

- Use the live repo `main` branch as source of truth.
- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Preserve current webpart IDs, manifest linkage, mount wiring, list-binding model, role/capability model, audit-event model, and existing host-safe intent.
- Do not introduce `@hbc/ui-kit` root imports or `@hbc/ui-kit/app-shell` imports into homepage webparts.
- Do not flatten the Kudos public surface into timid enterprise card UI.
- Do not remove the authored, presentation-lane character of the surface.
- Do not leave Unicode or pseudo-icons in homepage-facing Kudos UI where a real icon system is expected.
- Do not leave large injected `<style>` blocks and giant raw inline style objects as the dominant styling architecture.
- Do not add approved premium-stack libraries symbolically; use them materially where they are relevant.
- Do not overreach into Wave 2, 3, or 4 refactors unless required by a narrow Wave 1 fix.

## Execution order

1. Read `Plan-Summary.md`
2. Read `Wave1-Audit-Summary.md`
3. Execute `Prompt-01-Authority-Lock-and-Wave1-Execution-Rules.md`
4. Execute `Prompt-02-Iconography-Compliance-and-Premium-Stack-Adoption.md`
5. Execute `Prompt-03-Token-Discipline-and-Theme-Alias-Refactor.md`
6. Execute `Prompt-04-Styling-Architecture-and-Variant-System-Rebuild.md`
7. Execute `Prompt-05-Homepage-Surface-Family-and-Composition-Alignment.md`
8. Execute `Prompt-06-Wave1-Validation-and-Closure.md`
