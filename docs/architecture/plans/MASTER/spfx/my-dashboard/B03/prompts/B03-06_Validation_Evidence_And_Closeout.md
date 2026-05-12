# B03-06 — Validate, Harden, and Close Out the B03 My Work Shell Implementation

## Objective

Perform the final B03 validation pass, repair any scope-owned defects found during validation, and produce a rigorous closeout suitable for commit/review.

## Prerequisite

Prompts B03-01 through B03-05 are complete in the current working tree.

## Read first

Do not re-read files that are still in your current context or memory. Inspect only:
- files touched by Prompts 01–05,
- tests that must be updated,
- package/build configuration only if validation indicates a real integration issue,
- the B03 package closeout requirements.

## Final audit checklist

### 1. Boundary compliance

Confirm all are true:

- B02 app/package foundation is present.
- No command search was added.
- No project facts row was added.
- No URL routing/search-param nav state was added.
- No localStorage shell nav persistence was added.
- No analytics cards were added.
- No Adobe backend/OAuth/provider logic was added.
- No new personal-work aggregation primitive competes with `@hbc/my-work-feed`.

### 2. Shell/navigation correctness

Confirm:

- one primary surface in MVP,
- one selectable Adobe queue module,
- menu launcher attached to the home tab group,
- shell main is the sole active panel owner,
- module selection switches view-state without leaving the shell,
- returning to home clears the focused module.

### 3. Hero correctness

Confirm:

- home hero copy exactly matches B03,
- focused Adobe hero copy exactly matches B03,
- governance microcopy exactly matches B03,
- no project facts/search/fake affordances exist.

### 4. Layout correctness

Confirm:

- home ready and non-ready card order,
- focused ready and non-ready card order,
- 10/12 column span overrides as specified,
- responsive mode helpers resolve expected columns,
- bento children remain direct operational children.

### 5. Accessibility correctness

Confirm through tests/inspection:

- tab/menu roles and labels,
- launcher `aria-haspopup`, `aria-expanded`, `aria-controls`,
- keyboard activation,
- Escape focus return,
- visible focus styles implemented in CSS,
- no color-only state labels.

### 6. Data-attribute correctness

Confirm the B03 selectors exist and are applied consistently:

```text
data-my-work-shell
data-my-work-shell-mode
data-my-work-view-state
data-my-work-command-surface
data-my-work-primary-navigation
data-my-work-tab-id
data-my-work-tab-active
data-my-work-module-launcher
data-my-work-module-menu
data-my-work-module-menu-item
data-my-work-module-active
data-my-work-hero
data-my-work-hero-primary-title
data-my-work-hero-secondary-title
data-my-work-hero-description
data-my-work-hero-highlight
data-my-work-hero-governance-copy
data-my-work-canvas
data-my-work-active-surface-panel
data-my-work-bento-grid
data-my-work-card
data-my-work-card-role
data-my-work-module
data-my-work-adobe-sign-queue
```

## Validation commands

Use the actual My Dashboard package name established by B02.

Minimum:

```bash
pnpm --filter <my-dashboard-package-name> check-types
pnpm --filter <my-dashboard-package-name> test
pnpm --filter <my-dashboard-package-name> lint
```

Recommended formatting check:

```bash
pnpm prettier --check \
  apps/my-dashboard \
  packages/models/src/myWork
```

Package readiness where environment allows:

```bash
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

If package build is blocked by operator environment, record the exact blocker and determine whether B03 code still typechecks/tests cleanly.

## Repair policy

If validation reveals B03-scope defects:
- repair them in this prompt,
- update tests accordingly,
- do not defer fixable B03 defects to B04/B05.

If validation reveals out-of-scope issues:
- document them precisely,
- do not expand scope to solve them.

## Required closeout format

Produce:

### 1. Final verdict
- PASS
- PASS WITH EXPLICIT DEFERRED ITEMS
- FAIL

### 2. Branch / HEAD
- Branch:
- Starting HEAD:
- Ending HEAD:

### 3. B02 prerequisite confirmation
State the exact evidence that B02 foundation exists.

### 4. Implementation summary
Summarize Prompt 01–05 outcomes.

### 5. Files changed
List created and modified files.

### 6. Validation table
| Command | Result |
|---|---|
| ... | PASS / FAIL / NOT RUN — reason |

### 7. Boundary compliance table
| Boundary | Result |
|---|---|
| No search | PASS |
| No project facts | PASS |
| No backend/OAuth overreach | PASS |
| ... | ... |

### 8. Deferred items intentionally owned by later batches
Call out:
- B04 read models,
- B05 detailed Adobe queue UI,
- B06 backend routes,
- B07 OAuth/live integration,
- B08 hosted evidence.

### 9. Commit summary and description
Provide a concise git commit summary and a professional commit description.

## Final instruction

Do not re-read files that are still in your current context or memory. Use your current session state efficiently, inspect only what changed or what must be validated, and close the B03 scope with exact evidence.
