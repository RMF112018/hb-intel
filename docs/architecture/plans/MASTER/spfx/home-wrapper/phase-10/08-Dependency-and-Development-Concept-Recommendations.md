# Dependency and Development Concept Recommendations

## New dependencies

No major new dependency is recommended as a default requirement.

The repo already has enough of the right structure:
- wrapper container measurement,
- entry-state classification,
- policy mirrors,
- test infrastructure,
- containerized entry-stack CSS.

## Concepts that should be applied directly

### 1. Shared entry-state payload
Use or extend the existing `ShellContainerState` / shared snapshot seam rather than introducing a second state system for the hero.

### 2. Container-aware CSS posture
The entry stack already declares `container-type: inline-size`. Use that seam deliberately for the hero where it improves correctness.

### 3. Explicit hero layout modes
Represent hero posture intentionally:
- premium wide,
- compressed laptop,
- guided single-column,
- compact short-height.

Do not rely only on progressively smaller values.

### 4. Transition-safe duplicate detection
If the runtime can reasonably detect duplicate flagship hero rendering during rollout, expose that in a stable diagnostic marker or console warning. Even if the final long-term state relies on correct page authoring, transition detection materially reduces rollout risk.

### 5. Proof-first diagnostics
Prefer stable data attributes or inspectable runtime markers over implicit visual assumptions.

## Small helper additions that may be justified

The following small additions may be justified if they simplify the cutover cleanly:

- a wrapper-owned hero state adapter type,
- a hero layout-mode resolver derived from shared entry state,
- a focused hero diagnostics helper,
- a small duplicate-hero detection helper for flagship hosted pages.

## Changes that are not justified by default

Do not add:
- a new responsive state library,
- a new layout framework,
- a new global config system,
- or a broad hero CMS redesign

unless the live code changes prove one is truly necessary.
