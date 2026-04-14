# Workstream F · Step 04 — Closure

## Objective
Rewrite publish / republish / archive / withdraw messaging for author confidence, and delete the dead `PreviewPanel` left in place by Step 02.

## What changed

### New: `lifecycleMessaging.ts`
Nine pure string builders, editorial in tone, machine-identifier-free:

| Helper | Purpose |
| --- | --- |
| `inProgressMessage(mode)` | "Publishing the article…", "Republishing the article…", "Composing a preview…" |
| `publishSuccessMessage({ mode, action, pageUrl })` | "Published. A new page is live. View it at …" / "Republished. The existing page is updated in place." / "Republished. A fresh page replaces the previous binding." / "Nothing changed — the live page already matches the draft." / "Publish is blocked by validation. Resolve the blocking issues and try again." / (preview) "Preview is up to date." |
| `publishFailureMessage({ mode, stage, message })` | "Publish didn't complete — compose: …" |
| `transitionInProgressMessage(to)` | "Archiving the article…", "Withdrawing the article…", "Sending for review…", "Marking as approved…", "Returning to draft…", generic fallback |
| `lifecycleOutcomeMessage({ to, bindingUpdated })` | "Archived. The live page has been taken down." / "Withdrawn. No live page was bound." / "Now in approved." |
| `lifecycleFailureMessage({ to, stage, message })` | "Archive didn't complete — history: …" / "Transition to approved didn't complete — …" |
| `illegalTransitionMessage(from, to)` | "Can't move published articles to draft directly." |
| `publishDisabledReason({ hasDraft, destinationSupported, validationBlocked, busy })` | Priority-ordered button tooltip: "Pick a draft first." → "This destination isn't wired for publishing yet." → "Resolve the blocking issues above before publishing." → "A run is already in flight." → `undefined`. |

All helpers are pure, SPFx-safe, and test-covered.

### `lifecycleMessaging.test.ts` — 17 unit tests
Covers every branch of every helper: all publish modes, all orchestrator actions (`create` / `inPlaceUpdate` / `regenerate` / `noOp` / `blocked`), archive + withdraw binding-updated both ways, failure verb mapping, illegal transition copy, disabled-reason priority ordering, and the success-path undefined return.

### `ArticlePublisher.tsx` — wired through
- **Publish / republish / preview flow** uses `inProgressMessage` / `publishSuccessMessage` / `publishFailureMessage`. The previous "republish ok — action=inPlaceUpdate, reason=shellMatch, state=published · https://…" composite string is replaced with "Republished. The existing page is updated in place. View it at https://…". Operators who want the action / reason / stage detail expand the Step-03 Technical details drawer.
- **Lifecycle transitions** use `transitionInProgressMessage` + `lifecycleOutcomeMessage` + `lifecycleFailureMessage`. "Now in archived (binding updated)" becomes "Archived. The live page has been taken down." etc.
- **Illegal transitions** use `illegalTransitionMessage`.
- **Save flow** copy tightened: "Saving…" → "Saving the draft…"; "Saved." → "Draft saved."; save-error path says "Couldn't save — …" rather than the bare exception message.
- **Publish / Republish button tooltips** use the consolidated `publishDisabledReason`. Previously the tooltip only fired on validation-blocked; now it also covers missing-draft, unsupported-destination, and busy states with priority ordering so authors always get a reason.
- **Dead code removed**: the inline `PreviewPanel` function (158 lines) left in place by Step 02 is deleted. `ArticlePublisher.tsx` is down to 2003 lines.

## Doctrine alignment
- **Author voice.** "Published. A new page is live." is what an editorial assistant would say. Operator-voice detail lives in the Step-03 Technical details drawer.
- **Preserve existing lifecycle.** No orchestrator, no seam, no persistence change. This is strictly a UI-copy pass plus dead-code removal.
- **Host-safe.** Pure helpers, local-only, no new dependencies, no schema change.

## Lifecycle safety
- Orchestrator contracts (`run`, `archive`, `withdraw`, `transitionManual`) are called identically; only their outcomes' messages are rewritten for display.
- Publish / republish / archive / withdraw behaviour unchanged.
- `PreviewOutcome` contract unchanged.

## Accessibility
- Button tooltips now always provide a reason when a button is disabled — authors using screen readers get a direct answer instead of a silent disabled state.
- Status banner continues to live under `aria-live` (unchanged from Step 02).

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run lifecycleMessaging ArticlePublisher authorLabels readinessSurface previewSurface` — 198/198 pass across 16 files (17 new lifecycle-messaging tests).

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/lifecycleMessaging.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/lifecycleMessaging.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (messaging rewired; `PreviewPanel` function deleted; save + publish flows + disabled tooltips)
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-f-preview-and-readiness-split/step-04/CLOSURE.md` (this file)

## Remaining / follow-on
- **Step 05** — Full behavioural scrub, workstream README, hosted SPFx vetting.

No blockers.
