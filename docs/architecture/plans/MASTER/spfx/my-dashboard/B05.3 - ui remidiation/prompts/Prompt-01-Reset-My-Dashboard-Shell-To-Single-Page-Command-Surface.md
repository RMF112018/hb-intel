# Prompt 01 — Reset My Dashboard Shell to Single-Page Command Surface

```markdown
# Objective

Reset the My Dashboard shell from a routed, tab/dropdown-driven module launcher into a single primary-page command surface that supports the locked target UI posture.

# Repo-truth context

Start from current repo truth confirmed in Prompt 00.

Primary seams to inspect and likely change:
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/shell/MyWorkShell.module.css`
- `apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.tsx`
- `apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.module.css`
- `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx`
- `apps/my-dashboard/src/state/useMyWorkShellState.ts`
- `apps/my-dashboard/src/shell/MyWorkActiveEnvelopeContext.tsx`
- `apps/my-dashboard/src/MyDashboardApp.tsx`

Related tests to inspect:
- shell tests;
- primary navigation tests;
- surface router tests;
- any tests asserting role=`tabpanel`, tab labels, dropdown launcher state, or focused-module route behavior.

Do not reread files that are already in your active context unless they changed, context is stale, or scope expanded.

# Architectural guardrails

1. The primary page is now the product. Do not preserve visible tabs or dropdown module launcher in the target runtime.
2. Do not rebuild a different hidden navigation shell under another name.
3. Preserve read-model provider/envelope boundaries unless current repo truth proves a minimal refactor is necessary to support the single-page target.
4. Do not alter backend endpoints or OAuth architecture.
5. Keep accessibility strong, but do not use ARIA tab semantics for a UI that is no longer a tabbed product surface.

# Implementation instructions

Implement the shell reset in a controlled manner:

1. Remove rendered dependence on `MyWorkPrimaryNavigation` from the live target path.
2. Remove the visible command-surface tab/dropdown product structure.
3. Remove runtime dependence on `activeModuleId` as the mechanism that determines whether the user sees home vs. focused Adobe.
4. Remove or rework the `viewState: 'home' | 'focused-module'` product posture so the live target path is a single primary page.
5. Reconcile or replace `MyWorkSurfaceRouter` so the home surface is the rendered path for this phase.
6. Preserve the active read-model envelope/provider structure required for the home page and for the consolidated Adobe card planned in Prompt 03.
7. Remove or rewrite semantics that assert the active page is a tab panel if the page is no longer a tabbed interface.
8. Do not yet perform the full Adobe consolidation or final header redesign here; this prompt closes the shell posture foundation.

# Why the current implementation is insufficient

The existing shell exposes the product as:
- a tablist;
- a dropdown launcher;
- a focused module surface.

That architecture was useful for proving route/state behavior, but it now conflicts with the locked direction:
- no tabs;
- primary page access;
- one-card-per-module.

# Required implementation outcome

After this prompt:
- the live My Dashboard runtime no longer presents visible tab/dropdown module navigation;
- the shell no longer requires route-like active-module state to reveal Adobe core posture;
- the app is ready for Prompt 02 to replace the hero and Prompt 03 to consolidate Adobe.

# What done really looks like

- No visible `My Work Home` tab.
- No visible caret module launcher.
- No dropdown Adobe module menu.
- No focused Adobe surface required to understand Adobe state.
- The app still renders and the home surface remains mounted.
- Build/test debt is minimized and clearly reported.

# Verification

Run targeted checks suitable to changed files. At minimum:
```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

If the full test suite fails because later prompts have not yet completed the header/module redesign, isolate and explain only true transitional failures. Prefer keeping this prompt green.

# Documentation updates

Do not perform the full README refresh yet.  
If a short in-code comment or test description references the old active-tab product model and becomes false because of this prompt, reconcile it.

# Deliverables / exit criteria

Return:

1. **Implementation Decision:** PASS / PARTIAL / BLOCKED
2. **Files inspected**
3. **Files changed**
4. **Exact shell/product-model removals**
5. **Any preserved seams and why**
6. **Validation commands/results**
7. **Any work intentionally deferred to Prompt 02 or Prompt 03 only**
```
