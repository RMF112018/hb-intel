# Prompt 04 — Redesign Smart Search / Wayfinding

## Objective

Redesign `SmartSearchWayfinding` so it becomes a clearly premiumized discovery surface with stronger search posture, stronger promoted-destination treatment, stronger quick paths, and stronger category-group presentation.

The final result must stop reading like a search input followed by basic lists.

---

## First Instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Required Starting Context

Use the repo truth as modified by Prompts 01–03.

At minimum, work from:

- `apps/hb-webparts/src/webparts/smartSearchWayfinding/SmartSearchWayfinding.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageDiscoveryCluster.tsx`
- `apps/hb-webparts/src/homepage/helpers/discoveryConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/discoveryContracts.ts`
- `packages/ui-kit/src/homepage.ts`
- any shared search / destination-tile / icon / metadata primitives available after Prompt 01

Inspect adjacent files as needed.

---

## Required Tasks

### 1. Strengthen the top-of-surface search posture
Make the search entry feel deliberate and premium.

The search area should feel like the anchor of the surface, not an input dropped above lists.

This may include:
- stronger search-field framing
- clearer section heading / strategy label relationship
- better spacing and information hierarchy
- better no-results posture

### 2. Upgrade Quick Paths
Quick Paths must stop reading like a bulleted list of links.

Convert them into a stronger shortcut pattern:
- quick-path rows
- compact shortcut tiles
- or another clearly superior homepage-safe model

### 3. Upgrade Promoted Destinations
Promoted destinations should be one of the visual anchors of the discovery surface.

Redesign them as true destinations with:
- icon treatment
- stronger title/description hierarchy
- clearer directional affordance
- more premium card/row posture

### 4. Upgrade category-group presentation
Category groups should be easier to scan, easier to navigate, and less list-like.

Improve:
- category section framing
- resource-item hierarchy
- spacing rhythm
- icon treatment
- supporting description treatment

### 5. Preserve current discovery behavior
Keep:
- config normalization
- active audience filtering
- query filtering behavior
- loading states
- empty/no-results states
- author-safe defaults
- SPFx-safe rendering behavior

Do not turn this into speculative global search architecture.

---

## Design Intent

The target is a discovery surface that feels:
- curated
- navigationally confident
- premium
- fast to scan
- more like a product discovery panel and less like a generic content list

---

## Hard Constraints

- do not introduce shell chrome
- do not create lane-boundary violations
- do not invent enterprise-search backend behavior that does not exist
- do not regress keyboard access, focus, or reduced motion behavior
- do not make the surface visually noisy or too app-like for homepage use

---

## Deliverables for This Prompt

By the end of this prompt, `SmartSearchWayfinding` should be materially redesigned and clearly stronger than current repo truth.

---

## Acceptance Criteria

- the surface no longer reads like a search input plus basic lists
- Quick Paths are premiumized
- Promoted Destinations are premiumized
- category-group presentation is materially stronger
- all functional behavior remains intact
- lint/build/type-check remain viable

---

## Completion Note

At the end, produce a concise completion note that states:

- which files were materially changed
- what discovery/wayfinding pattern was adopted
- how Quick Paths and Promoted Destinations were improved
- any follow-ons intentionally deferred
