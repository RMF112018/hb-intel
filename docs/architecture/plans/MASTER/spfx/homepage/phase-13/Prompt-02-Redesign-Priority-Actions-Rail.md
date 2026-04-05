# Prompt 02 — Redesign Priority Actions Rail

## Objective

Redesign `PriorityActionsRail` so it becomes a clearly premiumized action surface rather than a grouped list of text links with appended badges.

The final result must make “what I need to do now” feel immediate, deliberate, and product-grade while preserving the current data/config behavior.

---

## First Instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Required Starting Context

Use the repo truth as modified by Prompt 01.

At minimum, work from:

- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- any related files in `apps/hb-webparts/src/webparts/priorityActionsRail/`
- `apps/hb-webparts/src/homepage/shared/HomepageRailShell.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageUtilityDenseGroup.tsx`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `packages/ui-kit/src/homepage.ts`
- any shared action-row / icon / CTA / metadata primitives available after Prompt 01

Inspect adjacent files as needed.

---

## Required Tasks

### 1. Replace plain link-list presentation
Convert the grouped actions into a true action-surface pattern.

The target should feel like:
- prioritized action rows or compact action tiles
- stronger click/tap affordance
- clearer separation between title, supporting description, and status
- visibly intentional hierarchy

Do not leave the surface reading like links dropped into a group container.

### 2. Improve primary-action hierarchy
Where the current data supports it, make the most important actions feel primary without overcomplicating the authoring model.

This may include:
- a stronger first row treatment
- a “due / attention / requires approval” emphasis pattern
- a more deliberate status chip arrangement

Do not invent backend ranking logic that does not exist.

### 3. Improve status and metadata handling
Badges, due-state labels, and action descriptions should feel integrated rather than appended.

Create a cleaner row anatomy:
- action title
- supporting context
- status / due / urgency signal
- optional iconography
- optional directional affordance

### 4. Improve focus, hover, and interaction clarity
The action surface should feel more product-grade in interaction without becoming flashy.

Keep:
- visible focus
- reduced motion support
- strong hover/pressed affordances where appropriate

### 5. Preserve all existing behavior
Keep:
- config normalization
- active audience filtering
- loading states
- empty states
- author-safe defaults
- existing link behavior
- SPFx-safe rendering behavior

---

## Design Intent

The target is not “more decoration.”

The target is:
- faster scanning
- clearer priorities
- stronger action confidence
- less visual passivity
- less resemblance to a generic intranet utility list

---

## Hard Constraints

- do not introduce shell chrome
- do not create lane-boundary violations
- do not rewrite the authoring schema unless strictly necessary
- do not regress action accessibility
- do not create a visually heavy enterprise-dashboard widget; this is still a homepage utility surface

---

## Deliverables for This Prompt

By the end of this prompt, `PriorityActionsRail` should be materially redesigned and clearly stronger than current repo truth.

---

## Acceptance Criteria

- the rail no longer reads as grouped text links with badges attached
- actions have stronger row/tile affordance and clearer hierarchy
- status/metadata handling is integrated and intentional
- all functional behavior remains intact
- lint/build/type-check remain viable

---

## Completion Note

At the end, produce a concise completion note that states:

- which files were materially changed
- what action-surface pattern was adopted
- any shared primitive extensions used or added
- any follow-ons intentionally deferred
