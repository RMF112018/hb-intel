# Prompt 03 — State Copy, Accessibility, and Breakpoints

## Objective

Harden the Leadership Message reader across all states, accessibility paths, and homepage-hosted breakpoints so the implementation meets homepage-grade expectations and does not regress under SharePoint conditions.

Do not re-read files that are still within your current context or memory unless needed to verify repo truth or resolve a contradiction.

## Files to inspect

```text
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx
packages/foleon-reader/src/readers/__tests__/LeadershipMessageReaderLayout.test.tsx
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/08_COPY_AND_CONTENT_RULES.md
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/11_ACCESSIBILITY_AND_BREAKPOINT_CONTRACT.md
docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md
docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md
docs/reference/ui-kit/doctrine/**
```

## Files likely to change

```text
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/__tests__/LeadershipMessageReaderLayout.test.tsx
```

## Guardrails

- No feature creep into Foleon Manager.
- No weakening of viewer close/focus behavior.
- No raw exception text in employee-facing UI.
- No internal metadata.
- No hover-only meaning.
- No fixed-width layout that breaks SharePoint columns.

## Steps

1. Audit all state branches:
   - live/current;
   - preview-only;
   - no live;
   - external-open-only;
   - blocked/unavailable;
   - archived/expired;
   - scheduled/future if supported.
2. Replace all state copy with the approved copy rules.
3. Validate semantic structure:
   - article + H2;
   - CTA accessible name;
   - status reason relationship;
   - no nested controls.
4. Validate focus behavior using existing provider tests.
5. Add responsive behavior:
   - desktop paired row;
   - desktop full-width;
   - tablet;
   - phone;
   - short-height;
   - SharePoint edit mode.
6. Add or update CSS for reduced motion and touch-safe targets.
7. Add tests for forbidden strings and state-specific visible copy.

## Tests

Run:

```bash
pnpm --filter @hbc/foleon-reader test -- LeadershipMessageReaderLayout
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
```

## Acceptance criteria

- Every state has clear copy.
- CTA remains visible in live/external states.
- Disabled CTA has visible reason and `aria-describedby`.
- Keyboard path works.
- Focus return remains covered.
- No state leaks developer/internal metadata.
- Layout remains stable at narrow and short-height constraints.

## Commit message

```text
Foleon reader: harden Leadership Message states and breakpoint contract

Adds production-safe state copy, accessibility guardrails, and responsive behavior for the Leadership Message reader so live, preview, no-live, blocked, and external-only states remain clear in SharePoint-hosted homepage conditions.
```
