# Wave 15A — B6 — Prompt 01 — Project Home Baseline Audit & Guarded Workplan

**Status:** Audit only — no product code, manifest, package, lockfile, or shared-primitive change.
**Baseline commit:** `17e4273ebd070dd62ca477297393e6c787441111`
**Baseline evidence path:** `docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/`
**Canonical scorecard:** `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
**Lockfile MD5 (pre-edit):** `00570e10e3dc9015188ba503ea996943`

---

## Repo-truth summary

- Branch: `main`. Working tree clean apart from the untracked Wave 15A B6 planning package at `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b6/`.
- HEAD `17e4273ebd070dd62ca477297393e6c787441111` matches the package's named baseline. No drift detected.
- `pnpm-lock.yaml` MD5 `00570e10e3dc9015188ba503ea996943` is preserved across this prompt; no install/add/update was run.
- Project Home surface lives under `apps/project-control-center/src/surfaces/projectHome/`.
  - Fixture-only render path: `PccProjectHome.tsx`. When the optional `readModelClient` prop is omitted, returns a `<Fragment>` of 10 cards directly (no wrapper), preserving the bento direct-child invariant.
  - Read-model render path: `PccProjectHomeReadModelContent.tsx`. Selected via `if (readModelClient) return <PccProjectHomeReadModelContent client={readModelClient} />;`. Renders 16 cards: 11 base cards + a Fragment-of-4 from `PccProjectHomeUnifiedLifecycleSection.tsx` + 1 card from `PccProjectHomeAskHbiSection.tsx`. Each child is a direct `[data-pcc-bento-grid]` child; the lifecycle section returns a `Fragment`, the Ask HBI section returns a single `PccDashboardCard`.
  - View-model contract: `projectHomeViewModel.ts` (`IPccProjectHomeReadModelClient`, `IPccProjectHomeViewModel`).
  - Adapter: `projectHomeAdapter.ts` (envelope → view-model, fail-closed degradation).
  - Hook: `useProjectHomeReadModel.ts` (parallel fetches: home / priority / docs / procore / approvals).
  - Procore card: `PccProjectHomeProcoreSnapshotCard.tsx` — display-only, no live runtime, no `<a href>` launch, no write-back.
  - External Platforms card: `PccExternalSystemsCard.tsx` — explicitly does not render `<a href>` launch links.
  - Ask HBI panel: `PccProjectHomeAskHbiSection.tsx` — mounts idle (`initialQuery={null}`); no autonomous decision, approval, writeback, or mutation language on this surface.
- Tests inspected:
  - `apps/project-control-center/src/tests/PccProjectHome.test.tsx` — 23 cases. `REQUIRED_CARD_TITLES` (the fixture-only 10) is asserted for presence + bento direct-child + active-panel marker (`data-pcc-active-surface-panel="project-home"`); rail compactness, inert affordances, no `http(s)` anchors, Document Control lane grouping, Site Health severity/counts, Project Readiness module-scoped rows, Approvals/External/Team/Recent fixtures all asserted. Exact card-order ordering is **not** asserted on the fixture path.
  - `apps/project-control-center/src/tests/PccApp.optIn.test.tsx` — 12 cases covering fixture vs backend opt-in fetch posture (`readModelMode: "fixture"` vs `"backend"`), GET-only canonical URL fetches, default-fixture fall-through when no read-model config, error-state safety for backend-unavailable, and per-surface client-method invocation policy (e.g., `getTeamAccess` is never called for `project-home`).
  - `apps/project-control-center/src/tests/PccCardTierContract.test.tsx` — 16 dynamic cases covering project-home explicit sources / layout markers / `aria-labelledby` / direct bento children, active-panel `data-pcc-heading-level="2"`, zero `<a href^="http(s)">` anchors, `aria-describedby` reason-node resolution for disabled affordances, plus tier/region claims for adjacent surfaces. **The read-model path's exact 16-card order is not test-locked today.**
- Bento invariant: every `[data-pcc-card]` is a direct child of `[data-pcc-bento-grid]` in both render paths. No `<section>` wrappers. No nested `PccDashboardCard`.
- HBI / Procore / Sage / SharePoint boundary copy: clean. Procore snapshot is "Display-only", "no live runtime", "no write-back", "no enabled mutation". Ask HBI title is "Ask HBI — Grounded Project Answers"; no decision/approve/writeback verbs detected on the surface.

## Evidence summary

Inspected `docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/` (present locally).

- **DOM card summary** (`surface-screenshots-…/pcc-live-dom-card-summary.json`): Project Home reports 16 cards, ordered as listed under "Confirmed current Project Home card order — read-model path" below.
- **Screenshot inventory** (`pcc-live-screenshot-inventory.json`): Project Home has `above-fold`, `full-page`, and `scroll-segment-001` (each 1280×720, `operatorReviewRequired=true`). Screenshot evidence is **above-fold-heavy**; the inventory captures only one scroll segment, and breakpoint screenshots reflect `scrollY: 0` — meaning Lifecycle (index 12), Memory/Lens/Related (indexes 13–15), and Ask HBI (index 16) are not visually proven below-fold. Treat this as a known evidence-gap to remediate in Prompt 07.
- **Breakpoint matrix** (`breakpoints-…/pcc-live-breakpoint-matrix.json`): 8 viewports captured (`phone-390`, `tablet-portrait-768`, `tablet-landscape-1024`, `small-laptop-1180`, `standard-laptop-1366`, `large-laptop-1536`, `desktop-1728`, `ultrawide-2048`). No horizontal-scroll failures; phone-390 hero card reports `overflowX=true / clipped=false` (visual but non-blocking).
- **Card measurements** (`pcc-live-breakpoint-card-measurements.json`): no `minTouchTargetIssueCount > 0` on the sampled cards. **Phone-390 Priority Actions card height = 2573 px** (108-row span) — the primary motivator for OD-03 compact-rail compression. Hero, Missing Configurations, and Site Health cards measure within expected envelopes at phone-390.
- **Accessibility** (`accessibility-…/pcc-live-axe-summary.json`): **4 serious color-contrast violations** on Project Home, all on the Project Intelligence hero metric labels — `_heroFacts > _metricCell:nth-child(1..4) > _metricLabel`. No target-size violations. Project Home has the lowest contrast-violation count of inspected surfaces (Project Readiness has 11; Site Health has 5).
- **Content review** (`content-…/content-review-findings.json`): 2 `needs-review` categories — "Disabled controls missing clear reason copy" (EV-87..EV-90) and "HBI authority boundary risk terms detected" (EV-100..EV-103). 5 `review-support` categories — source confidence, ownership/action language, state copy, mock/fixture transparency, construction operations.
- **Workflow / false-affordance** (`workflow-…/pcc-live-action-summary.json` and `pcc-live-false-affordance-summary.json`): 29 actionable elements detected on Project Home. **All 29 are flagged `falseAffordanceRisk=none-observed`** with `needsReview=false`; action-handler instrumentation is absent (`actionType: null`, `cardIndex: null` for all 29) — meaning the baseline confirms no false affordances rather than confirming a complete set of bound handlers.

## Confirmed current Project Home card order

### Fixture-only path — 10 cards (per `PccProjectHome.tsx`)

1. Project Intelligence (Tier1 / command / hero) — carries `data-pcc-active-surface-panel="project-home"`.
2. Priority Actions (Tier2 / operational / wide).
3. Missing Configurations (state / state).
4. Site Health Summary (Tier2 / operational).
5. Approvals & Checkpoints (Tier2 / operational, fixture body).
6. Project Readiness (Tier2 / operational).
7. Document Control Center (Tier2 / operational / wide).
8. External Platforms (Tier3 / reference).
9. Team Snapshot (Tier3 / rail).
10. Recent Activity (Tier3 / reference).

### Read-model path — 16 cards (per `PccProjectHomeReadModelContent.tsx` and DOM scrape)

1. Project Intelligence Header (Tier1 / command / hero).
2. Priority Actions (Tier2 / operational / wide).
3. Missing Configurations (state / state).
4. Site Health Summary (Tier2 / operational).
5. **Procore snapshot** (Tier3 / deferred) — **breaks the operational cluster; OD-06 demotes it below tier-2 cards.**
6. Approvals & Checkpoints (Tier2 / operational).
7. Project Readiness (Tier2 / operational).
8. Document Control Center (Tier2 / operational / wide).
9. External Platforms (Tier3 / reference).
10. Team Snapshot (Tier3 / rail).
11. Recent Activity (Tier3 / reference / tall).
12. Lifecycle Timeline (Tier2 / detail) — **late; OD-05 promotes a compact summary earlier.**
13. Project Memory (Tier3 / reference).
14. Project Lens (Tier3 / rail).
15. Related Records (Tier3 / detail).
16. **Ask HBI — Grounded Project Answers** (Tier2 / detail) — **last; OD-04 promotes earlier visibility.**

## Confirmed target Project Home card order

Per `02_TARGET_ARCHITECTURE.md` and closed decisions OD-02..OD-08:

1. Project Command Summary — renamed from "Project Intelligence" (OD-08); Tier1 / command / hero. Carries `data-pcc-active-surface-panel="project-home"` and `data-pcc-heading-level="2"`.
2. Today's Operating Priorities — compact rail (OD-03), top 5–7 visible by default + overflow-summary count, no live execution; Tier2 / operational / wide.
3. Approvals & Checkpoints — Tier2 / operational.
4. Project Readiness — Tier2 / operational.
5. Document Control Center — Tier2 / operational / wide.
6. Site Health / Setup Health — conditional tier (Tier2 when failing, state when healthy; OD-07 makes Missing Configs exception-forward).
7. Lifecycle Continuity — compact, promoted earlier (OD-05); Tier2 / detail or command-support.
8. Ask HBI Entry / Grounded Answers — promoted earlier (OD-04); Tier2 / detail; idle-on-mount preserved.
9. Source Confidence / Procore Snapshot — demoted below tier-2 cluster (OD-06); Tier3 / reference|deferred.
10. External Platforms — Tier3 / reference.
11. Team Snapshot — Tier3 / rail.
12. Recent Activity — Tier3 / reference.
13. Project Memory / Project Lens / Related Records — Tier3 / reference|rail|detail (lower).

Card-count boundaries unchanged: fixture-only ≤10, read-model ≤16. **No card deletions** — reorder, compress, retier only (OD-02).

## Implementation risks

Risks for Prompts 02–08:

1. **Read-model card order is not test-locked today.** Prompt 04 must add an explicit ordered-marker assertion (e.g., `data-pcc-readiness-section` or stable card-id attributes scanned in render order, scoped to `[data-pcc-bento-grid]`) **before** reordering. Otherwise reorderings can ship green.
2. **Project Intelligence → Project Command Summary rename (OD-08)** cascades through (a) the `data-pcc-active-surface-panel` carrier, (b) the heading text/`aria-labelledby`, (c) `REQUIRED_CARD_TITLES` in `PccProjectHome.test.tsx`, (d) any tier-contract row in `PccCardTierContract.test.tsx` keyed on the title, (e) any evidence/blueprint historical text. Rename only the cascade source per `feedback_displayname_cascade_decision_record.md`; produce an "intentionally unchanged" table in the Prompt 02 closeout.
3. **Compact Priority Actions rail (OD-03)** must keep "no anchors / no executable handlers / inert affordance" assertions intact. Overflow-summary rendering must not introduce `<a href>` or visible-but-handlerless buttons (`feedback_no_silent_action_noops.md`). Phone-390 height target: materially lower than 2573 px.
4. **Lifecycle/HBI promotion (OD-04, OD-05)** reorders cards inside `PccProjectHomeReadModelContent.tsx` only; the unified-lifecycle Fragment-of-4 contract and Ask HBI single-card contract must be preserved (bento direct-child invariant — `feedback_pcc_bento_direct_child_invariant.md`).
5. **Hero contrast remediation (Prompt 02 / 07)** must use existing `--pcc-*` tokens — no new rgba shadows or rules (`feedback_css_token_discipline_diff_scoped.md`); CSS scope is the `_heroFacts > _metricLabel` selectors only.
6. **HBI / Procore boundary copy (Prompt 06)** must avoid mutation verbs. Prefer **structural** assertions (no executable anchors, disabled buttons with reason-node `aria-describedby`) over text-blocklist tests, per `feedback_word_blocklists_break_on_corrected_copy.md`.
7. **Shared primitives are off-limits** (`PccBentoGrid`, `PccDashboardCard`, `footprints.ts`, shell/tabs, hero primitives — OD-10). If a blocking validation failure proves Project Home cannot complete without a primitive change, **stop and report the exact blocker** before touching primitives.
8. **Manifest / `package.json` / `pnpm-lock.yaml` / `package-solution.json` are off-limits** for the entire wave-b6 package. The lockfile MD5 reference is `00570e10e3dc9015188ba503ea996943`; reconfirm it in every prompt's closeout per `feedback_lockfile_discipline.md`.
9. **Hosted/tenant proof remains OPERATOR-PENDING** (`feedback_no_implicit_hosted_proof.md`, `feedback_operator_pending_proof.md`). The Playwright JSON evidence is local baseline only; no prompt may claim 100/100, 95+/100, or Phase 4 readiness from package-truth alone.
10. **Below-fold screenshot gap.** The current evidence reflects `scrollY: 0` segments; Lifecycle, Memory, Lens, Related Records, and Ask HBI cards are not photographically proven. Prompt 07 (or the closing Prompt 08) must capture real below-fold scroll segments before claiming the new card hierarchy is observed end-to-end.

## Recommended file changes by prompt

**Prompt 01 — this prompt — no product-code change.** Adds only `wave-b6/evidence/PROMPT_01_AUDIT_REPORT.md` (this file) and commits the wave-b6 planning tree.

**Prompt 02 — Command hero (OD-08) + first-fold contrast:**

- `apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx` — rename label cascade source, add operator-facing posture facts.
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css` — hero metric-label contrast using existing tokens.
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx` — title rename, tier/region/active-panel marker assertions.
- `apps/project-control-center/src/tests/PccCardTierContract.test.tsx` — adjust the active-panel carrier identity if needed.

**Prompt 03 — Priority Actions compact rail (OD-03):**

- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx` and `PccPriorityActionsRail.module.css`
- `apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts`
- `apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts`
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx` — compact-rail defaults, overflow-summary count, no-execution assertions.

**Prompt 04 — Core-control cluster + card-order lock (OD-02, OD-06, OD-07):**

- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx` (fixture path order).
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx` (read-model path order).
- `apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx` (exception-forward demotion).
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeProcoreSnapshotCard.tsx` (demotion below tier-2).
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx` — add ordered-marker assertion for both paths.
- `apps/project-control-center/src/tests/PccCardTierContract.test.tsx` — tier/region claims for the reordered set.

**Prompt 05 — Lifecycle compact + Ask HBI promotion (OD-04, OD-05):**

- `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx`
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx`

**Prompt 06 — Content / source / HBI copy (OD-13, EV-87..EV-103):**

- Project Home card components carrying overclaim risk.
- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx` (owner / date / source language).
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx` (HBI advisory boundary copy).
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx` — content-presence assertions; structural over text-blocklist.

**Prompt 07 — Accessibility & responsive remediation:**

- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css`
- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.module.css`
- Touch-target remediation in HBI section / child components if a re-baseline confirms PCC ownership.
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx` — no-regression assertions.

**Prompt 08 — Scorecard audit & closeout (no scorecard claim):**

- `apps/project-control-center/src/tests/PccProjectHome.test.tsx` — comprehensive final assertions.
- Documentation: before/after evidence summary inside `wave-b6/evidence/`.

## Validation commands to run after Prompt 02 onward

Use targeted package-local validation. **Package filter is `@hbc/spfx-project-control-center`. Typecheck script is `check-types`.**

```
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHome.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- PccCardTierContract.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- PccApp.optIn.test.tsx
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm exec prettier --check <changed-file-paths>
git diff --check
```

- Run `prettier --check` against the **specific changed files** the prompt produced — never broadly write across `apps/project-control-center/src/surfaces/projectHome`. If `--check` flags a real diff, run `--write` against the same narrow path list and rerun the affected `*.test.tsx` files (per prettier-before-final-test ordering).
- Workspace-wide commands and hosted/tenant probes remain unauthorized for this package.

## Open blockers

None for Prompt 01. The audit confirms the wave-b6 package's authored claims against the live repo and the local Playwright evidence; no contradiction was detected. Risks above are advisory for Prompts 02–08 and do not block proceeding to Prompt 02.

---

## Closeout

- **Files changed:** `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b6/` (entire planning package committed as the first landing commit, including this audit report at `wave-b6/evidence/PROMPT_01_AUDIT_REPORT.md`). No product code, manifest, package.json, pnpm-lock.yaml, package-solution.json, shared-primitive, shell, or SPFx packaging file was touched.
- **Repo-truth confirmed:** branch `main`, HEAD `17e4273ebd070dd62ca477297393e6c787441111`, lockfile MD5 `00570e10e3dc9015188ba503ea996943` unchanged.
- **Implementation summary:** Audit-only deliverable. Verified Project Home two-path contract, bento direct-child invariant, current 10-card fixture order, current 16-card read-model order, Procore/Sage/SharePoint boundary copy posture, and Ask HBI advisory framing. Confirmed local Playwright evidence: 16 DOM cards, 8 breakpoints captured, 4 serious color-contrast violations on hero metric labels, Priority Actions phone height 2573 px, 29 affordances all flagged `none-observed`, screenshot inventory limited to `scrollY: 0` segments (below-fold gap recorded for Prompt 07).
- **Tests run:** None (no behavior change). Documentation/commit hygiene only — `git status --short`, `git rev-parse HEAD`, `md5 pnpm-lock.yaml`, `pnpm exec prettier --check docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b6`, `git diff --check`, plus pre-commit `git diff --cached --name-only` / `git diff --cached --stat` and post-commit `git status --short` / `md5 pnpm-lock.yaml` / `git show --name-only --stat HEAD`.
- **Validation results:** to be appended in chat after the commit lands.
- **Lockfile/package/manifest status:** unchanged. Lockfile MD5 reconfirmed in the closeout chat output.
- **Known residual risks:** the read-model card order is not test-locked today (must be addressed in Prompt 04); below-fold screenshot evidence is incomplete (Prompt 07); hosted/tenant proof remains OPERATOR-PENDING.
