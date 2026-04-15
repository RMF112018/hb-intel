# Publisher UI Remediation — Wave 01 (Enhanced)

## Purpose

This package is the **repo-truth-enhanced full-closure Wave 01 package** for the live `apps/hb-publisher/` implementation on `main` in `RMF112018/hb-intel`.

It is written for a local code agent.

It does **not** assume the prior Wave 01 package was wrong in every respect.
It does assume the prior package was still **too coarse**, **too willing to group distinct closure units together**, and **not explicit enough about several dependencies that matter to honest Wave 01 closure**.

## What changed relative to the prior Wave 01 package

This enhanced package:
- keeps the foundational project-binding truth item, but strengthens it with exact search-contract closure requirements
- rewrites guided authoring to focus on the actual first-pass compose path instead of a vague “guided mode” concept
- **splits preview/readiness closure into two distinct prompts**:
  - preview truth and saved-vs-working-copy confidence
  - readiness / publish diagnostics / next-action clarity
- keeps story-authoring work, but narrows it to the real remaining ergonomic gaps instead of re-solving already-closed rich-text basics
- **splits team and media composition into separate closure units** so the agent can close each seam precisely
- **adds a dedicated queue-momentum prompt** because the queue is still more of an inventory rail than a publishing-throughput tool
- strengthens current-scope identity/destination truth closure so the runtime no longer over-implies supported destinations
- adds a **final Wave 01 proof prompt** so closure is demonstrated, not assumed

## Scope

Wave 01 is about **adoption, workflow quality, product truth, and confidence before publish**.

It is **not** the wave for:
- broad premium-stack rollout across the Publisher
- generalized visual-language replacement everywhere
- doctrine-polish sweeps that do not materially affect author adoption
- speculative multi-destination platform expansion beyond what is necessary to make the current release truthful

## Package contents

- `Plan-Summary.md`
- `Prompt-01-Close-project-binding-truthfulness-and-picker-search.md`
- `Prompt-02-Recompose-the-first-pass-authoring-path.md`
- `Prompt-03-Close-preview-source-of-truth-and-working-copy-confidence.md`
- `Prompt-04-Strengthen-readiness-publish-diagnostics-and-next-action-clarity.md`
- `Prompt-05-Upgrade-story-authoring-ergonomics-within-the-governed-schema.md`
- `Prompt-06-Refine-team-composition-flow.md`
- `Prompt-07-Refine-media-composition-flow.md`
- `Prompt-08-Upgrade-the-queue-from-inventory-rail-to-momentum-tool.md`
- `Prompt-09-Clean-up-current-scope-product-identity-and-destination-truth.md`
- `Prompt-10-Prove-wave-01-closure-end-to-end.md`

## Operating rules for the local code agent

Every prompt in this package assumes the following:

1. work only against the live local repo that mirrors `main`
2. inspect the exact files and seams named in the prompt before editing
3. scrub the full affected code path, not just the first visible file
4. do **not** re-read files already in active context unless needed to confirm drift, dependencies, contradictions, or uncertainty after new findings
5. do **not** make unrelated changes
6. do **not** defer meaningful closure work that belongs in Wave 01
7. prove closure before moving to the next prompt

## Closure posture

This is a **full-closure package**, not a planning artifact.

If a dependency is necessary to honestly close one of these Wave 01 items, resolve it inside the appropriate prompt.
Do not preserve hidden defects by labeling them “future work” when they are materially required for closure now.
