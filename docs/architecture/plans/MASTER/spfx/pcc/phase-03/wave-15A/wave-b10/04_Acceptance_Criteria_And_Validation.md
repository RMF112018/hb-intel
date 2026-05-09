# Phase 05 Acceptance Criteria and Validation

## 1. Product Acceptance Criteria

Phase 05 is accepted only when all criteria below are true.

### Navigation

- Eight primary tabs render in this exact order:
  1. Project Home
  2. Core Tools
  3. Document Control
  4. Estimating & Preconstruction
  5. Project Startup & Closeout
  6. Project Controls
  7. Cost & Time
  8. Systems Administration

- `Document Control` is the visible label.
- `Documents` is not the visible primary tab label.
- Each primary tab opens a dashboard surface.
- Each primary tab has a dropdown toggle for child modules.
- Child module links are rendered from a registry.
- Enabled/selectable child modules set active tab and active module state.
- Disabled/future/source-unavailable child modules do not mutate state.
- Disabled/future/source-unavailable child modules expose reason copy.

### Dashboard Surfaces

- Each primary tab renders a production-grade dashboard.
- No dashboard is blank on ready path.
- No dashboard uses developer-facing copy.
- Existing surface content is preserved where mapped:
  - Project Home remains Project Home.
  - Existing Documents surface becomes visible Document Control.
  - Team/Access, Approvals, External Platforms, Settings, and Site Health are not deleted; they are mapped or adapted.
  - Project Readiness content is preserved or adapted into Startup/Closeout and Project Controls where practical.

### State

- `activeSurfaceId` supports the target primary tab IDs.
- `activeModuleId` is optional and safe.
- Selecting a primary tab clears `activeModuleId`.
- Selecting a selectable module sets parent `activeSurfaceId` and `activeModuleId`.
- Selecting a non-selectable module leaves state unchanged.
- Selecting a new project clears `activeModuleId`.
- Invalid IDs normalize safely.

### Accessibility

- Primary tab bar remains keyboard accessible.
- ArrowLeft / ArrowRight / Home / End behavior remains valid.
- ArrowDown opens module menu.
- ArrowUp / ArrowDown move through module items.
- Escape closes menu and returns focus to parent tab.
- Dropdown toggle exposes `aria-haspopup`, `aria-expanded`, and `aria-controls`.
- Disabled module states are announced or visibly described.
- Focus states remain visible.
- No color-only state communication.

### Host-Fit

- No PCC sidebar.
- No horizontal page overflow.
- No SharePoint chrome manipulation.
- No full-page takeover assumptions.
- Dropdowns do not break the SharePoint host canvas.

### No Writeback

- No Procore writeback.
- No Sage writeback.
- No SharePoint list/library/group/security mutation.
- No tenant mutation.
- No HBI decision authority.
- No approval/rejection/waiver actions.

## 2. Required Tests

### Registry Tests

- Exact tab IDs and order.
- Exact tab labels.
- Exact module IDs.
- Every module belongs to one existing tab.
- Every tab has at least one module.
- Every non-selectable module has disabled reason copy.
- Every module has state label and authority cue.
- No forbidden developer copy in registry-visible copy.

### State Tests

- Default state is Project Home with no active module.
- Primary tab selection clears module.
- Selectable module selection sets parent tab and module.
- Non-selectable module selection does not mutate state.
- Project change clears module.
- Invalid surface normalizes to Project Home.
- Invalid module does not mutate state.
- Stable setter references preserved.

### Navigation Tests

- Eight primary tabs render.
- Dropdown toggle exists for every primary tab.
- Each dropdown opens.
- Only one dropdown is open at a time.
- Escape closes dropdown.
- Blur outside closes dropdown.
- ArrowDown opens dropdown.
- ArrowUp / ArrowDown navigates module items.
- Enter / Space on enabled item selects module.
- Enter / Space on disabled item does not select module.
- Document Control label replaces Documents.

### Router / Dashboard Tests

- Each primary tab renders a dashboard.
- Each dashboard includes at least one direct child card in bento.
- No dashboard ready path is empty.
- Active module context appears when selectable module is selected.
- Active module context uses label, not ID.
- Existing Project Home and Document Control content remains reachable.

### False Affordance Tests

- Disabled items are not anchors.
- Disabled items do not call selection handlers.
- Disabled items have reason copy.
- Launch-only items include no-writeback cue.
- HBI Assistant includes advisory/no-decision cue.
- Approvals/Checkpoints does not expose approve/reject/waive buttons in this phase.

### No Developer Copy Tests

Rendered UI must not contain these terms case-insensitively:

```text
TODO
TBD
placeholder
stub
mock
fixture
debug
dev-only
not implemented
lorem
developer
code agent
prompt
repo
test selector
internal only
```

Scope this test to rendered product UI, not test names, source comments, or documentation files.

## 3. Required Validation Commands

Before edits:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

After edits:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## 4. Optional / Required Live Evidence

Run live evidence when hosted navigation changes materially. This phase likely qualifies once visible tabs/dropdowns change.

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

## 5. Required Screenshot Evidence

Capture or update evidence for:

- Project Home tab.
- Core Tools tab.
- Document Control tab.
- Estimating & Preconstruction tab.
- Project Startup & Closeout tab.
- Project Controls tab.
- Cost & Time tab.
- Systems Administration tab.
- At least one open dropdown.
- Disabled/future module reason copy.
- Active module context.
- Standard laptop viewport.
- Desktop viewport.
- Ultrawide viewport.
- Compact/tablet viewport if supported by current evidence harness.

## 6. Closeout Report Requirements

Closeout must include:

- commit SHA;
- concise summary;
- changed files;
- validation commands and results;
- lockfile MD5 before/after;
- test counts;
- evidence command results if run;
- screenshots/evidence paths if generated;
- explicit statement that no URL routing/writeback/sidebar was introduced;
- explicit statement that no developer copy renders in product UI;
- known deferred items, limited to future product scope only.

## 7. Rejection Conditions

Reject the implementation if any of the following are true:

- A standalone hero/header module launcher was added.
- A persistent PCC sidebar was added.
- `Documents` remains the visible primary tab label.
- Any primary tab renders a blank or developer-placeholder dashboard.
- Any rendered UI includes forbidden developer copy.
- Disabled modules are clickable links without reason copy.
- Selecting a disabled module changes state.
- State adds URL routing or persistence.
- Tests are weakened or removed without equivalent replacement.
- Existing document/team/approvals/external/settings/site-health functionality is deleted rather than mapped/adapted.
- HBI or Approvals UI implies decision/writeback authority.
