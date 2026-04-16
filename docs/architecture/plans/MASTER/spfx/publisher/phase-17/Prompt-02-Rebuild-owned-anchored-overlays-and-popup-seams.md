# Prompt 02 — Rebuild owned anchored overlays and popup seams

## Objective

Close the owned-overlay portion of Wave 02 by rebuilding the Publisher seams that should actually benefit from anchored positioning, better popup ergonomics, and more premium interaction treatment.

This prompt is where the Publisher proves real use of its overlay stack.
It should not remain on ad hoc absolute-positioned dropdowns and modal-like browser overlays where a more robust owned solution is warranted.

## Why this issue matters

The current Wave 02 package says the premium stack should be used where it materially improves overlays and anchored panels, but repo truth shows that the Publisher still owns several interaction surfaces that remain conservative:

- the project picker result popup
- the asset library browser / result browsing surface
- ancillary popup-like interaction rows tied to editing controls
- supporting list/grid overflow behavior that should feel more deliberate and resilient

If these seams are not rebuilt explicitly, Wave 02 cannot honestly claim stack adoption or premium interaction closure.

## Governing authority / required references

- live repo implementation under `apps/hb-publisher/`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` — only where homepage-derived primitives materially affect the Publisher
- APG / WAI-ARIA guidance for combobox, toolbar, dialog, roving tabindex, and accessible popup behavior
- Floating UI official React guidance
- Radix primitive docs for tooltip / slot / scroll-area where used

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/AssetLibraryBrowser.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/assetLibraryBrowser.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorToolbar.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/MediaComposer.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- any helper or CSS module directly coupled to those surfaces

Before editing, exhaustively inspect the affected path and all directly-coupled seams.

## Current-state problem description

Repo truth shows:

- `ProjectPicker.tsx` still relies on a hand-built absolutely positioned dropdown
- `AssetLibraryBrowser.tsx` is functional and accessible in broad strokes, but still uses a conservative in-app dialog/grid treatment rather than a more deliberately premium browsing experience
- popup interaction and result-browsing behavior remain more utilitarian than productized
- overflow, focus movement, anchored placement, and motion semantics are not yet standardized around the newly-approved stack

## Required implementation outcome

Rebuild the Publisher-owned popup / overlay seams so they are structurally stronger and visibly more premium.

At minimum:

1. choose which owned surfaces should become anchored overlays versus remain full dialogs
2. use `@floating-ui/react` where anchored positioning is the right answer
3. use `motion` for restrained open/close and state transitions where it adds clarity
4. use `@radix-ui/react-scroll-area` where polished overflow materially improves the browsing experience
5. use `@radix-ui/react-tooltip` only where compact icon or action affordances genuinely need clarification
6. preserve or improve keyboard behavior, focus return, screen-reader announcement quality, and escape / dismiss semantics

Specific expectations:

- the ProjectPicker popup should feel like a governed product surface, not an improvised dropdown
- the asset-browser result area should feel more deliberate, browseable, and premium
- any popup-like authoring affordance touched here should have a clear open/close contract and focus behavior

## Dependencies / cross-surface considerations

This prompt depends on Prompt 01 being closed first.

Do not rewrite `HbcKudosComposerFlyout` or unrelated UI-kit internals unless repo truth proves that a directly-coupled bug inside the local Publisher seam prevents closure.
Default posture: improve the Publisher-owned seams around those flyouts rather than reopening shared UI-kit surfaces.

Do not break:

- combobox semantics in `ProjectPicker`
- keyboard reachability in the asset browser
- authoring flow continuity when dialogs close
- light-theme / SPFx host-safe posture

## Validation / proof-of-closure requirements

Prove all of the following:

- every owned overlay seam touched by this prompt has a clearer structure and interaction model than before
- anchored surfaces remain correctly positioned during scrolling / resizing where applicable
- focus enters, moves within, and exits the rebuilt surfaces correctly
- escape / dismiss behavior is reliable
- any tooltip or micro-help added is keyboard reachable and not hover-only
- the result is more premium without becoming theatrically animated or brittle

Also document:

- which surfaces were intentionally rebuilt
- which surfaces were intentionally left alone and why
- how focus return and dismissal were verified

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
