# 07 — Prioritized Enhancement and Redesign Plan

## 1. Re-anchor the homepage row around tile-first utility
- **Gap closed:** timid row strip; hosted heading/count chrome
- **Implementation direction:** remove homepage row heading/count output; widen row authority; keep tile-first surface only
- **Expected impact:** stronger first-view clarity and cleaner homepage integration
- **Doctrine relevance:** homepage overlay priority-actions posture; surface composition checklist
- **Cross-layer implications:** ui-kit row width logic + homepage band shell
- **Now vs later:** now
- **Refinement vs redesign:** refinement

## 2. Rebuild the More Tools trigger as a strict peer tile
- **Gap closed:** overflow trigger mismatch
- **Implementation direction:** same size contract, same internal alignment logic, no count badge, same hover/press behavior family
- **Expected impact:** overflow entry stops looking like an exception and starts reading like a deliberate secondary tile
- **Doctrine relevance:** coherent surface family; compact premium command posture
- **Cross-layer implications:** trigger JSX + tile CSS + hosted screenshots/tests
- **Now vs later:** now
- **Refinement vs redesign:** refinement

## 3. Redesign the desktop/tablet drawer as a wider bottom tray
- **Gap closed:** drawer underuses width; drawer feels modal
- **Implementation direction:** increase max inline usage by breakpoint, retain bottom anchoring, simplify header
- **Expected impact:** stronger continuity with row, less cramped content
- **Doctrine relevance:** confident width usage; homepage-grade overflow behavior
- **Cross-layer implications:** drawer CSS + viewport behavior + proof screenshots
- **Now vs later:** now
- **Refinement vs redesign:** redesign

## 4. Choose one drawer content strategy and close it fully
- **Gap closed:** overlap/clipping; dormant rail drift
- **Implementation direction:** either:
  - grouped responsive grid with no horizontal scroll, or
  - section rails with true overflow viewport and hidden scrollbar
  For the user’s requested behavior, use true horizontal rails only when section content overflows.
- **Expected impact:** stable and understandable overflow behavior
- **Doctrine relevance:** explicit compact/overflow behavior; interaction completeness
- **Cross-layer implications:** JSX structure, CSS, accessibility, Playwright proof
- **Now vs later:** now
- **Refinement vs redesign:** redesign

## 5. Remove inventory noise from the launcher
- **Gap closed:** overexposed counts
- **Implementation direction:** remove row count, trigger count, drawer header count; keep section labeling minimal
- **Expected impact:** faster scanability and less visual clutter
- **Doctrine relevance:** clear primary story in first view
- **Cross-layer implications:** runtime markers/tests if they assumed counts
- **Now vs later:** now
- **Refinement vs redesign:** refinement

## 6. Refresh hosted/package truth and closure artifacts
- **Gap closed:** stale proof
- **Implementation direction:** rerun package build, update marker/version evidence, refresh hosted screenshots and breakpoint appendix
- **Expected impact:** makes the launcher auditable and shippable
- **Doctrine relevance:** packaged result must match source intent
- **Cross-layer implications:** build pipeline, e2e attachments, docs
- **Now vs later:** immediately after UI work
- **Refinement vs redesign:** refinement
