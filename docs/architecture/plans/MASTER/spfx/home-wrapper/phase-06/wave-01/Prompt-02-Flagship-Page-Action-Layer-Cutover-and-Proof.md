# Prompt 02 — Flagship Page Action-Layer Cutover and Proof

## Objective

Make the governed `PriorityActionsRail` the **actual live flagship-page action layer** and eliminate dependency on any OOB Quick Links row for the flagship homepage experience.

This prompt is not about building Priority Actions from scratch. It is about **live page cutover, migration proof, and closure**.

## Why this prompt exists now

The attached Wave 01 package correctly identified the action-layer problem, but current repo truth changes the implementation shape:

- the public rail already exists
- the SharePoint list-backed readers already exist
- the admin authoring surface already exists

The remaining question is whether the **flagship page itself** is correctly cut over and provably no longer depends on an equal-weight OOB Quick Links row.

## Repo-truth findings to respect

- `PriorityActionsRail` already exists as a production webpart.
- `usePriorityActionsData`, `priorityActionsConfigListSource`, and `priorityActionsItemsListSource` already exist.
- `PriorityActionsRailAdmin` already exists.
- list schema docs still contain stale “adapter pending” language and may need cleanup if touched.

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- any homepage page-authoring / provisioning / template artifact that governs the flagship page composition

## External best-practice guidance to apply

- Treat the action layer as a ranked top-tasks system, not a directory.
- Keep action affordances stable across breakpoints.
- Preserve authoring through governed source-of-truth seams rather than manual page-body editing.

## Exact files / seams to inspect first

- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- `apps/hb-webparts/src/homepage/data/usePriorityActionsData.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsConfigListSource.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsItemsListSource.ts`
- `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`
- `apps/hb-webparts/src/mount.tsx`
- `tools/pnp-runner-local/**` if page provisioning or seeding is involved
- any page-template, page-authoring, or provisioning artifact that still places OOB Quick Links on the flagship homepage
- touched list-schema docs under `docs/reference/sharepoint/list-schemas/hbcentral/lists/`

Do **not** re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current problem state

The repo already contains a governed priority-actions product, but the flagship homepage closure is not complete until all of the following are true:

- the flagship page is actually using the governed rail
- the prior quick-link inventory is captured and reconciled
- breakpoint-visible-action behavior is the governed one
- the old OOB Quick Links dependency is removed from the flagship experience
- documentation and provisioning truth match implementation truth

## Required future state

- `PriorityActionsRail` is the live flagship action layer.
- Any prior quick-link inventory needed for continuity has been migrated into the governed Priority Actions model.
- The flagship page no longer relies on an OOB Quick Links row for this experience.
- Authors / maintainers manage the action layer through the governed list/admin path, not ad hoc page-body editing.
- Touched docs no longer claim public list-read seams are still pending.

## Implementation requirements

1. **Prove the current flagship-page composition state first.**
   - Identify where the flagship page composition is currently authored or provisioned.
   - Do not assume repo components equal page-level cutover.

2. **Capture the current quick-link inventory if the legacy row still exists.**
   - Produce a concrete inventory source.
   - Reconcile destination URLs, labels, order, and any grouping intent.

3. **Complete the cutover cleanly.**
   - Remove the OOB Quick Links dependency from the flagship page.
   - Replace it with the governed rail.
   - Preserve maintainability through the list/admin surface.

4. **Keep source-of-truth coherent.**
   - Avoid duplicate competing action sources.
   - Avoid manual page-body duplication of actions already governed elsewhere.

5. **Clean up touched doc drift.**
   - If you touch the Priority Actions list/read/admin seams, update docs that still describe public readers as pending.

## Definition of done

This prompt is done only when:

- the flagship page no longer depends on an OOB Quick Links row for its live action layer
- `PriorityActionsRail` is the live action layer
- migrated action inventory is accounted for and governed
- page-level or provisioning-level proof exists for the cutover
- any touched docs accurately reflect the live code state

## Proof of closure required in the final response

Provide all of the following:

- the exact prior action inventory source used
- where the flagship page composition was changed
- exact files changed
- proof that the flagship page no longer relies on OOB Quick Links
- the final governed action ordering and overflow posture at key breakpoints
- any touched docs updated and why

## Constraints

- Do not rebuild Priority Actions from scratch.
- Do not create a second action source-of-truth.
- Do not leave the old OOB row in place “temporarily.”
- Do not mutate unrelated homepage modules.
- Do not skip documentation cleanup if touched docs become knowingly stale.
