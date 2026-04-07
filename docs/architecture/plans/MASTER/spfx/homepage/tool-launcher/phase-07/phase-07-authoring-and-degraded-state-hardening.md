# Phase 07 — Authoring and Degraded-State Hardening

## 1. Authoring / Edit-Mode Findings

### SharePoint edit mode behavior

The Tool Launcher is **list-governed**, not property-pane-governed. Content comes from the `Tool Launcher Contents` SharePoint list, not from webpart property pane configuration. This means:

- **Edit mode does not change the launcher's rendering** — the same platforms, shelves, and notices display in both read and edit mode
- **No edit-mode-specific chrome is needed** — there are no property-pane-configured fields to surface authoring guidance for
- **The launcher is author-safe by default** — it renders identically regardless of page edit state

### What the webpart DOES show in edit mode

| State | What displays | Why |
|-------|-------------|-----|
| **SPFx context available, list has data** | Full 4-region launcher composition | Normal rendering |
| **SPFx context available, list empty** | `HomepageEmptyState` with "No platforms available" + authoring guidance | `listEmpty` authoring message directs authors to populate the list |
| **SPFx context available, fetch error** | Config fallback (manifest sample data) | Silent degradation — no error UI for end users |
| **No SPFx context (local dev / packaging)** | Config fallback (manifest sample data) | Expected for non-SharePoint contexts |
| **SPFx context, loading** | `HomepageLoadingState` skeleton | Professional loading state |

### The `listEmpty` authoring message

When the live list returns zero active platforms, the launcher shows:
- **Title:** "No platforms available"
- **Description:** "The Tool Launcher Contents list has no active platform entries. Add platforms with IsActive set to Yes."

This is the primary authoring guidance — it tells page editors exactly what to do.

## 2. Partial-Data Handling Rules by Region

### Flagship stage (`LauncherFlagshipStage`)

| Missing data | Behavior |
|-------------|----------|
| Zero featured platforms | Stage returns `null` — composition shell suppresses the region |
| Featured platform missing descriptor | Card renders name + CTA only, no layout collapse |
| Featured platform missing logo | 5-step fallback: record logo → manifest logo → manifest icon → monogram → category icon |
| Featured platform logo fails to load | `onError` → Lucide icon fallback, 56px container preserved |
| Featured platform missing notice | CTA row renders without badge |
| Featured platform missing category | Icon resolution falls to platform-specific or default |

### Utility rail (`LauncherUtilityRail`)

| Missing data | Behavior |
|-------------|----------|
| Zero notices | Notices section suppressed |
| Zero help links | Help section suppressed |
| Zero access links | Access section suppressed |
| Zero support contacts | Contacts section suppressed |
| All four sections empty | Entire rail returns `null` — body grid collapses to 1fr |
| Notice missing details | Badge-only rendering, no detail line |
| Notice with expired date | Auto-suppressed in normalization (not rendered) |
| Notice with invalid tone | Falls back to `'info'` tone |

### Workflow shelves (`LauncherWorkflowShelves`)

| Missing data | Behavior |
|-------------|----------|
| Zero platforms with workflowShelf | Shelves component returns `null` |
| Shelf with zero platforms after audience filter | Shelf not derived (never renders) |
| Shelf card missing descriptor | Card renders name only |
| Shelf card missing logo | Same 5-step fallback as flagship |
| Shelf card logo fails to load | `onError` → Lucide icon fallback |

### All-platforms overlay (`LauncherAllPlatformsOverlay`)

| Missing data | Behavior |
|-------------|----------|
| Zero platforms in index | "No platforms available" empty state |
| Search returns zero matches | "No platforms matching '{query}'" state |
| Platform missing category | Grouped under "Other" |
| Platform missing descriptor | Index row renders name only |

### Command band (`LauncherCommandBand`)

| Missing data | Behavior |
|-------------|----------|
| Zero platform count | Supporting line shows tagline only (desktop) or nothing (mobile) |
| Zero featured count | Featured count omitted from supporting line |
| No `onAllPlatforms` handler | "All Platforms" button disabled |
| No `onNeedHelp` handler | "Need Help" button disabled |

## 3. Empty / Loading / Degraded-State Behavior

### Loading state

| Condition | What renders |
|-----------|-------------|
| `isLoading` prop true | `HomepageLoadingState` with "Loading tool launchers" |
| `listLoading` true (hook fetching) | Same loading state |
| Loading state is brief | 5-minute cache prevents repeated loading flashes |

### Empty states

| Condition | What renders | Authoring message |
|-----------|-------------|-------------------|
| Live list returns zero active platforms | `HomepageEmptyState` | `listEmpty`: "No platforms available" |
| Config fallback, no groups configured | `HomepageEmptyState` | `noData`: "No tool launchers configured" |
| Config fallback, groups configured but all filtered | `HomepageEmptyState` | `invalid`: "Tool launcher configuration is invalid" |

### Degraded states (platforms exist but metadata sparse)

| Condition | What renders |
|-----------|-------------|
| Platforms exist, none featured, none shelved | Command band + "All Platforms" button + overlay (all platforms in index) |
| Platforms exist, some featured, none shelved | Command band + flagship stage + overlay |
| Platforms exist, none featured, some shelved | Command band + workflow shelves + overlay |
| Platforms exist, all metadata complete | Full 4-region composition + overlay |

**Key insight:** The launcher degrades gracefully by suppressing regions without data rather than rendering empty containers. The "All Platforms" overlay serves as the universal fallback — every active platform appears in the index regardless of featured/shelf metadata.

### Fetch error degradation

| Condition | What renders |
|-----------|-------------|
| REST fetch fails (network, 404, 500) | Falls through to config fallback silently |
| Config fallback has sample data | Renders sample grouped launcher |
| Config fallback is empty | `HomepageEmptyState` with authoring message |

## 4. Remaining Risks

| Risk | Severity | Mitigation | Deferred to |
|------|----------|------------|-------------|
| **Platforms with no metadata** | Low | "All Platforms" overlay ensures discovery; flagship/shelves suppress cleanly | Content governance — list editors should assign featured/shelf/category values |
| **Stale data in list** | Low | 5-minute cache TTL; no stale-content detection UI | Future — could add staleness indicator using `LastReviewedOn` field |
| **Config fallback divergence** | Low | Config fallback renders flat `HbcLauncherSurface`; live data renders 4-region shell. The two paths are intentionally different. | Acceptable — config fallback is for dev/demo only |
| **Edit mode with stale cache** | Low | Cache doesn't clear on page edit-mode toggle. Authors editing the list need to refresh after 5 minutes. | Acceptable for current implementation |
| **Missing logo assets** | Medium | All cards use Lucide fallback icons until SVG assets deployed | Ops — deploy logos to HBCentral |
| **Audience not wired from SPFx** | Medium | `activeAudience` is a prop but not extracted from SP user profile. All platforms visible to all users. | Runtime wiring needed |
| **Notice auto-expiry only at normalization time** | Low | Expired notices are suppressed when data is normalized, not when rendered. A notice that expires during a page session persists until next fetch. | Acceptable — 5-minute cache TTL limits exposure |
