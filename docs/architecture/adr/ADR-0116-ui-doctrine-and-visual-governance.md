# ADR-0116 — UI Doctrine and Visual Governance

**Status:** Accepted
**Date:** 2026-03-16
**Deciders:** HB Intel Architecture Team
**Supersedes:** None

## Context

HB Intel has established `@hbc/ui-kit` as the owner of the reusable visual layer and has elevated the Personal Work Hub / standalone PWA experience to the primary user-facing operating layer of the product. The broader Wave 0 UI work has also shown that real UI-bearing components already exist outside `@hbc/ui-kit` across platform and shared-feature packages, and that package location alone does not guarantee production readiness, visual consistency, hierarchy quality, field readiness, or verification depth.

The current UI maturity baseline shows that only a small number of components meet true production-ready standards, that the highest-risk Wave 1 blockers remain concentrated inside `@hbc/ui-kit`, and that non-ui-kit UI-bearing packages still lag the kit’s intended theme/token standards in several places. The market studies also show that leading construction-tech platforms have converged on a professional enterprise UI baseline, but still suffer from common weaknesses: steep learning curve, visual fatigue, information overload, weak hierarchy in dense pages, horizontal-scroll dependence, and field-hostile density or contrast.

HB Intel’s product direction is to break that mold. The target is not merely a consistent internal design system. The target is a premium, deeply coherent, field-capable, PWA-native interface that surpasses the category in visual hierarchy, cognitive clarity, adaptive density, and production polish while keeping a single governing visual doctrine across the platform.

## Decisions

### D-01 — `@hbc/ui-kit` Owns the Reusable Visual Layer
`@hbc/ui-kit` is the canonical owner of reusable visual primitives, reusable layout and composition primitives, shared visual language, theme/token contracts, iconography conventions, and cross-application presentational standards.

### D-02 — Governed UI-Bearing Exceptions Are Allowed
Packages outside `@hbc/ui-kit` may contain UI-bearing components only when those components are tightly coupled to package-specific behavior, runtime state, orchestration, or workflow semantics and are not general reusable visual primitives.

These components are governed exceptions, not a second visual ownership model.

### D-03 — Package Location Does Not Exempt UI from Standards
Any UI-bearing component used anywhere in HB Intel — whether exported from `@hbc/ui-kit`, a platform package, a shared-feature package, or an app-local surface — is subject to the same standards for:
- visual quality and premium finish
- visual hierarchy and anti-flatness
- theming and token compliance
- accessibility and keyboard support
- field readiness and touch tolerance
- responsiveness and adaptive density
- documentation and story/reference coverage
- automated verification and regression protection

Package location is never an excuse for lower UI quality.

### D-04 — No Parallel Visual Systems
No package may define an independent design language, token system, component family, or ad hoc visual convention that competes with the standards governed by `@hbc/ui-kit`.

Local UI-bearing implementations must compose the shared visual system rather than invent a parallel one.

### D-05 — Promotion / Migration Rule
If a UI-bearing component becomes broadly reusable, visually generic, or used across multiple app families, it must be promoted into `@hbc/ui-kit`.

The default direction of reuse is toward `@hbc/ui-kit`, not toward repeated implementation in platform or shared-feature packages.

### D-06 — Personal Work Hub / PWA Is the Primary UI Standard-Setting Surface
Because the standalone PWA and Personal Work Hub are the primary user-facing operating layer of HB Intel, all UI-bearing surfaces contributing to that experience must meet the highest standard of visual coherence, hierarchy, responsiveness, field readiness, and implementation trust.

The PWA is not merely a shell. It is the benchmark surface that proves the platform’s unified UX quality.

### D-07 — Market Benchmark Is the Floor, Not the Ceiling
HB Intel UI must meet or exceed the best current construction-tech patterns in:
- professional consistency
- responsive shell behavior
- data-surface maturity
- toolbar and action clarity
- dashboard and viewer polish
- semantic status systems
- enterprise-grade accessibility and legibility

HB Intel must surpass the category in:
- first-glance visual hierarchy
- reduction of cognitive load
- anti-flatness and purposeful depth
- field readability in bright-light / imprecise-touch conditions
- adaptive density across office and field contexts
- PWA-native focus and ambient state communication

### D-08 — Visual Hierarchy and Anti-Flatness Are First-Class Requirements
UI quality is not satisfied by token compliance alone. HB Intel interfaces must communicate primary versus secondary information within seconds of first view.

Cards, headers, filters, command zones, summary areas, content areas, status indicators, and actions must not all carry equal visual weight. Depth, spacing, grouping, scale, tone, and containment must be used deliberately to prevent flat, monotonous screens.

### D-09 — Field-First Readability with Adaptive Density
HB Intel adopts a field-first UI posture with adaptive density rather than an office-first posture adapted late for mobile or tablet use.

This means:
- touch targets and spacing must support imprecise touch and gloved use where relevant
- contrast and semantic status colors must remain legible in bright light and low-light environments
- data surfaces must adapt to device, viewport, and usage context without sacrificing comprehension
- desktop compactness is permitted only when it does not destroy scanability or hierarchy

### D-10 — Data-Surface Doctrine: Hybrid, Responsive, and Context-Aware
Dense data tables remain valid for expert office workflows, but HB Intel rejects table monoculture and horizontal scrolling as the default answer for complex information.

The platform standard is a family of adaptive data surfaces:
- dense tables for analysis
- responsive list/table hybrids
- card/list views for narrower or field contexts
- drill-in panels and expandable detail areas that preserve context

Secondary columns and metadata should collapse intelligently before comprehension is sacrificed.

### D-11 — Ambient State Communication over Toast Storms
Where practical, the interface should communicate connectivity, syncing, freshness, focus, and degraded-state conditions through ambient visual cues and context-aware treatments rather than relying primarily on intrusive dialogs or excessive toast messaging.

State should be obvious without forcing users to read system prose to understand what is happening.

### D-12 — Visual Excellence Is a Release Gate
A UI-bearing surface is not considered production-ready unless it passes both:
- system compliance: token/theme alignment, accessibility, responsiveness, verification, and documentation
- visual excellence: beauty, hierarchy, field-capability, clarity, composition quality, and premium finish

Wave 1-critical UI may not ship on the strength of functional correctness alone.

### D-13 — Storybook and Reference Surfaces Support but Do Not Replace Verification
Stories, visual references, and usage guides are required, but they do not substitute for automated behavioral, accessibility, and visual-regression testing where such testing is appropriate for critical-path UI.

### D-14 — Consumer Surfaces May Not Patch Around a Weak Shared Standard
If a page or package requires repeated app-local styling workarounds to achieve acceptable quality, that is treated as a design-system defect, not an acceptable consumer adaptation.

The fix belongs in the shared visual layer or in a governed exception package that still conforms to this ADR.

## Compliance

This ADR is locked and can only be superseded by an explicit follow-up ADR.
