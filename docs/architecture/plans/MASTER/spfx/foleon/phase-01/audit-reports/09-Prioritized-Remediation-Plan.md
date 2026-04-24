# 09 — Prioritized Remediation Plan

## R-01 — Reconcile Repo Truth and Commit Reality

- Closes: FOL-GAP-001
- Implement now: Yes
- Direction: Determine whether `b1e27a3c` exists on another local branch, stale clone, or unpushed commit. Land the implementation on `main` or correct the audit target.
- Proof: GitHub fetch of full commit succeeds; `apps/hb-intel-foleon` exists on `main`; code search finds Foleon symbols.
- Type: Structural

## R-02 — Establish Foleon SPFx Package Identity

- Closes: FOL-GAP-002, FOL-GAP-003
- Implement now: Yes
- Direction: Add `apps/hb-intel-foleon`, package manifest, Vite IIFE, SPFx manifest, package-solution settings, and `tools/build-spfx-package.ts` domain entry.
- Proof: `pnpm --filter` build/typecheck/test passes; package command emits `.sppkg`; source manifest and package manifest contain expected GUID/version.
- Type: Structural

## R-03 — Runtime Config and Binding Proof

- Closes: FOL-GAP-004, FOL-GAP-012
- Implement now: Yes
- Direction: Implement `IFoleonMountConfig`, strict config validation, safe production diagnostics, runtime binding proof, and failure UX for missing/mismatched config.
- Proof: Unit tests for config cases; browser proof of runtime binding; no secret/preview leakage in bundle.
- Type: Structural

## R-04 — SharePoint List Schema and Index Proof

- Closes: FOL-GAP-005
- Implement now: Yes
- Direction: Add list schema/provisioning for content registry, homepage placements, and telemetry MVP sink; specify internal names and indexes.
- Proof: Provisioning dry-run and live proof; query tests with indexed filters; threshold test plan.
- Type: Structural

## R-05 — Reader / Origin / iframe Security

- Closes: FOL-GAP-006, FOL-GAP-007
- Implement now: Yes
- Direction: Implement exact-origin allowlist, typed gate service, preview rejection, HTTPS parsing, SharePoint trusted-domain verification runbook, `postMessage` hardening, and accessible iframe.
- Proof: Unit tests for all gate reasons; malformed URL/message tests; E2E Reader tests; SharePoint-hosted iframe test.
- Type: Structural

## R-06 — Highlights and Content Hub UX

- Closes: FOL-GAP-010, FOL-GAP-011
- Implement now: After R-01 through R-05
- Direction: Implement no-iframe homepage cards, empty/error/loading/suppressed states, search/filter UI, and launcher integration or launch-path runbook.
- Proof: E2E tests for highlights, content hub, keyboard navigation, and no iframe in highlights DOM.
- Type: Refinement

## R-07 — Telemetry and Backend-Ready Observability

- Closes: FOL-GAP-008
- Implement now: Yes for MVP sink; backend endpoint Wave 02
- Direction: Add event envelope, non-blocking write behavior, support correlation IDs, and interface that can flip to `POST /api/foleon/events`.
- Proof: Tests for success/failure/non-blocking behavior; schema snapshots; privacy review.
- Type: Structural

## R-08 — Backend Sync/Admin/Snapshots

- Closes: FOL-GAP-009 and deferred-work gaps
- Implement now: Phase depends on launch scope
- Direction: Implement Azure Functions sync, projects registry, sync runs, analytics snapshots, and admin panel.
- Proof: Server-side Foleon OAuth only; no secrets in SPFx; sync run evidence; admin permission tests.
- Type: Structural
