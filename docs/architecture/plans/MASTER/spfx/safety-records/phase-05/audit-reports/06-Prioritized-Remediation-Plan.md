# 06 — Prioritized Remediation Plan

## Priority 1 — Unify production entry and backend binding
- Gap closed: G-02, G-14, part of G-09
- Direction: structural redesign
- Implementation direction:
  - choose one authoritative production mounting model,
  - make backend config (`functionAppUrl`, `apiAudience`, host mode) explicit and required,
  - fail loudly when sharepoint mode is active but backend config is absent,
  - add build/release verification proving the mounted artifact gets the expected config.
- Impact:
  - removes the highest-risk “renders but not truly wired” class of failure
- Cross-layer implications:
  - app shell / SPFx packaging / deploy scripts / smoke tests

## Priority 2 — Introduce a typed Safety backend client seam
- Gap closed: G-03, G-04, G-05, G-06, G-11, G-13
- Direction: structural redesign
- Implementation direction:
  - create a distinct backend command client for preview/ingest/replay,
  - preserve backend request IDs, failure classes, and diagnostics,
  - add AbortController and bounded timeout handling,
  - add deliberate transient-fault retry posture only where justified,
  - keep SharePoint REST reads in a separate seam.
- Impact:
  - restores truthful frontend/backend error semantics
  - materially improves supportability
- Cross-layer implications:
  - feature package contracts, query hooks, upload/replay UI, tests

## Priority 3 — Implement preview-before-commit upload flow
- Gap closed: G-01, G-07, part of G-08
- Direction: structural redesign
- Implementation direction:
  - add preview repository/client method and hook,
  - refactor Upload page from direct submit to staged preview/confirm commit,
  - render template, period, project, duplicate, and commit-readiness diagnostics,
  - block commit until preview allows it,
  - persist/compare the preview context used for commit.
- Impact:
  - brings the UI into line with backend truth
- Cross-layer implications:
  - upload page, domain DTOs, backend client seam, outcome panels

## Priority 4 — Make authority model explicit and consistent
- Gap closed: G-08
- Direction: refinement unless product chooses parser-first redesign
- Implementation direction:
  - document current operator-authoritative fields in the UI,
  - surface mismatch/provenance more clearly in preview,
  - if parser-first is desired, define a deliberate contract migration and change both frontend and backend/domain together.
- Impact:
  - prevents dishonest source-of-truth behavior
- Cross-layer implications:
  - upload copy, preview UI, domain type comments, backend contract notes

## Priority 5 — Add support-grade outcome and review detail surfaces
- Gap closed: G-03, G-04, G-13
- Direction: refinement
- Implementation direction:
  - show request ID in terminal outcomes,
  - show bounded failure-class/support details in outcome and review flows,
  - keep raw graph details bounded to operator-safe exposure.
- Impact:
  - faster triage without overwhelming ordinary users
- Cross-layer implications:
  - outcome components, review queue cards, support docs

## Priority 6 — Harden accessibility for async flows
- Gap closed: G-12
- Direction: refinement
- Implementation direction:
  - add dedicated polite status region for progress/advisory updates,
  - add assertive alert only for urgent blocking failures,
  - ensure live-region containers exist before content changes,
  - verify keyboard flow across project picker, preview, submit, replay.
- Impact:
  - materially better assistive-tech behavior
- Cross-layer implications:
  - upload page, review queue, shared status primitives, tests

## Priority 7 — Replace hardcoded binding fragility with verified runtime truth
- Gap closed: G-09, G-10
- Direction: refinement now, structural improvement later
- Implementation direction:
  - short term: stronger release-proof verification that the compiled overlay matches the live environment
  - longer term: move toward runtime binding publication/verification rather than hardcoded frontend constants
- Impact:
  - reduces environment drift risk
- Cross-layer implications:
  - deploy scripts, host integration, admin/runtime config
