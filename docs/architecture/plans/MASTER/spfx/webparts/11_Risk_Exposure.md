# 11 — Risk Exposure

## Purpose

This file gives the code agent and the implementation owner a concise risk register for the HB Central homepage webpart program.

## Primary Risks

### R1 — Homepage monolith drift
**Risk**
The implementation quietly turns into one oversized homepage app or shell-like surface.

**Why it matters**
This undermines SharePoint-native composition, increases runtime cost, and makes authoring brittle.

**Mitigation**
- keep component inventory locked
- multiple homepage webparts only
- no routed mini-app behavior by default
- explicit review of every exception request

---

### R2 — Broad `ui-kit` imports inflate homepage weight
**Risk**
Homepage surfaces import the full kit or heavy dependencies unnecessarily.

**Why it matters**
Homepage pages are repeated-use, high-visibility pages; bundle discipline matters more here than in deep workflow surfaces.

**Mitigation**
- homepage-safe `ui-kit` contract
- narrow entry points
- shared homepage wrappers
- verification prompt must inspect imports and runtime cost

---

### R3 — Visual premium without authoring practicality
**Risk**
The homepage looks good in development but normal content changes require developer help.

**Why it matters**
That breaks sustainability and weakens adoption.

**Mitigation**
- property pane + list-backed config where appropriate
- explicit content owner model
- site-owner composition guide
- no critical content change should require code edits

---

### R4 — Generic SharePoint fallback
**Risk**
Despite custom code, the end result still feels like standard SharePoint with nicer tiles.

**Why it matters**
It misses the strategic objective.

**Mitigation**
- shared homepage visual doctrine
- disciplined hero/editorial/utility/intelligence primitives
- strong hierarchy and authored top band
- fewer, better components

---

### R5 — Performance degradation on real homepage pages
**Risk**
Several custom webparts together create poor perceived performance.

**Why it matters**
Homepages get repeated daily use and are judged quickly.

**Mitigation**
- above-the-fold discipline
- lightweight default lane
- repeated-webpart cost review
- performance review as release gate

---

### R6 — Operational sprawl
**Risk**
Too much data, too many asks, too many equal-weight widgets.

**Why it matters**
The homepage becomes cluttered and loses hierarchy.

**Mitigation**
- locked first-release scope
- governance doc
- homepage zone ownership
- “not every request becomes a homepage feature” rule

---

### R7 — Unclear packaging seam
**Risk**
The repo’s existing SPFx lanes are interpreted inconsistently during implementation.

**Why it matters**
This can create drift, duplicate structures, or deployment pain late in the work.

**Mitigation**
- Prompt 01 explicitly locks lane assignment
- packaging ambiguity must be documented and resolved early
- release-readiness prompt must validate artifact shape

---

### R8 — Accessibility premium gap
**Risk**
A visually rich homepage ships with weak focus states, hover-only cues, or motion-heavy behavior.

**Why it matters**
A premium homepage that is not accessible is not premium.

**Mitigation**
- semantic structure
- keyboard support
- reduced-motion support
- no essential hover-only information
- accessibility review in final verification

---

### R9 — Over-personalization or under-personalization
**Risk**
The page becomes either too generic or too fragmented.

**Why it matters**
The homepage needs relevance without losing shared identity.

**Mitigation**
- personalize only what materially helps:
  - greeting
  - priority actions
  - selected destinations
  - selected content prioritization
- preserve shared hierarchy and brand backbone

## Release Recommendation Logic

### Go
- components are premium, useful, and maintainable
- no critical packaging/performance/accessibility issue remains

### Conditional Go
- system is strong, but a small number of non-critical issues remain with explicit workarounds or quick follow-up fixes

### No-Go
- homepage-safe lane is unresolved
- performance is materially weak
- accessibility is materially weak
- authoring/ownership is not credible
- experience still reads as generic SharePoint
