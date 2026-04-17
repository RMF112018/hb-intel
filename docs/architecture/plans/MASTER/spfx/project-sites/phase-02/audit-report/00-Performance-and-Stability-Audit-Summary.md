# Project Sites Performance & Stability Audit Summary

## Scope
This package documents a repo-truth performance and rendering-stability audit of the live `main` branch implementation for the SharePoint-hosted **Project Sites** surface. The audit was driven by the attached objective prompt and focused on re-render glitches, transient visual instability, and host-runtime durability.

## Executive Conclusion
The current Project Sites implementation is **functionally loading but not architecturally stable enough for durable SharePoint-hosted use**.

The most likely visible glitch drivers are not generic React inefficiencies. They are a small set of concrete implementation seams:

1. **Self-induced layout mode churn**
   - The webpart observes the dimensions of its own rendered root section with a `ResizeObserver`.
   - Layout mode is then derived from both width and **content height**.
   - Because the section height changes when the control bar wraps, the filter panel opens, the result count changes, loading states swap, or the grid density changes, the component can force its own layout-mode transitions.
   - This creates a feedback loop: content changes drive mode changes, which drive more content and layout changes.

2. **Forced grid remounts on ordinary state changes**
   - The card grid is explicitly keyed by `scope` and `sortKey`.
   - That guarantees full subtree remounts on scope and sort changes.
   - The same grid also carries entry animation styling, so normal user interactions can present as flicker or “glitch” rather than a stable update.

3. **Non-idempotent shell mount/runtime seam**
   - The active SharePoint shell calls `mount()` from `render()`.
   - The IIFE app host mount implementation recreates a React root and `QueryClient` unconditionally.
   - If SharePoint calls the shell render path more than once, the app can be partially or fully rebooted instead of incrementally updated.
   - This is the highest-risk host-runtime seam in the current implementation.

4. **Render-time normalization churn**
   - Project data normalization happens in the hook render path rather than in a stable `select` transform or memoized derivation.
   - This recreates entry objects on ordinary rerenders and amplifies downstream card rerendering during UI-only state changes.

## Final Posture
The app is not in crisis, but the reported “hard to capture” transient glitch behavior is credible and consistent with the current code. The main problems are **structural** and should be remediated in closure order rather than papered over with cosmetic refinements.

The recommended closure order is:

1. Make the shell mount/runtime seam idempotent.
2. Replace self-observed height-driven layout mode logic with stable container/viewport rules.
3. Remove forced grid remount behavior and confine animations to first paint only.
4. Stabilize derived data and reduce card-level rerender churn.
5. Add regression coverage for repeated shell render, layout-mode stability, and transition safety.
6. Clean up manifest/doc drift and minor hardening items.

## Highest-Confidence Root Cause Ranking
1. **Layout mode derived from self-observed content height** — strongest direct explanation for intermittent control-bar/grid jitter.
2. **Forced grid remount + animation replay on scope/sort changes** — strongest direct explanation for visible transition flicker.
3. **Non-idempotent shell mount/runtime seam** — strongest host-level explanation for flashes during SharePoint-driven rerender events.
4. **Normalization churn and unnecessary downstream rerenders** — amplifying contributor, especially under search/filter interaction.
