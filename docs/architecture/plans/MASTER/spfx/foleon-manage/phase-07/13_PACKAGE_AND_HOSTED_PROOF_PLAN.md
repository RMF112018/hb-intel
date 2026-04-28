# 13 — Package and Hosted Proof Plan

## Package Proof

Capture and store:

- `config/package-solution.json` version.
- Generated `.sppkg` path and SHA.
- Manifest ID proof.
- Web API permission request proof.
- Asset bundle names.
- Strings proving new shell/inbox/lane/workflow components are present in shipped JS.
- Package proof command output.

## Hosted Proof

Capture hosted screenshots at:

- 100% desktop.
- 75% wide.
- Tablet/narrow.
- Short-height.
- Content inbox state.
- Lane board state.
- Placement workflow state.
- Preview state.
- Config/Admin state.
- OAuth-missing state.
- Empty content state.

## Network Proof

Record:

- `/api/foleon/config`
- `/api/foleon/content`
- `/api/foleon/placements`
- sync route proof where authorized
- expected 401/403 behavior where unauthorized
- no secret leakage in browser payloads

## Browser Console Proof

Confirm:

- No runtime exceptions.
- No CORS errors.
- No missing asset 404s.
- No unhandled promise rejections.
- No focus/ARIA warnings in test output.

## Closure Evidence File

Add a final evidence document after implementation:

```text
docs/architecture/plans/MASTER/spfx/foleon-manage/world-class-manager-rebuild/IMPLEMENTATION_CLOSURE_EVIDENCE.md
```

Required sections:

- Build commands.
- Test commands.
- Package proof.
- Hosted screenshots.
- Network proof.
- Scorecard re-score.
- Known exceptions, if any.
