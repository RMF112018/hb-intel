# Prompt 05 — Test Contract Consolidation and Bento / Active-Panel Guardrails After Shell-Only Completion

## Objective

Complete the Phase 04 test-contract cleanup after Prompts 01 through 04B-10. Prompt 4B-10 moved Project Readiness into the shell-only posture and left `SURFACES_WITH_COMPATIBILITY_CARD` empty across the current contract/smoke tests. This prompt must consolidate that final state into a clear, durable test posture:

```text
All eight PCC MVP surfaces are shell-owned active panels.
No bento-grid card is allowed to own `data-pcc-active-surface-panel`.
All duplicate top-level surface/header cards remain absent.
Operational content, bento direct-child invariants, tab/tabpanel accessibility, and read-only/source-authority boundaries remain protected.
```

This is primarily a test and selector hardening prompt. Do not make production source changes unless a failing test exposes a real production regression that cannot be addressed by correcting stale tests.

---

## Common Local-Agent Directive

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are operating inside the local `hb-intel` repo. Use current repo truth. Do not rely on this package alone where live files contradict it. The repo has moved through Prompt 4B-10, committed as:

```text
4f70e1aa8aa7d5c9cbae31b0250104f6783ad40c
```

Treat that commit as the baseline claim to verify, not as sufficient proof.

Preserve SharePoint host-fit, read-only/no-writeback posture, bento direct-child invariants, and tab/tabpanel accessibility.

Do not implement Phase 05 module launcher, Phase 06 Project Home bento composition realignment, URL routing, command routing, active module state, live integrations, writeback, package/manifest version changes, or broad visual redesign during this prompt.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

---

## Required Repo-Truth Gate Before Editing

Start with a compact repo-truth pass. Record findings in your execution notes before editing.

Run / inspect:

```bash
git status --short
git show --stat --oneline 4f70e1aa8aa7d5c9cbae31b0250104f6783ad40c
rg -n "SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL|expectsCompatibilityCard|getActiveCompatibilityCard|getSoleActivePanel|compatibilityCards|dataActiveSurfacePanel|data-pcc-active-surface-panel|PccDocumentsHeaderCard|PccTeamAccessHeaderCard|PccProjectIntelligenceCard|PccExternalSystemsLaunchPadHeaderCard|PccSiteHealthOverviewCard|HomeCard|HeroCard" apps/project-control-center/src e2e/pcc-live docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b9
```

Confirm and document:

- `PccShell.tsx` still renders exactly one shell-owned `main[role="tabpanel"]` with:
  - `id="pcc-active-surface-panel"`;
  - `aria-labelledby={pcc-tab-${activeSurfaceId}}`;
  - `data-pcc-active-surface-panel={activeSurfaceId}`.
- `PccHorizontalTabs` still gives each top-level tab `aria-controls="pcc-active-surface-panel"` and stable `id="pcc-tab-${surfaceId}"`.
- `PCC_SHELL_SURFACE_HEADER_METADATA` remains exhaustively keyed over all eight MVP surfaces and carries the hero highlights / governance microcopy introduced by Phase 03 / Prompt 04B remediation.
- All eight MVP surfaces are now shell-only in rendered app tests.
- No production card should be expected to emit `data-pcc-active-surface-panel`.
- Any remaining `dataActiveSurfacePanel` usage is either legacy/dead code to remove, or in documentation only; it must not remain as a required runtime/test contract.
- Any remaining Playwright or evidence selector that targets `[data-pcc-card][data-pcc-active-surface-panel]` is stale and must be migrated.

Hard stop before editing if any MVP surface still intentionally emits a card-level active-panel marker in production. If that happens, update this prompt’s execution notes and do not perform the final shell-only cleanup until the mismatch is resolved.

---

## Primary Files to Inspect and Update

At minimum inspect these files and update only where current repo truth shows stale compatibility-card assumptions:

```text
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.hierarchy.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx
apps/project-control-center/src/tests/PccDocumentsSurface.tier.test.tsx
apps/project-control-center/src/tests/PccApprovalsSurface.test.tsx
apps/project-control-center/src/tests/PccSiteHealthSurface.test.tsx
apps/project-control-center/src/tests/PccExternalSystemsSurface.test.tsx
apps/project-control-center/src/tests/PccControlCenterSettingsSurface.test.tsx
apps/project-control-center/src/tests/shellSurfaceSelection.ts
e2e/pcc-live/
```

Do not update every listed file mechanically. Only edit files that actually contain stale assertions, stale test names, stale helper names, stale compatibility-card constants, or missing regression coverage after current repo inspection.

---

## Required Test Contract Updates

### 1. Collapse the empty compatibility-card split

The current post-4B-10 target is no remaining compatibility-card surfaces. Replace bifurcated test logic with a single all-surface shell-owned contract wherever practical.

Remove or retire stale constructs when they have no remaining valid callers:

```text
SURFACES_WITH_COMPATIBILITY_CARD = []
SURFACES_WITH_SHELL_ONLY_PANEL
expectsCompatibilityCard()
getActiveCompatibilityCard()
getSoleActivePanel()
expectCommandCardPosture() where it only applies to card-level active-panel ownership
empty describe-loop milestone tests that exist only because SURFACES_WITH_COMPATIBILITY_CARD is empty
```

Preferred replacement posture:

```ts
for (const surfaceId of PCC_MVP_SURFACE_IDS) {
  // assert shell main owns active panel
  // assert bento grid exists inside shell main
  // assert zero direct-child cards carry data-pcc-active-surface-panel
  // assert every direct card remains direct child of bento
}
```

Do not weaken the direct-child or explicit tier/region/footprint assertions while simplifying the active-panel split.

### 2. Assert shell-owned active-panel semantics for all MVP surfaces

For every `PCC_MVP_SURFACE_IDS` route in shell-rendered tests, assert:

- exactly one `main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`;
- `id="pcc-active-surface-panel"`;
- `aria-labelledby="pcc-tab-${surfaceId}"`;
- the active tab is selected;
- the active tab’s `aria-controls` points to `pcc-active-surface-panel`;
- the active shell panel contains `[data-pcc-bento-grid]`;
- the bento grid has at least one direct child `[data-pcc-card]`.

Also add / preserve a negative assertion that broad in-grid card ownership is gone:

```ts
const inGridActiveOwners = bento.querySelectorAll('[data-pcc-card][data-pcc-active-surface-panel]');
expect(inGridActiveOwners).toHaveLength(0);
```

For isolated surface renders that do not include `PccShell`, assert `0` active-panel markers unless the isolated render intentionally includes shell markup.

### 3. Preserve bento direct-child invariants

For every shell-rendered MVP surface:

- every `[data-pcc-card]` under `[data-pcc-bento-grid]` must be a direct child of that grid;
- no nested `[data-pcc-card] [data-pcc-card]` trees;
- every card has explicit `data-pcc-card-tier`, `data-pcc-card-region`, `data-pcc-card-tier-source="explicit"`, `data-pcc-card-region-source="explicit"`;
- every card has non-empty `data-pcc-footprint`, numeric positive `data-pcc-column-span`, and numeric positive `data-pcc-row-span`;
- titled cards keep `aria-labelledby` pointing to the heading id.

Do not delete coverage to make the tests pass. Convert stale selector assumptions to current shell-owned selectors.

### 4. Add final no-duplicate-header regression coverage

Add or consolidate a focused regression test that proves each MVP surface no longer starts with a duplicate page-title / description-only bento card.

Use current repo truth to determine the exact first operational card title / marker per surface. Do not invent card titles. The test should cover, at minimum:

```text
project-home
team-and-access
documents
project-readiness
approvals
external-systems
control-center-settings
site-health
```

Required assertions:

- The first direct child card is operational content, not a shell header restatement.
- The first direct child card does not carry `data-pcc-active-surface-panel`.
- Removed header-card names/components are absent from rendered bento content where applicable:
  - `PccProjectIntelligenceCard` / `Project Intelligence` as a bento card heading;
  - `PccTeamAccessHeaderCard` / team-only page-intro card;
  - `PccDocumentsHeaderCard` / documents-only page-intro card;
  - `PccExternalSystemsLaunchPadHeaderCard` as a page-intro active-panel card;
  - Control Center Settings first command/header-only card;
  - `HomeCard` as the Approvals page-intro card;
  - `PccSiteHealthOverviewCard` as the Site Health page-intro card;
  - Project Readiness `HeroCard` / duplicate readiness header card.

Be careful with text assertions. If a phrase is still valid inside the shell hero, scope duplicate-card absence to the active bento grid and to headings/markers, not to `container.textContent` globally.

### 5. Preserve operational-content assertions by surface

Confirm tests still protect the operational content absorbed during Prompts 02 through 04B-10. Add missing assertions only where current coverage is weak.

Minimum preservation targets:

#### Project Home

- Priority Actions remains the first operational bento card, or the current repo-truth equivalent if renamed.
- Project Intelligence facts/counts that were intentionally preserved after Prompt 4B-01 remain visible in retained operational cards or shell hero metadata.
- The Project Home bento does not depend on `Project Intelligence` as the active surface card.

#### Team & Access

- The first card is an operational team/access lane, not a page-intro card.
- Access-manager and restricted-view state cards retain explicit tier/region posture.
- No access mutation authority is implied.

#### Documents

- Ready path preserves the three-lane document-control posture.
- Non-ready/source-unavailable branches preserve `PccDocumentControlStateCard` state/seam posture.
- No tests require `PccDocumentsHeaderCard` or card-level active-panel ownership.

#### Project Readiness

- Ready path first card is `LifecycleGateMapCard` / current lifecycle-map equivalent.
- Absorbed summary remains present via stable marker such as `data-pcc-readiness-summary`.
- Absorbed readiness stat markers remain present:
  - `data-pcc-readiness-stat="active-gate"`;
  - `data-pcc-readiness-stat="overall-posture"`;
  - `data-pcc-readiness-stat="blocker-count"`;
  - `data-pcc-readiness-stat="evidence-confidence"`.
- Source-health badges remain present.
- The four `TODO(PCC-ProjectReadiness)` future-state markers remain in source near the absorbed summary block.
- Loading/error state cards keep `state/state`, `aria-busy`, and `role="alert"` coverage without active-panel markers.

#### Approvals

- Queue/decision metrics absorbed from the removed home card remain visible.
- Loading/error state cards keep `state/state`, `aria-busy`, and `role="alert"` coverage without active-panel markers.
- No approve/reject/submit authority is introduced.

#### External Systems

- Launch-context cue remains visible in shell hero metadata or retained operational content.
- Launch buttons/links remain inert or governed per current preview contract.
- No external writeback/sync authority is introduced.

#### Control Center Settings

- First card is setup/configuration posture, not a page-intro card.
- Items needing setup and governed-settings/no-save posture remain covered.
- No tenant/project setting mutation authority is introduced.

#### Site Health

- Checks card / current operational equivalent preserves absorbed overview metrics:
  - overall posture;
  - failing count;
  - warnings count;
  - last run / scan indicator.
- Repair requests remain deferred/governed.
- No repair acknowledgement/writeback authority is introduced.

### 6. Update stale test names and comments

Rename test titles and comments that still imply:

```text
compatibility-card surfaces still exist
one direct bento-child compatibility card is expected
the first command card owns active-panel semantics
Project Readiness route command is the readiness Hero
four top-level tabs only, if the current surface model renders more/nested accessible controls
```

Do not perform broad comment churn. Update comments only where they conflict with current test behavior or would mislead the next prompt.

### 7. Search and migrate Playwright / evidence selectors

Search `e2e/pcc-live` for stale card-owned selectors:

```bash
rg -n "\[data-pcc-card\].*data-pcc-active-surface-panel|data-pcc-active-surface-panel|compatibility card|active panel card|active-surface card" e2e/pcc-live playwright.pcc-live.config.ts
```

If Playwright only asserts the shell-owned marker, leave it intact. If any Playwright/evidence selector expects a card-level active-panel marker, migrate it to:

```text
main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]
```

Then scope bento/card checks under that shell panel.

Do not run hosted/live Playwright unless you change Playwright selectors or evidence tooling. If you do change those files, include the Playwright validation commands listed below.

---

## Hard Stops

Do not complete this prompt if the changes:

- remove direct-child bento coverage;
- delete active-panel coverage instead of migrating it to shell ownership;
- leave empty `SURFACES_WITH_COMPATIBILITY_CARD` compatibility loops as the primary contract;
- require any bento card to carry `data-pcc-active-surface-panel`;
- remove operational-content preservation assertions;
- hide failures by loosening selectors to broad `container.textContent` when bento-scoped assertions are possible;
- break tablist/tab/tabpanel ARIA;
- introduce or imply live mutation, writeback, approval authority, repair acknowledgement, external sync, or setting save authority;
- change dependencies, `pnpm-lock.yaml`, SPFx package-solution version, or manifests;
- implement Phase 05 / Phase 06 functionality.

---

## Expected Validation

Run and record:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If Playwright/evidence files are changed, also run and record:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
```

Run hosted live evidence only if the changed selector logic affects live smoke behavior and credentials/environment are available:

```bash
pnpm pcc:e2e:live
```

Do not change `apps/project-control-center/config/package-solution.json`, webpart manifests, or `pnpm-lock.yaml` during this prompt. If any of those files are already dirty at start, record them as pre-existing and do not stage them.

---

## Required Execution Summary

Your following-execution report must include:

- current commit / branch baseline;
- pre-existing dirty files, if any;
- exact files changed;
- stale compatibility-card constructs removed or intentionally retained, with reason;
- all-surface shell-owned active-panel contract now enforced by tests;
- no-duplicate-header regression coverage added/confirmed;
- operational-content preservation assertions added/confirmed by surface;
- Playwright/evidence selector changes, or explicit statement that none were needed;
- validation commands and results;
- `pnpm-lock.yaml` hash before/after;
- confirmation that `apps/project-control-center/config/package-solution.json` was not changed;
- explicit statement that Phase 05 module launcher, Phase 06 Project Home bento composition, command routing, active module state, live integrations, and writeback were not implemented.

