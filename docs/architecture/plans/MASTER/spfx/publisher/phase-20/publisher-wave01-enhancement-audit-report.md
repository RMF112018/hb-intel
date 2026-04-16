# HB: Publisher Wave 01 Package Enhancement Audit Report

## Phase 1 — Framing

### Objective

Conduct a narrowed, granularly exhaustive, repo-truth audit of the attached Wave 01 remediation package and produce a materially stronger, more detailed, and more execution-ready replacement package for a local code agent.

### Source-of-truth posture

- the attached objective prompt is the governing task definition
- the attached Wave 01 zip is the starting package under audit, not truth
- the live `main` branch under `apps/hb-publisher` and adjacent shared seams is implementation truth
- the attached SPFx doctrine files govern host-fit and product-quality expectations for this work

### Narrowed audit posture

This is not a broad product audit.
It is a package-enhancement audit for the current Wave 01 domain:

- governed asset acquisition live wiring
- authoritative project identity hardening
- safe burden-reducing defaults and first-draft assistance
- first-pass friction reduction without shell reinvention
- closure proof

### No-deferral requirement

The strengthened package was written as a full Wave 01 closure package for the real in-scope gaps. No meaningful known in-scope work is deferred merely because it is inconvenient.

## Phase 2 — Current Wave 01 package map

### Existing prompt inventory

The attached package contains:

1. Prompt 01 — wire governed asset acquisition end-to-end
2. Prompt 02 — harden project identity into an authoritative contract
3. Prompt 03 — expand intelligent defaults and first-draft assistance
4. Prompt 04 — reduce first-pass friction without reinventing the shell
5. Prompt 05 — prove wave closure with build and runtime focused reporting

### What the current package gets right

- it is correctly narrowed to the most important forward-state gaps
- it correctly preserves the current shell rather than calling for a broad redesign
- it correctly treats Project Spotlight-only runtime scope as current truth
- it correctly identifies authoritative project identity and governed asset acquisition as high-value work

### Where the current package is weak

- Prompt 01 is under-scoped at the provider/runtime seam; it treats provider creation and runtime threading as one soft task instead of two explicit closure units
- Prompt 02 is not forceful enough about the repo's own GUID-binding doctrine and central contract patterns
- Prompt 03 does not specify a strong enough distinction between system-owned blank-state behavior and author-owned values
- Prompt 04 is too general and could degrade into a vague UX cleanup pass
- Prompt 05 does not require enough hosted-runtime and package-truth evidence

## Phase 3 — Repo-truth delta audit

### Prompt 01 cluster — governed asset acquisition

#### Repo truth confirmed

- `ArticlePublisher.tsx` accepts optional `searchAssets` and passes it into hero, secondary-image, and gallery/media surfaces
- `ImageAssetField.tsx` and `MediaComposer.tsx` are already designed so governed browse becomes primary when `searchAssets` exists
- `AssetLibraryBrowser.tsx` is already a real, productized overlay surface with keyboard and focus handling
- `mount.tsx` does **not** currently pass `searchAssets` into `ArticlePublisher`
- no concrete provider was found in repo truth behind `AssetLibrarySearchFn`

#### Delta judgment

The prior prompt correctly identified the gap, but it was too shallow.
This is not just “wire a prop”. The repo shows two real closure units:

1. implement/confirm the concrete provider
2. wire it through the real hosted runtime and all relevant authoring surfaces

#### Enhancement decision

Split Prompt 01 into two prompts.

### Prompt 02 cluster — project identity

#### Repo truth confirmed

- `ProjectPicker.tsx` is already a strong author-facing combobox surface and should be preserved
- `projectsLookupSource.ts` still binds via `getbytitle('Projects')` and maps `field_1`..`field_4`
- `packages/sharepoint-platform/src/listDescriptor.ts` explicitly encodes the repo's GUID-binding posture
- backend `projects-list-contract.ts` already centralizes a stronger Projects list contract on the backend side

#### Delta judgment

The prior prompt was directionally right but not specific enough.
It needed to anchor directly to the repo's own authoritative binding and contract seams, and it needed stronger proof requirements around test coverage and drift handling.

#### Enhancement decision

Retain Prompt 02, but materially strengthen it.

### Prompt 03 cluster — defaults and first-draft assistance

#### Repo truth confirmed

- current intelligent defaults are limited mainly to `TeamViewerTitle` and `HeroCategoryLabel`
- save-time defaulting is wired through `useDraftLifecycle.ts`
- `MetadataPanel.tsx` already performs opportunistic fill for team heading on project selection, but the assistance surface is still narrow

#### Delta judgment

The prior prompt named the right problem but did not define safe-defaulting posture strongly enough. It needed clearer guidance on system-owned versus author-owned values and stronger test expectations around project changes and override preservation.

#### Enhancement decision

Retain Prompt 03, but materially strengthen it.

### Prompt 04 cluster — first-pass friction

#### Repo truth confirmed

- the current shell is already structurally strong and should not be broadly redesigned
- the first-pass path is better than before, but some ordinary workflow still depends on helper narration rather than product behavior
- advanced/disclosure structure in Metadata/Hero/Story is already present and should be refined carefully, not torn down

#### Delta judgment

The prior prompt was too broad and could easily become a superficial cleanup pass. It needed to be repositioned as a post-defaulting behavioral refinement prompt, not a generic UI pass.

#### Enhancement decision

Retain Prompt 04, but materially strengthen and narrow it.

### Prompt 05 cluster — closure proof

#### Repo truth confirmed

- `apps/hb-publisher/package.json` defines focused build/type/test commands
- `tools/build-spfx-package.ts` and `apps/hb-publisher/deployment/README.md` already define stronger packaging and hosted-runtime proof seams for `hb-publisher`
- the Publisher domain has named output artifacts in `dist/sppkg/` that can and should be part of closure evidence

#### Delta judgment

The prior closure prompt was too generic. Repo truth already supports stronger closure proof than “run build/test and summarize”.

#### Enhancement decision

Retain the closure unit but rewrite it as a stricter hosted-runtime/package-truth evidence prompt.

## Phase 4 — Enhancement decision register

### Existing prompt 01

- decision: **replace with split prompts**
- replacement:
  - Prompt 01 — implement a concrete governed asset-library provider
  - Prompt 02 — wire governed asset acquisition through mount and all image surfaces

### Existing prompt 02

- decision: **retain and strengthen**
- new focus: GUID-bound contract posture, centralized field mapping, stronger drift and test requirements

### Existing prompt 03

- decision: **retain and strengthen**
- new focus: safe-defaulting standard, author-override preservation, project-change behavior, stronger tests

### Existing prompt 04

- decision: **retain and strengthen**
- new focus: first-pass workflow refinement after defaults land, not shell redesign

### Existing prompt 05

- decision: **retain but rewrite more forcefully**
- new focus: hosted runtime proof, package-truth artifacts, explicit residuals

### Net-new prompts

One net-new prompt was added by splitting the asset-governance work into two real closure units.

### Prompts not added

No Wave 01 prompt was added for broad story-editor expansion or destination expansion. Repo truth and the attached audit package both indicate those belong outside current Wave 01 closure scope.

## Phase 5 — Enhanced Wave 01 remediation strategy

### Recommended final structure

1. concrete governed asset provider
2. runtime/provider threading through mount and all image surfaces
3. authoritative project lookup hardening
4. safe project-aware defaults and assistance
5. first-pass friction reduction through behavior, not shell redesign
6. hosted-runtime and package-truth closure proof

### Sequencing logic

The sequence intentionally resolves the hardest truth seams first:

- asset provider before asset wiring
- project contract before heavier project-derived assistance
- defaults before friction cleanup
- closure proof only after runtime/data/behavior changes are in place

### Package-level README and summary changes

The enhanced package README and Plan Summary were rewritten to:

- explain why Prompt 01 was split
- lock Project Spotlight-only present-state scope
- lock preservation of the current shell and trust/readiness strengths
- make the closure standard more explicit
- make package ordering and non-goals much clearer

## Phase 6 — Generated enhanced prompt package

The enhanced package generated by this audit contains:

- `README.md`
- `Plan-Summary.md`
- `Prompt-01-Implement-a-concrete-governed-asset-library-provider.md`
- `Prompt-02-Wire-governed-asset-acquisition-through-mount-and-all-image-surfaces.md`
- `Prompt-03-Harden-project-lookup-onto-a-guid-bound-authoritative-contract.md`
- `Prompt-04-Expand-safe-project-aware-defaults-and-first-draft-assistance.md`
- `Prompt-05-Reduce-first-pass-friction-by-converting-helper-copy-into-product-behavior.md`
- `Prompt-06-Prove-wave-01-closure-with-hosted-runtime-and-package-truth-reporting.md`

## Final verdict

The original Wave 01 package was fundamentally pointed at the right problems.
It was not yet strong enough to be considered execution-grade.

The enhanced package corrects that by:

- splitting the most under-scoped closure unit
- grounding the prompts more directly in repo-truth seams
- tightening implementation direction
- tightening closure-proof requirements
- preserving the current shell and trust-loop strengths rather than destabilizing them
