# Fresh Code-Agent Prompt — HB Intel Foleon Manager

You are working in the live `hb-intel` repository. Use `main` as repo truth unless the user provides another branch.

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth or resolve a contradiction.

Preserve security and runtime boundaries:
- Do not weaken `withAuth`.
- Do not weaken route authorization.
- Do not weaken token validation.
- Do not weaken safe-config gates.
- Do not leak secrets or raw diagnostics into the browser.
- Preserve registry-first runtime configuration.
- Preserve redacted diagnostics.
- Preserve package/runtime proof.

Required validation commands for final proof:

```bash
git status --short
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

## Objective

Replace the form-heavy primary placement path with a guided workflow and first-class employee-facing preview.

## Files to Inspect

- `ManagePlacementPanel.tsx`
- `ManageContentEditorPanel.tsx`
- `SelectedLaneWorkspace.tsx`
- `FoleonManagementApi.ts`
- `manageWorkflows.ts`
- `manageMutationUtils.ts`
- `foleon-management.types.ts`
- `FoleonOriginPolicy.ts`

## Files Likely to Change

- `ManagePlacementPanel.tsx`
- `ManageContentEditorPanel.tsx`
- `SelectedLaneWorkspace.tsx`
- `manageWorkflows.ts`
- `manageShell.module.css`
- tests under `apps/hb-intel-foleon/src/pages/__tests__/`

## New Files to Consider

- `PlacementWorkflowPanel.tsx`
- `PlacementWorkflowSteps.tsx`
- `ReaderPreviewPanel.tsx`
- `PreviewModeSelector.tsx`
- `placementWorkflowViewModel.ts`

## Guardrails

- Do not remove advanced edit capability; move it behind Advanced details.
- Do not bypass backend validation.
- Do not allow publish/activate if validation is blocked.
- Do not iframe unsafe or unapproved URLs.
- Maintain focus trap and restore focus for modal/panel preview.

## Steps

1. Define the placement workflow:
   - Select content
   - Review readiness
   - Choose lane
   - Confirm display window
   - Validate
   - Preview
   - Save staged or activate
2. Build `PlacementWorkflowPanel`.
3. Build `ReaderPreviewPanel` with modes:
   - HB Central reader preview
   - Foleon source open
   - External-only fallback
4. Use plain-language blocked reasons with owner and next action.
5. Keep `ManageContentEditorPanel` as Advanced details.
6. Add confirmation behavior for activation/publish.
7. Add tests for happy path, blocked path, preview mode, and disabled action explanations.

## Acceptance Criteria

- A content manager can place content without understanding SharePoint list fields.
- Preview is a required/obvious step before activation.
- Disabled publish/activate controls explain why, who can fix it, and next action.
- No unsafe iframe or origin-policy regression.
- Focus behavior is keyboard-safe.

## Commit Message

`SPFx Foleon Manager: add guided placement workflow and reader preview`
