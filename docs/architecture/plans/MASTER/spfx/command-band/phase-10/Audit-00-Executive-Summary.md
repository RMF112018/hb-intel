# Audit-00 — Executive Summary

## Objective

Evaluate the attached Priority Actions audit and implementation-prompt packages against the real live `main` branch and produce a materially stronger combined package.

## Executive conclusion

The attached packages were **directionally right but not sufficiently complete**.

They correctly recognized that the homepage no longer renders its hosted launcher through the old flagship `PriorityActionsRail` path and that the real homepage UX is now governed by:

- `HbHomepageEntryStack`
- `HbHomepageLauncherBand`
- `priorityActionsLauncherAdapter`
- `HbcHomepageLauncher`

They also correctly identified three real weaknesses that remain in `main`:

- weak icon semantics
- oversized equal-width launcher chips
- under-designed overflow

However, the attached packages still under-described the actual remaining work.

## Most important corrections introduced by this package

### 1. The adapter problem is larger than the old package stated

The key current technical weakness is not only visual. The homepage adapter strips the normalized contract down to a five-field chip model.

That means the launcher currently discards or underuses important normalized semantics such as:

- `iconKey`
- `groupKey`
- `groupTitle`
- `openInNewTab`
- richer priority and service identity signals

The result is a visually weaker and semantically poorer launcher than the source data can support.

### 2. The repo still contains authoring/governance drift from the transition

The current launcher implementation tears down the authored layout matrix in practice, but the authoring contracts still expose layout/cap knobs that the homepage path no longer genuinely obeys.

That is not just historical residue — it creates governance ambiguity for future work.

### 3. The visible-count rules are internally inconsistent

The launcher count rules are not currently governed from a single clean authority. Different layers still encode different phone-count behavior.

That contradiction was not explicitly surfaced in the prior package and must now be corrected.

### 4. Link semantics are still under-modeled

The normalized items preserve both `isExternal` and `openInNewTab`, but the homepage chip path effectively reduces new-tab behavior to a simpler externality signal.

That is a closure gap because the data contract already carries more precise intent.

### 5. Label clarity and truncation were under-treated

The current chip layout depends heavily on single-line truncation. The prior package mentioned visual weakness, but it did not isolate label clarity, truncation rescue, and tooltip/title behavior as a required closure unit.

That must now be explicit.

## Strong seams that should be preserved

- wrapper-owned entry-stack placement between hero and shell
- `usePriorityActionsData` data loading + cache behavior
- audience filtering
- schedule filtering
- device filtering
- menu vs sheet overflow-mode distinction
- inspectable runtime markers on the launcher root

## Final recommendation

Do **not** treat this as a spacing pass.

Treat it as a **targeted structural rebuild of the homepage launcher surface family**, while preserving the good wrapper/data/host seams and removing governance contradictions introduced during the rail-to-launcher transition.
