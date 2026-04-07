# P00 — Blocking Issues for Later Phases

**Date:** 2026-04-07
**Phase:** 11 / P00 — Repo Truth Freeze and Product Decision

---

## Summary

Seven blocking issues identified during the repo truth audit. Each maps to one or more later remediation phases.

---

## Issues

### B01 — No Rail-First Layout Mode

**Severity:** High
**Affects phase:** P01 (Information Architecture), P03 (Rebuild)

The current `PeopleCultureMerged` renders as wide responsive stacked sections. No rail-optimized layout path exists. The P03 rebuild must produce a rail-first primary layout; this requires P01 to define the rail information architecture first.

---

### B02 — Missing Recognition/Celebration UI Kit Primitives

**Severity:** High
**Affects phase:** P02 (UI Kit Additions), P03 (Rebuild)

`@hbc/ui-kit` has no first-class recognition or celebration homepage surface family. The current merged implementation uses generic section shells and inline styling for Kudos spotlights, celebration tiles, and announcement cards. P02 must add narrowly scoped shared primitives before P03 can build on them.

---

### B03 — Placeholder CTA Destinations

**Severity:** Medium
**Affects phase:** P04 (Interaction and Destination Wiring)

All CTAs in the current implementation ("Give Kudos", "View All Kudos", "Submit announcement", celebration tile taps) have no real destination routing. They render as styled buttons/links without functional navigation. P04 must wire these to actual flows or explicit "coming soon" contracts.

---

### B04 — Sparse/Empty Data Visual Collapse

**Severity:** High
**Affects phase:** P05 (States, Sparse Data, Authoring Hardening)

When data is sparse or absent:
- Empty Kudos region occupies disproportionate space with a minimal empty-state message
- Band A with zero announcements shows nothing, breaking visual rhythm
- Band B with no celebrations shows a one-line fallback

The surface must remain visually credible at any content density level, including zero-content states. P05 must define suppression and graceful-degradation behavior.

---

### B05 — No Region Suppression Rules

**Severity:** Medium
**Affects phase:** P01 (Information Architecture), P05 (States/Hardening)

There are no rules for when to suppress (hide entirely) a region that has zero content versus showing an empty-state placeholder. This is an information architecture decision (P01) that P05 must implement.

---

### B06 — Authoring-Mode Resilience Not Validated

**Severity:** Medium
**Affects phase:** P05 (States/Hardening), P06 (SharePoint Validation)

The SPFx homepage overlay doctrine requires webparts to behave well when minimally configured, moved between page sections, and viewed in SharePoint edit mode. The current implementation has not been validated against these authoring scenarios. P05 must harden and P06 must validate.

---

### B07 — Legacy Component Reference Cleanup

**Severity:** Low
**Affects phase:** P03 (Rebuild)

`PeopleCulture.tsx` is still imported and rendered in `ReferenceHomepageComposition.tsx` (Zone 4 placement) and tested. After P03 produces the rebuilt surface, the reference composition should be updated to use the new implementation, and the legacy component and its normalizer should be removed from the export surface.

---

## Phase Mapping

| Issue | P01 | P02 | P03 | P04 | P05 | P06 |
|-------|-----|-----|-----|-----|-----|-----|
| B01 Rail-first layout | x | | x | | | |
| B02 UI Kit primitives | | x | x | | | |
| B03 CTA destinations | | | | x | | |
| B04 Sparse data collapse | | | | | x | |
| B05 Suppression rules | x | | | | x | |
| B06 Authoring resilience | | | | | x | x |
| B07 Legacy cleanup | | | x | | | |
