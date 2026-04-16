# Executive Audit Summary — Phase 01 HB Homepage Package

## Major strengths in the attached package

- The package is directionally aligned to the initiative: add a new `hb-homepage` orchestrator, keep `hbSignatureHero` independent, and sequence integration from simpler public modules to `HbKudos`.
- The package already points at the right primary seams: `apps/hb-webparts/src/mount.tsx`, `apps/hb-webparts/src/homepage/`, target webpart folders, manifests, and `tools/build-spfx-package.ts`.
- The sequencing intuition is mostly sound: establish the host first, then absorb lower-risk modules, then absorb `PeopleCulturePublic`, then `HbKudos`, then complete packaging and hosted validation.

## Major deficiencies in the attached package

- It is too shallow for a sensitive SPFx surface. The prompts are mostly directive shells, not execution-grade remediation prompts.
- It under-specifies the current repo reality: the target modules are already thin consumers over shared `@hbc/ui-kit/homepage` surface families, the homepage runtime already has split People/Kudos seams, and packaging is already a custom Vite → SPFx shell → multi-manifest/shim pipeline.
- It treats dependency adoption too casually. The governing doctrine mandates a premium stack, but the live repo already carries that stack centrally in `@hbc/ui-kit`; Phase 01 should generally consume that existing stack rather than duplicate-installing packages into `apps/hb-webparts`.
- It is weak on additive safety. The original prompts do not clearly lock that Phase 01 must add `hb-homepage` without breaking or silently decommissioning the existing standalone public webparts and their manifest/runtime mappings.
- It is weak on host reality. It does not explicitly bind the code agent to SharePoint full-width realities, communication-site limitations, or the fact that workbench does not prove full-width behavior.
- It is weak on packaging proof. The original packaging prompt does not teach the agent enough about the existing shell/manifest/shim/hash verification pipeline to avoid damaging it.
- It still leaves deferral posture in the closure phase by allowing vague “accepted limitations” and “follow-on opportunities” language instead of forcing a hard closure statement except for true external constraints.

## Principal changes made in the upgraded package

- Added a dedicated Prompt 02 to lock SharePoint/SPFx host realities, compatibility boundaries, dependency posture, and accessibility/motion obligations before architecture and implementation begin.
- Rewrote every prompt into an execution-grade format with the following sections:
  - Prompt Title
  - Objective
  - Why this prompt exists now
  - Current repo truth
  - Intended future state
  - Research-informed technical considerations
  - Required implementation scope
  - Explicit non-scope
  - Required verification / burden of proof
  - Required output artifact(s)
  - Completion standard
- Hardened the architecture around an **additive orchestrator** model:
  - `hb-homepage` is added as a new first-class homepage webpart
  - `hbSignatureHero` remains independent
  - existing standalone public webparts remain operational during Phase 01 unless this package explicitly changes them
- Locked the dependency posture:
  - favor reuse from `@hbc/ui-kit/homepage`
  - do not duplicate-install doctrine-mandated packages in `apps/hb-webparts` unless Phase 01 proves a missing direct dependency is actually required at that leaf package
- Strengthened packaging and runtime proof:
  - new prompt language explicitly binds the agent to manifest adjacency, mount registration, `build-spfx-package.ts`, hashed asset behavior, shell-entry shim behavior, and `.sppkg` verification
- Removed vague closure language and replaced it with hard-edged completion standards and artifact requirements.
