# Prompt 01 — Shell / Entry-Stack Edge-to-Window Contract for Hero and Post-Hero Foleon Lanes

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, prior assumptions, or stale generated artifacts when source files are available. Do not re-read files that are still within your current context or memory unless verification is required.

Follow all existing repo governance, UI doctrine, package-version authority, SPFx build/package proof standards, and local agent rules. Do not implement unrelated changes.

## Controlling Baseline

Use the completed baseline audit as the controlling baseline:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md
```

Do not re-litigate the hero/post-hero authority split unless fresh repo evidence contradicts it.

The baseline finding to preserve unless contradicted by source:

- `HbHomepageShell` governs the post-hero shell body where the Foleon lanes are mounted.
- `HbHomepageEntryStack` governs the hero region and shared edge alignment.
- `HbHomepageShell` does **not** alone control full-window edge behavior.
- The Foleon reader chrome stack is also independently inset inside `packages/foleon-reader/src/readers/FoleonReaderModule.module.css`.

This prompt is **not** a Foleon reader redesign prompt. It is an edge/inset contract and proof prompt.

## Objective

Implement the smallest safe shell / entry-stack contract needed to support edge-to-window behavior for:

1. the hero / entry-stack surface; and
2. the three Foleon reader lanes in the post-hero homepage shell.

The objective is to establish reliable, testable metadata and styling primitives that later prompts can use to redesign each Foleon reader lane without guessing its visual side or shell mode.

This prompt may implement shell/host metadata, CSS variables, edge-mode attributes, safe-area behavior, and tests. It must not redesign the Foleon reader layouts themselves.

## Non-Negotiable Boundaries

Do **not** change:

```text
Safety Field Excellence
HB Kudos
People & Culture
backend sync behavior
SharePoint list schemas
Foleon iframe governance
Foleon routes
Foleon content resolver logic
default row placement
lane-specific Foleon visual composition
```

Do **not** use global `overflow-x: hidden` to hide layout defects.

Do **not** hard-code tenant-specific page widths.

Do **not** rely only on DOM order to decide left/right bleed.

Do **not** make preview and production Foleon layouts diverge.

## Required Repo-Truth First Step

Read `00_BASELINE_AUDIT.md` first. Then inspect the live repo files needed for verification and implementation.

Inspect at minimum:

```text
apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css
apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/**
apps/hb-webparts/src/webparts/hbHomepage/**/entry*
apps/hb-webparts/src/webparts/hbHomepage/**/hero*
apps/hb-webparts/src/webparts/**/hbSignatureHero/**
packages/foleon-reader/src/readers/FoleonReaderModule.module.css
packages/foleon-reader/src/readers/FoleonReaderModule.tsx
packages/foleon-reader/src/readers/FoleonReaderPreview.tsx
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
```

If file names differ, search the repo and document the actual paths used.

## Implementation Scope

### Track A — Post-Hero Shell Slot Metadata

Add non-breaking shell data attributes:

```text
data-shell-band-layout="paired|stacked"
data-shell-slot-visual-side="left|right|full"
data-shell-slot-edge-bleed="left|right|both|none"
```

#### Band layout resolution

Use the already-resolved shell layout result:

- `layout.columns === 2` => `data-shell-band-layout="paired"`
- `layout.columns === 1` => `data-shell-band-layout="stacked"`

#### Slot visual-side resolution

Resolve `data-shell-slot-visual-side` from shell layout, band orientation, and effective column span — not from DOM order.

Rules:

```text
stacked / one column -> full

left-dominant + major -> left
left-dominant + minor -> right

right-dominant + minor -> left
right-dominant + major -> right

full span -> full
unknown / unsafe -> full
```

#### Slot edge-bleed resolution

Resolve `data-shell-slot-edge-bleed` as follows:

```text
visual-side="left"  -> left
visual-side="right" -> right
visual-side="full"  -> both
not eligible        -> none
```

Only the following occupants are eligible for edge bleed in this prompt:

```text
project-portfolio-spotlight
company-pulse
leadership-message
```

For all other occupants, emit `data-shell-slot-edge-bleed="none"`.

Do not apply edge-bleed behavior to Safety, HB Kudos, or People & Culture.

### Track B — Post-Hero Edge Styling Contract

Expose safe, reusable CSS variables at the shell level:

```css
--hb-homepage-shell-body-inset-inline
--hb-homepage-edge-safe-inline
--hb-homepage-edge-bleed-inline-start
--hb-homepage-edge-bleed-inline-end
```

Use existing inset variables where possible. Avoid duplicate sources of truth.

The goal is to give eligible child lanes an inspectable, shell-owned contract that says:

- where the slot visually sits;
- whether it is eligible to bleed;
- how much safe inline inset exists;
- how to avoid horizontal overflow.

This prompt may add shell CSS hooks/data attributes, but should avoid deep Foleon reader interior redesign. If a minimal host class is required in `FoleonHomepageLaneHost` to consume the slot attributes safely, implement only the minimum necessary host wrapper behavior and document it.

### Track C — Hero / Entry-Stack Edge Contract

Audit and verify the hero mount path.

If the hero is outside `HbHomepageShell`, do not force hero behavior through shell slot code.

Use `HbHomepageEntryStack` or the actual root/entry wrapper as the authority for hero edge behavior.

Add or preserve a wrapper-level data contract such as:

```text
data-hb-homepage-edge-mode="standard|edge-to-window"
data-hb-homepage-hero-edge="none|both"
```

Expose safe variables at the entry-stack level:

```css
--hb-homepage-entry-shared-inline-inset
--hb-homepage-edge-safe-inline
--hb-homepage-hero-edge-inline-start
--hb-homepage-hero-edge-inline-end
```

The implementation should allow the hero region to reach the available window/canvas edge when edge-to-window mode is active, while preserving internal safe content padding and preventing horizontal overflow.

If the correct root/entry wrapper cannot be safely modified in this pass, do **not** fake the behavior inside the shell. Instead:

1. document the exact blocker;
2. identify the files that must be changed next;
3. add tests for the post-hero shell contract only;
4. record the hero as a follow-up in `01_EDGE_CONTRACT_REPORT.md`.

### Track D — Mode Control

Prefer a non-breaking default.

If an existing config/property already governs homepage edge/full-bleed behavior, use it.

If no such config exists, implement one of the following in this order of preference:

1. an internal shell/entry-stack constant or typed policy object that can be promoted to property-pane config later;
2. a clearly named default policy that preserves current visual output unless enabled;
3. a documented follow-up if enabling visual edge-to-window by default would create unacceptable SharePoint canvas risk.

Do not add a broad, user-facing property-pane control unless the repo already has a standard pattern for this exact type of homepage shell policy.

## Recommended Implementation Shape

Prefer small pure helpers that can be directly unit-tested.

Example helper shape:

```ts
type ShellSlotVisualSide = 'left' | 'right' | 'full';
type ShellSlotEdgeBleed = 'left' | 'right' | 'both' | 'none';
type ShellBandLayoutMode = 'paired' | 'stacked';

function resolveShellBandLayoutMode(columns: 1 | 2): ShellBandLayoutMode;

function resolveShellSlotVisualSide(input: {
  columns: 1 | 2;
  orientation: 'left-dominant' | 'right-dominant';
  effectiveColumnSpan: 'full' | 'major' | 'minor';
}): ShellSlotVisualSide;

function resolveShellSlotEdgeBleed(input: {
  occupantId: OccupantId;
  visualSide: ShellSlotVisualSide;
}): ShellSlotEdgeBleed;
```

Do not over-engineer. The implementation may live near the shell renderer if that is the least invasive option, but pure helpers are preferred for coverage.

## CSS Requirements

Use CSS logical properties, container-aware rules, and shell-owned variables.

Acceptable concepts:

```css
margin-inline-start
margin-inline-end
padding-inline
inset-inline-start
inset-inline-end
calc()
max()
min()
container queries
data-attribute selectors
```

Avoid:

```css
width: 100vw;
left: 50%;
right: 50%;
margin-left: -50vw;
margin-right: -50vw;
overflow-x: hidden;
fixed pixel assumptions about SharePoint page width;
```

The desired behavior is edge-to-window/canvas within the actual SharePoint host constraints, not viewport hacks.

## Required Tests

Add or update tests proving the new contract.

At minimum cover:

1. Row 1 Project Spotlight:
   - paired left-dominant major slot resolves `visual-side="left"`;
   - edge bleed resolves `left`;
   - stacked mode resolves `visual-side="full"` and `edge-bleed="both"`.

2. Row 2 Company Pulse:
   - right-dominant major slot resolves `visual-side="right"` even though it is not simply inferred from DOM order;
   - edge bleed resolves `right`.

3. Row 3 Leadership Message:
   - paired left-dominant major slot resolves `visual-side="left"`;
   - edge bleed resolves `left`.

4. Non-eligible occupants:
   - Safety Field Excellence resolves `edge-bleed="none"`;
   - HB Kudos resolves `edge-bleed="none"`;
   - People & Culture resolves `edge-bleed="none"`.

5. Stacked mode:
   - all eligible Foleon lanes resolve `visual-side="full"` and `edge-bleed="both"`.

6. Existing shell contract:
   - existing shell attributes remain present;
   - protected row pairings remain unchanged;
   - default preset row placement remains unchanged.

7. Hero / entry-stack:
   - if implemented, test entry-stack attributes for edge mode and hero edge;
   - verify the hero remains a sibling/entry-stack region and is not incorrectly treated as a shell slot.

8. No-overflow proof:
   - add the strongest available DOM/code-level test;
   - if JSDOM cannot prove real layout geometry, document the limitation and add a Playwright/browser proof requirement in the report.

## Required Validation Commands

Use repo-native scripts where available. At minimum, run the narrowest relevant checks first, then broader checks if practical.

Suggested validation sequence:

```bash
pnpm test -- --runInBand apps/hb-webparts/src/webparts/hbHomepage/shell
pnpm test -- --runInBand apps/hb-webparts/src/webparts/hbHomepage
pnpm typecheck
pnpm lint
```

If exact scripts differ, inspect `package.json` and use the closest repo-approved commands.

Do not claim a command passed unless it actually ran and passed.

If unrelated pre-existing failures block broader checks, document:

- command run;
- failure summary;
- why it is unrelated;
- narrow checks that did pass.

## Required Documentation

Create:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/01_EDGE_CONTRACT_REPORT.md
```

The report must include:

```md
# 01 Edge Contract Report

## Objective

## Baseline Used

## Source Files Inspected

## Changes Implemented

## Hero vs Post-Hero Edge Authority

## Shell Slot Metadata Contract

## Edge-to-Window Styling Contract

## Hero / Entry-Stack Contract

## Tests Added or Updated

## Validation Commands and Results

## Hosted Proof Checklist

## Known Limitations

## Follow-Up Work

## Risk / Mitigation Notes

## Rollback Plan
```

The report must explicitly state whether the hero edge behavior was implemented or deferred, and why.

## Package / Versioning

If only TypeScript/CSS/test/docs changed inside source and package assets require rebuilding, follow existing package/version authority.

If package manifests or SPFx package versions must be bumped for a deployable `.sppkg`, do so only according to existing repo rules and document the reason.

If this pass only creates source/test/doc changes and no package artifact is generated, state that clearly.

Do not invent versioning requirements.

## Hosted Proof Checklist

Include a hosted proof checklist even if not executed locally:

```text
1. Deploy rebuilt hb-intel-homepage.sppkg if package version changed.
2. Open HBCentral homepage.
3. Confirm hero edge behavior according to selected edge mode.
4. Confirm Project Spotlight paired left slot exposes left bleed metadata.
5. Confirm Company Pulse paired right slot exposes right bleed metadata.
6. Confirm Leadership Message paired left slot exposes left bleed metadata.
7. Confirm stacked/mobile mode exposes both-side bleed metadata for eligible Foleon lanes.
8. Confirm Safety, HB Kudos, and People & Culture do not receive Foleon edge-bleed treatment.
9. Confirm no horizontal overflow at desktop, tablet, and phone widths.
10. Confirm keyboard focus outlines are not clipped.
```

## Required Final Response Format

When complete, report back using this structure:

```md
# Prompt 01 Execution Report

## Summary

## Files Changed

## Contract Added

## Hero Edge Status

## Tests / Validation

## Package / Version Impact

## Risks or Follow-Ups

## Commit Summary

## Commit Description
```

If no commit was made, say so and provide the recommended commit summary/description only if source/test/doc changes occurred.

## Commit Summary / Description Template

Use this format if source/test/doc changes were made:

```text
Summary: HbHomepage shell: add edge-to-window metadata contract for hero and Foleon lanes

Description:
Adds a non-breaking homepage edge contract that distinguishes post-hero shell slot edge behavior from hero/entry-stack edge behavior. Emits visual-side and edge-bleed metadata for eligible Foleon reader slots, preserves existing shell pairing and row-placement contracts, adds entry-stack hero edge metadata where safe, and documents validation/hosted proof requirements in the Foleon reader composition v2 report.
```
