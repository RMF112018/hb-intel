# Phase 07 Bundle Budget Baseline

Measured production bundle sizes and phase-over-phase growth trajectory.

## Current baselines (Phase 07)

| Lane | JS Asset | JS Size | CSS Asset | CSS Size | Gzip JS |
|------|----------|---------|-----------|----------|---------|
| **A** (hb-webparts) | `hb-webparts-app.js` | 264.07 KB | `spfx-hb-webparts.css` | 0.63 KB | 80.51 KB |
| **B** (hb-shell-extension) | `hb-shell-extension-app.js` | 146.76 KB | `spfx-hb-shell-extension.css` | 2.22 KB | 47.36 KB |

## Lane A growth trajectory

| Phase | JS Size | CSS Size | Delta | Cause |
|-------|---------|----------|-------|-------|
| Phase 01 close | 262.49 KB | — | Baseline | Initial stabilized package |
| Phase 02-01 | 262.34 KB | — | -0.15 KB | Token system (shared objects reduced allocation) |
| Phase 02-02 | 263.40 KB | — | +1.06 KB | Zone tokens, CTA styling, greeting heading |
| Phase 02-03 | 263.89 KB | — | +0.49 KB | Motion/focus/media tokens, branded states |
| Phase 03-01 | 263.68 KB | — | -0.21 KB | Removed scaffold config import |
| Phase 03-02 | 264.07 KB | 0.63 KB | +0.39 KB JS, +0.63 KB CSS | CSS module for interactive states |
| **Current** | **264.07 KB** | **0.63 KB** | — | — |

**Total growth from Phase 01 baseline:** +1.58 KB JS, +0.63 KB CSS (negligible)

## Lane B growth trajectory

| Phase | JS Size | CSS Size | Delta | Cause |
|-------|---------|----------|-------|-------|
| Phase 04-01 | 144.15 KB | — | Baseline | Package scaffold |
| Phase 04-02 | 145.78 KB | 1.86 KB | +1.63 KB JS, +1.86 KB CSS | Top ribbon + alert band + CSS module |
| Phase 04-03 | 146.76 KB | 2.22 KB | +0.98 KB JS, +0.36 KB CSS | Footer rail + support band |
| **Current** | **146.76 KB** | **2.22 KB** | — | — |

**Total growth from Phase 04 baseline:** +2.61 KB JS, +2.22 KB CSS (negligible)

## Risk areas for future growth

| Risk | Lane | Likelihood | Mitigation |
|------|------|-----------|------------|
| Async data integration (React Query, fetch) | A | High | Budget headroom exists (264 KB vs 400 KB hard limit) |
| Property-pane implementation | A | Medium | SPFx types are devDependencies, not bundled |
| Additional shell surfaces | B | Medium | Budget headroom exists (147 KB vs 300 KB hard limit) |
| Image/media handling libraries | A | Low | Use native `<img>` + CSS; avoid heavy media libs |
| State management (Zustand) | Both | Low | Current React state is sufficient |
