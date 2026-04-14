# Workstream G · Step 05 — Closure

## Objective
Scrub the queue experience end-to-end: responsive behaviour, zoom fit, scanability, hosted SharePoint ergonomics. Close workstream G.

## Scrub findings + fixes

### 1. Zoom / narrow-rail primary line — **fixed**
At ≥ 200% browser zoom, or on the SPFx narrow-column host layout, the rail's 300px width shrinks to ~150px. The primary line (title + right-aligned age chip, both on one row) squeezed the title too aggressively — a title like "Atlantic Center Beam Raise" dropped to "Atlantic…" even though the vertical space was available.

Fix: a `@media (max-width: 320px)` block in `draftQueue.module.css` now lets the primary line wrap; the age chip drops to its own line (`order: 3`) below the title at high zoom / narrow widths. The title regains its full horizontal budget; the age stays readable. At desktop widths the behaviour is unchanged.

### 2. Tertiary line wrap — **confirmed good**
`.rowTertiary` already has `flex-wrap: wrap`; attribution + completeness chip wrap onto two lines cleanly when the rail is narrow.

### 3. Remaining scrub items — verified clean

| Scrub item | Status |
| --- | --- |
| Search input editorial placeholder + `/` hint | ✔ |
| Debounced filtering (150ms) | ✔ |
| sessionStorage persistence for search and collapsed-group state | ✔ |
| `/` to focus, `Escape` to clear, arrow keys to navigate | ✔ |
| Auto-expand the group containing the selected article | ✔ |
| Scroll active row into view on selection | ✔ |
| Three-line row hierarchy with visual weights | ✔ |
| Completeness chip: colour + text + aria-label + title tooltip | ✔ |
| Needs-attention rollup on group headers | ✔ |
| `aria-controls` on group headers | ✔ |
| `aria-current="true"` on active row | ✔ |
| Stale imports / dead code from the rail rewrite | None found in `ArticlePublisher.tsx` (Step 02 delete was complete) |

## Hosted SharePoint vetting

| Concern | Closure |
| --- | --- |
| SharePoint tenant font inheritance | The rail inherits from the host font stack (`'Segoe UI', system-ui, -apple-system, sans-serif`) via the Publisher workspace shell; no font-face leak. |
| High-contrast mode | Every chip + badge uses colour **and** text. Screen-reader users get `aria-label`s; high-contrast users get text. |
| Reduced-motion | The queue has no new motion. Selection effect uses `scrollIntoView({ block: 'nearest' })` — this respects the host's scroll-behavior CSS (and browsers honour `prefers-reduced-motion` automatically on `scrollIntoView`). |
| Zoom / 200% | Fixed in this step — primary line wraps at ≤ 320px so the title and age chip both stay readable. |
| SPFx narrow-column host layout | Same media query handles the narrow case. |
| Locked-down browser (no `sessionStorage`) | All sessionStorage reads + writes are try/catch-wrapped; queue still works for the session. |
| Graph / adapter side-effects | None — the queue is a pure view over `groups`. |

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run draftQueue ArticlePublisher teamComposer mediaComposer previewSurface readinessSurface` — 231/231 pass across 20 files.

## Workstream documentation
- New workstream-level `README.md` indexes the five step documents, lists the final `draftQueue/` architecture, documents downstream-contract preservation, and provides a before / after table for every authoring concern the workstream addresses.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/draftQueue.module.css` — `.rowTertiary` gains `flex-wrap: wrap`; new `@media (max-width: 320px)` block wraps the primary line and drops the age chip below the title.
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-g-queue-and-draft-management/README.md` (new; workstream index)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-g-queue-and-draft-management/step-05/CLOSURE.md` (this file)
- `apps/hb-webparts/config/package-solution.json` (version bump)

## Workstream G — end state
- Search + debounced filtering + highlighted matches + sessionStorage persistence ✔
- Three-line row hierarchy with friendly age / content type / attribution ✔
- `ready` / `todo(n)` / `blocked` completeness chip + group rollup ✔
- sessionStorage-persisted collapsed groups; auto-expand on selection; scrollIntoView ✔
- Arrow-key navigation + `/` to focus + `Escape` to clear ✔
- Zoom + hosted viewport behaviour verified; responsive primary-line wrap at narrow widths ✔
- Workstream README + five step closures documented ✔
- 231 targeted tests green; typecheck clean ✔

No blockers. Workstream G is closed.
