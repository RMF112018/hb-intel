# Prompt 04 — Align Contracts, Validation, and Preview with the Live Runtime

## Objective

Eliminate contract/runtime drift across list reads, normalization, validation, preview, and public rendering so the modeled command-band vocabulary becomes truthful.

## Current issue / future-state gap

The live implementation still carries meaningful drift between what the contracts and schemas say is supported and what the runtime actually does.

Examples already visible in `main`:
- `IconKey` is modeled and edited but the public rail resolves icons from badge variant, not an icon registry.
- group data is modeled but not rendered as grouped public structure.
- config layout modes are broader than the live behavior.
- preview derives visibility/overflow through simplified slice logic instead of the full public resolution path.
- `OpenExternalInNewTabByDefault` is modeled at config level but not clearly honored end-to-end.
- `fetchPriorityActionsConfig(siteUrl, bandKey)` does not use `bandKey` in the network filter.
- duplicate `actionKey` rows are silently deduped by normalization instead of being surfaced explicitly.

## Intended future state

The modeled contract is trustworthy:
- queries, normalization, validation, preview, and public runtime agree on supported behavior
- band-key resolution is correct
- duplicate / invalid data is surfaced appropriately instead of disappearing silently
- icon, grouping, layout, visibility, and external-link behavior are either fully implemented now or narrowed honestly
- preview and public runtime share the same authoritative render-model logic to the greatest practical extent

## Repo seams / files / symbols to inspect

Inspect at minimum:

- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsValidation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsConfigListSource.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsItemsListSource.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- any icon registry/helper seams you add or correct

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Governing files / doctrine / specs

- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Required implementation outcomes

1. Make a hard repo-truth decision for each modeled behavior:
   - implement it now
   - or narrow the code/docs honestly
   - but do not leave broad modeled claims unsupported

2. Correct config read behavior so band-specific resolution is truthful and does not rely on an under-filtered network query.

3. Decide and implement the icon strategy:
   - real icon registry / icon mapping behavior
   - or contract narrowing
   - but do not leave `IconKey` as a dead authoring field

4. Align preview with the public render-model logic:
   - same visible/overflow logic
   - same grouping/layout logic where possible
   - same external-link behavior and heading/badge semantics

5. Expand validation so it blocks materially inconsistent states, including where appropriate:
   - duplicate active config rows
   - duplicate or invalid action keys
   - invalid schedule windows
   - unsupported icon keys
   - impossible or incoherent visibility / mode combinations
   - missing required data for selected modes

6. Add tests for:
   - config band-key resolution
   - duplicate handling
   - preview/public parity
   - any newly implemented icon/group/layout behavior
   - validation blocking of unsupported states

## Supporting development concepts to apply materially

- contract truth over aspirational modeling
- shared render-model construction for preview/public parity
- explicit validation of supported states
- data integrity surfacing instead of silent normalization loss

## Proof of closure

Return:

- the contract/runtime drift items found
- which ones were implemented versus narrowed
- the validation rules added or strengthened
- the query/normalization changes made
- the preview/public parity strategy
- the tests added or updated
- confirmation that the runtime no longer silently advertises unsupported behavior

## Boundaries / anti-drift rules

- Do not weaken the contract simply to avoid implementation work if the behavior belongs in the intended end state.
- Do not keep dead authoring fields alive without a clear reason.
- Do not hide duplicates or invalid states silently if they can mislead maintainers.
- Do not leave preview as an approximation while claiming shared-fidelity closure.
