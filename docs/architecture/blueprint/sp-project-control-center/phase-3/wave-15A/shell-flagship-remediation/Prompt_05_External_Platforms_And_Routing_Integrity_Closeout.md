# Wave 15A — wave-b2 — Prompt 05 — External Platforms and Routing Integrity — Closeout

## 1. Execution Chronology (do not retcon)

The intended wave-b2 add-on sequence is Prompt 01 → 02 → 03 → 03A → 04 → 05 → 06. **Actual git chronology differs:**

| Order in git log | Commit        | Prompt                                                           |
| ---------------- | ------------- | ---------------------------------------------------------------- |
| 1                | `babdb4260`   | Wave-b2 Prompt 03A — External Platforms surface copy alignment   |
| 2                | `08cf2dbe2`   | Wave-b2 Prompt 02 — project identity + canvas boundary seam      |
| 3                | `a829730fc`   | Wave-b2 Prompt 03 — surface context de-duplication               |
| 4                | `1b26e7fed`   | Wave-b2 Prompt 04 — command preview and tabpanel a11y wiring     |
| 5                | _this commit_ | **Wave-b2 Prompt 05 — External Platforms and routing integrity** |

Add-on Prompt 01 (Add-On Scope Lock and Shell Ownership) remains pending. The closeout history for this package is **non-linear**: 03A landed first, then 02, 03, 04, and now 05 — diverging from the intended package sequence by owner choice. This closeout does not retcon that order.

## 2. Already Satisfied Before This Prompt (no change in this commit)

Prompt 05's nine implementation requirements were mostly already met by earlier work:

- **R1 — Tab label `External Platforms`** — landed by flagship Prompt 03 (`4df5bf3c8`), reinforced by Prompt 03A (`babdb4260`). `PccHorizontalTabs.tsx:12` `TAB_LABELS['external-systems']: 'External Platforms'`.
- **R2 — Surface page title `External Platforms Launch Pad`** — landed by Prompt 03A. The External Platforms surface header card uses `eyebrow={SURFACE.displayName}` (resolves to "External Platforms" from `PCC_MVP_SURFACES['external-systems'].displayName`) plus `title="Launch Pad"`; loading/error states in `PccExternalSystemsSurface.tsx` follow the same eyebrow + title split. Reading order: "External Platforms Launch Pad".
- **R3 — Supporting copy clarifying platforms are hosted outside the SharePoint project site** — already in `apps/project-control-center/src/shell/surfaceHeroCopy.ts:18-19` (`'Launch and mapping posture for platforms outside the SharePoint project site.'`), threaded to the shell hero band via `deriveShellHeroViewModel(...)`.
- **R4 — No user-facing `Apps` label** — flagship Prompt 03 closeout records the rename from `Apps` → `External Platforms`.
- **R5 — No `Systems` user-facing tab/product label** — `External Systems` user-facing copy was swept by Prompt 03A; only internal Wave 13–15 history JSDoc and the lowercase data-category phrasing remain (intentionally preserved).
- **R6 — TypeScript surface id `'external-systems'` preserved** — verified by Prompts 03 and 03A. Internal-id count unchanged at 75 references across `apps/project-control-center/src/`.
- **R7 — All eight surfaces remain visible and routable** — already covered by `PccShell.navigation.test.tsx` and `PccShell.surfaceSmoke.test.tsx`.
- **R9 — No URL/hash routing in this phase** — constraint, not a change.
- **Prompt 04 tabpanel ARIA** (`role="tabpanel"`, `aria-labelledby`, `aria-controls`) and the `[data-pcc-canvas]` marker on `<main>` — preserved verbatim. The Prompt 02 canvas seam (`border-top: 1px solid var(--pcc-color-border)` on `.canvas`) is intact.

## 3. Landed by This Prompt

The actual remaining gap was **R8 — invalid active surface falls back to Project Home**. Today the state hook accepted any string at runtime (TypeScript-only guard) and the router's `default:` dereferenced `PCC_MVP_SURFACES[unknown].displayName`, which would throw on an unknown id rather than fall back. This commit closes that gap with defense in depth and locks the External Platforms taxonomy with new invariants.

- **`apps/project-control-center/src/state/usePccShellState.ts`** — added a private `normalizeSurfaceId(id: unknown): PccMvpSurfaceId` helper that returns the input if it is a member of `PCC_MVP_SURFACE_IDS`, else `'project-home'`. Wired into the `useState` initializer and the `setActiveSurface` callback. All existing exports, the `previewMode` literal, and the controller shape are preserved. Stale state, untyped consumers, or future fixture data with bad ids now canonicalize at the state boundary.
- **`apps/project-control-center/src/shell/PccSurfaceRouter.tsx`** — replaced `default: break;` plus the throw-prone `PCC_MVP_SURFACES[activeSurfaceId as PccMvpSurfaceId].displayName` fallback render with `default: return <PccProjectHome readModelClient={readModelClient} />;`. Dropped the now-unused `PccDashboardCard`, `PccPreviewState`, and `PCC_MVP_SURFACES` imports. The eight named cases are unchanged. The router is the defense-in-depth backstop for any caller bypassing the typed state hook.
- **`apps/project-control-center/src/tests/usePccShellState.test.ts`** — added two new `it(...)` blocks asserting (a) initializing with an invalid `activeSurfaceId` falls back to `'project-home'`; (b) `setActiveSurface(invalidId)` resets the active surface to `'project-home'` from a previously valid id rather than accepting the invalid input.
- **`apps/project-control-center/src/tests/PccShell.invariants.test.tsx`** — added a new `describe` block with three lockdown invariants:
  - For each surface in `PCC_MVP_SURFACE_IDS`: clicking the tab leaves it as the only aria-selected tab; the hero secondary title contains the canonical `displayName` from `PCC_MVP_SURFACES`; the active panel marker matches the surface id; `<main data-pcc-canvas>` `aria-labelledby` matches `pcc-tab-${surfaceId}`. (Tab labels are intentionally shorter than displayName for some surfaces — `Team` for `Team & Access`, `Settings` for `Control Center Settings` — so the assertion does not require tab text to equal displayName.)
  - No tab text equals `'Apps'` and no tab text contains a standalone `Systems` product token (`/\bSystems\b/`).
  - The External Platforms active panel composes the visible text `External Platforms Launch Pad` (header card eyebrow + title combination).
- **`apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`** — updated the dormancy guard. The previous count "exactly six JSX prop usages of `readModelClient={...}` in `PccSurfaceRouter`" is now seven (six named cases + the new default Project Home fallback). The set-equality assertion below it (which still constrains which named cases consume the client) was not changed — it scopes to the original six surface ids only.
- **This closeout reconciliation document.**

## 4. Files Inspected

- `apps/project-control-center/src/state/usePccShellState.ts`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/shell/PccHorizontalTabs.tsx` (verified `TAB_LABELS` already correct; not edited)
- `apps/project-control-center/src/tests/usePccShellState.test.ts`
- `apps/project-control-center/src/tests/PccShell.invariants.test.tsx`
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`
- `apps/project-control-center/src/shell/surfaceHeroCopy.ts` (verified copy already correct; not edited)
- `apps/project-control-center/src/shell/PccShell.tsx` and `.module.css` (Prompts 02 + 04 contract preserved; not edited)

## 5. Files Changed

Source of truth: `git diff --cached --name-only` after staging.

| File                                                                                                                                                               | Kind                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `apps/project-control-center/src/state/usePccShellState.ts`                                                                                                        | M — `normalizeSurfaceId` helper + wiring       |
| `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`                                                                                                       | M — `default:` Project Home fallback           |
| `apps/project-control-center/src/tests/usePccShellState.test.ts`                                                                                                   | M — two new invalid-id fallback assertions     |
| `apps/project-control-center/src/tests/PccShell.invariants.test.tsx`                                                                                               | M — External Platforms taxonomy describe block |
| `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`                                                                                                   | M — dormancy guard count 6 → 7                 |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_05_External_Platforms_And_Routing_Integrity_Closeout.md` | A — this closeout                              |

## 6. Tri-State Status

- **Prior posture no longer observed:**
  - `usePccShellState` accepted any string at runtime (TypeScript-only guard);
  - `PccSurfaceRouter` `default:` case dereferenced `PCC_MVP_SURFACES[unknown].displayName` and would throw on an unknown id rather than fall back to a known surface.
- **Current target landed:**
  - invalid active-surface id → Project Home in both `usePccShellState` (state-boundary normalization) and `PccSurfaceRouter` (default-case backstop);
  - per-surface tab/hero/panel/aria-labelledby agreement locked across all eight surfaces;
  - `Apps` and standalone `Systems` product tokens explicitly forbidden in tab text;
  - the "External Platforms Launch Pad" composed page title is locked on the active panel.
- **Known intact:**
  - Prompt 02 canvas seam (`border-top: 1px solid var(--pcc-color-border)` on `.canvas`) and canvas-marker test;
  - Prompt 03 surface context de-dup posture (no `PccSurfaceContextHeader` on happy-path; degraded-state mounts retained; shell-hero-leak invariants; Team & Access non-empty body invariants);
  - Prompt 03A copy alignment — user-facing `External Platforms` / `External Platforms Launch Pad`; internal `'external-systems'` ID preserved in routing, discriminators, data attributes, type members, switch cases, file/folder/component names (75 references, unchanged);
  - Prompt 04 command preview (non-focusable preview capsule, no `<input>` / `<button>` / `<a>`) and tabpanel ARIA wiring (`id="pcc-active-surface-panel"`, `role="tabpanel"`, `aria-labelledby`, `aria-controls`);
  - shell hero contract (mandatory + excluded fact set, primary/secondary title, surface description);
  - `PccBentoGrid` direct-child invariant;
  - tab keyboard navigation contract;
  - SPFx manifest, `package-solution.json`, and `pnpm-lock.yaml` parity (lockfile MD5 `c56df7b79986896624536aab74d609f4` unchanged before/after).

## 7. Validation Results

```bash
git status --short
# (only in-scope files; no manifest/version-bump files staged)

md5 pnpm-lock.yaml
# c56df7b79986896624536aab74d609f4   (before)

pnpm --filter @hbc/models check-types
# tsc --noEmit clean

pnpm --filter @hbc/spfx-project-control-center check-types
# tsc --noEmit clean

pnpm --filter @hbc/spfx-project-control-center test -- --run
# 85 test files / 1785 tests / 0 failures
# (+12 over prior 1773 baseline: 8 per-surface tab/hero/panel agreement
#  cases + 1 Apps/Systems negative + 1 External Platforms Launch Pad
#  composed title + 2 invalid-id fallback in usePccShellState. The
#  dormancy guard test count change (6 -> 7) does not add a new test, it
#  just updates the existing assertion.)

pnpm exec prettier --check <changed-files>
# All matched files use Prettier code style!

git diff --check
# clean

# Regression-guard greps
grep -rn "External Systems" apps/project-control-center/src/surfaces \
  | grep -v "external-systems"
# → 11 hits, all internal Wave 13–15 history JSDoc / architecture comments
#   under apps/project-control-center/src/surfaces/externalSystems/**,
#   surfaces/documents/PccDocumentsSurface.tsx, and
#   surfaces/approvals/approvalsAdapter.ts. No user-facing JSX or rendered
#   string regression. Count unchanged from Prompt 03 commit.

grep -n "border-top" apps/project-control-center/src/shell/PccShell.module.css
# → 16: border-top: 1px solid var(--pcc-color-border);  (Prompt 02 seam intact)

grep -n "ACTIVE_PANEL_ID\|pcc-active-surface-panel" apps/project-control-center/src/shell/PccShell.tsx
# → 72: const ACTIVE_PANEL_ID = 'pcc-active-surface-panel';
#   110:        panelId={ACTIVE_PANEL_ID}
#   113:        id={ACTIVE_PANEL_ID}      (Prompt 04 tabpanel ARIA intact)

grep -n "'Apps'" apps/project-control-center/src/shell/PccHorizontalTabs.tsx
# → zero hits

grep -n "'External Systems'" apps/project-control-center/src/shell/PccHorizontalTabs.tsx
# → zero hits

grep -rn "'external-systems'" apps/project-control-center/src | wc -l
# → 75   (unchanged from prior commit; internal IDs preserved)

md5 pnpm-lock.yaml
# c56df7b79986896624536aab74d609f4   (after — match)
```

Hosted/tenant proof: **operator-pending, not in scope.**

## 8. Guardrails Preserved

- No rename of internal TypeScript surface id `'external-systems'`.
- No edits to `PccMvpSurfaces.ts`, `PccHorizontalTabs.tsx`, `PccProjectHeroBand.tsx`, `surfaceHeroCopy.ts`, `PccShell.tsx`, `PccShell.module.css`, `PccCommandSearch.tsx`, or any surface file under `apps/project-control-center/src/surfaces/**`.
- No edits to `@hbc/models/**`.
- No URL/hash routing, no URL state.
- No routing architecture changes — the `PccSurfaceRouter` switch on `PccMvpSurfaceId` stays. Adding the `default:` Project Home return is a fallback addition, not an architecture change.
- No new tab icons, no sticky/fixed shell, no fake SharePoint chrome.
- No backend / API / Graph / PnP / Procore runtime changes.
- No SPFx package or manifest version bump.
- No `pnpm-lock.yaml` drift.
- No `git push`.
- No final 56/56 doctrine claim.
- No regression of Prompt 02 canvas seam, Prompt 03 surface context de-dup, Prompt 03A copy alignment, or Prompt 04 command preview / tabpanel ARIA.

## 9. Residual Risk and Judgment Calls

- **Defense-in-depth fallback.** Both `usePccShellState` and `PccSurfaceRouter` now handle unknown ids — overlap is intentional. The state hook canonicalizes input at the boundary; the router's `default:` is a backstop for any bypass (e.g., a future caller that constructs the controller manually or threads an `activeSurfaceId` directly into `<PccSurfaceRouter>`). If a future prompt prefers single-source-of-truth normalization, the router's `default:` can be tightened to `unreachable` semantics — out of scope here.
- **Dormancy-guard count update.** The `pcc-api-dormancy` test counts JSX `readModelClient={...}` usages in the router source. The count change (6 → 7) reflects the new default fallback rendering Project Home with the read-model client threaded through. The set-equality assertion below (which constrains which **named** cases consume the client) was not changed and continues to enforce the six-surface read-model consumer set.
- **`Apps` / `Systems` invariant scope.** The negative tab-text assertion uses `\bSystems\b` to avoid false positives on legitimate substrings inside compound words. It scans tab `textContent` only, not panel content (where lowercase data-category language like "external systems" and internal Wave 13–15 JSDoc still legitimately reference the term). Documented so future maintainers don't widen the scope and trip on category language.
- **Tab labels intentionally shorter than displayName.** Two surfaces use shorter tab labels than `PCC_MVP_SURFACES.displayName` (`Team` for `Team & Access`, `Settings` for `Control Center Settings`). The per-surface consistency invariant therefore asserts the hero secondary title contains the full displayName but does not require tab text to equal displayName — the tab is a visual rail, the hero is the canonical identity reference.
- **Stop-condition.** Implementation did not require model-layer migration; `PCC_MVP_SURFACE_IDS` already exports the eight ids needed for runtime validation.

## 10. Next-Prompt Handoff

- **Prompt 01:** still pending. Scope unchanged.
- **Prompt 02:** intact.
- **Prompt 03:** intact.
- **Prompt 03A:** intact.
- **Prompt 04:** intact.
- **Prompt 06 (Host Fit, Responsive Evidence, and Closeout):** scope unchanged. The new fallback logic and lockdown invariants are responsive-mode-agnostic and should not require host-fit revisions. Prompt 06 may want to add hosted-evidence captures of the External Platforms surface and tabpanel ARIA across responsive modes; that's its own scope.

Hosted/tenant proof remains **operator-pending**.
