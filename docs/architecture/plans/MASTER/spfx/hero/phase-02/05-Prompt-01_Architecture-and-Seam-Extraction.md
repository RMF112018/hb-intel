# 05 — Prompt 01: Architecture and Seam Extraction

You are working in the live local HB Intel repo.

## Objective

Establish the correct architecture and seam boundaries for a new homepage webpart named `teamViewer`, using the **HB Kudos public app** as a benchmark for implementation quality and reusable mechanics, without cloning Kudos workflow or domain semantics.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Governing authority

Treat the following as binding:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Treat the following as benchmark / closure authority:

- `docs/architecture/plans/MASTER/spfx/benchmark/README.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/02-Kudos-Public-Benchmark-Reference.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/05-Code-Agent-Governance-Prompt-Template.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/06-Closure-Checklist.md`

## Repo-truth reference inputs

Audit and use the current live code under at minimum:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurfaceFamily.ts`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useRecipientPhotoHydration.ts`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useHostSafeLayout.ts`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `packages/ui-kit/src/homepage.ts`
- `packages/ui-kit/src/HbcAvatarStack/index.tsx`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureProfilePhotoResolver.ts`

Also inspect any immediately adjacent files needed to confirm imports and drift.

## Required decisions to make and lock

You must produce and implement an architecture lock for `teamViewer` that answers:

1. exact folder structure
2. which seams stay local
3. which seams should be generalized
4. which Kudos seams must stay isolated
5. whether a local `teamViewer` surface family is warranted
6. whether any existing helper should be extracted into a generic homepage seam

## Mandatory anti-coupling rule

Do **not** make `teamViewer` depend directly on:
- `kudosContracts.ts`
- Kudos workflow predicates
- composer logic
- celebrate logic
- archive/feed semantics
- governance surfaces
- companion runtime code

## Mandatory output

Create/update markdown implementation notes in an appropriate work folder and then implement the architecture scaffold.

At minimum, produce:

1. architecture summary
2. seam map
3. extraction/generalization decisions
4. anti-coupling notes
5. folder/file scaffold for `teamViewer`

## Required implementation work

Implement the new scaffold under:

- `apps/hb-webparts/src/webparts/teamViewer/`

Expected minimum scaffold:
- `TeamViewer.tsx`
- `index.ts`
- `teamViewerRuntimeContract.ts`
- `components/`
- `hooks/`
- `display/`

You may add more files if justified.

## Closure requirements

Before closing this prompt:

- prove the architecture is coherent
- prove no weak Kudos domain coupling was introduced
- document what was generalized vs left local
- identify the next exact files to build in Prompt 02
