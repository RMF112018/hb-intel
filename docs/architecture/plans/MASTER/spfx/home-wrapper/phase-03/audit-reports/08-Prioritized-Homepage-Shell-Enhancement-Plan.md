# Prioritized Homepage Shell Enhancement Plan

## 1. Create a governed entry-stack contract
**Gap closed:** The hero, priority band, and first shell lane are still separate authored objects.

**Solution:** Introduce an entry-stack contract that defines:
- first-fold value budget
- breakpoint-specific hero/action/shell spacing
- action-count budget by device class
- shell-lane start requirements

**UX impact:** Highest.
This closes the largest remaining flagship gap.

**Adaptability impact:** High.
It turns three good parts into one governed sequence.

**Breakpoint-spec impact:** Directly improves conformance.

**Cross-layer implications:** hero, priority rail, hbHomepage, page authoring, preview/testing

**Timing:** Implement now

**Type:** Structural redesign

---

## 2. Fix the shell’s wide-canvas ceiling
**Gap closed:** Ultradwide state is defined but not fully realizable.

**Solution:** Raise shell width strategy above `1440px`, introduce readable max-width sub-bounds per band if needed, and make the ultrawide breakpoint physically reachable.

**UX impact:** High on external-monitor use

**Adaptability impact:** High

**Breakpoint-spec impact:** Direct

**Cross-layer implications:** shell CSS, breakpoint policy, possibly shared surface max-width rules

**Timing:** Implement now

**Type:** Structural refinement with moderate risk

---

## 3. Make Project Portfolio Spotlight first-lane eligible and promote an operational flagship preset
**Gap closed:** The current first-lane policy under-promotes the strongest operational anchor.

**Solution:** Update the occupant registry and preset library so Spotlight can anchor the first lane by default, ideally paired with Company Pulse.

**UX impact:** High

**Adaptability impact:** Medium-high

**Breakpoint-spec impact:** Improves first-fold value clarity

**Cross-layer implications:** occupant registry, preset library, validation, preview docs

**Timing:** Implement now

**Type:** Structural composition correction

---

## 4. Make the occupant capability model real
**Gap closed:** The shell stores capability metadata that the resolver barely uses.

**Solution:** Expand runtime handling to honor:
- `preferredWidth`
- `supportsCompact`
- `supportsSummaryCollapse`
- `prominenceCeiling`

Add explicit band/slot mode selection logic driven by those capabilities.

**UX impact:** High

**Adaptability impact:** High

**Breakpoint-spec impact:** Strong

**Cross-layer implications:** registry, resolver, presets, surface variants

**Timing:** Implement now

**Type:** Structural enhancement

---

## 5. Add persisted layout-governance groundwork
**Gap closed:** The shell has configuration concepts but no persisted home for them.

**Solution:** Introduce a canonical persisted shell-layout contract with validation and migration versioning.

**UX impact:** Medium now, very high later

**Adaptability impact:** High for future growth

**Breakpoint-spec impact:** Indirect but important

**Cross-layer implications:** data model, shell parser, future admin/editor workflows

**Timing:** Implement now

**Type:** Structural groundwork

---

## 6. Rebuild People & Culture Public to benchmark discipline
**Gap closed:** One major occupant remains outside the benchmark surface/token rigor.

**Solution:** Replace the current inline-style-heavy surface with either:
- a shared `@hbc/ui-kit/homepage` surface family
- or a governed local family with token bridge, variants, and CSS-module discipline

**UX impact:** Medium-high

**Adaptability impact:** Medium

**Breakpoint-spec impact:** Medium

**Cross-layer implications:** People & Culture runtime, split contracts, media fallbacks, shared homepage styling strategy

**Timing:** Wave 02

**Type:** Structural redesign

---

## 7. Activate Safety Field Excellence as a governed shell occupant
**Gap closed:** Safety is architecturally ready but not truly in the shell model.

**Solution:** add:
- config slice support
- zone wrapper
- preset participation
- capability/ceiling rules
- optional visibility controls

**UX impact:** Medium-high

**Adaptability impact:** Medium

**Breakpoint-spec impact:** Medium

**Cross-layer implications:** shell types, zone registry, presets, operational content governance

**Timing:** Wave 02

**Type:** Structural feature integration

---

## 8. Add preview and validation ergonomics for future layout governance
**Gap closed:** No safe human-facing seam exists yet for layout experimentation.

**Solution:** build a preview-safe internal authoring surface that can:
- switch presets
- simulate breakpoints
- surface validation warnings
- show protected decisions clearly

**UX impact:** Low for end users, high for maintainers

**Adaptability impact:** High long-term

**Breakpoint-spec impact:** Indirect but strong

**Cross-layer implications:** future control panel, validation engine, diagnostics UX

**Timing:** Later Wave 02 or subsequent wave

**Type:** Productization

## Net priority order

1. Entry-stack contract
2. Wide-canvas fix
3. Project Spotlight first-lane promotion
4. Real capability enforcement
5. Persisted governance groundwork
6. People & Culture rebuild
7. Safety activation
8. Preview/validation authoring ergonomics
