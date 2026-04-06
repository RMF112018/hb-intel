# Prompt 02 — Fix CSS Emission and Shell Attachment

## Objective

Repair the CSS emission and shell-entry attachment path so the rebuilt Signature Hero styles actually apply in SharePoint runtime.

This prompt is specifically about:
- CSS-module emission truth
- shared bundle CSS attachment truth
- shell-entry style loading truth

## Scope

Target:
- CSS-module build output for `hb-webparts`
- shared runtime/shell-entry code
- any asset manifest or loader path that governs CSS attachment
- any custom webpart app shell that bypasses default SPFx style loading

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Changes

### 1. Ensure CSS emission is correct
Ensure the hero CSS module is emitted into the package in the correct compiled form and bundled/registered consistently with the runtime strategy used by `hb-webparts`.

### 2. Ensure shell-entry attaches CSS
If the shared shell-entry/runtime currently loads JS without attaching the corresponding CSS asset, fix that.

The rebuilt hero styles must not rely on accidental global CSS behavior.
The runtime must explicitly and reliably attach the correct stylesheet.

### 3. Align CSS asset lookup
If CSS asset URLs are derived dynamically, ensure the lookup path is correct in SharePoint-hosted runtime.

If the runtime is using the wrong asset base path, wrong manifest metadata, or wrong resource reference, fix that.

### 4. Prevent silent unstyled rendering
Add or update a runtime safeguard so the app does not silently present a broken unstyled flagship hero if the stylesheet fails to attach.

This can be:
- load-path logging
- defensive runtime assertion
- debug-only warning
- build-time proof step

### 5. Preserve design intent
Do not redesign the hero in this phase.
The goal is to make the current rebuilt hero styling actually apply.

## Hard Gates

- Do not change the hero content scope.
- Do not do another visual rewrite to compensate for missing CSS.
- Do not leave CSS attachment implicit or unverified.
- Do not stop at “CSS is emitted” if shell-entry still fails to attach it.

## Deliverables

- corrected CSS emission/attachment behavior
- corrected shell-entry style loading
- concise explanation of the old failure and the new CSS load path
- validation output proving the stylesheet is now attachable in runtime

## Validation

Prove:
- emitted CSS contains hero rules
- runtime now requests the correct CSS asset
- shell-entry or runtime explicitly attaches the stylesheet as intended
