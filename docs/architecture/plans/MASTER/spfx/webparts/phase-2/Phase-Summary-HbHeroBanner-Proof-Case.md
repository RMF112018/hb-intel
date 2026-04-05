# Phase Summary — HbHeroBanner Proof-Case Remediation

## Objective

Replace the current post-bundle shim loader model with a first-class SPFx loader contract for `HbHeroBannerWebPart`, using the smallest practical change set that can prove the model works in a real tenant page.

## Recommended approach

The recommended proof-case architecture is:

- temporarily scope `hb-webparts` packaging to `HbHeroBannerWebPart`
- remove the current neutral-manifest + cloned-manifest + AMD shim path for the proof case
- allow SPFx to emit the packaged loader contract naturally for that single webpart
- use a hero-only or proof-case-specific application entry if needed to isolate unrelated bundle imports
- validate the emitted `.sppkg` directly and then validate runtime behavior in the tenant

## Why this is the right proof case

`HbHeroBannerWebPart` is a good proof case because:

- it is already a discrete source manifest with a real component ID
- it is present in the runtime dispatcher
- it is visually simple enough that loader success and render success can be separated
- it avoids broadening immediately into full homepage composition concerns

## Hard gates

The proof case is not complete unless all of the following are true:

1. The packaged manifest for `HbHeroBannerWebPart` does **not** depend on a generated shim entry module.
2. The packaged manifest `entryModuleId` is emitted as part of the normal SPFx compile/package flow.
3. The package no longer relies on post-bundle manifest cloning for the proof case.
4. SharePoint can add the webpart from the toolbox and render it on the page.
5. The `Could not load 39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0 in require` failure is gone.
6. The technical-details crash screen no longer appears for the hero proof case.

## Risk Exposure

### Primary risk
A partial fix may only relocate the current shim logic instead of removing it.

### Secondary risk
The proof case may still include a broad app bundle that imports unrelated surfaces, masking whether the loader contract is actually clean.

### Tertiary risk
Tenant-side or service-worker cache artifacts may create a false negative after a correct package is built.

## Standards / Best Practices

- Prefer first-class SPFx manifest/module emission over post-hoc manifest surgery.
- Prefer one real compiled entry surface over synthetic AMD aliasing.
- Keep the proof case narrow enough that cause and effect are obvious.
- Separate loader validation from UI/runtime noise.
- Validate source truth, package truth, and tenant runtime truth independently.

## Suggested stopping point

Stop after the proof case is proven and the rollout pattern is documented. Do **not** expand all remaining webparts in the same change wave unless explicitly instructed.
