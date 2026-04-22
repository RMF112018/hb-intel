# 08 — Recommended Implementation Waves

## Wave 01 — Row correction and trigger parity
Scope:
- eliminate homepage row heading/count chrome
- make `More tools` the same tile size and internal grammar as primary tiles
- remove count badge from overflow trigger
- reduce boxed-in feeling of the row
- keep scope tightly focused on the first-view launcher row

Exit criteria:
- row renders as tile-first only
- overflow trigger is visually and dimensionally peer to primary tiles
- hosted screenshots no longer show top heading/count clutter

## Wave 02 — Drawer redesign and overflow closure
Scope:
- widen drawer across desktop/tablet breakpoints
- remove drawer header count and simplify metadata
- implement one active overflow layout strategy
- eliminate overlap/clipping
- provide functional horizontal swipe/scroll only where content genuinely overflows
- hide visible scrollbar while preserving alternate overflow cues and keyboard/touch safety

Exit criteria:
- no overlap
- no visible scrollbar
- swipe/scroll works when needed
- drawer uses materially more viewport width
- desktop/tablet drawer feels like premium continuation of the row

## Wave 03 — Hosted proof, tests, and package-truth refresh
Scope:
- refresh Playwright proof expectations if needed
- regenerate package/evidence artifacts
- update hosted breakpoint appendix and version markers
- capture post-fix screenshots

Exit criteria:
- package version, DOM markers, docs, and hosted runtime agree
- closure evidence is current
- launcher can be audited as repo-truth and hosted-truth aligned
