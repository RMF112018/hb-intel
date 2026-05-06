# Wave 15A — wave-b2 — Prompt 04 — Command Preview and Active Panel Accessibility — Closeout

## 1. Execution Chronology (do not retcon)

The intended wave-b2 add-on sequence is Prompt 01 → 02 → 03 → 03A → 04 → 05 → 06. **Actual git chronology differs:**

| Order in git log | Commit        | Prompt                                                             |
| ---------------- | ------------- | ------------------------------------------------------------------ |
| 1                | `babdb4260`   | Wave-b2 Prompt 03A — External Platforms surface copy alignment     |
| 2                | `08cf2dbe2`   | Wave-b2 Prompt 02 — project identity + canvas boundary seam        |
| 3                | `a829730fc`   | Wave-b2 Prompt 03 — surface context de-duplication and state model |
| 4                | _this commit_ | **Wave-b2 Prompt 04 — command preview and tabpanel a11y wiring**   |

Add-on Prompt 01 (Add-On Scope Lock and Shell Ownership) remains pending. The closeout history for this package is **non-linear**: 03A landed first, 02 second, 03 third, this prompt 04 fourth — diverging from the intended package sequence by owner choice. This closeout does not retcon that order.

## 2. Already Satisfied Before This Prompt (no change in this commit)

- `PccHorizontalTabs.tsx` already accepts a `panelId` prop, stamps `aria-controls={panelId}` on every tab, and emits `id="pcc-tab-${surfaceId}"` per tab. The wiring on the tab side was already prepared by earlier work; this commit only completes the receiving end.
- Tab keyboard navigation contract (ArrowLeft/ArrowRight/Home/End/Enter/Space) is already exhaustively tested in `PccShell.navigation.test.tsx`.
- `prefers-reduced-motion` media query in `PccHorizontalTabs.module.css` (flagship Prompt 03).
- Prompt 02 canvas seam (`border-top: 1px solid var(--pcc-color-border)` on `.canvas`) and the `[data-pcc-canvas]` marker test on `<main>` (`08cf2dbe2`).
- Prompt 03 surface context de-dup posture and shell-hero-leak / Team & Access invariants (`a829730fc`).
- Prompt 03A External Platforms copy alignment (`babdb4260`).

## 3. Landed by This Prompt

- **`PccCommandSearch.tsx` rewritten** as a purely informational, non-focusable preview capsule for both variants. Renders a single `<div>` with two `<span>` children (title + helper); no `<input>`, `<button>`, `<a>`, no `role`/`tabindex`, no `aria-label` override. Visible text carries the accessible name:
  - title (visible): `Command Search — Preview`
  - helper (visible): `Search and project commands are unavailable in this preview.`
  - markers preserved: `data-pcc-command-search="expanded"` / `="icon"` (variant signal still drives layout in CSS and is asserted by existing hero-band tests).
  - new marker: `data-pcc-command-search-state="preview"` for direct test selection.
  - The `Search` icon import was dropped — it's not needed once the affordance is text-only.
- **`PccCommandSearch.module.css` created** with PCC-token-driven preview-capsule classes (`previewCapsule`, `previewTitle`, `previewHelper`). Light-theme tokens (`--pcc-color-canvas`, `--pcc-color-border`, `--pcc-color-text-primary`, `--pcc-color-text-muted`, `--pcc-radius-md`, `--pcc-space-*`). No hex literals. The `[data-pcc-command-search='icon']` attribute selector tightens spacing and clamps the helper to one line in compact mode (helper still visible, just compressed).
- **CSS import switched** in `PccCommandSearch.tsx` from `'./PccProjectIntelligenceHeader.module.css'` to `'./PccCommandSearch.module.css'`.
- **`PccShell.tsx` ARIA wiring completed.** A new `ACTIVE_PANEL_ID = 'pcc-active-surface-panel'` constant is defined once. The `<main>` element now carries `id={ACTIVE_PANEL_ID}`, `role="tabpanel"`, and `aria-labelledby={`pcc-tab-${activeSurfaceId}`}`. `<PccHorizontalTabs>` is mounted with `panelId={ACTIVE_PANEL_ID}`. The Prompt 02 `className={styles.canvas}`, `data-pcc-canvas=""` marker, and `<PccBentoGrid>` direct child are preserved verbatim.
- **`PccProjectHeroBand.test.tsx` test rewritten:** the previously-passing `renders the disabled command-search affordance inside the hero` test (which asserted `<button>` or `<input>` exists) is replaced with assertions that no `<input>` / `<button>` / `<a>` renders inside `[data-pcc-hero-command-search]`, that the new `data-pcc-command-search-state="preview"` marker is present, and that the visible text content includes both the title and helper sentence.
- **`PccShell.responsive.test.tsx` extended** with five new assertions:
  - tabpanel ARIA contract (`<main>` has `id="pcc-active-surface-panel"`, `role="tabpanel"`, initial `aria-labelledby="pcc-tab-project-home"`; every tab has `aria-controls="pcc-active-surface-panel"`);
  - `aria-labelledby` updates after a tab click (uses `fireEvent.click` to dispatch the React-listened synthetic event);
  - no `<input type="search">` renders anywhere in `<PccApp />`;
  - the command-search slot has zero focusable descendants (`input,button,a,select,textarea`) and zero `[tabindex="0"]` elements at both `standardLaptop` and `phone` modes.
- **This closeout reconciliation document.**

## 4. Files Inspected

- `apps/project-control-center/src/shell/PccCommandSearch.tsx`
- `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.module.css` (legacy CSS source — confirmed no other consumer)
- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccHorizontalTabs.tsx` (verified panel-id wiring already present; not edited)
- `apps/project-control-center/src/shell/PccProjectHeroBand.tsx` and `.module.css` (slot wrapper unchanged)
- `apps/project-control-center/src/shell/PccShell.module.css` (Prompt 02 canvas seam — preserved verbatim)
- `apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx`
- `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`

## 5. Files Changed

Source of truth: `git diff --cached --name-only` after staging.

| File                                                                                                                                                                     | Kind                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `apps/project-control-center/src/shell/PccCommandSearch.tsx`                                                                                                             | M — full rewrite to non-interactive preview capsule                             |
| `apps/project-control-center/src/shell/PccCommandSearch.module.css`                                                                                                      | A — new preview-capsule CSS module (PCC tokens only)                            |
| `apps/project-control-center/src/shell/PccShell.tsx`                                                                                                                     | M — `ACTIVE_PANEL_ID` constant + tabpanel ARIA on `<main>` + `panelId` threaded |
| `apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx`                                                                                                      | M — command-search test rewritten                                               |
| `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`                                                                                                     | M — five new assertions (tabpanel + non-focusable + no-input)                   |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_04_Command_Preview_And_Active_Panel_Accessibility_Closeout.md` | A — this closeout                                                               |

## 6. Tri-State Status

- **Prior posture no longer observed:**
  - keyboard-focusable `<input type="search" readOnly>` rendered in the wide variant of `PccCommandSearch` with placeholder copy "Search the project control center…";
  - disabled `<button>` rendered in the compact variant;
  - `<main data-pcc-canvas>` without `id`, `role="tabpanel"`, or `aria-labelledby`;
  - tabs stamping `aria-controls={undefined}` because no `panelId` was threaded.
- **Current target landed:**
  - non-focusable `<div>` preview capsule with locked title + helper copy as visible text;
  - `<main>` is the named tabpanel (`id="pcc-active-surface-panel"`, `role="tabpanel"`, `aria-labelledby` → active tab);
  - `<PccHorizontalTabs panelId="pcc-active-surface-panel">` so every tab carries the matching `aria-controls`;
  - structural invariants in tests prevent regression to a focusable affordance or a missing tabpanel relationship.
- **Known intact:**
  - Prompt 02 canvas seam (`border-top: 1px solid var(--pcc-color-border)` on `.canvas`) and canvas-marker test;
  - Prompt 03 surface context de-dup posture (`PccSurfaceContextHeader` not on happy-path; degraded-state mounts retained; shell-hero-leak invariants; Team & Access non-empty body invariants);
  - Prompt 03A copy alignment — user-facing `External Platforms` / `External Platforms Launch Pad` unchanged; internal `'external-systems'` ID preserved;
  - shell hero contract (mandatory + excluded fact set, primary/secondary title, surface description);
  - `PccBentoGrid` direct-child invariant — no JSX restructure under `<main>`;
  - eight-surface routing through `PccSurfaceRouter`;
  - tab keyboard navigation contract (ArrowLeft/ArrowRight/Home/End/Enter/Space) — exhaustive existing test suite stays green;
  - `prefers-reduced-motion` media query in `PccHorizontalTabs.module.css` — no new motion added in this prompt;
  - SPFx manifest, `package-solution.json`, and `pnpm-lock.yaml` parity (lockfile MD5 `c56df7b79986896624536aab74d609f4` unchanged before/after).

## 7. Validation Results

```bash
git status --short
# (only in-scope files; no manifest/version-bump files staged)

md5 pnpm-lock.yaml
# c56df7b79986896624536aab74d609f4   (before)

pnpm --filter @hbc/spfx-project-control-center check-types
# tsc --noEmit clean

pnpm --filter @hbc/spfx-project-control-center test -- --run
# 85 test files / 1773 tests / 0 failures
# (+4 over prior 1769 baseline: 4 new assertions in PccShell.responsive.test.tsx;
#  the rewritten PccProjectHeroBand command-search test counts the same one
#  it as before but with new internal expectations.)

pnpm exec prettier --check <changed-files>
# All matched files use Prettier code style!

git diff --check
# clean

# Regression-guard greps
grep -rn "type=\"search\"" apps/project-control-center/src/shell
# → zero hits (no <input type="search"> reintroduced)

grep -rn "External Systems" apps/project-control-center/src/surfaces \
  | grep -v "external-systems"
# → 9 hits, all internal Wave 13–15 history JSDoc (unchanged from Prompt 03 commit)

grep -n "border-top" apps/project-control-center/src/shell/PccShell.module.css
# → 16: border-top: 1px solid var(--pcc-color-border);  (Prompt 02 seam intact)

md5 pnpm-lock.yaml
# c56df7b79986896624536aab74d609f4   (after — match)
```

Hosted/tenant proof: **operator-pending, not in scope.**

## 8. Guardrails Preserved

- No `<input>`, `<button>`, `<a>`, or any focusable interactive element inside the command-search affordance.
- No `aria-label`/`aria-labelledby` override on the capsule (visible text carries the accessible name).
- No edits to `PccProjectIntelligenceHeader.module.css` (its `searchField` / `searchInput` / `searchIcon` classes are now orphaned — see Residual Risk).
- No edits to `PccProjectHeroBand.tsx` / `.module.css`.
- No edits to `PccHorizontalTabs.tsx` / `.module.css`.
- No edits to `PccApp.tsx`, `projectShellViewModel.ts`, `PccSurfaceRouter.tsx`, or any surface file.
- No edits to `@hbc/models/**`.
- No backend / API / Graph / PnP / Procore runtime changes.
- No SPFx package or manifest version bump.
- No `pnpm-lock.yaml` drift.
- No `git push`.
- No final 56/56 doctrine claim.
- No regression of Prompt 02 canvas seam, Prompt 03 surface context de-dup, or Prompt 03A copy alignment.
- No broadening into Prompt 05 routing-integrity or Prompt 06 host-fit-evidence scope.

## 9. Residual Risk and Judgment Calls

- **Legacy CSS orphan.** `PccProjectIntelligenceHeader.module.css` still defines `.searchField`, `.searchInput`, `.searchIcon`, `.header`, `.identity`, `.eyebrow`, `.commandArea` classes. After this commit's import switch, no consumer references those classes. The module file itself is **not on this prompt's allowed list**, so it remains in place. Recommend a future docs-or-cleanup prompt to delete the file (or its orphaned classes) once a broader scope authorizes it. Verified at edit time via `grep -rn "PccProjectIntelligenceHeader" apps/project-control-center/src` that nothing else imports from it.
- **`variant` prop kept for layout signal.** Even though both variants now render the same non-interactive capsule, the `variant: 'expanded' | 'icon'` prop and the `data-pcc-command-search="<variant>"` marker are retained because (a) they distinguish wide vs compact layout via the CSS attribute selector (`[data-pcc-command-search='icon']` tightens spacing and clamps helper text), and (b) existing tests at `PccProjectHeroBand.test.tsx:172-188` rely on the marker and stay green.
- **No `aria-label` override on the capsule.** Per owner direction, the capsule's accessible name comes from its visible text (title + helper). Adding an `aria-label` would silently override the visible text for screen readers, creating a discrepancy. If a future a11y audit prefers an explicit accessible name, the cleanest path is a heading element (e.g., a visually-hidden `<h3>`) rather than reintroducing `aria-label`.
- **`fireEvent.click` for the tab-click test.** A direct `documentsTab!.click()` does not re-render React state in the test runner; the assertion needed `fireEvent.click(documentsTab!)` to trigger React's synthetic-event path. Existing `PccShell.navigation.test.tsx` already uses `fireEvent` consistently, so this aligns the new test with the established pattern.
- **`Search` icon dropped.** The legacy capsule visually carried a search glyph. The new capsule is text-only — no icon. If product feedback wants the glyph back for visual continuity, render it as a decorative `<Search aria-hidden="true" />` inside the capsule; do not add `aria-label` or interactive role.

## 10. Next-Prompt Handoff

- **Prompt 01 (Add-On Scope Lock and Shell Ownership):** still pending. Scope unchanged.
- **Prompt 02 (project identity + canvas seam):** intact.
- **Prompt 03 (surface context de-dup):** intact. Shell-hero-leak invariants and Team & Access non-empty body invariants still pass.
- **Prompt 03A (External Platforms copy alignment):** intact.
- **Prompt 05 (External Platforms and Routing Integrity):** scope unchanged. Router shape, switch cases, and surface IDs untouched.
- **Prompt 06 (Host Fit, Responsive Evidence, and Closeout):** scope unchanged. The new tabpanel wiring is responsive-mode-agnostic and should not require host-fit revisions.

Hosted/tenant proof remains **operator-pending**.
