# B03 Implementation Package Overview

## Objective

Implement the B03 My Work shell/navigation/hero/dashboard UX architecture inside the My Dashboard app domain created by B02, without reopening Batch 01 or Batch 02 decisions and without trespassing into Batch 04–08 ownership.

## Repo-truth posture

The implementation package is based on the following repo truths:

1. PCC already implements the preferred shell anatomy:
   - command surface,
   - horizontal primary navigation,
   - hero band,
   - one shell-owned active `tabpanel`,
   - bento-grid canvas below.
2. PCC already demonstrates the grouped tab + module launcher pattern with menu-button semantics, roving focus, Escape return behavior, and module item activation.
3. PCC already demonstrates in-memory shell state that normalizes invalid primary/module identifiers without URL routing.
4. PCC already demonstrates container-aware responsive modes and deliberate span overrides.
5. HB Homepage demonstrates the value of evidence-grade shell data attributes and the shell/child responsibility boundary.
6. `@hbc/my-work-feed` remains the canonical shared personal-work aggregation package. B03 must create a host-specific My Dashboard shell, not a competing personal-work primitive.

## B03 execution model

B03 is best implemented in six focused prompts:

| Prompt | Implementation lane |
|---|---|
| 01 | Typed My Work navigation registry and shell state |
| 02 | Command surface, accessible primary navigation, attached module launcher |
| 03 | Hero band and home vs focused-module identity/summary/governance copy |
| 04 | Bento-grid responsive layout contract and shell router |
| 05 | Home surface and focused Adobe module shell-placement structures |
| 06 | Tests, validation, package readiness, and closeout |

## B03 product shape after completion

Expected post-B03 UI architecture:

```text
MyDashboardApp
└── MyWorkShell
    ├── Command surface
    │   ├── MyWorkPrimaryNavigation
    │   │   └── My Work Home tab + attached module launcher
    │   │       └── Adobe Sign Action Queue menu item
    │   └── MyWorkHeroBand
    └── main[role="tabpanel"]
        └── MyWorkBentoGrid
            └── MyWorkSurfaceRouter
                ├── MyWorkHomeSurface
                └── AdobeSignActionQueueModuleSurface
```

## Closed UX decisions to enforce

- One primary surface: `my-work-home`.
- One rendered/selectable module: `adobe-sign-action-queue`.
- Module selection focuses the same active shell panel; it does not create a second page route.
- Hero state swaps from:
  - `My Dashboard / My Work`
  - to `My Dashboard / Adobe Sign Action Queue`.
- No project facts row.
- No command search.
- No analytics cards.
- Ready home choreography:
  - Work Summary 4 + Adobe queue 8 at 12 columns,
  - 3 + 7 at 10 columns.
- Non-ready home choreography:
  - Work Summary 3 + Queue State 6 + Source Readiness 3 at 12 columns,
  - 3 + 4 + 3 at 10 columns.
- Focused module ready choreography:
  - Queue Summary 4 + Action List 8 at 12 columns,
  - 3 + 7 at 10 columns.
- Focused module non-ready choreography:
  - Queue State 8 + Guidance 4 at 12 columns,
  - 6 + 4 at 10 columns.

## Preview/data boundary

B03 must render a coherent structural UI, but it must not solve Batch 04 and Batch 05. Therefore:

- Use narrow deterministic presentation fixtures or local structural view models only where necessary to make the shell render and tests meaningful.
- Keep those fixtures isolated and clearly marked as transitional shell-display inputs.
- Do not invent backend route shapes or final Adobe item contracts.
- Do not fabricate source-open link logic that later Batch 05 must own.

## Implementation quality expectation

The local agent should treat this as flagship shell work:

- production-grade naming,
- strong typed registries,
- keyboard-complete navigation behavior,
- data attributes suitable for future Playwright selectors,
- thoughtful CSS Modules,
- no dead UI,
- no fake affordances,
- no brittle hardcoding that makes Batch 04/B05 unnecessarily expensive.
