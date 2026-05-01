# Wave 6 Closed Decisions

| Field | Value |
| --- | --- |
| Phase | 3 |
| Wave | 6 — PCC Team & Access |
| Status | **Closed** |
| Implementation entry point | Prompt 02 (closed) |
| Date | 2026-04-30 (opened) → 2026-05-01 (closed) |

These decisions were **opened** by Prompt 01 (the wave's planning prompt) so
that implementation prompts (Prompt 02 onward) inherit settled boundaries.
They are now **closed** — see `Wave_6_Closeout.md` (Prompt 08) for full
resolution details and §12 of the closeout for the disposition table.

## W6-OD-001 — Shared model strategy

**Decision:** Use existing `packages/models/src/pcc/TeamAccess.ts` as the
shared vocabulary. Add app-local view models / adapters for richer UI behavior
unless the local repo-truth gate proves a shared model gap that cannot be
represented app-locally.

**Guardrail:** Do not rewrite shared Team & Access model vocabulary casually.

**Status:** Resolved by Prompt 02 (`23ba49175`). App-local view model and
adapter built; `packages/models/src/pcc/TeamAccess.ts` shared vocabulary
preserved unchanged.

## W6-OD-002 — Backend read-model posture

**Decision:** Start fixture-first. Optional Prompt 06 may add a read-only
`team-access` backend route and SPFx client method because the
provider/interface/model map already support Team & Access but the HTTP route
and SPFx client method do not.

**Guardrail:** Prompt 06 is **GET-only and read-only**. No write routes.
Whether Prompt 06 is exercised at all is a Prompt 02 / Prompt 03 decision; it
may stay deferred without blocking Wave 6.

**Status:** Resolved (executed) by Prompt 06 (`1ccf8acb2` + `dfa71904c`
fixup). Optional `team-access` GET-only route + client method added; new
client method reuses the existing `fetchImpl` wrapper (zero new `fetch(`
callsites).

## W6-OD-003 — Backend opt-in pattern

**Decision:** Team & Access must follow the Project Home explicit-backend-opt-in
pattern if backend wiring is added.

**Guardrail:** Default mount remains fixture. Backend mode requires explicit
`readModelMode: 'backend'` and `backendBaseUrl`. The read-model client must
remain surface-scoped (no global multi-surface cutover).

**Status:** Resolved by Prompt 06 (`1ccf8acb2` + `dfa71904c`). Default
mount remains fixture; the read-model client is threaded to **exactly two**
surfaces (`project-home`, `team-and-access`), enforced by the dormancy
guard's set-equality assertion.

## W6-OD-004 — Approve / reject / comment controls

**Decision:** Controls may be rendered as local preview / read-model controls
only. They may show selected local visual state in tests, but may **not**
persist or execute.

**Guardrail:** Controls must clearly communicate "Preview only" and "No
permission change has been executed."

**Status:** Resolved (preview-only) by Prompts 03 (`42888041e`) and 04
(`8e39052fe`). Approve / Reject buttons carry visible `(preview only)`
suffix; review controls own the action-context "No permission change has
been executed" notice; no persistence; no executable callback props on
the form or review-controls components (per-file source guards enforce
this).

## W6-OD-005 — Approved-pending-execution meaning

**Decision:** `approved-pending-execution` means **business** review is
approved and **manual IT execution remains pending**. No permission mutation
has occurred.

**Status:** Resolved by Prompts 02 (`23ba49175`) and 04 (`8e39052fe`).
Canonical em-dash label `Approved — Pending Execution` rendered by
`PccRequestStatusBadge`; audit row carries `noPermissionChangeNotice`;
execution posture in the manager lane separately reflects
`Backend-Gated Later` for the fixture.

## W6-OD-006 — Admin / IT execution queue

**Decision:** Visual / read-model queue only in Wave 6. Future backend
workflow is `backend-gated-later`.

**Status:** Resolved (visual only) by Prompt 05 (`b0f047d7c`).
`PccAccessExecutionQueue` renders four canonical sections
(`Pending Manual IT`, `Completed Manual`, `Backend-Gated Later`,
`Preview Only`) derived from real fixture state only — no synthesized
records. Sections show empty/preview state when no records match.

## W6-OD-007 — Request data storage

**Decision:** No persistence in Wave 6. Request data is fixture / read-model /
local UI state only.

**Status:** Resolved (no persistence) by Prompts 03 and 04. Form fields and
review-decision use local `useState` only; no `fetch`, no client, no
callbacks for persistence; per-file source guards enforce zero
executable callback props on the form and review-controls interfaces.

## W6-OD-008 — Priority Actions Rail

**Decision:** Do not expand the Priority Actions Rail in Wave 6 unless adding
metadata-only Team & Access links is explicitly scoped later. The existing
Wave 5 rail already maps Team & Access-related actions to `access-requests`.

**Status:** Resolved (no expansion) across all Wave 6 prompts. The Wave 5
four-group rail is preserved unchanged; no Team & Access metadata-only
links were added to the rail.

## W6-OD-009 — Unauthorized / missing config / backend unavailable states

**Decision:** Use the existing `PccPreviewState` state catalog. Unauthorized
persona displays access-manager restrictions without treating persona as
authorization. Missing config and backend-unavailable remain safe state
displays.

**Status:** Resolved by Prompts 04, 06, and 07. `PccAccessReviewControls`
renders the unauthorized-persona `PccPreviewState` for `canReview=false`;
`PccTeamAccessReadModelContent` renders loading and error
`PccPreviewState` blocks; `PccApp.optIn.test.tsx` covers backend-
unavailable scenarios for both Project Home and Team & Access.

## W6-OD-010 — Allowed vs forbidden files

**Decision:** Implementation prompts define narrow allowed file lists.
Package, manifest, workflow, lockfile, deployment, tenant, backend write,
Graph / PnP / SharePoint REST, Procore, Document Crunch, Adobe Sign,
provisioning, Site Health repair, and permission execution files are
**forbidden**.

**Status:** Resolved (preserved) across all Wave 6 prompts. Each prompt
observed its narrow allowed-files list. No package, manifest, workflow,
lockfile, deployment, tenant, backend write route, Graph / PnP / SP REST,
Procore, Document Crunch, Adobe Sign, provisioning, Site Health repair,
or permission execution file was modified.

## Status — final line

Wave 6 is **complete**. These decisions are **closed**. See
`Wave_6_Closeout.md` for full resolution details.
