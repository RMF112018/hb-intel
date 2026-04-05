# Phase C Implementation Plan Summary — Homepage Utility / Discovery Premiumization

## Objective

Implement the **utility / discovery corrections and upgrades** required to make the HB Central homepage feel like a premium internal product rather than a set of functional links inside generic boxes.

This phase exists to solve one of the clearest remaining UI problems identified in the audit:

> the utility and discovery surfaces are operationally useful, but they still read too much like plain link lists, placeholder navigation treatments, and lightly upgraded SharePoint utilities.

Phase C must substantially improve the utility and discovery experience while staying inside the current SharePoint/SPFx lane boundaries.

---

## Why Phase C Matters

These surfaces are disproportionately important because they are the parts of the homepage people are most likely to use every day:

- **Priority Actions Rail** determines whether “what I need to do now” feels clear and deliberate.
- **Tool Launcher / Work Hub** determines whether key destinations feel like a real product surface or a list of links.
- **Smart Search / Wayfinding** determines whether discovery feels curated, modern, and trustworthy.

If these surfaces stay visually weak, the homepage will continue to feel under-authored even if other zones improve.

---

## Phase C Scope

### Core target
Upgrade the homepage's utility and discovery surfaces so they become:

- clearer
- faster to scan
- more premium in posture
- more deliberate in hierarchy
- more navigationally expressive
- less dependent on plain text-link presentation

### Intended outputs
- stronger action-row patterns for the priority rail
- stronger launcher/destination tiles or rows for the work hub
- stronger search/discovery composition for wayfinding
- better shared icon treatment
- better metadata/status handling
- cleaner distinction between primary actions, supporting actions, destinations, and discovery content
- validation/docs/closeout

---

## Process Overview

1. establish the final Phase C utility/discovery architecture against current repo truth
2. redesign the Priority Actions Rail using the shared system already established in the repo
3. redesign the Tool Launcher / Work Hub with real launcher affordances and non-placeholder icon treatment
4. redesign Smart Search / Wayfinding so promoted destinations, quick paths, and categories feel product-grade
5. validate build, lint, tests, docs, and packaging-sensitive seams

---

## Risk Exposure

### 1. Over-localization risk
There is a risk of solving every issue with one-off local styling. The correct approach is to reuse or extend shared homepage-safe primitives where multiple target surfaces need them.

### 2. Over-generalization risk
There is also a risk of promoting too much narrowly scoped utility/discovery choreography into `@hbc/ui-kit`. Only extend the shared system where multiple surfaces truly benefit.

### 3. Packaging / seam regression risk
The homepage package remains a cumulative multi-webpart SPFx lane. Visual work must not destabilize mount/dispatch behavior, packaging output, or manifest-linked runtime loading.

### 4. Search UX drift risk
The discovery surface may tempt broader “smart search” ambitions. This phase should improve the curated homepage experience, not create speculative enterprise-search architecture.

### 5. Mixed-pattern risk
If only part of the utility/discovery system is upgraded, the homepage can end up with conflicting action/destination patterns. The three target surfaces should feel like a coherent family by the end of the phase.

---

## Standards / Best Practices

- keep repo truth authoritative
- reuse Phase A shared primitives where they already solve the problem
- extend the shared homepage surface only where repeated need is real
- prefer strong affordance and scan rhythm over decorative visual tricks
- preserve visible focus and reduced-motion behavior
- keep token discipline intact
- avoid placeholder iconography and list-like link dumps
- validate both visual-system correctness and packaging-sensitive safety

---

## Suggested Acceptance Criteria

Phase C should not be considered complete until all of the following are true:

1. `PriorityActionsRail` no longer reads like grouped text links with badges attached.
2. `ToolLauncherWorkHub` no longer relies on pseudo-icon tokens or weak launcher affordances.
3. `SmartSearchWayfinding` no longer reads like a search input plus basic lists of destinations.
4. Utility and discovery surfaces now feel like part of a coherent product-grade navigation/action system.
5. Any shared extensions made for the phase are justified, documented, and correctly owned.
6. Homepage import doctrine, token discipline, accessibility, reduced motion, and authoring-safe behavior remain intact.
7. Story/test/doc/build validation has been completed and documented.
8. The completion note clearly separates:
   - what was improved in each target surface
   - what was shared vs kept local
   - what remains for later phases

---

## Deliverables

- updated code
- updated docs/stories/tests as needed
- Phase C completion note
- concise list of remaining later-phase follow-ons
