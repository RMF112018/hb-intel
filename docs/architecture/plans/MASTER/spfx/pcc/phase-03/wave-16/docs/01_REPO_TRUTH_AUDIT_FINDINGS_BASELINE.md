# 01 — Repo Truth Audit Findings Baseline

## Verified Remote Baseline

Remote repository: `RMF112018/hb-intel`  
Default branch: `main`  
Known Wave 16 final closeout commit: `714ca190c0dc12d738b10cc342b5253f94909895`  
Commit title: `docs(pcc): finalize wave 16 closeout and auditor handoff`

## Confirmed Documentation Posture

Wave 16 is documentation-only at the current baseline. It establishes architecture, wireframes, security/audit/HBI/validation policy, schema references, and handoff guidance. It does not authorize runtime/source/package/manifest/tenant/provisioning changes.

## Confirmed Architecture Posture

- User-facing feature: `Control Center Settings`.
- Internal domain: Settings / Control Center Settings.
- Surface ID: `control-center-settings`.
- Required read route: `GET /api/pcc/projects/{projectId}/settings`.
- Future command routes are documented as not implemented in Wave 16.
- Direct SPFx writes to settings lists are forbidden.
- Direct Graph/tenant/permission mutation is forbidden.
- Direct external-system writeback is forbidden.
- Secret values must not be stored or displayed; only references are allowed.
- HBI explains and cites/refuses but does not mutate, approve, decide, or bypass policy.

## Confirmed Current Runtime Gaps

- `apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx` exists but is preview-only.
- The router renders `control-center-settings` without passing a read-model client.
- `PccSettingsReadModel` currently only exposes `settings: readonly IPccSettingsRef[]`.
- `IPccSettingsRef` is Wave 1-era and only includes `scope`, `key`, `displayName`, and `editorPersona`.
- Backend provider seam includes `getSettings(...)`, but the mock provider currently returns an empty settings registry.
- SPFx client route IDs and client interface do not yet include a `settings` route/method in the audited baseline.
- The canonical Wave 16 list schemas are much richer than the current runtime model.

## Local Verification Still Required

A local agent must still run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

The local worktree may contain user-owned drift not visible from remote audit.
