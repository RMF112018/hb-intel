# Doctrine and Benchmark Assessment

## Governing posture applied
Primary authority:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Benchmark authority:
- `docs/reference/spfx-surfaces/benchmark/README.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`

## What the current shell already does well
### A. Host-aware shell separation
The implementation cleanly separates hero, launcher band, and shell instead of collapsing them into one brittle webpart.

### B. Container-aware measurement
The shell measures authoritative container width and subtracts shell insets before selecting entry state. This is materially better than a naive viewport-width media-query approach and is already backed by container queries in `HbHomepageShell.module.css`.

### C. Typed composition model
The shell uses a real preset, band recipe registry (`bandRecipes.ts`), occupant registry, validation pipeline, protected decisions, and conformance reporting. That is the correct foundation for deterministic homepage composition.

### D. Surface curation is already bounded
The active registry is already limited to the six homepage application families that matter here. The curation problem is largely solved; the composition problem is not.

### E. Recipe-specific paired ratios already exist
The shell does not have a single paired ratio. `feature-pair`, `balanced-two-up`, `asymmetric-two-up`, and `feature-utility-strip` each carry container-query-driven ratios that scale with width. A true ~2:1 ratio is reachable (`feature-pair` = 10fr 5fr and `asymmetric-two-up` = 8fr 4fr at ≥1900px). The ratio work needed is **tuning** rather than **introducing** recipe-specific ratios.

## Where the current shell violates or under-delivers against doctrine

### A. The default preset is internally inconsistent
`DEFAULT_PRESET` duplicates Company Pulse across three bands and Leadership Message across two, and pins HB Kudos / People & Culture Public to standalone `stacked-full` bands. This is not the approved curated three-row cadence and would not survive a conformance review on its own terms, never mind against the locked target.

### B. Alternating handedness is missing
`DominanceRule = 'left-dominant' | 'equal' | 'single'` (`shellTypes.ts:146`). There is no `right-dominant`. Row 2 of the target (small-left / large-right) is structurally inexpressible today.

### C. The paired ratio is too weak at the widths that matter most
At the common laptop/desktop container band (1180–1599px) the effective paired ratios land between 1.5:1 and 1.75:1. A true ~2:1 is only reached at ≥1900px. Doctrine asks for a decisive premium dominance across the non-handheld range, not only at ultrawide.

### D. Application-level narrow-fit governance is incomplete
People & Culture Public is explicitly not `pairedLayoutEligible`, has no compact mode, and sets `fallbackWhenUnsafe: 'deny-pairing'` plus `protectedConstraints: ['people-culture-must-stack']`. HB Kudos already advertises compact and summary-collapsed modes; its blocker is band-semantics and prominence, not comfort.

### E. Protected band semantics preserve the current arrangement
Protected decisions currently defend the triplicated-Company-Pulse / Kudos-stacked-full arrangement. The governance layer is protecting the wrong composition.

### F. Pairing restrictions encode stale rules
`people-culture-public.pairingRestrictions: ['hb-kudos']` and `hb-kudos.pairingRestrictions: ['people-culture-public']` form a bidirectional lock. The target composition does not pair them, but the restriction is still a live governance claim that should be revalidated as part of the rewrite rather than silently retained.

## Benchmark interpretation
The benchmark package does **not** require cloning HB Kudos. It requires equal implementation rigor, deliberate persona-fit execution, credible host behavior, and proof-backed closure.

For this homepage objective, benchmark compliance means:
- the shell composition must feel deliberate and premium,
- the six approved surfaces must read as curated rather than passively stacked,
- the small-slot surfaces must remain stable and useful at 1180–1599px, not only at ≥1900px,
- closure must be proven with breakpoint-aware evidence (conformance output, tests, and hosted screenshots).
