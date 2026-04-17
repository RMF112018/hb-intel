# Prompt 02 — Extend Runner For Provisioning And Extraction

## Objective

Extend the existing local runner in `tools/pnp-runner-local/` so it can provision the new SharePoint lists exactly as defined in the two binding in-package schema files, and extract the current HBCentral homepage Quick Links configuration using **Device Login** auth, while preserving the runner’s existing contract discipline and evidence model.

## Why this issue exists / current-state problem

The existing local runner and PowerShell bridge are extraction-oriented. They support read-only PnP actions and artifact generation, but they do not yet provide the provisioning path needed for:

- provisioning `Priority Actions Band Config`
- provisioning `Priority Actions Band Items`
- extracting and normalizing the live HBCentral homepage Quick Links configuration specifically for seeding
- executing the whole operation through the existing run/evidence model

That capability gap must be closed now inside the existing runner footprint if at all technically possible.

Treat these files as binding implementation inputs throughout this prompt:
- `05-List-Schema-Priority-Actions-Band-Config.md`
- `06-List-Schema-Priority-Actions-Band-Items.md`

## Repo-truth evidence and files / seams to inspect

At minimum inspect and modify as needed:

- `tools/pnp-runner-local/src/**`
- `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`
- runner action catalog / run service / types / storage / evidence seams
- `tools/pnp-runner-local/tests/**`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/Prompt-01_PnpOps-Runner-Contract-Lock.md`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/Prompt-03_PnpOps-Local-Runner-Setup-Guide.md`

## Required implementation outcome

Implement the provisioning and extraction path by extending the current runner with new action support. Preferred shape:

### New or equivalent runner actions
- one action for provisioning the two command-band lists
- one action for extracting current Quick Links data from the live HBCentral homepage
- one action for seeding `Priority Actions Band Items` from the extracted Quick Links payload
- optionally one combined orchestration action if that is cleaner inside the current runner model

You may choose the exact action-key naming, but it must be consistent with the existing runner/action catalog conventions.

### Required capabilities
- Device Login execution path only for this workflow unless Interactive is kept as fallback without becoming the primary mode
- list existence check
- idempotent create/update of list schema
- field provisioning with the exact stable internal names defined in the included schema files
- choice/default/index configuration where required by the included schema files
- extraction of current homepage Quick Links configuration from HBCentral
- normalized artifact output for extraction and seeding
- summary/evidence output for provisioning and seeding
- explicit drift detection if the target SharePoint lists or repo descriptors do not match the included schema files

### Expected artifact/evidence outputs
For the relevant runs, emit durable artifacts such as:
- raw extraction JSON
- normalized extraction JSON
- provision summary
- seed summary
- artifact manifest
- bundle zip if that is already the preferred runner pattern

## Specific implementation expectations

### A. Preserve runner contract discipline
Do not bypass the existing runner’s endpoint/run/evidence posture. Extend it cleanly.

### B. Preserve HTTPS / local-runner posture
Do not weaken the current local-runner security model.

### C. Keep Device Login explicit
Make Device Login the explicit expected auth mode for this workflow. Do not bury it in docs only.

### D. Implement idempotency
The provisioning path must be safe to re-run:
- existing lists should be reused
- missing fields should be added
- incompatible drift against the included schema files should be reported clearly
- duplicate seed items should not multiply on repeated runs

### E. Implement extraction realistically
Do not fake Quick Links extraction. Read the actual live HBCentral homepage page/webpart configuration using the best repo-compatible PnP/SharePoint approach available.

### F. Normalize seeded output
Map extracted Quick Links entries into the canonical item model from `06-List-Schema-Priority-Actions-Band-Items.md` with explicit defaults for fields not available from the legacy source.

### G. Wire runner actions to the canonical schema
The provisioning implementation must source list titles, field internal names, defaults, and choice values from a disciplined contract seam that is aligned to the two included schema files. Do not scatter ad hoc field names through runner code or scripts.

## Constraints / prohibitions

- Do not create disconnected standalone scripts outside the existing runner unless absolutely required and explicitly justified.
- Do not hand-wave the extraction path.
- Do not rely on manual SharePoint list creation.
- Do not use Interactive auth as the primary path.
- Do not deviate from the included schema files without implementing and documenting the migration/update in the same pass.
- Do not re-read files that are already in active context unless you need to verify drift, dependencies, or uncertainty after changes.

## What done really looks like

Done means:
- the local runner can execute provisioning and extraction for this workflow
- Device Login works in the local-runner flow
- the new lists can be provisioned idempotently at HBCentral against the included schema files
- Quick Links data can be extracted into artifacts
- the runner emits evidence good enough to prove the workflow actually ran

## Proof of closure required

- changed runner code
- changed/added PowerShell bridge logic
- tests added or updated where appropriate
- setup docs updated if env/usage changed
- evidence artifacts from at least one successful local run
