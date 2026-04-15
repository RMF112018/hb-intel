# Wave 02 Plan Summary

## Objective

Close the remaining high-value UX, editorial-authoring, selector/accessibility, metadata-disclosure, and narrative-drift issues that still materially affect the Article Publisher after the Wave 01 shell and surface rebuild.

This wave is not about broad new architecture. It is about **finishing the live product properly** where the current repo already contains partial solutions, under-closed seams, or still-visible friction.

## Repo-truth findings that drove this enhanced package

The live repo already contains substantial Wave 02 progress:

- centralized author label governance in `authorLabels.ts`
- a real searchable `ProjectPicker`
- a TipTap-based story editor with governed schema and paste sanitization
- intelligent metadata defaults in `metadataDefaults.ts`
- a section-based authoring canvas and readiness rail in `ArticlePublisher.tsx`
- readiness diagnostics already split into their own surface
- a stable Article Publisher identity and preserved SPFx lineage

That progress is real, but it is not the same as closure.

The narrowed audit found that the remaining gaps are now more specific than the attached package described.

### Examples of under-scoped closure work

- `ChooserGroup.tsx` renders radio-like controls with `role="radio"`, but it does not implement the keyboard semantics expected of a real radio group.
- `ProjectPicker.tsx` is visually functional but still under-specifies combobox/listbox semantics and active-option focus behavior.
- `MetadataPanel.tsx` and `TeamPresentationPanel.tsx` still expose more visible metadata surface than a low-friction author path should require.
- `metadataDefaults.ts` now drives both team-heading and hero-category defaults, so Wave 02 metadata work cannot stop at `MetadataPanel.tsx` and `TeamPresentationPanel.tsx`; it must also include `HeroPanel.tsx`.
- the story editor is now genuinely rich text, so the remaining work is no longer “replace textarea with editor”; it is “close the remaining editorial-quality, ergonomics, placeholder, and proof-of-closure gaps.”
- manifest/comment/release-manifest narrative still uses “current sprint / future sprint” framing that is historically understandable but no longer ideal as current product narrative.

## Package restructuring decisions

Compared with the attached package:

- **Prompt 01** stays, but is rewritten around actual remaining author-facing label closure rather than a broad generic scrub.
- **Prompt 02** from the attached package is split into two clearer closure units:
  - shared selector/control accessibility semantics
  - project binding and lookup truthfulness
- **Prompt 03** stays, but is rewritten to focus on the remaining editorial-quality gaps instead of implying the editor is still only barely rich text.
- **Prompt 04** stays, but is expanded to include `HeroPanel.tsx` and stronger progressive-disclosure/defaulting requirements.
- **Prompt 05** from the attached package is rewritten as a cross-surface keyboard/host-fit/breakpoint closure pass after the more local control issues are fixed.
- **Prompt 06** becomes **Prompt 07** after the split above and is strengthened with clearer source/runtime/manifest/release-manifest narrative rules.

## Closure sequence

1. finish the remaining author-facing label-governance seams
2. repair shared selector/control semantics that are currently only partially accessible
3. deepen project binding and lookup truthfulness without reintroducing manual identity entry
4. finish the story editor to an editorial-grade closure bar while preserving schema safety
5. reduce visible metadata burden through defaults and progressive disclosure
6. run a final cross-surface keyboard/host-fit/breakpoint closure pass
7. scrub misleading narrative, host-context, and rebranding drift while preserving runtime lineage

## Success standard

Wave 02 is successful only if:

- the local code agent can close each prompt cleanly without having to infer missing product intent
- the resulting product is meaningfully easier to author in
- the remaining accessibility work is specific, testable, and credible
- the package leaves no meaningful Wave 02 work behind as “future polish”
