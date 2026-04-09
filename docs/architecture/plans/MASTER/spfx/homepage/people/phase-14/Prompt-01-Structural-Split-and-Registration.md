# Prompt 01 — Structural Split and Registration

## Objective

Implement the structural split seams required to move from the current merged People & Culture runtime toward explicit public webpart boundaries for **People and Culture** and **HB Kudos**, without jumping into the final feature/UI rebuild.

## Preconditions

Complete Prompt 00 first and use its repo-truth note as the governing reference.

## Required structural outcome

Create or normalize explicit source seams for the following:

### A. Legacy compatibility seam

Preserve the current merged runtime as a temporary compatibility path.

Acceptable patterns:

- retain the current merged source in place and mark it legacy in comments/docs, or
- move it behind a compatibility wrapper / re-export, or
- rename it to a clearly legacy name and provide a stable compatibility export.

Do not break existing placements in this phase.

### B. People & Culture public seam

Create an explicit future-facing public surface seam for People & Culture that is dedicated to:

- announcements
- celebrations / milestones
- culture programming / events

It may be a minimal scaffold/wrapper in this phase, but it must be a real first-class seam.

Recommended path if local HEAD does not already provide one:

- `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/index.ts`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublicWebPart.manifest.json`

### C. HB Kudos public seam

Create an explicit future-facing public surface seam for HB Kudos that is dedicated to:

- recognition feed / spotlight
- archive / browsing
- celebrate interaction
- kudos submission entry
- later moderation-aware behavior

Use the existing Kudos-oriented files in the repo where appropriate, but do not mistake support components for authoritative SPFx wiring.

Recommended path if local HEAD does not already provide one:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/index.ts`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`

### D. Companion/admin future seams

For this phase, do **not** implement the real companion/admin behavior.

Only create placeholder seams if needed for later wave clarity, for example:

- `apps/hb-webparts/src/webparts/peopleCultureCompanion/README.md`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/README.md`

Only create manifests for these companion seams now if local HEAD proves that stable early GUID registration is necessary. Otherwise defer manifests.

## Registration rules

1. Do not repurpose the current deployed People & Culture GUID for HB Kudos.
2. Do not silently delete the current merged manifest/runtime.
3. Add new mount registration only for seams that now have real manifests.
4. Ensure every new manifest has an intentional title, alias, and description.
5. Keep titles plain and production-appropriate:
   - `People and Culture`
   - `HB Kudos`
6. Preserve current toolbox visibility posture unless Prompt 00 proved a different policy is required.

## Minimal implementation expectations for this phase

The new split seams may be scaffold-grade, but they must compile and package.

That means:

- strongly typed props,
- stable exports,
- no fake final behavior,
- no misleading production claims,
- and no final UX polish work.

The goal is to establish trustworthy boundaries.

## Required code/documentation updates

Update as needed:

- `apps/hb-webparts/src/mount.tsx`
- any relevant barrels/exports
- any relevant comments/docstrings that still describe the merged surface as the end state
- the repo-truth note if implementation revealed a narrow mismatch

Create a structural decision note at:

- `docs/architecture/reviews/people-culture-split-initiation-structure.md`

That note must include:

- final seam inventory created in this phase,
- manifest IDs/titles/aliases,
- compatibility treatment for the current merged webpart,
- and exactly what remains deferred.

## Guardrails

- Do not rebuild the final People & Culture UI.
- Do not rebuild the final HB Kudos UI.
- Do not complete list-field integration logic beyond what is strictly needed to compile.
- Do not implement final moderation or permissions logic.
- Do not create a second app domain or second `.sppkg`.
- Do not re-read files that are still within your active context window or memory unless you need to verify a specific detail that is genuinely uncertain.

## Completion report

Report back with:

- new/updated folders and files,
- new/updated manifests,
- mount registration changes,
- compatibility treatment used,
- and all items explicitly deferred.
