# Prompt-02 Completion Note — Narrow Cumulative Loader Remediation

## Status

Complete. AMD shim indirection eliminated. All 10 webparts now use direct `entryModuleId` → shell asset mapping.

## 1. Files changed

| File | Change |
|------|--------|
| `tools/build-spfx-package.ts` | Replaced the per-webpart AMD shim generation block (lines 879-898) with direct mapping: each webpart's `targetEntryModuleId` maps to the compiled shell asset (`legacyScriptResource`) without shim indirection. The neutral base module ID is no longer included in any webpart's `scriptResources`. |
| `apps/hb-webparts/config/package-solution.json` | Version bump `1.0.0.27` → `1.0.0.28` |

## 2. Exact defect layer addressed

**AMD cross-module dependency resolution in SPFx entry modules.**

The cumulative package used AMD shim files (`define("{webpartId}_1.0.0", ["9a2f7f61-..._1.0.0"], function(b){return b})`) that depended on a separate neutral base module. SPFx's module loader does not resolve this cross-module dependency chain for entry modules, producing `Could not load ... in require`. The proof cases proved that SPFx resolves `scriptResources` by key-to-file mapping without checking internal AMD module names.

## 3. Exact narrow remediation

Each webpart manifest's `scriptResources` now maps its `entryModuleId` directly to the compiled shell asset file — the same pattern that the proof cases used:

```json
{
  "entryModuleId": "{webpartId}_1.0.0",
  "scriptResources": {
    "{webpartId}_1.0.0": { "type": "path", "path": "shell-web-part_*.js" }
  }
}
```

All 10 webparts point to the same `shell-web-part_33c64341ed81ee506c2a.js` file. No shim files, no neutral module ID, no AMD dependency chain.

Verified for 5 representative webparts (CompanyPulse, HbHeroBanner, PriorityActionsRail, LeadershipMessage, SmartSearchWayfinding): all show `entryPath: shell-web-part_*.js` and `shimKeys: NONE`.

## 4. What was intentionally NOT changed

- `ShellWebPart.ts` — unchanged
- `mount.tsx` — unchanged
- `vite.config.ts` — unchanged
- Source manifests — unchanged
- Webpart component files — unchanged
- `useNeutralShellManifestId` condition — still true for multi-target, but the neutral ID is only used during compilation; it no longer appears in any final manifest's scriptResources
- Stale shim cleanup loop — still runs (harmlessly cleans any leftover shim files)
- `HB_WEBPARTS_PROOF_CASE_IDS` — remains empty (cumulative mode)
- `HB_WEBPARTS_PROOF_CASE_ENTRY_MAP` — remains dormant

## 5. Known remaining risks before tenant validation

| Risk | Notes |
|------|-------|
| Service worker cache serving old shim-based package | Content-hashed bundle name unchanged (`ab43ba83`), but shell asset hash unchanged too. Unregister `spserviceworker.js` if stale. |
| SPFx internal module name mismatch | The compiled shell registers as `define("9a2f7f61-..._1.0.0", ...)` but scriptResources maps it as `"{webpartId}_1.0.0"`. The proof cases proved SPFx resolves by scriptResources key, not internal define name. |
| 10 manifests sharing one JS file | SPFx should handle this (it's a CDN path reference, not a unique-file constraint). The proof cases used the same pattern with 1 manifest. |

## Verification results

| Check | Result |
|-------|--------|
| check-types | pass |
| lint | pass |
| build (Vite) | pass — 262.49 kB |
| SPFx package build | pass — 10 manifests, 0 shims |
| Package size | 96.3 KB (down from 100.5 KB — no shim files) |
| Shell-entry files in package | 0 (correct) |
| Neutral module ID in scriptResources | absent from all manifests (correct) |
| entryModuleId → shell asset mapping | verified for 5/10 webparts (all correct) |
