# Prompt 03 — Upgrade Homepage Local Shells and Clusters

## Objective

Upgrade the homepage-local composition layer in `apps/hb-webparts/src/homepage/shared/` so it actually takes advantage of the stronger Phase A shared system.

The goal is to eliminate the current weakness where several shared homepage shells are little more than semantic wrappers with minimal authored styling.

---

## First Instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Required Starting Context

Use the repo truth as modified by Prompts 01 and 02.

At minimum, work from:

- `apps/hb-webparts/src/homepage/shared/index.ts`
- `apps/hb-webparts/src/homepage/shared/HomepageSectionShell.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageRailShell.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageTopBandPair.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageCuratedContentCluster.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageOperationalAwarenessCluster.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageDiscoveryCluster.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageUtilityDenseGroup.tsx`
- `apps/hb-webparts/src/homepage/tokens.ts`
- the new shared homepage primitives added to `@hbc/ui-kit/homepage`

Also inspect any adjacent files needed to refactor these correctly.

---

## Required Tasks

### 1. Upgrade section shells
`HomepageSectionShell` and any related wrappers must stop reading like near-bare semantic markup.

They should gain:

- a real section-intro treatment
- stronger title/subtitle rhythm
- optional action slot if appropriate
- spacing and structure that help zones read like designed sections, not just stacked blocks

Use the new shared homepage primitives where appropriate.

### 2. Upgrade rail and pair shells
`HomepageRailShell` and `HomepageTopBandPair` should gain stronger composition behavior and visual rhythm.

They must remain lane-safe and page-canvas-safe.

### 3. Upgrade shared content clusters
`HomepageCuratedContentCluster` and `HomepageOperationalAwarenessCluster` are currently too similar and too generic.

Refactor them so they consume the new shared language and create better featured/secondary distinction without becoming full bespoke redesigns.

The result should be materially stronger, but still shared and reusable.

### 4. Upgrade discovery shared composition
`HomepageDiscoveryCluster` should adopt the improved shared CTA/icon/metadata/tile/row language and stop relying on basic input/list/card presentation patterns where stronger shared primitives now exist.

### 5. Upgrade utility grouping
`HomepageUtilityDenseGroup` and any adjacent utility grouping helper should consume the new shared language and improve scan rhythm, hierarchy, and affordance.

### 6. Clean up local tokens if needed
Refactor `apps/hb-webparts/src/homepage/tokens.ts` only as needed to align with the new shared system.

Do not leave contradictory local styling patterns in place if they should now be shared.

At the same time, do not strip out local tokens that still legitimately belong to homepage-local composition.

---

## Design Intent

This prompt is where the homepage shared layer should stop feeling “mostly wrappers” and start feeling like a real composition system.

The desired result is:

- stronger hierarchy
- better section rhythm
- better surface distinction
- better visual cadence between featured and secondary content
- better utility/discovery scannability

But this prompt must still avoid bespoke one-off redesign work that belongs to later phases.

---

## Hard Constraints

- Do not redesign individual webpart content models here.
- Do not add shell chrome.
- Do not introduce lane-boundary violations.
- Do not over-promote local package-specific choreography into ui-kit during this prompt unless absolutely necessary and justified.
- Do not break authoring-safe defaults and empty/loading/error-state behavior.

---

## Deliverables for This Prompt

By the end of this prompt, the homepage-local shared layer should be materially upgraded and aligned to the new shared homepage primitives.

---

## Acceptance Criteria

- section shells no longer read as minimally styled wrappers
- content clusters are more differentiated and better structured
- discovery and utility shared patterns consume the stronger Phase A shared language
- local tokens and shared primitives are aligned rather than contradictory
- build/lint/type-check remain viable

---

## Completion Note

At the end, produce a concise completion note that states:

- which local shared files were materially upgraded
- what stayed local by design
- what consumer migrations remain for Prompt 04

