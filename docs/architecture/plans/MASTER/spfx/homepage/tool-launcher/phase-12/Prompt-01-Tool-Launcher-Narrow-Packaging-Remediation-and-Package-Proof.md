# Prompt-01 — Tool Launcher Narrow Packaging Remediation and Package Proof

## Objective

Conduct a **narrow packaging/remediation pass** focused only on proving that the generated `hb-webparts.sppkg` truly contains the latest code from:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`

before upload to SharePoint.

This is **not** a broad UI phase.

This is **not** a new feature phase.

This is a **package fidelity and deployment-proof phase**.

---

## Required Context

You should assume the following:

- all intended Tool Launcher changes under `apps/hb-webparts/src/webparts/toolLauncherWorkHub/` have already been pushed to `main`
- SharePoint rendering suggests that **some** new work took effect, but **not all**
- current evidence points to a **partial package/deploy mismatch**
- the likely failure modes are:
  - stale build artifacts
  - wrong `.sppkg` selected for upload
  - generated package not actually containing the latest Tool Launcher bundle
  - app-catalog upgrade applying an older or inconsistent package
  - asset/version mismatch in the generated package

Your job is to prove what is actually inside the generated package and correct the packaging path if necessary.

---

## Required Inputs

Inspect and use, at minimum:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- `apps/hb-webparts/src/mount.tsx`
- the relevant SPFx packaging/build pipeline for `hb-webparts`
- any scripts used to build `.sppkg`
- any package output directories used for `hb-webparts`
- the generated `hb-webparts.sppkg`
- any manifest / packaging files relevant to the `hb-webparts` build

Also inspect prior build tooling if needed, including likely areas such as:
- package scripts
- SPFx gulp/build configs
- monorepo build helpers
- package output staging directories
- temporary build directories
- sharepoint/solution packaging folders
- any script that copies or transforms bundle output into the final `.sppkg`

Do not widen beyond what is needed to prove package fidelity.

Do not re-read files that are already in current context or memory.

---

## Phase Goal

Produce a clean, documented proof that:

1. the current source under `apps/hb-webparts/src/webparts/toolLauncherWorkHub/` is the source being bundled,
2. the generated client-side assets used by `hb-webparts.sppkg` actually reflect that source,
3. the final `.sppkg` contains those updated assets,
4. and the package prepared for upload is the correct one.

If that proof fails at any stage, fix the narrow packaging problem and rebuild.

---

## Required Tasks

### 1. Identify the exact build and packaging path
Determine the exact commands, scripts, and artifact paths that produce the final `hb-webparts.sppkg`.

You must identify:
- the authoritative build command
- the authoritative package command
- where intermediate client-side assets are emitted
- where the final `.sppkg` is written
- whether any old artifacts can survive and pollute the package

Document this precisely.

### 2. Establish source-to-bundle proof markers
Select a small set of **distinctive Tool Launcher source markers** from the latest code that can be searched for or otherwise proven in generated output.

Use markers that are highly likely to survive bundling in some traceable form, such as:
- distinctive strings
- section labels
- unique aria labels
- unique comments if preserved
- UI copy
- specific class/module references
- other stable literals tied to the latest Tool Launcher implementation

The goal is to create a reliable proof that the generated bundle reflects the current source.

### 3. Clean all relevant stale artifacts
Perform a true clean of all relevant build/package output for `hb-webparts`.

Do not rely on incremental rebuilds if stale artifact contamination is possible.

Clean whatever is necessary so the new package can only come from current source.

Document exactly what was removed or regenerated.

### 4. Rebuild and repackage
Run the exact authoritative commands required to generate a fresh `hb-webparts.sppkg`.

Document:
- commands run
- working directory
- outputs produced
- final package path

### 5. Inspect the generated package contents
Do not stop at “build succeeded.”

You must inspect the generated package and prove that the Tool Launcher bundle inside it reflects the latest source.

Where possible:
- unpack or inspect the `.sppkg`
- locate relevant manifest / asset references
- inspect referenced JS assets or package internals
- verify the presence of the selected proof markers
- confirm that the package is not carrying older Tool Launcher logic

### 6. Resolve any mismatch if found
If the package contents still do not reflect current Tool Launcher source:

- identify the exact stage where the mismatch occurs
- fix only that narrow issue
- rebuild
- re-verify package contents

Do not drift into unrelated remediation.

### 7. Produce deployment-readiness proof
At the end, produce a clear statement of whether the generated package is ready to upload.

The result should make it impossible to confuse:
- source truth
- generated bundle truth
- final `.sppkg` truth

---

## Required Deliverables

### 1. Packaging remediation summary
Create:
`docs/architecture/reviews/tool-launcher/tool-launcher-narrow-packaging-remediation-summary.md`

This file must include:
- the suspected failure mode
- exact build/package path
- files/scripts inspected
- what was cleaned
- what was rebuilt
- what was fixed, if anything
- final conclusion on package readiness

### 2. Package-proof validation file
Create:
`docs/architecture/reviews/tool-launcher/tool-launcher-package-proof-validation.md`

This file must include:
- proof markers selected
- where they appear in current source
- how they were verified in generated output
- how they were verified in the final `.sppkg`
- final statement confirming whether the package truly contains latest Tool Launcher code

### 3. Fresh built package
Produce a clean rebuilt:
- `hb-webparts.sppkg`

If the repo outputs it to a standard directory, keep it there and document the exact path.

---

## Validation Expectations

Before concluding, verify at minimum:

- current Tool Launcher source on disk is the intended latest source
- authoritative build/package commands are correctly identified
- stale artifacts were actually cleaned
- new client-side assets were generated
- proof markers from current Tool Launcher source are present in the generated output
- proof markers are traceable to the final `.sppkg`
- the final package path is clearly identified
- there is no ambiguity about which package should be uploaded

If any of these cannot be proven, do not claim the package is ready.

---

## Important Constraints

- Keep this narrow.
- Do not redesign the Tool Launcher.
- Do not modify unrelated homepage code.
- Do not widen into a tenant-side troubleshooting audit.
- Do not assume “build passed” means “package is correct.”
- Do not re-read files that are already in current context or memory.
- Do not finish without actual package-proof evidence.

---

## Required Completion Notes

When finished, provide concise completion notes covering:

- exact commands run
- exact files/scripts inspected
- what was cleaned
- what package path was produced
- what proof markers were used
- whether the final `hb-webparts.sppkg` is confirmed to contain the latest Tool Launcher code
- whether the package is ready for upload

---

## Final Instruction

Execute this as a **narrow packaging/remediation and package-proof phase** for the Tool Launcher.

The only acceptable finish line is a documented proof that the generated `hb-webparts.sppkg` truly contains the latest code from `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`.
