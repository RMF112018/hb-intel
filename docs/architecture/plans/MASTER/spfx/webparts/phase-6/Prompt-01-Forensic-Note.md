# Prompt-01 Forensic Note — Cumulative Loader-Contract Regression

## 1. Baseline-success vs cumulative-failure comparison

### Successful proof-case path (Phase 2-3)

The two proof cases worked because the build compiled the shell manifest with the **real webpart ID** as the entry identity. No AMD shim indirection was needed.

```
Shell manifest ID = {realWebpartId}
Compiled shell: define("{realWebpartId}_1.0.0", ["@microsoft/sp-loader", ...], function(...) { ... })
scriptResources: { "{realWebpartId}_1.0.0": { type: "path", path: "shell-web-part_*.js" } }

SharePoint require("{realWebpartId}_1.0.0")
  → scriptResources maps to shell-web-part_*.js
  → file loaded, module registers as "{realWebpartId}_1.0.0"
  → ShellWebPart class available directly
  → SUCCESS
```

### Failing cumulative path (Phase 4-5)

The cumulative package uses a **neutral shell manifest ID** (`9a2f7f61-...`) and generates **per-webpart AMD shim files** that alias each webpart's `entryModuleId` to the neutral base module.

```
Shell manifest ID = 9a2f7f61-... (neutral)
Compiled shell: define("9a2f7f61-..._1.0.0", ["@microsoft/sp-loader", ...], function(...) { ... })

Per-webpart shim: define("{webpartId}_1.0.0", ["9a2f7f61-..._1.0.0"], function(b) { return b; })

scriptResources: {
  "9a2f7f61-..._1.0.0": { type: "path", path: "shell-web-part_*.js" },
  "{webpartId}_1.0.0": { type: "path", path: "shell-entry-{webpartId}-*.js" }
}

SharePoint require("{webpartId}_1.0.0")
  → scriptResources maps to shell-entry-{webpartId}-*.js
  → file loaded, contains define() with dependency on "9a2f7f61-..._1.0.0"
  → SPFx loader must resolve the AMD dependency chain
  → FAILURE: "Could not load {webpartId}_1.0.0 in require"
```

## 2. Source / package / runtime delta table

| Dimension | Proof-case (working) | Cumulative (failing) |
|-----------|---------------------|---------------------|
| Shell manifest ID | Real webpart ID | Neutral `9a2f7f61-...` |
| Compiled module name | `define("{realId}_1.0.0", ...)` | `define("9a2f7f61-..._1.0.0", ...)` |
| Entry module file | `shell-web-part_*.js` (self-contained) | `shell-entry-{id}-*.js` (AMD shim with dependency) |
| scriptResources per webpart | 1 entry: `{realId}_1.0.0` → shell asset | 2 entries: `{id}_1.0.0` → shim + `9a2f7f61-..._1.0.0` → shell asset |
| AMD dependency chain | None — direct load | Shim → base module (cross-module dependency) |
| Vite entry | Isolated proof-case entry | Full `mount.tsx` dispatcher |
| Number of manifests | 1 | 10 |
| Number of shim files | 0 | 10 |

## 3. Primary defect hypothesis

**SPFx's module loader does not support AMD cross-module dependency resolution in entry module files.**

When SPFx loads a webpart's `entryModuleId`, it retrieves the file from `scriptResources` and expects that file to directly provide the module exports. The proof-case path delivers this: `shell-web-part_*.js` contains `define("{id}_1.0.0", [spfx-deps], factory)` where the factory returns the ShellWebPart class. SPFx loads the file, the module registers under the expected ID, and the class is available.

The cumulative shim path violates this expectation. The shim file contains:
```javascript
define("{webpartId}_1.0.0", ["9a2f7f61-..._1.0.0"], function(baseModule) { return baseModule; });
```

This tells SPFx "module `{webpartId}_1.0.0` depends on module `9a2f7f61-..._1.0.0`." SPFx would need to:
1. Recognize this is a named AMD module with a dependency
2. Look up `"9a2f7f61-..._1.0.0"` in scriptResources
3. Load `shell-web-part_*.js`
4. Wait for it to register
5. Then resolve the shim's factory

If SPFx's loader does not perform this multi-step AMD dependency resolution for entry modules — and the `Could not load ... in require` error strongly suggests it does not — the shim pattern is fundamentally incompatible with SPFx's module loading behavior.

**This is the same root cause that existed before the proof cases were introduced.** The proof cases succeeded by eliminating shims. The cumulative package re-introduced shims and re-introduced the failure.

## 4. Secondary possibilities

| Possibility | Likelihood | Evidence |
|-------------|-----------|----------|
| Shim files not served (404) | Low | Files verified present in .sppkg, content-hashed filenames match |
| scriptResources mapping error | Low | Both base module and shim are present in each manifest's scriptResources (verified by programmatic extraction in P5-02) |
| Neutral manifest ID leaked into package | Low | Verified absent from final package (neutral manifest deleted after cloning) |
| Service worker cache serving old single-target package | Low | Content-hashed bundle name changed; would show different symptoms |
| `mount.tsx` dispatcher defect | Very low | Dispatcher is identical to pre-proof-case code and was never the failure layer |

## 5. Exact remediation target

### What Prompt-02 must fix

**Eliminate AMD shim indirection from the cumulative package entirely.**

The remediation is to replicate the proof-case loader pattern across all 10 webparts: map each webpart's `entryModuleId` directly to the compiled shell asset file, without any intermediate AMD shim.

### Concrete change in `tools/build-spfx-package.ts`

In the multi-manifest loop (lines 875-892), instead of:
1. Generating a shim file that uses `define()` with a dependency on the base module
2. Adding the shim to `scriptResources` as the webpart's entry module
3. Keeping the base module in `scriptResources` as a separate entry

Do:
1. Map each webpart's `targetEntryModuleId` directly to the compiled shell asset file (the same `legacyScriptResource` that the base module uses)
2. Do NOT generate any shim files
3. Do NOT include the neutral base module ID in scriptResources (it is unnecessary — each webpart points directly to the shell asset)

### Expected resulting manifest per webpart

```json
{
  "id": "{webpartId}",
  "entryModuleId": "{webpartId}_1.0.0",
  "scriptResources": {
    "{webpartId}_1.0.0": { "type": "path", "path": "shell-web-part_*.js" }
  }
}
```

This is identical to the proof-case pattern, replicated across all 10 webparts. All 10 point to the same compiled shell asset file. No shims, no neutral module ID, no AMD dependency chain.

### Why this should work

The proof cases proved that SPFx successfully loads `shell-web-part_*.js` and resolves the ShellWebPart class when the `entryModuleId` maps directly to the file. The compiled shell file internally registers with `define("..._1.0.0", ...)` — but SPFx's module loader uses `scriptResources` for resolution, not the internal AMD module name. This was proven when the proof cases used the real webpart ID as the script key but the file was compiled with that same ID. In the cumulative fix, the file was compiled with the neutral ID but referenced by each webpart's own ID — SPFx doesn't check for a match between the scriptResources key and the file's internal `define()` name.

### Scope of code change

- **1 file**: `tools/build-spfx-package.ts`
- **1 loop modification**: lines 875-892 (the multi-manifest clone loop)
- **0 new files needed**
- **0 shim files generated**
- **No changes to**: `ShellWebPart.ts`, `mount.tsx`, `vite.config.ts`, any webpart source
