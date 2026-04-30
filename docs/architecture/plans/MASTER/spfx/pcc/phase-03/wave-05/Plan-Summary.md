# Plan Summary — Phase 3 / Wave 5 Priority Actions Rail

## Objective

Generate and execute a controlled Wave 5 implementation path for the PCC Priority Actions Rail, grounded in repo truth and the now-closed Wave 5 decision register.

## Readiness Finding

Wave 5 may proceed.

The verified Wave 4 closeout states:

- Wave 4 is closed.
- Fixture remains the default.
- Backend mode is explicit opt-in only.
- Project Home is the only read-model consumer.
- Wave 4A is operator-pending and separate from Wave 5.
- Priority Actions Rail is unblocked for Wave 5.

## Closed Decision Summary

| Decision | Closed Position |
|---|---|
| Rail grouping | Use PCC app-local grouping adapter. |
| Backend consumption | Yes, but only after local adapter/UI stability and only under explicit backend opt-in. |
| Action behavior | Metadata and disabled/non-executing controls only. |
| Persona behavior | Display-only; no real auth derivation or enforcement. |
| Non-MVP categories | Suppress `documents`, `health`, and `safety` from user-facing MVP rail. |
| UI-kit reuse | Reference only; no direct `HbcPriorityRail` import/reuse in Wave 5. |
| Shared model mutation | Deferred. |
| Master roadmap/status edits | Deferred unless explicitly authorized by a separate docs prompt. |
| W4-OD-009 ADR | Deferred and non-blocking. |

## Recommended Wave 5 Strategy

Build the Priority Actions Rail as an incremental enhancement of the existing Project Home Priority Actions card.

### 1. Keep the Rail Inside Project Home

Do not create a new top-level PCC surface in Wave 5.

Reason:

- There is no current `priority-actions` MVP surface route.
- The Phase 3 plan positions Priority Actions Rail as a landing experience after Project Home.
- The existing Project Home dashboard already has a `PccPriorityActionsCard` slot.
- This preserves the 10-card bento structure and active-surface-panel invariant.

### 2. Use a PCC App-Local Adapter

Do not rewrite canonical priority action categories in `@hbc/models/pcc`.

Reason:

- The shared model currently exposes 10 broader categories.
- Wave 5 requires four MVP lanes.
- The safest implementation is a local view-model that maps existing data into the four display lanes.

### 3. Suppress Non-MVP Categories

The user-facing MVP rail must not show:

- `documents`;
- `health`;
- `safety`.

These may remain in fixtures and adapter tests as ignored/deferred data, but the visible four-lane rail must suppress them.

### 4. Build Local UI First

Prompts 02–04 should work in fixture/default mode only.

Prompt 05 may then wire standalone `priority-actions` route consumption under explicit backend opt-in.

### 5. Preserve Guardrails

No prompt may weaken Wave 4 guardrails. Any new exception must be narrow, file-specific, and test-backed.

## Recommended Prompt Sequence

| Prompt | Purpose | Primary Change Type |
|---:|---|---|
| 01 | Create Wave 5 scope lock and closed decision register | Docs only |
| 02 | Create app-local Priority Actions Rail view-model and adapter | SPFx local adapter/tests |
| 03 | Create PCC-local Priority Actions Rail UI component | SPFx UI/tests |
| 04 | Integrate rail into `PccPriorityActionsCard` | SPFx integration/tests |
| 05 | Wire `getPriorityActions` route under explicit backend opt-in | SPFx read-model seam/tests/docs |
| 06 | Harden guardrails and fallback coverage | Tests/docs |
| 07 | Create final closeout and Wave 6 readiness record | Docs only |

## Prerequisites Before Prompt 01

- Work from current `main` or a clean branch cut from `main`.
- Confirm `git status --short` is clean.
- Confirm Wave 4 closeout exists and states Wave 5 readiness.
- Confirm `PccPriorityActionsCard` exists.
- Confirm no active local changes in PCC app, models, functions, or Wave 4 docs.

## Intentional Exclusions

- No Wave 4A or Wave 5A hosted validation.
- No `.sppkg` packaging.
- No app-catalog upload or tenant validation.
- No production rollout.
- No backend write route.
- No Graph/PnP/SharePoint REST runtime.
- No Procore, Document Crunch, or Adobe Sign runtime.
- No approval execution.
- No Team & Access permission mutation.
- No Site Health repair execution.
- No provisioning executor.
- No package/lockfile/version/manifest/workflow changes.
