# 01 — Current SafetyFieldExcellence Implementation Map

## 1. Runtime entrypoints

### Standalone mount path
`apps/hb-webparts/src/mount.tsx`
- Maps webpart id `89ca5ff3-21f4-4b23-a953-4b7306ea1029` to `SafetyFieldExcellence`.
- Wraps rendering in `HbcThemeProvider`.
- Supports standalone rendering outside the flagship homepage wrapper.

### Flagship homepage path
`mount.tsx` → `HbHomepage` → `HbHomepageEntryStack.tsx` → `HbHomepageShell.tsx` → `SafetyFieldExcellenceZone.tsx` → `SafetyFieldExcellence.tsx`

This matters because the homepage shell, not the Safety webpart itself, owns:
- row-sharing
- dominance
- band semantics
- slot width reality
- pairing vs stacking
- first-lane behavior

## 2. Consumer layer

### `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`
This is a thin integration consumer.

It owns:
- manifest-config fallback
- normalization call
- event-type → icon/severity/badge mapping
- loading state
- empty/invalid state handling
- translation of normalized items into `HbcOperationalSurface` props

It does **not** own:
- live data fetch
- fetch error state
- aggregate safety metrics
- drilldown/history strategy
- explicit compact/minimal render modes
- homepage shell policy

## 3. Data and normalization seams

### `operationalAwarenessContracts.ts`
Safety contract fields are intentionally small:
- title
- summary
- eventType
- metadata
- indicator
- freshness
- CTA
- featured/order/audiences

Missing compared with richer operational surfaces:
- images/media
- emphasis level
- grouping/clustering
- action family
- severity source separate from event type
- region/site/project attribution
- owner/assignee/escalation metadata
- aggregate KPI strip
- archive/history affordance
- companion summary CTA

### `operationalAwarenessConfig.ts`
Normalization does:
- basic validation
- audience filtering
- freshness resolution
- sorting by featured/order/recency/title
- capping secondary items

It does **not** synthesize:
- “top risk” summary
- status roll-up
- stale-bucket reordering beyond simple labels
- grouped sections
- compact/minimal model variants
- command/action grouping

## 4. Authoring and governance seam

### `authoringGovernance.ts`
Safety is governed as:
- zone: `operationalAwareness`
- owner: Safety and Field Excellence
- freshness cadence: weekly
- intent: “Safety and field signal awareness”

Authoring messages only cover:
- `noData`
- `invalid`

Notably absent:
- explicit fetch/runtime failure handling
- richer authoring guidance on escalation, freshness tiers, or safety hierarchy

## 5. Shared UI surface seam

### `packages/ui-kit/src/HbcOperationalSurface/index.tsx`
The shared surface provides:
- masthead
- severity strip
- featured block
- “Active signals” header
- signal list rows
- optional CTA

This is a strong reusable base compared with stock Fluent cards, but it remains a **single-surface card grammar**.

### `operational-surface.module.css`
The surface is heavily opinionated through CSS:
- white background
- elevated card shadow
- border-left accent
- featured card inside root card
- hardcoded brand/severity values
- viewport media queries
- a `safetyHomepage` modifier that mostly tightens scale/padding

The modifier solves proportion issues but does not create true container-aware application modes.

## 6. Homepage shell seams

### `SafetyFieldExcellenceZone.tsx`
A very thin zone wrapper around `SafetyFieldExcellence`.

### `occupantRegistry.ts`
The shell contract currently defines Safety as:
- `prominenceCeiling: 'supporting'`
- `firstLaneEligible: false`
- `supportsCompact: true`
- `pairedLayoutEligible: true`
- `narrowestStablePairedWidth: 320`
- `allowedBandSemantics: ['operational-spotlight', 'communications-newsroom']`
- locked by default to `communications-newsroom` secondary role

This is one of the most important findings in the audit.

### `defaultPreset.ts`
The default flagship homepage layout places Safety in:
- Row 2
- `communications-newsroom`
- secondary / minor column
- next to Company Pulse primary / major

That is not a safety-led operational posture.

### `presetLibrary.ts`
Alternative presets exist, including an operations/safety-focused preset, but the approved default remains newsroom-led for Safety placement.

## 7. Manifest and packaging seam

### `SafetyFieldExcellenceWebPart.manifest.json`
The adjacent manifest exists, which is doctrine-compliant.
But the manifest also reveals how small the authored default model is:
- one featured recognition
- one secondary reminder
- no richer safety grammar
