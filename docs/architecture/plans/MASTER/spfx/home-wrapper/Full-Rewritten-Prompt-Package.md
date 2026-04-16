# Full Rewritten Prompt Package


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


---


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


---


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


---


# Prompt Title

Prompt 02 — SharePoint/SPFx Host Reality, Compatibility, and Dependency Lock

## Objective

Lock the external technical realities that must shape the `hb-homepage` implementation before architecture and coding begin.

## Why this prompt exists now

The original package jumped from repo-truth to architecture too quickly. That left critical technical issues under-specified:

- full-width host reality
- communication-site limitations
- workbench validation limits
- SPFx compatibility boundaries
- the repo’s React 18 + Vite + shell-packaging posture
- dependency reuse versus duplicate installation
- reduced-motion/accessibility obligations

Those issues must be explicitly locked before the architecture prompt, or the code agent will fill gaps with unsafe assumptions.

## Current repo truth

The live repo already shows:

- `apps/hb-webparts` uses React 18 and Vite build scripts
- `@microsoft/sp-webpart-base` is pinned at SPFx 1.20 in `apps/hb-webparts`
- `packages/ui-kit` already contains doctrine-approved packages such as `motion`, `lucide-react`, `@floating-ui/react`, Radix packages, `class-variance-authority`, and `clsx`
- the packaging pipeline explicitly drives SPFx shell packaging through Node 18 and custom asset/manifest handling

## Intended future state

At completion of this prompt, the package has a clear, documented technical lock on:

- what host behavior can be assumed
- what cannot be assumed
- what compatibility model must be preserved
- what dependency posture must be followed
- what accessibility/motion standards must be proven later

## Research-informed technical considerations

You must research and explicitly translate into implementation rules:

1. SharePoint full-width support for SPFx webparts
2. communication-site versus generic page assumptions
3. workbench limits for full-width validation
4. SPFx version compatibility relevant to Node and React
5. reduced-motion obligations for interaction-triggered animation
6. whether doctrine-approved packages already present in `@hbc/ui-kit` should be reused instead of reinstalled locally

The output must explain how those findings apply to **this repo**, not just summarize docs.

## Required implementation scope

Create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/02-Host-Reality-Compatibility-and-Dependency-Lock.md`

The document must include:

1. full-width host reality and testing rules
2. communication-site validation rules
3. workbench limitations
4. SPFx/Node/React compatibility implications for this repo
5. explicit rule about preserving the current Vite + SPFx shell model unless later prompts intentionally broaden scope
6. dependency posture:
   - reuse `@hbc/ui-kit/homepage` first
   - no casual local reinstallation of premium-stack packages
7. reduced-motion, focus, keyboard, sparse-state, and partial-config obligations
8. exact implementation consequences for Prompts 03–09

## Explicit non-scope

- Do not implement the architecture yet
- Do not add dependencies yet
- Do not create `hb-homepage` yet
- Do not modify packaging yet

## Required verification / burden of proof

The document must state, without ambiguity:

- whether `hb-homepage` should be authored as full-width-capable
- what environment is required to prove that behavior
- what dependency additions are currently justified or unjustified
- what compatibility “cleanup” must be avoided during Phase 01

## Required output artifact(s)

- `02-Host-Reality-Compatibility-and-Dependency-Lock.md`

## Completion standard

This prompt is complete only when later prompts can rely on a settled technical boundary instead of guessing about host, compatibility, dependency, or accessibility rules.


---


# Prompt Title

Prompt 03 — HB Homepage Architecture and Shell/Embedded Contract

## Objective

Define the real implementation architecture for `hb-homepage`, including shell responsibilities, embedded-module responsibilities, file structure, context flow, and coexistence rules with the existing standalone public webparts.

## Why this prompt exists now

The original architecture prompt was too generic. It asked for a blueprint, but it did not force decisions on:

- additive versus replacement behavior
- coexistence with existing standalone webparts
- shell-owned versus module-owned layout
- context and configuration handoff
- full-width-capable versus standard-section posture
- required acceptance criteria for later prompts

This prompt exists to remove that ambiguity before code is written.

## Current repo truth

You must design around these realities:

- the dispatcher already maps many homepage surfaces
- the target modules are not uniform; some are already thin shared-surface consumers, while `PeopleCulturePublic` and especially `HbKudos` carry more product-specific runtime concerns
- `hbSignatureHero` is already a mature independent flagship surface
- the package must preserve current runtime/package integrity while introducing a new webpart

## Intended future state

At completion of this prompt, the repo has a contract-grade architecture document that defines:

- what `hb-homepage` is
- where it lives
- what it renders
- what it does not render
- what embedded modules keep owning
- what the shell newly owns
- how the new webpart coexists with existing standalone webparts during Phase 01

## Research-informed technical considerations

In the architecture document, translate the prior host/dependency lock into concrete architecture rules, including:

- whether `hb-homepage` is full-width-capable in manifest posture
- what authoring defaults and sparse states are required
- how reduced-motion obligations affect shell transitions
- how embedded modules should consume shared homepage primitives instead of duplicating premium-stack work

## Required implementation scope

Create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/03-Architecture-and-Shell-Embedded-Contract.md`

It must define, at minimum:

1. the role of `hb-homepage`
2. the additive coexistence model with standalone public webparts
3. the difference between the independent hero and the composed operating layer
4. shell responsibilities:
   - zone order
   - outer spacing
   - responsive behavior
   - section/full-width posture
   - sparse/loading/error treatment
   - host-safe behavior
   - reduced-motion behavior
5. embedded-module responsibilities:
   - internal feature logic
   - internal presentation logic
   - what they must stop owning
6. proposed folder and file structure for `hb-homepage`
7. shell configuration contract
8. embedded module registration contract
9. any required shared context/helper seams
10. migration order for the target modules
11. explicit acceptance criteria for Prompts 04–09

## Explicit non-scope

- Do not create files under `apps/hb-webparts/src/webparts/hb-homepage/` yet
- Do not edit `mount.tsx` yet
- Do not edit packaging yet
- Do not embed modules yet

## Required verification / burden of proof

The architecture document must be specific enough that a code agent can:

- create the host
- embed the modules in order
- know what to preserve
- know what not to touch
- know how closure will be judged

## Required output artifact(s)

- `03-Architecture-and-Shell-Embedded-Contract.md`

## Completion standard

This prompt is complete only when the architecture document leaves no material shell-boundary decisions to ad hoc interpretation.


---


# Prompt Title

Prompt 04 — Create the HB Homepage Host and Adjacent Manifest

## Objective

Implement the new `hb-homepage` webpart host, including its adjacent manifest, internal shell hierarchy, and initial shell-owned layout/state behavior, without yet embedding all target modules.

## Why this prompt exists now

The original host-creation prompt was too terse. In this repo, “create the host” is not just “make a new component folder.” It requires:

- a new adjacent manifest
- host-safe shell defaults
- authoring-safe sparse and partial-config behavior
- a composition/registration seam for embedded modules
- discipline around coexistence with the current standalone webparts

## Current repo truth

You must honor:

- manifest adjacency rules
- import discipline for homepage work
- the current `mount.tsx` dispatch model
- the current package/build structure of `apps/hb-webparts`

## Intended future state

At completion of this prompt:

- `apps/hb-webparts/src/webparts/hb-homepage/` exists
- the new host has an adjacent manifest
- the shell can render an initial composed frame with authoring-safe placeholder content
- shell-level state treatment exists for loading / empty / invalid configuration / error conditions
- the host is ready to accept target modules in later prompts

## Research-informed technical considerations

Build the host according to the locked technical posture:

- if the architecture doc makes the host full-width-capable, the manifest must explicitly carry that intent
- the host must still render acceptably in non-full-width placements
- motion must be reduced-motion aware
- homepage imports must come from the governed homepage entry point unless the architecture doc explicitly justifies a narrower exception

## Required implementation scope

Implement the host and create a closure note at:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-02/04-Create-HB-Homepage-Host-and-Manifest.md`

Implementation work must include:

1. create the `hb-homepage` folder and foundational files
2. create the adjacent manifest
3. create the shell component hierarchy
4. establish a module registration/composition seam
5. establish shell-owned layout structure
6. establish shell-owned sparse/loading/error posture
7. ensure the host compiles cleanly before module embedding starts

## Explicit non-scope

- Do not embed `HbKudos` yet
- Do not edit `mount.tsx` yet
- Do not update `build-spfx-package.ts` yet
- Do not break existing standalone public webparts
- Do not implement hero absorption

## Required verification / burden of proof

You must prove:

- exact files created
- manifest adjacency
- whether `supportsFullBleed` is or is not set, and why
- shell render behavior under minimal/partial configuration
- compile success for the new host files

## Required output artifact(s)

- `04-Create-HB-Homepage-Host-and-Manifest.md`

## Completion standard

This prompt is complete only when a real `hb-homepage` host exists and is technically ready for phased module embedding.


---


# Prompt Title

Prompt 05 — Embed Company Pulse, Leadership Message, and Project Portfolio Spotlight

## Objective

Embed the three lowest-risk public modules into `hb-homepage` and prove that the shell now owns outer layout while those modules retain their internal product logic.

## Why this prompt exists now

These three modules are the safest first integration targets because the repo already treats them as relatively thin consumers over shared homepage surface families. The original package recognized that sequencing instinct, but it did not force the agent to prove what changed in ownership boundaries after embedding.

## Current repo truth

You must preserve that these modules already own meaningful internal content normalization and view-model shaping. The shell should not re-author those internals. The shell should take over:

- zone placement
- shell spacing
- shell rhythm
- composition ownership

## Intended future state

At completion of this prompt:

- the three modules render through `hb-homepage`
- they no longer independently dictate the outer homepage layout within the shell
- their internal product logic remains intact
- the shell can demonstrate real composition authority, not a decorative wrapper

## Research-informed technical considerations

Honor the locked import/dependency posture:

- reuse existing shared homepage surfaces
- do not duplicate premium-stack work already handled by those modules and `@hbc/ui-kit/homepage`
- prove reduced-motion and keyboard/focus behavior remain credible after composition changes

## Required implementation scope

Implement the embedding work and create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-02/05-Embed-Pulse-Leadership-Spotlight.md`

The note must include:

1. exact files changed
2. exact shell integration points added
3. what outer-layout responsibility moved to the shell
4. what internal responsibility stayed with each module
5. proof that the three modules now render through the host cleanly
6. exact boundary left for `PeopleCulturePublic`

## Explicit non-scope

- Do not embed `PeopleCulturePublic` yet
- Do not embed `HbKudos` yet
- Do not change packaging except for compile continuity strictly required by this prompt
- Do not broaden into companion/admin/product redesign work

## Required verification / burden of proof

You must prove:

- each module renders from inside `hb-homepage`
- shell spacing/layout ownership is real
- module internals were not unnecessarily re-authored
- no existing standalone manifest/runtime seam was broken

## Required output artifact(s)

- `05-Embed-Pulse-Leadership-Spotlight.md`

## Completion standard

This prompt is complete only when the shell is demonstrably compositional and these three modules are embedded without feature or quality regression.


---


# Prompt Title

Prompt 06 — Embed PeopleCulturePublic Without Breaking the Split Runtime Boundary

## Objective

Embed `PeopleCulturePublic` into `hb-homepage` while preserving the repo’s existing split People/Kudos model and tightening any shell-to-module contract needed for stable composed rendering.

## Why this prompt exists now

`PeopleCulturePublic` is more sensitive than the prior three modules because it sits beside an already-split recognition runtime and still carries public/legacy-bridge considerations. The original prompt mentioned that but did not force the code agent to explicitly preserve the split boundary or explain how the bridge changes.

## Current repo truth

You must respect that:

- `PeopleCulturePublic` is already the dedicated non-recognition public runtime
- recognition belongs to `HbKudos`
- the repo already contains explicit comments and seams reflecting that split
- the public surface may still bridge legacy configuration shapes at entry

## Intended future state

At completion of this prompt:

- `PeopleCulturePublic` renders through `hb-homepage`
- the People/Kudos split remains intact
- any shell-facing config or viewer-context contract is explicit and stable
- any bridge tightening is documented and justified

## Research-informed technical considerations

Honor host and accessibility rules:

- preserve authoring-safe behavior for missing/stale content
- preserve reduced-motion/focus discipline after shell embedding
- do not use `hb-homepage` as a reason to merge or blur public People and recognition concerns

## Required implementation scope

Implement the embedding work and create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-03/06-Embed-People-Culture-Public.md`

The note must include:

1. exact files changed
2. shell contract changes made
3. how viewer context is passed or normalized
4. whether legacy-bridge behavior was preserved, tightened, or reduced
5. proof that recognition responsibility still stays outside this module
6. exact remaining boundary before `HbKudos`

## Explicit non-scope

- Do not embed `HbKudos` yet
- Do not modify `HbKudosCompanion`
- Do not modify `PeopleCultureCompanion` except for compile continuity strictly forced by the embed
- Do not broaden into unrelated People/Culture redesign

## Required verification / burden of proof

You must prove:

- `PeopleCulturePublic` now renders through the shell
- the public People/Kudos responsibility split still holds
- any bridge or context change is explicit, not accidental
- no legacy merged seam is silently reintroduced

## Required output artifact(s)

- `06-Embed-People-Culture-Public.md`

## Completion standard

This prompt is complete only when `PeopleCulturePublic` is shell-rendered cleanly and the split runtime boundary remains explicit and protected.


---


# Prompt Title

Prompt 07 — Embed HB Kudos and Close the Hardest Public Runtime Integration

## Objective

Embed `HbKudos` into `hb-homepage` without regressing its workflow richness, safety logic, recognition quality, or host-safe behavior.

## Why this prompt exists now

`HbKudos` is the highest-risk public module in this initiative. It carries:
- richer workflow behavior
- people search / photo behavior
- celebrate and feed/article interactions
- host-safe and assistant-safe concerns
- a clearer product identity than the simpler editorial modules

The original package acknowledged this but left the hardest decision vague: whether `HbKudos` needs an explicit embedded-shell contract. That decision must now be made concretely and proven.

## Current repo truth

You must inspect and preserve the runtime responsibilities already held by `HbKudos`, including the parts that should remain internal to that product runtime versus the parts that should yield to shell composition.

## Intended future state

At completion of this prompt:

- `HbKudos` renders inside `hb-homepage`
- the shell owns outer composition
- `HbKudos` keeps its internal recognition product logic
- any required embedded-shell mode/contract is explicit and justified
- the resulting composed surface remains premium and host-safe

## Research-informed technical considerations

Honor all previously locked realities:

- reuse existing shared dependencies and product layers where possible
- preserve reduced-motion and accessibility behavior
- preserve host-safe layout behavior
- do not accidentally widen scope into governance companion responsibilities

## Required implementation scope

Implement the integration and create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-03/07-Embed-HB-Kudos.md`

The note must include:

1. exact files changed
2. whether an explicit embedded-shell contract or mode was added
3. what shell-owned responsibilities changed
4. what `HbKudos` responsibilities remain internal
5. what behavior was intentionally preserved unchanged
6. what behavior was intentionally adapted for shell composition
7. residual risks, if any, before mount/packaging integration

## Explicit non-scope

- Do not broaden into `HbKudosCompanion`
- Do not redesign recognition governance flows beyond what shell integration strictly requires
- Do not modify unrelated homepage modules
- Do not edit packaging except for compile continuity forced by this prompt

## Required verification / burden of proof

You must prove:

- `HbKudos` now renders through `hb-homepage`
- composition ownership is shell-owned
- product behavior quality remains intact
- host-safe behavior remains intact
- any embedded-mode decision is explicit and justified

## Required output artifact(s)

- `07-Embed-HB-Kudos.md`

## Completion standard

This prompt is complete only when `HbKudos` renders inside the shell without losing product credibility and without continuing to own the page-canvas composition.


---


# Prompt Title

Prompt 08 — Mount, Runtime, Manifest, and Packaging Integration for HB Homepage

## Objective

Wire `hb-homepage` into the real `hb-webparts` runtime and packaging pipeline so it becomes a packaged, mounted, verifiable SPFx component without regressing existing packaged webparts.

## Why this prompt exists now

This is the most under-specified part of the original package. In this repo, packaging is not “add a manifest and run a build.” The live pipeline already has:

- Vite app bundles
- an SPFx shell project
- content-hashed bundles
- manifest handling
- multi-manifest shell-entry behavior
- `.sppkg` verification logic

A shallow packaging prompt is not safe here.

## Current repo truth

You must work from the current live implementation in:

- `apps/hb-webparts/src/mount.tsx`
- `tools/build-spfx-package.ts`

and respect:

- current GUID mapping patterns
- current shell-entry/runtime contract expectations
- manifest adjacency rules
- current no-regression behavior for existing webparts
- current packaging verification posture

## Intended future state

At completion of this prompt:

- `hb-homepage` is registered in runtime dispatch
- `hb-homepage` has correct manifest adjacency and identity
- `build-spfx-package.ts` includes it safely in the `hb-webparts` solution
- package generation proves the new component is present and correctly linked
- existing homepage/public webpart packaging is not broken by the addition

## Research-informed technical considerations

Honor the host reality and SPFx constraints already locked:

- if the manifest is full-width-capable, package and hosted proof must reflect that
- do not confuse workbench proof with hosted proof
- do not casually alter the repo’s custom React/Vite/SPFx shell strategy

## Required implementation scope

Implement the mount/runtime/package integration and create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-04/08-Mount-Runtime-Manifest-and-Packaging-Integration.md`

Implementation work must include:

1. register and render `hb-homepage` through the real runtime seam
2. confirm manifest ID, alias, and adjacency are correct
3. update packaging inputs as required
4. confirm the component is included in the resulting `hb-webparts` package
5. preserve existing packaged component integrity

The closure note must include:

- exact files changed
- runtime GUID mapping proof
- manifest proof
- packaging changes made
- build/package proof summary
- exact remaining boundary for hosted validation only

## Explicit non-scope

- Do not reopen earlier architecture decisions unless a real blocker is found
- Do not make unrelated packaging “cleanup” changes
- Do not break standalone existing homepage public webparts
- Do not claim hosted closure yet

## Required verification / burden of proof

You must prove:

- `mount.tsx` dispatch is correct
- manifest linkage is correct
- the package includes the new component
- no stale/legacy mapping was introduced
- existing package behavior remains intact

## Required output artifact(s)

- `08-Mount-Runtime-Manifest-and-Packaging-Integration.md`

## Completion standard

This prompt is complete only when `hb-homepage` is a real packaged `hb-webparts` component with verified runtime and package linkage.


---


# Prompt Title

Prompt 09 — Hosted Validation and Hard Closure for HB Homepage

## Objective

Perform final validation and close Phase 01 for `hb-homepage` with hard evidence.

## Why this prompt exists now

The original closure prompt allowed weak language such as “accepted limitations” and “follow-on opportunities.” That is not strong enough for a package intended to close a scoped initiative. This prompt forces a true closure posture: either the implementation is closed, or the only remaining gaps are external/environmental constraints outside prompt quality or code-agent effort.

## Current repo truth

By the time this prompt begins, the codebase should already contain:

- the `hb-homepage` host
- embedded target modules
- runtime dispatch registration
- package integration

This prompt exists to prove that those changes behave correctly in the real SharePoint-hosted context.

## Intended future state

At completion of this prompt:

- build/package proof exists
- runtime registration proof exists
- hosted SharePoint rendering proof exists
- shell ownership is visibly real
- `hbSignatureHero` is still independent
- the initiative is either closed or blocked only by external tenant/environment realities

## Research-informed technical considerations

Hosted validation must reflect actual host reality:

- full-width-capable behavior must be checked in a deployed communication-site context
- reduced-motion and focus behavior must be validated in the real host
- workbench-only validation is not enough if the host is expected to support full-width composition

## Required implementation scope

Create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-04/09-Hosted-Validation-and-Hard-Closure.md`

The final closure document must include:

1. implementation summary
2. exact files changed across the initiative
3. final runtime architecture
4. final packaging posture
5. final hosted validation evidence
6. proof that the absorbed modules render through `hb-homepage`
7. proof that `hbSignatureHero` remains independent
8. proof that shell layout ownership is real
9. explicit closure statement

If anything remains open, it must be listed only under:

`External / environmental constraints not solvable by this package`

## Explicit non-scope

- Do not reopen closed architecture without a real blocking defect
- Do not add unrelated enhancement work
- Do not convert this closure pass into a new redesign initiative
- Do not use speculative future work as a substitute for closure

## Required verification / burden of proof

You must prove:

- compile/build success
- package success
- runtime registration success
- hosted render success
- doctrine alignment
- motion/accessibility behavior
- hero independence
- shell ownership of composed layout

## Required output artifact(s)

- `09-Hosted-Validation-and-Hard-Closure.md`

## Completion standard

This prompt is complete only when a future reviewer can read the closure doc and conclude, without asking follow-up questions, that Phase 01 is closed except for any explicitly named external/environmental constraints.
