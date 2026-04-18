# Prompt 05 — Complete the Permission-Aware Admin Authoring Product

## Objective

Upgrade `PriorityActionsRailAdmin` from a technically capable editor into a genuinely reliable maintainer product.

By this point in the wave, the state model, validation layer, and shared/runtime surface behavior should already be stronger.
Use that stronger foundation to finish the admin product properly.

---

## First instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Repo seams to inspect

Primary seams:
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/priority-actions-rail-admin.module.css`
- `apps/hb-webparts/src/homepage/data/priorityActionsAdminState.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsValidation.ts`

Inspect as needed:
- any SharePoint permission or capability seam already available in the repo
- the rebuilt public/shared surface family and preview behavior
- any shared admin/product patterns that are genuinely appropriate to reuse

---

## Governing references

- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Checklist.md`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-15/HB-Central-Homepage-Perception-Targets.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`

---

## Current repo-truth problem

The admin already has meaningful structure, but it still falls short as a maintainer product:

- permission state is modeled but not integrated
- the action library is only a raw list, not a repeat-use authoring tool
- status treatment is weak for persisted/new/archived/invalid rows
- audience and device controls exist, but the workflow still reads as a local form stack more than a confident authoring product
- preview controls are not yet tightly coupled to honest public behavior
- the surface does not clearly communicate when a maintainer can view, edit, publish, reorder, or archive

---

## Required end state

Deliver an admin surface that:
- clearly distinguishes editable, read-only, and insufficient-permission states
- supports repeat maintainer use rather than one-off list mutation
- exposes the real authoring scope cleanly
- communicates row state and validation state clearly
- makes preview a trustworthy decision-making aid rather than an approximation

---

## Required tasks

### 1. Integrate real permission posture
Implement a real runtime permission model for the admin surface.

At minimum, the admin must be able to present:
- editable state
- read-only state
- insufficient-permission state for destructive/publish actions

Do not leave enabled controls visible when the user cannot legitimately perform the action.

### 2. Rework the authoring IA into a stronger maintainer workflow
Restructure the surface into clear regions, such as:
- band settings
- action library
- item editor
- validation / issues
- preview controls and preview panel
- save / discard / publish controls

The goal is not to build a generic SharePoint list editor.
The goal is a confident maintainer product.

### 3. Upgrade the action library
The action library should support repeat-use maintenance, not just basic selection.

Add the right level of:
- search
- filtering
- status segmentation
- clearer row summaries
- clearer row-state indicators
- faster scanning for invalid / newly created / archived / reordered entries

### 4. Improve item-editor ergonomics
Keep the editor compact and operational, but make important authored decisions clearer:
- link behavior
- audience targeting
- device visibility
- grouping
- scheduling
- priority / overflow intent
- icon/badge treatment

### 5. Keep preview honest and useful
Make the preview dock/control surface work as a real maintainer aid on top of the now-correct runtime behavior.
Do not leave it as decorative reassurance.

### 6. Preserve keyboard-safe behavior
Maintain or improve:
- keyboard selection
- reorder affordances
- dialog/action confirmation behavior
- focus treatment
- reduced-motion safety

---

## Hard constraints

- do not broaden into unrelated homepage editors
- do not regress the now-correct identity/lifecycle model
- do not add fake permissions if no real signal exists; wire a real seam or present an honest fallback posture
- do not let this become a generic property-pane clone

---

## Proof of closure

Return evidence showing:

1. how permission state is now derived and surfaced
2. the updated authoring information architecture
3. the improved action-library behavior
4. the improved item-editor ergonomics
5. why the preview is now more trustworthy
6. any tests or focused validation notes added
7. exact files changed
8. confirmation that unrelated webparts were not changed
