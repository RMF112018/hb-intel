# 16 — Prompt 02: Homepage Content Tab Redesign

You are working as the local code agent in the `hb-intel` repository.

## Wave

Wave 02 — Homepage Content Tab Redesign

## Goal

Make the Homepage Foleon Content tab the primary marketing workflow with three lane cards, a selected-lane workspace, and secondary content library.

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

- `apps/hb-intel-foleon/src/pages/manage/HomepageFoleonContentTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageLaneViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageMutationUtils.ts`
- `apps/hb-intel-foleon/src/pages/manage/ManageRegistryPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManagePlacementPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/manage/manageFields.module.css`
- `apps/hb-intel-foleon/src/types/foleon-management.types.ts`
- `apps/hb-intel-foleon/src/pages/__tests__/**`

## Files Likely to Change

- `HomepageFoleonContentTab.tsx`
- `manageLaneViewModel.ts`
- `ManageRegistryPanel.tsx`
- `ManageContentEditorPanel.tsx`
- `ManagePlacementPanel.tsx`
- `manageShell.module.css`
- `manageFields.module.css`
- tests
- optional new components:
  - `LaneSummaryCard.tsx`
  - `SelectedLaneWorkspace.tsx`
  - `PublishReadinessChecklist.tsx`
  - `ContentLibraryPanel.tsx`

## Visual / UX Objective

A marketing user should immediately see the status of:

- Project Spotlight
- Company Pulse
- Leadership Message

They should be able to select a lane, review active/staged content, understand blockers, and take the next action without reading raw readiness diagnostics.

## Implementation Requirements

1. Add a lane summary with cards for:
   - Project Spotlight
   - Company Pulse
   - Leadership Message
2. Derive lane states conservatively:
   - Live
   - Preview
   - Blocked
   - Empty
   - Needs setup
3. Lane cards must show:
   - lane name;
   - current status;
   - active/staged content title;
   - display window;
   - placement status;
   - publish readiness;
   - primary next action.
4. Add selected-lane workspace:
   - current content;
   - placement status;
   - publish readiness checklist;
   - quick actions.
5. Keep content library reachable, searchable, and sortable, but make it secondary to lane workflow.
6. Preserve existing editor, placement, validate, publish, suppress, and sync workflows.
7. Disable write actions when `writePathReady !== true` and show exact plain-language reason.
8. Do not invent data. Use existing content/placement/readiness facts.

## Acceptance Criteria

- Three lane cards render.
- Selected-lane workspace renders for the selected lane.
- Default selected lane prioritizes blocked/needs-setup/preview before live.
- Content library remains reachable.
- Existing workflows remain functional.
- Marketing tab does not show raw registry/list/API/token labels by default.
- Disabled write actions explain blockers.

## Tests to Add / Update

Add or update tests proving:

- lane cards render for all three lanes;
- lane state derivation covers live, preview, blocked, empty, and needs setup;
- selected-lane workspace updates when lane changes;
- write actions are disabled with reason when write path is blocked;
- content library/editor/placement workflows remain reachable;
- no live telemetry or publish action fires from disabled state.
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
SPFx Foleon Manager: redesign homepage content lanes
```
