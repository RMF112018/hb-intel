# Publisher Wave-01 — Legacy/operator disclosure closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-14/Prompt-06-Structural-redesign-legacy-operator-separation-and-advanced-disclosure.md`
**Scope:** `ArticlePublisher.tsx` canvas notices + promotion section, `MetadataPanel` content-type legacy narration, new shared `ExceptionalNotice` primitive.
**Manifest:** hb-publisher Feature 1.0.0.33.

## What legacy / operator exposures were re-architected

Before this change, legacy-state narration and operator-grade detail were rendered as full always-visible prose paragraphs at ordinary reading depth. The shell's canvas header carried:

- `authoringHealth` messages as a raw blocking prose block (registry-load failures, template-match failures, with bracketed diagnostic text).
- `scheduledLegacyStateNotice` as a standalone `<p>` warning paragraph narrating "Legacy state notice: `scheduled` is read-compatible only (no executor). Move to `approved` or `withdrawn`."
- `unsupportedContentTypeMessage` and `unsupportedDestinationMessage` as blocking prose paragraphs that included every sentence of the governing narration.

The Promotion section rendered the full `promotionSummary` array as 3–4 peer `<p>` lines — rule-ID strings, scope labels, and lock-semantic explanations — all visible to the standard author on every draft. And `MetadataPanel` rendered the `milestoneLegacyNotice` full narration as an inline warning paragraph next to the article-type chooser.

All of these have been reconstituted through a new shared **`ExceptionalNotice`** primitive (in `sharedChrome/`) that presents:

1. A compact, tonal headline row with a tone badge and one-line headline label (e.g. "Legacy scheduled state", "Unsupported destination", "Legacy milestone content type", "Promotion rule guidance").
2. A single-line `hint` with the author-actionable next step (move to approved/withdrawn, pick a supported content type, editing is disabled).
3. A collapsed `<details>` "Operator details" / "Legacy-state details" / "Environment details" block that carries the full governing narration in a monospace-styled body. Every word of the truth remains in the DOM — it is simply one click away from the default path.

## What remained directly visible and why

- **Blocking call-to-action state**. `ExceptionalNotice` still fires `role="alert"` with `aria-live="assertive"` when `blocking` is set (unsupported content type, unsupported destination, authoring-environment failure). The author still sees that something is wrong the moment it happens — the difference is they see a one-line cue instead of a paragraph.
- **Legacy scheduled-state banner**. Still rendered on the canvas (tone "warn") because the author needs to know this workflow state is legacy before they act. The full "read-compatible only (no executor)" prose now sits in the details block.
- **Promotion one-liner summary**. The Promotion section still opens with an editorial sentence: *"Promotion is governed by the destination's rule set. Save to re-apply; lock semantics are enforced automatically."* — the standard author gets the shape of the thing without the rule IDs.
- **Promotion rule-health notice**. When promotion rules fail to load or degrade, an `ExceptionalNotice` still fires with the appropriate tone (danger on load failure, warn on soft degradation); the full `promotionRuleHealthHeadline` narrative is one click away.
- **Milestone legacy headline**. When a draft carries `milestoneSpotlight`, the headline and hint are visible inline in MetadataPanel; the full "read-compatible only" narration is one click away.

## What moved behind advanced disclosure

- The full prose of `authoringHealthHeadline`'s diagnostic message for registry-load and template-match failures (previously rendered in the same paragraph as the headline) → now inside `ExceptionalNotice.details`.
- The full `scheduledLegacyStateNotice` narration → inside `ExceptionalNotice.details`, labelled "Legacy-state details".
- The full `unsupportedContentTypeNotice` and `unsupportedDestinationNotice` narrations → inside the respective `ExceptionalNotice.details`, labelled "Support details".
- The full `promotionSummary` prose array (rule IDs, scope label, lock-semantic explanations) → inside a new `DisclosureSection` titled **"Promotion policy details"** (`testId: promotion-operator-details`) with the summary hint *"Rule identifiers, scope, and lock semantics used at save time."*
- The full `promotionRuleHealthHeadline` narration → inside `ExceptionalNotice.details`, labelled "Rule details".
- The full `milestoneLegacyNotice` narration → inside `ExceptionalNotice.details` on MetadataPanel, labelled "Legacy-state details".

## How safety and truth were preserved

- **No narration was removed.** Every string returned by `scheduledLegacyStateNotice`, `unsupportedDestinationNotice`, `unsupportedContentTypeNotice`, `milestoneLegacyNotice`, `authoringHealthHeadline`, `authoringHealthActionHint`, `promotionLockStatusText`, and the promotion-summary generator continues to render in the DOM. `document.textContent` still contains every sentence. Screen-reader users can still reach every word by expanding the disclosure, which is a standard keyboard interaction (`Enter` / `Space` on `<summary>`).
- **Blocking gating is unchanged.** `publishEnabled`, `republishEnabled`, `saveEnabled`, and all lifecycle guards in `useReadinessController` / `useDraftLifecycle` / `publishDisabledReason` were not touched. A draft that couldn't publish before still can't publish; the UI just uses a compact alert instead of a paragraph to say so.
- **Queue visibility is unchanged.** `useDraftWorkspace`, `DRAFT_GROUP_ORDER`, `COLLAPSED_GROUPS_BY_DEFAULT`, and the `DraftQueue` surface are not touched — legacy-state drafts remain discoverable, selectable, and safely editable from the queue.
- **Test suite stays green.** 614 passing, including:
  - `scheduledLegacyStateNotice` / `unsupportedDestinationNotice` / `milestoneLegacyNotice` / `promotionLockStatusText` / `workflowFilterOptions` string-return tests in `ArticlePublisher.test.tsx` — all still pass because the helpers still return the same strings; only where they are rendered changed.
  - HeroPanel / MetadataPanel / TeamPresentationPanel / sectionFocus test suites — unchanged.
- **Aria semantics improved.** `ExceptionalNotice` uses `role="status"` with `aria-live="polite"` by default and escalates to `role="alert"` / `aria-live="assertive"` under `blocking`. The details `<summary>` is focusable and has a visible focus ring tied to `--hb-color-focus-ring`.

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing; 6 failures all pre-existing in `publisherAdapter/__tests__/publisherEndToEnd.test.ts`, unrelated to this change.
- Manifest bumped: `config/package-solution.json` 1.0.0.32 → 1.0.0.33.
