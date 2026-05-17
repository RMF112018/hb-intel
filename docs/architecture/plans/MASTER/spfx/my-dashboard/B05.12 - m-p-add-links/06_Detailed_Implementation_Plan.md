# Detailed Implementation Plan

## Phase 0 — Repo-truth and drift lock
- Reconfirm current paths, route registration, provisioning seams, My Projects UI components, and model exports.
- Identify any local drift since package generation.
- Do not edit yet.

## Phase 1 — SharePoint custom-links list descriptor and provisioning
- Add list descriptor for `My Projects Custom Links`.
- Add provision script:
  - dry-run
  - apply
  - JSON report
- Add readiness verifier/reporting.
- Add administrator runbook docs and schema reference docs.
- Add tests for descriptor and provision/readiness logic.

## Phase 2 — Shared model contracts
- Add custom-link visibility enum.
- Add read-model custom link type.
- Extend `MyProjectLinkItem` with `customLinks`.
- Add create/update/delete request/result types.
- Export from model barrel files.
- Update fixtures and model tests as required.

## Phase 3 — Backend repository and command service
- Add custom-link repository backed by GraphListClient.
- Add validation helpers for title, URL, visibility, parent project identity.
- Add entitlement helper or factor a shared project-access verifier.
- Implement create/update/delete command service methods.
- Add route handlers and route tests.

## Phase 4 — Read-model join
- Extend My Projects provider to load visible custom links.
- Join by provenance IDs.
- Attach sorted custom links to each returned item.
- Preserve existing source status behavior.
- Add partial/unavailable enrichment warning posture if custom-link source fails.
- Add provider tests.

## Phase 5 — Frontend backend-client command wiring
- Extend `IMyWorkReadModelClient` with create/update/delete custom-link methods.
- Implement backend client command methods.
- Implement fixture client safe fallback behavior.
- Add UI command state hooks or module-level helper appropriate to repo conventions.

## Phase 6 — My Projects tile UI
- Add `More Project Resources` disclosure/menu to project tiles.
- Render custom link rows.
- Add `Add project link` CTA.
- Add link modal with required helper text and validation.
- Add edit/remove flows for creator-owned links.
- Wire visibility badges and permission-driven manage actions.
- Preserve compact responsive behavior.

## Phase 7 — Docs, fixtures, tests, validation
- Update My Projects docs.
- Add UI copy reference and schema runbook.
- Run full targeted validation suite.
- Produce final operator commands:
  - provision dry-run
  - provision apply
  - verifier
- Produce commit title and description.

---

# File-level expected impact

See `07_File_Impact_Matrix.md`.

---

# Risk gates

1. Avoid creating a write path that trusts client-supplied project identifiers.
2. Avoid collapsing My Projects entirely if custom-link reads fail.
3. Avoid exposing private links to non-creators.
4. Avoid surfacing creator UPN/OID in frontend payloads.
5. Avoid introducing PnPjs where GraphListClient is already the safer backend data lane.
6. Preserve current My Projects system-link behavior and card composition.
