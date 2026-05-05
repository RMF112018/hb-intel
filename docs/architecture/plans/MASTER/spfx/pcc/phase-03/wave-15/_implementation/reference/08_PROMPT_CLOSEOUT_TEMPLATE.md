# Prompt Closeout Template

Use this structure in the final response for each implementation prompt.

```markdown
## Execution Summary

- Prompt:
- Branch:
- HEAD before:
- HEAD after:
- Lockfile MD5 before:
- Lockfile MD5 after:

## Files Changed

- `path`: reason

## Validation Evidence

- `command`: pass/fail
- `command`: pass/fail

## Guardrails Confirmed

- No package/lockfile mutation unless explicitly authorized.
- No SPFx manifest/Sppkg/version mutation.
- No tenant/list/group/security mutation.
- No live external-system API calls.
- No command/write routes.
- No SharePoint/Graph/PnP writes.
- No Procore/Sage/AHJ/camera writeback/sync/mirror.
- No iframe/current-image embed behavior.
- No secrets in fixtures, URLs, logs, docs, or tests.
- HBI no-authority preserved.
- Wave 14 ownership preserved.

## Residual Risks / Follow-Up

- ...

## Commit Summary

`...`

## Commit Description

- ...
```
