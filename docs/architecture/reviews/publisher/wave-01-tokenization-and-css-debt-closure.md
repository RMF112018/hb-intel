# Wave 01 — Publisher tokenization & CSS debt closure

**Scope:** phase-12 / Prompt-02 — finish Publisher tokenization and delete
stale visual CSS debt across feature-level modules.

**Status:** closed.

## Token seam preserved

The existing Publisher token seam at
`apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/tokens.module.css`
is the single visual-token source of truth. It mirrors the TypeScript
tokens in `packages/ui-kit/src/theme/*.ts` and the HBC brand ramp. No
upstream tokens were moved or renamed.

A small, bounded set of new Publisher-local aliases was added to cover
repeated feature-level values that had no existing token match:

- `--hb-text-tertiary: #6A6A6F` — helper/meta copy between
  `--hb-text-secondary` and `--hb-text-muted`.
- `--hb-border-faint: #F0F0F3` — inner hairlines inside tokenized
  surfaces (group dividers, dropdown option separators).
- `--hb-surface-tint-selected: #F0F6FC` — hover/selection tint aligned
  with the status-info family.

## Hardcoded-value clusters removed

All feature-level CSS modules now consume Publisher tokens; raw hex
remains only inside `var(--hb-*, #fallback)` fallbacks. Modules fully
tokenized in this sweep:

- `article-publisher.module.css` — shell, rails, canvas, sections,
  editorial readouts, choosers, destination binding, readiness blocks,
  field/input primitives, project picker.
- `draftQueue/draftQueue.module.css`
- `mediaComposer/galleryPanel.module.css`
- `mediaComposer/mediaComposer.module.css`
- `teamComposer/teamPanel.module.css`
- `teamComposer/teamComposer.module.css`
- `previewSurface/articlePreview.module.css`
- `readinessSurface/publishReadiness.module.css`
- `storyBodyEditor/storyBodyEditor.module.css`

Already-tokenized modules verified and left as-is:

- `sharedChrome/publisherButton.module.css`
- `sharedChrome/editorialChip.module.css`
- `sharedChrome/statusBanner.module.css`

### Visual-family consolidations

Repeated near-duplicate hex values were collapsed onto the canonical
token ramp so the product reads as one visual system:

- Neutral text (`#1F2129`, `#2A2A32`, `#3A3A40`, `#334`) →
  `--hb-text-primary` / `--hb-text-secondary` / `--hb-status-info-text`
  as appropriate.
- Grey scale (`#5C5C60`, `#5F5F66`, `#5F6370`, `#6A6A6F`, `#9A9AA3`) →
  `--hb-text-tertiary` / `--hb-text-muted`.
- Border greys (`#E3E3E6`, `#C8C8CC`, `#D0D4DE`, `#B5B9C2`) →
  `--hb-border-subtle` / `--hb-border-strong`.
- Fluent brand blues (`#0078D4`, `#106EBE`, `#004B87`, `#1A4173`) →
  `--hb-color-brand-action` / `--hb-color-brand-action-hover` /
  `--hb-color-primary-blue` / `--hb-color-presentation-blue`.
- Status-info tints (`#EFF6FC`, `#F0F6FC`, `#CFE4F7`, `#DAE4F3`) →
  `--hb-surface-tint-selected` / `--hb-status-info-border`.
- Success ramp duplicates (`#1A6A35`, `#EEF8F1`, `#BFE1CD`) → canonical
  `--hb-status-success-*`.
- Danger ramp duplicates (`#8A1F2B`, `#FDE7E9`, `#F5B2BB`, `#F5D8DC`,
  `#F8D7D7`) → canonical `--hb-status-danger-*`.
- Amber/featured duplicates (`#D4A017`, `#FFF7E0`, `#FFF3B0`) →
  `--hb-status-featured-*`.
- Surface tint variants (`#FAFBFC`, `#FAFBFF`, `#F7F8FA`) →
  `--hb-surface-2`.

## Stale CSS residue deleted

`article-publisher.module.css` had carried a large set of class
definitions left behind by earlier migrations — specifically the draft
queue, team chip, preview finding/control, row-card, and a handful of
legacy form/status classes that had all moved to feature-local modules
(`draftQueue.module.css`, `teamPanel.module.css`,
`articlePreview.module.css`, `publishReadiness.module.css`) or to
`sharedChrome/` primitives. These classes had zero live callsites in any
`.ts` / `.tsx` that imports `article-publisher.module.css`.

Deleted from both `article-publisher.module.css` and its `.d.ts`:

- Queue legacy: `railLoading`, `draftGroups`, `draftGroup`,
  `draftGroupHeader`, `draftGroupLabel`, `draftGroupCount`,
  `draftGroupEmpty`, `draftList`, `draftRow`, `draftRowActive`,
  `draftRowTitle`, `draftRowMeta`.
- Preview legacy: `previewRoot`, `driftBannerHard`, `driftBannerSoft`,
  `findingList`, `findingItemOk`, `findingItemError`, `findingItemWarn`,
  `findingCategory`, `findingMessage`, `findingHint`, `decisionNotes`,
  `previewControls`, `previewControl`, `previewControlHidden`,
  `previewSnippet`, `sectionHeading`.
- Team chip legacy: `teamChipButton`, `teamChipName`, `teamChipTitle`,
  `teamChipMeta`, `teamChipBio`.
- Row-card legacy: `rowList`, `rowCard`, `rowGrid`, `rowActions`,
  `rowCardHeader`, `rowCardIndex`, `rowCardBadge`.
- Other: `statusLine`, `readinessStatus`, `form`, `textareaLg`, `select`.

The `.input, .textarea, .select` grouped selector was pruned to
`.input, .textarea` to match live usage. The pre-existing waypoint
comment about removed `.btn / .primaryBtn / .dangerBtn / .linkBtn` was
also removed since the `.sharedChrome/` primitive migration is long
settled and the waypoint no longer carries value.

## Retained local exceptions

- `article-publisher.module.css` still owns the field / input / chooser
  / editorial-readout / binding-panel / project-picker class families.
  These are authored-surface compositions consumed exclusively by
  `authoringPanels/`, `sharedChrome/Field.tsx`,
  `sharedChrome/ChooserGroup.tsx`, and `ProjectPicker.tsx` that still
  reach into the shell module. Moving them into `sharedChrome/` as
  their own primitives is a larger refactor; it is intentionally out of
  scope for this closure and flagged here for a later wave.
- `storyBodyEditor.module.css` retains its TipTap content typography
  (heading sizes, list margins, blockquote) as local composition. These
  are editor-surface typography, not shared primitives.

## Proof of closure

- No raw hex outside `var(--hb-*, #fallback)` anywhere in the affected
  CSS modules.
- `.module.css.d.ts` for `article-publisher` re-emitted to reflect the
  pruned class surface; no dangling type declarations.
- All live TSX callsites continue to reference only classes that exist.
- Package typecheck (`tsc --noEmit`) — pass.
- ArticlePublisher shell tests (`vitest run ArticlePublisher.test`) —
  11/11 pass.
- Full `@hbc/spfx-hb-publisher` suite — 564/570 pass; the 6 failures are
  pre-existing `publisherEndToEnd` data/orchestrator failures unrelated
  to the CSS sweep and not regressed by this work.
- Renders correctly under SharePoint-hosted light-theme context
  (tokens.module.css is loaded by the webpart mount chain; no dark-mode
  divergence introduced).

## Follow-up handed to later phase-12 prompts

- Prompt-03 — pseudo-iconography + toolbar/avatar microinteraction
  hardening.
- Prompt-04 — preview/readiness trust loop internals.
- Later wave — relocate field / chooser / editorial-readout / binding /
  project-picker primitive families out of `article-publisher.module.css`
  into dedicated `sharedChrome/` modules, removing the last legitimate
  local exception.
