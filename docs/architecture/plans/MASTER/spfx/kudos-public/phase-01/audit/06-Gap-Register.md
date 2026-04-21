# 06-Gap-Register

| Gap | Category | Current condition | Why it underperforms | Severity | Affected seams | Fix type |
|---|---|---|---|---|---|---|
| Desktop composition compressed onto phone | Breakpoints | Same featured-card grammar survives onto phone widths with only minor label change | Produces crowding, vertical bloat, and weak scanability | Critical | `PublicKudosSurface.tsx`, `kudosSurface.module.css` | Redesign |
| Hard-coded featured header geometry | Hierarchy | Absolute badge + reserved right padding squeeze identity content | Makes recipient/title zone fragile under narrow width | High | `kudosSurface.module.css` | Refinement / redesign |
| Top-heavy information strategy | Homepage integration | Featured card dominates; lower zones are comparatively thin | Weak first-screen value when recent data is absent | High | `PublicKudosSurface.tsx`, `ArchiveList.tsx` | Redesign |
| Weak recent-empty narrative | State model | If recent list is absent, product jumps straight to archive | Homepage story becomes past-tense instead of current-tense | High | `PublicKudosSurface.tsx`, data-derived view model | Refinement |
| Limited responsive proof | Closure | Doctrine guards cover structure but not visual breakpoint outcomes | Drift can return without failing tests | Medium | tests, harness, screenshot proof workflow | Refinement |
| Right-lane rhythm under stack conditions | Homepage integration | Kudos is visually stronger than neighboring stacked empty states but unsupported by page rhythm | Creates inconsistent perceived quality across the homepage | Medium | hbKudos + homepage layout integration | Refinement |
| Celebrate / metadata posture on phone | Accessibility / UX | Footer actions remain visually dense in narrow view | Mobile tap/read experience feels cramped | Medium | `FeaturedCard`, `kudosSurface.module.css` | Refinement |
