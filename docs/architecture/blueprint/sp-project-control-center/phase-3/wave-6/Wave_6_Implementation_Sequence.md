# Wave 6 Implementation Sequence

| Field | Value |
| --- | --- |
| Phase | 3 |
| Wave | 6 — PCC Team & Access |
| Status | **Opened / sequenced** (no Wave 6 closeout exists) |
| Implementation entry point | Prompt 02 |
| Date | 2026-04-30 |

Wave 6 is **opened / sequenced** by Prompt 01. Prompt 01 is a docs-only
planning prompt that produces this sequence, the scope lock, the closed
decisions register, and the repo-truth audit. **Implementation begins with
Prompt 02.** **No Wave 6 closeout exists yet.**

## Prompt 01 — Repo-truth gate and scope lock (this prompt — docs only)

Validate current repo state locally, create / confirm Wave 6 scope and
decision records, and confirm Wave 6 is unblocked. No source code is
implemented in Prompt 01.

## Prompt 02 — Team & Access view model and adapter

Create app-local Team & Access view model and adapter from the existing
shared models / fixtures. First implementation prompt of Wave 6.

## Prompt 03 — Request form and status UI

Add the access request form and the request status UI with **preview-only**
behavior.

## Prompt 04 — Request queue and detail review UI

Add the request list, request detail, and approve / reject / comment review
UI **without execution**.

## Prompt 05 — Manager execution queue and manual IT posture

Add the manager / admin execution queue display and the **manual IT handled**
posture.

## Prompt 06 — Optional backend read-model opt-in

Optionally add a read-only `team-access` route and SPFx client method using
the Wave 4 explicit-opt-in pattern. Whether this prompt is exercised is a
Prompt 02 / Prompt 03 decision; it may remain deferred without blocking
Wave 6. If exercised, the route and client method must be **GET-only / read-
only** and surface-scoped.

## Prompt 07 — Guardrails and regression hardening

Update source-scan and behavior tests to protect the no-runtime / no-mutation
posture, including any narrow guardrail adjustments required if Prompt 06 was
exercised.

## Prompt 08 — Documentation closeout and Wave 7 readiness

Close Wave 6 (creating the Wave 6 closeout document at this point), update
README truth, and state Wave 7 readiness.

## Status — final line

Wave 6 is **opened / sequenced**. Implementation begins at **Prompt 02**.
**No Wave 6 closeout exists.**
