# Wave 02 plan summary — structural rebuild framing

## Goal
Remove the remaining “I have to work around the tool” behaviors by **rebuilding the weak seams**, not by lightly improving them.

## Repo-truth framing
The live repo already contains meaningful Wave 01 and partial Wave 02 closure work:
- the Publisher already has a three-zone shell (`ArticlePublisher.tsx`)
- the story body already uses a TipTap-based editor (`StoryBodyEditor.tsx`)
- preview and readiness diagnostics already exist (`ArticlePreview.tsx`, `PublishReadinessDiagnostics.tsx`)
- media authoring already has distinct single-image and gallery seams (`ImageAssetField.tsx`, `GalleryPanel.tsx`, `MediaComposer.tsx`)

The remaining work is therefore **not** “add basic capability.”

It is to replace the still-underperforming author interaction models with durable, governed, closure-grade versions.

## Closure units
1. Rebuild single-image acquisition so hero / secondary media are no longer URL-first authoring seams.
2. Rebuild gallery/supporting-image acquisition so the visual-media workflow is governed end-to-end.
3. Rebuild local draft resilience so autosave, dirty-state truth, and recovery are explicit and trustworthy.
4. Rebuild navigation-loss protection and save-state signaling so authors are not left to manually defend their work.
5. Rebuild the story editor into an editorial-grade composition tool, not just a technically-valid rich text control.
6. Rebuild the preview/guidance trust bridge so more corrective understanding lives where the author is actually working.
7. Close final accessibility, instance-safety, host-fit, and token-discipline gaps in the touched seams.
8. Run a bounded wave-level regression and closure evidence pass.

## Definition of done
Wave 02 is complete only when authors no longer have to:
- paste raw image URLs as the normal path for media authoring
- manually defend against lost work
- guess whether draft state is only local, durably saved, pending, or failed
- rely on the readiness rail alone to understand what to fix next

## Non-goals
- broad re-audit of the whole application
- re-litigation of closed Wave 01 shell decisions without direct dependency
- unrelated architecture cleanup outside the touched seams
