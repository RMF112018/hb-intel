# 13 — Hosted Proof Plan

## Required Screenshots

Capture after deploying the rebuilt package:

1. Feed Desk at 100% desktop.
2. Feed Desk at 75% / wide desktop.
3. Feed Desk narrow/tablet.
4. Feed Desk short-height.
5. Schedule workspace.
6. Preview workspace.
7. Admin workspace.
8. Inspector open with selected content.
9. OAuth/sync-blocked state.
10. Empty/no-content state.
11. Content available/unassigned state if data exists.
12. Reader/highlight/embed route proving canvas attr absence.

## DevTools Proof

- Root marker / package version proof.
- `data-foleon-manager-canvas="wide"` only on Manager.
- No raw secrets in DOM.
- `/api/foleon/config` network proof.
- JS/CSS asset proof matching new package.

## Acceptance Visual Criteria

- First impression is a feed manager, not diagnostics.
- Queue is the primary operating object.
- Feed slots are visible but subordinate.
- Inspector explains what to do with selected content.
- Empty state tells user how to move forward.
- No Lane Board primary nav.
- No command-button clutter across the top.
- No giant card stack.

