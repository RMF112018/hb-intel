# Plan Summary — Upgraded Phase 01 Package for HB Homepage

## Objective

Deliver an execution-grade prompt package for adding a new `hb-homepage` SPFx webpart inside `apps/hb-webparts` that becomes a composed homepage operating layer for selected public homepage modules while keeping `hbSignatureHero` independent.

## Locked target outcome

When the package is fully executed:

1. `hbSignatureHero` remains its own independent flagship top-band webpart.
2. A new `hb-homepage` webpart exists as a first-class packaged SPFx component.
3. `hb-homepage` orchestrates the following public modules inside a governed homepage shell:
   - `CompanyPulse`
   - `LeadershipMessage`
   - `ProjectPortfolioSpotlight`
   - `PeopleCulturePublic`
   - `HbKudos`
4. The existing standalone public webparts remain operational unless this package explicitly and safely changes them.
5. The runtime and packaging pipeline continue to work without regression.

## Repo-truth posture

This package is written against the live repo reality, not a greenfield assumption.

The live repo already contains:

- a rich `mount.tsx` dispatcher in `apps/hb-webparts/src/mount.tsx`
- a canonical reference homepage composition in `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- target modules that are already mature runtimes, with several already acting as thin consumers over `@hbc/ui-kit/homepage`
- a split People/Kudos runtime model that must be preserved
- a custom `tools/build-spfx-package.ts` pipeline that performs Vite build, SPFx shell packaging, manifest/shim handling, and package verification
- a governed premium stack already present centrally in `packages/ui-kit`

## Governing doctrine

This package is controlled by:

- `UI-Doctrine-SPFx-Governing-Standard`
- `UI-Doctrine-SPFx-Homepage-Overlay`

Those doctrine files are binding for:

- host-aware composition
- import discipline
- full-width posture
- reduced-motion/accessibility requirements
- premium stack usage
- anti-generic-card-grid posture
- manifest adjacency and packaging intent

## Research-backed technical posture

The package assumes and enforces the following:

- full-width-capable webparts must explicitly declare `supportsFullBleed: true` if they are intended to be placeable in a SharePoint full-width column
- full-width behavior must be validated on a deployed communication site, not the workbench
- the live repo’s React 18 + Vite + custom SPFx shell model must be preserved unless a prompt explicitly broadens scope to refactor it
- doctrine-mandated premium-stack behavior should preferentially be consumed from `@hbc/ui-kit/homepage` and existing shared dependencies, not duplicated casually in `apps/hb-webparts`

## Structural implementation recommendation

### Additive orchestrator, not destructive replacement

Phase 01 should add `hb-homepage` as a new homepage webpart. It should not delete, silently break, or ambiguously retire the existing standalone public webparts.

### Shell owns page-canvas composition

`hb-homepage` owns:

- zone order
- outer layout
- shell rhythm
- section-aware spacing
- sparse/loading/error posture
- shell-level responsiveness
- shell-level reduced-motion and host-safe behavior

### Embedded modules keep product logic

The embedded modules continue to own:

- their internal feature logic
- their internal view-model shaping
- their internal product-level interactions
- their internal content interpretation

The shell does **not** become a rewrite of each feature.

### Keep hero independent

`hbSignatureHero` remains independent and must not be absorbed, visually competed with, or redundantly recreated inside `hb-homepage`.

## Package structure

1. Prompt 01 — authority and repo-truth lock
2. Prompt 02 — SharePoint/SPFx host reality, compatibility, dependency, and accessibility lock
3. Prompt 03 — architecture and shell/embedded contract
4. Prompt 04 — create `hb-homepage` host and manifest
5. Prompt 05 — embed `CompanyPulse`, `LeadershipMessage`, `ProjectPortfolioSpotlight`
6. Prompt 06 — embed `PeopleCulturePublic`
7. Prompt 07 — embed `HbKudos`
8. Prompt 08 — mount/runtime/manifest/packaging integration
9. Prompt 09 — hosted validation and hard closure

## Non-negotiable guardrails

- Do not collapse the initiative into CSS-only layout wrapping.
- Do not let `hb-homepage` duplicate SharePoint shell chrome.
- Do not let embedded modules continue to own outer page composition once they are shell-rendered.
- Do not break or silently remove existing standalone webparts during this phase.
- Do not treat workbench rendering as proof of full-width SharePoint behavior.
- Do not casually add local dependencies already governed and available through `@hbc/ui-kit`.
- Do not close the package without package/runtime proof.
- Do not leave meaningful “follow-up later” work inside Phase 01 scope.

## Definition of package success

This upgraded package succeeds when a serious local code agent can execute it without rediscovering missing context, without inventing key decisions, and without weakening runtime, doctrine, packaging, or accessibility discipline.
