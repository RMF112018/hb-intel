# Phase 04 Prompt Package — Shell Extension Product (Lane B)

## Purpose

This package guides implementation of the **next homepage program phase** after Phase 03 closeout.

Phase 03 closed the **Lane A homepage/page-canvas product** as a governed, tested, documented composition system. The next logical phase is **Lane B — the supported shell-extension product**.

This package is therefore intentionally focused on:

- creating the `apps/hb-shell-extension` lane
- implementing supported SharePoint placeholder rendering only
- adding the top ribbon / alert-band capability
- adding the footer / support-rail capability
- hardening activation, packaging, and governance for that shell-extension lane

## Why this is the next phase

Phase 03 confirms that the homepage lane is now stable enough to stop using it as the place to solve shell concerns. The completion notes explicitly defer the shell-extension package to **Phase 04+**.

That means the next package should **not** reopen homepage composition polish, async data, or property-pane work. It should advance the three-lane architecture by building the dedicated shell-extension lane.

## Governing handoff assumptions

Treat the following as locked:

1. `apps/hb-webparts` remains **Lane A** and owns page-canvas homepage content only.
2. Shell-adjacent rendering belongs in **Lane B**, not in homepage webparts.
3. SharePoint shell takeover, suite-bar replacement, DOM hacks, and unsupported CSS overrides remain prohibited.
4. `@hbc/ui-kit/app-shell` is the primary UI entry point for Lane B, with `@hbc/ui-kit/theme` and `@hbc/ui-kit/icons` available as supporting entry points.
5. Lane C (navigation / branding governance) remains out of scope for this phase.

## Package contents

- `Phase-04-Implementation-Summary.md`
- `Phase-04-01-Shell-Extension-Architecture-and-Scaffold.md`
- `Phase-04-02-Top-Ribbon-and-Alert-Band.md`
- `Phase-04-03-Footer-Rail-and-Activation-Governance.md`
- `Phase-04-Risk-Exposure.md`
- `Phase-04-Standards-and-Best-Practices.md`

## Execution order

Run the prompts in numeric order.

- Prompt 01 establishes the Lane B package, architecture, boundaries, and scaffold.
- Prompt 02 implements the top placeholder experience and alert band.
- Prompt 03 implements the bottom placeholder/footer rail, then closes governance, packaging, and phase verification.

Do not skip Prompt 01.

## Out of scope for Phase 04

Do **not** use this phase to implement:

- property-pane authoring for homepage webparts
- homepage async data integration
- navigation governance automation
- unsupported shell takeover
- replacing Microsoft’s suite bar or app bar
- cross-package promotion of homepage-local primitives unless separately justified
