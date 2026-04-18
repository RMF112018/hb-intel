# Prompt 03 — Rebuild the Shared Command-Band Surface Family

## Objective

Rebuild the shared `HbcPriorityRail` family so it behaves like a genuine homepage command-band system instead of a premiumized list inside a tinted card.

This prompt closes the shared primitive layer.
It is not enough to cosmetically restyle the current surface.

---

## First instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Repo seams to inspect

Primary seams:
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailAction.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailPreviewSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`

Inspect as needed:
- `packages/ui-kit/src/homepage.ts`
- any adjacent shared primitives that should be reused legitimately
- the current public consumer in `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`

---

## Governing references

- `docs/architecture/plans/MASTER/spfx/homepage/phase-15/HB-Central-Homepage-Perception-Targets.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Checklist.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Scorecard.md`

Use the design target that Priority Actions must feel like a command surface — dense, operational, urgent, tool-like, and visually distinct from editorial/card modules.

---

## Current repo-truth problem

The current shared family has solid reuse value, but it still falls short in several ways:
- visible actions are still flat list rows
- overflow is an inline expandable panel with simplistic treatment
- grouping concepts exist but are not meaningfully expressed
- the surface API is thinner than the authored config model
- the visual grammar still reads as card/list-strip more than command band
- desktop/tablet/phone behaviors do not differ enough compositionally

---

## Required end state

Upgrade the shared family into a real command-band primitive set that can credibly support:
- stronger primary-action hierarchy
- grouped or segmented action expression where data supports it
- richer overflow treatment by breakpoint/layout mode
- mobile/compact behavior that is not just “same list, slightly smaller”
- preview reuse without duplicating render logic
- accessibility-safe interaction patterns

---

## Required tasks

### 1. Expand the shared surface API honestly
If the current API cannot represent the target command-band variants, extend it.

That may include:
- grouped action inputs
- richer overflow variant inputs
- stronger layout-mode modeling
- more explicit visible-vs-overflow composition control

Do not fake support through brittle ad hoc props.

### 2. Rework the visible-action hierarchy
The first visible actions should feel intentionally prioritized, not just listed first.

That does **not** mean over-decorating the rail.
It means building clearer hierarchy into:
- row anatomy
- spacing rhythm
- action affordance
- urgency treatment
- grouped composition where appropriate

### 3. Rebuild overflow treatment
The current overflow treatment is too primitive for the intended end state.

Rebuild it so the overflow interaction model is:
- deliberate
- keyboard-safe
- semantics-correct for the chosen interaction pattern
- visually coherent with the command-band posture

If you keep disclosure behavior, meet disclosure semantics fully.
If you move to a menu-button or anchored command surface, meet that pattern fully.
Do not leave half-stated ARIA.

### 4. Strengthen compact/mobile treatment
Phone and compact modes should not simply be “same surface with tighter padding.”
Create a more intentional compact behavior that still preserves scannability and action confidence.

### 5. Preserve shared-family discipline
Public runtime and admin preview must continue to reuse this shared family.
Do not fork the rendering model into separate public/admin implementations.

### 6. Add or update focused tests where appropriate
Add tests for the shared surface API and key rendering decisions where reasonable.
At minimum, ensure the public/admin consumer prompts can rely on a stable shared primitive contract after this work.

---

## Accessibility and interaction requirements

The rebuilt surface must preserve or improve:
- keyboard access
- focus visibility
- reduced-motion behavior
- clear external-link signaling
- safe overflow semantics

Use established accessibility patterns for whichever overflow/control pattern you implement.
Do not invent a semi-accessible hybrid.

---

## Hard constraints

- do not imitate Kudos or unrelated homepage surfaces
- do not broaden into unrelated ui-kit families
- do not regress import discipline; keep the family reachable through `@hbc/ui-kit/homepage`
- do not collapse the command-band back into a generic card/list aesthetic

---

## Proof of closure

Return evidence showing:

1. the new shared surface API
2. the chosen overflow interaction model and why
3. how the visible-action hierarchy is now stronger
4. how compact/mobile treatment improved
5. how reuse between public and preview remains intact
6. exact files changed
7. confirmation that the family still routes through governed ui-kit entrypoints
