# Phase 08 Prompt 08 — Gateway Action Enhancement (Updated)

## Objective

Refine the existing PCC gateway action presentation so operational card actions feel premium, consistent, accessible, and truthful while preserving the current preview / read-only / launch-only / no-writeback architecture.

This is a bounded enhancement to the existing gateway/action contract. Do **not** introduce command-model execution, live routing, live launch URLs, or source-system mutations.

## Current Execution Baseline

- Repo: `RMF112018/hb-intel`
- Branch: `main`
- Expected starting baseline: `f6cd2944dd1b7a79cc6f1cb5cdc4dc4eb922645e`
- Package / manifest version expected: `1.0.0.219`
- Lockfile md5 expected: `7c19ccfa8718a42f7f55ce178a626996`
- Prompt 07 card taxonomy work is committed and pushed.
- Treat any older baseline such as `7d8bae430ab999d4fb38abe8de6689b89d8f4d27` as historical context only.

Before editing, verify repo truth. If HEAD has moved forward, classify the drift. Proceed only if the drift is operator-owned docs/evidence or otherwise clearly compatible with this prompt. Stop if unrelated runtime files are dirty.

## Required Pre-Edit Repo-Truth Checks

Run and record:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Expected clean runtime baseline: no unrelated modified/untracked files. Operator-owned prompt files may be present only if explicitly identified as out of scope.

## Global Execution Rules

1. Preserve the current eight primary-tab model:
   - `project-home`
   - `core-tools`
   - `documents`
   - `estimating-preconstruction`
   - `startup-closeout`
   - `project-controls`
   - `cost-time`
   - `systems-administration`
2. Do not reintroduce a PCC sidebar, rail, drawer, modal, portal launcher, or alternate navigation model.
3. Keep `data-pcc-active-surface-panel` shell-owned on `main[role="tabpanel"]`; do not move it back to any card.
4. Preserve the bento direct-child invariant. Do not add wrappers between `PccBentoGrid` and `PccDashboardCard`.
5. Do not add dependencies. Do not add `echarts-for-react`.
6. Do not create live SharePoint, Graph, Procore, Sage, Azure, tenant, app-catalog, command-model, or source-system mutations.
7. Preserve read-only / preview / launch-only / no-writeback posture.
8. Do not introduce false affordances. Any unavailable gateway must be visibly disabled with visible reason copy, not tooltip-only copy.
9. Do not put developer copy in the UI. Avoid `mock`, `placeholder`, `TODO`, `fixture`, `demo`, prompt numbers, implementation sequencing, or code-agent language in end-user-visible text.
10. Do not weaken tests to pass. Update tests only when the product contract intentionally changes.
11. Use stable `[data-*]` markers and semantic roles for tests. Do not test CSS module class names as behavior contracts.
12. Do not use `git add .`. Do not commit or push unless explicitly instructed by the operator.

## Current Repo-Truth Notes to Preserve

The existing gateway architecture already includes:

- `PccProjectHomeGatewayAction.tsx` as a native `<button>` gateway component.
- Enabled-state logic based on `gateway.moduleId`, `onSelectModule`, and absence of `disabledReason`.
- Visible disabled reason copy rendered under the button and wired with `aria-describedby`.
- Existing root/action/state/reason data markers:
  - `data-pcc-project-home-gateway`
  - `data-pcc-project-home-gateway-action`
  - `data-pcc-project-home-gateway-label`
  - `data-pcc-project-home-gateway-state`
  - `data-pcc-project-home-gateway-reason`
- `projectHomeChoreography.ts` owning the Project Home operational gateway mapping.
- `PccProjectHome.tsx` threading `onSelectModule` from shell/router into card action slots.
- `PccPrimaryDashboardSurface.tsx` rendering selected-module context and module-status cards without executable gateway actions.

Refine this existing contract. Do not replace it.

## Scope

Primary scope:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeGatewayAction.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

Optional only if a narrowly justified test or type seam requires it:

```text
apps/project-control-center/src/surfaces/projectHome/shared.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts
```

Default prohibited / out of scope:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccDashboardCard.module.css
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/shell/**
apps/project-control-center/src/analytics/**
packages/models/src/pcc/PccPrimaryNavigation.ts
package.json
pnpm-lock.yaml
**/package-solution.json
**/*.manifest.json
docs/architecture/evidence/**
```

Do not edit shared primary dashboard surfaces unless exploration finds a concrete, current gateway-action implementation there that uses the same contract and needs the same styling/marker treatment. If no shared-surface gateway action exists, document that as repo truth in closeout rather than creating one.

## Allowed Changes

You may:

1. Add backward-compatible gateway action metadata fields if needed, such as:
   - `state` / `tone` / `intent` for visual markers only;
   - `sourceSystem` only if it remains marker-only and does not imply launch/writeback.
2. Add stable data markers to the gateway wrapper/button/reason where useful for evidence and tests.
3. Refine CSS for Project Home gateway buttons using existing PCC tokens only.
4. Add focus-visible treatment to enabled gateway buttons.
5. Add hover/active treatment only for enabled gateway buttons.
6. Improve disabled gateway treatment while keeping visible reason copy.
7. Add or strengthen tests for enabled behavior, disabled behavior, visible reason copy, and non-false-affordance behavior.

## Required Gateway Contract

Gateway actions must follow this contract:

### Enabled gateway

- Renders as a native `<button type="button">`.
- Calls `onSelectModule(moduleId)` exactly once on click.
- Uses only valid `PccModuleId` values.
- Does not render an `<a>`, `href`, live URL, or source-system launch.
- Does not claim approval, decisioning, posting, syncing, routing, mutation, or writeback.
- Has stable markers identifying:
  - gateway id/module id;
  - enabled/disabled state;
  - if added, presentation state/tone/source posture.

### Disabled gateway

- Renders as a native disabled button or otherwise semantically disabled button.
- Does **not** call `onSelectModule` on click, Enter, or Space.
- Exposes visible reason copy adjacent to the control.
- Links disabled reason copy with `aria-describedby`.
- Does not hide reason copy only in a tooltip/title attribute.
- Does not use hover/focus/active styling that implies clickability.
- Does not use live URLs or anchors.

### Preview context

If `gateway.moduleId` exists but `onSelectModule` is missing, the gateway must remain disabled and must show product-grade preview-context reason copy. The existing fallback copy may be refined, but it must not include developer-facing terms.

## Visual Refinement Direction

Refine the existing CSS in `PccProjectHome.module.css` only.

Allowed token-only refinements:

- Make the gateway feel like a compact, intentional card action rather than a plain utility button.
- Use existing tokens only: `--pcc-color-*`, `--pcc-status-*`, `--pcc-space-*`, `--pcc-radius-*`, `--pcc-elevation-card` if needed.
- Add `:focus-visible` for accessible keyboard focus.
- Add enabled-only `:hover` / `:active` states.
- Add disabled-state visual distinction without using `cursor: pointer`.
- Use static borders/inset accents if needed; no animation required.

Prohibited visual changes:

- No raw one-off colors.
- No new tokens.
- No broad/global CSS resets.
- No hover/focus/active treatment on disabled actions.
- No heavy shadows or animated transitions unless they are already consistent with the local token system and reduced-motion safe.
- No card-wide clickability.
- No hidden tooltip-only reason copy.

## Recommended Implementation Pattern

Keep `PccProjectHomeGatewayAction` structurally similar, but add evidence-friendly markers and visual-state hooks, for example:

```tsx
data-pcc-project-home-gateway-state={stateMarker}
data-pcc-project-home-gateway-module={gateway.moduleId ?? ''}
data-pcc-project-home-gateway-disabled-reason={reason ? 'visible' : 'none'}
```

Only add markers that tests will assert and future evidence capture can use. Do not add duplicate or noisy attributes without purpose.

Consider adding a small visual leading cue through CSS only, keyed off enabled/disabled state markers. Keep the button text unchanged unless the existing copy is inaccurate.

## Testing Requirements

Add or strengthen tests in `PccProjectHome.test.tsx`, or create a narrowly scoped gateway test file if the existing file becomes too large.

Required coverage:

1. All Project Home operational gateways render in the fixture path.
2. Enabled gateways:
   - are buttons;
   - are not disabled;
   - call `onSelectModule` with the expected `PccModuleId` exactly once on click.
3. Disabled gateways:
   - are disabled;
   - do not call `onSelectModule` on click;
   - expose visible reason copy;
   - wire `aria-describedby` to the visible reason element.
4. Preview-context gateways with `moduleId` but no callback are disabled and show product-grade reason copy.
5. No gateway action renders an anchor, `href`, live URL, or source-system launch URL.
6. No gateway action uses visible developer terms: `mock`, `placeholder`, `TODO`, `fixture`, `demo`, `not implemented`, `debug`, `developer`, `prompt`, `repo`, `test selector`.
7. If new data markers are added, tests assert them with `[data-*]` selectors.

Do not assert CSS module class names as behavioral contracts.

## Acceptance Criteria

- Project Home gateway actions look intentional and consistent.
- Enabled gateways select modules through the existing shell callback only.
- Disabled gateways remain disabled, non-navigating, and visibly explain why.
- Preview context remains truthful and non-false-affordance.
- No live launch or writeback behavior is introduced.
- No shared surface, shell, card primitive, bento, analytics, registry, package, manifest, lockfile, or evidence drift is introduced.

## Required Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If Prettier requires writes, run targeted `prettier --write` only on changed files, then rerun Prettier check and the full test suite.

## Manual Diff Review Before Closeout

Confirm:

- Only in-scope files changed.
- No command-model execution added.
- No live URL / `href` / source-system launch behavior added.
- No disabled reason hidden in tooltip-only copy.
- No `onSelectModule` dispatch from disabled gateways.
- No card-wide clickability added.
- No shell, active-panel, bento, card primitive, tab, analytics, registry, package, manifest, lockfile, or evidence changes.
- No raw colors or new tokens.
- No end-user-facing developer copy.

## Closeout Requirements

Use the repo's closeout template if available. Include:

- Starting and ending HEAD.
- Local drift classification.
- Files changed.
- Tests run and results.
- Lockfile md5 before/after.
- Evidence generated or blocked reason.
- Guardrails confirmed.
- Whether shared dashboard surfaces were inspected and whether they had any gateway implementation requiring action.
- Commit summary/description only if the operator explicitly requests a commit and a commit is actually authored.
