# 15 — Prompt 01: UI Shell and Information Architecture

You are working as the local code agent in the `hb-intel` repository.

## Wave

Wave 01 — UI Shell and Information Architecture

## Goal

Rebuild the Manager shell/header/tab hierarchy so the surface reads as `Foleon Manager`, defaults to content management, and moves raw diagnostics out of the primary view.

## Standing Instruction

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level details, contradictions, dependencies, or drift after changes.

## Non-Negotiable Architecture Guardrails

- Preserve the registry-first architecture.
- Preserve split readiness states; do not collapse readiness into one boolean.
- Preserve degraded consent-required rendering.
- Preserve backend route boundaries; do not add routes unless repo truth proves they are required.
- Preserve redacted diagnostics; never surface raw secrets, tokens, backend URLs, API resources, or list GUIDs in the primary UI.
- Preserve existing content workflows: save, validate, publish, suppress, placement, sync.
- Do not change package/version files as part of the audit/planning package.
- If shipped SPFx behavior changes in implementation, versioning must be handled only in the relevant implementation wave and documented in closure.
- Do not re-read files that remain in active local-agent context unless needed to verify drift, contradictions, or line-level implementation details.

## Files to Inspect

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/HomepageFoleonContentTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageConfigViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageLaneViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/manage/foleonManageTokens.css`
- `apps/hb-intel-foleon/src/runtime/**`
- `apps/hb-intel-foleon/src/pages/__tests__/**`
- `docs/reference/ui-kit/doctrine/**`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Files Likely to Change

- `ManageOrchestrator.tsx`
- `HomepageFoleonContentTab.tsx`
- `FoleonConfigTab.tsx`
- `manageConfigViewModel.ts`
- `manageShell.module.css`
- `foleonManageTokens.css`
- tests under `apps/hb-intel-foleon/src/pages/__tests__/**`
- optional new components:
  - `ManagerHeader.tsx`
  - `ManagerStatusBanner.tsx`
  - `ManagerStatusChip.tsx`
  - `DiagnosticsDisclosure.tsx`

## Visual / UX Objective

The first screen must communicate:

- this is `Foleon Manager`;
- it supports Marketing Operations;
- it manages homepage Foleon content, placements, and publishing readiness;
- operating mode is live, limited, blocked, or needs setup;
- content management is the default workflow.

## Implementation Requirements

1. Rename/present the primary user-facing title as `Foleon Manager`.
2. Use eyebrow `Marketing Operations`.
3. Use subtitle: `Manage homepage Foleon content, placements, and publishing readiness.`
4. Make `Homepage Foleon Content` the default tab unless repo truth proves a deep-link state should override it.
5. Add compact header status chips:
   - Content lanes
   - API connection
   - Registry
   - Last sync
6. Add primary header actions:
   - `Sync content`
   - `Open Foleon`
   - `View diagnostics`
7. Move raw runtime readiness summary and raw config proof out of the primary header/body.
8. Add a global status banner only when action is required.
9. Preserve existing data loading, selected record state, workflow handlers, and API state ownership.

## Acceptance Criteria

- Header no longer uses `Foleon Connector` as the dominant user-facing title unless repo truth proves a naming dependency; if retained internally, it is moved to diagnostics.
- Homepage Foleon Content tab is selected by default.
- Raw readiness cards/tables do not dominate the first screen.
- Existing management workflows remain reachable.
- API approval missing renders as limited/degraded state, not a full-app broken state where safe.
- No raw backend URLs, API resources, list GUIDs, tokens, or secrets render in primary UI.

## Tests to Add / Update

Update `ManagePage.test.tsx` or current equivalent to prove:

- `Foleon Manager` title renders.
- `Homepage Foleon Content` is default selected tab.
- Config tab remains reachable.
- Header status chips render with plain-language labels.
- Raw labels such as `TOKEN ACQUISITIONBlocked` do not render in primary UI.
- Existing editor/publish/placement/sync controls remain reachable or disabled with reasons.
## Validation Commands

Run, as repo tooling allows:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
```

If shell/runtime bridge is touched:

```bash
npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts
```

If package proof is required for the wave:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Use Node 18 where SPFx tooling requires it. If Node 22 blocks SPFx build/package validation, document that limitation and run every available check.

## Versioning Guidance

Do not change package/version files unless this wave ships SPFx source behavior that repo packaging policy requires to be versioned. If versioning is required, bump the Foleon package to the next SharePoint four-part version everywhere repo truth requires and document the exact files.

## Closure Report Requirements

Create or update a closure report under:

`docs/architecture/plans/MASTER/spfx/foleon-manage/uiux-rescue/`

Include:

- summary;
- repo-truth files inspected;
- files changed;
- UI/UX changes;
- architecture guardrails preserved;
- tests added/updated;
- commands run and results;
- screenshots or hosted/local validation notes if available;
- limitations;
- commit message.

## Commit Message Target

```text
SPFx Foleon Manager: rescue shell and information architecture
```
