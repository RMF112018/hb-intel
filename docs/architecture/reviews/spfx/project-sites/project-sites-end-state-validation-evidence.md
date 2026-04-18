# Project Sites End-State Validation Evidence

## Objective
Provide a concise end-state closure record after Wave 01 + Wave 02 so repo truth reflects final implemented behavior rather than transitional gaps.

## Updated / Superseded Documentation
- Updated `project-sites-search-filter-sort-enhancement.md` follow-up row to mark UPN display-name resolution as completed (no longer a pending follow-up).
- Superseded transitional implementation narrative with this end-state evidence record and the Wave closures:
  - `project-sites-authoritative-year-context-closure.md`
  - `project-sites-launch-state-model-closure.md`
  - `project-sites-truthful-partial-data-messaging-closure.md`
  - `project-sites-breakpoint-contract-compact-mode-closure.md`
  - `project-sites-card-identity-access-confidence-closure.md`
  - `project-sites-authoritative-people-display-closure.md`

## End-State Truth Checks
- Year authority is explicit and enforced: author override, host-page year, default year, all-projects fallback.
- Launch-state meaning is explicit and typed (`live`, `provisioning`, `archived`, `attention-needed`) and no longer inferred by coarse card-local heuristics.
- Breakpoint contract exists and is container-aware, including short-height compact override.
- People labels are authoritative-first with bounded fallback, and consistent across facets, chips, and card metadata.

No remaining stale claims were found in active Project Sites review closures about unresolved year authority or unresolved launch-state meaning.

## Final Validation Evidence Set
Validation run completed on 2026-04-17:
1. `pnpm --filter @hbc/spfx check-types` — pass
2. `pnpm --filter @hbc/spfx test` — pass
3. `pnpm --filter @hbc/spfx lint` — pass
4. `pnpm --filter @hbc/spfx-project-sites build` — pass
5. `pnpm --filter @hbc/spfx-project-sites lint` — pass

## Final Posture
Project Sites documentation and evidence are now coherent with the implemented end-state trust model.

## Phase-03 Wave-01 Responsive Refresh

Phase-03 Wave-01 (Prompts 01–08) delivered a redesigned responsive
system for Project Sites while preserving the public three-mode API. The
refreshed end-state closure artifact is
`project-sites-breakpoint-contract-compact-mode-closure.md`. That doc is
now authoritative for the responsive contract, per-mode responsibilities,
hosted SharePoint validation matrix, and automated test inventory.

Summary of Wave-01 outcomes:

- **Contract (Prompt-01)** — added `ProjectSitesDisplayClass` (`phone`,
  `tablet`, `desktop`, `wide-desktop`) and `ProjectSitesHeightClass`
  (`short`, `standard`) axes; published
  `PROJECT_SITES_MODE_RESPONSIBILITIES` as the authoritative per-mode
  record (control-band / card-density / grid / sparse intents).
- **Container state (Prompt-02)** — `useProjectSitesContainerState` now
  listens to `visualViewport.resize` in addition to `window.resize` and
  `ResizeObserver`, so short-height transitions propagate without
  requiring a container-width tick. Rerender suppression preserved.
- **Medium control band (Prompt-03)** — introduced a two-lane
  composition: lane 1 is full-width search; lane 2 is an explicit
  `data-project-sites-secondary-lane="medium"` container with a top
  divider, grouping scope (segmented) + sort + filter/reset actions.
- **Compact control band + filter ergonomics (Prompt-04)** — active
  filter chips collapsed behind a progressive-disclosure summary
  (`aria-expanded` / `aria-controls`), chip remove targets enlarged to
  ≥ 28×28 px, "Scope:" / "Sort:" uppercase labels visually hidden
  (`aria-label` preserved), filter panel padding tightened.
- **Card density variants (Prompt-05)** — `ProjectSiteCard` now branches
  **content policy** (not just CSS) by density: comfortable / regular /
  condensed. Metadata, identity chips, launch-confidence reassurance,
  and footer department are conditional; truthful blocked-state
  messaging and primary action are always preserved. Card shell emits
  `data-project-sites-card-density`.
- **Sparse grid recomposition (Prompt-06)** — wide/medium grids now
  center sparse clusters and feature single results via
  `data-project-sites-grid-sparse="featured" | "cluster" | "bounded" |
  "dense"`. One- and two-card states no longer read as small left-
  anchored islands on ultrawide.
- **First-screen compression + host-fit (Prompt-07)** — compact
  suppresses eyebrow and scope-source pill (redundant with host and
  scope selector); medium suppresses scope-source pill. Warning
  context-summary state and attention/provisioning counts are always
  preserved. Root padding honors `env(safe-area-inset-*)` via `max(...)`.
- **Evidence, tests, validation matrix (Prompt-08)** — breakpoint
  closure rewritten with per-mode responsibility tables, diagnostic
  attribute inventory, hosted SharePoint validation matrix, and
  automated test inventory. Visual-regression tooling not adopted;
  hosted matrix is the canonical verification procedure.

## Final Wave-01 Automated Validation Evidence

Validation run completed on 2026-04-18:

1. `pnpm --filter @hbc/spfx check-types` — pass
2. `pnpm --filter @hbc/spfx test` — pass (169 tests across 11 suites)
   - `projectSitesLayoutMode.test.ts` — 13 tests
   - `ProjectSitesRoot.test.tsx` — 34 tests
   - `components/ProjectSiteCard.test.tsx` — 26 tests
   - Other suites — unchanged and passing

Hosted SharePoint validation matrix lives in
`project-sites-breakpoint-contract-compact-mode-closure.md`. Run it on
hosted `/SitePages/Project Sites.aspx` when the responsive seam
changes.
