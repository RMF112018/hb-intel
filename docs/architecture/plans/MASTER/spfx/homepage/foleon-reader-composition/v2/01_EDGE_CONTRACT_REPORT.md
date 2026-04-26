# 01 Edge Contract Report

## Objective

Implement the smallest safe **gated** edge-to-window contract that distinguishes the post-hero shell-body edge authority (`HbHomepageShell`) from the hero / shared-edge authority (`HbHomepageEntryStack`), and exposes per-slot visual-side / edge-bleed metadata for the three Foleon-served lanes. The CSS behavior is real but dormant: default policy `{ edgeMode: 'standard', heroEdge: 'none' }` keeps hosted output byte-identical to today, while opt-in `edge-to-window` activates margin-/padding-based bleed gated by attribute selectors.

This prompt does **not** redesign Foleon reader interiors, change preset placements, alter pairing/orientation logic, or touch backend / SharePoint schemas / Foleon iframe governance.

## Baseline Used

`docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md` — the controlling baseline for the hero/post-hero authority split. Verified live source still matches the baseline before implementing:

- `HbHomepageShell.module.css:16-32` — `.shell` owns `--hb-homepage-shell-body-inset-inline` (post-hero body authority).
- `HbHomepageEntryStack.module.css:25-46` — `.entryStack` owns the outer envelope (`max-width: 2400px`) and shared inline-inset variable; `.heroRegion` consumes it.
- `HbHomepageEntryStack.tsx:73-94` — hero is mounted as a sibling of the shell, not inside it.
- `defaultPreset.ts:12-82` — three locked rows; row 2 is right-dominant (Safety minor, Company Pulse major).

## Source Files Inspected

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/*.ts(x)`
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/*.ts(x)`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/hb-webparts/config/package-solution.json`
- `packages/foleon-reader/src/readers/FoleonReaderModule.module.css`
- `packages/foleon-reader/src/readers/FoleonReaderModule.tsx`
- `packages/foleon-reader/src/readers/FoleonReaderPreview.tsx`

Foleon reader internals were inspected for context but not modified.

## Changes Implemented

| File | Change |
|---|---|
| `apps/hb-webparts/src/webparts/hbHomepage/shell/edgeContract.ts` | **New.** Pure helpers (`resolveShellBandLayoutMode`, `resolveShellSlotVisualSide`, `resolveShellSlotEdgeBleed`), eligibility set, typed `DEFAULT_HOMEPAGE_EDGE_POLICY`. |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx` | Wire `data-shell-band-layout`, `data-shell-slot-visual-side`, `data-shell-slot-edge-bleed` onto every slot wrapper, computed via the new helpers from `layout.columns`, band orientation, and `comfort.effectiveColumnSpan`. |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css` | Add `--hb-homepage-edge-safe-inline`, `--hb-homepage-edge-bleed-inline-start`, `--hb-homepage-edge-bleed-inline-end` on `.shell` (defaults to zero). Add gated rules under `[data-hb-homepage-edge-mode="edge-to-window"]` ancestor selector that apply `margin-inline-start/end: calc(var(...) * -1)` to `.slot[data-shell-slot-edge-bleed="..."]`. Bleed amount is `max(0px, var(--hb-homepage-edge-safe-inline))`. |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx` | Emit `data-hb-homepage-edge-mode` and `data-hb-homepage-hero-edge` from `DEFAULT_HOMEPAGE_EDGE_POLICY` on the `.entryStack` root. |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css` | Add `--hb-homepage-edge-safe-inline`, `--hb-homepage-hero-edge-inline-start`, `--hb-homepage-hero-edge-inline-end` on `.entryStack` (defaults to zero). Add gated rule keyed on combined attributes `[data-hb-homepage-edge-mode="edge-to-window"][data-hb-homepage-hero-edge="both"] .heroRegion` that drops `padding-inline` to `0`. |
| `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/edgeContract.test.ts` | **New.** 30 tests covering pure-helper rules and preset-derived row scenarios. |
| `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.edgeContract.test.tsx` | **New.** 16 tests asserting standard-mode attribute resolution per row and CSS-contract proofs (gating, no-overflow clamp, no global `overflow-x: hidden`). |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump `version` 1.1.80.0 → 1.1.81.0. |
| `apps/hb-webparts/config/package-solution.json` | Bump solution `version` 1.0.3.0 → 1.0.4.0. |

No changes to: Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon iframe governance, Foleon routes, Foleon content resolver, default row placement, lane-specific Foleon visual composition, `FoleonHomepageLaneHost.tsx`, `defaultPreset.ts`, `slotComfortResolver.ts`, `occupantRegistry.ts`, `shellTypes.ts`.

## Hero vs Post-Hero Edge Authority

Honored as separate authorities, per the baseline audit:

- **`HbHomepageShell`** governs the **post-hero shell body** where the three Foleon lanes are mounted. Owns `--hb-homepage-shell-body-inset-inline` and the slot-level edge-bleed CSS rules. The `[data-hb-homepage-edge-mode="edge-to-window"]` selector on the entry-stack root cascades into `.shell` and activates per-slot `margin-inline-*` only on slots whose `data-shell-slot-edge-bleed` attribute resolves to `left` / `right` / `both` (i.e. only the three eligible Foleon occupants).
- **`HbHomepageEntryStack`** governs the **hero region and shared edge alignment**. Owns `--hb-homepage-entry-shared-inline-inset`, the outer envelope `max-width: 2400px`, and the gated hero rule `[data-hb-homepage-edge-mode="edge-to-window"][data-hb-homepage-hero-edge="both"] .heroRegion { padding-inline: 0; }`.

Hero behavior is **not** routed through `HbHomepageShell`. Slot edge bleed is **not** routed through `HbHomepageEntryStack`.

## Shell Slot Metadata Contract

Resolved purely from `layout.columns`, band `orientation`, and `effectiveColumnSpan` (never from DOM order) — see `apps/hb-webparts/src/webparts/hbHomepage/shell/edgeContract.ts`. Emitted on every slot wrapper in `HbHomepageShell.tsx` (active, fallback, inactive, and unknown paths all carry the attributes).

| Attribute | Values | Source |
|---|---|---|
| `data-shell-band-layout` | `paired` \| `stacked` | `resolveShellBandLayoutMode(layout.columns)` |
| `data-shell-slot-visual-side` | `left` \| `right` \| `full` | `resolveShellSlotVisualSide({ columns, orientation, effectiveColumnSpan })` |
| `data-shell-slot-edge-bleed` | `left` \| `right` \| `both` \| `none` | `resolveShellSlotEdgeBleed({ occupantId, visualSide })` |

Eligibility set: `project-portfolio-spotlight`, `company-pulse`, `leadership-message`. Every other occupant (Safety, HB Kudos, People & Culture) resolves to `edge-bleed="none"` regardless of visual side.

Default-preset resolution at standard-laptop entry state:

| Row | Occupant | Span | Orientation | visual-side | edge-bleed |
|---|---|---|---|---|---|
| 1 | `project-portfolio-spotlight` | major | left-dominant | `left` | `left` |
| 1 | `hb-kudos` | minor | left-dominant | `right` | `none` |
| 2 | `safety-field-excellence` | minor | right-dominant | `left` | `none` |
| 2 | `company-pulse` | major | right-dominant | `right` | `right` |
| 3 | `leadership-message` | major | left-dominant | `left` | `left` |
| 3 | `people-culture-public` | minor | left-dominant | `right` | `none` |

## Edge-to-Window Styling Contract

Reusable shell-owned CSS variables (defaults preserve current geometry):

```
--hb-homepage-shell-body-inset-inline   (existing; unchanged values)
--hb-homepage-edge-safe-inline          ⇒ var(--hb-homepage-shell-body-inset-inline)
--hb-homepage-edge-bleed-inline-start   ⇒ 0px (default) | max(0px, --hb-homepage-edge-safe-inline) (opt-in)
--hb-homepage-edge-bleed-inline-end     ⇒ 0px (default) | max(0px, --hb-homepage-edge-safe-inline) (opt-in)
```

Opt-in selector chain (no `overflow-x: hidden` is used):

```
[data-hb-homepage-edge-mode="edge-to-window"] .shell { /* sets bleed amounts */ }
[data-hb-homepage-edge-mode="edge-to-window"] .slot[data-shell-slot-edge-bleed="left"]  { margin-inline-start: calc(var(--…-start) * -1); }
[data-hb-homepage-edge-mode="edge-to-window"] .slot[data-shell-slot-edge-bleed="right"] { margin-inline-end:   calc(var(--…-end)   * -1); }
[data-hb-homepage-edge-mode="edge-to-window"] .slot[data-shell-slot-edge-bleed="both"]  { margin-inline-start: …; margin-inline-end: …; }
```

No-overflow safeguards:

1. `max(0px, var(--hb-homepage-edge-safe-inline))` clamps the bleed amount so it cannot go negative.
2. The bleed amount mirrors the shell body inline inset, so a slot can reach the inner edge of the outer envelope but not past it.
3. The outer envelope `max-width: 2400px` (owned by `HbHomepageEntryStack`) caps the canvas reach.
4. Standard mode defaults the bleed amounts to `0px`, so the rules become identity transforms even if the gating attribute is accidentally introduced upstream.

## Hero / Entry-Stack Contract

Reusable entry-stack-owned CSS variables:

```
--hb-homepage-entry-shared-inline-inset   (existing; unchanged values)
--hb-homepage-edge-safe-inline            ⇒ var(--hb-homepage-entry-shared-inline-inset)
--hb-homepage-hero-edge-inline-start      ⇒ 0px (default) | max(0px, --hb-homepage-edge-safe-inline) (opt-in)
--hb-homepage-hero-edge-inline-end        ⇒ 0px (default) | max(0px, --hb-homepage-edge-safe-inline) (opt-in)
```

Opt-in selector (combined attributes required):

```
[data-hb-homepage-edge-mode="edge-to-window"][data-hb-homepage-hero-edge="both"] .heroRegion {
  padding-inline: 0;
}
```

The hero opt-in **releases** the entry-stack-owned inline padding rather than applying a negative margin. A negative value is structurally impossible here, which is the strongest available no-overflow safeguard for the hero seam. The hero's own internal CSS module (signature-hero) continues to own its content padding — this layer only changes the entry-stack-owned outer inset.

**Hero behavior status: implemented.** Hero edge-to-window is real and dormant. With `DEFAULT_HOMEPAGE_EDGE_POLICY = { edgeMode: 'standard', heroEdge: 'none' }`, the gated rule does not match and the hero region renders identically to today. A follow-up prompt can switch the policy (or, eventually, expose it as a property-pane control) without inventing new CSS architecture.

## Tests Added or Updated

- **New** `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/edgeContract.test.ts` — 30 tests: default-policy invariants, eligibility set, three resolvers exhaustively (paired/stacked × all spans × both orientations), and preset-derived row scenarios for every row of `DEFAULT_PRESET`.
- **New** `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.edgeContract.test.tsx` — 16 tests: rendered-DOM assertions per default-preset row (Project Spotlight ⇒ left/left, Company Pulse ⇒ right/right, Leadership Message ⇒ left/left, all three ineligible occupants ⇒ none), entry-stack hero attributes default to `standard`/`none`, hero remains a sibling of the shell region, and CSS-contract proof (gating attribute selectors present, `max(0px, …)` clamp present, no global `overflow-x: hidden`).

Existing shell tests (protectedRowPairings, threeRowComposition.closure, bandOrientation, slotComfortResolver, etc.) were not modified and continue to pass — the contract is additive (new attributes only).

## Validation Commands and Results

All commands run from `apps/hb-webparts/`:

| Command | Scope | Result |
|---|---|---|
| `pnpm exec vitest run --config vitest.config.ts src/webparts/hbHomepage/shell/__tests__/edgeContract.test.ts` | new pure-helper suite | **30 / 30 pass** |
| `pnpm exec vitest run --config vitest.config.ts src/webparts/hbHomepage/__tests__/HbHomepageShell.edgeContract.test.tsx` | new integration + CSS-contract suite | **16 / 16 pass** |
| `pnpm exec vitest run --config vitest.config.ts src/webparts/hbHomepage/shell src/webparts/hbHomepage/__tests__` | full hbHomepage shell + composition test surface | **27 files / 429 tests pass** |
| `pnpm exec eslint src/webparts/hbHomepage/HbHomepageShell.tsx src/webparts/hbHomepage/HbHomepageEntryStack.tsx src/webparts/hbHomepage/shell/edgeContract.ts src/webparts/hbHomepage/shell/__tests__/edgeContract.test.ts src/webparts/hbHomepage/__tests__/HbHomepageShell.edgeContract.test.tsx` | lint of changed files | clean (no warnings, no errors) |
| `pnpm test` | full hb-webparts suite | 24 failures pre-existing on `main` (verified by `git stash` round-trip): hbKudos snapshot drift + 3 unrelated failing files. None touch `hbHomepage` shell or entry-stack code. |
| `pnpm check-types` | full hb-webparts typecheck | 4 errors pre-existing on `main` (verified by `git stash` round-trip): `homepage/__tests__/hbKudosAccessibilityGuardrails.test.tsx`, `homepage/__tests__/homepageHeroDaypartPrecedence.test.tsx`, `priorityActionsRail/PriorityActionsRail.tsx`. None reference any file I changed. |

The pre-existing failures are documented for transparency; they predate this prompt and are not in scope.

## Hosted Proof Checklist

JSDOM cannot prove geometry. The following hosted-proof steps are pending and should be executed by the operator after deploy:

1. Deploy rebuilt `hb-webparts.sppkg` once Wave-01 packaging completes (solution `1.0.4.0`, web part `1.1.81.0`).
2. Open HBCentral homepage on a tenant.
3. With default policy active, confirm hero and Foleon lanes render geometrically identical to the prior `1.1.80.0` build (no visible drift).
4. Use DOM inspector to confirm Project Spotlight slot exposes `data-shell-slot-edge-bleed="left"`.
5. Confirm Company Pulse slot exposes `data-shell-slot-edge-bleed="right"`.
6. Confirm Leadership Message slot exposes `data-shell-slot-edge-bleed="left"`.
7. Resize to a stacked breakpoint (≤ 939px container width); confirm all three eligible Foleon slots resolve `data-shell-slot-edge-bleed="both"` and `data-shell-band-layout="stacked"`.
8. Confirm Safety Field Excellence, HB Kudos, and People & Culture slots show `data-shell-slot-edge-bleed="none"` at every breakpoint.
9. Confirm entry-stack root carries `data-hb-homepage-edge-mode="standard"` and `data-hb-homepage-hero-edge="none"`.
10. Confirm no horizontal overflow at desktop, tablet, and phone widths (no scrollbar; document inspector shows scrollWidth ≤ clientWidth on the entry-stack root).
11. Confirm keyboard focus outlines on the three Foleon lanes are not clipped.
12. Optional sandbox: temporarily flip the entry-stack policy in source to `{ edgeMode: 'edge-to-window', heroEdge: 'both' }` in a test branch and verify (a) hero `padding-inline` becomes `0`, (b) eligible Foleon slots receive negative `margin-inline-*`, (c) no horizontal overflow appears at any tested breakpoint.

## Known Limitations

1. **JSDOM cannot prove geometry.** The integration test asserts CSS module content for the gating selectors, the `max(0px, …)` clamp, and the absence of global `overflow-x: hidden` — this is the strongest available proof in JSDOM. A Playwright / browser visual-regression follow-up is required to prove no-overflow geometrically. (Recorded as follow-up.)
2. **Mode is constant-driven, not config-driven.** `DEFAULT_HOMEPAGE_EDGE_POLICY` is a typed module constant. Promotion to a property-pane property (or wrapper-config seam) is a deliberate follow-up — outside this prompt's scope.
3. **No host-wrapper class added inside `FoleonHomepageLaneHost`.** Reader interiors do not need to consume the slot attributes in this prompt; later prompts that wire reader-side responses to the contract may add a thin host wrapper if they choose.
4. **CSS-contract test reads files from disk.** This is a JSDOM-friendly proxy for "the gating rules exist"; it is not a substitute for hosted geometric proof.

## Follow-Up Work

1. Property-pane / wrapper-config seam to flip `edgeMode` + `heroEdge` per tenant or audience without source changes.
2. Playwright / browser visual-regression rig that proves (a) no-overflow at all relevant breakpoints under both policies, (b) eligible Foleon slots geometrically reach the canvas edge in opt-in mode.
3. Reader-side adoption: a later prompt may use `data-shell-slot-edge-bleed` inside `FoleonHomepageLaneHost` or the foleon-reader chrome stack to relax the reader's own inset stack when bleed is active.
4. Resolution of plan-corpus path drift (baseline audit §7 risk #1): `spfx/foleon/phase-04/` vs live `spfx/foleon-manage/phase-04/` — confirm canonical location.

## Risk / Mitigation Notes

| Risk | Mitigation |
|---|---|
| Adding new data attributes breaks an existing serializer-based snapshot. | None of the shell tests use snapshot serializers on slot wrappers; the 27/429 hbHomepage suite passes unchanged. |
| Opt-in CSS could overflow if `--hb-homepage-edge-safe-inline` is misconfigured downstream. | `max(0px, …)` clamp prevents negative bleed regardless of upstream variable shape. |
| Future consumers might apply `[data-hb-homepage-edge-mode="edge-to-window"]` outside the entry-stack root, accidentally activating bleed in unrelated contexts. | The selector requires `.shell` / `.slot[...]` / `.heroRegion` descendants, all of which are owned exclusively by `HbHomepageShell` / `HbHomepageEntryStack`. The contract is documentable but not address-leak-proof; ADR-level guidance is a follow-up. |
| SPFx hosts may ignore CSS container queries on older runtimes. | Existing shell already relies on container queries (`HbHomepageShell.module.css:34-62`). This change does not introduce new container-query dependencies. |
| Right-dominant Row 2 visual-side resolution is non-obvious (DOM order ≠ visual order). | Tests pin the resolution explicitly for Row 2 in both the pure-helper suite and the integration suite. |

## Rollback Plan

If a regression is found post-deploy:

1. **Source rollback:** revert the seven changes listed in *Changes Implemented*. The contract is additive — there is no migration to undo.
2. **Version rollback:** revert manifest `1.1.81.0 → 1.1.80.0` and solution `1.0.4.0 → 1.0.3.0`.
3. **Hosted rollback:** redeploy the prior `.sppkg` (solution `1.0.3.0`, web part `1.1.80.0`).
4. **Test rollback:** delete the two new test files; existing tests were not modified.

Because every behavior gate keys on `data-hb-homepage-edge-mode="edge-to-window"` and the default policy never emits that value, the runtime fallback is to leave `DEFAULT_HOMEPAGE_EDGE_POLICY` at `{ edgeMode: 'standard', heroEdge: 'none' }`. No hot-fix branch is required; the dormant CSS becomes a no-op.
