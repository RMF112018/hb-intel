# 18 — Prompt 04: Degraded States and Diagnostics

You are working as the local code agent in the `hb-intel` repository.

## Wave

Wave 04 — Degraded States and Diagnostics

## Goal

Polish consent-required, read-only, backend unavailable, blocked write/sync, lane empty/preview/blocked, and diagnostics copy-proof states.

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
- `apps/hb-intel-foleon/src/pages/manage/manageLaneViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageConfigViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManagePlacementPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageMutationUtils.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/__tests__/**`
- runtime/readiness contracts under `apps/hb-intel-foleon/src/runtime/**`

## Files Likely to Change

- `ManageOrchestrator.tsx`
- `HomepageFoleonContentTab.tsx`
- `FoleonConfigTab.tsx`
- `manageLaneViewModel.ts`
- `manageConfigViewModel.ts`
- `ManageContentEditorPanel.tsx`
- `ManagePlacementPanel.tsx`
- CSS modules
- tests
- optional component:
  - `ManagerStatusBanner.tsx`
  - `DisabledActionReason.tsx`
  - `DiagnosticsDisclosure.tsx`

## Visual / UX Objective

The Manager must look intentional and stable when API consent, token acquisition, backend, read, write, or sync paths are blocked.

## Implementation Requirements

1. Add/polish API approval required banner:
   - plain language;
   - one next action;
   - expandable technical detail;
   - no raw token errors in primary banner.
2. Ensure missing consent/token does not hard-block the entire app where read-only rendering is safe.
3. Add limited/read-only mode copy.
4. Ensure disabled actions explain why:
   - publish;
   - save;
   - placement update;
   - sync.
5. Add lane degraded-state copy for:
   - Live;
   - Preview;
   - Blocked;
   - Empty;
   - Needs setup.
6. Ensure diagnostics are:
   - collapsed by default;
   - redacted;
   - copyable;
   - tied to the relevant blocker.
7. Do not surface raw secrets/tokens/backend URLs/API resources/list GUIDs in primary UI.

## Acceptance Criteria

- API consent missing renders warning banner and limited mode.
- Read-only content review remains available when safe.
- Publish/sync/write actions are disabled with reason.
- Diagnostics do not dominate the UI.
- Diagnostics proof is redacted and copyable.
- No raw stack trace appears in primary UI.
- Full-surface block occurs only when repo truth proves the app cannot safely render any meaningful view.

## Tests to Add / Update

Add or update tests proving:

- consent-required state renders limited mode, not generic fatal error where safe;
- token acquisition blocked disables write/sync with reason;
- backend unavailable state has calm error and Config guidance;
- lane empty/preview/blocked states render correct copy;
- diagnostics are collapsed and redacted;
- no raw token, secret, GUID, backend URL, or API resource appears in primary UI.
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
SPFx Foleon Manager: polish degraded states and diagnostics
```
