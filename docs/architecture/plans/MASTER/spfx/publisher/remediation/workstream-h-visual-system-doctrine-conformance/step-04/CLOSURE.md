# Workstream H · Step 04 — Closure

## Objective
Harden focus / empty / loading / error / author-safety states across the Publisher. The biggest remaining gap was the last-action status banner: it treated every outcome identically under `aria-live="polite"`, so a save failure reached screen-reader users with the same politeness as a "Saving…" progress tick. This step adds a governed severity-aware status surface and threads tone through every `setStatus` call site.

## What changed

### New `StatusBanner` primitive
`apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/StatusBanner.tsx` — third member of the Publisher's `sharedChrome/` primitive family. Three tones (`info` / `success` / `error`) each rendering a tinted pill using the Step-02 token surface:

- `info` — `role="status"`, `aria-live="polite"`, info-blue chrome. In-flight work ("Saving the draft…", "Archiving…").
- `success` — `role="status"`, `aria-live="polite"`, success-green chrome. Closed-lifecycle confirmations ("Published. A new page is live.", "Draft saved.").
- `error` — **`role="alert"`**, `aria-live="assertive"`, danger-red chrome. Anything that didn't complete.

An optional `busy` prop maps to `aria-busy` so spinner + message render together cleanly. `forced-colors: active` swaps to `ButtonText` / `ButtonFace` / `ButtonBorder` so Windows high-contrast users get a system-paired treatment.

Five new RTL tests cover: default info tone (role + polite), success tone (role + styling), error tone promotion to `role="alert"` + `assertive`, `busy` → `aria-busy`, ref forwarding + extra-props pass-through.

### `ArticlePublisher.tsx` — tone threaded through every status path
- `status` state stays a `string | undefined`, but a companion `statusTone: 'info' | 'success' | 'error'` tracks severity. A lightweight `setStatus(message, tone = 'info')` wrapper sets both atomically so call sites read as before.
- **Error tone** applied to every failure path:
  - `reloadSelected` load failure + unsupported-destination + resolution-context error.
  - `loadPreview` failure.
  - Save flow: template-resolution "Save blocked — …", "Couldn't save — …".
  - `handleTransition`: illegal transition refusal, archive / withdraw orchestrator failure, generic-transition orchestrator failure, runtime catch.
  - `handlePublishAction`: orchestrator `outcome.ok === false`, runtime catch, and `outcome.action === 'blocked'` (a success-shaped outcome with a validation block).
- **Success tone** applied to closed-lifecycle confirmations:
  - "Draft saved."
  - `lifecycleOutcomeMessage` for archive / withdraw + generic transitions.
  - `publishSuccessMessage` for publish / republish / preview completion.
- **Info tone** remains the default for in-flight work (saving, publishing, transitioning, loading).
- The final readiness-rail status banner now renders `<StatusBanner tone={statusTone} busy={busy}>` in place of the previous flat `<section aria-live="polite">`.

### Focus + empty / loading / error audit — verified clean
Items checked against the surface, no further changes needed after Step 03b:

| Surface | Empty | Loading | Error | Focus |
| --- | --- | --- | --- | --- |
| DraftQueue | `HbcEmptyState` (no articles) + editorial no-match copy (search miss) | "Loading drafts…" | `role="alert"` banner + retry `PublisherButton` | Unified focus via sharedChrome; `aria-current` on active row |
| ArticlePreview | `HbcEmptyState` ("Add content above") | `HbcSpinner` | editorial "We couldn't compose a preview from the current draft." | N/A (view-only) |
| PublishReadinessDiagnostics | `null` when no outcome | N/A | `role="alert"` flows to rail's blocking-issues block | Native `<details>/<summary>` focus |
| TeamPanel | `HbcEmptyState` ("No teammates yet") | N/A (in-memory) | Surfaces through status banner | Chip `:focus-within`; icon + action buttons via `PublisherButton` |
| GalleryPanel | `HbcEmptyState` ("No images yet") | N/A (in-memory) | `role="alert"` readiness banner for problem-level alt text; broken-image fallback | Same as TeamPanel |
| MediaComposer | preview placeholder copy | "Loading preview…" | inline https-only `role="alert"` + thumbnail `role="alert"` | `PublisherButton` / primitive focus |
| TeamMemberComposer | Graph picker fallback state | HbcPeoplePicker handles | Composer save disabled until identity picked | HbcKudosComposerFlyout focus trap |
| ArticlePublisher status banner | hidden until status / busy | `HbcSpinner` + info tone | `role="alert"` assertive via `StatusBanner` | — |

## Lifecycle safety
- No schema change.
- No adapter / orchestrator / write-seam change.
- `setStatus` signature is backwards-compatible (tone is optional); any callsite that doesn't pass one gets `info`.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run sharedChrome ArticlePublisher draftQueue teamComposer mediaComposer readinessSurface previewSurface` — **253/253 pass** across 23 files (5 new StatusBanner tests + 248 existing).

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/StatusBanner.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/statusBanner.module.css` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/statusBanner.module.css.d.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/statusBanner.test.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/index.ts` (export)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` — `statusTone` state; `setStatus(message, tone)` wrapper; tone threaded through every status call; `<StatusBanner>` renders the readiness-rail status block.
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-h-visual-system-doctrine-conformance/step-04/CLOSURE.md` (this file)

## Remaining / follow-on
- **Step 05 — Full scrub + workstream README + hosted SPFx + high-contrast + reduced-motion + zoom vetting.**

No blockers.
