# Phase 03 Prompt Package — Homepage Composition and Template Hardening

This package generates the **Phase 03** execution prompts for `apps/hb-webparts`, using the executed **Phase 02** completion notes and phase-documentation artifacts as the primary handoff set.

## Objective

Advance the homepage lane from a **visually premium component system** to a **governed homepage composition system**.

Phase 03 should build on the repo-truth established by Phase 01 and Phase 02:

- Phase 01 stabilized the homepage as a bounded product lane with documented package boundaries, shared seam taxonomy, per-webpart contracts, and acceptance coverage.
- Phase 02 created a homepage-local token system, upgraded shared primitives and webparts to token-backed styling, established an editorial/top-band visual system, and closed motion/media/accessibility polish items.
- Phase 03 should now focus on **homepage composition architecture, full-width top-band implementation, interactive-state hardening, preview/template promotion, and production-ready composition acceptance**.

## Governing handoff inputs

Treat these as the load-bearing implementation handoff documents for this phase package:

- `Phase-02-01-Completion-Note.md`
- `Phase-02-02-Completion-Note.md`
- `Phase-02-03-Completion-Note.md`
- `Homepage-Design-Token-Map.md`

Carry forward the still-governing Phase 01 product docs when needed for package boundary and contract truth:

- `Homepage-Product-Boundary.md`
- `Homepage-Shared-Seam-Taxonomy.md`
- `Homepage-Per-Webpart-Contract-Reference.md`
- `Homepage-Acceptance-Checklist.md`

## Package contents

- `Phase-03-Implementation-Summary.md`
- `Phase-03-01-Homepage-Zone-Architecture-and-Composition-Promotion.md`
- `Phase-03-02-Full-Width-Top-Band-and-Interactive-State-System.md`
- `Phase-03-03-Homepage-Composition-Hardening-and-Preview-Template.md`
- `Phase-03-Risk-Exposure.md`
- `Phase-03-Standards-and-Best-Practices.md`

## Sequencing

1. **Prompt 01** defines the composition architecture and promotes the reference composition into a governed preview/composition surface.
2. **Prompt 02** implements the full-width top-band and closes the major interactive-state and motion/focus gaps that Phase 02 intentionally deferred.
3. **Prompt 03** hardens the composition into a production-ready preview/template lane with verification, docs reconciliation, and acceptance closure.

## Hard gates for Phase 03

- Preserve `@hbc/ui-kit/homepage` as the homepage lane’s primary UI entry point.
- Preserve the Phase 01 product boundary. Do not drift into shell-extension or navigation-governance scope.
- Preserve all currently passing structural and acceptance tests.
- Do not regress independent mountability of all 10 production webparts.
- Do not introduce async data integration or property-pane implementation in this phase.
- Do not re-read files that are already in your current context window or active memory unless you need exact text for a surgical change.

## Explicitly deferred beyond Phase 03

- SPFx property pane implementation
- Real async data integration
- Shell-extension package work (Lane B)
- Navigation / branding governance automation (Lane C)
- Cross-package promotion of homepage-local primitives to `@hbc/ui-kit` unless the promotion threshold is truly met outside homepage
