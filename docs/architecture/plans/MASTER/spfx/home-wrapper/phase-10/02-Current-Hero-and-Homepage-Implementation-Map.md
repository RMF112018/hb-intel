# Current Hero and Homepage Implementation Map

## Purpose

This file maps the current repo-truth seams that govern the flagship homepage hero, homepage wrapper, launcher band, shell, and entry-stack policy.

## 1. Runtime composition today

### `apps/hb-webparts/src/mount.tsx`
Current flagship runtime dispatch still treats:
- the hero as its own standalone SPFx webpart,
- and `HbHomepage` as a separate webpart.

The comments in `mount.tsx` explicitly state that on the flagship page the hero and `HbHomepage` are both dispatched, while the actions stage is embedded inside `HbHomepage`.

### `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
`HbHomepage` is only a thin pass-through to `HbHomepageEntryStack`.

### `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
This is the actual wrapper-owned entry-stack runtime today.

It currently renders:
1. wrapper-owned launcher/actions region
2. shell region

It does **not** render the hero.

### `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`
This file formalizes the canonical sequence as:
- hero
- actions
- first-lane

but still marks:
- hero as `standalone-webpart` for flagship composition,
- actions as `wrapper-embedded`,
- shell/homepage as `standalone-webpart`.

This is the clearest repo-truth statement that the current split is deliberate.

## 2. Ownership contracts today

### `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
This contract explicitly states that the wrapper begins **after** the hero.

It also states that:
- the wrapper owns the actions region,
- the shell owns post-entry lane orchestration,
- and the shell does not own hero visuals.

That means a hero unification cutover must update this contract truth.

### `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
There is already a typed wrapper-owned config seam for the embedded launcher band.

There is no equivalent wrapper-owned hero config seam today.

This is one of the strongest reasons the implementation must include a clean hero integration seam rather than threading hero inputs ad hoc.

## 3. Hero implementation today

### `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
This is a thin orchestrator that picks:
- homepage mode on HBCentral,
- article mode elsewhere.

That split should survive the flagship cutover.

### `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
This is the flagship homepage hero adapter.

Important characteristics:
- two-zone horizontal composition,
- desktop-biased brand masthead,
- commentary already acknowledges entry-stack policy alignment,
- but the component does not actually consume the wrapper-owned `entryContainer` or a shared entry-state payload today.

### `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`
The CSS still relies mainly on viewport media queries and internal fixed proportions.

It does not yet operate like a fully container-aware entry-stage surface governed by the same wrapper-owned measurement truth already used by the launcher band and shell.

## 4. Measurement and state seams already available

### `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
This hook measures:
- authoritative outer envelope width,
- shell inline inset totals,
- usable shell width,
- height,
- entry-state classification,
- and short-height constraints.

It already provides the right kind of shared truth.

### `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
The launcher band already consumes `entryContainer`.

This is extremely important:
the launcher has already crossed into wrapper-owned shared entry-state truth.
The hero has not.

### `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
This file owns the entry-state classification model and the short-height override.

### `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`
This file owns:
- hero height budgets,
- visible action budgets,
- spacing guidance,
- protected entry-stack rules.

### `apps/hb-webparts/src/homepage/entryStack/entryStackContract.ts`
This is the production-adjacent mirror of numeric entry-stack budgets.

## 5. Reference composition today

### `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
The design/reference composition still flattens the hero above separate utility/discovery/etc surfaces. It mirrors the old flagship composition truth more than the intended unified target state.

If the runtime cutover happens, this file must either:
- reflect the new flagship truth,
- or be explicitly repositioned as a non-production reference/harness path.

## 6. Tests already present

The repo already includes meaningful tests for:
- breakpoint policy,
- entry-stack policy,
- and shell measurement helpers.

That means the package should extend and tighten an existing proof posture rather than inventing one from scratch.

## 7. Main implication

The codebase already contains most of the machinery needed for this transition.

The real work is to:
- move the hero into wrapper-owned flagship composition,
- create a wrapper-owned hero input seam,
- make the hero consume shared entry-stack truth,
- update repo-truth seams,
- and close hosted rollout risk.
