# Phase 00-03 Completion Note — SPFx-Hosted Homepage Doctrine Overlay

## Status

**Complete.** Homepage doctrine overlay established, binding/directional classification applied, doctrine hierarchy documented, supersession language in place.

---

## Doctrine Files Created/Updated

| File | Action | Purpose |
|------|--------|---------|
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` | **Created** | Homepage-specific doctrine overlay with binding rules, directional guidance, freedoms, territory map, and locked assumptions |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` | **Updated** | Added BINDING/DIRECTIONAL classification labels to all doctrine sections; added homepage overlay cross-reference |
| `docs/reference/ui-kit/README.md` | **Updated** | Replaced flat doctrine listing with layered doctrine hierarchy (Layer 1/2/3), governing document table, explicit supersession language for Layer 3 docs |
| `docs/architecture/blueprint/current-state-map.md` | **Updated** | Added classification entry for the new homepage overlay |

---

## Rules That Remain Binding

These rules are mandatory and not subject to deviation:

| Rule | Source |
|------|--------|
| Accessibility (WCAG 2.1 AA, focus, reduced-motion, contrast) | SPFx Standard §2, Homepage Overlay §2.3 |
| Token discipline (semantic tokens first, no hardcoded values) | SPFx Standard §4.3, Homepage Overlay §2.6 |
| Host awareness (no shell duplication, no DOM hacks) | SPFx Standard §3.1/3.3, Homepage Overlay §2.1 |
| Import discipline (`@hbc/ui-kit/homepage` primary, enforced by ESLint) | Homepage Overlay §2.2 |
| Authoring safety (all config states must render gracefully) | SPFx Standard §3.4/6, Homepage Overlay §2.4 |
| Empty/loading/error states (every webpart must have them) | Homepage Overlay §2.5 |
| Page-canvas ownership (no shell chrome in homepage webparts) | Homepage Overlay §2.1 |
| Webpart quality doctrine (responsive, edit-mode safe) | SPFx Standard §6 |

## Rules Reclassified as Directional

These rules are strong guidance but allow justified deviation for homepage quality:

| Rule | Source | Why Directional |
|------|--------|----------------|
| Editorial hierarchy expectations | Homepage Overlay §3.1 | Zone-specific — hero vs utility vs operations have different weight |
| Premium top-band / hero treatment | Homepage Overlay §3.2 | Brand expression varies by content and authoring state |
| Motion with discipline | SPFx Standard §4.5, Homepage Overlay §3.3 | Purpose-driven motion may vary by webpart type |
| Media and image treatment | Homepage Overlay §3.4 | Depends on whether webpart includes imagery |
| Utility-density expectations | Homepage Overlay §3.5 | Dense vs comfortable varies by zone |
| Content freshness guardrails | Homepage Overlay §3.6 | Runtime enforcement is future; doctrine-level for now |
| Layout family recommendations | SPFx Standard §5 | Homepage zones may compose differently than domain apps |
| HbcAppShell / WorkspacePageShell usage | SPFx Standard §4.1 | Not applicable to homepage webparts |
| Horizontal scroll | SPFx Standard §4.4 | Homepage webparts are unlikely to need this |
| Direct Fluent usage | SPFx Standard §4.2 | Allowed when justified for SharePoint interop |

## Where the SPFx Homepage Overlay Lives

**Primary location:** `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

**Doctrine reading order for homepage work:**
1. SPFx Governing Standard — binding shared rules
2. SPFx Homepage Overlay — homepage-specific binding and directional rules
3. SharePoint Homepage & Shell Boundaries — lane boundaries, customization posture
4. Homepage Import Policy — entry-point and import rules (in `entry-points.md`)

## Locked Assumptions for Phase 01+

1. `@hbc/ui-kit/homepage` is the primary UI entry point for homepage webparts
2. The 8 components + 5 governance constants are the current approved surface
3. Homepage primitives live locally until reuse is proven
4. SPFx Governing Standard's binding rules are non-negotiable
5. Each webpart must render independently with authoring-safe defaults
6. Three-lane model (homepage / shell-extension / navigation) is the governing architecture
7. Supported customization posture (page canvas + placeholders, no shell DOM hacks) is locked

## Intentionally Deferred

- Visual polish and final design implementation — Phase 01+
- Shell-extension doctrine (Lane B) — when the shell-extension package is created
- Runtime freshness enforcement — future phase (doctrine-level guidance is in place)
- Promotion of homepage-local components to `@hbc/ui-kit` — when reuse threshold is met
