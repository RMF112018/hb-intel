# Recommended Implementation Waves

## Wave 01 — Shell governance and row-model replacement
### Goal
Make the shell capable of expressing the requested three-row composition cleanly and deterministically.

### Scope
- replace `DEFAULT_PRESET` with the locked three-row model and remove duplicate-occupant slots,
- add `right-dominant` to `DominanceRule` plus preset schema / validation / conformance / CSS support,
- tune paired ratios at the 1180px and 1600px container tiers to read closer to ~2:1 without regressing ≥1900px,
- legalize the requested pairings in the occupant registry (HB Kudos in `operational-spotlight`, Safety in `communications-newsroom` or right-dominant operational-spotlight, PCP as `pairedLayoutEligible` secondary),
- re-validate or retire the PCP↔HB Kudos `pairingRestrictions`,
- re-baseline `protectedDecisions.ts`,
- extend `shellConformance.ts` and `__tests__` with row-order / handedness / membership / ratio / stack-fallback proofs.

### Why this comes first
Until the shell can express the target arrangement, child-surface fit work has no stable target to fit against. The live preset is also internally inconsistent today (Company Pulse triplicated, Kudos/PCP stacked-full), so the preset replacement cleans up real defects that exist regardless of the target recomposition.

### Authoritative plan documents
`../wave-01/` carries the scoped execution prompts:
- `Prompt-01-Replace-Default-Preset-With-Locked-Three-Row-Model.md`
- `Prompt-02-Add-Band-Handedness-And-True-Large-Small-Ratio-Support.md`
- `Prompt-03-Revise-Occupant-Governance-To-Legalize-Target-Pairings.md`
- `Prompt-04-Add-Shell-Proof-And-Closure-Checks.md`

## Wave 02 — Hosted-surface fit hardening
### Goal
Make the subordinate-slot surfaces actually stable in the new composition across the non-handheld width range.

### Scope
- People & Culture Public: introduce a real compact mode and validate at the Row 3 small-right slot,
- HB Kudos: premium tuning + validation in the existing `compact` / `summary-collapsed` modes for the Row 1 small-right slot,
- Safety + Newsroom / Company Pulse: validate the Row 2 pairing end-to-end,
- breakpoint-aware screenshot and conformance proof.

### Why this is separate
This work crosses from shell governance into child-surface maturity. It should be sequenced after the shell stops encoding the wrong row model and after governance accepts the pairings that Wave 02 is validating.

### Authoritative plan documents
`../wave-02/` carries the scoped execution prompts:
- `Prompt-01-Harden-HbKudos-For-Secondary-Slot-Use.md`
- `Prompt-02-Harden-People-Culture-For-Secondary-Slot-Use.md`
- `Prompt-03-Validate-Newsroom-And-Safety-Pairing-And-Close-The-Homepage.md`

## Closure criteria
The work is complete only when:
- the default live shell renders exactly the approved six surfaces and no others below the launcher,
- each of the six surfaces appears exactly once in the preset,
- row order matches the locked target sequence,
- row handedness alternates correctly (left-dominant, right-dominant, left-dominant),
- non-handheld widths preserve the intended three-row premium rhythm with paired ratios reading close to ~2:1 from 1180px up,
- handheld widths fall back to a disciplined single column,
- conformance output and `__tests__` coverage prove row order, handedness, occupant membership per row, ratio behavior, and stack fallback,
- hosted screenshots confirm the result in packaged/runtime reality at 1180px, 1600px, 1900px, and handheld.
