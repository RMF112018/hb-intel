# Wave 2 — Prompt 05 Closeout: Project Home Bento Dashboard and Priority Actions

**Phase:** 3
**Wave:** 2
**Prompt:** 05 — Project Home Bento Dashboard and Priority Actions
**Status:** Complete
**Date:** 2026-04-29

## Objective Recap

Implement the Project Home preview dashboard inside `apps/project-control-center/`
using the flexible bento/masonry layout established in Prompt 03 and the
navigation/state model established in Prompt 04. Render 10 fixture-driven
preview cards mapped to the basis-of-design. Wire `PccSurfaceRouter` so
`project-home` renders the new dashboard while the other seven MVP surfaces
keep the Prompt 04 placeholder shape. No live integrations, no manifests,
no version bumps, no lockfile churn.

## Files Created / Modified

**Created (13 source files + 1 shared CSS module + 2 test files + 1 closeout):**

```text
apps/project-control-center/src/
├── surfaces/
│   └── projectHome/
│       ├── PccProjectHome.tsx
│       ├── PccProjectHome.module.css
│       ├── shared.ts
│       ├── teamSnapshotPlaceholder.ts
│       ├── PccProjectIntelligenceCard.tsx
│       ├── PccPriorityActionsCard.tsx
│       ├── PccSiteHealthSummaryCard.tsx
│       ├── PccDocumentControlCard.tsx
│       ├── PccProjectReadinessCard.tsx
│       ├── PccApprovalsCheckpointsCard.tsx
│       ├── PccExternalSystemsCard.tsx
│       ├── PccTeamSnapshotCard.tsx
│       ├── PccMissingConfigurationsCard.tsx
│       └── PccRecentActivityCard.tsx
└── tests/
    ├── PccProjectHome.test.tsx
    └── PccProjectHome.states.test.tsx

docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/
└── Wave_2_Prompt_05_Closeout.md   ← this file
```

**Modified (1):**

```text
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
  (route 'project-home' → <PccProjectHome />; the other seven surfaces
   continue to render the Prompt 04 single-card placeholder)
```

**Deleted:** none.

No files outside `apps/project-control-center/` and this closeout were
modified.

## Card → Footprint → Fixture Mapping

| # | Card | Footprint | Fixture (Wave 1, `@hbc/models/pcc`) | Per-row markers | Active panel marker |
| --- | --- | --- | --- | --- | --- |
| 1 | Project Intelligence | `hero` | `SAMPLE_PROJECT_PROFILE` (project name, number, stage, status, type, client, location, value, completion date) + `PCC_MVP_SURFACES['project-home']` for surface display name + description | `data-pcc-project-intelligence-body`, `data-pcc-surface-description` | **yes** — `data-pcc-active-surface-panel="project-home"` |
| 2 | Priority Actions | `tall` | `SAMPLE_PRIORITY_ACTIONS` × `PRIORITY_ACTION_CATEGORY_LABELS` | `data-pcc-priority-action-id`, `data-pcc-priority-tone`, `data-pcc-priority-category` | no |
| 3 | Site Health Summary | `standard` | `SAMPLE_SITE_HEALTH_SUMMARY` (severity, failingChecks, warningChecks, repairRequestAvailable) | `data-pcc-site-health-failing`, `data-pcc-site-health-warning` | no |
| 4 | Document Control Center | `wide` | `DOCUMENT_CONTROL_SOURCES` × `SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS` (display name + posture + linkBehavior) | `data-pcc-document-source-id`, `data-pcc-document-posture`, `data-pcc-document-link-behavior` | no |
| 5 | Project Readiness | `standard` | `SAMPLE_WORKFLOW_ITEMS` filtered to `startup-tasks` / `permits` / `required-inspections` | `data-pcc-readiness-item-id`, `data-pcc-readiness-status`, `data-pcc-readiness-module` | no |
| 6 | Approvals & Checkpoints | `standard` | `SAMPLE_APPROVAL_CHECKPOINTS` (state, requiredPersona, checkpointType, authorityType) | `data-pcc-approval-checkpoint-id`, `data-pcc-approval-state` | no |
| 7 | External Systems | `standard` | `SAMPLE_EXTERNAL_SYSTEM_LINKS` (systemId, posture, mappingStatus, integrationHealthStatus) | `data-pcc-external-system-id`, `data-pcc-external-system-posture`, `data-pcc-external-system-mapping` | no |
| 8 | Team Snapshot | `compact` | **app-local** `TEAM_SNAPSHOT_PLACEHOLDER` (each label carries `(preview)` suffix; no PII) | `data-pcc-team-entry-persona` | no |
| 9 | Missing Configurations | `compact` | `SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS` (systemId, severity, requiredBefore, message, ownerPersona) | `data-pcc-missing-config-system`, `data-pcc-missing-config-severity` | no |
| 10 | Recent Activity | `tall` | `SAMPLE_BUSINESS_AUDIT_EVENTS` (eventType, occurredAtUtc, payloadSummary, actorPersona) | `data-pcc-activity-event-id`, `data-pcc-activity-event-type` | no |

`ILaunchLink` and `SAMPLE_LAUNCH_LINKS` are deliberately **not** consumed in
Prompt 05 — they land when the External Systems surface is implemented in
a later prompt. `SAMPLE_PROJECT_PROFILE`'s `siteUrl` / `procoreProjectId` /
`sageIntacctProjectId` fields are read but **not** rendered as launch links.

## Priority-Tone Derivation Table

`IPriorityAction` does **not** have a `priority` field. Tone is derived
**presentation-only** from the existing record-backed `severity` value via
`priorityToneForAction` in `src/surfaces/projectHome/shared.ts`:

| `severity` value | `data-pcc-priority-tone` |
| --- | --- |
| `Blocking` | `high` |
| `Security Risk` | `high` |
| `Repair Required` | `high` |
| `Warning` | `medium` |
| `Info` | `low` |
| `undefined` | `medium` |

The mapping is unit-tested directly against synthetic `IPriorityAction`
objects (one per `SiteHealthSeverity` value plus `undefined`) in
`tests/PccProjectHome.test.tsx`. Tone is rendered as a `data-pcc-priority-tone`
attribute on each list row and as a left-edge color accent (status-info /
status-warning / status-danger CSS variables). No `priority` field is read,
written, or invented anywhere on `IPriorityAction`.

## App-local Team Snapshot Rationale

Wave 1 (`@hbc/models/pcc/fixtures`) does **not** expose a team-member
fixture. The Team Snapshot card needs ~5 entries to convey a "team" visual,
so `apps/project-control-center/src/surfaces/projectHome/teamSnapshotPlaceholder.ts`
exports a tiny app-local presentation fixture rooted in Wave 1's
`PccPersona` enum. Constraints:

- visible labels carry an explicit `(preview)` suffix and never reference
  a real person; **no PII** appears in this fixture
- `persona` values come from `PCC_PERSONAS`
- the module is **not** re-exported from `@hbc/models/pcc`
- when a canonical team fixture lands in `@hbc/models/pcc`, this module
  will be removed and the card switched to the canonical source

The `(preview)` suffix on every entry is asserted by
`tests/PccProjectHome.test.tsx`.

## Per-Card State-Support Matrix

Every Project Home card accepts `state?: PccCardState` (`'preview' |
'empty' | 'missing-config' | 'unavailable-fixture' | 'error'`). When
`state` is anything other than `'preview'`, the card body renders a
`PccPreviewState` of the matching variant. `'preview'` is the default for
all cards; no fixture-backed card defaults to `'unavailable-fixture'`.

Semantic applicability of the `'missing-config'` state (per refinement #6):

| Card | `preview` | `empty` | `missing-config` | `unavailable-fixture` | `error` |
| --- | --- | --- | --- | --- | --- |
| Project Intelligence | ✓ | ✓ | (semantic mismatch — supported but not idiomatic) | ✓ | ✓ |
| Priority Actions | ✓ | ✓ | (semantic mismatch — supported but not idiomatic) | ✓ | ✓ |
| Site Health Summary | ✓ | ✓ | (semantic mismatch — supported but not idiomatic) | ✓ | ✓ |
| **Document Control Center** | ✓ | ✓ | **✓ idiomatic** | ✓ | ✓ |
| Project Readiness | ✓ | ✓ | (semantic mismatch — supported but not idiomatic) | ✓ | ✓ |
| Approvals & Checkpoints | ✓ | ✓ | (semantic mismatch — supported but not idiomatic) | ✓ | ✓ |
| **External Systems** | ✓ | ✓ | **✓ idiomatic** | ✓ | ✓ |
| Team Snapshot | ✓ | ✓ | (semantic mismatch — supported but not idiomatic) | ✓ | ✓ |
| **Missing Configurations** | ✓ | ✓ | **✓ idiomatic** | ✓ | ✓ |
| Recent Activity | ✓ | ✓ | (semantic mismatch — supported but not idiomatic) | ✓ | ✓ |

`tests/PccProjectHome.states.test.tsx` exercises every card in every
non-preview state (10 × 4 = 40 cases); each renders the expected
`[data-pcc-state="<state>"]` marker and preserves `data-pcc-footprint` on
the card `<article>`.

## Bento Layout Contract Confirmation

- The bento grid is `<PccBentoGrid>` (provided by `PccShell`); its only
  direct children are the 10 `PccDashboardCard` `<article>` elements
  (asserted by `tests/PccProjectHome.test.tsx` and the existing
  `tests/PccApp.bentoIntegration.test.tsx`).
- Cards consume the bento context via `usePccBentoContext()` and receive
  measured row spans via `useBentoRowSpan()` per card.
- The grid uses CSS Grid (`grid-template-columns: repeat(var(--pcc-grid-columns),
  minmax(0, 1fr))`) with `grid-auto-rows: var(--pcc-grid-row-unit, 8px)`
  and `gap: var(--pcc-grid-gap, 16px)`. **No** `grid-auto-flow: dense` —
  asserted by `tests/PccProjectHome.test.tsx`.
- **No** equal-height row coupling. **No** homepage paired-row imports —
  continually asserted by `tests/pcc-import-guards.test.ts`.
- Container-aware responsive mode resolution continues via the shell-level
  and grid-level `useContainerBreakpoint()` calls established in Prompt 03
  + corrective.
- Footprint vocabulary unchanged from Prompt 03: `hero | wide | standard |
  compact | tall | full`. Used in Prompt 05: `hero` (Project Intelligence),
  `tall` (Priority Actions, Recent Activity), `wide` (Document Control),
  `standard` (Site Health Summary, Project Readiness, Approvals &
  Checkpoints, External Systems), `compact` (Team Snapshot, Missing
  Configurations).

## Fixture Count Derivation Notes

Every per-row test assertion in `tests/PccProjectHome.test.tsx` uses
`SAMPLE_*.length` — no hardcoded literal counts in test code. Verified
counts from the live test run on this commit (prose only):

- `SAMPLE_PRIORITY_ACTIONS.length === 10` rendered (all 10 entries; tones
  reflect each entry's actual `severity?` value)
- `SAMPLE_APPROVAL_CHECKPOINTS.length === 4` rendered
- `SAMPLE_EXTERNAL_SYSTEM_LINKS.length === 2` rendered
- `SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS.length === 2` rendered
- `SAMPLE_BUSINESS_AUDIT_EVENTS.length === 2` rendered
- `SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS.length === 3` tiles rendered
- Project Readiness card filters `SAMPLE_WORKFLOW_ITEMS` to
  `startup-tasks` / `permits` / `required-inspections` modules and renders
  one row per match; the natural fixture currently produces 3 readiness
  rows
- `TEAM_SNAPSHOT_PLACEHOLDER.length === 5` entries rendered, each with
  the `(preview)` suffix

If the upstream `@hbc/models/pcc` fixtures grow new entries, the cards and
tests will reflect the new counts automatically — the assertions are
length-derived, not literal.

## No-Live-Link Posture (Refinement #4)

- `IExternalSystemLink.displayUrl` is **not** rendered on the External
  Systems card. Only `systemId`, `posture`, `mappingStatus`, and
  `integrationHealthStatus` are rendered.
- `IDocumentControlSource.linkBehavior` is rendered as a string label
  ("Browse in place" / "Launch link"), not as a triggerable action.
- `ILaunchLink` (`SAMPLE_LAUNCH_LINKS`) is **not** consumed.
- Project Intelligence card reads `SAMPLE_PROJECT_PROFILE.siteUrl` /
  `procoreProjectId` / `sageIntacctProjectId` only as part of the imported
  shape; these fields are **not** rendered as `<a href>` elements.
- A guard test asserts: every `a[href]` in the rendered Project Home tree
  has an `href` that does **not** match `^https?://`. There are currently
  zero anchor elements in the rendered Project Home tree.

## Document Control Boundary

`PccDocumentControlCard` renders source / posture / link-behavior preview
metadata only. **No** upload, approval, review, retention, permission, or
sync-policy affordances. `tests/PccProjectHome.test.tsx` asserts the
rendered card body does **not** contain the lowercase strings
`'upload'`, `'approve'`, `'review'`, `'retention'`, `'permission'`, or
`'sync policy'`, and that no `<button>` inside the body carries any of
those affordance words.

## Test Totals

Pre-Prompt-05: **69 passed across 8 files**.
Post-Prompt-05: **127 passed across 10 files**.

| Test file | Tests | Result |
| --- | --- | --- |
| `PccApp.test.tsx` | 4 | PASS (unchanged) |
| `tests/pcc-import-guards.test.ts` | 26 | PASS (unchanged) |
| `tests/PccBentoGrid.footprints.test.tsx` | 3 | PASS (unchanged) |
| `tests/PccPreviewState.states.test.tsx` | 9 | PASS (unchanged) |
| `tests/PccShell.responsive.test.tsx` | 5 | PASS (unchanged) |
| `tests/PccApp.bentoIntegration.test.tsx` | 3 | PASS (unchanged) |
| `tests/PccShell.navigation.test.tsx` | 12 | PASS (unchanged — project-home panel now contains the surface display name and description because the Project Intelligence card uses them as its eyebrow + a small context note) |
| `tests/usePccShellState.test.ts` | 6 | PASS (unchanged) |
| `tests/PccProjectHome.test.tsx` (NEW) | 19 | PASS |
| `tests/PccProjectHome.states.test.tsx` (NEW) | 40 | PASS — 10 cards × 4 non-preview states |

## Validation Command Results

| Command | Result |
| --- | --- |
| `git status --short` | Clean for the Prompt 05 scope. Pre-existing modifications to `CLAUDE.md` and `.claude/settings.local.json` were already present before this prompt and are not part of the commit. |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** |
| `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — `vite v6.4.1`, 2163 modules transformed; emits `dist/project-control-center-app.js` (187.86 kB · gzip 58.64 kB) and `dist/spfx-project-control-center.css` (14.37 kB · gzip 2.85 kB). Bundle was **not** packaged into `.sppkg` and **not** deployed. |
| `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — 127/127 across 10 files. |
| `pnpm --filter @hbc/spfx-project-control-center lint` | **PASS** — eslint clean. |

## Lockfile Status

`pnpm-lock.yaml` is **unchanged**. MD5 hash before and after Prompt 05 is
identical: `c56df7b79986896624536aab74d609f4`. `git diff --stat
pnpm-lock.yaml` reports no diff. No `pnpm install`, `pnpm add`, or
`pnpm update` was run. No `package.json` was edited. No new direct
dependencies were introduced.

## Explicit No-Touch Confirmations

- **`packages/spfx`:** untouched.
- **SPFx manifests / `package-solution.json` / `.sppkg` / app-catalog packaging / deployment scripts:** none introduced.
- **Backend / Azure Functions / provisioning / template packages:** untouched.
- **CI/CD workflow files:** untouched.
- **Graph/PnP / Procore / auth integrations:** none introduced. `tests/pcc-import-guards.test.ts` continues to assert this.
- **URL routing / route params / history-API / `window.open` / persisted nav state / cookies / `localStorage` / `sessionStorage`:** none introduced.
- **Tenant reads / real authorization:** none.
- **`<a href>` launch behavior on fixture URLs:** none — rendered tree contains zero anchor elements with `http(s)://` href values.
- **Document-management workflow behavior** (upload / approval / review / retention / permission / sync-policy): none rendered.
- **`PCC_FIXTURES` mutation:** none. All fixtures are imported read-only.
- **App-local fixtures beyond Team Snapshot:** none. The only app-local fixture is `teamSnapshotPlaceholder.ts`, justified by the missing Wave 1 team-member fixture.
- **Real PII in Team Snapshot:** none. All entries carry the `(preview)` suffix and use generic role labels.
- **Homepage paired-row layout import / copy / adaptation:** none. `tests/pcc-import-guards.test.ts` continues to assert this.
- **Disabled rail buttons:** not reintroduced. `tests/PccShell.navigation.test.tsx` continues to assert all rail buttons have `disabled === false`.
- **Package, solution, or manifest version bumps:** none. `apps/project-control-center/package.json` version remains `0.0.1`. The trailing instruction in the user prompt to "bump the appropriate manifest version" is not honored because no manifest exists in this scaffold and Wave 2 scope-lock W2-ODR-003 plus the Prompt 05 forbidden-work clause both prohibit version bumps; this conflict is resolved in favor of "no version bump."
- **`pnpm-lock.yaml`:** unchanged (MD5 identical pre/post).
- **New `@hbc/ui-kit` API additions, new tokens, new icons, new dependencies:** none. New cards consume existing `PccDashboardCard`, `PccPreviewState`, `PccStatusPill`, `@hbc/ui-kit/theme` CSS variables, and the existing `@hbc/ui-kit/icons` aliases established in Prompt 03.

## Anti-Scope-Creep Notes

- **Adjacent gap not absorbed:** the other seven MVP surfaces continue to render the Prompt 04 single-card placeholder. Their bento dashboards land in subsequent prompts.
- **Bento algorithm unchanged.** No structural change to footprints, row-span formula, gap, or row unit.
- **No icon additions.** All icon usage continues from the Prompt 03 set: `Home`, `HardHat`, `BlueprintRoll`, `Inspection`, `Submittal`, `ExternalLink`, `Settings`, `AlertTriangle`, `Search`. New cards do not import additional icons.
- **No promotion to `packages/spfx`.**
- **No expansion of the W2-ODR-009 state catalog** beyond the seven established in Prompt 03.

## Forward Look (informational only)

Subsequent Wave 2 prompts will:

- Replace the placeholder panel for each of the remaining seven MVP
  surfaces (Team & Access, Documents, Project Readiness, Approvals,
  External Systems, Control Center Settings, Site Health) with surface-
  specific bento dashboards using the same card pattern and Wave 1
  fixtures.
- Optionally promote a canonical team-member fixture into `@hbc/models/pcc`,
  at which point `teamSnapshotPlaceholder.ts` will be removed and the
  Team Snapshot card switched to the canonical source.
- Optionally introduce launch-link rendering once the External Systems
  surface is implemented; that work will consume `SAMPLE_LAUNCH_LINKS`
  but remain preview-only (no `window.open`, no live navigation).
