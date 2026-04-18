# 05 — Closure Proof Checklist

Use this as the minimum closure bar after the prompt sequence lands.

## A. Structural correctness
- [ ] Admin draft items have stable identity that survives reorder/add/remove.
- [ ] Persisted SharePoint item IDs are no longer inferred from current array position.
- [ ] Reorder behavior is deterministic and persists to the correct rows.
- [ ] Archive / disable semantics are explicit and failure-safe.
- [ ] Add/edit/reorder/archive sequences are covered by regression tests.

## B. Admin product quality
- [ ] Admin surface has clear authoring regions, not a monolithic form wall.
- [ ] Search/filter and edit affordances are credible for maintainers.
- [ ] Dirty/save/discard model is coherent.
- [ ] Permission/read-only states are implemented and visible.
- [ ] No browser-native prompt/confirm shortcuts are used as the primary UX.

## C. Shared/public surface quality
- [ ] Breakpoint behavior is deliberate and container-aware where required.
- [ ] Desktop/laptop overflow is a real anchored overflow pattern.
- [ ] Phone overflow is not a tiny inline accordion pretending to be a mobile solution.
- [ ] Grouping / segmented / hybrid behavior is either implemented or honestly narrowed without stale claims.
- [ ] Preview and public surface ride the same shared behavior model.

## D. Contract/runtime truth
- [ ] Modeled config fields are either implemented or removed from closure claims.
- [ ] `bandKey` resolution is correct in config reads.
- [ ] Duplicate key / duplicate active-row risks are surfaced appropriately.
- [ ] Validation blocks unsupported or inconsistent states before save/publish.
- [ ] Preview/public parity is covered by tests.

## E. Styling and doctrine closure
- [ ] Hardcoded styling is materially reduced or eliminated where unjustified.
- [ ] Public rail no longer reads like a tinted card/list strip.
- [ ] Admin no longer reads like a polite enterprise panel stack.
- [ ] Focus indicators are visible and intentional.
- [ ] Reduced-motion behavior is preserved.
- [ ] Contrast has been checked against the required minimums.

## F. Host/runtime proof
- [ ] Public rail verified in desktop, laptop, tablet, and phone-like widths.
- [ ] Overflow behavior proof captured.
- [ ] Keyboard/focus proof captured.
- [ ] Edit-mode / partial-config / empty / error states reviewed.
- [ ] Admin workflow proof captured for add/edit/reorder/archive/save/discard.
- [ ] Permission-state proof captured.
- [ ] Manifest/runtime settings verified and any drift corrected.

## G. Documentation integrity
- [ ] Closure checklist and scorecard reflect current repo truth.
- [ ] No stale docs claim pass status that the code no longer supports.
- [ ] Final documentation is explicit about anything still open.
