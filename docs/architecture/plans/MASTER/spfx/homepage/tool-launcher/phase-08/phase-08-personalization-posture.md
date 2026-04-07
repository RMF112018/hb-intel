# Phase 08 — Personalization Posture

## Decision: Explicit Deferral

Favorites and recents are **explicitly deferred** from Phase 08 with clear rationale. This is the correct posture for the current repo truth and host constraints.

## Audit Findings

### What already exists

| Element | Status | Location |
|---------|--------|----------|
| `favoriteEligible` field | Normalized in `LauncherPlatformRecord` | `toolLauncherContracts.ts` |
| Utility rail placeholder | Documented as "deferred to Phase 04+" | `phase-04-utility-rail-contract.md` |
| Overlay "All Platforms" | Full inventory browsing | `LauncherAllPlatformsOverlay.tsx` |
| Command band search | Live inline search | `LauncherCommandBand.tsx` |

### What does NOT exist

| Element | Status |
|---------|--------|
| Server-side user preference storage | No backend endpoint for user prefs |
| SharePoint User Profile property for favorites | Not configured on tenant |
| `localStorage`-based preference helper | Not implemented |
| Recents tracking | No launch-event capture mechanism |

## Why Deferral is Correct

### 1. No reliable persistence mechanism

The launcher is a SharePoint-hosted webpart. Available client-side persistence options and their problems:

| Mechanism | Problem |
|-----------|---------|
| `localStorage` | Per-browser, per-origin. SharePoint sites may use different origins. Private browsing clears it. Cache clear loses all favorites. Not cross-device. |
| `sessionStorage` | Even more ephemeral — lost on tab close |
| SharePoint User Profile | Requires tenant admin configuration of custom properties. Not currently set up. |
| SharePoint list (per-user) | Requires a new list with per-user item permissions. Significant infrastructure beyond "lightweight." |
| Azure Function + Table Storage | Requires new backend endpoint, auth, and data model. Not lightweight. |

The prompt explicitly states: "without brittle persistence assumptions." Every available mechanism is either brittle (localStorage), requires infrastructure not yet in place (SP User Profile, Azure backend), or is disproportionately complex for the value delivered.

### 2. Search already solves the speed problem

The primary use case for favorites is "get to my frequently-used platforms faster." This is now substantially addressed by:
- **Command band search** (P08-02): Type 2–3 characters → top 6 matches appear instantly
- **All Platforms overlay** (P06-03): Live search across the full inventory
- **Featured stage** (P03): Most-used platforms are already prominently displayed
- **Workflow shelves** (P05): Categorized secondary platforms for browsing

### 3. Brittle favorites are worse than no favorites

A localStorage-based favorites feature that works 80% of the time and silently loses state on cache clear, incognito mode, or site URL changes creates user frustration. A feature that doesn't exist is predictable; a feature that intermittently loses data is worse.

### 4. Recents require launch-event capture

Tracking recently-launched platforms requires intercepting navigation (click on `<a>` elements). In a SharePoint-hosted webpart, this is unreliable — navigation leaves the page, and the webpart may not have time to persist the event. Service Worker approaches are disproportionately complex.

## What Would Unblock Favorites/Recents

| Blocker | Resolution path | Owner |
|---------|----------------|-------|
| No persistent user preference storage | Implement a user-preferences Azure Function endpoint with Table Storage, or configure a SharePoint User Profile custom property | Platform Engineering |
| No launch-event capture | Implement click tracking that persists before navigation (e.g., `navigator.sendBeacon` to an Azure endpoint) | Platform Engineering |
| No cross-device sync | Server-side storage resolves this automatically | Platform Engineering |

## Correct Next-Phase Posture

### When to revisit

Favorites and recents should be revisited when:
1. A user-preference persistence mechanism exists in the HB Intel backend (Azure Function or SP User Profile)
2. The mechanism supports per-user key-value storage with reasonable reliability
3. The business case justifies the infrastructure investment

### What to implement then

- **Favorites:** Toggle on flagship/shelf/index cards → persist platformKey set → render "Favorites" section in utility rail
- **Recents:** Capture launch events → persist ordered platformKey list (capped at 5–10) → render "Recently Used" section in utility rail
- Both should degrade gracefully if persistence is unavailable (hide the section, don't show empty favorites)

### What to preserve now

- `favoriteEligible` field remains in the normalized model — no need to remove it
- Utility rail's section-based architecture supports adding favorites/recents sections when ready
- The overlay already provides the "All Platforms" browsing experience that favorites would shortcut

## Impact on Launcher Hierarchy

None. Deferral means:
- Utility rail continues with its 4 existing sections (notices, help, access, contacts)
- No new "Favorites" or "Recently Used" sections added
- Flagship stage remains primary; shelves remain secondary
- Command band search serves the "quick access" use case
