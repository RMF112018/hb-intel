# Prompt 05 — Recompose Bento Grid and Primary-Page Module Choreography

```markdown
# Objective

Recompose the My Dashboard primary-page home layout so the final rendered experience contains exactly the two target module cards in the locked bento order and span choreography.

# Repo-truth context

Start from Prompts 01–04.

Primary seams to inspect and likely change:
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/layout/MyWorkBentoGrid.tsx`
- `apps/my-dashboard/src/layout/MyWorkBentoGrid.module.css`
- `apps/my-dashboard/src/layout/MyWorkCard.tsx`
- `apps/my-dashboard/src/layout/myWorkFootprints.ts`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- the consolidated Adobe Sign card from Prompt 03
- relevant home/layout tests.

Target authorities:
- `docs/02-Decision-Lock-And-Closed-Target-Posture.md`
- `docs/04-Target-Primary-Page-Layout-And-Bento-Choreography.md`
- `reference/Target-State-Acceptance-Matrix.md`

Do not reread files that are already in your active context unless they changed, context is stale, or scope expanded.

# Architectural guardrails

1. Preserve the existing bento/grid primitives wherever practical.
2. Do not invent filler cards.
3. Do not reintroduce Work Summary, Source Readiness, or module fragmentation to make rows balance.
4. Layout order is static:
   1. My Projects
   2. Adobe Sign Action Queue.
5. Card spans are locked.

# Implementation instructions

## 1. Home surface composition
Update the primary home surface so the rendered production path includes exactly:
- My Projects card
- consolidated Adobe Sign Action Queue card

Remove/stop rendering:
- Work Summary card
- Source Readiness card
- standalone Adobe Queue State card
- old home Adobe card path that exists only to forward the user into a focused route.

## 2. Exact bento spans
Implement span behavior that matches the closed matrix:

### My Projects
- `largeLaptop`: 7
- `desktop`: 7
- `ultrawide`: 7
- `standardLaptop`: 6
- `smallLaptop`: full mode width
- `tabletLandscape`: full mode width
- `tabletPortrait`: full mode width
- `phone`: full mode width

### Adobe Sign
- `largeLaptop`: 5
- `desktop`: 5
- `ultrawide`: 5
- `standardLaptop`: 4
- `smallLaptop`: full mode width
- `tabletLandscape`: full mode width
- `tabletPortrait`: full mode width
- `phone`: full mode width

Use existing span override APIs or safe layout primitives. Do not bypass the grid with one-off container CSS that breaks testability.

## 3. Row rhythm
Ensure the first visible row of module cards feels intentional:
- clean alignment;
- no giant left-right imbalance caused by stale full-width footprint;
- no oversized blank bands from empty-state scaffolding.

## 4. CSS polish
Reconcile spacing so the compact header from Prompt 02 leads naturally into the two-card composition.

# Why the current implementation is insufficient

Even after individual card improvements, the product posture is not closed until the home surface composes those cards with the correct order, spans, and removal of obsolete standalone cards.

# Required implementation outcome

After this prompt:
- the page renders exactly two target module cards;
- those cards use the locked responsive choreography;
- obsolete standalone home cards are gone from the rendered target path;
- layout feels like a compact dashboard, not a wide report page.

# What done really looks like

Desktop:
- My Projects uses 7 columns.
- Adobe Sign uses 5 columns.
- Both sit in the first dashboard row beneath the compact header.

Standard laptop:
- My Projects uses 6 columns.
- Adobe Sign uses 4 columns.

Smaller modes:
- cards stack full width.

# Verification

Run:
```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

Add/update tests where practical to prove:
- exact card render count;
- order;
- span overrides/data attributes;
- absence of Work Summary / Source Readiness / old Adobe standalone cards in the rendered home path.

# Documentation updates

No final README refresh yet.  
Update inline layout comments/tests if they directly conflict with the locked span choreography.

# Deliverables / exit criteria

Return:

1. **Implementation Decision:** PASS / PARTIAL / BLOCKED
2. **Files inspected**
3. **Files changed**
4. **Final home surface composition**
5. **Span/footprint implementation details**
6. **Tests added/updated**
7. **Validation commands/results**
```
