# Research References

This file captures the external research that materially informed the enhanced package.

## 1. Container-aware responsive design
- MDN — CSS container queries
- MDN — Container size and style queries
- web.dev — *The new responsive: Web design in a component-driven world*

Why it matters here:
- Project Sites is a nested SharePoint surface
- the live repo already uses measured container width
- the remediation should stay container-aware and may use container queries selectively where they improve clarity

## 2. Element-size observation
- MDN — `ResizeObserver.observe()`

Why it matters here:
- the existing repo already uses `ResizeObserver`
- this supports keeping container-derived mode logic as the primary truth seam

## 3. Reflow safety
- W3C WAI — Understanding SC 1.4.10 Reflow

Why it matters here:
- first-screen overhead, compact control density, and chip/filter behavior must hold up under constrained widths and zoomed conditions
- responsive success is not just “no crash”; it includes usable reflow without awkward two-dimensional scrolling for ordinary task flow

## 4. Touch target sizing
- W3C WAI — Understanding SC 2.5.8 Target Size (Minimum)

Why it matters here:
- chip remove buttons
- compact filter interactions
- compact selects and action affordances

## 5. Reduced-motion posture
- MDN — `prefers-reduced-motion`

Why it matters here:
- the app already uses restrained motion and reduced-motion handling
- any responsive redesign should preserve that posture

## 6. Screenshot-based regression protection
- Playwright docs — visual comparisons / `toHaveScreenshot()`
- Playwright docs — page assertions and configuration

Why it matters here:
- Project Sites is aiming for a visibly stronger responsive result
- screenshot-based evidence is a practical way to protect composition quality across named display classes
