# Research-Backed Enhancement Findings

## External sources used

- Microsoft Support — Quick Links web part
- W3C WAI-ARIA APG — Disclosure pattern
- W3C WAI-ARIA APG — Menu Button pattern
- W3C WCAG 2.2 Understanding — Target Size (Minimum)
- MDN — CSS container queries
- web.dev — `prefers-reduced-motion`

---

## 1. SharePoint host reality: curated utility surfaces already exist, but they are layout-driven, not flagship product surfaces

Microsoft’s Quick Links web part supports multiple layouts, audience targeting, descriptions, icons/images, and reorder behavior. That confirms two important things:

1. SharePoint itself expects curated utility-launch surfaces on the page canvas.
2. Layout choice alone is not the same thing as premium flagship productization.

**Implication for this package**
- Do not copy OOB Quick Links.
- Do treat the homepage rail as a purpose-built, curated launch surface whose hierarchy and action prioritization are authored intentionally.

---

## 2. Container-aware behavior is the correct posture for a nested homepage band

MDN’s guidance on container queries reinforces a core point already reflected in the repo: nested surfaces should adapt to the size of their **container**, not merely the viewport.

**Implication for this package**
- The live repo’s container-aware direction is correct.
- The stronger package should preserve and refine container-aware behavior instead of regressing to viewport-only assumptions.
- `priorityActionsPresentation.ts` deserves explicit treatment as a breakpoint contract seam.

---

## 3. Overflow semantics must match the interaction model

The WAI APG distinguishes between:
- **Disclosure**: show/hide controlled content in-flow
- **Menu button**: button opens a menu with menu interaction semantics

This matters because a surface can look like a “menu” visually while actually behaving more like a disclosure or link collection.

**Implication for this package**
- Inline expansion should remain disclosure-like if it is simply revealing more content in-flow.
- Anchored/floating overflow should only use menu semantics if behavior truly matches menu-button expectations.
- The enhanced prompts should explicitly require semantic correctness, not just visual novelty.

---

## 4. Touch targets and spacing are not optional polish

WCAG 2.5.8 sets a target-size minimum of **24 by 24 CSS pixels**, or enough spacing around smaller targets to avoid overlap.

**Implication for this package**
- compact flagship designs still need credible pointer and touch ergonomics
- “dense” is acceptable; “small and collision-prone” is not
- target size and spacing should be part of the validation contract, especially for compact and constrained states

---

## 5. Reduced motion is part of premium quality, not an afterthought

The `prefers-reduced-motion` guidance is clear: non-essential motion should be minimized or removed for users who request reduced motion.

**Implication for this package**
- motion should support state change and affordance, not provide spectacle
- flagship hover/press/reveal behavior must remain valuable when motion is reduced
- the stronger package should preserve the repo’s reduced-motion posture and test it explicitly

---

## 6. Research-backed design implications for the enhanced package

The enhanced package should therefore enforce the following:

### A. Keep the first view focused
Primary actions should be visible, obvious, and prioritized.
Secondary actions should be present, but disclosed intentionally.

### B. Make section grouping do real work
Grouping should reduce reading cost, not simply organize repeated rows.

### C. Make action recognition faster
Icon treatment, title anchoring, primary-action prominence, and section rhythm should help users identify destinations rapidly.

### D. Preserve host-fit discipline
No fake shell. No unsupported host takeover. No overbuilt launcher wall that ignores SharePoint page-canvas reality.

### E. Treat breakpoint behavior as authored behavior
Compact, tablet, laptop, and ultrawide states should be deliberate and stable, not emergent.

---

## Direct package consequence

The attached package pair was right to call for redesign.

The enhanced package goes further by defining **how** that redesign should be bounded:

- preserve the wrapper and host-fit architecture
- redesign the flagship grammar
- split the work into tighter closure units
- enforce semantics, target-size, reduced-motion, and hosted proof explicitly
