# B03 Validation and Closeout Requirements

## 1. Validation objective

Prove that the B03 shell/navigation/hero/dashboard work is structurally correct, accessible at the interaction-contract level, and cleanly bounded from later read-model/backend/module-detail batches.

## 2. Prerequisite gate

Before execution, confirm:

- B02 has landed on the branch.
- `apps/my-dashboard/` exists.
- The My Dashboard package/runtime marker/build registration created by B02 exists.
- The branch is clean or the agent documents operator-owned pre-existing work.

If these conditions are not met, do not implement B03. Produce a prerequisite-gap closeout.

## 3. Required tests

### 3.1 Models and state

- Navigation registry returns only `my-work-home`.
- Module registry returns only `adobe-sign-action-queue`.
- Module is selectable, `read-only`, parented to home.
- Invalid primary surface ID normalizes to home.
- Invalid module ID normalizes to undefined.
- `selectPrimarySurface` clears active module.
- `selectModule` activates Adobe module and keeps home as parent surface.

### 3.2 Navigation interaction tests

- Tablist has correct role/label.
- Primary tab has:
  - `role="tab"`,
  - `aria-selected`,
  - `aria-controls`.
- Module launcher has:
  - native button,
  - `aria-haspopup="menu"`,
  - `aria-expanded`,
  - `aria-controls`.
- Menu renders with `role="menu"`.
- Adobe module item renders with `role="menuitem"`.
- ArrowDown from launcher opens the menu and focuses the first item.
- Escape closes the menu and restores focus.
- Enter/Space on module item triggers module selection.
- Click on home tab returns to home state.

### 3.3 Hero tests

- Home hero renders:
  - `My Dashboard`,
  - `My Work`,
  - approved home description,
  - approved home governance copy.
- Focused Adobe hero renders:
  - `My Dashboard`,
  - `Adobe Sign Action Queue`,
  - approved Adobe description,
  - approved focused governance copy.
- Hero does **not** render:
  - project facts,
  - command search,
  - fake search controls.

### 3.4 Shell/panel tests

- Shell main renders exactly one `role="tabpanel"`.
- Shell main owns `data-my-work-active-surface-panel`.
- No card or nested surface owns that panel marker.
- `aria-labelledby` points to the home tab ID.
- Shell root view state changes from `home` to `focused-module`.

### 3.5 Layout/choreography tests

At minimum validate static span resolution or component attributes for:

- home ready 12-col `4 + 8`,
- home ready 10-col `3 + 7`,
- home non-ready 12-col `3 + 6 + 3`,
- focused ready 12-col `4 + 8`,
- focused non-ready 12-col `8 + 4`.

If span helpers can be unit-tested without DOM fragility, prefer unit tests. If component tests are cleaner, assert inspectable data attributes or resolved grid style contract.

### 3.6 Surface/card tests

- Home state renders Work Summary before Adobe queue.
- Focused state renders Adobe module cards instead of home cards.
- Home card trigger selects the Adobe module.
- Conditional Source Readiness card only renders in non-ready structural state.
- Data attributes for cards and Adobe module root are present.

## 4. Static quality checks

Run, using the package name established by B02:

```bash
pnpm --filter <my-dashboard-package-name> check-types
pnpm --filter <my-dashboard-package-name> test
pnpm --filter <my-dashboard-package-name> lint
```

Recommended additional checks:

```bash
pnpm prettier --check \
  apps/my-dashboard \
  packages/models/src/myWork
```

If the repo uses a different prettier command, use the repo-standard equivalent and report it exactly.

## 5. Package-readiness validation

Where Node packaging prerequisites are available:

```bash
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

Validate:

- package builds,
- runtime marker linkage remains intact,
- B03 source-file additions do not break the B02 packaging lane,
- output package-truth proof is regenerated if the orchestrator does so.

If the package step cannot execute, record:

- exact failed command,
- exact environmental reason,
- whether the failure is B03 code-related or toolchain-related.

## 6. Required closeout sections

Prompt 06 closeout must include:

1. Final verdict.
2. Branch and ending HEAD.
3. Starting HEAD if known.
4. B02 prerequisite confirmation.
5. Implementation summary by prompt.
6. Created/modified files.
7. Tests run and exact results.
8. Packaging command outcome.
9. Explicit confirmation of no B03 boundary violations.
10. Deferred items intentionally owned by B04/B05/B08.
11. Git commit summary and commit description.

## 7. Acceptance bar

B03 is acceptable only if:

- the My Work shell composes correctly,
- navigation behavior is keyboard-complete,
- hero identity changes correctly,
- dashboard cards appear in the B03-prescribed shell order,
- no project-context PCC content leaked into My Dashboard,
- no fake search/control affordances were added,
- no Batch 04/05/08 work was improperly implemented,
- validation evidence is exact rather than impressionistic.
