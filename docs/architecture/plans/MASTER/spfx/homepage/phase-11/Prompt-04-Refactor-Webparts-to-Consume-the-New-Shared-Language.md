# Prompt 04 — Refactor Homepage Webparts to Consume the New Shared Language

## Objective

Refactor the homepage webpart components so they consume the upgraded Phase A shared system.

This prompt should make the actual homepage surfaces materially better by applying the new shared primitives and upgraded local composition layer.

This is still **Phase A**, not full bespoke redesign. Refactor with discipline.

---

## First Instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Required Starting Context

Use the repo truth as modified by Prompts 01–03.

At minimum, work from:

- all affected files in `apps/hb-webparts/src/webparts/*`
- `apps/hb-webparts/src/homepage/shared/*`
- `apps/hb-webparts/src/homepage/tokens.ts`
- `packages/ui-kit/src/homepage.ts`
- any new shared primitive files added during Prompt 02

Prioritize these homepage surfaces:

- `personalizedWelcomeHeader`
- `hbHeroBanner`
- `priorityActionsRail`
- `toolLauncherWorkHub`
- `companyPulse`
- `leadershipMessage`
- `peopleCulture`
- `projectPortfolioSpotlight`
- `safetyFieldExcellence`
- `smartSearchWayfinding`

---

## Required Tasks

### 1. Replace weak shared usage
Where a homepage webpart is still leaning on:
- generic `HbcCard` posture
- plain CTA links
- weak metadata presentation
- placeholder icon treatment
- minimal section/cluster styling

migrate it to the stronger shared/local Phase A language.

### 2. Fix utility and discovery affordances
The utility and discovery surfaces are the biggest risk areas for “plain intranet links in boxes.”

Refactor them so they use:
- proper shared action/destination/icon affordances
- better scan rhythm
- better hierarchy
- better status/metadata structure

### 3. Strengthen top-band consumption without doing full Phase B redesign
For `PersonalizedWelcomeHeader` and `HbHeroBanner`, apply the new Phase A shared language so they stop feeling like generic cards.

Do not perform the full signature top-band redesign yet.
Do implement the shared-system improvements needed to support that future work.

### 4. Strengthen editorial and operational consumption
For communications and operational surfaces, migrate them to the improved featured/secondary/shared metadata/shared CTA/shared signal language where appropriate.

Do not convert them into one-off bespoke layouts unless the current implementation is impossible to fix otherwise.

### 5. Preserve all functional behavior
Keep:
- config normalization
- loading states
- empty states
- author-safe behavior
- active audience logic
- recency/freshness behavior
- reduced-motion behavior
- existing SPFx-safe rendering behavior

---

## Migration Standard

When deciding whether to change a webpart, use this standard:

- if the weakness is shared and repeatable, solve it through the new shared/local Phase A system
- if the weakness is unique and would require bespoke choreography, defer it unless it blocks Phase A quality uplift
- do not leave obvious placeholder-grade UI behind if the new shared system can solve it now

---

## Hard Constraints

- do not alter lane boundaries
- do not add shell chrome
- do not introduce root `@hbc/ui-kit` imports into homepage consumers
- do not regress packaging-sensitive seams
- do not create a mix of half-migrated and fully migrated visual patterns; migrate deliberately enough that the homepage still feels coherent

---

## Deliverables for This Prompt

By the end of this prompt, the homepage webparts should materially reflect the new Phase A shared system.

The result should be visibly stronger than the current repo truth while still clearly leaving room for later top-band and per-webpart premiumization phases.

---

## Acceptance Criteria

- all major homepage webparts now consume the stronger shared/local Phase A system where appropriate
- utility/discovery surfaces no longer rely on placeholder iconography or weak list-like action presentation
- top-band surfaces are stronger without overreaching into full redesign
- editorial and operational surfaces have better shared hierarchy and metadata/CTA treatment
- all functional behavior remains intact
- lint/build/type-check remain viable

---

## Completion Note

At the end, produce a concise completion note that states:

- which webparts were materially refactored
- any surfaces intentionally deferred for later phases
- any follow-ons that should be carried into Phase B or C

