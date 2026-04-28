# SPFx Foleon Manager — Phase 07 Wave 2: Workspace rebuild + canvas width

## Context

Wave 1 (commit `27101dbc3`) shipped the rebuilt outer chrome — CommandHeader, StatusSummaryStrip, four-key ManagerPrimaryNav, retired ManageShellHeader/ManageTabs, switched the orchestrator to `ManagerPrimaryNavKey`, bumped to `1.0.32.0`. Hosted screenshots confirm the chrome works.

But hosted screenshots also show two unresolved problems that block flagship acceptance:

1. **Canvas width.** The manager occupies roughly the left half of the SharePoint page canvas. `supportsFullBleed: true` is declared and `.shell` allows `max-width: min(1880px, 100%)`, so the constraint is the SharePoint *section* the web part is placed in (a 1-column section, not a Full-width vertical section).
2. **Workspace internals.** Below the new chrome, the workspace still reads as the legacy diagnostics/card-grid surface: a left lanes-rail, a center "Selected Lane" panel, and a right "Readiness rail + Placement Manager" rail, with a secondary "Content library" registry list below. The chrome reframed the page as a content-operations console, but the workspace beneath the chrome still reads as an admin diagnostics page.

Wave 2 must:
- Fix canvas width so the manager surface uses the full SharePoint page canvas reliably (operator action *and* code escape).
- Rebuild the Content Operations workspace into an inbox-led content-operations surface that answers the seven JTBD questions on first paint.
- Promote `Lane Board` from placeholder to a real lane-column workspace.
- Move placement editing from an always-visible right rail into a contextual workflow panel.
- Reduce nested bordered cards.
- Keep all security, readiness, sync, diagnostics, and write-path behavior bit-identical.

## Authoritative current state (verified, post-Wave-1)

- Manifest: `supportsFullBleed: true` (line 12 of `FoleonWebPart.manifest.json`).
- Shell width: `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css` line 3: `max-width: min(1880px, 100%);` — generous.
- SPFx render: `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` mounts directly into `this.domElement` with no width constraints applied at the SPFx layer.
- The Content Operations workspace today (= `HomepageFoleonContentTab`) renders three vertical regions inside `.workspaceShell`:
  - left: lanes nav rail (`.laneNavigationRail`, complementary)
  - center: `.selectedLaneWorkspace` (region "Project Spotlight workspace" etc.)
  - right: `.readinessRail` + Placement Manager
  followed by a `.libraryBand` Content registry list.
- `ManagePage.test.tsx` has 30+ passing tests asserting the current `HomepageFoleonContentTab` regions, lane nav listitem semantics, write-path messaging, preview guidance copy, save/publish wiring. All of these constrain the rebuild.
- Operations counts already exist (Wave 1): `live`, `staged`, `blocked`, `unassigned` — derivable from existing fields.
- Field availability for inbox bucketing (verified in `foleon-management.types.ts`):
  - `validationStatus: 'valid' | 'warning' | 'blocked' | 'unknown'`
  - `publishStatus: string` (commonly `'Published' | 'Draft'`)
  - `activeEdition?: boolean`
  - `isVisible`, `isHomepageEligible`
  - `lastEditorialUpdate?: string` (editorial, NOT sync recency — must not be repurposed)
  - `blockingReasons: ReadonlyArray<string>`
  - placement join key: `placement.foleonDocId` ↔ `content.foleonDocId`
  - **No `createdAtUtc`/`syncedAtUtc` field.** "Newly synced" cannot be honestly bucketed; "newly added since last visit" requires a client-side seen-state, which is out of scope for Wave 2.

## Approach

### Track A — Canvas width

**Two layers, both required.**

**A1. Operator path: page-level Full-width section.**

`supportsFullBleed: true` is already declared. The operator must place the manager web part in a SharePoint **Full-width section** when it is the primary management page on a SharePoint site. A standard 1-column section caps canvas width at the page-template default and produces the left-heavy layout seen in current hosted proof.

Add a "Manager surface — full-width placement" subsection to `apps/hb-intel-foleon/README.md`:

- "When hosting the HB Intel Foleon Manager as the primary management page, place the web part in a SharePoint **Full-width section** (SharePoint Edit Page → Add section → Full-width section). A standard one-column section will constrain the surface and produce a left-heavy layout."
- "After app catalog deployment, validate the page at **100%, 75%, narrow / tablet width, and short-height** conditions to confirm the surface uses the available canvas without horizontal scrolling."
- Operator-pending: hosted proof at these zoom and viewport conditions is the gate for flagship acceptance and is captured in the wave's commit description as operator-pending, not silently assumed.

**A2. Code path: scoped canvas-escape, manager route only.**

Add a **scoped canvas-escape** gated by `data-foleon-manager-canvas="wide"` set on `.foleonManageRoot` by the orchestrator for the `manage` route only. Reader, highlights, projectSpotlight, companyPulse, leadershipMessage, hub, and any embedded reader routes do **not** receive the attribute and are unaffected.

Conservative rules — non-negotiable:

- Apply only when `data-foleon-manager-canvas="wide"` is present on the manager root.
- Do not modify, override, or target SharePoint global chrome (no `.SPCanvas-canvas`, no `.CanvasZone`, no body-level overrides).
- Do not use brittle parent selectors. The escape is implemented as `width` + `margin-inline` math on the manager root itself.
- Preserve a safe gutter on both sides via `--foleon-manage-canvas-gutter` so content never slams into the viewport edge. Default `32px` total (16px per side); the value is a CSS custom property so tenants/themes can tune without code changes.
- Avoid horizontal scroll at 100%, 75%, and 33% browser zoom. The math uses `min(100vw - gutter, parent-width)` so the surface never exceeds available space and the gutter survives small-viewport clamping.
- Inline code comments explain why the escape exists, what it does and does not do, and that hosted proof is required.

```css
/* Manager-only canvas escape. See FoleonWebPart README "Manager surface — full-width placement".
 * Active only when data-foleon-manager-canvas="wide" is present on the manager root.
 * Reader / highlights / embed routes never set this attribute and are unaffected.
 * Gutter token keeps content off the viewport edge. Hosted proof at 100/75/33% zoom is required. */
.foleonManageRoot[data-foleon-manager-canvas='wide'] {
  --foleon-manage-canvas-gutter: 32px;
  width: min(100%, calc(100vw - var(--foleon-manage-canvas-gutter)));
  margin-inline: auto;
}
@supports (width: 100vw) {
  .foleonManageRoot[data-foleon-manager-canvas='wide'] {
    width: calc(100vw - var(--foleon-manage-canvas-gutter));
    margin-inline: calc(50% - 50vw + (var(--foleon-manage-canvas-gutter) / 2));
  }
}
```

The first rule is the safe fallback (never wider than parent). The `@supports` block applies the canvas escape only where `100vw` is supported (effectively all production browsers).

### Track B — Content Operations workspace (the rebuild)

**B1. Information architecture.**

| Primary nav         | Wave 2 surface                                                                  |
| ------------------- | ------------------------------------------------------------------------------- |
| Content Operations  | Inbox-led content-operations workspace (rebuilt — see below)                    |
| Lane Board          | Real Lane Board (column-per-lane workspace) — promoted from placeholder         |
| Preview             | Remains structured placeholder (governed reader preview is Wave 3)              |
| Admin / Config      | Unchanged                                                                       |

**B2. Content Operations workspace layout.**

Replace the three-column "Selected Lane / Readiness Rail / Placement Manager" composition. New composition, top-to-bottom:

1. **Recommended next action band** (full-width, single line). Single sentence + button: "3 lanes are blocked — resolve placements", or "12 unassigned items in the inbox — review now", or "All lanes are live and stable" when nothing is wrong. Computed from the same operations counts and lane state that already feed `StatusSummaryStrip`. Selecting the action button focuses the relevant inbox bucket or lane.
2. **Content Inbox** (full-width primary surface). A virtualized list/table of content records grouped by bucket headers (collapsible), each header showing the count and a "Focus" button:
    - **Blocked** — `validationStatus === 'blocked'` OR has `blockingReasons.length > 0`
    - **Unassigned** — content not referenced by any placement.foleonDocId
    - **Live** — placement.isActive === true AND content.activeEdition === true
    - **Staged** — content.activeEdition === false AND publishStatus !== 'Published'
    - **Published, eligible** — content with placement, isHomepageEligible, isVisible
   Row columns: title, lane (project-spotlight / company-pulse / leadership-message), publish status pill, validation pill, last editorial update (formatted), placement state. Row click opens the contextual workflow panel for that record. No nested bordered cards inside rows — single-line rows with clear typography.
3. **Contextual workflow panel** (right slide-over, dismissable). Replaces the always-visible right rail. Triggered by inbox row click OR by header action ("Manage placements" / "Review new content"). Contents:
    - Header with content title + publish status
    - Three stacked workflow sections, in priority order:
      - **Validation & blockers** — list of blocking reasons + a Validate action when canWrite
      - **Placement** — current placement (if any) with edit-in-place; Create/Update/Activate/Deactivate buttons, each gated by write readiness with the existing plain-language reason
      - **Publish readiness** — the existing 10-item publish checklist (re-uses `buildPublishChecklist` from `manageLaneViewModel`)
    - Footer with Save / Validate / Publish / Suppress, each preserving the bit-identical write-path messaging and gating behavior.
   The panel is implemented as a non-modal slide-over (does not trap focus; `Esc` closes; backdrop click closes). Width: fixed 480px on wide screens, full-width on narrow.
4. **No standalone "Content library" footer.** The inbox replaces it. The library's existing search/filter affordances are absorbed into the inbox toolbar (search box at top of the inbox).

**B3. Lane Board.**

Promote from structured placeholder to a real three-column lane workspace (Project Spotlight, Company Pulse, Leadership Message). Replaces the legacy rail-style lane selector pattern entirely; lane columns are the primary object, not a side rail. The board reuses `buildFoleonLaneViewModels` unchanged.

Per column, render only fields derivable from current schema. No fake data. No invented counts. No mock records.

Each column composition, top to bottom:

1. **Column header** — lane name + state pill (Live / Staged / Blocked / Empty / Needs setup, mapped from the lane view-model `state`).
2. **Current live content** — `lane.activeContent`. Title, publish status, publish window (`displayFrom`–`displayThrough` if both present, otherwise omitted; never invented). "Open Foleon" reuses the existing safe-origin behavior.
3. **Staged / draft content** — `lane.stagedContent`. Same shape as Live; absent if no staged record exists.
4. **Placement status** — placement state plain copy (active on homepage / inactive / not assigned), reusing `placementStatusPlain` from `manageLaneViewModel`. Surfaces the existing placement record from `lane.placement`.
5. **Display window** — only when the active or staged content has a defined `displayFrom`/`displayThrough`; format consistently. Omitted when absent.
6. **Readiness state** — short publish-readiness summary (`summarizePublishReadinessForCard(lane.checklist)`).
7. **Blocking reasons** — `lane.warnings` rendered as a short list. If empty, the section is omitted entirely (no "No issues" filler).
8. **Next recommended action** — the existing `lane.nextAction` string from the view-model, surfaced as a single sentence.
9. **Available content candidates for that lane** — content records whose `readerKey` matches the column's lane key but are not currently the active or staged edition. Derived from the loaded content array, not from a separate fetch. Renders only when at least one candidate exists; presented as compact "Open in workflow panel" rows so the manager can promote a candidate via the contextual workflow. If no candidates are derivable from current data, the section is omitted (no invented placeholders).
10. **Contextual actions** — buttons that select a record and open the contextual workflow panel: "Open active in workflow", "Open staged in workflow", "Add or sync content" (when empty, opens the Sync from Foleon header action — never silent). All write actions retain the existing canWrite gating and plain-language disabled reasons.

The Lane Board does **not** introduce drag-and-drop in this wave; column order is fixed.

**B4. Reduce nested bordered cards.**

Cap the visual hierarchy at two levels: panel container → row/list-item border-only separators (no nested 1-pixel-bordered card-in-card). The `.panel`, `.card`, and current `.laneCard`/`.readinessCard`/`.checkItem` styles get a doctrine pass — anything that nests a `.panel` inside a `.panel` is replaced with a borderless inline section that uses spacing tokens for separation.

### Track C — Tests

- **Preserve.** All current ManagePage tests for header copy, four-key nav, keyboard nav, structured placeholders, sync messaging, write-path messaging, publish readiness, redacted diagnostics copy proof, admin action ranking, token-degraded mode, no-secrets-in-config — keep passing.
- **Update.** Tests that asserted the *legacy* lane-rail/readiness-rail composition will need to point at the new inbox / workflow panel structure. Per repo doctrine (`feedback_no_legacy_marker_preservation`), update assertions to the redesigned shell rather than preserving old markers on new components.
- **Add.** New tests for:
  - Recommended next action band: renders the right sentence given combinations of blocked/unassigned/live/staged counts.
  - Content Inbox: renders bucket headers with counts; row click opens contextual workflow panel; bucket filtering deterministic given content+placements.
  - Contextual workflow panel: opens on row click; opens on "Manage placements" header action; closes on Esc / backdrop click; preserves Save/Validate/Publish disabled-with-reason aria-describedby semantics; never silently no-ops on actions with disabled inputs (returns the existing message-channel update).
  - Lane Board: renders three columns; columns reflect state pills correctly; warning chip click opens the workflow panel for the offending content.
  - Canvas escape: `data-foleon-manager-canvas` attribute is `"wide"` on the manager root only when route is `manage`; **absent** on highlights, projectSpotlight, companyPulse, leadershipMessage, hub, and reader routes (jsdom test rendering each route and asserting the attribute is set / not set as appropriate). Reader route assertion is the critical regression guard — public reader pages must never adopt the canvas escape.

## Files to add

- `apps/hb-intel-foleon/src/pages/manage/RecommendedNextActionBand.tsx` — pure presentational over a `RecommendedAction` view-model.
- `apps/hb-intel-foleon/src/pages/manage/recommendedNextAction.ts` — pure derivation of the recommended action from operations counts + lanes + token-degraded state. Decision rules documented inline.
- `apps/hb-intel-foleon/src/pages/manage/ContentInbox.tsx` — bucketed list/table primary surface.
- `apps/hb-intel-foleon/src/pages/manage/contentInboxViewModel.ts` — pure bucket derivation: `buildContentInboxBuckets({ content, placements, lanes })` returning typed buckets with `id`, `label`, `items`. Honors the field-availability rules above; never invents fields.
- `apps/hb-intel-foleon/src/pages/manage/ContextualWorkflowPanel.tsx` — slide-over panel composing existing editor / placement / publish-checklist primitives.
- `apps/hb-intel-foleon/src/pages/manage/LaneBoard.tsx` — three-column lane workspace replacing the Wave 1 placeholder.
- `apps/hb-intel-foleon/src/pages/manage/__tests__/recommendedNextAction.test.ts`
- `apps/hb-intel-foleon/src/pages/manage/__tests__/contentInboxViewModel.test.ts`

## Files to modify

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
  - Add `data-foleon-manager-canvas="wide"` to the root `<section>` of every render branch (loading, blocked, error, ready). The orchestrator only mounts on the manage route, so the attribute is implicitly route-scoped.
  - Replace direct render of `HomepageFoleonContentTab` with a thin `<ContentOperationsWorkspace>` composition: `RecommendedNextActionBand` + `ContentInbox` + `ContextualWorkflowPanel`.
  - Replace the Lane Board placeholder with `<LaneBoard>`.
  - Pass selected-record state (existing `selectedId`/`selectedLane`) into `ContentInbox` and `ContextualWorkflowPanel` for hand-off.
- `apps/hb-intel-foleon/src/pages/manage/ManageOperationsShell.tsx`
  - Remove the in-shell `LaneBoardPlaceholderPanel` definition (Lane Board is now real).
  - Keep the `PreviewPlaceholderPanel` (Preview remains structured placeholder this wave).
- `apps/hb-intel-foleon/src/pages/manage/HomepageFoleonContentTab.tsx`
  - **Retire.** Its publish-checklist, registry list, content editor, and placement editor primitives are repackaged into `ContentInbox` + `ContextualWorkflowPanel` + `LaneBoard`. The current file becomes an internal `ContentOperationsWorkspace.tsx` that re-uses extracted primitives, OR is deleted outright in favor of the new composition. **Decision: rebuild as new composition; lift reusable sub-primitives (`ManageContentEditorPanel`, `ManagePlacementPanel`, `ManagePreviewGuidancePanel`, `ManageRegistryPanel` search box) into the new components and delete the legacy `HomepageFoleonContentTab.tsx`.**
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
  - Add `.canvasEscape` rule (gated by `[data-foleon-manager-canvas='true']`).
  - Add `.recommendedNextAction`, `.contentInbox`, `.contentInboxBucketHeader`, `.contentInboxRow`, `.workflowPanel`, `.workflowPanelOverlay`, `.workflowPanelSurface`, `.laneBoard`, `.laneBoardColumn` (or co-locate in component CSS modules — see below).
  - Remove now-unused `.workspaceShell`, `.laneNavigationRail`, `.readinessRail`, `.libraryBand`, related `.laneCard`/`.readinessCard`/`.checkItem` rules if grep confirms no remaining consumers after `HomepageFoleonContentTab` retires. Removal is in the same change to keep the doctrine clean.
- `apps/hb-intel-foleon/src/pages/manage/foleonManageTokens.css`
  - Add `--foleon-manage-canvas-gutter: 32px;` token.
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`
  - Update legacy three-column workspace assertions (lane navigation rail / readiness rail / placement manager) to new inbox + workflow panel + lane board structure. Per doctrine, no preserved old markers on new components.
  - Add new tests per Track C above.
- `apps/hb-intel-foleon/README.md`
  - Add "Manager surface — full-width placement" subsection.
- Manifest version bump: `1.0.32.0 → 1.0.33.0` in `FoleonWebPart.manifest.json` (six places), `runtimeContract.ts` (`FOLEON_PACKAGE_VERSION`), `config/package-solution.json`, `scripts/validate-foleon-feature-assets.ts`, `tools/spfx-shell/config/package-solution.json`, `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json` (auto-mirrored by package tooling).

## Locked-down behavior to preserve (non-negotiable)

- `withAuth`, route authorization, token validation, safe-config gates: untouched.
- `LoadState` union, preflight blocker mapping, token-acquisition-degraded mode banner copy: untouched.
- `runFoleonSync`, `runContentValidate`, `runContentPublish`, `runContentSuppress` workflows: untouched. New surfaces call them with the same arguments.
- Write-path readiness gating (`canWrite`, `aria-describedby` plain-language reasons, `foleon-manage-write-actions-reason` / `foleon-manage-publish-reason` / `foleon-manage-placement-write-reason` IDs): untouched.
- Redacted diagnostics JSON copy proof, admin action ranking, no-secrets-in-Config-UI guarantees: untouched.
- Sync block reason copy, "Sync blocked" / "Create placement blocked" labels: untouched.

## Verification

```bash
git status --short
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

**Hosted/tenant proof is operator-pending and is the gate for flagship acceptance.**
After deployment, the operator captures fresh hosted screenshots showing:
- Manager surface filling the SharePoint page canvas.
- First screen showing recommended next action + four operations counts + content inbox buckets with counts, all answering the seven JTBD questions without scrolling.
- Lane Board column workspace.
- Contextual workflow panel sliding in on row click.

Wave 2 commit description must record hosted proof as **operator-pending** until those screenshots land. Per `feedback_operator_pending_proof`, package proof and tests are package truth, not runtime truth.

## Risks

- **Test churn.** ~10 of the existing 322 ManagePage tests will need to be re-pointed to the new inbox/workflow panel structure. New tests partially compensate. Risk of accidental regressions in write-path messaging — mitigated by test additions that explicitly assert the same `aria-describedby` IDs survive.
- **Inbox virtualization.** If the registry grows beyond a few hundred records, naive list rendering will get sluggish. Wave 2 ships unvirtualized; if hosted proof shows performance issues at scale, Wave 3 adds windowing.
- **Slide-over panel focus management.** Non-modal slide-over has subtle focus return behavior. We restore focus to the originating row on close; `Esc` closes. We test this explicitly.
- **Canvas escape side-effects.** `100vw` can briefly cause horizontal-scroll flash if the SharePoint command bar measurement is off. Gutter token absorbs the typical scrollbar; we test in jsdom that the attribute is set, but only hosted proof can confirm visual behavior.
- **Manifest version coordination.** Six places to keep in sync. Existing build tooling auto-mirrors `tools/spfx-shell/*` so the manual surface is the four primary files plus the manifest.

## Out of scope (defer to Wave 3 or later)

- Governed reader preview iframe (Preview primary nav stays structured placeholder).
- Inbox virtualization / windowing.
- A "Recently synced since last visit" inbox bucket (requires client-side seen-state).
- Toolbox preconfigured-entry title rename (`HB Intel Foleon Manager` → `HB Intel Foleon Content Operations`); separate UX call.
- Migration of `@hbc/ui-kit` shared primitives (this wave ships locally-scoped shell primitives; a later wave promotes anything reusable).

## Critical files to read at implementation time

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/HomepageFoleonContentTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/SelectedLaneWorkspace.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManagePlacementPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManagePreviewGuidancePanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageRegistryPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ContentLibraryPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageLaneViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/managerOperationsViewModel.ts`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`
- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json`
