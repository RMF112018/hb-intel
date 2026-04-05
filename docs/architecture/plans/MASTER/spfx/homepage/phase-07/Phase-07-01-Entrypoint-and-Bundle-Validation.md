# Phase 07-01 — Entrypoint and Bundle Validation

## Objective

Audit and lock the actual build and packaging truth for the SharePoint homepage ecosystem, with emphasis on entrypoints, emitted assets, loader-facing seams, and cumulative package integrity.

## Repo scope

- `apps/hb-webparts/**`
- `apps/hb-shell-extension/**`
- relevant shared build tooling and SPFx packaging seams
- relevant docs that currently describe packaging, emitted assets, loader contracts, and deployment posture

## Context carried in from prior phases

Do **not** redesign Lane A, Lane B, or Lane C.

Treat the following as already complete and locked unless repo truth proves a contradiction:

- Lane A homepage package is a governed page-canvas product
- Lane B shell-extension package is a governed placeholder-based product
- Lane C is governance-only
- import discipline for each lane is already established
- homepage and shell-extension are distinct products with distinct entry-point rules

## Required audit questions

1. What are the real build entrypoints for `apps/hb-webparts` and `apps/hb-shell-extension`?
2. What JS and CSS assets are emitted in production builds?
3. What global mount APIs are published and what exact names do they use?
4. Which files are part of the cumulative deployment artifact versus proof-case-only or preview-only entry files?
5. Is any README, plan, or reference doc stale or incomplete relative to current repo truth?
6. Are emitted asset names, solution metadata, and runtime assumptions stable enough for release-hardening?
7. Are there any leftover scaffold/proof-case assumptions still influencing production packaging?

## Required work

### A. Produce a packaging-truth audit
Create a repo-truth document that captures, for both packages:

- package name
- build command
- output format
- emitted JS asset(s)
- emitted CSS asset(s)
- public/global mount surface
- production entrypoints
- proof-case or non-production entrypoints
- solution metadata linkage
- import-discipline enforcement points
- current verification commands

### B. Validate entrypoint integrity
For each lane:

- identify the real production entrypoint(s)
- identify any alternate or proof-case entrypoints
- document whether they are intentionally retained
- flag any ambiguity or dead seams

### C. Validate loader/runtime seam assumptions
Confirm and document:

- the expected global API names
- whether mount/unmount surfaces are stable
- whether null-safe behavior is intentional and test-backed
- whether emitted CSS is expected and accounted for in docs/release thinking

### D. Freeze production-vs-nonproduction seam boundaries
Create or update a concise reference that answers:

- what is production
- what is preview/reference only
- what is proof-case only
- what is deprecated/orphaned but still retained

## Deliverables

Create:

- `Phase-07-Packaging-Truth-Audit.md`
- `Phase-07-Entrypoint-and-Emitted-Asset-Inventory.md`
- `Phase-07-01-Completion-Note.md`

Update as needed:

- relevant READMEs
- packaging/deployment references
- current-state classification entries if new docs are created in canonical locations

## Verification requirements

Run and report:

- `check-types`
- `lint`
- `build`
- `test`

If any build emits CSS, record it explicitly in the completion note and asset inventory.

## Hard rules

- do not broaden scope into property panes or async data
- do not change Lane A/B visual behavior unless required to fix a packaging/runtime defect
- do not remove proof-case files unless repo truth and references clearly support removal
- prefer documentation reconciliation over speculative refactor
