# Phase 11A — Tool Launcher Rebuild Validation Checklist

## Purpose

This checklist defines the validation requirements that Phases 11B–11H must satisfy. Each rebuild phase must demonstrate compliance with the applicable checks before claiming completion.

---

## 1. Repo-path scope discipline

| Check | Applies to | Requirement |
|-------|-----------|-------------|
| Component changes are scoped | 11B–11G | All visual component changes must be within `apps/hb-webparts/src/webparts/toolLauncherWorkHub/` |
| Data pipeline is not structurally modified | 11B–11G | Files under `apps/hb-webparts/src/homepage/data/` and `toolLauncherContracts.ts` may receive additive changes only |
| Mount seam is unchanged | 11B–11H | `apps/hb-webparts/src/mount.tsx` launcher registration is preserved |
| No unrelated webpart changes | 11B–11H | Other webpart directories under `apps/hb-webparts/src/webparts/` are not modified |
| Import discipline maintained | 11B–11H | All imports use `@hbc/ui-kit/homepage` as primary entry; no `@hbc/ui-kit` root or `@hbc/ui-kit/app-shell` imports |

---

## 2. SharePoint host safety

| Check | Applies to | Requirement |
|-------|-----------|-------------|
| Edit-mode safe | 11B–11H | Launcher renders without error or visual breakage in SharePoint page edit mode |
| No host chrome interference | 11B–11H | No suppression of SharePoint suite bar, app bar, or page chrome |
| No unsupported DOM access | 11B–11H | No direct manipulation of SharePoint-owned DOM nodes |
| Section movement safe | 11B–11H | Launcher webpart can be moved between page sections without rendering errors |
| No layout shift on host | 11B–11H | Launcher does not cause cumulative layout shift in the SharePoint page context |

---

## 3. Authoring safety

| Check | Applies to | Requirement |
|-------|-----------|-------------|
| Zero-data state | 11B, 11E, 11F | Launcher displays a professional empty state when list returns zero items |
| Loading state | 11B | Launcher displays a clear loading state during data fetch |
| Error state | 11B | Launcher displays a graceful error state when data fetch fails |
| No featured items | 11E | Flagship stage suppresses gracefully when no featured platforms exist |
| No workflow shelves | 11B | Workflow shelves suppress gracefully when no shelf groupings exist |
| No notices | 11F | Utility rail notice section suppresses when no active notices exist |
| No support info | 11F | Utility rail support sections suppress when empty |
| Audience excludes all | 11B | Launcher handles audience filtering that excludes all items without error |
| Partial configuration | 11H | Launcher renders with incomplete property pane configuration |

---

## 4. Partial-data resilience

| Check | Applies to | Requirement |
|-------|-----------|-------------|
| Missing logo asset | 11C, 11E | Logo cascade falls back through manifest → icon → monogram without layout shift |
| Missing descriptor | 11C | Cards render cleanly without descriptor text |
| Missing category | 11B | Platforms default to "Other" category without error |
| Missing workflow shelf | 11B | Platforms without shelf assignment are handled (appear in ungrouped or suppressed) |
| Missing notice fields | 11F | Notices with missing tone, expiry, or message fields default safely |
| Missing support fields | 11F | Support entries with partial data render without error |
| Expired notices | 11F | Auto-expired notices are excluded from display |
| Duplicate platform keys | 11B | Deduplication logic is preserved |

---

## 5. Accessibility expectations

| Check | Applies to | Requirement |
|-------|-----------|-------------|
| Text contrast | 11B–11G | All text meets WCAG 2.1 AA minimum (4.5:1 for normal text, 3:1 for large text) |
| Interactive contrast | 11B–11G | All interactive elements meet 3:1 contrast against adjacent colors |
| Keyboard focus | 11B–11G | All interactive elements have visible keyboard focus indicators |
| Search keyboard nav | 11D | Search suggestions are navigable with Arrow Up/Down, selectable with Enter, dismissible with Escape |
| Overlay keyboard | 11G | Overlay is dismissible with Escape key; focus is trapped within overlay |
| Reduced motion | 11B–11G | All motion respects `prefers-reduced-motion` media query |
| No hover-only info | 11B–11G | No critical information is accessible only through hover |
| Semantic structure | 11B–11G | Headings, lists, and regions use appropriate semantic HTML |
| Link purpose | 11B–11G | External link targets are identifiable by purpose, not just icon |
| Light theme first | 11B–11G | All surfaces designed light theme first per homepage overlay §3.3 |

---

## 6. Search/discovery expectations

| Check | Applies to | Requirement |
|-------|-----------|-------------|
| Search filters correctly | 11D | Query matches across name, aliases, descriptor, category, workflow shelf, and support owner |
| No-results state | 11D | "No platforms matching" message displays for empty search results |
| Suggestion cap | 11D | Command band search suggestions capped appropriately (currently 6) |
| Overlay search | 11G | All Platforms overlay search filters the full inventory correctly |
| Category grouping | 11G | Overlay organizes results by category with group headers |
| Empty groups suppressed | 11D, 11G | Categories/groups with zero matching results are hidden |
| Search stability | 11D, 11G | Searchable records are memoized; no recomputation on every render |

---

## 7. Packaging/render parity expectations

| Check | Applies to | Requirement |
|-------|-----------|-------------|
| Clean TypeScript build | 11B–11H | `check-types` passes with zero errors for `apps/hb-webparts` |
| Clean lint | 11B–11H | `lint` passes with zero errors for `apps/hb-webparts` |
| Clean build | 11B–11H | Production build completes without errors |
| Manifest preserved | 11B–11H | Webpart manifest GUID and metadata are preserved |
| `.sppkg` validates | 11H | Final `.sppkg` package builds and validates |
| No new workspace warnings | 11B–11H | No new TypeScript or lint warnings introduced |

---

## 8. Doctrine compliance expectations

| Check | Applies to | Requirement |
|-------|-----------|-------------|
| Not generic card-grid | 11C, 11E | Featured stage does not read as a generic enterprise card grid (§4.2) |
| Not Fluent-dominant | 11B–11G | Visual language is not dominated by default Fluent-feeling primitives (§4.1) |
| Premium stack used | 11B–11G | Approved premium stack packages are used deliberately where justified (§5.1) |
| CVA variant system | 11B, 11C | Card and surface variants use `class-variance-authority` (§5.2) |
| Zone differentiation | 11B | Different launcher zones have deliberately different visual density/treatment |
| Premium motion | 11C–11G | Motion is intentional, refined, and gated by `prefers-reduced-motion` (§6.2) |
| No pseudo-icons | 11C, 11E | Monogram fallback is last resort only; primary icons from Lucide (§5.3) |
| Import discipline | 11B–11H | Imports via `@hbc/ui-kit/homepage` primary entry point (Homepage Overlay §3.2) |

---

## Phase-specific validation gates

### Phase 11B — Composition Re-Architecture
Must pass: §1, §2, §3 (zero-data, loading, error), §4 (missing category, workflow shelf, audience), §7 (check-types, lint, build), §8 (CVA variant system, zone differentiation)

### Phase 11C — Premium Design Foundations
Must pass: §1, §4 (missing logo, descriptor), §5 (contrast, focus, reduced motion), §7, §8 (not generic card-grid, premium motion)

### Phase 11D — Command Surface and Discovery
Must pass: §1, §5 (search keyboard nav), §6 (all search checks), §7

### Phase 11E — Featured Stage Rebuild
Must pass: §1, §3 (no featured items), §4 (missing logo), §5, §7, §8 (not generic card-grid, no pseudo-icons)

### Phase 11F — Utility and Support Surface
Must pass: §1, §3 (no notices, no support info), §4 (missing notice/support fields, expired notices), §5, §7

### Phase 11G — Overlay and Inventory Surface
Must pass: §1, §5 (overlay keyboard), §6 (overlay search, category grouping), §7

### Phase 11H — Hardening and Production Readiness
Must pass: **all checks** across all sections, plus `.sppkg` validation
