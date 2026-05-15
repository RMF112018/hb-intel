# 02 — Decision Lock and Closed Target Posture

## Purpose

This file closes all material product, information-architecture, layout, and UX decisions required for implementation. The local code agent must treat these decisions as binding unless current repo truth makes a specific implementation detail impossible. If that occurs, the agent must preserve the outcome, not reopen the product direction.

---

# Decision 01 — Primary Page Model

## Locked Decision

The My Dashboard runtime must present as a **single primary-page command surface**.

## Required Outcome

- No visible tab navigation.
- No visible module dropdown launcher.
- No user-required focused route to understand the Adobe Sign module.
- All production-relevant content for this reset appears directly on the primary page.

---

# Decision 02 — Rendered Module Inventory

## Locked Decision

Render exactly two primary production modules:

1. `My Projects`
2. `Adobe Sign Action Queue`

## Required Outcome

- Do not add filler cards.
- Do not retain standalone global summary cards solely to fill grid space.
- Do not invent future modules as placeholders.

---

# Decision 03 — Work Summary

## Locked Decision

`Work Summary` is removed as a standalone rendered card in the target primary-page UI.

## Required Outcome

- Remove it from primary rendering.
- If its underlying selector remains useful only to dead code/tests, clean it up.
- Do not move its existing telemetry into a new standalone substitute.

---

# Decision 04 — Source Readiness

## Locked Decision

`Source Readiness` is removed as a standalone rendered card.

## Required Outcome

- Source-state guidance belongs inside the owning module card.
- There is no generic readiness card on the primary page.

---

# Decision 05 — Adobe Sign Architecture

## Locked Decision

Adobe Sign becomes **one coherent module card** that owns all of its runtime states.

## Required Outcome

The single Adobe card handles:

- loading;
- authorization required;
- configuration required;
- principal/account unresolved;
- source unavailable;
- backend unavailable;
- partial data;
- connected with zero items;
- connected with actionable items.

There is no requirement for a focused Adobe surface in the target primary-page UX.

---

# Decision 06 — My Projects Architecture

## Locked Decision

My Projects remains one module card and changes from a full-width flagship block to a disciplined launch-pad card.

## Required Outcome

- It no longer uses default full-row dominance in the primary target composition.
- It retains direct launch actions to SharePoint and Procore.
- It internally handles:
  - loading;
  - empty;
  - partial;
  - unavailable;
  - principal-unresolved;
  - populated states.
- It compresses empty/unavailable states.

---

# Decision 07 — Header Model

## Locked Decision

Replace the existing telemetry-heavy hero with a compact production header.

## Exact Locked Copy

- Eyebrow: `My Dashboard`
- Title: `My Work`
- Support line: `Your personal launch pad for project access and work requiring attention.`

## Required Outcome

- No four-highlight telemetry strip.
- No governance microcopy lane at page-header level.
- No route-dependent hero identity shift.

---

# Decision 08 — Bento Grid Choreography

## Locked Decision

The primary page uses the existing bento/grid primitives with explicit target spans.

| Responsive mode | My Projects | Adobe Sign |
|---|---:|---:|
| `largeLaptop` | 7 | 5 |
| `desktop` | 7 | 5 |
| `ultrawide` | 7 | 5 |
| `standardLaptop` | 6 | 4 |
| `smallLaptop` | full | full |
| `tabletLandscape` | full | full |
| `tabletPortrait` | full | full |
| `phone` | full | full |

## Required Outcome

- Card order is static:
  1. My Projects
  2. Adobe Sign Action Queue
- On stacked modes, My Projects remains first.
- No runtime urgency-based card reordering in this phase.

---

# Decision 09 — Adobe Card Content Model

## Locked Decision

The Adobe card has one header and one stateful body.

### Card identity
- Eyebrow: `Adobe Sign`
- Title: `Action Queue`

### State badge labels
- `Connecting…` during OAuth start
- `Connect required`
- `Configuration required`
- `Account needs attention`
- `Temporarily unavailable`
- `Partial data`
- `Ready`

### Visible metrics
Metrics render only when source status is `available` or `partial`.

Metrics:
1. Pending agreements
2. Signature actions
3. Review actions

### Action list
When populated:
- show up to **5** action items;
- preserve action labels from existing read-model/view-model mapping;
- display sender and expiry when available.

### Handoff affordance
Use source-system handoff copy, not in-dashboard completion copy:
- `Open in Adobe Sign`
- `View all in Adobe Sign` where justified by data/pagination.

---

# Decision 10 — My Projects Card Content Model

## Locked Decision

The My Projects card becomes a disciplined launch pad.

### Card identity
- Eyebrow: `My Work`
- Title: `My Projects`
- Supporting sentence: `Open the projects you are assigned to in SharePoint or Procore.`

### Metrics
Display the existing summary metrics only when there is data worth summarizing.

When populated or partially populated, display a compact stats strip for:
1. Assigned Projects
2. Dual Launch Ready
3. SharePoint Ready
4. Procore Ready

When empty/unavailable/principal-unresolved with no usable records:
- hide the metrics strip;
- do not render a row of zero-value tiles.

### Launch list
- show up to **5** project rows by default;
- if more than 5 rows exist, render disclosure action:
  - collapsed: `View all My Projects`
  - expanded: `Show fewer`
- retain direct action slots:
  - SharePoint
  - Procore
- retain role chips with overflow behavior.

---

# Decision 11 — Copy Posture

## Locked Decision

Copy must be:

- concise;
- employee-facing;
- action-oriented;
- truthful about blocked states;
- free of implementation jargon where not necessary.

## Required Outcome

Do not foreground:
- “source health” as a page concept;
- “read-only work visibility” as page-level banner copy;
- “queue visibility only” as page-level banner copy;
- developer/test-bed phrasing.

---

# Decision 12 — Obsolete Runtime Artifact Removal

## Locked Decision

The local agent must remove or stop rendering obsolete runtime artifacts that materially enforce the old UI product model.

### Must be removed from the rendered product model
- visible primary nav tablist;
- visible module dropdown launcher;
- route-dependent hero branching;
- focused Adobe route requirement;
- standalone Work Summary card;
- standalone Source Readiness card;
- standalone Adobe queue state card;
- standalone Adobe connection guidance card.

### Preservation rule
Pure model utilities may remain only if current repo truth proves they are still actively required by non-obsolete runtime seams or by unchanged shared data contracts. Dormant UI runtime artifacts must not be retained merely because they already exist.

---

# Decision 13 — Validation Standard

## Locked Decision

The final implementation must pass:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

The agent must additionally update tests to prove the new UI posture and remove tests that solely encode the old rejected architecture.
