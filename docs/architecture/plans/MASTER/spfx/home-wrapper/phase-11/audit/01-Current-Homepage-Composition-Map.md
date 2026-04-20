# Current Homepage Composition Map

All references below reflect repo truth on `main` at the time of this audit refresh.

## 1. Wrapper-owned entry stack
### Key seams
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`

### What this layer does
The wrapper owns the composed entry stack:
1. flagship hero
2. launcher band / priority-actions region
3. homepage shell

It also owns the outer envelope contract and max-width budget.

### What matters for this audit
- This layer is **not** the main blocker for the requested row recomposition.
- It already provides a shared outer-envelope contract and keeps the launcher aligned with the shell body.
- It should largely be preserved while the post-launcher shell is rebuilt.

## 2. Launcher band
### Key seams
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/homepage/data/usePriorityActionsData.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`

### What this layer does
Resolves device class from measured container dimensions, filters the launcher inventory, and partitions items into primary vs overflow.

### What matters for this audit
The launcher is already treated as a wrapper-owned, pre-shell surface. The row-composition work below the launcher does not require collapsing the launcher into the shell.

## 3. Shell orchestration
### Key seams
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/firstLaneResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellConformance.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/bandRecipes.ts`

### What this layer does
This is the real post-launcher composition engine. It owns band order, slot order, column span semantics, breakpoint / entry-state policy, row-sharing vs stacking, first-lane recomposition, and shell diagnostics/conformance reporting.

### Handedness gap (validated)
`DominanceRule` in `shellTypes.ts:146` is `'left-dominant' | 'equal' | 'single'`. There is no right-dominant dominance. Row 2 of the target cannot be expressed without adding orientation support at the type and validation layers and extending CSS column-template rules for a mirrored arrangement.

### Paired-ratio gap (validated)
`HbHomepageShell.module.css` encodes multiple ratios keyed on container width and recipe:
- `.bandPaired` base: `3fr 2fr` (≥1180px), `8fr 5fr` (≥1600px)
- `.bandRecipe_feature_pair`: `9fr 5fr` (≥1600px), `10fr 5fr` (≥1900px)
- `.bandRecipe_balanced_two_up`: `1fr 1fr` (≥1180px)
- `.bandRecipe_asymmetric_two_up`: `5fr 3fr` (≥1180px), `7fr 4fr` (≥1600px), `8fr 4fr` (≥1900px)
- `.bandRecipe_feature_utility_strip`: `4fr 2fr` (≥1180px), `7fr 3fr` (≥1600px), `8fr 3fr` (≥1900px)

The approximately-2:1 target is only reached at ≥1900px. Common laptop/desktop widths (1180–1599px) land at 1.5:1–1.75:1.

## 4. Preset and validation layer
### Key seams
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/bandRecipes.ts`

### Current preset shape (repo-truth)
`DEFAULT_PRESET` defines six bands in this order:

| # | Band id | Semantic role | Recipe | Primary slot | Secondary slot |
|---|---|---|---|---|---|
| 1 | `band-operational-spotlight` | `operational-spotlight` | `feature-pair` | Project Portfolio Spotlight (major) | Company Pulse (minor) |
| 2 | `band-communications-newsroom` | `communications-newsroom` | `balanced-two-up` | Company Pulse (major) | Leadership Message (minor) |
| 3 | `band-communications-editorial` | `communications-editorial` | `stacked-full` | Leadership Message (full) | — |
| 4 | `band-safety-field` | `operational-spotlight` | `asymmetric-two-up` | Safety Field Excellence (major) | Company Pulse (minor) |
| 5 | `band-people-culture` | `people-culture` | `stacked-full` | People & Culture Public (full) | — |
| 6 | `band-recognition` | `recognition` | `stacked-full` | HB Kudos (full) | — |

### Why it matters
- The default preset produces **six** bands, not three.
- Company Pulse is instantiated in three separate slots (`slot-company-pulse`, `slot-company-pulse-newsroom`, `slot-company-pulse-safety`).
- Leadership Message also appears twice (newsroom secondary + editorial full-width).
- HB Kudos is `stacked-full` on its own recognition band — never paired.
- People & Culture Public is `stacked-full` on its own people-culture band — never paired.
- The `feature-pair` recipe's `allowedSemanticRoles` = `['operational-spotlight', 'communications-newsroom']`, so Row 1 of the target (PPS + Kudos under operational-spotlight) requires Kudos to be legal in operational-spotlight — which it is not.

The preset proves the shell uses a formal, typed composition model. It also proves the current preset is internally inconsistent and authored around the wrong band taxonomy.

## 5. Occupant registry and legality rules
### Key seams
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`

### Validated occupant truth (repo truth)
- **Company Pulse** — `allowedSlotRoles: ['primary', 'secondary']`, `allowedBandSemantics: ['communications-newsroom', 'operational-spotlight']`, `firstLaneEligible: true` (rank 20), `pairedLayoutEligible: true`, `narrowestStablePairedWidth: 520`.
- **Leadership Message** — `allowedSlotRoles: ['primary', 'secondary']`, `allowedBandSemantics: ['communications-editorial', 'communications-newsroom']`, `firstLaneEligible: true` (rank 30), `pairedLayoutEligible: true`, `protectedConstraints: ['requires-editorial-frame']`.
- **Project Portfolio Spotlight** — `allowedSlotRoles: ['primary', 'secondary']`, `allowedBandSemantics: ['operational-spotlight']` only, `firstLaneEligible: true` (rank 10), `reorderDomain: 'locked'`, `protectedConstraints: ['locked-anchor-preferred']`, `narrowestStablePairedWidth: 560`.
- **People & Culture Public** — `allowedSlotRoles: ['primary']` only, `pairedLayoutEligible: false`, `fallbackWhenUnsafe: 'deny-pairing'`, `allowedBandSemantics: ['people-culture']` only, `firstLaneEligible: false`, `pairingRestrictions: ['hb-kudos']`, `protectedConstraints: ['people-culture-must-stack']`, `narrowestStablePairedWidth: 640–720`, `supportsCompact: false`.
- **HB Kudos** — `allowedSlotRoles: ['primary', 'secondary']`, `allowedBandSemantics: ['recognition']` only, `prominenceCeiling: 'contextual'`, `firstLaneEligible: false`, `pairingRestrictions: ['people-culture-public']`, `protectedConstraints: ['recognition-cannot-be-primary-anchor']`, `supportsCompact: true`, `supportsSummaryCollapse: true`, `narrowestStablePairedWidth: 520`.
- **Safety Field Excellence** — `allowedSlotRoles: ['primary', 'secondary']`, `allowedBandSemantics: ['operational-spotlight']` only, `prominenceCeiling: 'supporting'`, `supportsCompact: true`, `narrowestStablePairedWidth: 520`.

### Why it matters
This layer is the second major blocker after the preset. The requested pairings are illegal under current registry rules:

- **Row 1 (PPS + Kudos):** Kudos has to live in `operational-spotlight` and be allowed alongside a primary anchor. Neither is true today.
- **Row 2 (Safety small + Company Pulse large, right-dominant):** Safety must become legal in `communications-newsroom` (or the shell must accept operational-spotlight as a right-dominant band with CP as the large slot, which still requires Safety + communications-newsroom overlap or a new band semantic). Handedness support is also required.
- **Row 3 (Leadership + PCP):** People & Culture Public has to become `pairedLayoutEligible: true`, acquire secondary-slot eligibility, overlap with a Leadership-compatible band semantic, and the `people-culture-must-stack` protected constraint has to be replaced. The PCP↔Kudos bidirectional `pairingRestrictions` should also be reviewed even though Row 3 does not pair them.

## 6. Hosted zone wrappers
### Key seams
- `apps/hb-webparts/src/webparts/hbHomepage/zones/*.tsx`

### What this layer does
Each zone wrapper mounts the actual homepage application surface.

### What matters for this audit
The shell can only succeed if the hosted surfaces have credible narrow-mode behavior. For the requested target composition the real fit-risk candidates are People & Culture Public (today non-paired, `supportsCompact: false`, min widths too high) and — to a lesser degree — HB Kudos at narrower desktop widths. Kudos already reports `supportsCompact` and `supportsSummaryCollapse`, so the narrow-slot work there is validation rather than new capability.
