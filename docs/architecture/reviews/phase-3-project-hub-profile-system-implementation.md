# Phase 3 Project Hub Profile System — Implementation Report

**Date:** 2026-03-28
**Version:** @hbc/features-project-hub 0.2.47
**Scope:** Implement a governed default-view profile system that selects the correct Project Hub home shell by role and device class, using one underlying runtime.

## 1. Architecture

```
5 Profile IDs → 3 Layout Families → 1 Project Hub Runtime

  hybrid-operating-layer ─────┐
  canvas-first-operating-layer ┼─→ project-operating family
  next-move-hub ──────────────┘
  executive-cockpit ──────────────→ executive family
  field-tablet-split-pane ────────→ field-tablet family
```

Profiles are a **governed selection layer** on top of the existing 3 layout families. Each profile configures a layout family with role-appropriate region collapse defaults, mandatory surfaces, and center emphasis — without duplicating the underlying surface implementations.

## 2. Files Created

| File | Purpose |
|------|---------|
| `packages/features/project-hub/src/layout-family/profiles/types.ts` | Type contracts: `ProjectHubProfileId`, `ProjectHubDeviceClass`, `ProjectHubProfileRole`, `ProjectHubProfileDefinition`, resolution/persistence interfaces |
| `packages/features/project-hub/src/layout-family/profiles/registry.ts` | Static definitions for all 5 profiles + `PROJECT_HUB_PROFILE_REGISTRY` |
| `packages/features/project-hub/src/layout-family/profiles/resolver.ts` | Role/device → profile resolution with override governance + `ROLE_DEVICE_DEFAULTS` policy matrix |
| `packages/features/project-hub/src/layout-family/profiles/persistence.ts` | localStorage-backed profile preference storage keyed by userId + deviceClass |
| `packages/features/project-hub/src/layout-family/profiles/index.ts` | Public API barrel |
| `packages/features/project-hub/src/layout-family/profiles/__tests__/profileResolver.test.ts` | 48 tests covering registry, resolution, governance, persistence, and quality |

## 3. Files Modified

| File | Change |
|------|--------|
| `packages/features/project-hub/src/layout-family/index.ts` | Added profile system exports to public API barrel |
| `packages/features/project-hub/package.json` | Version bump 0.2.46 → 0.2.47 |

## 4. Role/Device Default Policy Matrix

### Desktop

| Role | Default Profile | Layout Family |
|------|----------------|---------------|
| project-manager | `hybrid-operating-layer` | project-operating |
| project-executive | `hybrid-operating-layer` | project-operating |
| portfolio-executive | `executive-cockpit` | executive |
| superintendent | `next-move-hub` | project-operating |
| field-engineer | `next-move-hub` | project-operating |
| leadership | `executive-cockpit` | executive |
| qa-qc | `canvas-first-operating-layer` | project-operating |
| safety-leadership | `canvas-first-operating-layer` | project-operating |

### Tablet

| Role | Default Profile | Layout Family |
|------|----------------|---------------|
| project-manager | `canvas-first-operating-layer` | project-operating |
| project-executive | `canvas-first-operating-layer` | project-operating |
| portfolio-executive | `executive-cockpit` | executive |
| superintendent | `field-tablet-split-pane` | field-tablet |
| field-engineer | `field-tablet-split-pane` | field-tablet |
| leadership | `executive-cockpit` | executive |
| qa-qc | `field-tablet-split-pane` | field-tablet |
| safety-leadership | `field-tablet-split-pane` | field-tablet |

### Narrow / Fallback

| Role | Default Profile | Layout Family |
|------|----------------|---------------|
| project-manager | `canvas-first-operating-layer` | project-operating |
| project-executive | `canvas-first-operating-layer` | project-operating |
| portfolio-executive | `canvas-first-operating-layer` | project-operating |
| superintendent | `next-move-hub` | project-operating |
| field-engineer | `next-move-hub` | project-operating |
| leadership | `canvas-first-operating-layer` | project-operating |
| qa-qc | `next-move-hub` | project-operating |
| safety-leadership | `canvas-first-operating-layer` | project-operating |

## 5. Profile Characteristics

| Profile | Family | Center Emphasis | Mandatory Regions | Interaction Posture |
|---------|--------|----------------|-------------------|---------------------|
| hybrid-operating-layer | project-operating | canvas | header, center, left | desktop |
| canvas-first-operating-layer | project-operating | canvas | header, center | desktop |
| next-move-hub | project-operating | canvas | header, center, right | desktop |
| executive-cockpit | executive | risk-canvas | header, center, left, right | desktop |
| field-tablet-split-pane | field-tablet | action-stack | header, left, center, bottom | touch |

## 6. Override Governance

- User overrides are accepted only when the requested profile supports the user's role AND device class.
- Rejected overrides fall back to the policy default with a structured rejection reason.
- The policy matrix (`ROLE_DEVICE_DEFAULTS`) is the single source of truth — changes require architecture review.

## 7. Persistence Model

- Key format: `hbc-project-hub-profile-{userId}-{deviceClass}`
- Profiles are user-level preferences, not project-scoped (same profile across all projects).
- Device classes are isolated (desktop preference doesn't affect tablet preference).
- Persistence version invalidation: when `persistenceVersion` increments, stale cached preferences are silently discarded.

## 8. Upgrade Notes

No refactoring was needed to existing route/page architecture. The profile system is additive — it sits alongside the existing layout-family resolver without replacing it. The existing `resolveProjectHubLayoutFamily()` function remains available for consumers that don't need the profile layer.

## 9. Verification

- **Profile tests:** 48/48 pass (registry, resolution, override governance, persistence, quality)
- **PWA tests:** 162/162 pass (zero regressions)
- **Pre-existing failures:** 3 health-pulse test files have pre-existing failures unrelated to this change
