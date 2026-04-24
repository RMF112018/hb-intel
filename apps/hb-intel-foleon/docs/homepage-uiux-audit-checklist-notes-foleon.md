# Foleon Connector — Homepage UI/UX Audit Checklist Notes

Cross-walk to `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`.

## Completed / addressed in this delivery

- **Manage route modularization:** Thin `ManagePage` → `ManageOrchestrator` + `manage/*` panels (dashboard, registry, editor, placements, sync).
- **Premium stack:** `motion` (metric entrance), `lucide-react` (icons), Radix Tooltip / Separator / ScrollArea, `class-variance-authority`, `clsx`.
- **Breakpoints:** `docs/breakpoint-contract.md` + runtime `data-breakpoint-*` attributes.
- **State:** Explicit load/blocked/error/ready; dirty editor banner + `beforeunload`; Graph conflict messaging on save.
- **Backend:** Foleon OAuth error text, Graph error bodies in `details`, sync payload normalization + registry upsert counts on SyncRuns, numeric string parsing for list `readNumber`.
- **Tests:** Manage page smoke (no iframe), `normalizeFoleonApiDocument`, API conflict helper.

## Follow-ups (not blocking this PR)

- Reduce ESLint D-10/D-05 warnings in `manage/*` by moving remaining inline styles (Radix content, icon margins) into CSS modules with token references.
- Deeper keyboard traps / focus return from dialogs if future modal flows are added.
- Expand Functions Vitest include globs to cover `foleon-routes` integration tests if moved under `src/services/__tests__`.
