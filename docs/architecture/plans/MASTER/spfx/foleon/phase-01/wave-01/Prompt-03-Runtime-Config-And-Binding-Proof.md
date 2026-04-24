# Prompt 03 — Runtime Config and Binding Proof

## Objective

Implement strict Foleon runtime configuration validation and a safe runtime binding proof that demonstrates package/runtime/list/origin alignment without leaking sensitive data.

## Governing Authorities

- HB Intel runtime binding proof patterns from Safety/Homepage where applicable
- Browser security best practices for configuration disclosure
- Foleon API security boundary: secrets must not be in SPFx

## Files / Seams to Inspect

- `apps/hb-intel-foleon/src/mount.tsx`
- `apps/hb-intel-foleon/src/runtime/**`
- `IFoleonMountConfig`
- `window.__hbIntel_foleonRuntimeBindingProof`
- package manifest and version files

## Current Gap

The audit could not find the claimed mount config or runtime binding proof. Without this, package truth and runtime truth can drift silently.

## Required Implementation Outcome

- Define `IFoleonMountConfig` with list GUIDs, accepted origins, `allowPreview`, expected manifest ID, expected package version, and optional reader route path.
- Validate config fail-closed before route rendering.
- Produce typed config errors with user/admin-safe messages.
- Publish a redacted runtime binding proof containing manifest ID, package version, allowed origins fingerprint, list GUID presence, config source, and bundle/runtime marker.
- Gate or reduce production diagnostics if needed.

## Proof of Closure

- Unit tests for missing/malformed/mismatched config.
- Browser/manual proof that the binding proof appears only as designed.
- Bundle scan proving no secrets and no raw preview URLs.
- README section documenting required config fields and failure modes.

## Non-Negotiable Instructions for the Local Code Agent

- Use the live repo's `main` branch as the source of truth unless the prompt explicitly tells you to investigate an unmerged branch/commit.
- Do not protect weak patterns because the UI renders, the package builds, or prior summaries said the MVP landed.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes outside the stated Foleon scope.
- Provide proof of closure with exact commands, files changed, and artifacts generated.
- If repo truth contradicts this prompt, stop and report the contradiction clearly before changing code.
