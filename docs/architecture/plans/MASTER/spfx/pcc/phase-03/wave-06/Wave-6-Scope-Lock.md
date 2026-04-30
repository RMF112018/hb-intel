# Wave 6 Scope Lock — Team & Access

## In scope

- Team & Access module UI.
- Access request form.
- Request status display.
- Request list.
- Request detail view.
- Approve / reject / comment preview UI.
- Business audit trail display.
- Role/persona-aware display behavior, explicitly not authorization.
- Admin / IT execution queue visibility.
- “Execution pending / handled by IT” state.
- Fixture/read-model support.
- Optional read-only backend `team-access` opt-in after UI behavior is stable.
- Tests and documentation.

## Out of scope

- Automated SharePoint group updates.
- Automated Teams membership updates.
- Direct SPFx permission mutation.
- Direct Microsoft Graph / PnP / SharePoint REST runtime.
- Backend write routes.
- Auth/token wiring.
- Provisioning execution.
- Tenant mutation.
- App catalog deployment.
- `.sppkg` generation/upload.
- CI/CD changes.
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

Wave 6 may present workflow states. It must not perform workflow execution.
