# 06 — Prioritized Remediation Plan

## Phase 7 — Target-state remediation plan

## R-01 — Freeze repo/artifact truth before implementation

- Gap closed: G-01
- Direction: verify local checkout against public GitHub raw, connected GitHub index, package output, and deployed SPFx artifact.
- Impact: prevents remediation from targeting stale/generated files.
- Cross-layer implications: build pipeline, package publishing, repo branch discipline.
- Timing: implement now.
- Type: structural release-control fix.

## R-02 — Add Safety runtime backend contract

- Gaps closed: G-02, G-03, G-13
- Direction: introduce required `functionAppUrl` and `apiAudience`; normalize and validate them at mount; fail closed with admin/operator message when missing; document API permissions and CORS.
- Impact: app cannot silently render as if backend commands are available when they are not.
- Timing: implement now.
- Type: structural redesign.

## R-03 — Implement typed backend command client

- Gaps closed: G-04, G-05, G-09, G-10, G-11
- Direction: add preview, ingest, and replay commands with JSON payloads, bearer token, `X-Request-Id`, timeout/abort, bounded retry, and typed failure envelopes.
- Impact: truthful backend command transport.
- Timing: implement now.
- Type: structural redesign.

## R-04 — Replace direct upload with preview-before-commit UX

- Gaps closed: G-06, G-08, G-14
- Direction: add preview action, commit action, confirmation, preview signature, context invalidation, blockers/warnings, and metadata-authority display.
- Impact: UI matches backend architecture.
- Timing: implement now.
- Type: structural redesign.

## R-05 — Add project picker and inspection metadata intake

- Gaps closed: G-07, G-08
- Direction: reuse Project Sites search seam; capture project snapshots/source IDs, inspection number, and plain-calendar inspection date; pass full `UploadContext`.
- Impact: backend preview has enough context to evaluate period/project/duplicate risk.
- Timing: implement now.
- Type: structural redesign.

## R-06 — Align authority copy and mismatch UX

- Gaps closed: G-08, G-09
- Direction: show parser-meta/named-range authority; explain legacy fallback; show mismatch warnings before commit; expose `metadataAuthority`.
- Impact: prevents dishonest “entered values always win” messaging.
- Timing: implement now.
- Type: refinement with structural importance.

## R-07 — Add supportable error taxonomy

- Gaps closed: G-09, G-10
- Direction: distinguish config, auth, CORS/network, route mismatch, validation, template, parser, reporting-period, project, duplicate, commit, and replay.
- Impact: production support can triage incidents from screenshots and logs.
- Timing: implement now.
- Type: structural redesign for errors; UI refinement for display.

## R-08 — Add release-proof harness

- Gaps closed: G-01, G-12, G-13, G-17
- Direction: clean package proof, bundle route assertions, hosted SPFx token smoke test, unauthenticated 401 proof, delegated preview proof, admin provisioning denial proof, config fail-closed proof.
- Impact: prevents visually “working” but unwired app from shipping.
- Timing: implement now.
- Type: structural release integrity.

## R-09 — Harden file input and accessibility

- Gaps closed: G-11, G-14
- Direction: governed file input, type/size validation, live status/alert regions, keyboard-accessible preview/commit/cancel controls, focus-stable errors.
- Impact: production-grade async UX.
- Timing: implement in Wave 02 after core backend seam.
- Type: refinement.

## R-10 — Split read repository and command client responsibilities

- Gaps closed: G-15, G-16
- Direction: keep SharePoint REST reads where intended; route workbook commands through backend; avoid one adapter owning unrelated concerns without clear boundaries.
- Impact: maintainability and easier testing.
- Timing: soon after Wave 01.
- Type: structural cleanup.
