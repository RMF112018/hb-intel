# Prompt-05 Packaging Proof

## Build + Package Commands
1. `pnpm --filter @hbc/spfx-hb-webparts build`
2. `npx tsx tools/build-spfx-package.ts --domain hb-webparts`

Both commands completed successfully in this execution.

## Produced Artifacts
- Package: `dist/sppkg/hb-webparts.sppkg`
- Size/time proof: `dist/sppkg/hb-webparts.sppkg|3132315|Apr 10 03:29:55 2026`
- Shim proof: `dist/sppkg/hb-webparts-shim-proof.json`

## Component Registration Proof (PnP Ops)
The package contains explicit PnP Ops component registration entries:
- `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96/WebPart_9e2dd84a-a121-4fb3-a964-f43a94abf9fd.xml`
- `ClientSideAssets/shell-entry-9e2dd84a-a121-4fb3-a964-f43a94abf9fd-e9d84b4f.js`

Extracted XML proof confirms:
- component id: `9e2dd84a-a121-4fb3-a964-f43a94abf9fd`
- alias: `PnpOpsWebPart`
- title: `PnP Operations`
- entry module: `9e2dd84a-a121-4fb3-a964-f43a94abf9fd_1.0.0`

## Stale-Artifact Check
`build-spfx-package` emitted a fresh hashed asset set and verified package structure in this run:
- app hash: `hb-webparts-app-2aa2b54d.js`
- PnP shim hash: `shell-entry-9e2dd84a-a121-4fb3-a964-f43a94abf9fd-e9d84b4f.js`
- `.sppkg structure verified` and shim-proof output written.

This run provides positive proof that the generated package references current build outputs, not stale prior assets.

## Packaging Preconditions Noted
The packager warned that `BACKEND_MODE` was not set, so runtime defaults apply for packaged app config. This is expected for local packaging proof and should be explicitly set in CI/CD for deterministic deployment mode.
