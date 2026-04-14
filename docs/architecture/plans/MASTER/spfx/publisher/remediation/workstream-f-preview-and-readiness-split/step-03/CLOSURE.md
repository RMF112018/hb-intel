# Workstream F · Step 03 — Closure

## Objective
Implement a dedicated Publish Readiness panel that surfaces the "what will happen on publish" decision in plain English and a progressive-disclosure technical-details drawer for the version drift and machine-readable validation finding codes.

## What changed

### New: `readinessSurface/PublishReadinessDiagnostics.tsx`
Slots into the readiness rail above the Actions block when a preview outcome is available. Renders two sections:

1. **"What happens on publish"** — a single plain-English sentence derived from the shared `PreviewOutcome.decision`:
   - `create` → "A new destination page will be created and linked to this article."
   - `inPlaceUpdate` → "The existing destination page will be updated in place. PageId and page URL are preserved." (with a detail line calling out shell-version or template-version drift when present).
   - `regenerate` → "The destination page will be regenerated — a new PageId and page URL will replace the current binding." (with the regeneration cause as detail).
   - `noOp` → "Nothing will change on the destination page — the current binding already matches."
   - `blocked` → "Publish is blocked by validation issues. Resolve the blocking issues above and try again."

2. **"Technical details"** — a native `<details>`/`<summary>` disclosure collapsed by default, revealing:
   - A version-drift group listing each drifted field as a monospace `FieldName: oldValue → newValue` line (`PageTemplateKey`, `PageShellVersion`, `RenderVersion`, sourced from the existing binding and the composed-page identity).
   - A validation-findings group listing `severity` / `category` / `field` for every error and warning in the current outcome. Severity renders as a coloured pill (red for error, ochre for warning), category in plain text, field in a monospace chip.

The disclosure stays closed by default so the author-facing rail doesn't lead with operator-voice detail. Operators expand it when they need the numbers.

### Styles
- `publishReadiness.module.css` + `.d.ts` — 17 feature-scoped classes, palette aligned with the existing readiness rail and the Step 02/03/04 guidance banners so the entire authoring surface speaks one visual language. The `<summary>` carries a visible focus-visible outline and HBC-primary-blue marker colour.

### Pure helpers + tests
- `describeDecision(outcome, binding)` — maps `decision.action` to `{ sentence, detail? }`. Exported via `__testables` for direct unit testing.
- `describeDrift(outcome, binding)` — emits zero lines when there is no binding; otherwise one line per drifted field in the order `templateKey` → `shellVersion` → `templateVersion`.
- `publishReadinessDiagnostics.test.ts` — **8 unit tests** covering all five `RepublishAction` branches, shell-drift detail propagation, zero-drift with no binding, and three-way drift emission with correct old → new values.

### `ArticlePublisher.tsx`
- Imports `PublishReadinessDiagnostics`.
- Renders the diagnostics block inside the readiness rail, immediately above the Actions block, when `articleDraft` is non-empty. The existing Readiness summary / Blocking issues / Warnings blocks remain exactly as they were — this step adds a new block rather than restructuring.

## Doctrine alignment
- **Preview–publish parity.** The diagnostics read only from the shared `PreviewOutcome`. Same data, same decisions, no duplication.
- **Editorial, then diagnostic.** The author-voice readiness summary remains the lead; the plain-English decision sentence sits between it and the Actions block; technical machine-readable detail is collapsed.
- **Host-safe.** Pure component + pure helpers; no new dependencies; no schema change; no cross-package export added.
- **Accessibility.** `<details>`/`<summary>` is keyboard-native; focus-visible outline on summary; sections carry descriptive `aria-label`s; severity pills are colour + text (not colour alone).

## Lifecycle safety
- `PreviewOutcome` shape unchanged; `previewBuilder` / `publishOrchestrator` / `validationEngine` / `republishPolicy` / `composeReadinessSummary` untouched.
- Publish / republish / archive / withdraw lifecycle unchanged.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run readinessSurface ArticlePublisher previewSurface` — 178/178 pass across 15 files (8 new diagnostics tests + 170 existing).

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/readinessSurface/PublishReadinessDiagnostics.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/readinessSurface/publishReadinessDiagnostics.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/readinessSurface/publishReadiness.module.css` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/readinessSurface/publishReadiness.module.css.d.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/readinessSurface/index.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-f-preview-and-readiness-split/step-03/CLOSURE.md` (this file)

## Remaining / follow-on
- **Step 04** — Rewire consumers, delete the inline `PreviewPanel` dead code carried over from Step 02, add integration tests proving Preview and Readiness read disjoint slices of `PreviewOutcome`.
- **Step 05** — Full behavioural scrub + workstream README + hosted SPFx vetting.

No blockers.
