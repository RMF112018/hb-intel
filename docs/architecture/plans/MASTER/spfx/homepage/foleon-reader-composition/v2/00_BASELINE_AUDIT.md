# Prompt 00 — Repo-Truth and Screenshot Baseline Audit

> Wave: Foleon reader composition v2
> Source of truth: `RMF112018/hb-intel` `main` branch, live at audit time.
> Pass type: read-only baseline audit. No source, manifest, version, or commit changes.

## 1. Scope and method

This audit fixes the baseline before implementation work proceeds on Foleon reader composition inside the HB Homepage SPFx flagship. It enumerates the live composition tree, the cumulative inset stack between the window edge and the iframe surface, and the hero / shell edge-authority split. All findings cite live file paths and line numbers.

In scope:

- `packages/foleon-reader/src/readers/**` and `FoleonEmbeddedReaderLane.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/**` shell, zones, and entry-stack files
- `apps/hb-webparts/src/webparts/hbSignatureHero/**` hero adapters
- existing tests covering shell pairing, no-overflow, Foleon preview composition

Out of scope (not changed and not audited beyond what was already in context): SharePoint list schemas, Foleon iframe gate / governance, Foleon route map, backend sync, Safety Field Excellence, HB Kudos, People & Culture.

## 2. Screenshot observations

The three baseline screenshots used as visual context for this audit:

- `screenshots/project_spotlight_preview_context.png`
- `screenshots/company_pulse_preview_context.png`
- `screenshots/leadership_message_preview_context.png`

Observations:

- All three previews render the `FoleonReaderPreview` / `readerPreviewFallback` composition described in §3.7: a tone-tinted gradient panel with an eyebrow, large title, summary copy, a status rail, and a feature/support card layout.
- Each preview sits inside a paired homepage band with a clearly inset gutter on both sides — content does not bleed to the window edge. The visible "stand-off" matches the cumulative stack of `HbHomepageShell` body inset (§3.6) + `FoleonReaderModule` `.shell` padding (28px) + `.chrome` border (1px) + `.chrome` radius corner softening.
- The hero band visible above each preview reaches further out toward the window than the Foleon panels do — consistent with the hero region's lighter inline-inset variable in `HbHomepageEntryStack` (§3.8) versus the shell body's heavier inline-inset on `.shell` (§3.6).
- No preview screenshot shows full-bleed (edge-to-window) rendering. Today's rendering is "centered with gutters" on every Foleon lane.

> Note on screenshot files: the three referenced PNGs were not located inside the live `screenshots/` directory of the repo at audit time. The audit treats them as the user-supplied visual baseline (provided externally to the repo) rather than checked-in artifacts. This is recorded as a minor risk in §7.

## 3. Repo-truth findings

### 3.1 Preview component structure

There are two preview surfaces inside the foleon-reader package, and they are deliberately distinct:

- `packages/foleon-reader/src/readers/FoleonReaderPreview.tsx` — the standalone preview component (used for visual scaffolding / tone-driven preview rendering with no live iframe).
- The `readerPreviewFallback` block inside `packages/foleon-reader/src/readers/FoleonReaderModule.module.css:145-172` — the in-module preview composition that renders when the runtime contract has not yielded a ready record.

Both preview paths share tone-driven CSS variables (`--preview-accent`, `--preview-radius-lg`, `--preview-space-lg`, etc.) and a shared visual vocabulary: gradient background, rounded chrome (28px default radius), 28px outer padding, and a banner + layout + support-cards composition.

Tone variants for the preview path live at `FoleonReaderModule.module.css:174-199`:

- `.readerPreviewSpotlight` — blue brand palette
- `.readerPreviewPulse` — orange palette
- `.readerPreviewLeadership` — navy executive palette

### 3.2 Production component structure

Three thin per-lane wrappers exist and pass through to a shared module:

- `packages/foleon-reader/src/readers/ProjectSpotlightReader.tsx`
- `packages/foleon-reader/src/readers/CompanyPulseReader.tsx`
- `packages/foleon-reader/src/readers/LeadershipMessageReader.tsx`

Each wrapper is a pure factory that assigns `tone` and `pageContext`, then renders the shared `FoleonReaderModule`. None of the wrappers add chrome, padding, or borders of their own.

`packages/foleon-reader/src/readers/FoleonReaderModule.tsx` owns all production chrome (the iframe-facing shell). All chrome rules live in the sibling CSS module described in §3.7.

### 3.3 Lane dispatch flow

`packages/foleon-reader/src/FoleonEmbeddedReaderLane.tsx:23-31` is a flat dispatch:

```ts
if (props.lane === 'projectSpotlight') return <ProjectSpotlightReader {...props} />;
if (props.lane === 'companyPulse')     return <CompanyPulseReader {...props} />;
return <LeadershipMessageReader {...props} />;
```

The lane component holds **zero** chrome. It does not wrap the chosen reader in any padding, border, max-width, or class. All visual layering downstream of this dispatch belongs to `FoleonReaderModule` (production) or `FoleonReaderPreview` / the in-module preview block (preview).

### 3.4 Homepage zone mounting flow

The flow into Foleon, top-down:

1. `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx` → `HbHomepageEntryStack`.
2. `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx` mounts the hero region, the priority-actions launcher band, and `HbHomepageShell` as **sibling regions** under one outer envelope (`HbHomepageEntryStack.tsx:54-128`).
3. `HbHomepageShell` resolves the active preset, computes pairing/orientation per band, and looks up each occupant in `ZONE_COMPONENTS`.
4. The Foleon-aware zones — `CompanyPulseZone`, `ProjectSpotlightZone` (or its current equivalent under `zones/`), `LeadershipMessageZone` — render `FoleonHomepageLaneHost`.
5. `FoleonHomepageLaneHost` instantiates the runtime contract and renders `FoleonEmbeddedReaderLane` with the matching `lane` key.
6. `FoleonEmbeddedReaderLane` dispatches into the per-tone reader component (§3.3).
7. The per-tone reader renders `FoleonReaderModule`, which owns the chrome stack and either mounts the iframe via `FoleonIframeHost` (ready record) or renders the preview composition (fallback).

### 3.5 Default preset row/slot placement

`apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts:12-82` defines a locked three-row flagship layout. Slot order in the source is the DOM order of slots in each band; orientation flips column placement only.

| Row | Band id | Recipe | Orientation | Slot 0 (DOM) | Slot 1 (DOM) |
|---|---|---|---|---|---|
| 1 | `band-row-1-operational-spotlight` | `feature-pair` | `left-dominant` | `project-portfolio-spotlight` (major) | `hb-kudos` (minor) |
| 2 | `band-row-2-communications-newsroom` | `feature-pair` | `right-dominant` | `safety-field-excellence` (minor) | `company-pulse` (major) |
| 3 | `band-row-3-communications-editorial` | `asymmetric-two-up` | `left-dominant` | `leadership-message` (major) | `people-culture-public` (minor) |

Foleon-served occupants: `project-portfolio-spotlight`, `company-pulse`, `leadership-message` (rows 1, 2, 3 respectively).

### 3.6 Shell padding and gap layers — post-hero shell body

`HbHomepageShell.module.css:16-32` defines the post-hero shell body envelope. The shell body inset is region-scoped — it does **not** govern the hero region above it. The CSS module's own header comment at lines 1-14 calls this out: the shell uses container queries `homepage-shell` (768/1180/1600/1900) only for density, and runtime first-lane pairing decisions are owned by `shell/breakpointPolicy.ts`.

Inline-inset variable progression for the shell body:

| Container width | `--hb-homepage-shell-body-inset-inline` | `--hb-homepage-shell-body-inset-block` | Band gap |
|---|---|---|---|
| default (mobile) | 1rem | 1.5rem | 2rem |
| ≥ 768px | 1.5rem | 2rem | 2.5rem |
| ≥ 1180px | 1.75rem | 2.5rem | 3rem |
| ≥ 1600px | 2.5rem | (inherits 2.5rem) | 3.25rem |
| ≥ 1900px | 3rem | (inherits 2.5rem) | 3.5rem |

Source: `HbHomepageShell.module.css:22-23, 34-62`.

Band-level horizontal layer (paired bands):

- `.band` default `gap: 1.5rem` (`HbHomepageShell.module.css:68-72`).
- `.bandOrientation_left_dominant` / `.bandOrientation_right_dominant` activate at `min-width: 940px` with `2fr 1fr` / `1fr 2fr` columns and `gap: 1.5rem` (lines 99-128); gap upgrades to 2rem / 2.25rem / 2.5rem at 1180/1600/1900px (lines 111-135).
- `.entryBand` overrides band gap to `2rem` (default) / `2.5rem` at ≥ 768px (lines 139-147).

The shell body comment at `HbHomepageShell.module.css:29` is unambiguous: *"Outer envelope authority is wrapper-owned (HbHomepageEntryStack)."* The shell does **not** own the page-canvas envelope.

### 3.7 Reader chrome layers — `FoleonReaderModule.module.css`

Cumulative inset stack inside the production reader, outside-in:

| Layer | File:line | Property | Value |
|---|---|---|---|
| `.shell` (module envelope) | `FoleonReaderModule.module.css:1-8` | `padding` | `28px` |
| `.shell` | line 2 | `min-height` | `640px` |
| `.shell` | lines 4-6 | `background` | radial + linear gradients (brand 50 + ink) |
| `.chrome` | lines 10-16 | `border` | `1px solid color-mix(... var(--hbc-border) 78% ...)` |
| `.chrome` | line 12 | `border-radius` | `26px` (default) |
| `.spotlight .chrome` | line 19 | `border-radius` | `34px` |
| `.pulse .chrome` | line 23 | `border-radius` | `22px` |
| `.leadership .chrome` | line 27 | `border-radius` | `30px` |
| `.chrome` | line 15 | `box-shadow` | `0 22px 70px rgb(24 44 62 / 14%)` |
| `.hero` (header) | lines 31-37 | `padding` | `28px` (default) |
| `.pulse .hero` | line 41 | `padding` | `22px` |
| `.leadership .hero` | line 46 | `padding` | `26px` |
| `.hero` | line 36 | `border-bottom` | `1px solid var(--hbc-border)` |
| `.readerStage` (iframe parent) | lines 117-120 | `padding` | `18px`, `background: #111a22` |
| `.spotlight .readerStage` | line 123 | `padding` | `24px` |
| `.frameWrap` | lines 126-130 | `border-radius` | `18px`; `overflow: hidden`; `background: #ffffff` |
| Iframe | `FoleonIframeHost.tsx` (dynamic) | inline | `width: 100%`, dynamic height |

Mobile (≤ 720px) collapses `.readerStage` until `data-open='true'` and shows `.mobileCard` instead (`FoleonReaderModule.module.css:520-547`). On mobile, the outer `.shell` padding drops to 16px (line 521-523).

The preview path uses an analogous but separately-tuned stack on `.readerPreviewFallback` (lines 145-172): 28px padding default, 1px border, 28px radius, `0 24px 72px` shadow, with media-query escalations to 34px @1440px (line 405) and de-escalation to 26px @1024-1439px (line 416), 16px @599px (line 454), 12px @359px (line 503).

### 3.8 Hero mount path — outside `HbHomepageShell`

The hero is mounted in `HbHomepageEntryStack.tsx:73-94` as a sibling region of the shell, not inside it:

```
HbHomepage
└── HbHomepageEntryStack    [<div class=".entryStack" max-width: 2400px>]
    ├── <section class=".heroRegion" data-...region="hero">
    │   └── HbSignatureHero
    │       └── HbSignatureHeroHomepage
    ├── <section class=".actionsRegion" data-...region="priority-actions">
    │   └── HbHomepageLauncherBand
    └── <div class=".shellRegion" data-...region="shell">
        └── HbHomepageShell                          [<div class=".shell" data-shell-post-hero="true">]
            └── ShellBandRenderer → bands → slots → zones → FoleonHomepageLaneHost → ...
```

Hero edge-constraint stack, outermost-in:

| Layer | File:line | Property | Value |
|---|---|---|---|
| `.entryStack` outer envelope | `HbHomepageEntryStack.module.css:25-40` | `max-width` | `2400px` (`--hb-homepage-outer-envelope-max-width`) |
| `.entryStack` margin | line 38 | `margin` | `0 auto` (centers the envelope) |
| `.heroRegion` | lines 42-46 | `padding` | `0 var(--hb-homepage-entry-shared-inline-inset)` |
| `--hb-homepage-entry-shared-inline-inset` | line 30 | aliased to `--hb-homepage-actions-inset-inline` | `1rem` (default) |
| `--hb-homepage-actions-inset-inline` | lines 70, 78, 86, 94 | container-tier values | `1.25rem` @ 768; `1.75rem` @ 1180; `2.125rem` @ 1600; `2.75rem` @ 1900 |
| Hero `.surface` / `.content` (signature-hero module) | hero CSS module (signature-hero) | additional inner padding | hero-owned (per region marker `data-hb-homepage-region-inset-policy="hero-surface-owned"` at line 77) |

Two key points:

1. The hero and the shell are **siblings** under `.entryStack`. Neither lives inside the other.
2. The hero's inline inset and the shell body's inline inset are **independent CSS variables**:
   - hero region: `--hb-homepage-entry-shared-inline-inset` (1rem → 2.75rem)
   - shell body: `--hb-homepage-shell-body-inset-inline` (1rem → 3rem)
   They scale on similar but **not identical** breakpoints (entry stack: 768/1180/1600/1900 with a max-width 719 step; shell: 768/1180/1600/1900). At ≥ 1180px the values diverge by intent (1.75rem hero vs 1.75rem shell — currently equal at 1180, then drift to 2.125 vs 2.5 at 1600, and 2.75 vs 3 at 1900).

## 4. Layer-of-change map

### 4.1 What governs Foleon reader edge bleed

When a Foleon lane reaches the user, the gutter between the window edge and the iframe is the **sum** of:

1. The outer envelope offset from window (CSS centering inside `2400px` cap, line 37 of `HbHomepageEntryStack.module.css`).
2. The shell body inline inset (`--hb-homepage-shell-body-inset-inline`, 1–3rem, `HbHomepageShell.module.css:22-23, 34-62`).
3. The band's slot column allocation (paired vs stacked, `HbHomepageShell.module.css:99-135`).
4. The Foleon module `.shell` padding (28px / 16px on mobile, `FoleonReaderModule.module.css:1-8, 521-523`).
5. The Foleon `.chrome` border + border-radius (1px + 22-34px, lines 10-29).
6. The Foleon `.readerStage` padding (18-24px, lines 117-124).
7. The Foleon `.frameWrap` 18px radius (lines 126-130).

To reduce or escape that gutter for a Foleon lane, the change must land in one of these owners:

- **foleon-reader package** — modify the `FoleonReaderModule` chrome stack (most targeted; cleanest tone-aware control).
- **shell body** — modify `--hb-homepage-shell-body-inset-inline` (broad blast radius — affects all post-hero occupants, not just Foleon lanes; not recommended for a Foleon-specific fix).
- **slot/orientation/recipe layer** — could expose a "full-bleed slot" mode at the shell level (medium blast radius — touches preset + recipe + CSS).

### 4.2 What governs hero edge-to-window

The hero's edge-to-window behavior is **not** controlled by `HbHomepageShell`. It is controlled by `HbHomepageEntryStack`:

- The outer envelope max-width (`HbHomepageEntryStack.module.css:28, 37`).
- The hero region inline padding (`HbHomepageEntryStack.module.css:42-46`).
- The shared inline-inset variable (`HbHomepageEntryStack.module.css:30, 70, 78, 86, 94`).
- Hero-internal inset rules in the `hbSignatureHero` CSS module (region marker `data-hb-homepage-region-inset-policy="hero-surface-owned"`, `HbHomepageEntryStack.tsx:77`).

To make the hero go full-bleed (or change its edge cadence) the change must land in `HbHomepageEntryStack` and/or the hero's own CSS module — **not** in `HbHomepageShell.module.css`.

## 5. Assumption check — hero/post-hero edge-authority split

> User assumption: *"shell styling is required for edge-to-window behavior"*

**This is partially correct, with an explicit split:**

- `HbHomepageShell` governs the **post-hero/Foleon shell body** envelope (`.shell` padding, band gaps, paired-grid layout). It is the right place to change edge behavior **for occupants that live inside the shell**, including all three Foleon lanes.
- `HbHomepageEntryStack` governs the **hero region and the shared edge alignment** for the homepage canvas (outer envelope max-width, hero region inline padding, the shared inline-inset variable that aligns the launcher band with the shell below). It is the right place to change **hero edge-to-window behavior**.

`HbHomepageShell` does **not** alone control full-window edge behavior. Any change framed as "shell styling controls edge-to-window" should be split: shell rules for the Foleon lanes; entry-stack rules for the hero. Neglecting that split is the single highest-likelihood source of regressions in the upcoming wave.

## 6. Existing test coverage

Foleon reader composition / preview:

- `packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx` — tone preview structure (spotlight / pulse / leadership), iframe lifecycle on ready desktop record, mobile lazy-mount gating, three-lane composition without globals, package independence.

Shell pairing / orientation / closure:

- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/protectedRowPairings.test.ts` — locks the three-row preset and orientation per row.
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/bandOrientation.test.ts` — 2:1 paired ratio, narrowest-stable-paired thresholds.
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/threeRowComposition.closure.test.ts` — closure proof: each occupant appears once, no extras / gaps.
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/slotComfortResolver.test.ts` — desktop pair / tablet stack / phone stack thresholds.
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/entryStackPolicy.test.ts` — first-lane pairing decision and hero height budgets per entry state.
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/shellClosureProof.test.ts` — width accounting attributes (`SHELL_WIDTH_SOURCE`, `SHELL_WIDTH_ACCOUNTING_RULE`).

Composition / zone seam:

- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.zoneProps.test.tsx` — zoneProps forwarding from shell to zone components.
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.previewFallbackRoute.test.tsx` — preview fallback route through real zone render.
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepageEntryStack.test.tsx` — hero region attributes, DOM order, region-level inset policies.
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepageLauncherBand.test.tsx` — launcher band order between hero and shell, entry-state threading.
- `apps/hb-webparts/src/webparts/hbHomepage/zones/__tests__/FoleonHomepageLaneHost.test.tsx` — Foleon lane mapping into shell occupant slots; occupant content state plumbing.
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/useShellContainer.test.ts` — usable shell width math, entry-state thresholds, inset accounting.

Coverage gaps relevant to the upcoming wave:

- No test directly asserts a "no-overflow" rendering invariant on the rendered DOM (overflow prevention currently relies on `box-sizing: border-box` + container-query density rules + width-accounting attributes).
- No test pins the cumulative `FoleonReaderModule` chrome inset stack — a tone-aware chrome change today would not be caught by the existing suite unless it happens to break preview tone markers.
- No snapshot or visual-regression coverage for the homepage composition (no Storybook / Playwright fixtures observed for this surface).
- No test asserts hero/shell edge-alignment via the shared inline-inset variable; a regression there would land silently.

## 7. Risks before implementation

1. **Path drift in plan corpus.** The implementation prompt corpus lives at `docs/architecture/plans/MASTER/spfx/foleon-manage/phase-04/**` (per current repo state); the prompt references `spfx/foleon/phase-04/`. The implementation README's canonical path should be confirmed before writing further wave artifacts.
2. **Two-owner edge stack.** Anyone reading "fix Foleon edge bleed" as "edit `HbHomepageShell.module.css`" without recognizing the entry-stack split (§5) will likely either (a) over-trim hero/shell alignment, or (b) miss the foleon-reader chrome stack entirely.
3. **Tone-scoped chrome.** Three lanes share a single `FoleonReaderModule.module.css`. A naïve global chrome change in that module bleeds into all three tones. Tone-aware adjustments must use the existing `.spotlight`, `.pulse`, `.leadership` selectors.
4. **Mobile lazy-mount.** The iframe stage hides on mobile (`FoleonReaderModule.module.css:520-547`) and is replaced by a `.mobileCard` placeholder. Edge-bleed work must verify both the desktop iframe path and the mobile activation path; covering only desktop will miss mobile regressions.
5. **Preview path is structurally separate from production chrome.** The `.readerPreviewFallback` block (`FoleonReaderModule.module.css:145-172`) has its own padding/border/radius and its own breakpoint media queries (`@media (min-width: 1440px) { padding: 34px }`, etc.). A tone-aware production change does not automatically cover the preview surface — and vice versa.
6. **No visual-regression or no-overflow assertions.** Regressions in the cumulative inset stack will not surface as failing tests today. The test plan for this wave should add at least one DOM-level assertion that the rendered Foleon lane respects the expected inset stack (and ideally a snapshot/visual-regression rig).
7. **Screenshot files not present in repo.** The three preview-context PNGs referenced as required input were not located inside `screenshots/` in the live tree. The audit treats them as user-supplied externally — if they are intended as canonical artifacts, they should be either committed under `screenshots/` or referenced from the implementation plan README.
8. **Width-accounting attribute contract.** `useShellContainer` and `shellClosureProof` already encode the expected width-accounting rule (`authoritative-minus-shell-inline-inset`). Any change to the shell body inline inset must also update the width-accounting reasoning, or the closure proof will fail.

## 8. Verification

- File created at `docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md`.
- No source, manifest, version, or commit change made by this prompt.
- Citations spot-checked against live source (`HbHomepageEntryStack.module.css:25-46`, `HbHomepageShell.module.css:16-62`, `FoleonReaderModule.module.css:1-32, 117-130, 145-172, 520-547`, `defaultPreset.ts:12-82`, `FoleonEmbeddedReaderLane.tsx:23-31`, `HbHomepageEntryStack.tsx:54-128`).
