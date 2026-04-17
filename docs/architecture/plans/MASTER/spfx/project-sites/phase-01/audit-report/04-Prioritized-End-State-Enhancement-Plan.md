# Phase 4 — End-State Enhancement Plan

## Priority 1 — Restore authoritative year-context resolution
- **Gap closed:** dead `yearOverride` semantics and missing host-context authority
- **Product-grade solution:** define one explicit resolution order, pass runtime config into the app, honor page-level year / author override deliberately, and surface the resolved source in the UI
- **Impact:** highest trust gain; removes the biggest mismatch between declared mission and actual behavior
- **Cross-layer implications:** shell runtime, mount signature, root component, manifest / property model, authoring docs
- **When:** now
- **Type:** structural redesign

## Priority 2 — Replace coarse raw-list querying with a canonical repository adapter
- **Gap closed:** full-item fetches, fragile inference, and over-reliance on client-side normalization as the long-term truth model
- **Product-grade solution:** explicit selected field contract, stabilized adapter, explicit classification for missing / malformed launch-critical fields, and bounded strategy for all-projects scope that is still trustworthy
- **Impact:** major trust, maintainability, and performance gain
- **Cross-layer implications:** hooks, types, normalizer, tests, docs
- **When:** now
- **Type:** structural refinement

## Priority 3 — Introduce an explicit launch-state model
- **Gap closed:** misleading inference that “no URL = provisioning” and “not active/pursuit = archived/other”
- **Product-grade solution:** define explicit derived states such as `live`, `provisioning`, `archived`, `attention-needed`, and drive card visuals / affordances from that model
- **Impact:** major click-confidence gain
- **Cross-layer implications:** types, normalizer, card component, empty/partial states, tests
- **When:** now
- **Type:** structural refinement

## Priority 4 — Strengthen project identity for portfolio-scale scanning
- **Gap closed:** current cards are too thin for confident selection in large mixed-year / mixed-division scopes
- **Product-grade solution:** add higher-value secondary metadata and more deliberate visual hierarchy for discriminating similar projects quickly
- **Impact:** high usability gain, especially in `All Projects`
- **Cross-layer implications:** card component, root grid, possibly normalized contract
- **When:** now
- **Type:** targeted refinement

## Priority 5 — Add truthful partial-data and no-context messaging
- **Gap closed:** users cannot tell whether absence is due to scope, bad data, missing URL, or actual provisioning
- **Product-grade solution:** explicit messaging for data issues, excluded rows, and host/scope resolution; preserve concise operational tone
- **Impact:** high trust gain, moderate implementation cost
- **Cross-layer implications:** hooks, root component, card state system
- **When:** now
- **Type:** targeted refinement

## Priority 6 — Add a real breakpoint contract and compact-mode behavior
- **Gap closed:** lack of container-aware and constrained-state definition
- **Product-grade solution:** define compact / medium / wide modes, single-column task-first behavior under constraint, and a documented breakpoint spec
- **Impact:** high host-fit gain and doctrine compliance improvement
- **Cross-layer implications:** root component, control bar, possibly shared primitives, docs
- **When:** now
- **Type:** targeted refinement

## Priority 7 — Improve people and access confidence treatment
- **Gap closed:** heuristic UPN humanization and missing launch-confidence cues
- **Product-grade solution:** resolve display labels authoritatively where feasible and add clear but non-speculative access cues
- **Impact:** moderate trust gain
- **Cross-layer implications:** pipeline helpers, people resolution seam, card metadata, filter labels
- **When:** now, after Priority 2
- **Type:** targeted refinement

## Priority 8 — Clean dead authoring semantics and keep docs aligned
- **Gap closed:** manifest/property claims that do not map to runtime truth
- **Product-grade solution:** either implement the declared authoring path or delete it; document the final contract precisely
- **Impact:** moderate but important product-governance gain
- **Cross-layer implications:** manifests, shell property pane, docs, tests
- **When:** now
- **Type:** targeted refinement
