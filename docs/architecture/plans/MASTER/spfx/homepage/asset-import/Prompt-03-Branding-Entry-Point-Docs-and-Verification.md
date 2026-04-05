# Prompt-03 — Branding Entry Point, Docs, and Verification

## Objective

Complete the revised integration by hardening the shared branding entry point, auditing whether branded toolbox icons should now be sourced from the shared assets, and verifying that `apps/hb-webparts` consuming `@hbc/ui-kit/branding` still survives the current build/package path correctly.

Do not re-read files that are already in your current context or memory.

---

## Repo-truth focus areas

Audit and update the live repo truth in these areas as needed:

- `packages/ui-kit/package.json`
- `packages/ui-kit/README.md`
- any branding/index barrels added in Prompt 01
- `apps/hb-webparts/src/webparts/*/*.manifest.json`
- `apps/hb-webparts/README.md`
- `tools/build-spfx-package.ts`

---

## Required work

### 1. Harden the branding export surface
Confirm that:
- the branding entry point is stable
- exports resolve cleanly for consuming packages
- docs explain intended usage
- there is no ambiguity between shared brand assets and app-local editorial imagery

### 2. Audit manifest icon posture
Determine which `apps/hb-webparts` manifests still use `officeFabricIconFontName`.

Evaluate whether branded toolbox icons should now use a shared HB mark sourced from the shared brand asset lane.

### 3. Implement branded icon strategy only if justified
If justified, implement a credible toolbox icon strategy using a shared HB mark.

Preferred priorities:
1. deliberate visual quality
2. stable repo truth
3. low maintenance burden
4. no brittle runtime assumptions

If base64 or another manifest-safe technique is cleaner than runtime asset URLs, use judgment accordingly.

### 4. Verify build and packaging behavior
Run the relevant build/package flow and verify that:
- the shared branding assets are still reachable through the consuming app’s build path
- the consuming app resolves and emits any necessary asset references correctly
- the current Vite → SPFx shell → `.sppkg` path is not broken by the shift to shared kit-owned assets

At minimum, verify:
- consuming app build succeeds
- shared branding imports resolve
- emitted outputs contain the needed referenced assets or paths
- the package flow remains valid

### 5. Update docs
Update docs to clearly state:
- stable corporate brand assets live in `@hbc/ui-kit`
- homepage/editorial imagery remains local unless reuse is proven
- branded manifest icons were either adopted or intentionally deferred
- consuming apps should not recreate canonical copies of shared HB logos

---

## Hard gates

- Do not break package exports.
- Do not break the current cumulative multi-webpart packaging model.
- Do not add noisy or low-quality toolbox icons.
- Do not blur shared brand assets with app-local campaign/editorial assets.
- Do not re-read files already in your current context or memory.

---

## Deliverables

- hardened branding entry point
- icon posture audit and any justified icon updates
- build/package verification notes
- docs updates explaining the shared-branding consumption model
- concise final response summarizing:
  - whether branded toolbox icons were implemented
  - whether shared branding imports packaged safely through the current flow
  - what docs were updated

---

## Acceptance criteria

- shared branding entry point is stable and documented
- consuming webparts build correctly against `@hbc/ui-kit/branding`
- packaging verification shows the revised ownership model does not break the current flow
- docs clearly define shared brand ownership vs app-local imagery
