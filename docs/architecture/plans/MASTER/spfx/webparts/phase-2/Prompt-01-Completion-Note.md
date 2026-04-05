# Prompt-01 Completion Note — Proof-Case Scope and Design

## Status

Complete. The proof-case scope lock is implemented and the codebase is scoped to `HbHeroBannerWebPart` as the active proof case.

## Proof-case architecture selected

The build orchestrator (`tools/build-spfx-package.ts`) now writes the real HbHeroBanner manifest ID (`39762a4d-c7fd-44a6-a11e-4f8de9f5778d`) directly into the shell manifest before `gulp bundle`. This means:

- The compiled manifest naturally gets `entryModuleId: "39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0"` — exactly what SharePoint's `require()` expects.
- No AMD shim modules are generated (compiled ID = target ID).
- No post-bundle manifest cloning occurs (single target manifest).
- No neutral shell manifest ID is used.

The existing multi-manifest code path is preserved but produces identity-correct output when a single proof-case target is active.

## Files changed

| File | Change |
|------|--------|
| `tools/build-spfx-package.ts` | Added `HB_WEBPARTS_PROOF_CASE_IDS` allowlist (line 74-76). Added proof-case manifest filter after `targetManifests` assignment (line 542-546). Changed `useNeutralShellManifestId` to require `targetManifests.length > 1` (line 740-741). |
| `apps/hb-webparts/config/package-solution.json` | Version bump `1.0.0.12` to `1.0.0.13` (solution and feature). |

## Shim-era logic now bypassed for the proof case

| Mechanism | Status |
|-----------|--------|
| Neutral shell manifest ID (`9a2f7f61-...`) | Bypassed — real manifest ID used directly |
| Post-bundle manifest cloning (10 manifests) | Bypassed — single target, no cloning needed |
| AMD shim module generation | Bypassed — `targetEntryModuleId === compiledEntryModuleId` |
| `entryModuleId` rewriting | Bypassed — compiled ID is already correct |
| Stale shim cleanup loop | Still runs harmlessly (no stale shims to clean) |

## What remains deferred

- **Rollout to remaining 9 webparts**: Add their IDs to `HB_WEBPARTS_PROOF_CASE_IDS` after each is validated.
- **Shim infrastructure removal**: Safe to remove after all webparts are proven in the first-class model.
- **Tenant-side validation**: Prompt-03 (build, deploy, verify runtime behavior).
- **Rollout pattern documentation**: Prompt-04.

## Why this is the minimum correct proof case

- 3 targeted changes in the build script (1 constant, 1 filter, 1 condition guard).
- 1 version bump.
- Zero changes to app source (`mount.tsx`, `vite.config.ts`), shell webpart (`ShellWebPart.ts`), or manifest files.
- The Vite bundle still contains all 10 components — only the packaging scope is narrowed.
- Rollout to the next webpart requires only adding its ID to the allowlist set.

## Verification results

- `check-types`: pass
- `lint`: pass
- `build`: pass (262.49 kB IIFE bundle)
