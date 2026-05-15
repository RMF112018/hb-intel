# Prompt 02 — Replace Hero Telemetry with Compact Production Header

```markdown
# Objective

Replace the current telemetry-heavy, route-dependent hero band with the locked compact production header for My Dashboard / My Work.

# Repo-truth context

Start from Prompt 01's single-page shell posture.

Primary seams to inspect and likely change:
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/shell/MyWorkShell.module.css`
- `apps/my-dashboard/src/shell/MyWorkHeroBand.tsx`
- `apps/my-dashboard/src/shell/MyWorkHeroBand.module.css`
- `apps/my-dashboard/src/state/myWorkHeroViewModel.ts`
- `apps/my-dashboard/src/preview/myWorkHeroPreview.ts`
- any tests asserting the old hero highlights/governance lane.

Do not reread files that are already in your active context unless they changed, context is stale, or scope expanded.

# Architectural guardrails

1. The compact header is fixed product direction:
   - Eyebrow: `My Dashboard`
   - Title: `My Work`
   - Support line: `Your personal launch pad for project access and work requiring attention.`
2. Do not preserve the old four-highlight telemetry strip in the rendered target path.
3. Do not preserve page-level governance microcopy in the rendered target path.
4. Do not create a route-dependent Adobe-focused header variant.
5. Preserve refined visual polish; do not replace the hero with a raw plain `<h2>` stack unless styled to the target product level.

# Implementation instructions

1. Replace the rendered hero layer with a compact production header component or equivalent shell-local composition.
2. Render exactly the locked header copy.
3. Reduce vertical real estate materially versus the current hero band.
4. Remove rendered highlight metrics:
   - actionable items;
   - connected sources;
   - source health;
   - last refreshed;
   - queue state;
   - action system.
5. Remove rendered governance microcopy lane from the header.
6. Remove or deprecate route-dependent hero view-model branching if no longer needed.
7. Clean up preview/test seams that solely support the rejected hero product model.
8. Preserve theme variables and visual family alignment where useful.

# Why the current implementation is insufficient

The current hero is not merely a header. It is a high-salience runtime telemetry surface. That makes the page feel like a state monitor and pushes useful module content downward. The target dashboard must open with concise identity, not diagnostic exposition.

# Required implementation outcome

After this prompt:
- My Dashboard begins with a compact production header;
- no telemetry strip or governance line remains in the visible target header;
- the page immediately transitions into module cards.

# What done really looks like

The first dashboard-owned UI block below SharePoint chrome reads:

```text
My Dashboard
My Work
Your personal launch pad for project access and work requiring attention.
```

It is styled, compact, and materially less dominant than the old hero.

# Verification

Run:
```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

Tests must be updated to assert the new header copy and the absence of obsolete hero telemetry in the rendered target path.

# Documentation updates

No full README refresh yet.  
Reconcile any component comments or tests that still describe the hero as a runtime status surface if those comments now lie.

# Deliverables / exit criteria

Return:

1. **Implementation Decision:** PASS / PARTIAL / BLOCKED
2. **Files inspected**
3. **Files changed**
4. **Header target rendered**
5. **Old telemetry/governance surfaces removed from rendered path**
6. **Validation commands/results**
```
