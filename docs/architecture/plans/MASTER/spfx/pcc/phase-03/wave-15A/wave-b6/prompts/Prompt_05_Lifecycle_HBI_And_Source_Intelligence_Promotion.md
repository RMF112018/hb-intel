# Prompt 05 — Lifecycle, HBI, and Source Intelligence Promotion — UPDATED

## Role

You are the local code agent working in the `hb-intel` repository. You are implementing a controlled Project Home flagship remediation for the PCC SPFx application.

## Non-negotiable agent instructions

- Do **not** re-read files that are still within your current context or memory. Only re-open a file when you need to verify stale, missing, contradictory, or newly changed repo truth.
- Start with `git status --short`, `git branch --show-current`, `git rev-parse HEAD`, and `md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml`.
- Treat the accepted Prompt 04 product-code baseline as:
  - `686fa9fd83c1b10c9709fb6aedea13829d61c548`
  - Prompt 03 baseline: `f4cb0b3974e2e0a35ae3ab1ff08246fe3b73c44b`
  - Prompt 02 corrective baseline: `81f3b8dff1c2cc6ec295ccd7ea0ddb8f0536f8b8`
  - Package baseline evidence: `docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/`
- Use the canonical scorecard path:
  - `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
  - Do **not** reference the old `_v2` scorecard filename.
- Preserve the Project Home two-path contract:
  - fixture-only path remains deterministic and no-read-model;
  - read-model-driven path remains opt-in through `readModelClient`;
  - fixture-only path remains exactly 10 cards;
  - read-model-driven path remains exactly 16 cards after read-model/lifecycle hooks settle.
- Preserve bento direct-child behavior:
  - every rendered `[data-pcc-card]` must have `parentElement === [data-pcc-bento-grid]`;
  - do not add wrapper `<div>` / `<section>` / layout containers around Project Home cards;
  - do not nest `PccDashboardCard` inside another `PccDashboardCard`.
- Do not introduce live writes, uploads, syncs, approvals, deletes, saves, external launches, workflow completion, source-system mutation, or writeback.
- Keep HBI advisory:
  - HBI may summarize, explain, ground, and route attention;
  - HBI must not claim autonomous decision, approval, source-of-truth, writeback, or mutation authority.
- Keep Procore/Sage/SharePoint/PCC source-of-record boundaries explicit:
  - do not imply PCC owns Procore/Sage/Graph/SharePoint-native records;
  - do not use “live system feeds” wording for read-model availability.
- Do not edit `package.json`, `pnpm-lock.yaml`, package-solution files, manifests, or SPFx packaging files.
- Do not modify shared primitives (`PccBentoGrid`, `PccDashboardCard`, `footprints.ts`, shell/tabs/hero primitives).
- Prefer Project Home-local component/test changes and the already-existing unified lifecycle/HBI component seams.
- Run the validation commands named in this prompt before closeout. If a command cannot run, report why and what evidence remains missing.
- Stage paths explicitly. Never use `git add -A`. Do not use `--no-verify` or force flags.

## Objective

Make lifecycle continuity and grounded HBI visible earlier on the read-model-driven Project Home path **without increasing card count**, **without adding routes/tabs**, **without duplicating fetches**, and **without giving HBI source-of-truth or writeback authority**.

Prompt 05 must promote the existing lifecycle/HBI differentiators by card order and boundary copy, not by adding a second HBI card, adding a new lifecycle card, or introducing any new runtime behavior.

## Required pre-edit gates

Run before editing:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -n 8
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
grep -R "Source: live system feeds" apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts || echo "gate ok — no matches"
```

Expected posture:
- Current HEAD should include Prompt 04 commit `686fa9fd83c1b10c9709fb6aedea13829d61c548`.
- Lockfile MD5 should remain `00570e10e3dc9015188ba503ea996943`.
- The `grep` command should produce no matches.
- Any unrelated dirty/untracked files must remain untouched and be named in closeout.

## Current repo-truth baseline

At the accepted Prompt 04 baseline, `PccProjectHomeReadModelContent.tsx` renders the read-model path in this order:

```text
0  Project Intelligence
1  Priority Actions
2  Approvals & Checkpoints
3  Project Readiness
4  Document Control Center
5  Site Health Summary
6  Missing Configurations
7  Procore snapshot
8  External Platforms
9  Team Snapshot
10 Recent Activity
11 Lifecycle Timeline
12 Project Memory
13 Project Lens
14 Related Records
15 Ask HBI — Grounded Project Answers
```

The unified lifecycle section currently calls `useUnifiedLifecycleReadModel(...)` once and returns a `Fragment` of four direct-child `PccDashboardCard`s:
- `Lifecycle Timeline` (`tier2/detail`)
- `Project Memory` (`tier3/reference`)
- `Project Lens` (`tier3/rail`)
- `Related Records` (`tier3/detail`)

Do **not** duplicate the lifecycle hook and do **not** split it into multiple hook-owning components unless you stop and report a blocker.

The Ask HBI section currently renders one direct-child `PccDashboardCard` and passes `initialQuery={null}`, preserving idle-on-mount behavior.

The Ask HBI panel currently has a disclaimer that says HBI is not the source of truth and that answers are grounded preview data. Prompt 05 should strengthen this copy to also state no decision/approval/writeback authority.

## Target read-model order

Keep the fixture-only path unchanged from Prompt 04.

Update only the read-model-driven path so the direct-child card order becomes:

```text
0  Project Intelligence
1  Priority Actions
2  Approvals & Checkpoints
3  Project Readiness
4  Document Control Center
5  Site Health Summary
6  Missing Configurations
7  Lifecycle Timeline
8  Ask HBI — Grounded Project Answers
9  Procore snapshot
10 External Platforms
11 Team Snapshot
12 Recent Activity
13 Project Memory
14 Project Lens
15 Related Records
```

Intent:
- Operational controls remain immediately below the command hero and compact priority rail.
- Lifecycle continuity becomes visible before source/reference content.
- Ask HBI is promoted from last to immediately after Lifecycle Timeline.
- Procore/source posture remains visible and bounded, below lifecycle/HBI and above reference/history cards.
- Lower-detail lifecycle cards (`Project Memory`, `Project Lens`, `Related Records`) remain at the bottom as reference/detail content.
- Total read-model card count remains 16.
- Fixture-only card count remains 10.

## Required implementation approach

### 1. Do not add new Project Home cards

Do not add a new compact lifecycle summary card.
Do not add a second compact HBI card.
Do not duplicate Ask HBI.
Do not duplicate Lifecycle Timeline.
Do not increase read-model card count.

This prompt promotes **existing** lifecycle/HBI cards only.

### 2. Rework `PccProjectHomeUnifiedLifecycleSection.tsx` with a local slot, not duplicate hooks

Modify `PccProjectHomeUnifiedLifecycleSection.tsx` to support inserting Project Home cards after the `Lifecycle Timeline` card while preserving the single `useUnifiedLifecycleReadModel(...)` call.

Recommended implementation:

```tsx
export interface IPccProjectHomeUnifiedLifecycleSectionProps {
  readonly client: IPccUnifiedLifecycleReadModelClient;
  readonly projectId: PccProjectId;
  readonly viewerPersona?: PccPersona;
  readonly renderAfterTimeline?: ReactNode;
}
```

Then render:

```tsx
<Fragment>
  <PccDashboardCard
    footprint="detail"
    tier="tier2"
    region="detail"
    eyebrow="Project lifecycle"
    title="Lifecycle Timeline"
  >
    {renderLifecycleTimeline(state)}
  </PccDashboardCard>

  {renderAfterTimeline}

  <PccDashboardCard
    footprint="standard"
    tier="tier3"
    region="reference"
    eyebrow="Project memory"
    title="Project Memory"
  >
    {renderProjectMemory(state)}
  </PccDashboardCard>

  <PccDashboardCard
    footprint="rail"
    tier="tier3"
    region="rail"
    eyebrow="Lenses"
    title="Project Lens"
  >
    {renderProjectLens(state)}
  </PccDashboardCard>

  <PccDashboardCard
    footprint="detail"
    tier="tier3"
    region="detail"
    eyebrow="Traceability"
    title="Related Records"
  >
    {renderRelatedRecords(state)}
  </PccDashboardCard>
</Fragment>
```

Important:
- Use `ReactNode` type import only if needed.
- Do not wrap `renderAfterTimeline` in a DOM element.
- The slot may render multiple `PccDashboardCard` components via a fragment from the parent.
- The resulting DOM must still have every card as a direct child of `[data-pcc-bento-grid]`.

### 3. Update `PccProjectHomeReadModelContent.tsx` to pass the post-timeline slot

In `PccProjectHomeReadModelContent.tsx`, keep the operational cluster from Prompt 04 unchanged through `Missing Configurations`, then render `PccProjectHomeUnifiedLifecycleSection` with `renderAfterTimeline`.

Target structure:

```tsx
<>
  <PccProjectIntelligenceCard ... />
  <PccPriorityActionsCard ... />
  <PccApprovalsCheckpointsCard viewModel={viewModel?.approvalsCard} />
  <PccProjectReadinessCard />
  <PccDocumentControlCard ... />
  <PccSiteHealthSummaryCard ... />
  <PccMissingConfigurationsCard ... />

  <PccProjectHomeUnifiedLifecycleSection
    client={client}
    projectId={SAMPLE_PROJECT_PROFILE.projectId}
    renderAfterTimeline={
      <>
        <PccProjectHomeAskHbiSection
          client={client}
          projectId={SAMPLE_PROJECT_PROFILE.projectId}
        />
        <PccProjectHomeProcoreSnapshotCard
          state={viewModel?.procoreSnapshot.state ?? 'preview'}
          snapshot={viewModel?.procoreSnapshot.data}
        />
        <PccExternalSystemsCard />
        <PccTeamSnapshotCard />
        <PccRecentActivityCard />
      </>
    }
  />
</>
```

Do not pass `viewerPersona` unless already required by existing props or tests.

Preserve:
- `useProjectHomeReadModel(client, SAMPLE_PROJECT_PROFILE.projectId)`;
- `buildProjectCommandSummary(...)` from Prompt 02;
- `PccPriorityActionsCard` compact rail behavior from Prompt 03;
- card props and state props;
- `initialQuery={null}` inside `PccProjectHomeAskHbiSection`;
- Procore display-only posture;
- no new routes/tabs/surface markers.

### 4. Strengthen HBI boundary copy

Update `ASK_HBI_PANEL_DISCLAIMER` in:

```text
apps/project-control-center/src/surfaces/unifiedLifecycle/components/AskHbiGroundingPreviewPanel.tsx
```

Replace the existing disclaimer with bounded authority language, for example:

```ts
export const ASK_HBI_PANEL_DISCLAIMER =
  'HBI is not the source of truth and has no decision, approval, or writeback authority. Answers are grounded in this project’s fixture data and shown as a preview only.';
```

Do not remove the existing grounding/refusal/citation sanitizer behavior.
Do not auto-run a query.
Do not change the sample query list.
Do not add anchors, links, routes, or source-system actions.

### 5. Update tests

#### `PccProjectHome.composition.test.tsx`

Update the read-model expected order only. Fixture order remains unchanged.

New read-model expected sequence:

```text
Project Intelligence
Priority Actions
Approvals & Checkpoints
Project Readiness
Document Control Center
Site Health Summary
Missing Configurations
Lifecycle Timeline
Ask HBI — Grounded Project Answers
Procore snapshot
External Platforms
Team Snapshot
Recent Activity
Project Memory
Project Lens
Related Records
```

Keep:
- direct-child title reader using `grid.children`;
- exact `toEqual([...])`;
- `waitFor` around the exact full sequence;
- fixture path order unchanged.

#### `PccProjectHome.test.tsx`

Add or update tests to prove:

- read-model path renders exactly 16 cards after the hooks settle;
- `Lifecycle Timeline` appears before `Procore snapshot`, `External Platforms`, `Team Snapshot`, and `Recent Activity`;
- `Ask HBI — Grounded Project Answers` appears before `Procore snapshot` and is not last;
- `Project Memory`, `Project Lens`, and `Related Records` remain lower than `Recent Activity`;
- every card is still a direct child of `[data-pcc-bento-grid]`;
- exactly one `[data-pcc-active-surface-panel="project-home"]` remains on `Project Intelligence`;
- no `data-pcc-active-surface-panel`, `data-pcc-tab-id`, or `data-pcc-surface-active` is emitted from Ask HBI or lifecycle child content;
- Project Home still renders zero `a[href^="http"]` inside the bento grid.

Do not remove Prompt 02/03 tests:
- command summary row;
- no `Source: live system feeds`;
- compact Priority Actions default rows;
- single local display-only Priority Actions toggle;
- `Source-owned` row affordances.

#### `PccApp.optIn.test.tsx`

Do not change expected fetch count unless a failing test proves the implementation unexpectedly changed backend calls.

Expected backend-mode fetch count should remain `7`, with no `unified-search` call on mount.

Add or preserve an explicit assertion that no initial unified-search fetch occurs. If current code makes this difficult, use the existing canonical URL-set assertion and add a defensive check that none of the fetched URLs includes `/unified-search`.

#### `AskHbiGroundingPreviewPanel.test.tsx`

Update the static-copy test to assert the strengthened disclaimer text includes:
- `not the source of truth`;
- `no decision`;
- `approval`;
- `writeback`;
- `grounded`;
- `preview`.

Preserve tests that prove:
- `initialQuery={null}` starts idle and does not call the client until a sample query is clicked;
- no live external URLs;
- no routed-surface markers;
- grounded answers without citations are filtered;
- refusal taxonomy remains intact.

### 6. Files expected to change

Expected product files:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection.tsx
apps/project-control-center/src/surfaces/unifiedLifecycle/components/AskHbiGroundingPreviewPanel.tsx
```

Expected test files:

```text
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/src/tests/AskHbiGroundingPreviewPanel.test.tsx
```

Do not edit unless a validated blocker requires it:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeProcoreSnapshotCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts
apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
```

Absolutely do not edit:
- shared primitives;
- shell/tabs/hero;
- package files;
- lockfile;
- manifests;
- SPFx packaging;
- blueprint docs;
- planning docs.

## Required validation

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
grep -R "Source: live system feeds" apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts || echo "gate ok — no matches"

pnpm --filter @hbc/spfx-project-control-center check-types

( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectHome.composition )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectHome )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccApp.optIn )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts AskHbiGroundingPreviewPanel )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectHomeAskHbiSection )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccCardTierContract )

pnpm exec prettier --check \
  apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection.tsx \
  apps/project-control-center/src/surfaces/unifiedLifecycle/components/AskHbiGroundingPreviewPanel.tsx \
  apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx \
  apps/project-control-center/src/tests/PccProjectHome.test.tsx \
  apps/project-control-center/src/tests/PccApp.optIn.test.tsx \
  apps/project-control-center/src/tests/AskHbiGroundingPreviewPanel.test.tsx

git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If `prettier --check` flags drift, run `prettier --write` against the same path list only, then rerun affected tests:
- `PccProjectHome.composition`
- `PccProjectHome`
- `PccApp.optIn`
- `AskHbiGroundingPreviewPanel`

No hosted Playwright is required for Prompt 05. Hosted/tenant proof remains OPERATOR-PENDING until Prompt 07.

## Commit posture

Commit subject:

```text
feat(pcc/project-home): promote lifecycle and HBI below core controls (Wave 15A wave-b6 Prompt 05)
```

Commit description should include:

- baseline: Prompt 04 accepted at `686fa9fd83c1b10c9709fb6aedea13829d61c548`;
- read-model order before and after;
- fixture path unchanged at 10 cards;
- read-model path still 16 cards;
- lifecycle hook still called once;
- Ask HBI remains idle-on-mount with no initial unified-search fetch;
- HBI disclaimer now states no source-of-truth, no decision/approval/writeback authority, grounded preview only;
- Prompt 03 compact Priority Actions preserved;
- Prompt 02 command summary and bounded source label preserved;
- no routes/tabs/surface markers added;
- no shared primitives, package files, lockfile, manifests, SPFx packaging, blueprint docs, or planning docs changed;
- lockfile MD5 reconfirmed as `00570e10e3dc9015188ba503ea996943`;
- canonical `Co-Authored-By` line.

## Closeout response

Return:

```text
Files changed:
Repo-truth confirmed:
Implementation summary:
Read-model order after change:
Fixture path status:
Lifecycle/HBI behavior:
Prompt 02/03/04 preservation:
Tests run:
Validation results:
Lockfile/package/manifest status:
No-execution/source-boundary status:
Known residual risks:
Commit:
```

## Known residual risks to report if still true

- Hosted/tenant proof remains OPERATOR-PENDING.
- Actual first-fold visual impact and screenshot evidence remain deferred to Prompt 07.
- Ask HBI sample query buttons remain real local UI controls; they trigger only the existing fixture/read-model HBI query seam after user click, not on mount.
- Lower-detail lifecycle cards remain visible but intentionally lower in the read-model sequence.
