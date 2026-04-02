# Implementation Summary and Phase Map

## Objective

Deliver a serious, repo-truth-driven prompt series that can guide a local code agent through the full SPFx shared UI/UX conformance effort for the HB Intel SharePoint app suite.

## Program framing

The work should not be executed as one broad “clean up the UI” task. It should be run as a controlled architecture-and-rollout program with explicit ownership rules, implementation guardrails, acceptance criteria, and package rebuild validation.

## Phase map

### Phase 0 — Evidence and decision freeze
- repo-truth audit
- SPFx package/source mapping validation
- shared ownership freeze for `@hbc/ui-kit`, `@hbc/shell`, `@hbc/app-shell`, `packages/spfx`, and app-local integration code
- conformance inventory and drift classification

### Phase 1 — Shared SPFx shell and composition foundation
- canonical SPFx app root/provider/bootstrap pattern
- shell framing for SharePoint-hosted experiences
- continuity cues, navigation framing, degraded states, and host-boundary handling
- removal of unjustified app-level shell/bootstrap duplication

### Phase 2 — Shared layout and interaction hardening
- page/layout taxonomy for list/detail/create/dashboard/admin/viewer/review patterns
- command surfaces, navigation helpers, detail headers, status semantics
- data surfaces, form containers, modals/drawers/panels, empty/loading/retry states
- permission-transparent and implementation-honest feedback patterns

### Phase 3 — Suite-wide conformance rollout
- accounting source app rollout
- project-setup source app rollout
- project-sites source app rollout
- governed exception handling where domain specialization is valid

### Phase 4 — Doctrine, enforcement, and closure
- update `docs/reference/ui-kit/`
- reconcile stale plan/review docs where needed
- strengthen lint/test/contract/visual/conformance enforcement
- rebuild and validate target SharePoint packages
- final audit and signoff

## Success criteria

- the three target SharePoint package source applications present as one governed suite rather than three partially related apps
- shared shell, layout, and interaction primitives are owned in the right packages and reused consistently
- unjustified drift is removed without flattening real domain workflows
- documentation makes future drift harder to introduce
- rebuild and verification evidence exists for the source paths feeding:
  - `dist/sppkg/hb-intel-accounting.sppkg`
  - `dist/sppkg/hb-intel-project-setup.sppkg`
  - `dist/sppkg/hb-intel-project-sites.sppkg`

## Non-goals

- inventing a new parallel design system
- rewriting valid domain workflows only for cosmetic consistency
- hiding SharePoint/SPFx host limitations
- relying on assumptions when repo truth can verify the answer
