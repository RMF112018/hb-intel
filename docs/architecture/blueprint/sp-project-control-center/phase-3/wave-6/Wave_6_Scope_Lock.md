# Wave 6 Scope Lock — Team & Access

| Field | Value |
| --- | --- |
| Phase | 3 |
| Wave | 6 — PCC Team & Access |
| Status | **Scoped / planned** (no Wave 6 closeout exists) |
| Implementation entry point | Prompt 02 |
| Date | 2026-04-30 |

This scope lock opens Wave 6 planning. Wave 6 implementation has not begun.
Prompt 01 produces planning records only. The first implementation prompt is
Prompt 02 (Team & Access view model and adapter).

## In scope

- Team & Access module UI.
- Access request form.
- Request status display.
- Request list.
- Request detail view.
- Approve / reject / comment preview UI.
- Business audit trail display.
- Role / persona-aware display behavior, explicitly **not** authorization.
- Admin / IT execution queue visibility.
- "Execution pending / handled by IT" state.
- Fixture / read-model support.
- Optional read-only backend `team-access` opt-in (Prompt 06) after UI
  behavior is stable. Whether to wire `team-access` as a read-only
  explicit-opt-in route + client method or to defer that wiring is a Prompt 02
  / Prompt 03 decision.
- Tests and documentation.

## Out of scope

- Automated SharePoint group updates.
- Automated Teams membership updates.
- Direct SPFx permission mutation.
- Direct Microsoft Graph / PnP / SharePoint REST runtime.
- Backend write routes.
- Auth / token wiring.
- Provisioning execution.
- Tenant mutation.
- App catalog deployment.
- `.sppkg` generation / upload.
- CI / CD changes.
- Production rollout.
- Procore runtime.
- Document Crunch runtime.
- Adobe Sign runtime.
- Site Health repair execution.
- Priority Actions Rail execution or live routing.

## Required user-facing labels

Use clear wording such as:

- `Preview only`
- `Manual IT handled`
- `Approved, pending execution`
- `Backend-gated later`
- `No permission change has been executed`

## Scope boundary

Wave 6 may **present** workflow states. It must **not** **execute** them.

## Status — final line

Wave 6 is **scoped / planned**. **No Wave 6 closeout exists.** Implementation
begins at **Prompt 02**.
