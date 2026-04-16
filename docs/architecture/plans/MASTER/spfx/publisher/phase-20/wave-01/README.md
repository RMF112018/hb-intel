# Publisher Wave 01 — Enhanced Remediation Prompt Package

This package is the strengthened execution package for **Wave 01** of the Publisher end-state remediation effort.

It is written for a local code agent working against the live `main` branch of `RMF112018/hb-intel`.

## Package purpose

Close the real Wave 01 gaps that still prevent the Publisher from being fully low-friction, governed, authoritative, and credibly production-ready in its **supported Project Spotlight runtime**.

This package is not a planning artifact.
It is not a light rewrite of the prior package.
It is an execution package intended to let the code agent close Wave 01 with materially stronger precision, coverage, and closure proof.

## What changed from the prior package

The prior five-prompt package was directionally right, but still too soft in several places:

- the governed asset-acquisition work was under-scoped at the runtime/provider boundary
- the project lookup hardening prompt did not anchor strongly enough to the repo's own GUID-binding doctrine and contract seams
- the defaults/assistance prompt did not specify enough guardrails for safe system-owned behavior versus author-owned values
- the first-pass friction prompt was too general and risked becoming a vague UX cleanup pass
- the closure-proof prompt did not explicitly require hosted-runtime and package-truth evidence

This enhanced package addresses those weaknesses.

## Final prompt structure

1. `Prompt-01-Implement-a-concrete-governed-asset-library-provider.md`
2. `Prompt-02-Wire-governed-asset-acquisition-through-mount-and-all-image-surfaces.md`
3. `Prompt-03-Harden-project-lookup-onto-a-guid-bound-authoritative-contract.md`
4. `Prompt-04-Expand-safe-project-aware-defaults-and-first-draft-assistance.md`
5. `Prompt-05-Reduce-first-pass-friction-by-converting-helper-copy-into-product-behavior.md`
6. `Prompt-06-Prove-wave-01-closure-with-hosted-runtime-and-package-truth-reporting.md`

## Why Prompt 01 was split

Repo truth shows that the asset-governance gap is not one problem but two coupled closure units:

1. there is no proven live **concrete asset provider** behind `AssetLibrarySearchFn`
2. the live SPFx mount/runtime path does not currently thread a `searchAssets` provider into `ArticlePublisher`

Those are related, but they are not the same task. Splitting them makes the implementation order, proof burden, and failure handling much clearer.

## Locked Wave 01 posture

The code agent must preserve these truths while executing this package:

- current supported destination scope is **Project Spotlight only**
- the current three-region shell is a strength and must not be casually redesigned
- the current readiness / save-trust / preview-trust model is a strength and must not be weakened
- project binding must remain a governed picker experience, not regress to manual free-text identity entry
- slug governance remains system-managed
- advanced editorial work that belongs in a later wave must not be smuggled into Wave 01 unless it is directly required to close a real Wave 01 gap

## General rules for every prompt

- use `main` branch repo truth only
- verify all file paths, seams, symbols, and contracts against the live repo before changing them
- do not preserve weak behavior merely because it already exists
- do not create recommendation-only output where implementation-grade closure work is required
- do not defer meaningful in-scope work to later prompts or later waves
- do not re-read files still in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- keep unrelated changes out of scope

## Closure standard

Wave 01 is only closed when all of the following are true:

- governed asset acquisition is real in the supported hosted runtime, not merely latent in component props
- the project lookup is materially more authoritative and resilient than the current title-bound/generic-field seam
- first-pass authoring requires less repetitive setup work from the author
- ordinary first-pass workflow depends less on helper narration and more on product behavior
- hosted runtime, build, package, and proof artifacts all confirm the supported Project Spotlight path remains stable
