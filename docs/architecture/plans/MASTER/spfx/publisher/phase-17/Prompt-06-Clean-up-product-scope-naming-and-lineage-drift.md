# Prompt 06 — Clean up product-scope, naming, and lineage drift

## Objective

Scrub the remaining narrative drift in the Publisher so developer-facing and package-facing language reflects the **current live product truth** while still preserving the deployment-lineage facts that genuinely matter.

## Why this issue matters

Repo truth shows a mixed narrative state:

- some lineage commentary is correct and necessary, especially around the preserved webpart identity
- other copy still over-emphasizes future destinations, older packaging history, or transitional wording
- current-scope truth is still “Project Spotlight only” in the live implementation, even though broader product language appears in some surfaces

That is precisely the kind of conceptual drift that confuses the next engineer and weakens closure confidence.

## Governing authority / required references

- live repo implementation under `apps/hb-publisher/`
- runtime and manifest identity seams that must remain stable
- the narrowed Wave 02 boundary — do not use this prompt to start unsupported destination expansion

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-publisher/config/package-solution.json`
- `apps/hb-publisher/src/data/publisherAdapter/publisherListDescriptors.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.ts`
- any other user-visible or developer-facing copy under `apps/hb-publisher/` that materially shapes understanding of supported scope, runtime identity, or lineage

## Current-state problem description

The current package treated this mainly as a runtime-contract and manifest cleanup issue.
Repo truth shows it is broader than that:

- runtime identity commentary should stay precise
- manifest and package descriptions should not overstate future scope or preserve stale transitional narration
- current supported destination scope should be narrated consistently
- the next engineer should not have to infer which “Article Publisher” language is live truth versus aspiration

## Required implementation outcome

Scrub naming and lineage language so it is precise, minimal, and truthful.

The result must:

1. preserve the stable webpart GUID and any necessary deployment-lineage facts
2. remove avoidable or overly-prominent historical wording that no longer helps
3. align package, manifest, and developer-facing copy with the current live supported scope
4. avoid reopening destination expansion that is outside this narrowed wave

Preferred posture:
- make it clear that the product is an Article Publisher surface whose **current live supported publishing scope** is Project Spotlight
- preserve future-scope possibility only where it is genuinely useful and does not obscure current truth

## Dependencies / cross-surface considerations

Do not break:

- runtime identity
- manifest expectations
- packaging semantics
- hard-coded list or site truth
- author-facing terminology that is already correct and governed

Be especially careful not to remove necessary lineage comments that prevent accidental GUID churn or deployment mistakes.

## Validation / proof-of-closure requirements

Prove all of the following:

- necessary lineage facts are still preserved
- unnecessary conceptual clutter is removed
- current supported scope is clearer than before
- package / manifest / runtime commentary no longer disagree in meaning

Also produce a closure note that explicitly states:

- the final supported-scope sentence for the live Publisher
- the lineage facts intentionally preserved
- which old narrative phrases were removed or rewritten and why

## Deliverables / closure artifacts

Produce all code, tests, and documentation updates required for full closure of this prompt.
Also produce a concise closure note that records:

- what changed
- what was validated
- what directly-coupled issues had to be closed to finish honestly
- any remaining assumptions that are still materially relevant

## Non-negotiable change-control rule

Do **not** make unrelated changes.
Do **not** widen scope beyond what is necessary for honest closure of this prompt.
If you touch a directly-coupled seam, explain why it was necessary.
Do **not** move on until you can prove closure.
