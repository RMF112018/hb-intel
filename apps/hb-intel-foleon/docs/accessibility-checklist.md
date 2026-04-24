# Foleon phase-01 accessibility checklist

WCAG 2.1 AA-oriented evidence for every surface the Foleon web part
exposes. Each row names the code path and test that proves the claim.
Rows are green at release-time; any red row blocks release unless
explicitly excepted in the release sign-off.

## Scope

- `FoleonApp` (route shell)
- `HighlightsPage`, `ContentHubPage`, `ReaderPage` (route bodies)
- `FoleonIframeHost` (embedded viewer)
- `FoleonStates` (loading / empty / error primitives)
- `FoleonCard` (card surface)

Out of scope: the Foleon publication itself — third-party content
inside the iframe is not covered by this checklist. Tenant admins
must verify publication accessibility in Foleon's own tooling.

## Landmarks and structure

| Criterion                                        | Evidence                                                                                     | Status |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------ |
| 1.3.1 Info & Relationships — `<main>` landmark  | `FoleonApp.tsx` renders `<main id="foleon-main" aria-label="Foleon" data-hbc-foleon-route>` | ✔      |
| 1.3.1 — Route-level `<section>` wrappers         | `HighlightsPage`, `ContentHubPage`, `ReaderPage` each wrap their body in `<section aria-label>` | ✔   |
| 1.3.1 — Route heading per surface                | `<h2>Marketing highlights</h2>`, `<h2>All publications</h2>`, `<h2>{record.title}</h2>`       | ✔      |

## Bypass and focus

| Criterion                                 | Evidence                                                                                 | Status |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- | ------ |
| 2.4.1 Bypass Blocks — skip-link           | `FoleonApp.tsx` renders `<a href="#foleon-main">Skip to main content</a>`, visible on focus | ✔   |
| 2.4.3 Focus Order                         | Native DOM order; no custom tabindex on non-skip-link widgets (`FoleonCard` uses `<button>`) | ✔   |
| 2.4.7 Focus Visible                       | Relies on `@hbc/ui-kit` / browser default focus ring (verified manually)                 | ✔     |
| 2.4.3 / 4.1.3 — Focus restore on route change | `FoleonApp.tsx` `useEffect([nav.route])` calls `mainRef.current?.focus()` after the first render | ✔ |

## Keyboard

| Criterion                     | Evidence                                                                                           | Status |
| ----------------------------- | -------------------------------------------------------------------------------------------------- | ------ |
| 2.1.1 Keyboard                | All interactive elements are native `<button>` / `<a>` (`FoleonCard`, `HbcButton`, `HbcSearch`)    | ✔      |
| 2.1.2 No Keyboard Trap        | `FoleonIframeHost` does not programmatically retain focus; iframe is a single tab stop             | ✔      |

## Name, role, value

| Criterion                                                 | Evidence                                                                             | Status |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------ |
| 4.1.2 — Iframe title                                      | `<iframe title={record.title}>` in `FoleonIframeHost.tsx`                           | ✔      |
| 4.1.2 — `<main>` accessible name                          | `aria-label="Foleon"`                                                               | ✔      |
| 4.1.2 — Skip-link accessible name                         | Inner text `Skip to main content`                                                   | ✔      |

## Status and alerts

| Criterion                                        | Evidence                                                                         | Status |
| ------------------------------------------------ | -------------------------------------------------------------------------------- | ------ |
| 4.1.3 Status messages — loading                  | `FoleonLoadingState`: `role="status" aria-live="polite"`                         | ✔      |
| 4.1.3 Status messages — route change announcer   | `FoleonApp.tsx`: SR-only `<div role="status" aria-live="polite">`                | ✔      |
| 3.3.1 Error identification                       | `FoleonError`: `role="alert"` with `<h3>` title + `<p>` description              | ✔      |

## State mapping (Prompt 04)

Prompt 04 names seven route states. Every state is implemented. No new
code is required — the mapping is exhaustive.

| Prompt state      | Code path                                                    | Accessible name source               |
| ----------------- | ------------------------------------------------------------ | ------------------------------------ |
| loading           | `FoleonLoadingState`                                         | `role="status" aria-live="polite"`   |
| empty             | `FoleonEmpty` → `HbcEmptyState`                              | Descriptive title + description      |
| suppressed        | `FoleonReaderGate` reason `not-visible`                      | `FoleonError role="alert"`           |
| expired (future)  | `FoleonReaderGate` reason `display-window-future`            | `FoleonError role="alert"`           |
| expired (past)    | `FoleonReaderGate` reason `display-window-past`              | `FoleonError role="alert"`           |
| invalid-origin    | `FoleonReaderGate` reason `origin-not-allowlisted`           | `FoleonError role="alert"`           |
| external-only     | `FoleonReaderGate` reasons `requires-external-open` + `embed-disallowed` | `FoleonError role="alert"` |
| config-error      | `FoleonApp` `!contract.canInitialize` branch                 | `<main data-hbc-foleon-route="config-error">` + `FoleonError role="alert"` |

## Automated coverage

| Test file                                                   | What it proves                                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/__tests__/routeDeepLinks.test.tsx`                     | Skip-link present, aria-live announcer present, `<main>` landmark present with proper `data-hbc-foleon-route`, zero iframes on Highlights/Hub/config-error |
| `src/components/__tests__/FoleonIframeHost.test.tsx`        | Iframe attributes honored; `title`, `sandbox`, `allow`, `referrerPolicy`, `loading`     |
| `src/services/__tests__/FoleonReaderGate.test.ts`           | All 10 gate reasons covered; every blocked-state mapping exists                         |

## Manual verification checklist

Run at release-time with a screen reader (macOS VoiceOver or NVDA) on
the deployed SharePoint page.

- [ ] Skip-link becomes visible on first Tab and lands focus on the
      main landmark when activated.
- [ ] VoiceOver announces "Foleon, main" after skip.
- [ ] Navigating Highlights cards with Tab + Enter opens the Reader.
- [ ] Reader header announces "Showing Foleon publication.".
- [ ] Iframe tab-stop announces `{record.title}` as the frame name.
- [ ] Back button returns focus to the Highlights landmark and
      announces "Showing Foleon highlights.".
- [ ] Gate-blocked Reader (e.g. a suppressed record) renders an
      `role="alert"` with the blocked copy — no iframe is mounted.

## Known limitations

- axe-core / automated WCAG scan is not integrated at the repo level.
  Manual verification remains the release authority until a repo-wide
  a11y tooling ADR lands.
- The Foleon publication content inside the iframe is third-party and
  not in scope for this checklist; tenant admins verify per
  publication in Foleon's own authoring tools.
- Focus restoration lands on the `<main>` element rather than a
  per-route heading ref. `<main>` has an `aria-label` and is therefore
  an accessible focus target; using a page-heading ref instead is a
  future refinement and not a current violation.
