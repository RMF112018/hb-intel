# Prompt 03 — Fix Webpart Registry and Bundle Routing

## Objective

Repair the shared app-bundle routing/registry seam so the emitted package can actually render the rebuilt Signature Hero instead of falling through to stale legacy hero paths.

This is the most likely explanation when:
- source Signature Hero changed
- package contains new code fragments
- but SharePoint still renders the wrong hero

## Scope

Target the actual routing/registration path that determines which webpart ID maps to which runtime component in the emitted bundle, including:
- `hb-webparts-app-*`
- shell-entry files
- any registry builders
- mount/dispatch seams
- any central component map or generated webpart lookup table

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Tasks

### 1. Identify current registry source
Find the actual source of truth for webpart ID → component routing.

Do not assume.
Prove it.

### 2. Repair Signature Hero registration
Ensure the Signature Hero webpart ID is included in the emitted routing/registry path and points to the rebuilt `HbSignatureHero` implementation.

### 3. Repair stale legacy routing
If the old `hbHeroBanner` and/or `PersonalizedWelcomeHeader` are still being used as a fallback top-band path in the emitted registry, eliminate or isolate that behavior.

### 4. Align shell-entry output
Ensure the shell-entry surface for Signature Hero resolves the correct component path and does not silently land in stale legacy render logic.

### 5. Add registry-proof validation
Add a packaging validation step that fails when:
- Signature Hero ID is absent from the emitted registry
- the registry points Signature Hero to the wrong component
- stale legacy IDs still occupy the flagship role unexpectedly

## Hard Gates

- Do not assume shell-entry correctness.
- Do not accept “Build with GRIT.” appearing somewhere in the package as proof of correct routing.
- Do not leave registry generation implicit or opaque.
- Do not upload another package until emitted bundle routing is proven correct.

## Deliverables

- corrected registry/routing behavior
- corrected shell-entry mapping for Signature Hero
- concise explanation of the old failure and the new routing truth
- validation output proving the Signature Hero ID is now registered correctly

## Validation

Prove:
- emitted bundle contains the Signature Hero ID
- emitted bundle maps that ID to the rebuilt hero path
- stale legacy top-band routing is no longer hijacking the flagship hero
