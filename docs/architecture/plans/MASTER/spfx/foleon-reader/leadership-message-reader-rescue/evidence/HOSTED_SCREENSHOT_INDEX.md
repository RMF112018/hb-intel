# Prompt 04 — hosted screenshot and validation index

## Proof standards

For each scenario:

- **Screenshot:** attach file name or link; include **UTC timestamp** when captured.
- **Browser / session:** browser product + version; whether signed into target tenant; SharePoint **edit** vs **read** mode where applicable.
- **Cache / stale-bundle mitigation:** record **app catalog package version** deployed for **hb-intel-homepage** (must match [`PACKAGE_PROOF.md`](PACKAGE_PROOF.md) line **1.1.98.0** for this rescue closure) and method used (**hard refresh**, DevTools **Disable cache**, tenant-specific cache-bust, etc.).
- **Copy confirmation:** quote **visible** headline/status/CTA strings and compare to approved strings from repo (`getLeadershipPresentationState` / phase-08 baseline).

## Scenario matrix

| Scenario | Status | Screenshot / substitute | Notes |
| --- | --- | --- | --- |
| Homepage row — Leadership visible | **Not captured** | — | Requires tenant deploy of `hb-intel-homepage.sppkg` **1.1.98.0** |
| Leadership — live | **Not captured** | — | Needs published Leadership record + embed path |
| Leadership — preview/sample | **Not captured** | — | Needs preview-capable page / authoring surface |
| Leadership — no live / empty | **Not captured** | — | Depends on feed configuration |
| Leadership — blocked / unavailable | **Not captured** | — | Needs governance-disabled record |
| Leadership — external-open | **Not captured** | — | Needs `requiresExternalOpen` style record |
| Narrow / mobile viewport | **Not captured** | — | |
| Full-window viewer open | **Not captured** | — | |
| Focus return after viewer close | **Not captured** | Repo substitute: `packages/foleon-reader/src/components/__tests__/FoleonFullWindowViewerProvider.test.tsx` — `closeViewer removes the dialog… returns focus to the launch element` | Hosted keyboard proof still owed if acceptance requires tenant evidence |
| SharePoint edit mode | **Not captured** | — | |
| Zoom 100% | **Not captured** | — | |
| Zoom 75% | **Not captured** | — | |
| Short-height viewport | **Not captured** | — | |

## Not available vs not possible

- **Not available:** rows above — **screenshots not attached in this repo commit** (automated agent cannot access tenant browser).
- **Not possible to validate here:** any scenario requiring **specific tenant content** you cannot reproduce — when capturing manually, replace status with **Not reproducible** and explain (e.g. “no blocked Leadership record in registry”).

## Sibling lanes — homepage row stability

**Packaged substitute (Prompt 04):** extracted `hb-intel-homepage` bundle includes routing markers for **Project Spotlight** and **Company Pulse** alongside **Leadership** (see [`PACKAGE_PROOF.md`](PACKAGE_PROOF.md)).

**Hosted substitute owed:** side-by-side screenshots of Spotlight + Pulse cards unchanged vs baseline — **not captured** here.

## Anti-stale checklist (manual)

1. App Catalog shows solution **1.1.98.0** for hb-intel-homepage (or your promoted version).
2. Hard refresh / cache bust **before** judging copy.
3. Compare visible strings to [`FORBIDDEN_COPY_SCAN.md`](FORBIDDEN_COPY_SCAN.md) approved list.
4. Confirm console free of **blocking** runtime errors for homepage web part.
