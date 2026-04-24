# 05 — Runtime Binding / Packaging / Deployment Proof Assessment

## Current Status

The expected Foleon package seams were not found:

- No `apps/hb-intel-foleon` path was found.
- No manifest file with GUID `2160edb3-675e-4451-92bb-8345f9d1c71e` was found.
- No `window.__hbIntel_foleon` binding was found.
- No `window.__hbIntel_foleonRuntimeBindingProof` was found.
- No `dist/foleon-app.js` was found.
- No Foleon domain registration was observed in the inspected build orchestrator domain list.

## What Runtime Binding Proof Must Prove

A useful runtime binding proof must prove, at minimum:

- app identity
- manifest ID
- package version
- bundle SHA or content fingerprint
- expected runtime global
- actual loaded runtime global
- SharePoint list GUIDs used at runtime
- accepted origins used at runtime
- preview policy
- current page route/mode
- config source
- environment label
- build timestamp or commit SHA
- whether the webpart is running from the expected package version

## What Runtime Binding Proof Must Not Do

- It must not disclose secrets.
- It must not expose full tokens, sensitive list data, or user-specific authorization facts.
- It must not be the only proof of correctness.
- It should be gated or reduced in production unless there is a deliberate support/debug policy.

## Required Package-Truth Proof

The package build must prove:

1. repo source changed or is current
2. Vite bundle generated fresh
3. expected manifest ID exists in source manifest
4. expected manifest ID appears in emitted package
5. emitted package contains the correct Foleon IIFE asset
6. package version is `1.0.0.0` or intentionally revised
7. packaged bundle SHA matches the source bundle SHA
8. no preview URLs, API secrets, or test origins are embedded in production bundle
9. `tools/build-spfx-package.ts --domain hb-intel-foleon` or equivalent exists and works
10. package output is collected into `dist/sppkg` with deterministic naming

## Deployment Proof Gaps

Current deployment proof is absent because the app is absent. A successful generic build, even if later achieved, will not be sufficient. The proof must connect repo truth → built bundle truth → `.sppkg` truth → tenant runtime truth.

## Decision

Runtime binding and packaging are **production blockers**. They must be resolved in Wave 01 before any Reader, telemetry, or homepage rollout can be meaningfully audited.
