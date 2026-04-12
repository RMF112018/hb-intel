# Phase-27 — HB Kudos Remediation Series Closure Report

**Scope.** Prompts 00–10 of
`docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/phase-27`.
All implementation commits are on `main` in the range
`cedd7b2b`…`75f9ee00` (10 commits, including the authority-lock note
and this closure report placeholder-free set).

**Binding doctrine.** Every judgment in this report is made against
`docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
and `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`.

---

## 1. Files touched across the series

### Prompt-00 — authority lock (no code)
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/phase-27/Authority-Lock-Note.md`

### Prompt-01 — shared token bridge + primitive styling closure (`cedd7b2b`)
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFlyoutBody.tsx` (then retired in Prompt-04)
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurfaceFamily.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`
- `apps/hb-webparts/src/webparts/hbKudos/README.md`
- `apps/hb-webparts/src/webparts/hbKudos/GOVERNANCE.md`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- `apps/hb-webparts/config/package-solution.json`

### Prompt-02 — public-surface CSS doctrine closure (`48aca47d`)
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/kudosReader.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx` (token bridge extensions)
- manifest + solution bump

### Prompt-03 — public hierarchy redesign (`7152546e`)
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css` + `.d.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurfaceFamily.ts`
- `apps/hb-webparts/src/webparts/hbKudos/README.md`
- manifest + solution bump

### Prompt-04 — semantic shell split (`e19b17ef`)
- NEW `apps/hb-webparts/src/homepage/shared/kudosShells.tsx`
- NEW `apps/hb-webparts/src/homepage/shared/kudosShells.module.css` + `.d.ts`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosComposerPanel.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/README.md`
- `apps/hb-webparts/src/webparts/hbKudos/GOVERNANCE.md`
- `apps/hb-webparts/src/webparts/hbKudos/kudosReader.module.css`
- `apps/hb-webparts/src/homepage/__tests__/kudosDoctrineGuards.test.ts`
- DELETED `apps/hb-webparts/src/webparts/hbKudos/KudosFlyoutBody.tsx`
- manifest + solution bump

### Prompt-05 — companion runtime decomposition (`00fab85b`)
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx` (1,518 → 406 LOC)
- NEW `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/companionTabs.ts`
- NEW `…/runtime/companionFilter.ts`
- NEW `…/runtime/useCompanionRole.ts`
- NEW `…/runtime/useCompanionQueue.ts`
- NEW `…/runtime/useCompanionActions.ts`
- NEW `…/components/QueueRow.tsx`
- NEW `…/components/DetailPanel.tsx`
- NEW `…/components/CompanionDegradedStates.tsx`
- manifest + solution bump

### Prompt-06 — moderation workspace UX upgrade (`f9c09756`)
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useCompanionQueue.ts` (tabCounts)
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/QueueRow.tsx` (state-rail attrs)
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css` + `.d.ts`
- manifest + solution bump

### Prompt-07 — bulk-approval hardening (`aa2e7aac`)
- NEW `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useBulkApproval.ts`
- NEW `apps/hb-webparts/src/webparts/hbKudosCompanion/components/BulkActionBar.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useCompanionActions.ts` (drops old handleBulkApprove)
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css` + `.d.ts`
- manifest + solution bump

### Prompt-08 — validation coverage expansion (`230f27a2`)
- NEW `apps/hb-webparts/src/homepage/__tests__/kudosPhase27Workspace.test.tsx`
- `apps/hb-webparts/src/homepage/__tests__/hbKudosCompanionRuntime.test.tsx` (regex tab-label matchers)
- solution + feature bump only (test-only change)

### Prompt-09 — packaging / mount / contract closure (`75f9ee00`)
- `scripts/testing/people-kudos/smoke/index.ts` (retired merged-seam expectations)
- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts` (owns-map refreshed)
- `apps/hb-webparts/src/homepage/__tests__/kudosDoctrineGuards.test.ts` (+ six closure invariants)
- solution + feature bump only

### Prompt-10 — closure report (this document, no code)
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/phase-27/99-Closure-Report.md`

---

## 2. Findings closed

### Finding 01 — shared token bridge still locally authored (P0) → **CLOSED**

- **Why.** `KUDOS_GOV_TOKENS` is now a disciplined alias layer over
  governed `HBC_PRESENTATION_BLUE`, `HBC_PRESENTATION_ORANGE`,
  `HBC_PRESENTATION_*_RGB`, and `HBC_SURFACE_PRESENTATION.warmTint`.
  Unused `KUDOS_INTENT` / `KUDOS_SPACE` / `KUDOS_RADIUS` exports were
  removed. `kudosCSSVars()` is applied once at each webpart root;
  every governance primitive and dialog body inherits through the
  CSS cascade — no re-spread on primitives.
- **Evidence.** Commit `cedd7b2b`. Doctrine-guard test
  `kudosDoctrineGuards.test.ts > token derivation` still asserts
  `KUDOS_GOV_TOKENS.brandBlue === HBC_PRESENTATION_BLUE` and
  `brandOrange === HBC_PRESENTATION_ORANGE` (16/16 passing at the
  time of that commit; the guard now runs inside 22/22 in the
  final post-Prompt-09 suite).

### Finding 02 — public-surface CSS materially non-compliant (P0) → **CLOSED**

- **Why.** `kudosSurface.module.css` and `kudosReader.module.css`
  are now free of raw hex / raw rgba. Every decorative color, shadow,
  border, and gradient resolves through a `var(--hbk-*)` custom
  property seeded by `kudosCSSVars()`.
- **Evidence.** Commit `48aca47d`. The final commit message records
  the ripgrep sweep `#[0-9a-fA-F]{3,8}\b|rgba?\(` against
  `apps/hb-webparts/src/webparts/hbKudos/*.css` returning **0
  matches**. Local exceptions (editorial ink ramp, presentation-
  lane danger / warning accents, hero deep-blue stack, warm-row
  gradient stops) are collected in one commented block in
  `KudosGovernancePrimitives.tsx` with explicit rationale.

### Finding 03 — public surface structurally underpowered (P1) → **CLOSED**

- **Why.** The public surface is now composed as three real zones
  — hero+featured / Recent stream section / Archive section +
  terminal feed CTA — with shared `.sectionHeader / .sectionEyebrow
  / .sectionMeta / .sectionTitle` grammar, row date spines, a
  pill-shaped archive toggle, and a product-grade terminal
  `.feedCta` always-visible card. The subtle text-link feed entry
  was retired; the loose `.recentLabel` band was replaced.
- **Evidence.** Commit `7152546e`. New vitest spec
  `kudosPhase27Workspace.test.tsx > HbKudos public surface —
  Phase-27 Prompt-03 hierarchy` asserts "Past recognition" h3
  renders and the toggle flips `aria-expanded` + label between
  "Open archive" / "Collapse archive".

### Finding 04 — flyout shell over-reuse (P1) → **CLOSED**

- **Why.** Four semantic shell families now exist
  (`KudosReaderShell`, `KudosFeedShell`, `KudosTaskDialogShell`,
  `KudosGovernanceDetailShell`), each wrapping
  `HbcKudosComposerFlyout` for the shared mechanics but supplying
  its own body layout (reading-width article, dense list,
  compact task dialog, governance workspace). Every caller was
  migrated. The one-size-fits-all `KudosFlyoutBody.tsx` wrapper
  was deleted.
- **Evidence.** Commit `e19b17ef`. Doctrine guard
  "kudosShells.tsx exports the four Phase-27 Prompt-04 shell
  families" (added in Prompt-09) locks the exports. Grep for
  `HbcKudosComposerFlyout` outside of `KudosComposerPanel.tsx`
  and `kudosShells.tsx` returns zero — the composer shell is
  only reached via the semantic shells now.

### Finding 05 — companion runtime overgrown and under-extracted (P0) → **CLOSED**

- **Why.** `HbKudosCompanion.tsx` is now a thin orchestration
  host. 1,518 LOC → 406 LOC at decomposition (540 LOC after the
  Prompt-06 ActiveFilterBar was added inline). Dedicated seams
  under `runtime/` (tabs, filter, role, queue, actions,
  bulk-approval) and `components/` (QueueRow, DetailPanel,
  CompanionDegradedStates, BulkActionBar).
- **Evidence.** Commits `00fab85b` + `f9c09756` + `aa2e7aac`.
  Doctrine guard "HbKudosCompanion.tsx stays a thin
  orchestration host (≤ 600 LOC)" passes (added Prompt-09).
  `applyCompanionFilter` + `CompanionFilterState` are re-exported
  from `HbKudosCompanion.tsx` so the existing test + docs
  consumers did not break.

### Finding 06 — companion UX leaves major upside on the table (P1) → **CLOSED**

- **Why.** Six structural upgrades ship together in Prompt-06:
  (a) per-tab scope counts, (b) sticky control zone with
  ink-shadow under, (c) dismissible active-filter chip bar with
  Clear-all, (d) left-edge workflow-state rail on every queue
  row (data-workflow-status / data-admin-flag / data-overdue
  attribute selectors), (e) right-aligned date spine on rows,
  (f) tightened row density. None of these is cosmetic — each
  is a scan, scope, or filter-reversibility improvement.
- **Evidence.** Commit `f9c09756`. `kudosPhase27Workspace.test.tsx`
  specs cover every upgrade (tab count regex, filter-chip
  visibility + dismiss + clear-all, state-rail attribute
  assertions).

### Finding 07 — bulk operations operationally weak (P2) → **CLOSED**

- **Why.** Three-phase state machine replaces the sequential
  loop + "N of M failed" string. `idle` → `running` (live
  progress bar with `aria-valuenow/valuemax`, completed-total,
  current-item headline, running tallies) → `summary` (success
  / failed / skipped chips, per-failure reason list, explicit
  `Retry N failed` scoping the retry to failed ids only,
  Dismiss). One authoritative `run(ids)` path invoked by both
  initial execution and retry.
- **Evidence.** Commit `aa2e7aac`. `kudosPhase27Workspace.test.tsx
  > BulkActionBar — Phase-27 Prompt-07 three-phase surface`
  covers all phases and the retry-visibility rule
  (`failures > 0`). `aria-live="polite"` confirmed on both the
  running bar and the summary panel.

### Finding 08 — validation too packaging-centric (P0) → **CLOSED**

- **Why.** New `kudosPhase27Workspace.test.tsx` (14 specs)
  covers tab counts, active-filter bar, state rail, three-
  phase bulk surface, and the public-surface hierarchy. The
  existing companion runtime smoke's two brittle string
  matchers were updated to regex form. Packaging / doctrine /
  import-discipline guards were preserved and extended (six
  new Prompt-09 invariants).
- **Evidence.** Commits `230f27a2` + `75f9ee00`.
  `vitest run src/homepage/__tests__/kudosDoctrineGuards.test.ts`
  → **22/22 passing** (was 16/16 pre-series).
  `vitest run src/homepage/__tests__/kudosPhase27Workspace.test.tsx`
  → **14/14 passing**.
  `vitest run src/homepage/__tests__/hbKudosCompanionRuntime.test.tsx`
  → **34/34 passing**.

### Finding 09 — mount / manifest / contract discipline (Preserve) → **PRESERVED & TIGHTENED**

- **Why.** Runtime-contract constants, mount-map linkage,
  manifest adjacency, and shell componentIds all re-verified
  intact. Drift in the smoke script (retired merged People &
  Culture seam) was removed. Six new packaging invariants were
  added to the doctrine-guard test.
- **Evidence.** Commit `75f9ee00`. New invariants assert that
  (i) `mount.tsx` sources both Kudos ids from the runtime
  contract and carries no inline GUID keys,
  (ii) `tools/spfx-shell/config/package-solution.json` component
  ids include both Kudos GUIDs,
  (iii) manifest aliases equal the contract's `manifestAlias`
  fields,
  (iv) `HbKudosCompanion.tsx` stays ≤ 600 LOC,
  (v) `kudosShells.tsx` exports all four families,
  (vi) no `@hbc/ui-kit` root-barrel imports in the new
  companion seams.

### Finding 10 — premium-stack adoption still shallow (P2) → **MATERIALLY ADVANCED**

- **Why.** Not an explicit single-prompt target, but the series
  deepened premium-stack usage along the way: `class-variance-
  authority` variants expanded (`kudosArchiveToggle`,
  `kudosArchiveChevron`, cva pills in BulkActionBar);
  `clsx` composition used in QueueRow state-rail variant
  selectors, ActiveFilterBar, and BulkActionBar; governed
  `HbcKudosComposerFlyout` mechanics reused through four
  semantic shells; motion + reduced-motion behaviour preserved
  across the redesign.
- **Evidence.** Across every prompt's commit; doctrine-guard
  import-discipline check (no root-barrel imports) passes
  against all new seams (`runtime/**`, `components/**`).
- **Honest caveat.** Promotion of the semantic shells into
  `@hbc/ui-kit/homepage` itself remains a future initiative —
  they currently live in `apps/hb-webparts/src/homepage/shared/`
  under the rationale noted in `kudosShells.tsx`.

---

## 3. Remaining issues

### 3.1 — Pre-existing workspace-wide vitest failures (NOT introduced by this series)
- `npx vitest run` across `apps/hb-webparts/` reports **16
  failing tests across 10 unrelated People & Culture / utility /
  operational-awareness webpart test files** both with and
  without the Prompt-08 additions loaded
  (confirmed by `--exclude='**/kudosPhase27Workspace.test.tsx'`
  baseline comparison in the Prompt-08 commit message).
- **Scope.** None of these failures are in Kudos source or Kudos
  tests. They predate Phase-27 and were deliberately left
  untouched so the remediation series kept a clean scope.
- **Recommended follow-up.** Triage under the People & Culture
  or utility-webpart plan tracks — separate owners.

### 3.2 — Locally authored presentation-lane exceptions
- Editorial ink ramp (`INK_BASE = '#1a1310'`,
  `INK_HEADING = '#0a1b33'`), presentation-lane danger
  (`DANGER_RED = '#c4314b'`), warning
  (`WARNING_ORANGE = '#c26434'`), editorial hero deep-blue stack
  (`HERO_BLUE_0..3`), warm-row gradient stops, peach highlight
  (`WARM_HIGHLIGHT = '#ffd7bf'`), and glass-ink tints all remain
  locally authored inside `KudosGovernancePrimitives.tsx`.
- **Why this is acceptable today.** Each is commented as a
  local exception pending shared-theme promotion; the shared
  `HBC_PRESENTATION_*` tokens do not yet expose presentation-
  lane ink, danger, or warning ramps. Consolidation in one
  file (and one `kudosCSSVars()` bridge) makes promotion a
  visible swap, not a scatter-fix.
- **Recommended follow-up.** Open a ui-kit initiative to
  promote a presentation-lane ink ramp + danger / warning
  semantic tokens into `HBC_STATUS_*` / `HBC_SURFACE_*` so
  Kudos can retire the last local colour literals.

### 3.3 — Validation coverage intentionally deferred (Prompt-08)
- No mocked end-to-end dispatch test over
  `submitKudosGovernanceAction` (bulk loop integration).
- No reduced-motion snapshot parity (static CSS path, low
  regression risk).
- No Playwright navigation harness.
- Each is documented with rationale in the Prompt-08 commit body.

### 3.4 — Minor
- `applyCompanionFilter.test.ts` continues to import the selector
  from `HbKudosCompanion.tsx` via the re-export shim. This is
  preserved intentionally so downstream consumers stayed stable
  during decomposition, but a future pass could migrate the
  test to import directly from
  `runtime/companionFilter.ts` and then drop the host re-export.

---

## 4. Doctrine judgment

**COMPLIANT — with narrowly scoped, explicitly documented
presentation-lane exceptions.**

- **SPFx Governing Standard.** Token discipline, public-
  surface raw-literal prohibition, strong separation between
  composer / reader / task / governance shell semantics,
  premium-stack usage (cva / clsx / motion / radix in
  approved primitives), and role-aware capability gating
  are all satisfied. Doctrine-guard test **22/22 passing**
  (was 16/16 pre-series).
- **SPFx Homepage Overlay.** Presentation-lane token derivation
  through `HBC_PRESENTATION_*` + `HBC_SURFACE_PRESENTATION`,
  curated lucide icon set, no pseudo-icons, no root-barrel
  `@hbc/ui-kit` imports, and governed container-query layout
  for hosted SharePoint sections are all satisfied.
- **Exceptions.** The five local colour groups listed in §3.2
  remain in a single disciplined seam and are marked for
  ui-kit promotion. Doctrine allows narrowly scoped local
  values with explicit rationale; this series keeps them to
  one file with one block of commentary. Compliant.

## 5. Production-readiness judgment

**READY — with the named follow-ups in §3 treated as roadmap,
not blockers.**

- **Runtime contract.** Both Kudos webparts route through
  `kudosRuntimeContract.ts` constants, are registered in
  `tools/spfx-shell/config/package-solution.json`
  componentIds, and have matching shell-entry shims +
  release manifests. SPFx 4-part versions preserved.
  Mount-map invariant enforced by test.
- **UX posture.** Public surface presents a productized
  stream hierarchy with terminal feed CTA; companion
  presents a moderation workspace with sticky controls,
  per-tab workload visibility, per-chip filter reversibility,
  instant-parse state rails, and confidence-building bulk
  approval (progress + per-failure reasons + scoped retry).
- **Failure posture.** Companion's six degraded render
  paths all preserve `data-hbc-state` + `data-hbc-testid`
  contracts (`role-resolving`, `role-resolution-failed`,
  `host-unconfigured`, `access-restricted`, `loading`,
  `load-error`). Bulk approval surfaces partial failures
  with reasons instead of collapsing to a generic string.
- **Testing posture.** 70/70 Kudos-specific vitest tests
  passing (22 doctrine guards + 14 Phase-27 workspace
  specs + 34 companion runtime specs). Smoke script
  reflects repo truth after retired-seam drift was removed.

The remediation series honestly closes every audited finding
with file-level evidence. The honest gaps in §3 are either
outside Kudos scope (§3.1), openly scheduled for ui-kit
promotion (§3.2), explicitly deferred with rationale (§3.3),
or deliberate compatibility shims (§3.4).

Phase-27 is closed.
