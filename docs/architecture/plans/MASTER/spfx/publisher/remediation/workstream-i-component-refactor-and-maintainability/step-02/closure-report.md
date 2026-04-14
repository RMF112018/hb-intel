# Step 02 Closure Report — Extract shell, queue rail, and workspace orchestration

Date: 2026-04-14
Prompt: `phase-08/phase-9/Prompt-02-Extract-shell-queue-and-workspace-orchestration-modules.md`
Manifest: `hb-webparts` 1.0.0.300

## Summary
Extracted the Publisher's left-rail queue orchestration out of the monolithic `ArticlePublisher.tsx` into a dedicated `workspace/` module:

- **`useDraftWorkspace` hook** — owns queue state (`groups`, `groupsLoading`, `groupsError`, `collapsedGroups`), promotion ruleset load, selection identity, and the `reloadGroups` API. Includes the mount-time reload effect and the promotion-rules fetch effect.
- **`QueueRail` component** — thin presentational wrapper that owns rail header, error/empty affordances, and delegates to the already-extracted `DraftQueue` surface.
- **Shared constants** (`DRAFT_GROUP_ORDER`, `COLLAPSED_GROUPS_BY_DEFAULT`, `EMPTY_DRAFT_GROUPS`, `DraftGroupMap`) moved into `workspace/useDraftWorkspace.ts` and re-exported.

The shell (`ArticlePublisher.tsx`) dropped from **1972 → 1858 LOC**; draft-authoring state, preview, status, and lifecycle handlers remain in the shell as planned for Workstream I Prompt 04 (controller-hook extraction).

Behavior is preserved: no lifecycle, no publish/republish/archive/withdraw, no preview, and no save-time logic was changed. Queue loading, selection, promotion-rules loading, collapse defaults, and rail empty/error states are functionally identical to before.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/workspace/useDraftWorkspace.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/workspace/QueueRail.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/workspace/index.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (trimmed; now consumes `useDraftWorkspace` + `QueueRail`)
- `apps/hb-webparts/config/package-solution.json` (version bump 1.0.0.299 → 1.0.0.300)

## Validation performed
- `tsc --noEmit` clean on `@hbc/spfx-hb-webparts`.
- `vitest run` — **253/253** tests pass across 23 files (full hb-webparts suite).
- Manual trace: queue states (loading, error, empty, populated) remain reachable through `QueueRail` props; selection, create-new, and reload wiring match the prior inline render; promotion rules still hydrate on mount through the hook effect.

## Doctrine alignment
- SPFx Governing Standard: no new visual primitives introduced; rail continues to compose `DraftQueue` + `PublisherButton` + `HbcEmptyState`. Keyboard and a11y attributes (`aria-label`, `role="alert"`) preserved verbatim.
- Homepage Overlay: editorial queue surface unchanged.

## Blockers
None. Prompt 03 (authoring panels + shared primitives) and Prompt 04 (controller hooks) remain queued.
