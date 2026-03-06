# ADR-0050: Developer Harness, Documentation, and E2E Expansion (Phase 4b.16)

**Status:** Accepted  
**Date:** 2026-03-06  
**Phase:** 4b.16

## Context

PH4B.16-C §7 required final P3 closure for three areas:

1. Missing dev-harness demonstrations for shell/navigation/layout patterns.
2. Missing per-domain `WorkspacePageShell` smoke checks.
3. Remaining UI-kit reference documentation gaps and final dual-entry-point guidance.

Prior phases delivered D-01/D-03/D-06/D-07 architecture foundations, but audit evidence was still incomplete for P3 closure.

## Decision

1. Add three new dev-harness pages:
   - `DemoShell`
   - `DemoNavigation`
   - `DemoLayouts`
   and wire them into `WorkspacePlaceholder` demo routing by workspace.
2. Add one Playwright smoke spec per domain app route group (12 total) plus shared assertion helper for `WorkspacePageShell` rendering.
3. Complete missing component references in `docs/reference/ui-kit/` for:
   - `HbcBarChart`, `HbcDonutChart`, `HbcLineChart`
   - `HbcTextArea`, `HbcRichTextEditor`
   - `HbcToastProvider`, `HbcToastContainer`
4. Finalize explicit dual-entry-point guidance in both `CLAUDE.md` and `packages/ui-kit/DESIGN_SYSTEM.md`.

## Coverage Matrix

### Dev-harness
- Shell contract demo: loading/empty/error/banner/action pathways.
- Navigation continuity demo: route-like state transitions inside persistent shell frame.
- Named layout demo: `dashboard`, `list`, `form`, `landing`.

### E2E Domain Smoke
- `accounting`, `admin`, `business-development`, `estimating`
- `human-resources`, `leadership`, `operational-excellence`, `project-hub`
- `quality-control-warranty`, `risk-management`, `safety`, `hb-site-control`

Each smoke checks:
- `data-hbc-ui="workspace-page-shell"` visibility
- expected page heading visibility
- `main` content visibility
- no `[data-error-boundary]` artifact

## Consequences

### Positive
- P3 acceptance evidence now exists across harness, docs, and e2e.
- Domain smoke coverage is explicit and consistent via shared helper.
- Entry-point guidance is now synchronized between contributor policy (`CLAUDE.md`) and UI-kit authoring rules (`DESIGN_SYSTEM.md`).

### Tradeoffs
- E2E suite size increased (additional domain specs).
- Documentation surface increased (more reference files to maintain).

## Verification Evidence

- `pnpm turbo run build`
- `pnpm turbo run check-types`
- `pnpm turbo run lint`
- `pnpm --filter @hbc/ui-kit build-storybook`
- `pnpm --filter @hbc/ui-kit test-storybook --url <served storybook>`
- Playwright full run with domain smoke specs included

