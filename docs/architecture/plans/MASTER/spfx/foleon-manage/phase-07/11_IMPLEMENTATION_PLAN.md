# 11 — Implementation Plan

## Wave 0 — Safety Baseline

- Create branch: `feature/foleon-manager-world-class-rebuild`.
- Capture current hosted screenshots and package proof.
- Confirm latest main branch and package version.
- Run initial validation commands.

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

## Wave 1 — Content Operations Shell

- Refactor `ManageOrchestrator` into a thin orchestrator.
- Add `ManageOperationsShell`.
- Add `CommandHeader`, `StatusSummaryStrip`, `ManagerPrimaryNav`.
- Reframe header actions by task:
  - Sync from Foleon
  - Review new content
  - Manage placements
  - Open Foleon
  - Admin diagnostics

## Wave 2 — Content Inbox and Lane Board

- Add `ContentInbox`.
- Add `LaneControlBoard`.
- Add `contentOperationsViewModel.ts`.
- Promote content discovery above the current secondary library.
- Show new/unassigned/staged/blocked/live content as operational queues.

## Wave 3 — Placement Workflow and Preview

- Add `PlacementWorkflowPanel`.
- Add `ReaderPreviewPanel`.
- Replace primary reliance on `ManageContentEditorPanel`.
- Keep advanced metadata editing behind “Advanced details.”
- Add preview modes:
  - employee-facing HB Central reader preview,
  - Foleon source open,
  - external-only fallback.

## Wave 4 — Admin / Config Separation

- Rebuild `FoleonConfigTab` into `AdminConfigWorkspace`.
- Keep diagnostics available but subordinate.
- Add required admin actions with owner/next action.
- Preserve redacted proof copy.

## Wave 5 — State Model, Breakpoints, Accessibility

- Replace viewport-only breakpoint logic with container-aware modes.
- Add comprehensive empty/limited/error states.
- Add focus management for panels/drawers/previews.
- Add reduced-motion support.
- Add tests for keyboard and disabled action explanations.

## Wave 6 — Package and Hosted Proof

- Bump package only when source changes are ready.
- Build SPPKG.
- Run package proof.
- Upload/deploy to tenant.
- Capture required hosted evidence.
- Record evidence under the package directory.

## Required Commands

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
