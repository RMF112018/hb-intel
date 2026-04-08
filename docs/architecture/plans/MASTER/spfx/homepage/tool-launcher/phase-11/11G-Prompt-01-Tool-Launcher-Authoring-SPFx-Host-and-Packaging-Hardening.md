# Prompt-11G-01 — Tool Launcher Authoring, SPFx Host, and Packaging Hardening

## Objective

Execute **Phase 11G** for the Tool Launcher / Work Hub.

This phase corresponds to the previously defined **Phase 06**.

Your job is to harden the rebuilt launcher for real SharePoint use by validating and improving authoring safety, host behavior, manifest posture, packaging, and render/package parity.

---

## Required Pre-Read

Use these first:

- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-readme.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-change-boundaries.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-validation-checklist.md`
- outputs from phases 11B through 11F
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

Then inspect:
- Tool Launcher webpart files
- manifest files
- relevant build / packaging files
- any authoring-state helpers touched by the rebuild

Do not re-read files that are already in current context or memory.

---

## Phase Goal

Prove that the rebuilt launcher is not just visually improved, but actually robust inside SharePoint authoring and packaging reality.

---

## Required Focus Areas

### 1. Edit mode and partial configuration
Validate and improve the launcher in:
- edit mode
- minimal configuration states
- partial list data states
- sparse featured states
- partial support/status states
- missing logo / incomplete metadata conditions

### 2. Host-safe behavior
Ensure the launcher remains:
- SharePoint-coexistent
- non-shell-duplicative
- stable in page canvas
- well-behaved in supported layout contexts

### 3. Manifest posture
Review and harden any relevant manifest or packaging posture for the Tool Launcher.

Ensure structural intent survives packaging.

### 4. Packaging/render parity
Confirm that the packaged output preserves the actual rebuilt structure and behavior.

Do not assume source success equals package success.

### 5. Build and validation discipline
Perform the appropriate clean build and document the commands used.

If there are package-related concerns, resolve them within the scope of the launcher workstream.

---

## Preserve These Seams

Preserve unless narrowly justified otherwise:

- the live list-driven launcher model
- launch behavior
- composition, data, primitive, discovery, and support/status gains already completed
- accessibility work already in place unless improved in a safe way

---

## Required Deliverables

### 1. Code / config changes
Update the relevant Tool Launcher files and any narrowly related manifest / build / packaging files necessary to harden production behavior.

### 2. Summary document
Create:
`docs/architecture/reviews/tool-launcher/phase-11g-authoring-spfx-host-and-packaging-hardening-summary.md`

This file must describe:
- what authoring / host / packaging issues were addressed
- what manifest or build changes were made
- what assumptions were tested
- what was proven about runtime/package parity

### 3. Validation document
Create:
`docs/architecture/reviews/tool-launcher/phase-11g-authoring-spfx-host-and-packaging-hardening-validation.md`

This file must describe:
- what edit-mode and partial-data checks were run
- what build / package steps were executed
- what packaged output was validated
- whether any residual risks remain before final polish

---

## Validation Expectations

Before concluding, validate at minimum:

- launcher still renders correctly in SharePoint-hosted contexts
- authoring / edit-mode behavior is acceptable
- empty/loading/error states remain professional
- manifest posture is correct for intended use
- packaged output preserves rebuilt structure
- clean build completes successfully
- any required package generation completes successfully or is precisely documented if blocked
- no regressions to runtime launch behavior

---

## Important Constraints

- Do not re-read files that are already in current context or memory.
- Do not widen this phase into final polish or general QA closure; that belongs to 11H.
- Do not regress the completed rebuild work.
- Do not ignore package/render mismatches if discovered.
- Do not treat source-only validation as sufficient.

---

## Required Completion Notes

When finished, provide concise completion notes covering:

- files changed
- files created
- authoring / host / packaging issues addressed
- build and package commands executed
- validation performed
- remaining risks
- recommended next phase

---

## Final Instruction

Execute **Phase 11G** as the Tool Launcher authoring, SharePoint-host, and packaging-hardening phase.

The goal is to prove the rebuilt launcher is production-safe inside actual SPFx and SharePoint operating reality.
