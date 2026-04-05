# Prompt-02 — Implement a First-Class Loader Contract for `HbHeroBannerWebPart`

## Objective

Implement the proof-case build and packaging refactor so that `HbHeroBannerWebPart` is delivered through a first-class SPFx loader contract instead of the current post-bundle shim model.

## Required operating rules

- Do not re-read files that are already in your active context or memory. Only open additional files when required to verify a dependency, inspect a touched surface, or resolve uncertainty.
- Do not preserve shim logic "just in case" for the proof case.
- Do not keep a fake-neutral manifest plus post-bundle clone path active for the hero proof case.
- Do not leave behind packaged `entryModuleId` indirection that still depends on synthetic AMD aliasing.
- Keep all changes as narrow as possible.

## Mandatory implementation targets

### 1. `tools/build-spfx-package.ts`
Refactor the `hb-webparts` path so the proof case no longer uses:

- neutral shell manifest IDs
- compiled manifest cloning to multiple webpart IDs
- generated `shell-entry-*.js` AMD shim modules
- post-bundle `loaderConfig.scriptResources` surgery for the proof case

For the proof case, the package flow must compile and package one real webpart surface for `HbHeroBannerWebPart`.

### 2. Proof-case entry isolation
If the current `apps/hb-webparts/src/mount.tsx` bundle still imports unrelated homepage surfaces at bundle-evaluation time, create a proof-case-specific entry so the hero validation is not contaminated by unrelated imports.

That proof-case entry should:

- mount only `HbHeroBanner`
- export a clear proof-case global
- preserve the same `mount` / `unmount` shell contract

If repo truth shows the current shared entry is already clean enough for proof-case isolation, state that clearly and keep it.

### 3. `apps/hb-webparts/vite.config.ts`
Update the Vite build path as needed so the proof-case bundle is a real, deterministic build artifact for the hero webpart and not an accidental side effect of the broad shared entry.

### 4. `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
Keep the shell contract simple. The shell should load a real bundle/global pair and pass through the normal runtime config. Do not add new shim-resolution behavior.

### 5. Hero manifest alignment
Ensure the compiled proof-case manifest is aligned to:

- `id = 39762a4d-c7fd-44a6-a11e-4f8de9f5778d`
- `alias = HbHeroBannerWebPart`
- native SPFx-emitted loader contract for the proof case

## Mandatory removals for the proof case

After this prompt, the proof case must no longer depend on any generated equivalent of:

- `define("<webpart-id>_1.0.0", ["<base-entry>"], ...)`
- synthetic `shell-entry-<id>.js`
- post-bundle manifest duplication to manufacture multiple entry identities

## Required deliverables in this prompt

1. Implement the code changes.
2. Build the proof-case package.
3. Inspect the emitted package and confirm the loader contract is first-class for the hero proof case.
4. Produce a concise implementation note covering:
   - what changed
   - what was removed
   - the exact emitted loader path now used by SharePoint
   - whether a dedicated proof-case bundle/global was introduced

## Acceptance criteria

This prompt is complete only when all of the following are true:

- the proof case packages only `HbHeroBannerWebPart`
- no generated AMD shim entry module is needed for the proof case
- no post-bundle cloned manifest is needed for the proof case
- the packaged hero manifest is naturally coherent
- the resulting `.sppkg` is ready for tenant runtime validation
