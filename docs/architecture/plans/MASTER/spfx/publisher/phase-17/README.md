# Publisher UI Remediation — Wave 02 (Enhanced Repo-Truth Package)

## Purpose

This package is the hardened, repo-truth rewrite of the current Wave 02 remediation package for the HB Publisher.

It keeps the original wave boundary — premium SPFx surface quality, doctrine compliance, visual/control-system uplift, CSS maintainability, import-governance cleanup, and final proof-of-closure — but rewrites the work so a local code agent can execute it with less ambiguity and fewer hidden dependencies.

## What changed from the prior Wave 02 package

The prior package was directionally correct, but too coarse in several places:

- premium-stack adoption was bundled too broadly
- owned overlay seams were not isolated as their own closure unit
- control-language uplift and iconography cleanup were mixed together with stack adoption
- CSS responsibility narrowing was under-specified
- naming / lineage cleanup omitted some live user-facing and package-facing copy
- final proof prompt needed stricter closure artifacts

This package fixes that by splitting and reordering the work.

## Package contents

- `Plan-Summary.md`
- `Prompt-01-Establish-premium-stack-foundation-and-owned-primitives.md`
- `Prompt-02-Rebuild-owned-anchored-overlays-and-popup-seams.md`
- `Prompt-03-Elevate-control-language-iconography-and-action-affordances.md`
- `Prompt-04-Finish-token-provenance-css-localization-and-shell-cleanup.md`
- `Prompt-05-Close-ui-kit-entry-point-and-import-discipline-drift.md`
- `Prompt-06-Clean-up-product-scope-naming-and-lineage-drift.md`
- `Prompt-07-Prove-final-closure-with-build-package-and-hosted-validation.md`

## Wave boundary

Wave 02 is still a narrowed wave.

It is **not** a broad Publisher redesign wave.
It is **not** a backlog capture wave.
It is **not** permission to reopen already-closed Wave 01 workflow fixes unless the seam is directly coupled to a Wave 02 closure item.

What **is** in scope:

- approved premium-stack adoption where it materially improves the Publisher
- overlay / dropdown / asset-browser / popup seams the Publisher actually owns
- stronger control-system language and iconography
- retirement of remaining pseudo-icon / text-symbol affordances where a real icon system is expected
- CSS responsibility cleanup and token-discipline hardening
- import-governance closure
- product-truth / naming / lineage cleanup
- explicit build / package / hosted proof

## Operating posture for the local code agent

1. Work only against the live local repo.
2. Treat the live repo as implementation truth.
3. Exhaustively inspect every named file and directly coupled seam before changing code.
4. Do not re-read files already in active context unless needed to confirm drift, dependencies, contradictions, or uncertainty.
5. Do not make unrelated changes.
6. Do not defer real Wave 02 work into future prompts.
7. Prove closure before moving to the next prompt.
8. If a prompt reveals a directly-coupled defect that prevents honest closure, fix it within the same prompt and document why it was required.

## Required quality bar

The end state must be:

- visibly more premium
- host-safe for SPFx
- accessible
- internally more coherent
- easier to evolve
- cleaner in narrative truth
- fully buildable and packageable
- accompanied by proof, not assertions
