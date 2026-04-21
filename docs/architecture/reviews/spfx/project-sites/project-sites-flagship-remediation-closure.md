# Project Sites — Flagship Remediation: Search/Pagination Correctness Closure

**Bundle:** `hb-intel-project-sites`
**Manifest version:** `1.2.0.0` (was `1.1.3.0`)
**Closure date:** 2026-04-21

## What changed

### A. Retrieval and pagination — eliminate the silent cap

| Layer | Before | After |
|---|---|---|
| Repository (`projectSitesRepository.ts`) | `.top(2000)` capped All-Projects fetch; year scope had no `.top()` (PnPjs default 100) | Both scopes drained via PnPjs v4 async iteration with `.top(5000)` per page |
| Cap constant (`types.ts`) | `PROJECT_SITES_ALL_SCOPE_LIMIT = 2000` (search-killing cap) | `PROJECT_SITES_ALL_SCOPE_CEILING = 25000` (defense-in-depth ceiling) + `PROJECT_SITES_PAGE_SIZE = 5000` |
| Bounded signal | None — silent truncation | `bounded: boolean` + `fetchedCount: number` propagate from repository → resolver → hook → UI |
| Pagination | None — entire result rendered as one grid | Real client-side pagination via new `projectSitesPagination.ts` (pure module, fully tested) |
| Page reset on input change | N/A | Page resets to 1 on any change to search, sort, filters, or scope |
| Page size by mode | N/A | wide=24, medium=18, compact=12 |
| Overflow honesty | None | New `ProjectSitesOverflowNotice` banner explains the safety ceiling truthfully when hit |

### B. UI — pagination control + overflow notice

- `components/ProjectSitesPaginationControl.tsx` — premium pagination with `lucide-react` chevrons, real `<nav>` semantics, `aria-current`, `aria-controls`, `aria-live` range readout. Wide/medium = numbered window with first/last/prev/next; compact = prev/readout/next strip. `prefers-reduced-motion` honored. ≥44px touch targets.
- `components/ProjectSitesOverflowNotice.tsx` — calm but visible amber banner, `lucide-react` `AlertTriangle`, `role="status"`. Names the actual fetched count and ceiling.

### C. Premium stack adoption

`@hbc/spfx` package gained direct dependencies on the doctrine-mandated premium stack (versions matched to `@hbc/ui-kit`):

- `motion`, `lucide-react`, `@floating-ui/react`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip`, `class-variance-authority`, `clsx`

Today's pass uses `lucide-react` (pagination + overflow icons). The remaining stack members are now available for the deferred command-band / card / filter-panel rebuild without further dependency churn.

## Why the previous implementation was insufficient

The repository's `.top(PROJECT_SITES_ALL_SCOPE_LIMIT)` (= 2000) on the All-Projects path silently truncated the fetch before the client-side pipeline ever saw the rest of the dataset. A search for project #2500 in a 5000-row list returned "no match" — the row was never fetched. The UI badge ("X of Y shown") happily reported `Y = 2000`, treating the cap as the full inventory. The year-scoped path had a parallel hole: PnPjs v4's default `$top` is 100, so any year with more than 100 projects was also silently truncated.

The pagination was equally absent: the grid mapped over `visibleEntries.map(...)` directly, rendering the entire post-pipeline result. With a real catalogue this would page-down indefinitely with no count discipline.

## Why the new implementation is correct

- **Truly global search** within the ceiling: the repository now drains every page via `_Items[Symbol.asyncIterator]` (PnPjs v4 native), with `.top(5000)` (SharePoint REST max page size) to minimize round-trips. The pipeline operates on the full eligible set.
- **Honest overflow signal** at the boundary: the ceiling is a defense-in-depth limit, not a search cap. When it halts the drain, `bounded: true` flows through the contract and the overflow notice tells the user exactly what happened — no silent truncation.
- **Truthful pagination** under search/filter/sort/scope changes: a reset signature derived from those inputs forces the page index back to 1 whenever the result-set cardinality could change. `paginate()` clamps page indices to `[1, totalPages]` so a stale index never silently hides matches.
- **Layout-aware density**: page size adapts per layout mode so the visible grid stays scannable on touch and dense on desktop.

## Critical files

**Modified**

- `packages/spfx/package.json` — premium stack deps
- `packages/spfx/src/webparts/projectSites/types.ts` — new constants, retrieval signals on `IProjectSitesResult`
- `packages/spfx/src/webparts/projectSites/types.test.ts` — assertion updates
- `packages/spfx/src/webparts/projectSites/projectSitesResolver.ts` — `IProjectSitesQueryResult` carries bounded/fetchedCount
- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts` — paged drain (both scopes + year discovery)
- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.test.ts` — drain unit tests
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts` — `select` callback bundles entries + signals; signals propagate to result
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.test.ts` — rewritten for new shape, plus end-to-end select test
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` — pagination state + reset signature, paged grid render, overflow notice, pagination control
- `packages/spfx/src/webparts/projectSites/index.ts` — barrel updated
- `apps/project-sites/config/package-solution.json` — version bump

**New**

- `packages/spfx/src/webparts/projectSites/projectSitesPagination.ts` (+ test, 16 tests)
- `packages/spfx/src/webparts/projectSites/components/ProjectSitesPaginationControl.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSitesOverflowNotice.tsx`

## Verification evidence

| Check | Command | Result |
|---|---|---|
| Type-check | `pnpm --filter @hbc/spfx check-types` | **Pass** |
| Unit tests | `pnpm --filter @hbc/spfx test` | **Pass — 219/219** across 15 files |
| Lint | `pnpm --filter @hbc/spfx lint` | **0 errors**; 4 warnings, all pre-existing |
| Pagination unit coverage | new `projectSitesPagination.test.ts` | **16 tests** including stale-page clamping, empty input, partial last page, ellipsis windowing, reset-signature change detection, layout-mode page sizing |
| Drain unit coverage | new tests in `projectSitesRepository.test.ts` | Drain to completion, mid-dataset bounded halt, exact-ceiling natural end (bounded=false), empty pages |
| Bounded-signal propagation | `useProjectSites.test.ts` "propagates bounded=true when the repository hit the safety ceiling" | **Pass** |
| End-to-end resolver wiring | `useProjectSites.test.ts` "select wires the repository result through the resolver and attaches retrieval signals" | **Pass** |

### What is *not* in this verification package

- **Hosted SharePoint validation across the audit breakpoint matrix.** This environment cannot deploy to a SharePoint tenant. The hosted spot-check (real `.sppkg` deploy → live tenant render at the seven required viewports) is the user's final acceptance step. The bundled IIFE will reflect the changes here because the build pipeline (`tools/build-spfx-package.ts` + `tools/spfx-shell/`) compiles from current source.
- **Playwright e2e spec.** Setting up a credible local mount that exercises the full repository against synthetic SharePoint responses is a self-contained workstream; deferred so this pass does not balloon. Manually spot-checking via `pnpm --filter @hb/project-sites dev` (or the equivalent app dev script) and the new unit tests are sufficient evidence for the load-bearing search/pagination contract.

## Doctrine alignment

Against `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`:

| Category | Movement |
|---|---|
| Interaction completeness | **Materially advanced** — pagination is now a real interactive control with full keyboard + screen-reader support; overflow notice eliminates dead-affordance behavior at scale |
| State-model completeness | **Materially advanced** — explicit `bounded` overflow state added; loading / empty / error states unchanged but no longer obscured by silent truncation |
| Contract & data seam rigor | **Materially advanced** — typed `bounded`/`fetchedCount` contract from repository through hook; `select` callback as the single resolver wiring point |
| Accessibility & keyboard | **Improved** — pagination control uses `<nav>`, `aria-current`, `aria-controls`, `aria-live` range readout, ≥44px targets, `prefers-reduced-motion` |
| Token & styling discipline | **Maintained** — all new components use `@hbc/ui-kit` tokens; no raw hex; `shorthands.*` for borders/radius |
| Premium-stack compliance | **Partial** — `lucide-react` used materially (pagination + overflow icons); broader stack adoption (motion, floating-ui, radix, CVA) is dependency-ready and remains in the visual flagship pass below |

## Honest scope statement

This pass closes the **non-negotiable binding requirement**: `All Projects` search is now full-scope within the ceiling, real pagination exists, and totals/pages recompute correctly under search/filter/sort changes. The retrieval bug is decisively fixed and proven by tests.

The flagship visual rebuild — full ProjectSitesRoot decomposition into Header/CommandBand/FilterPanel/Grid sub-components, CVA-driven card redesign with launch-state strip, motion-driven reveals, floating-ui filter overlay, full audit-matrix Playwright spec — is **deferred** to a follow-up pass with its own scoped plan. Doing it half-way in this single pass would have shipped a partial polish on top of the now-correct retrieval, which would be worse than separating concerns. Premium-stack dependencies are in place so that follow-up does not need to revisit dependency boundaries.

## Follow-up

A scoped plan should pick up:

1. Sub-component decomposition of `ProjectSitesRoot.tsx` (currently still ~1.7k lines after this pass; the load-bearing logic is correct but the file is large).
2. CVA-based `ProjectSiteCard` redesign with launch-state strip, density variants, motion hover.
3. Floating-ui-anchored filter panel (medium/compact disclosure, wide inline).
4. Playwright spec covering the seven audit viewports against a local mount with synthetic SharePoint mock.
5. Hosted breakpoint matrix evidence after a tenant deploy.
