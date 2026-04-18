# Prompt 04 — Align Public Runtime and Preview With Responsive Behavior

## Objective

Bring the public `PriorityActionsRail` webpart and the admin preview into honest alignment with the authored config model.

The current system still understates or collapses the contract:
- layout modes are reduced
- preview is too coarse
- device behavior is viewport-driven and simplistic
- grouping metadata is not expressed meaningfully

This prompt closes the consumer-integration layer after the shared family is rebuilt.

---

## First instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Repo seams to inspect

Primary seams:
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/usePriorityActionsData.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsConfigListSource.ts`
- the rebuilt `packages/ui-kit/src/HbcPriorityRail/*`

Inspect as needed:
- any shared responsive helpers
- any host/container measurement helpers already present in repo
- any preview-specific helper that should be extracted rather than duplicated

---

## Governing references

- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-15/HB-Central-Homepage-Perception-Targets.md`

---

## Current repo-truth problem

Examples of the current gap:
- config declares desktop/tablet/mobile layout options broader than the current public mapping
- preview exposes only `desktop`, `tablet`, and `phone`, while the runtime contract distinguishes five device classes
- the current public device-class resolver is based on `window.innerWidth`, not on a more container-aware or host-aware responsive model
- runtime layout selection still compresses authored intent into a narrower set of actual behaviors
- group metadata is carried in items but not yet expressed as a real composition behavior

This leaves the admin preview and public runtime only partially truthful.

---

## Required end state

The public rail and admin preview must honor the authored model honestly.

That does **not** require slavishly implementing every decorative interpretation of the config.
It does require that the runtime and preview no longer advertise modes they do not meaningfully express.

The final result must provide:
- truthful layout-mode mapping
- truthful breakpoint/device mapping
- preview parity with public behavior
- more container-aware responsive behavior
- meaningful group/segmentation behavior where the authored data supports it

---

## Required tasks

### 1. Replace coarse responsive logic with more truthful behavior
Move away from a purely global viewport-width mental model for this component.

Use a more host-/container-aware approach where appropriate, such as:
- measured container width
- `ResizeObserver`
- CSS/container-query coordination
- or another explicit, host-safe responsive model

The command band is a SharePoint-hosted component and should respond to the width it actually occupies.

### 2. Honor layout modes honestly
Review the config contract against the rebuilt shared family and implement honest behavior for the supported modes.

If a mode remains intentionally normalized into another mode, make that normalization explicit and truthful.
Do not leave silent behavior collapse.

### 3. Bring preview into parity with public truth
The preview should no longer be a coarse approximation.

It must expose the relevant device/layout states needed for maintainers to understand public behavior honestly.
Do not leave the preview at three simplistic device toggles if the runtime is materially richer.

### 4. Express grouping where authored data supports it
If items carry valid grouping metadata, the public runtime and preview should be able to express it meaningfully rather than flattening everything.

### 5. Keep the runtime safe
Preserve:
- list-driven render behavior
- audience/schedule filtering
- loading/empty/error states
- SharePoint host-safe rendering
- read-after-write truth from the admin flow

### 6. Add or update focused tests
Add tests or targeted proof for the new mapping logic so the preview and runtime cannot drift silently again.

---

## Hard constraints

- do not redesign the admin IA here
- do not change unrelated homepage zones
- do not fake preview parity; either implement truthful parity or narrow the advertised state honestly
- do not regress loading, empty, or error states

---

## Proof of closure

Return evidence showing:

1. how device and container responsiveness now work
2. how authored layout modes are now mapped honestly
3. how preview parity improved
4. how grouping is now expressed or safely normalized
5. any tests added for responsive/layout mapping
6. exact files changed
7. confirmation that unrelated homepage surfaces were not changed
