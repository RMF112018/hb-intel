# Prompt 07 — Clean up naming, host-context, and rebranding drift

## Objective

Remove misleading naming, host-context, and narrative drift that no longer reflects the current Article Publisher product reality, while preserving any runtime lineage that must stay stable.

## Why this issue matters

The repo already completed the major rebrand from the narrower Project Spotlight Publisher identity to Article Publisher, and it correctly preserved the stable SPFx GUID/runtime lineage.

But closure is not just about runtime identity. It is also about current implementation narrative. When comments, descriptions, or packaged manifests continue to frame the product as “current sprint / future sprint” scaffolding, the codebase reads like an in-progress temporary state rather than a product with an intentional current truth.

## Current repo-truth problem state

The narrowed audit found that drift still spans multiple layers:

- source comments in `ArticlePublisher.tsx`
- manifest description language in `ArticlePublisherWebPart.manifest.json`
- runtime-lineage commentary in `runtimeContract.ts`
- packaged release-manifest surfaces under `tools/spfx-shell/release/manifests/`
- repo-local docs/comments that may still describe outdated host assumptions or temporary sprint framing

Some historical references are valid historical records and should remain. Others are current-source narrative and should be updated.

## Intended future state

The current-source narrative should describe the product truthfully and presently:

- it is the Article Publisher
- it currently supports the shipped destination model that the code actually implements
- it is hosted on the HBCentral publisher page / SharePoint host context as the current repo truth defines
- it preserves stable runtime lineage where required

The codebase should not sound like a temporary rename that never fully settled.

## Governing authority / required reference docs

- `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `tools/spfx-shell/release/manifests/1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10.manifest.json`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/publisher-rebranding-report.md`
- this package’s `Validation-Strategy.md`

## Exact repo files and seams to inspect

At minimum inspect:

- `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `tools/spfx-shell/release/manifests/1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10.manifest.json`
- any current-source Publisher docs/comments whose wording is now misleading
- any tests or fixtures whose names/comments are no longer just historically descriptive but actively misleading

## Required implementation outcome

- Scrub misleading current-source narrative and description drift.
- Preserve required runtime lineage, stable IDs, and intentionally retained historical references.
- Update current source/manifests/comments so they describe present product truth, not temporary sprint framing.
- Do **not** rewrite frozen historical evidence solely to make history look current.
- Do **not** change the stable webpart GUID or other lineage-critical runtime identifiers.

## Validation / proof-of-closure requirements

Prove all of the following:

- current-source comments/descriptions no longer materially misdescribe the product or host context
- manifest/release-manifest wording aligns with current product truth
- stable runtime identifiers were preserved
- no build/package/runtime linkage was broken by the cleanup
- the distinction between historical records vs current-source narrative was handled intentionally

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-02-naming-and-host-context-drift-closure.md`

Document:

- which wording changed and why
- which historical references were preserved intentionally
- confirmation that stable runtime lineage was not altered
- any packaging/build verification performed

## Required working method

Before you edit anything:

1. Scrub the narrative and manifest seam fully.
2. Verify drift in source comments, manifest wording, release-manifest wording, and lineage-critical IDs.
3. Do **not** re-read files still in active context unless needed to confirm drift or uncertainty after changes.
4. Preserve runtime lineage.
5. Prove closure before finishing the wave.

## Explicit instruction not to make unrelated changes

Do not turn this into a functional behavior change prompt. Keep the work bounded to naming, host-context, manifest narrative, and rebranding/lineage drift.
