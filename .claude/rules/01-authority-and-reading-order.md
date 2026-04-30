# 01 — Authority and Reading Order

## Primary Rule

Current repo truth controls. Do not answer or edit from memory when current files are available.

## Default Reading Order

1. User prompt and explicit constraints.
2. Active files or paths named by the user.
3. Nearest `package.json`, README, test/config files, and exports for the touched area.
4. `pnpm-workspace.yaml`, root `package.json`, `turbo.json`, and `vitest.workspace.ts` when workspace routing or validation matters.
5. `docs/README.md` and `docs/architecture/blueprint/current-state-map.md` for documentation or architecture authority.
6. Relevant reference docs, ADRs, and active phase/wave docs.
7. Historical plans or archive material only when explicitly requested or necessary.

## Root README

The root `README.md` is not currently an implementation authority. Prefer `docs/README.md`, `current-state-map.md`, and nearest package/app README.

## Evidence Standard

State what was inspected. If a source was not inspected, do not imply that it was validated.
