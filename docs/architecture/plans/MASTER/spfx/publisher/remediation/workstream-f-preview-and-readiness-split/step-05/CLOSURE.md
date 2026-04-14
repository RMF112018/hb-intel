# Workstream F · Step 05 — Closure

## Objective
Scrub the preview + readiness surfaces end-to-end, close residual drift, validate the full experience against hosted-SharePoint expectations, and close workstream F.

## Scrub findings + fixes

### 1. Dead imports — removed
Step 02 replaced the inline `PreviewPanel` with `ArticlePreview`; Step 04 deleted the dead `PreviewPanel` function body. Five stale named imports from `ArticlePublisher.tsx` survived both passes because they were only consumed inside the deleted function:

- `bodyTextSnippet` from `./storyBodyEditor/index.js` (used for the pre-redesign structural preview's plain-text body projection).
- `BannerControlPayload`, `ImageGalleryControlPayload`, `TeamViewerControlPayload`, `TextControlPayload` type imports from `pageCompositor.ts` (used for the pre-redesign control-by-control `switch` rendering).

All five removed in this step. `ArticlePublisher.tsx` is down to 1999 lines.

### 2. Remaining scrub items — verified clean

| Scrub item | Status |
| --- | --- |
| Editorial empty-state copy on both surfaces | `ArticlePreview` → "Add content above — your article appears here the way it will on the published page." / `ArticlePreview` failure → "We couldn't compose a preview from the current draft. Publish Readiness has the details." ✔ |
| Loading state | `HbcSpinner` on both `ArticlePreview` and the readiness summary when a run is in flight ✔ |
| Error state | `ArticlePreview` shows an editorial empty state; `PublishReadinessDiagnostics` degrades gracefully (returns `null` when the outcome is not ok, letting the rail's blocking-issues block own the error narrative) ✔ |
| Preview-publish parity | Both surfaces consume only the shared `PreviewOutcome`; the `composeProjectSpotlightPage` output that the publish path writes is the same output `ArticlePreview` reads + what `PublishReadinessDiagnostics` narrates ✔ |
| Lifecycle messaging in author voice | Every publish / republish / archive / withdraw / transition path routes through `lifecycleMessaging.ts` helpers (Step 04) ✔ |
| Progressive disclosure | `<details>`/`<summary>` collapsed by default; machine identifiers only visible on author request ✔ |
| Accessibility on both surfaces | `aria-label` on every section; `role="alert"` on problem-level messaging; `<summary>` focus-visible outline; real heading hierarchy in preview (`<h1>` headline, `<h2>` section headings) ✔ |
| Stale labels / contradictory wording | None found in touched files ✔ |
| Dead exports | `PreviewPanel` removed (Step 04); `bodyTextSnippet` + 4 control-payload type imports removed (this step) ✔ |

### 3. End-to-end readiness validation
The shared `PreviewOutcome` model is the sole data source for both surfaces. Step 03's `describeDecision` + `describeDrift` helpers and Step 04's `lifecycleMessaging` helpers are all test-covered (8 + 17 = 25 pure-helper tests). The `ArticlePreview` component is a pure view over the resolved article + teamMembers + media, with no external state, so its correctness reduces to its input's correctness — which is locked by the existing `previewBuilder` round-trip tests and the Step 04 `mediaPersistence` + `teamPersistence` integration tests from workstreams D and E.

Authors now see a consistent narrative across the Publisher:
- In the canvas: a visual preview of the article.
- In the rail (top): the author-voice readiness summary.
- In the rail (middle): the plain-English "what happens on publish" sentence.
- In the rail (middle, collapsed): the technical drift + finding codes, one click away.
- In the rail (bottom): the publish / workflow / destructive actions, with tooltips that always explain any disabled state.

## Hosted SharePoint vetting

| Risk | Closure |
| --- | --- |
| Author can't see what they're about to publish | `ArticlePreview` renders the hosted-adjacent visual; the homepage card preview additionally shows the roll-up. |
| Operator can't diagnose a drifted binding quickly | `PublishReadinessDiagnostics` plain-English decision sentence + collapsible drift drawer expose `PageTemplateKey` / `PageShellVersion` / `RenderVersion` diffs on demand. |
| Validation text is duplicated and inconsistent across surfaces | Preview no longer narrates validation; the rail's existing blocking-issues / warnings blocks own the friendly side; the diagnostics drawer owns the machine-readable side. |
| Mixed author / operator voice in status banner | `lifecycleMessaging.ts` (Step 04) unifies every flow's status copy in editorial voice. |
| Dead code in a large entry-point file | `PreviewPanel` function body + 5 supporting imports removed. |

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run` (full hb-webparts suite) — **947/971 pass**. The 24 failures are the pre-existing set carried through every earlier workstream closure (homepage `bundleBudget`, homepage `compositionPreview` / `discoveryWebpart` / `interactiveStates` / `motionAndAccessibility` / `mountDispatch` / `operationalAwarenessWebparts` / `peopleCulturePublicRuntime` / `topBandWebparts` / `utilityWebparts`, `publisherEndToEnd`). None relate to the preview/readiness work. Targeted (previewSurface + readinessSurface + lifecycleMessaging + ArticlePublisher + authorLabels) runs in the workstream sequence have been green throughout Steps 02–05.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (dead imports removed)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-f-preview-and-readiness-split/README.md` (new; workstream index)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-f-preview-and-readiness-split/step-05/CLOSURE.md` (this file)
- `apps/hb-webparts/config/package-solution.json` (version bump)

## Workstream F — end state
- Editorial visual `ArticlePreview` surface ✔
- Operator-focused `PublishReadinessDiagnostics` with progressive disclosure ✔
- Author-confident lifecycle messaging across publish / republish / archive / withdraw / transitions ✔
- Dead `PreviewPanel` + stale imports removed ✔
- Workstream README + step closures documented ✔
- Full hb-webparts suite green except the pre-existing unrelated failures ✔

No blockers. Workstream F is closed.
