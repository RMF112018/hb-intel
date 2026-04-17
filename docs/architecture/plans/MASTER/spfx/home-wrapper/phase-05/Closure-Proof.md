# Phase-05 Homepage Shell — Wave-02 Closure Proof

Shell-only closure package for the HB Homepage shell-governance program.
Scope was strictly shell-only; no child-module redesign was used as the
answer to any shell-only gap.

## Prompt → deliverable map

| Prompt | Requirement | Deliverable |
|---|---|---|
| 01 | Harden governance registry and decision model | Four-category taxonomy (`protected` / `bounded-configurable` / `descriptive` / `shell-fit`) in `shell/shellTypes.ts`; unified `SHELL_GOVERNANCE_MODEL` + `getGovernanceCategory` / `isBoundedConfigurable` in `shell/protectedDecisions.ts`; per-occupant `allowedBandSemantics`, `reorderDomain`, `visibilityEligibility`, `persistedPolicyKeys` in `shell/occupantRegistry.ts`; overrides blocked at `applyOverrides` via three new validators in `shell/shellValidation.ts`. |
| 02 | Versioned persisted shell-layout policy and bounded rejectable boundary | `PERSISTED_STATE_VERSION`, `PERSISTED_REJECTION_CODES` taxonomy, `migratePersistedState`, `previewPersistedState`, and `PERSISTED_POLICY_EXAMPLES` (allowed / normalized / rejected) in `shell/shellPersistence.ts`. Governance errors from Prompt-01 folded into preview rejections. |
| 03 | Canonicalize presets, band semantics, and override permissions | `PRESET_CANONICAL_POLICY`, `validatePresetCanonicalSemantics`, `PRESET_MUTATION_PERMISSIONS` in `shell/presetLibrary.ts`; canonical diagnostics wired through `validatePreset`. |
| 04 | Shared entry-stack contract across hero, actions, and first lane | Shell-owned `shell/entryStackPolicy.ts` + production-adjacent mirror `homepage/entryStack/entryStackContract.ts`; orchestration seam `homepage/entryStack/entryStackOrchestration.ts` now carries `PriorityActionsDeviceClass` ↔ `ShellEntryStateId` alignment with compile-time parity assertion. Hero and rail docblocks anchor to the shell-owned policy. |
| 05 | Shell-owned mode-negotiation / conformance seam | `shell/shellConformance.ts` — `ShellLayoutMode` (`paired-rich` / `paired-entry` / `stacked-full` / `short-height-compact`), per-band `BandConformance`, per-slot `SlotConformance`, and stable `data-shell-*` attribute surface applied by `HbHomepageShell.tsx`. |
| 06 | Conformance harness, tests, and closure artifacts | `runShellConformanceMatrix` in `shell/shellHarness.ts`; `shell/__tests__/shellClosureProof.test.ts` asserts every prompt's proof; this document summarizes the package. |

## Executable proof

- Shell test scope: `apps/hb-webparts/src/webparts/hbHomepage/shell/**` — **239/239 green** after Prompt-06.
- Type-check (`pnpm --filter @hbc/spfx-hb-webparts check-types`) clean.
- Breakpoint matrix: every entry class in `SHELL_BREAKPOINT_MATRIX` resolves its expected state, no error-severity diagnostics emit against `DEFAULT_PRESET`.
- Constrained / reflow coverage: tablet-portrait, phone, and short-height-constrained cases all produce single-column entry bands; the constrained-reflow case (1300 × 420) yields `layoutMode: short-height-compact` and `shortHeightConstrained: true`.

Test files that compose the proof package:

- `shell/__tests__/shellValidation.test.ts` — governance / override-enforcement / canonical-preset diagnostics
- `shell/__tests__/shellPersistence.test.ts` — persistence boundary, migration, rejection taxonomy
- `shell/__tests__/entryStackPolicy.test.ts` — entry-stack policy coverage, budgets, protected/configurable disjointness
- `shell/__tests__/entryStackAlignment.test.ts` — rail `DeviceClass` ↔ shell entry-state alignment (compile-time + runtime)
- `shell/__tests__/shellConformance.test.ts` — mode-negotiation synthesis, short-height override, data-attribute surface
- `shell/__tests__/shellHarness.test.ts` — per-case harness proof structure
- `shell/__tests__/shellClosureProof.test.ts` — **this package's integrating closure test**

## Protected invariants preserved

- `postHeroBoundary`, `maxDominantPerBand`, `prohibitedPairings`, `protectedBandSemantics`
- `firstLaneBeginsOnFirstView`, `heroHeightBudgetCeilingEnforced`, `tabletPortraitForceSingleColumn`, `phoneForceSingleColumn`, `shortHeightCompactBannerMandatory`, `overflowMustRemainGoverned`
- `PRESET_CANONICAL_POLICY` (no empty entry band, recognition band last, semantic-role reuse limited to `operational-spotlight`)
- Per-occupant `allowedSlotRoles`, `prominenceCeiling`, `firstLaneEligible`, `pairingRestrictions`, `allowedBandSemantics`, `reorderDomain`, `visibilityEligibility`

## Configurable (future control panel) — bounded by shell

- `presetSelection` (within `APPROVED_PRESETS`)
- `optionalOccupantVisibility` — only where `visibilityEligibility.hideableByMaintainer === true`
- `limitedReorderWithinCompatibleBands` — only where `reorderDomain !== 'locked'`
- `compactVsStandardTreatment`
- Hero height choice within per-class `heroHeightBudgetPx`
- Visible-actions count within per-class `visiblePrimaryActionsBudget`
- Overflow affordance label / authored action selection

## Entry-stack contract enforced across surfaces

| Surface | Webpart | Alignment seam |
|---|---|---|
| Flagship hero | `HbSignatureHero` | Docblock anchors to `shell/entryStackPolicy.ts`; no independent breakpoint vocabulary |
| Priority actions | `PriorityActionsRail` | Author-facing `DeviceClass` ↔ `ShellEntryStateId` via `PRIORITY_ACTIONS_DEVICE_CLASS_TO_SHELL_STATE`; compile-time parity asserted |
| First lane (shell) | `HbHomepage` | Native `ShellEntryStateId`; emits `ShellConformanceReport` + `data-shell-*` attributes |

Surfaces remain independent webparts by design (see `ENTRY_STACK_SURFACES`), obeying the same shell-entry rules without being merged.

## Constrained-state / reflow behavior validated

| Case | Width × Height | Resolved state | Entry-band columns | Layout mode |
|---|---|---|---|---|
| Ultrawide desktop | 1800 × 1000 | `ultrawide-desktop` | 2 | `paired-entry` |
| Standard laptop | 1300 × 900 | `standard-laptop` | 2 | `paired-entry` |
| Tablet landscape | 1000–1150 | `tablet-landscape` | 1 | `stacked-full` |
| Tablet portrait | 780–900 | `tablet-portrait{-large}` | 1 | `stacked-full` |
| Phone portrait | 390–430 | `phone-portrait` | 1 | `stacked-full` |
| Phone landscape | 700 × 400 | `phone-landscape` | 1 | `short-height-compact` |
| Constrained reflow | 1300 × 420 | `phone-landscape` (short-height override) | 1 | `short-height-compact` |
| Below-narrowest fallback | 280 × 700 | `phone-portrait` (`fallback-below-narrowest`) | 1 | `stacked-full` |

## Remaining shell-only gaps

None within Wave-02 scope.

Deferred (intentionally out of this wave): build of a governed control-panel UI, migration to a persisted v2 schema, and any hosted-surface redesign. Each has a documented seam to consume when opened — `SHELL_GOVERNANCE_MODEL`, `PERSISTED_POLICY_EXAMPLES`, `migratePersistedState`, `ShellConformanceReport` — and none require reopening shell doctrine.

## Manifest lineage

`HbHomepageWebPart` four-part version progression across Wave-02:
`1.1.0.0` → `1.1.1.0` (Prompt-01) → `1.1.2.0` (Prompt-02) → `1.1.3.0` (Prompt-03) → `1.1.4.0` (Prompt-04) → `1.1.5.0` (Prompt-05) → `1.1.6.0` (Prompt-06).
