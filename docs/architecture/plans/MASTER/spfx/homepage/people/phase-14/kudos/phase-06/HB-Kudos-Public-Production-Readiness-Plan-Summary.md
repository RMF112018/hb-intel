# HB Kudos Public Surface — Production Readiness Plan Summary

## Objective

Close the remaining product-quality, host-coexistence, and release-readiness gaps in the public-facing HB Kudos webpart so the surface can credibly ship as a premium SharePoint-hosted recognition experience.

## Current reality

The public HB Kudos surface is no longer in a broad exploratory redesign phase.

That phase has already occurred.

The current phase is **targeted closure**.

The remaining work is centered on:

- restoring the integrity of the featured recognition / hero spotlight
- hardening the composer for real SharePoint runtime coexistence
- validating shared-surface and contract alignment
- deciding and implementing any final manifest/theming/accessibility changes
- proving fresh packaging and honest production readiness

## Production-ready target state

The public HB Kudos webpart should finish as:

- a premium presentation-lane recognition surface
- a host-aware SharePoint webpart that coexists cleanly with persistent SharePoint controls
- a visually coherent featured-recognition experience
- a compact and trustworthy archive / browse subordinate zone
- a composer flow whose action zone remains legible and trustworthy under real host conditions
- a governed UI implementation that uses `@hbc/ui-kit` appropriately and does not accumulate unjustified local premium styling
- a packaged solution that is fresh and aligned with repo truth

## Main workstreams

### Workstream 1 — Featured surface restoration
Resolve the current featured-recognition rendering failure or degradation so the public surface again presents a coherent, premium, content-carrying spotlight state.

### Workstream 2 — Composer host-aware closure
Adapt the composer layout, footer, action zone, spacing, and responsive behavior so the surface remains safe and trustworthy in the presence of persistent SharePoint-owned page controls.

### Workstream 3 — Shared-surface / contract alignment
Audit the public webpart’s view-model contract, adapter logic, and UI-kit/shared-surface dependencies to eliminate any mismatch between public Kudos data shape and the shared surface family’s expectations.

### Workstream 4 — Manifest, accessibility, and theming readiness
Make any final explicit decisions needed around theme variants, section background support, focus handling, dialog behavior, reduced motion, and other SPFx runtime expectations.

### Workstream 5 — Final production sweep and packaging
Perform a disciplined final-sweep audit, generate a fresh package, and issue an honest readiness call.

## Non-goals

This package is **not** intended to reopen broad aesthetic exploration across the whole Kudos product.

It is **not** intended to redesign unrelated homepage webparts.

It is **not** intended to force UI-kit promotion where local/shared placement remains the better governed choice.

## Acceptance standard

This effort is successful only if the final public Kudos surface is:

- visibly restored
- host-aware
- doctrine-aligned
- packaging-proven
- and honestly judged ready or not ready based on evidence
