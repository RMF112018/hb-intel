# Phase 04 — Implementation Notes

## 1. Composition Proof Summary

### What was proven in the Utility zone composition

The utility rail now renders as a contract-driven 4-section support surface alongside the flagship stage inside the composition shell's 2fr/1fr body grid:

| Section | Data source | Rendering | Priority |
|---------|-----------|-----------|----------|
| **Platform Notices** | `presentation.noticesSummary.activeNotices` | Priority-sorted (critical → warning → info → success → neutral) with urgency emphasis (3px left border, AlertTriangle icon) for critical/warning | 1 (highest) |
| **Need Help** | `presentation.supportSummary.helpActions` | CTA links (blue, ExternalLink icon) with "{name} Help" labels, capped at 5 | 2 |
| **Request Access** | `presentation.supportSummary.accessActions` | CTA links (blue, ExternalLink icon), capped at 5 | 3 |
| **Support Contacts** | `presentation.supportSummary.supportContacts` | Quiet metadata links with support-owner names, capped at 5 | 4 (lowest) |

### Hierarchy validation

- **Rail is clearly secondary to flagship stage** — quiet card sections (subtle border, 0.72rem headings, muted colors) vs flagship cards (standard border, 0.92rem names, 56px logo containers, spring motion)
- **Rail reinforces the launcher** — it surfaces help, access, and status context that makes the launcher feel operationally complete without competing for primary attention
- **Rail is subordinate to Signature Hero** — compact sections with no full-width treatment, no hero-scale media, no animation

### Data seam validation

All support data flows through `LauncherSupportSummary` pre-derived by `deriveSupportSummary()` in the normalization layer. The utility rail accepts only `presentation: LauncherPresentationModel` — no raw platform arrays or SharePoint fields.

### Degraded composition validation

| Scenario | Behavior |
|----------|----------|
| All 4 sections populated | Full rail with "Support & Status" label |
| Only notices exist | Single-section rail, still shows label |
| Only help/access exist | CTA sections without notice section |
| No support data at all | Rail returns null; body grid collapses to 1fr; flagship gets full width |
| Single help link only | Minimal but professional rail with one section |

## 2. Remaining Debt

### Workflow shelf refinement (Phase 05)
- Shelves use existing `HbcLauncherSurface` tile grid — no premium card treatment
- No shelf-level search or filtering
- No "show more" for large shelves

### All-platform overlay / index (Phase 06)
- "All Platforms" command band button is disabled (no handler)
- No overlay/drawer implementation
- No searchable full-platform index

### Advanced search / personalization (Phase 08+)
- Command band search input is read-only with `tabIndex={-1}`
- No platform name/alias/keyword matching
- No audience context wired from SPFx user profile

### Deeper support-governance and authoring tooling
- No admin-facing support metadata editing
- No stale-content detection for help/access links
- Support contacts are static from list data — no live directory integration
- No "show more" overflow for sections with >5 items
- Help section doesn't show support-owner context (available in data but not rendered)

### Other deferred items
- Responsive breakpoints (Phase 07) — desktop-only layout
- Logo asset deployment — manifest paths not yet deployed to HBCentral
- Favorites / recently-used sections — requires persistence model
- Interactive notice expansion — current inline detail text sufficient

## 3. Risks Observed

| Risk | Severity | Impact on Phase 05+ |
|------|----------|---------------------|
| **Utility rail section count** | Medium | 4 sections is the current max. Adding favorites and recents in future could reach 6 sections — visual weight monitoring needed |
| **Support data sparsity** | Low | If the live list has no help/access/support data, the rail suppresses entirely. This is correct behavior but means the 2fr/1fr layout won't be visible until data is seeded. |
| **Notice urgency emphasis** | Low | The 3px left-border and AlertTriangle icon are section-level, not per-notice. A single warning notice makes the entire section look urgent even if other notices are info-level. Acceptable for skeleton but may need refinement. |
| **CTA vs metadata visual gap** | Low | CTA links (blue, ExternalLink icon) and metadata links (muted, no icon) have clear distinction now. Future sections must follow this pattern. |
| **Bundle size** | Low | 498 KB (up from 475 KB at Phase 01 start). 23 KB growth across 4 phases for launcher components + helpers + normalization — proportional. |

## 4. Recommended Next Phase Entry Conditions

Before beginning **Phase 05 (Workflow Shelf Refinement)**:

1. **Phase 04 validation checklist is complete** (27/27 items checked)
2. **`apps/hb-webparts` builds cleanly** — typecheck, lint, and build all pass
3. **The utility rail is rendering from pre-derived supportSummary** — no raw platform filtering at render time
4. **Notice priority ordering is implemented** — critical/warning notices surface first with visual emphasis
5. **All 4 rail sections suppress independently** and the rail suppresses entirely when empty
6. **Remaining debt is documented** — no hidden assumptions about what Phase 04 delivered

### Phase 05 should focus on:
- Upgrading workflow shelf tiles from `HbcLauncherSurface` to a more intentional shelf card treatment
- Adding shelf-level context (platform count, category description)
- Preserving the flagship stage and utility rail hierarchy while deepening secondary content
