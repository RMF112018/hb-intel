# PnP Ops Gap Closure — Final Validation Report

## Objective

Validate the Phase-03 gap-closure work for `hb-webparts` by running a fresh packaging flow, inspecting the generated `.sppkg` directly, verifying hardened proof artifacts, and determining what remains unproven without live SharePoint runtime evidence.

## Changes Implemented

This validation pass confirms previously implemented closure work across Prompts 01-04 is present and active:

- Fresh-build enforcement in `tools/build-spfx-package.ts` runs a mandatory fresh Vite build for `hb-webparts` and removes stale `apps/hb-webparts/dist` before packaging.
- Package-truth proof hardening emits and validates:
  - `dist/sppkg/hb-webparts-shim-proof.json`
  - `dist/sppkg/hb-webparts-package-truth-proof.json`
- Render-path diagnostics and authoring closure remain present in source:
  - `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` includes structured diagnostic context and actionable error rendering.
  - `apps/hb-webparts/src/mount.tsx` includes unknown-webpart-ID and legacy mode token-prerequisite diagnostics.
  - `apps/hb-webparts/src/webparts/pnp/PnpOpsWebPart.manifest.json` keeps PnP Ops toolbox-visible (`hiddenFromToolbox: false`, version `0.0.8.0`).
  - `apps/hb-webparts/src/webparts/pnp/pnpOpsValidation.ts` enforces absolute URLs, remote HTTPS, and local HTTPS with loopback HTTP exception.
  - `apps/hb-webparts/src/webparts/pnp/PnpOps.tsx` keeps proactive mode warning behavior.

## Freshness / Package-Truth Validation

### Commands executed

- `pnpm --filter @hbc/spfx-hb-webparts check-types` — **pass**
- `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/pnp/pnpOpsValidation.test.ts src/webparts/pnp/pnpOpsClient.test.ts src/webparts/pnp/pnpOpsActionCatalog.test.ts` — **pass** (3 files, 19 tests)
- `npx tsx tools/build-spfx-package.ts --domain hb-webparts` — **pass**

### Fresh package outputs

- `dist/sppkg/hb-webparts.sppkg` (`3174746` bytes, mtime `2026-04-10T12:21:30Z`)
- `dist/sppkg/hb-webparts-shim-proof.json` (`6872` bytes, mtime `2026-04-10T12:21:30Z`)
- `dist/sppkg/hb-webparts-package-truth-proof.json` (`122783` bytes, mtime `2026-04-10T12:21:30Z`)

SHA-256 fingerprints:

- `hb-webparts.sppkg`: `7f0e30dd93e43c77ea4cc9b46a09daf2d617b8decff9ff4029b9f136a263477c`
- `hb-webparts-shim-proof.json`: `4c11076705b4c269a19b6d0b97aa042f54d75d1bfa11ffb084d197e27ae7c348`
- `hb-webparts-package-truth-proof.json`: `8ca4e95bc782dd6c24e5ebe188928310627ac7cdcb5f97a0032ef255eea93a8b`

### Direct `.sppkg` inspection

Archive listing confirms expected packaged assets:

- `ClientSideAssets/hb-webparts-app-8d19b782.js`
- `ClientSideAssets/shell-entry-<manifestId>-<hash>.js` for all mapped webparts
- `ClientSideAssets/shell-entry-9e2dd84a-a121-4fb3-a964-f43a94abf9fd-ea18dd16.js`
- `ClientSideAssets/spfx-hb-webparts.css`

PnP linkage is present in package payload:

- `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96/WebPart_9e2dd84a-a121-4fb3-a964-f43a94abf9fd.xml`
- Embedded `ComponentManifest` includes:
  - `"id":"9e2dd84a-a121-4fb3-a964-f43a94abf9fd"`
  - `"alias":"PnpOpsWebPart"`
  - `"hiddenFromToolbox":false`
  - `"entryModuleId":"9e2dd84a-a121-4fb3-a964-f43a94abf9fd_1.0.0"`
  - shell entry path `shell-entry-9e2dd84a-a121-4fb3-a964-f43a94abf9fd-ea18dd16.js`

### Proof artifact checks

`hb-webparts-package-truth-proof.json` reports all check categories `pass: true`:

- `structuralValidity`
- `freshness`
- `sourcePackageSemanticAlignment`
- `liveRuntimeProof`

`hb-webparts-shim-proof.json` confirms:

- `packagingRunId`: `2026-04-10T16:21:18.376Z-8c6cba4c`
- packaged bundle name `hb-webparts-app-8d19b782.js`
- PnP shim mapping to `shell-entry-9e2dd84a-a121-4fb3-a964-f43a94abf9fd-ea18dd16.js`

## PnP Ops Runtime / Render Validation

Code-level closure verification confirms Prompt-04 changes remain active:

- Shell failure diagnostics include webpart context, mode, endpoint-presence signals, and actionable guidance.
- Mount path now distinguishes explicit unknown webpart IDs from no-ID contexts and no longer silently masks unknown IDs as homepage composition.
- PnP authoring fields are represented and deployment guidance is mode-aware.
- Runner guardrails enforce stronger URL/protocol constraints.

This is **code/package truth validation**, not tenant-hosted runtime execution.

## Remaining Risks

- No live SharePoint tenant page runtime was exercised in this pass.
- Browser/runtime-only failures (tenant CSP/policy, certificate trust edge cases, network segmentation, live page property entry mistakes, and host-specific script loading behavior) cannot be fully proven by local package inspection alone.
- `package-truth-proof` marks `liveRuntimeProof` as pass based on packaged evidence heuristics; this is strong but not equivalent to real page execution proof.

## Exact Tenant-Side Smoke Test Needed

Run this smoke test in a controlled tenant page after uploading the fresh `hb-webparts.sppkg`:

1. Add **PnP Operations** webpart from toolbox to a test page.
2. Configure and save each mode:
   - `local-runner` with reachable HTTPS loopback or approved endpoint
   - `remote-runner` with valid HTTPS endpoint and `runnerApiKey`
   - `mock`
   - optional `legacy-admin-api` (deprecated compatibility)
3. For each mode validate:
   - webpart renders without shell module/load crash
   - mode-specific guidance/warnings are coherent
   - preflight request executes and surfaces structured checks
   - launch/status/evidence panels update without render-path fallback behavior
4. Negative checks:
   - break endpoint URL intentionally and confirm actionable diagnostics appear
   - use invalid/missing remote API key and confirm auth failure path is clear
5. Capture tenant console logs + page screenshot evidence for each mode.

## Final Judgment

- **Is stale app-bundle reuse now blocked?**
  - **Yes.** Packaging enforces a fresh `hb-webparts` build and deletes stale `apps/hb-webparts/dist` before packaging.

- **Is package/source drift now materially harder to ship?**
  - **Yes.** Freshness + shim hash alignment + semantic manifest checks + packaged linkage checks now fail fast on drift.

- **Does the final `.sppkg` appear to contain current PnP Ops code rather than older backend-era runtime semantics?**
  - **Yes (high confidence).** Packaged manifest payload includes current PnP fields and toolbox visibility, and package-proof/shim mapping aligns to the current run bundle/shim outputs.

- **What exact additional tenant/browser evidence is still needed for 100% confidence?**
  - Execute the tenant smoke test above and collect runtime logs/screenshots for each mode, including positive and negative-path diagnostics.
