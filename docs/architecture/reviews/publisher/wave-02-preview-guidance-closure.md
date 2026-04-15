# Publisher Wave-02 — Preview guidance & trust bridge closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-15/Prompt-06-Rebuild-inline-guidance-and-preview-trust-bridge.md`
**Scope:** `ArticlePreview` trust bridge + CSS, reuse of `sectionAnchorForFindingField` and `handleSectionIndexClick`.
**Manifest:** hb-publisher Feature 1.0.0.41.

## What changed

The top-of-preview narration used to be a single one-liner that pointed the author away from the preview: *"Preview shows the current draft — N blocking issues still to fix. See the Readiness rail."* Remediation understanding lived almost exclusively in the right rail, so authors had to keep switching focus between the preview and the rail to act.

`ArticlePreview` now renders a **structured `TrustBridge` aside** at the top of the preview that carries the corrective understanding inline:

- **Faithfulness headline.** "Preview is faithful to the saved draft — N blocking issues to fix before publish." (or the warnings-only variant, or a clean "no blocking issues and no warnings" variant when the validation result is empty). The word "faithful" explicitly owns the preview contract so the author knows what they see is the committed draft as-rendered.
- **Inline remediation list.** Up to `INLINE_FINDING_LIMIT = 3` findings render directly in the preview as `<li>` items, each showing the validation message, the italic `actionHint` when present, and a **"Go to <section> →"** anchor routed through the existing `sectionAnchorForFindingField` seam. Click handling is delegated to the shared `handleSectionIndexClick` helper so the jump-link focus + scroll behaviour matches the readiness rail's own backlinks exactly.
- **Overflow pointer.** When there are more findings than the inline limit, a subordinate italic line reads *"+ N more in the Readiness rail."* — the rail stays the authoritative index of every finding, and the preview doesn't try to duplicate it.

CSS follows the existing danger / warn token families. A new success-tinted `trustBridgeClean` state surfaces the "no blocking issues" confirmation so authors see explicit trust, not just the absence of an alert.

## Layered-guidance model

After this change, the Publisher's guidance model reads as three distinct layers with clear roles:

- **Field / panel layer** — the existing inline affordances: field helpers, counters, alt-text assessment, caption assessment, `ExceptionalNotice` on unsupported content type / destination, milestone-legacy notice in MetadataPanel. This layer owns the "how do I fill this in correctly" question.
- **Preview layer (this change)** — the trust bridge names what the preview is faithfully showing, how many issues remain, and jumps the author back to the section that owns each issue. This layer owns the "what will readers see and what will I fix next" question.
- **Readiness rail** — the authoritative index of every finding, save gating, ship cluster, workflow transitions, destructive actions, status banner. Stays concise and governance-oriented; no longer the only place remediation understanding lives.

## Reduced duplication

- The preview no longer points back to the rail for a numeric count only — the findings it surfaces inline are remediation statements, not a count.
- The readiness rail's per-finding `Go to X →` backlinks (`ValidationIssueItem` in `ArticlePublisher.tsx`) use the same `sectionAnchorForFindingField` and `handleSectionIndexClick` helpers, so the UX is identical whether the author acts from the preview or the rail.
- The per-panel blocking prose (`unsupportedDestinationMessage`, `unsupportedContentTypeMessage`) still surfaces through `ExceptionalNotice`, which is the right place for those whole-panel states — the trust bridge does not duplicate them.

## Preserved invariants

- `PreviewOutcome` contract is unchanged. `outcome.validation.errors` and `outcome.validation.warnings` are the same arrays the readiness rail reads.
- `useReadinessController` and the readiness rail's `ValidationIssueItem` list are untouched.
- `sectionAnchorForFindingField` remains a single testable seam shared by preview and rail.
- `PublishReadinessDiagnostics` is untouched — it still owns readiness-surface diagnostics and remains the authoritative index.
- `ArticlePreview` still carries no validation / drift prose beyond the top trust bridge; the editorial surface below the bridge is unchanged.

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing (including the existing `publishReadinessDiagnostics` suite); 6 failures all pre-existing in `publisherAdapter/__tests__/publisherEndToEnd.test.ts`, unrelated.
- Manifest bumped: `config/package-solution.json` 1.0.0.40 → 1.0.0.41.
