# README — Upgraded Phase 01 Package for HB Homepage

## Purpose

This package replaces the original Phase 01 plan with an execution-grade prompt set for adding `hb-homepage` as a composed homepage SPFx webpart in `apps/hb-webparts`.

It is written for a local code agent and is intentionally stricter, deeper, and less deferential than the original package.

## Locked initiative

The initiative is:

- add a new `hb-homepage` homepage orchestrator webpart
- keep `hbSignatureHero` independent
- orchestrate the selected public homepage modules inside the new shell
- preserve runtime and packaging integrity
- close the initiative with hard proof

## Locked scope

`hb-homepage` must orchestrate:

- `CompanyPulse`
- `LeadershipMessage`
- `ProjectPortfolioSpotlight`
- `PeopleCulturePublic`
- `HbKudos`

`hbSignatureHero` remains independent.

## Repo-truth operating posture

The code agent must work from the live repo and must respect the following truths before making changes:

- `apps/hb-webparts/src/mount.tsx` is already a sensitive dispatcher
- the target modules already exist and several are already thin consumers over `@hbc/ui-kit/homepage`
- `PeopleCulturePublic` and `HbKudos` already live inside a split runtime model
- `tools/build-spfx-package.ts` is already a custom, non-trivial packaging system
- the doctrine-approved premium stack is already centrally present in `packages/ui-kit`

## Additive safety rule

This package is additive unless a prompt explicitly says otherwise.

That means:

- do not delete or silently decommission the existing standalone public homepage webparts
- do not remove current runtime mappings unless the prompt explicitly requires and proves it
- do not introduce accidental manifest/runtime drift
- do not broaden into unrelated homepage or shell workstreams

## Dependency posture

Use existing governed shared dependencies first.

Before adding any direct dependency to `apps/hb-webparts`, prove that:

1. the needed capability is not already available through `@hbc/ui-kit/homepage` or another existing shared package
2. the direct dependency is required at the leaf package
3. the addition does not create avoidable packaging or bundle-risk for the SPFx host

## Research posture

The prompts assume and require research-backed compliance with:

- SharePoint full-width behavior
- communication-site constraints
- SPFx compatibility boundaries
- reduced-motion and accessibility obligations
- premium-stack usage realities

## Required operating rules for the code agent

1. Work in the live repo only.
2. Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
3. Treat repo truth as authoritative over prior package assumptions.
4. Stay inside the assigned prompt scope.
5. Produce every required artifact named in the prompt.
6. Before closing a prompt, prove:
   - exact files changed
   - exact architectural/runtime effect
   - exact verification performed
   - exact boundary left for the next prompt
7. Do not use vague closure language.
8. Do not defer work that belongs inside Phase 01 closure scope.

## Execution order

1. Prompt-01-Authority-and-Repo-Truth-Lock.md
2. Prompt-02-Host-Reality-Compatibility-and-Dependency-Lock.md
3. Prompt-03-Architecture-and-Shell-Embedded-Contract.md
4. Prompt-04-Create-HB-Homepage-Host-and-Manifest.md
5. Prompt-05-Embed-Pulse-Leadership-Spotlight.md
6. Prompt-06-Embed-People-Culture-Public.md
7. Prompt-07-Embed-HB-Kudos.md
8. Prompt-08-Mount-Runtime-Manifest-and-Packaging-Integration.md
9. Prompt-09-Hosted-Validation-and-Hard-Closure.md

## Completion rule for the package as a whole

The package is complete only when:
- `hb-homepage` is implemented
- it is mounted and packaged correctly
- it renders the intended modules through the new shell
- `hbSignatureHero` remains independent
- runtime/package proof exists
- only true external/environmental constraints remain open
