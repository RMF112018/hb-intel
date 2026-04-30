# Phase 3 — Wave 5 Closeout (PCC Priority Actions Rail)

| Field | Value |
| --- | --- |
| Phase | 3 |
| Wave | 5 — PCC Priority Actions Rail |
| Status | **Complete** |
| Date | 2026-04-30 |
| Audited HEAD | `570e8136d` |
| `@hbc/spfx-project-control-center` version | `0.0.1` (unchanged across Wave 5) |
| `pnpm-lock.yaml` md5 | `c56df7b79986896624536aab74d609f4` (unchanged across Wave 5) |
| Implementation prompts | 01–06 (landed); 07 (this closeout) |

---

## 1. Executive summary

Wave 5 delivers an **MVP Priority Actions Rail** inside the existing `PccPriorityActionsCard` slot on Project Home. The rail surfaces four canonical groups (`access-requests`, `readiness-blockers`, `approval-checkpoints`, `external-system-mapping`) derived from the existing 10-category shared model via an **app-local grouping adapter**. The rail consumes the existing Wave 3 backend `priority-actions` route under the **explicit-backend-opt-in seam** that was landed in Wave 4 (Prompt 03/05); default fixture rendering remains bit-identical to Wave 4. Three of the ten shared categories — `documents`, `health`, `safety` — are deliberately suppressed from the user-facing MVP rail per W5-OD-005.

Wave 5 introduces no new top-level surface, no shared-model rewrite, no direct `HbcPriorityRail` reuse, no live runtime, no auth wiring, no write routes, and no deployment artifacts. All rail row affordances are non-executing preview-only spans.

The wave landed across seven commits (Prompts 01–06 + Prompt 07 closeout) with no `pnpm-lock.yaml` mutation and no package version bump.

---

## 2. Prompt-by-prompt index

> **Note on per-prompt closeouts.** Per-prompt closeout files (`Wave_5_Prompt_NN_Closeout.md`) were **not** created on disk for Prompts 02–06 in Wave 5. The canonical proof references for each prompt are the **landed commit SHA** plus the **tests / docs added or modified by that commit**. This closeout document is the durable wave-end record.

| Prompt | Commit | Conventional summary | Scope |
| --- | --- | --- | --- |
| 01 | `206d77145` | `docs(pcc): open wave 5 priority actions rail planning` | Scope lock + closed decisions register opened (`Wave_5_Scope_Lock.md`, `Wave_5_Closed_Decisions.md`). |
| 02 | `4c9715be7` | `feat(spfx-pcc): add priority actions rail adapter` | App-local view-model + grouping adapter; 10-category → 4-group mapping; `documents` / `health` / `safety` suppression; tone + sort rules. |
| 03 | `e2edd9200` | `feat(spfx-pcc): add priority actions rail UI` | Presentational `PccPriorityActionsRail` (+ CSS module). Inert non-executing affordances. PCC-local component (no `HbcPriorityRail` import). |
| 03 fix | `581f44337` | `fix(spfx-pcc): add visible priority tone label to rail rows` | Visible `Priority: High|Medium|Low` text label per row (color-non-only signaling). |
| 04 | `6c096c55f` | `feat(spfx-pcc): integrate priority actions rail into project home` | Card → rail handoff via `PccPriorityActionsCard`. Preserves 10-card bento + single `[data-pcc-active-surface-panel="project-home"]` invariant. |
| 05 | `9007e0a72` | `feat(spfx-pcc): wire priority actions route into backend opt-in project home` | Project Home consumer interface extended with `getPriorityActions`. Hook calls three routes via `Promise.all`. Adapter prefers standalone envelope; falls back to home envelope when absent. |
| 06 | `570e8136d` | `test(spfx-pcc): harden wave 5 priority actions rail guardrails` | New `HbcPriorityRail` source-scan in `pcc-api-dormancy.test.ts` (import + identifier). README Wave 5 truth subsection. |
| 07 | _this closeout_ | `docs(pcc): close wave 5 priority actions rail` | This document. |

---

## 3. Implemented files (grouped)

### `apps/project-control-center/src/surfaces/projectHome/`
- `priorityActionsRailViewModel.ts` — view-model contract: `IPccPriorityActionsRailViewModel`, group meta, canonical group ID order.
- `priorityActionsRailAdapter.ts` — grouping adapter: 10-category → 4-group mapping, `SUPPRESSED_CATEGORIES = ['documents', 'health', 'safety']`, tone-then-due-then-id sort.
- `priorityActionsRailAdapter.test.ts` — coverage of grouping, suppression count (`7 visible / 3 suppressed`), sort order, tone derivation.
- `PccPriorityActionsRail.tsx` + `PccPriorityActionsRail.module.css` — presentational rail. `<section>` per group, `role="list"`, visible `Priority: <Tone>` text per row, `data-pcc-priority-rail-disabled-action` "Preview only" spans.
- `PccPriorityActionsRail.test.tsx` — empty rail state, inert affordance markers, visible tone labels per row.
- `PccPriorityActionsCard.tsx` — card wrapper. Renders `PccPriorityActionsRail` only when `state === 'preview'`; otherwise renders `PccPreviewState`.
- `projectHomeViewModel.ts` — narrow `IPccProjectHomeReadModelClient` consumer interface extended with `getPriorityActions(...)` (Prompt 05).
- `projectHomeAdapter.ts` — adapter input extended with optional `priorityActions?: PccReadModelEnvelope<PccPriorityActionsReadModel>`. Standalone envelope wins; absent envelope preserves home-derived fallback.
- `projectHomeAdapter.test.ts` — three new scenarios (standalone wins / backend-unavailable affects only rail slot / absent envelope preserves fallback) plus existing uniform/mixed/sparse coverage.
- `useProjectHomeReadModel.ts` — three-method `Promise.all` (`getProjectHome` + `getPriorityActions` + `getDocumentControl`); mounted-flag cancellation preserved.
- `useProjectHomeReadModel.test.ts` — three-method spy + standalone-envelope wins + backend-unavailable rail-slot-only error + refetch on client identity change.

### `apps/project-control-center/src/tests/`
- `PccProjectHome.test.tsx` — 10-card bento direct-child invariant; single `[data-pcc-active-surface-panel="project-home"]`; rail renders SAMPLE_PRIORITY_ACTIONS with 7 visible rows; visible `Priority: <Tone>` labels per row; inert affordances; no http/https hrefs; non-preview state renders `PccPreviewState` instead of the rail.
- `PccApp.optIn.test.tsx` — default fixture path (no fetch), explicit fixture mode (no fetch), explicit backend mode (exactly three GETs to `/home`, `/priority-actions`, `/document-control`, all `method: 'GET'`), backend mode without baseUrl (no fetch + safe error states), non-Project-Home surface (no client method invoked — `getProjectHome` / `getPriorityActions` / `getDocumentControl` spies all zero).
- `pcc-api-dormancy.test.ts` — Prompt 06 added two new `it()` blocks scanning all `apps/project-control-center/src/**/*.{ts,tsx}` for `HbcPriorityRail` import paths and identifier references (comment- and string/regex-stripped). Existing `fetch(` allowlist, GET-only, single-`readModelClient` consumer, forbidden-API-identifier, and forbidden-runtime-import scans preserved unchanged.

### `apps/project-control-center/README.md`
- New `### Wave 5 Priority Actions Rail (Project Home)` subsection added in Prompt 06 documenting: PCC-local rail (no `HbcPriorityRail` reuse), suppressed categories (`documents`, `health`, `safety`), non-executing affordances, non-preview states render `PccPreviewState` instead of the rail.
- The Wave 4 paragraph above was refined in Prompt 05 to state Project Home consumes three routes under explicit backend opt-in (`/home`, `/priority-actions`, `/document-control`).

### `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/`
- `Wave_5_Scope_Lock.md` — opened in Prompt 01.
- `Wave_5_Closed_Decisions.md` — opened in Prompt 01.
- `Wave_5_Closeout.md` — this file (Prompt 07).

### Unchanged across Wave 5

- `packages/**` — no changes. The shared 10-category `PriorityAction` model in `packages/models/src/pcc/PriorityActions.ts` is preserved (W5-OD-007 deferred).
- `backend/**` — no changes. The Wave 3 standalone `priority-actions` route at `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` (handler `getPccProjectPriorityActions`, path `pcc/projects/{projectId}/priority-actions`) is consumed only — never edited.
- `apps/project-control-center/src/api/**` — no changes. The Wave 4 `pccBackendReadModelClient.ts` already exposed `getPriorityActions`; no transport file added or modified.
- `apps/project-control-center/src/mount.tsx`, `PccApp.tsx`, `shell/PccSurfaceRouter.tsx` — no changes. Surface router still threads `readModelClient` to exactly one surface (`'project-home'`).
- `pnpm-lock.yaml` — md5 unchanged.
- `package.json` files — no version bump; `@hbc/spfx-project-control-center` remains `0.0.1`.
- `.github/**`, manifests, deployment files — no changes.
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`, `phase-3/05_Phase_3_Development_Roadmap_Updated.md`, `phase-3/07_Phase_3_Module_Implementation_Plan.md` — no edits (per W5-OD-008).
- Wave 4 closeout docs under `phase-3/wave-4/**` — no edits.

---

## 4. Final Wave 5 runtime posture

Project Control Center remains a **preview app** with **fixture-default** behavior. Wave 5 changes the *visual content* of the Priority Actions card on Project Home, not the runtime contract.

- **Default `<PccApp />` / `mount(el)`**: zero `fetch(` calls; rail renders from `SAMPLE_PRIORITY_ACTIONS` via the Wave 4 fixture path.
- **Explicit fixture mode** (`mount(el, ctx, { readModel: { readModelMode: 'fixture' } })`): zero `fetch(` calls; identical visual output.
- **Explicit backend mode** (`mount(el, ctx, { readModel: { readModelMode: 'backend', backendBaseUrl: '<host>' } })`): exactly three GET calls — `/home`, `/priority-actions`, `/document-control` — issued in parallel via `Promise.all`. All three go through the existing `pccBackendReadModelClient.ts`. No new transport file, no new `fetch(` callsite.
- **Backend mode without `backendBaseUrl`**: zero `fetch(` calls; cards render safe `state: 'error'` via the Wave 4 safe-fallback path.
- **Other surfaces** (Documents, Site Health, External Systems, Team & Access, Project Readiness, Approvals, Control Center Settings): remain fixture/preview-driven; the read-model client is threaded only to Project Home.

Wave 5 does not introduce auth wiring, write routes, Graph/PnP/SharePoint REST, Procore, Document Crunch, Adobe Sign, persona derivation, action execution, approval execution, Site Health repair, Team & Access permission mutation, packaging, or deployment. The runtime posture relative to Wave 4 is unchanged outside the addition of the third Project Home GET.

---

## 5. Final rail placement

The Priority Actions Rail renders **inside the existing `PccPriorityActionsCard` slot** of the 10-card Project Home bento grid. **No new top-level surface, no router/shell expansion, no new `PccSurfaceRouter` branch, no new MVP surface ID.** The 10-card bento (`PccProjectIntelligenceCard`, `PccPriorityActionsCard`, `PccSiteHealthSummaryCard`, `PccDocumentControlCard`, `PccProjectReadinessCard`, `PccApprovalsCheckpointsCard`, `PccExternalSystemsCard`, `PccTeamSnapshotCard`, `PccMissingConfigurationsCard`, `PccRecentActivityCard`) is preserved unchanged.

---

## 6. Final four-group mapping posture

Four canonical user-facing groups, rendered in this canonical order:

1. `access-requests`
2. `readiness-blockers`
3. `approval-checkpoints`
4. `external-system-mapping`

The mapping from the 10 canonical `PriorityActionCategory` values to these four groups is implemented **app-locally** in `priorityActionsRailAdapter.ts` (per W5-OD-001, W5-OD-007). The shared model in `packages/models/src/pcc/PriorityActions.ts` was **not** rewritten or extended.

Mapping rules (summary):
- `'approval'` → `approval-checkpoints`
- `'procore-sync'` → `external-system-mapping`
- `relatedWorkCenter === 'team-and-access'` → `access-requests`
- `'workflow' | 'compliance' | 'inspection' | 'permit' | 'closeout'` → `readiness-blockers`
- Default fallback → `readiness-blockers`

Sort within each group: tone (`high < medium < low`) → due date (ascending) → id.

---

## 7. Default-fixture proof

`apps/project-control-center/src/tests/PccApp.optIn.test.tsx` covers:

- **`PccApp default fixture path` → renders all 10 cards without invoking fetch when no readModelClient is supplied** — asserts `fetchSpy).not.toHaveBeenCalled()` and 10 `[data-pcc-card]` elements.
- **`mount(...) opt-in` → does not invoke fetch in explicit fixture mode** — asserts `fetchSpy).not.toHaveBeenCalled()`; rail still renders from `SAMPLE_PRIORITY_ACTIONS`.

`apps/project-control-center/src/tests/PccProjectHome.test.tsx` adds, on the default fixture path: rail renders 7 visible rows (per `priorityActionsRailAdapter` suppression of `documents` / `health` / `safety`), each row carries a visible `Priority: <Tone>` label, no anchor element on Project Home carries an `http`/`https` href.

---

## 8. Explicit backend opt-in three-GET proof

`apps/project-control-center/src/tests/PccApp.optIn.test.tsx`, test **`mount(el, ctx, { readModel: { readModelMode: "backend", backendBaseUrl } }) invokes fetch with the canonical URLs (GET only)`**:

- `fetchSpy).toHaveBeenCalledTimes(3)`
- Sorted URL set equals `[DOC_URL, HOME_URL, PRIORITY_URL]` derived from:
  - `https://example.invalid/api/pcc/projects/<id>/home`
  - `https://example.invalid/api/pcc/projects/<id>/priority-actions`
  - `https://example.invalid/api/pcc/projects/<id>/document-control`
- All three calls assert `init?.method === 'GET'`.
- All three flow through the existing `apps/project-control-center/src/api/pccBackendReadModelClient.ts`. No new transport file. No new `fetch(` callsite (the `pcc-api-dormancy.test.ts` `fetch(` allowlist remains scoped to that one client + its direct test).

The third route was wired in Prompt 05 (commit `9007e0a72`) by extending `IPccProjectHomeReadModelClient` with `getPriorityActions(...)` and adding the third call to the `Promise.all` in `useProjectHomeReadModel.ts`. The `pcc-api-dormancy.test.ts` fetch allowlist required no relaxation.

---

## 9. Fallback / state-mapping proof

`apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.test.ts`, describe **`buildPccProjectHomeViewModel — standalone priority-actions envelope`**:

- **`uses standalone envelope data + sourceStatus for the priorityActions slot when supplied`** — slot data comes from `priorityActions.data.actions`; slot state derives from the standalone envelope's `sourceStatus`.
- **`backend-unavailable standalone priority-actions envelope places only the priorityActions slot in error`** — `priorityActions.state === 'error'`; intelligence / siteHealth / documentControl / missingConfigurations all remain `'preview'`.
- **`absent standalone envelope preserves home-derived priorityActions fallback`** — slot data comes from `home.priorityActions ?? []`; slot state derives from the home envelope's `sourceStatus`.
- **`absent standalone envelope with home=backend-unavailable still maps the priorityActions slot to error via home`** — fallback path remains coherent.

`apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.test.ts`:

- **`invokes getProjectHome, getPriorityActions, and getDocumentControl in parallel`** — three spies, each called exactly once with the project id.
- **`priorityActions slot reflects the standalone priority-actions envelope, not the home envelope`** — alt-actions envelope drives slot data.
- **`priorityActions slot reflects backend-unavailable from the standalone envelope only when home is available`** — only the rail slot enters `'error'`; other slots remain `'preview'`.

The Wave 4 mounted-flag cancellation pattern is preserved.

---

## 10. Suppressed-category proof

The constant `SUPPRESSED_CATEGORIES = ['documents', 'health', 'safety']` lives in `apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts` and is enforced compile-time via `satisfies readonly PriorityActionCategory[]`. Suppressed actions are filtered before group classification — they never reach the `groups` array.

`apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.test.ts`:
- **`produces 7 visible / 3 suppressed for the canonical SAMPLE_PRIORITY_ACTIONS fixture`** — `visibleCount === 7`, `suppressedCount === 3`.

`apps/project-control-center/src/tests/PccProjectHome.test.tsx`:
- The Priority Actions rail under default fixture renders exactly **7 visible rows** matching the 7 non-suppressed `SAMPLE_PRIORITY_ACTIONS` entries.

W5-OD-005 ("Should document-control prompts and Site Health escalations appear in Wave 5? — Suppress from MVP rail") is closed and verified.

---

## 11. UI inertness / accessibility proof

### Visible tone labels (color-non-only signaling)

- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx` renders, per row, a `<span>` carrying `data-pcc-priority-rail-tone-label={item.tone}` with the visible text `Priority: High`, `Priority: Medium`, or `Priority: Low`.
- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx`, test **`renders a visible 'Priority: <Tone>' label per row`** asserts the visible text.
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx`, test **`Priority Actions rail renders visible Priority: <Tone> labels matching each row tone`** asserts each rail row's data-marker and text match.

### No color-only / hover-only critical meaning

Tone is signaled redundantly via:
1. Visible text (`Priority: High|Medium|Low`).
2. `data-pcc-priority-rail-action-tone={item.tone}` attribute on the row.
3. The visible tone label `<span>` itself.

No critical meaning is encoded only in CSS color, hover, or other pseudo-state styling.

### No anchors / no hrefs / no buttons / no onClick / no live drill-in

- `PccPriorityActionsRail.tsx` contains zero `<a>`, zero `<button>`, zero `href`, and zero `onClick` (verified by direct source inspection during the Prompt 06 audit).
- Each disabled affordance renders as a `<span>` carrying `data-pcc-priority-rail-disabled-action` with the visible text **"Preview only"**.
- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx`, test **`inert affordance: every disabled-action marker is a span...zero anchor elements...zero href attributes...zero button elements`**.
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx`, test **`renders no anchor elements with live launch URLs...no http/https hrefs anywhere on Project Home`** — scans every `<a href>` on the rendered Project Home and asserts none start with `http://` or `https://`.

W5-OD-003 ("Should rail action affordances drill into owning modules during Wave 5? — Metadata-only / inert") is closed and verified.

---

## 12. Project Home 10-card bento direct-child invariant proof

`apps/project-control-center/src/tests/PccProjectHome.test.tsx`, test **`every Project Home card is a direct child of the bento grid`** validates:
- Exactly 10 unique card titles render.
- Card count via `[data-pcc-card]` equals 10.
- Each card is a direct child of `[data-pcc-bento-grid]`.

The bento contract in Wave 4 (no `grid-auto-flow: dense`, no CSS columns, measured row spans on an 8 px row unit / 16 px gap) is preserved unchanged.

---

## 13. Active-surface-panel invariant proof

`apps/project-control-center/src/tests/PccProjectHome.test.tsx`, test **`exactly one [data-pcc-active-surface-panel] exists with value 'project-home'`** asserts a single panel marker carried by the Project Intelligence card.

---

## 14. No-direct-`HbcPriorityRail` proof

The PCC app source contains **zero** `HbcPriorityRail` imports and **zero** code-level references. The only mention is a JSDoc-comment line in `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx` documenting the avoidance rationale; comment-strip processing removes it before the source-scan executes.

Two new guards added in Prompt 06 (`apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`):

- **`no PCC source file imports HbcPriorityRail directly (Wave 5 — no UI-kit priority rail reuse)`** — scans all `apps/project-control-center/src/**/*.{ts,tsx}` import-path strings for `HbcPriorityRail`. Comment-stripped.
- **`no PCC source file references the HbcPriorityRail identifier in code (Wave 5)`** — scans the same set with comments + string literals + regex literals stripped, for any `\bHbcPriorityRail\w*` token.

Both guards pass on current source. `packages/ui-kit/src/HbcPriorityRail/**` remains a reference-only primitive — not consumed by PCC. W5-OD-006 ("Should existing `HbcPriorityRail` UI-kit components be reused? — No direct reuse in Wave 5; reference only") is closed and verified.

---

## 15. No-action-execution proof

The rail introduces no executable behavior. Specifically:

- No `onClick` handlers on rail rows or affordances.
- No anchor `href` to live destinations on Project Home (asserted by `PccProjectHome.test.tsx` test **`renders no anchor elements with live launch URLs`**).
- No buttons that invoke navigation, mutation, approval, permission grant, workflow execution, Site Health repair, or external-system call.
- The rail's "Preview only" affordance is a `<span>` — semantically inert.
- Disabled state is rendered via a `<span>` marker, not a `<button disabled>` — no implicit interactive role is exposed.

W5-OD-003 ("metadata-only / inert affordances") is closed and verified.

---

## 16. Guardrail / test inventory

### Preserved from Wave 3 / Wave 4 (unchanged)

`apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`:
- `fetch(` callsite allowlist limited to `apps/project-control-center/src/api/pccBackendReadModelClient.ts` + `pccBackendReadModelClient.test.ts`.
- `IPccReadModelClient` / `pccReadModelClient` / `createPccReadModelClient` / `pccBackendReadModelClient` / `createPccBackendReadModelClient` / `resolvePccReadModelConfig` / `pccFixtureReadModelClient` / `createPccFixtureReadModelClient` forbidden in all non-api / non-test files (with the narrow `mount.tsx` allowlist for `createPccReadModelClient` only).
- Forbidden runtime imports across non-api/non-test files **and** inside `src/api/**`: `@pnp/sp`, `@pnp/graph`, `@microsoft/sp-pnp-js`, `@microsoft/sp-http`, `@hbc/auth/spfx`, `msgraph`, `graph.microsoft.com`, `procore`.
- Forbidden runtime tokens inside `src/api/**` runtime files: `MSGraphClient`, `GraphServiceClient`, `sp.web`, `_api/web`, `ProcoreClient`, `DocumentCrunchClient`, `AdobeSignClient`.
- Backend HTTP client uses only `'GET'` — no `'POST'` / `'PUT'` / `'PATCH'` / `'DELETE'` method literals.
- `PccSurfaceRouter` threads `readModelClient` to exactly one surface (Project Home).
- Factory default mode is `'fixture'` at the source level.
- `mount.tsx` references `createPccReadModelClient` only; no other client/factory constructor or `fetch(`.

`apps/project-control-center/src/tests/PccProjectHome.test.tsx`:
- 10-card bento direct-child invariant.
- Single `[data-pcc-active-surface-panel="project-home"]`.
- No anchor elements with `http`/`https` hrefs.
- Non-preview Priority Actions card renders `PccPreviewState` (not the rail).

### Added in Wave 5

`apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.test.ts`:
- 4-group canonical order; 7 visible / 3 suppressed; tone-then-due-then-id sort; tone derivation; suppression invariant.

`apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx`:
- Visible `Priority: <Tone>` labels per row.
- Inert affordance markers (zero anchors / zero hrefs / zero buttons; "Preview only" spans).
- Rail-level empty state when `visibleCount === 0`.

`apps/project-control-center/src/tests/PccProjectHome.test.tsx` (Prompt 04 additions):
- Rail renders Wave 5 four-group rail in canonical order.
- Rail renders 7 visible rows from `SAMPLE_PRIORITY_ACTIONS`, each with valid tone.
- Rail renders visible `Priority: <Tone>` labels matching each row tone (Prompt 03 fix).
- Rail renders inert non-executing affordances.
- Non-preview state (`error`) renders `PccPreviewState`, not the rail.

`apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.test.ts` (Prompt 05 additions):
- Standalone priority envelope wins.
- Backend-unavailable standalone envelope affects only the `priorityActions` slot.
- Absent standalone envelope preserves home-derived fallback.
- Absent envelope with home=backend-unavailable maps the `priorityActions` slot to error via home.

`apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.test.ts` (Prompt 05 additions):
- Three-method spy proves `getProjectHome` + `getPriorityActions` + `getDocumentControl` are each called once.
- Standalone envelope drives slot data.
- Backend-unavailable on standalone leaves intelligence / siteHealth / documentControl / missingConfigurations in `'preview'`.

`apps/project-control-center/src/tests/PccApp.optIn.test.tsx` (Prompt 05 additions):
- Backend mode now expects exactly 3 GETs across `/home`, `/priority-actions`, `/document-control`.
- Non-Project-Home test adds a `getPriorityActions` spy and asserts it is **not** called for `activeSurfaceId="documents"`.

`apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` (Prompt 06 additions):
- `no PCC source file imports HbcPriorityRail directly`.
- `no PCC source file references the HbcPriorityRail identifier in code`.

---

## 17. Validation evidence

Captured at Prompt 07 execution against HEAD `570e8136d`. No source / package / lockfile / manifest / Wave 4 / master-doc edits.

| Command | Result |
| --- | --- |
| `git status --short` (pre) | only the untracked `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-05/` prompt-package directory (out of Prompt 07 scope) |
| `md5 pnpm-lock.yaml` (pre) | `c56df7b79986896624536aab74d609f4` |
| `git diff --check` (pre) | clean |
| `pnpm --filter @hbc/models check-types` | **PASS** |
| `pnpm --filter @hbc/models test` | **PASS** — 31 files / 224 tests |
| `pnpm --filter @hbc/functions check-types` | **PASS** |
| `pnpm --filter @hbc/functions test` | **PASS** — 138 files / 2282 passed (3 skipped, 2285 total) |
| `pnpm --filter @hbc/functions build` | **PASS** |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** |
| `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — 26 files / **346 tests** |
| `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — `dist/project-control-center-app.js` 235.03 kB · gzip 69.85 kB; `dist/spfx-project-control-center.css` 24.02 kB · gzip 4.18 kB |
| `md5 pnpm-lock.yaml` (post) | `c56df7b79986896624536aab74d609f4` (unchanged) |
| `git diff --check` (post) | clean |
| `git diff --stat HEAD` (post-commit) | empty |
| `git diff --name-only HEAD` (post-commit) | empty |

**Note on coverage:** `@hbc/models` is run as `check-types` + `test` only (no `build` script for this package). `@hbc/functions` and `@hbc/spfx-project-control-center` are run as `check-types` + `test` + `build`.

No deployment, `.sppkg` generation, app-catalog upload, tenant operation, Graph/PnP/SharePoint REST live operation, Procore call, provisioning execution, repair runner, permission mutation, approval execution, or hosted validation command was run.

---

## 18. Package / version / lockfile / manifest / deployment posture

- `@hbc/spfx-project-control-center` version: `0.0.1` — **unchanged** across the full Wave 5 prompt sequence.
- `pnpm-lock.yaml` md5: `c56df7b79986896624536aab74d609f4` — unchanged before and after Prompt 07.
- No `package.json` changes.
- No SPFx manifest, `package-solution.json`, or `.sppkg` artifact produced.
- No app-catalog upload.
- No hosted validation.
- No tenant mutation.
- No CI/CD workflow change.
- No deployment file change.

---

## 19. Closed-decision disposition

| ID | Title (verbatim from `Wave_5_Closed_Decisions.md`) | Status | Resolved by |
| --- | --- | --- | --- |
| W5-OD-001 | How should the four MVP rail groups map to 10 `PriorityActionCategory` values? | **Resolved** | Prompt 02 (`4c9715be7`). App-local grouping adapter. No shared model rewrite. App-local rail group IDs `access-requests`, `readiness-blockers`, `approval-checkpoints`, `external-system-mapping` mapped from canonical category + work-center metadata. |
| W5-OD-002 | Should Wave 5 consume the standalone backend `priority-actions` route? | **Resolved** | Prompt 05 (`9007e0a72`). Yes, under explicit backend opt-in only. Default fixture behavior unchanged. Project Home is the sole consumer. No new `fetch(` callsite. |
| W5-OD-003 | Should rail action affordances drill into owning modules during Wave 5? | **Resolved** | Prompts 02–04 (`4c9715be7`, `e2edd9200`, `581f44337`, `6c096c55f`). Metadata-only / inert affordances. No `href`, no `onClick`, no navigation, no workflow/approval execution, no mutation. |
| W5-OD-004 | Should persona-aware display filter actions by actual user role? | **Resolved (display-only)** | Prompts 02–04. Display-only persona posture. `assigneePersona` labels render from existing record fields; no auth-derived filtering. |
| W5-OD-005 | Should document-control prompts and Site Health escalations appear in Wave 5? | **Resolved (suppressed)** | Prompt 02 (`4c9715be7`). `documents`, `health`, `safety` are suppressed from the user-facing four-group rail. Suppression count proven (`7 visible / 3 suppressed`). |
| W5-OD-006 | Should existing `HbcPriorityRail` UI-kit components be reused? | **Resolved (no direct reuse)** | Prompts 03 + 06 (`e2edd9200`, `570e8136d`). PCC-local component built; controlled-consumption guard now scans for `HbcPriorityRail` import + identifier. |
| W5-OD-007 | Should shared model category metadata be updated to add canonical four-group categories? | **Resolved (deferred shared-model mutation)** | Prompt 02. Shared 10-category model preserved. App-local `PccPriorityRailGroupId` defined inside the app surface folder. |
| W5-OD-008 | Should Wave 5 update master roadmap / status / module-implementation docs? | **Resolved (no master roadmap edits during Wave 5)** | All prompts. No edits to `Project_Control_Center_Development_Roadmap.md`, `phase-3/05_Phase_3_Development_Roadmap_Updated.md`, or `phase-3/07_Phase_3_Module_Implementation_Plan.md`. |

### W4-OD-009 carry-forward

| ID | Title | Status |
| --- | --- | --- |
| W4-OD-009 | Scoped-host ADR / architecture-record disposition for `backend/functions/src/hosts/pcc-read-model/` | **Closed for Wave 5 as non-blocking deferred work.** The scoped-host pattern remains documented across the Wave 3 + Wave 4 closeout chain. A dedicated ADR prompt may be opened later as separate documentation work; it is **not** a Wave 5 deliverable and **not** a Wave 5 prerequisite. |

---

## 20. Wave 4A / Wave 5A separation

- **Wave 4A** — controlled non-production hosted visual validation phase introduced by Wave 4. **Operator-pending.** A separately gated phase requiring explicit user authorization, a non-production tenant, and operator-controlled rollout. Not advanced by Wave 5.
- **Wave 5A** — analogous controlled non-production hosted visual validation phase for Wave 5 visual changes. **Operator-pending.** Not in Wave 5 scope.
- Wave 5 implementation prompts performed no hosted validation. The package builds (`@hbc/functions` and `@hbc/spfx-project-control-center`) confirm artifact-level correctness only — they are not hosted proof.

---

## 21. Deferred work (intentionally excluded from Wave 5)

- Wave 4A hosted visual validation — operator-pending; separate phase.
- Wave 5A hosted visual validation — operator-pending; separate phase.
- W4-OD-009 scoped-host ADR — deferred, non-blocking; future docs prompt.
- Canonical shared-model category refactor (W5-OD-007 deferred) — future docs/feature prompt; preflight grep required before extending the shared model.
- UI-kit promotion of the PCC-local rail (W5-OD-006 reference-only) — revisitable after Wave 5 closeout.
- Persona filtering by real user role (W5-OD-004 display-only) — future feature work; no auth/persona derivation in Wave 5.
- Action execution, drill-in navigation, approval/workflow/permission mutation — out of scope for Wave 5 by design (W5-OD-003).
- Document Control / Site Health / Safety surfaces in the rail — suppressed per W5-OD-005; future surface work may surface these via dedicated cards / surfaces.
- Production packaging (`.sppkg`), app-catalog upload, hosted validation, production rollout — separately gated; not in Wave 5 scope.
- Master roadmap / status / module-implementation doc updates (W5-OD-008) — require dedicated docs prompt with explicit authorization.

---

## 22. Forbidden claims / non-claims

The Wave 5 closeout makes the following explicit non-claims:

- Wave 5 did **NOT** create a new top-level Priority Actions surface.
- Wave 5 did **NOT** rewrite shared priority categories.
- Wave 5 did **NOT** directly import or reuse `HbcPriorityRail`.
- Wave 5 did **NOT** execute actions.
- Wave 5 did **NOT** execute approvals.
- Wave 5 did **NOT** execute workflows.
- Wave 5 did **NOT** mutate Team & Access permissions.
- Wave 5 did **NOT** execute Site Health scan or repair.
- Wave 5 did **NOT** mutate the tenant.
- Wave 5 did **NOT** introduce write routes (`POST` / `PUT` / `PATCH` / `DELETE`).
- Wave 5 did **NOT** introduce Microsoft Graph, PnP, or SharePoint REST live operations.
- Wave 5 did **NOT** introduce Procore, Document Crunch, or Adobe Sign runtime.
- Wave 5 did **NOT** introduce auth or token wiring.
- Wave 5 did **NOT** derive real user persona from SPFx context, Entra/SharePoint groups, or backend claims.
- Wave 5 did **NOT** introduce a provisioning executor.
- Wave 5 did **NOT** generate or upload a `.sppkg`.
- Wave 5 did **NOT** perform an app-catalog upload.
- Wave 5 did **NOT** perform hosted validation.
- Wave 5 did **NOT** perform a production rollout.
- Wave 5 did **NOT** advance Wave 4A or Wave 5A; both remain operator-pending.
- Wave 5 did **NOT** edit the master roadmap, Phase 3 status doc, or module-implementation plan.
- Wave 5 did **NOT** mutate `pnpm-lock.yaml`, `package.json`, manifests, workflows, or deployment files.
- Wave 5 did **NOT** bump `@hbc/spfx-project-control-center` version.

Production rollout remains separately approved.

---

## 23. Wave 6 readiness recommendation

**Wave 6 planning is recommended to proceed.**

The Wave 5 implementation is complete, the closeout is documented, and no source-implementation drift was discovered. Project Home now consumes three of the seven Wave 3 read-only routes under explicit backend opt-in (`/home`, `/priority-actions`, `/document-control`); fixture default is preserved; the rail is inert and accessible; the controlled-consumption guard is hardened with a `HbcPriorityRail` import scan. The remaining four Wave 3 read-only routes (`profile`, `modules`, `external-links`, `site-health`) remain implemented in the SPFx backend client but are unwired by Project Home — available for future surface adoption.

This recommendation is for **planning only**. Wave 6 implementation authorization remains a separate user decision and must be initiated by an explicit Wave 6 Prompt 01 scope-lock + closed-decisions opening.

---

## 24. Final readiness statement

Phase 3 Wave 5 is complete when the PCC Priority Actions Rail is integrated into the existing Project Home `PccPriorityActionsCard` slot, the four-group app-local mapping with `documents` / `health` / `safety` suppression is in place, the explicit-backend-opt-in third route (`priority-actions`) is wired with home-envelope fallback, the rail is inert and accessibility-conformant, the controlled-consumption guard is hardened against direct `HbcPriorityRail` reuse, all preserved Wave 3+4 guardrails remain green, the `pnpm-lock.yaml` and package versions are unchanged, and the closeout record (this document) is committed. Hosted validation, packaging, and production rollout remain separately gated.
