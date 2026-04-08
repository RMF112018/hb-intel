# UI System Target Architecture

## Purpose

Describe the target architecture for the HB Intel shared UI system after the two-lane refactor. This document defines the intended long-term package shape, layering model, migration posture, and ownership boundaries for reusable UI.

---

## Architectural goal

Build a shared UI system that:

- preserves one coherent HB Intel design foundation,
- supports both productive and presentation experiences,
- raises the quality ceiling for homepage and editorial surfaces,
- remains compatible with a mature codebase through staged migration,
- prevents feature packages from becoming alternate design systems.

---

## Target model

The target UI system is organized as:

1. **Foundations**
2. **Primitives**
3. **Surface Families**
4. **Consumers**

This layered model is the canonical architecture for shared UI decisions.

---

## Architecture diagram in words

### Foundations

Own:

- token source of truth
- semantic tokens
- typography system
- spacing, radii, elevation, motion, density, breakpoints
- shared accessibility constraints that affect rendering

### Primitives

Own:

- reusable component building blocks
- cross-lane UI parts
- interaction-safe abstractions
- predictable, typed APIs for shared component behavior

### Surface Families

Own:

- reusable section-level UI patterns
- lane-specific authored surface systems
- premium presentation surfaces where appropriate
- productive section systems where appropriate

### Consumers

Own:

- feature logic
- route or webpart composition
- data orchestration
- local business rules
- page-level assembly

---

## Two-lane architecture

The system supports two experience lanes on top of the same foundations.

### Productive lane

Optimized for application-heavy work:

- forms
- tables
- dashboards
- workflows
- admin tools
- analytics operations

### Presentation lane

Optimized for premium branded content:

- homepage hero
- spotlight features
- editorial surfaces
- leadership communications
- company pulse
- recognition and culture
- discovery / showcase sections

### Important rule

The lanes share the same foundations and may share many primitives, but they must not be forced into identical surface behavior.

---

## Ownership boundary

### Shared UI system owns

- foundations
- primitives
- shared surface families
- migration adapters when needed to preserve compatibility during staged rollout

### Feature packages and apps own

- business logic
- route-specific orchestration
- feature-local assemblies
- one-off compositions without durable reuse value

### Explicit anti-goal

Feature packages should not become self-contained alternative design systems.

---

## Migration posture

The target architecture is reached through staged migration, not uncontrolled rewrite.

### Preferred migration tools

- adapters
- wrappers
- compatibility exports
- staged entry-point cleanup
- old-to-new surface mapping
- incremental consumer adoption

### Avoid

- flag-day rewrites with no compatibility plan
- preserving weak legacy wrappers indefinitely
- shipping parallel systems without a retirement path

---

## Entry-point direction

The shared UI package should expose clear ownership-oriented entry points.

### Directional goal

Entry points should reflect the layered system rather than historical clutter.

Possible target shape:

- main shared exports for stable public usage
- foundations or theme entry point
- productive surface or app-shell entry point where justified
- presentation entry point where justified
- branding assets entry point where justified

### Rule

Entry points should make the architecture clearer, not hide it.

---

## Doctrine direction

Target doctrine should be smaller, stronger, and architecture-aligned.

### It should define

- layer model
- lane model
- ownership boundaries
- migration rules
- accessibility expectations
- package usage expectations

### It should not become

- a bloated archive of stale guidance
- a substitute for repo-truth inspection
- a patch layer protecting weak historical abstractions

---

## Validation direction

The target architecture requires validation at the right layer.

### Foundations

- token build integrity
- theme integrity
- linting against hardcoded values where applicable

### Primitives

- stories
- local tests
- interaction checks
- accessibility checks

### Surface families

- visual proof
- responsive proof
- lane fit review
- consumer usage examples

### Consumers

- route or webpart validation
- packaging or integration validation as needed

---

## Success criteria

The target architecture is successful when:

- shared UI decisions are easier to place correctly,
- homepage and editorial work no longer defaults to generic productive cards,
- feature teams stop inventing local reusable primitives casually,
- premium surfaces can be built without bypassing the system,
- shared UI evolves without uncontrolled breakage,
- doctrine, exports, and live code point in the same direction.
