# Closure Evidence — Phase-04 Homepage Shell Breakpoint Matrix

## Purpose

This artifact is the reusable closure proof for the HB Homepage shell under
Phase-04. It captures the output of
`runShellHarnessMatrix()` (see
`apps/hb-webparts/src/webparts/hbHomepage/shell/shellHarness.ts`) against
the default preset at each governing device class. Regenerate by running:

```
npx vitest run --config vitest.config.ts src/webparts/hbHomepage/shell/__tests__/shellHarness.test.ts
```

The `shellClosure.test.ts` suite asserts that every row below is produced
automatically — if this doc drifts from the runtime output, the closure
tests will fail before the shell is accepted.

## Governing references

- Spec: `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- Shell entry policy: `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`
- Shared orchestration seam: `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`
- Protected decisions: `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- Harness: `apps/hb-webparts/src/webparts/hbHomepage/shell/shellHarness.ts`

## Matrix outcome (default preset)

| Label | Width × Height | Entry state | Selection reason | Short-height | First-lane columns | First-band pairing |
|---|---|---|---|:---:|:---:|---|
| ultrawide-desktop | 1800 × 1000 | `ultrawide-desktop` | `width-match` | no | 2 | `paired` |
| standard-laptop (primary baseline) | 1300 × 900 | `standard-laptop` | `width-match` | no | 2 | `paired` |
| tablet-landscape-large | 1150 × 850 | `tablet-landscape` | `width-match` | no | 1 | `state-denies-pairing` |
| tablet-landscape-medium | 1000 × 800 | `tablet-landscape` | `width-match` | no | 1 | `state-denies-pairing` |
| tablet-portrait-large | 900 × 1200 | `tablet-portrait-large` | `width-match` | no | 1 | `state-denies-pairing` |
| tablet-portrait-medium | 780 × 1100 | `tablet-portrait` | `width-match` | no | 1 | `state-denies-pairing` |
| phone-portrait-large (iPhone 17 Pro Max) | 430 × 900 | `phone-portrait` | `width-match` | no | 1 | `state-denies-pairing` |
| phone-portrait-standard (iPhone 17 Pro) | 390 × 850 | `phone-portrait` | `width-match` | no | 1 | `state-denies-pairing` |
| phone-landscape (short-height constrained) | 700 × 400 | `phone-landscape` | `short-height-override` | **yes** | 1 | `state-denies-pairing` |
| constrained-reflow (desktop width, short height) | 1300 × 420 | `phone-landscape` | `short-height-override` | **yes** | 1 | `state-denies-pairing` |
| below-narrowest-fallback | 280 × 700 | `phone-portrait` | `fallback-below-narrowest` | no | 1 | `state-denies-pairing` |

Every row emits **zero error diagnostics**; the single info-level
`NO_INPUT` diagnostic is expected because the harness default runs
without a persisted layout payload.

## Raw harness summary lines

Captured from `summarizeHarnessProof(...)` against the default preset:

```
[standard-laptop (primary baseline)] state=standard-laptop reason=width-match shortHeight=false preset=default-v2 diagnostics=1 bands=[band-operational-spotlight:2col:paired | band-communications-newsroom:1col:single-occupant | band-communications-editorial:1col:single-occupant | band-safety-field:1col:single-occupant | band-people-culture:1col:single-occupant | band-recognition:1col:single-occupant]
[tablet-landscape-large] state=tablet-landscape reason=width-match shortHeight=false preset=default-v2 diagnostics=1 bands=[band-operational-spotlight:1col:state-denies-pairing | ...]
[tablet-landscape-medium] state=tablet-landscape reason=width-match shortHeight=false preset=default-v2 diagnostics=1 bands=[band-operational-spotlight:1col:state-denies-pairing | ...]
[tablet-portrait-large] state=tablet-portrait-large reason=width-match shortHeight=false preset=default-v2 diagnostics=1 bands=[band-operational-spotlight:1col:state-denies-pairing | ...]
[tablet-portrait-medium] state=tablet-portrait reason=width-match shortHeight=false preset=default-v2 diagnostics=1 bands=[band-operational-spotlight:1col:state-denies-pairing | ...]
[phone-portrait-large (iPhone 17 Pro Max)] state=phone-portrait reason=width-match shortHeight=false preset=default-v2 diagnostics=1 bands=[band-operational-spotlight:1col:state-denies-pairing | ...]
[phone-portrait-standard (iPhone 17 Pro)] state=phone-portrait reason=width-match shortHeight=false preset=default-v2 diagnostics=1 bands=[band-operational-spotlight:1col:state-denies-pairing | ...]
[phone-landscape (short-height constrained)] state=phone-landscape reason=short-height-override shortHeight=true preset=default-v2 diagnostics=1 bands=[band-operational-spotlight:1col:state-denies-pairing | ...]
[constrained-reflow (desktop width, short height)] state=phone-landscape reason=short-height-override shortHeight=true preset=default-v2 diagnostics=1 bands=[band-operational-spotlight:1col:state-denies-pairing | ...]
[below-narrowest-fallback] state=phone-portrait reason=fallback-below-narrowest shortHeight=false preset=default-v2 diagnostics=1 bands=[band-operational-spotlight:1col:state-denies-pairing | ...]
```

## What this evidence proves

- Selected entry state is correct for every declared device class in the
  governing spec, including fine-grained phone and tablet variants.
- First-lane pairing is allowed only for ultrawide-desktop and
  standard-laptop and is actively denied by policy at every other class.
- Short-height override fires whenever `height < 500` and width ≥ 480,
  including the constrained-reflow case where width is desktop-class.
- `fallback-below-narrowest` routes any width below 320 to phone-portrait
  without failing the resolver.
- Pairing decisions are inspectable per band (`paired`, `single-occupant`,
  `state-denies-pairing`, `comfort-forced-stack`,
  `below-narrowest-stable-paired-width`, `prohibited-pairing`).
- No row emits error diagnostics under the default preset.

## Known shell-only gaps remaining after Phase-04

None material. Known non-gaps that are intentionally shell-scope-excluded:

- Hero visual rebalance inside `HbSignatureHero` — out of scope (child).
- Priority-actions action authoring — out of scope (authoring/admin).
- Page-builder freeform editing — explicitly forbidden by governance.

## How future agents should consume this artifact

1. Regenerate with the command above before a release candidate commit.
2. Diff the table against the committed copy; any change must have a
   corresponding shell-code change and an ADR-class note if a protected
   rule moved.
3. Treat an unexpected row as a regression and file against shell code;
   never patch the child modules to make this table match.
