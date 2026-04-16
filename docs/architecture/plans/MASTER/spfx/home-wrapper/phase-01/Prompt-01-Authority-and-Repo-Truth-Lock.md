# Prompt Title

Prompt 01 — Authority and Repo-Truth Lock for HB Homepage

## Objective

Produce the authoritative Phase 01 baseline for adding `hb-homepage` to `apps/hb-webparts`, grounded in live repo truth and controlling doctrine.

This prompt does not implement `hb-homepage`. It locks the execution baseline the rest of the package must obey.

## Why this prompt exists now

The original package pointed at the right seams, but it was too shallow. It did not force the code agent to surface the current dispatcher complexity, the split People/Kudos runtime boundaries, the maturity of the target modules, or the sensitivity of the packaging pipeline.

Without a real repo-truth lock, later prompts would risk inventing missing assumptions and damaging working seams.

## Current repo truth

You must inspect and document, at minimum:

- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/`
- `apps/hb-webparts/src/webparts/companyPulse/`
- `apps/hb-webparts/src/webparts/leadershipMessage/`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/`
- `apps/hb-webparts/src/webparts/hbKudos/`
- adjacent manifests under `apps/hb-webparts/src/webparts/`
- `apps/hb-webparts/package.json`
- `packages/ui-kit/package.json`
- `tools/build-spfx-package.ts`

You must explicitly capture:

- how homepage webparts are currently dispatched
- which target modules are already thin consumers over shared homepage surfaces
- which runtime seams must not be broken
- which packaging behaviors are already custom and high risk
- whether the target modules are currently intended to remain independently packageable

## Intended future state

At completion of this prompt, Phase 01 has a single controlling baseline document that:

- states the exact initiative
- states the exact affected seams
- locks additive safety
- locks hero independence
- ranks integration effort by module
- names the runtime and packaging hazards that govern sequencing

## Research-informed technical considerations

Before writing the closure note, confirm and incorporate the specific host realities that affect this initiative:

- SharePoint full-width placement rules
- communication-site requirement for true full-width validation
- workbench validation limitations
- SPFx compatibility boundaries relevant to this repo’s custom runtime model

Do not dump research. Translate it into decisions and constraints.

## Required implementation scope

Create the closure note:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/01-Authority-and-Repo-Truth-Lock.md`

The note must include:

1. objective restatement
2. governing authority
3. exact files and seams audited
4. current mount/runtime truth
5. current packaging truth
6. target-module maturity assessment
7. low / medium / high integration-effort ranking with reasons
8. explicit lock that `hb-homepage` is additive in Phase 01
9. explicit lock that `hbSignatureHero` remains independent
10. exact next-step boundary for Prompt 02 only

## Explicit non-scope

- Do not create `hb-homepage` yet
- Do not refactor target modules yet
- Do not alter manifests yet
- Do not edit `build-spfx-package.ts` yet
- Do not broaden into unrelated homepage redesign work

## Required verification / burden of proof

You must prove in the note:

- the specific runtime dispatch seam already in place
- the specific packaging seam already in place
- which target modules are already thin shared-surface consumers
- whether standalone public webparts must remain alive during Phase 01

## Required output artifact(s)

- `01-Authority-and-Repo-Truth-Lock.md`

## Completion standard

This prompt is complete only when the closure note is specific enough to prevent later prompts from inventing missing repo assumptions.
