# Repo-Truth and Research Findings

## Repo-truth findings that materially change the package

### 1. The current homepage runtime is already a rich dispatcher, not a blank slate

The live `apps/hb-webparts/src/mount.tsx` is already a broad runtime dispatch seam that:
- wraps rendering in `HbcThemeProvider`
- dispatches many homepage and adjacent webparts by GUID
- already contains split runtime handling for `PeopleCulturePublic`, `PeopleCultureCompanion`, `HbKudos`, `HbKudosCompanion`, `TeamViewer`, `HbSignatureHero`, `HbHeroBannerAdmin`, and `PnpOps`
- already generates token providers and passes identity/site/page context into renderers

That means `hb-homepage` is not being introduced into a simple one-webpart runtime. It is being added to a mature, sensitive dispatcher and cannot be planned as though the rest of the runtime is disposable.

### 2. The reference homepage composition already exists, but only as a reference path

`apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` already demonstrates a canonical five-zone homepage composition and explicitly says it is not the production rendering path. That file is a real design/composition authority, but it is not itself proof that an orchestrator webpart exists.

### 3. The target public modules are already thin consumers over shared homepage surface families

The current repo is materially farther along than the original prompt package explains:
- `CompanyPulse`
- `LeadershipMessage`
- `ProjectPortfolioSpotlight`

are already thin integration consumers built on shared `@hbc/ui-kit/homepage` surface families. `PeopleCulturePublic` and `HbKudos` remain more product-specific, but they are still already mature runtimes, not raw local experiments.

This changes the implementation burden:
- Phase 01 should focus more on shell composition, embedded-mode contracts, layout ownership, and safe integration
- and less on reinventing the internal presentation systems of those modules.

### 4. The People/Kudos domain is already split and carries compatibility seams

The repo already retired the legacy merged public seam in runtime comments and routes consumers to split surfaces (`PeopleCulturePublic` and `HbKudos`) with companion/admin/runtime boundaries. The upgraded package must preserve that separation and must not allow `hb-homepage` to blur it.

### 5. The packaging pipeline is already custom and high-risk

`tools/build-spfx-package.ts` is not a trivial build wrapper. It already:
- uses a Vite build for domain bundles
- copies bundles into an SPFx shell project
- content-hashes app assets
- preserves/rewrites manifest relationships
- uses per-webpart shell entry shims for multi-manifest packaging
- verifies `.sppkg` structure and asset freshness
- explicitly runs the shell build with Node 18 for SPFx compatibility

This means Prompt 07 in the original package is materially underpowered.

### 6. The doctrine stack is already present centrally, not missing locally

The governing doctrine approves a premium stack including:
- `motion`
- `lucide-react`
- `@floating-ui/react`
- Radix packages
- `class-variance-authority`
- `clsx`

The live repo already carries those in `packages/ui-kit/package.json`. Phase 01 therefore should generally consume existing `@hbc/ui-kit/homepage` exports and avoid reflexively adding direct dependencies to `apps/hb-webparts` unless the implementation proves that direct package-level access is actually necessary.

## Research findings that materially shape the rewrite

### 1. Full-width support is explicit and host-constrained

Microsoft’s SharePoint Framework guidance says custom webparts must explicitly set `supportsFullBleed: true` in the manifest to be placeable in a full-width column, and that this must be tested on a deployed communication site because the SharePoint workbench does not validate full-width behavior. The same guidance also notes the full-width column is a communication-site capability rather than a generic page canvas assumption. Therefore the rewritten package now forces:
- explicit manifest intent for any orchestrator meant to be full-width-capable
- hosted validation on a communication site
- no “workbench-only” closure claim for full-width behavior.

### 2. SPFx 1.20’s official compatibility matrix still centers React 17 and Node 18

Microsoft’s compatibility reference for SPFx lists version 1.20 with Node 18 and React 17.0.1. The live repo’s `apps/hb-webparts` package is instead built as a Vite-authored React 18 app that is then packaged through a custom SPFx shell pipeline. That does not automatically make the repo wrong, but it does mean the code agent must not naively “normalize” the package back to generator-style SPFx assumptions during Phase 01. The package must preserve the repo’s proven runtime model unless the prompt explicitly instructs a broader packaging/compatibility refactor.

### 3. Reduced-motion handling should be a hard implementation burden, not a soft reminder

W3C Technique C39 and the understanding guidance for WCAG 2.3.3 tie interaction-triggered motion to user motion sensitivity and recommend honoring `prefers-reduced-motion`. Because the governing doctrine also explicitly requires reduced-motion support, the rewritten prompts now require proof that shell-level and embedded transitions respect reduced-motion behavior rather than merely mentioning animation quality.

### 4. The approved premium stack is mature and widely adopted

The governing doctrine’s preferred packages are established, actively maintained, and commonly used. That supports the doctrine itself. But because the repo already centralizes those dependencies in `@hbc/ui-kit`, the practical Phase 01 conclusion is not “install them again”; it is “reuse the already-governed stack from the shared package first.”

## Resulting rewrite posture

The upgraded package is written around these truths:

- `hb-homepage` is an additive first-class homepage webpart, not a destructive rewrite of the dispatcher
- the package must preserve current runtime and packaging stability
- the package must reuse current shared surface families and governed stack where possible
- the package must prove hosted SharePoint behavior, especially for full-width-capable composition
- the package must close with a hard execution standard and leave only true external constraints open
