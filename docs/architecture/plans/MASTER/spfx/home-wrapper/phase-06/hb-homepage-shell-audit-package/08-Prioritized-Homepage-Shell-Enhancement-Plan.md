# 08 — Prioritized Homepage Shell Enhancement Plan

## 1. Replace OOB Quick Links with governed PriorityActionsRail
- **Gap closed:** equal-weight directory row, no overflow governance, no breakpoint-safe action budgeting
- **Solution:** migrate current quick-link inventory into the Priority Actions data model and replace the OOB webpart on the flagship page
- **UX impact:** very high
- **Adaptability impact:** very high
- **Breakpoint-spec impact:** very high
- **Implement now vs later:** now
- **Type:** structural correction

## 2. Enforce non-empty-first first-lane composition
- **Gap closed:** empty states occupying flagship shell positions
- **Solution:** add shell-visible render-state or candidate-state contracts so the shell can promote non-empty, strong surfaces and demote empty / invalid ones
- **UX impact:** very high
- **Adaptability impact:** high
- **Breakpoint-spec impact:** high
- **Implement now vs later:** now
- **Type:** structural correction

## 3. Re-budget the entry stack for the laptop baseline
- **Gap closed:** first shell lane not visible early enough on the main laptop state
- **Solution:** tune hero height, inter-surface spacing, and action-band density together rather than independently
- **UX impact:** very high
- **Adaptability impact:** high
- **Breakpoint-spec impact:** very high
- **Implement now vs later:** now
- **Type:** structural correction

## 4. Align PriorityActionsRail to shell / container-aware policy
- **Gap closed:** action webpart currently classifies devices via `window.innerWidth` instead of actual usable shell conditions
- **Solution:** refactor rail breakpoint logic so it consumes shell-aligned budgets or container-driven state
- **UX impact:** high
- **Adaptability impact:** very high
- **Breakpoint-spec impact:** very high
- **Implement now vs later:** now
- **Type:** structural hardening

## 5. Add production validation harness for flagship entry states
- **Gap closed:** doctrine exists but closure proof is weak without repeatable viewport checks
- **Solution:** add acceptance harness / screenshots / test assertions for 14-inch baseline, tablet portrait, phone portrait, and short-height states
- **UX impact:** medium
- **Adaptability impact:** high
- **Breakpoint-spec impact:** high
- **Implement now vs later:** now
- **Type:** refinement + governance

## 6. Expand approved shell preset library
- **Gap closed:** future configurability is bounded conceptually but still thin operationally
- **Solution:** define 3–5 approved presets with semantic intent, compatible band families, and preview validation
- **UX impact:** medium
- **Adaptability impact:** high
- **Breakpoint-spec impact:** medium
- **Implement now vs later:** later / wave 02
- **Type:** structural hardening

## 7. Strengthen control-panel-safe decision boundaries
- **Gap closed:** good early governance model, but incomplete runtime enforcement for future reconfiguration
- **Solution:** formalize which decisions are configurable, previewable, persisted, or permanently protected
- **UX impact:** medium
- **Adaptability impact:** high
- **Breakpoint-spec impact:** medium
- **Implement now vs later:** later / wave 02
- **Type:** structural hardening

## 8. Normalize discovery and launcher strategy
- **Gap closed:** reference composition implies a richer homepage story than the production shell currently delivers
- **Solution:** decide whether WorkHub and SmartSearch live in the flagship page, and if so, where and under what shell-fit rules
- **UX impact:** medium to high
- **Adaptability impact:** medium
- **Breakpoint-spec impact:** medium
- **Implement now vs later:** later / wave 02
- **Type:** product composition decision
