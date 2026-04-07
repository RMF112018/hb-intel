# P00 — Architecture Decision Record: People & Culture Product Direction

**Date:** 2026-04-07
**Phase:** 11 / P00 — Repo Truth Freeze and Product Decision
**Status:** Approved

---

## Decision 1: Surviving Implementation

**Decision:** `PeopleCultureMerged.tsx` is the authoritative homepage People & Culture implementation.

**Rationale:**
- It is the only component wired in the production mount dispatcher (`mount.tsx`, manifest ID `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`).
- It implements the intended three-region product model: Announcements (Band A), Kudos Recognition, and Weekly Celebrations (Band B).
- It has dedicated normalization logic (`normalizePeopleCultureMergedConfig`), typed contracts (`communicationsContracts.ts`), and responsive tier support.
- The manifest description explicitly reflects the merged surface: "Announcements, Kudos recognition, birthdays, and anniversaries."

---

## Decision 2: Deprecated Implementation

**Decision:** `PeopleCulture.tsx` is formally deprecated.

**Rationale:**
- It is not mounted in the production dispatcher. Its only references are in `ReferenceHomepageComposition.tsx` (development/reference context) and unit tests.
- It implements a simpler editorial format (featured + secondary items via `HbcEditorialSurface`) that does not match the approved three-region product model.
- It uses a separate normalizer (`normalizePeopleCultureConfig`) with a narrower data contract that cannot express Kudos or Celebrations.

**Retention:** The file remains in-tree as reference material until the Phase 11 rebuild (P03) produces the replacement surface. It should be removed or archived once the rebuild is validated.

---

## Decision 3: Placement Mode

**Decision:** Rail-first is the target placement posture for the rebuilt surface.

**Rationale:**
- The Phase 11 remediation doctrine specifies rail-first as the preferred product posture.
- The current merged implementation renders as wide responsive stacked sections, which reads as "stacked boxed subsections" in narrow placement contexts rather than a coherent rail experience.
- Rail-first design forces tighter hierarchy, better information density, and stronger visual coherence at the width most homepage layouts will allocate to this surface.
- Wide-mode remains a secondary consideration — the rebuilt surface may adapt to wider placement but must not be designed wide-first.

---

## Decision 4: Product Model

**Decision:** The homepage People & Culture surface is a single integrated module, not three separate webparts.

**Composition:**
- **Band A — Announcements:** Promotions, new hires, baby/wedding/special announcements with type-specific persistence windows (3-5 days) and audience filtering.
- **Kudos Recognition:** Featured spotlight + recent headlines with HR approval gating, 14-day visibility window, and participation affordances (Give Kudos, View All, Celebrate).
- **Band B — Weekly Celebrations:** Birthdays and work anniversaries for the current week, compact tile format.

**Rationale:**
- A single integrated module maintains coherent visual hierarchy and avoids the homepage becoming a grid of independent small widgets.
- The three regions share a common data governance model (People Operations ownership, weekly freshness cadence).
- Region suppression (hiding empty regions gracefully) is simpler within a single component than across three independent webparts.

---

## Governing References

- SPFx UI Doctrine: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Homepage Overlay: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- Design Brief: `docs/architecture/blueprint/sharepoint-shell/Hedrick_Brothers_SharePoint_Homepage_Design_Brief.md`
- Remediation Package: `docs/architecture/plans/MASTER/spfx/homepage/people/phase-11/People_Culture_Remediation_Package_Summary.md`
- Merged Architecture: `docs/architecture/plans/MASTER/spfx/homepage/people/00_Architecture/People_Culture_Kudos_Merged_Architecture.md`
