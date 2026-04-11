# Prompt 03 — PnP Ops Local Runner Implementation

## Objective

Implement the **best-fit local execution path** for PnP Ops: a local companion runner that executes the proven read-only PnP.PowerShell method on the operator workstation and exposes a browser-safe API for the SPFx webpart.

---

## Critical instruction

**Do not re-read files that are already in your active context or memory.**

Build from the architecture and contract established in Prompts 01 and 02.

---

## Required outcome

Create a local runner implementation that:

- runs outside the browser,
- can execute real PnP.PowerShell-based extraction workflows,
- exposes the neutral runner API contract over a browser-safe local endpoint,
- supports preflight, launch, status, evidence, and artifact download,
- does not require Azure services for live extraction.

---

## Implementation direction

### Preferred shape
A small **local HTTPS companion service** on the operator workstation, for example:

- Node/TypeScript service,
- invoking `pwsh` / `powershell` scripts or commands,
- exposing HTTPS on loopback,
- with explicit CORS allowlist for the SharePoint origin.

You may choose the exact placement in the repo, but keep it disciplined. Good examples:

- `tools/pnp-runner-local/`
- `apps/pnp-runner-local/`
- another clearly named local-runner package

If repo architecture strongly suggests another location, use it and explain why.

---

## Required capabilities

### 1. Runner health/capabilities
Implement an endpoint or equivalent that proves:

- service is up,
- runner version/build is known,
- PowerShell is available,
- PnP.PowerShell availability/version is known,
- execution mode is `local-runner`.

### 2. Preflight
Preflight must verify real local-runner conditions, including at minimum:

- target SharePoint URL shape
- required list/page filters by action
- local PowerShell availability
- local PnP.PowerShell availability
- runner write/read temp directory access
- ability to start the chosen extraction process
- clear failure output when prerequisites are missing

### 3. Run launch and status
Implement:

- run creation
- in-process or queued execution
- status polling
- meaningful step updates
- terminal success/failure handling

This does not need enterprise-scale orchestration yet, but it must be honest and stable.

### 4. Artifact generation
Artifacts should be created locally and exposed through the runner contract. Preserve the useful current shapes where practical:

- raw payload
- normalized payload
- summary/report
- artifact manifest
- optional bundle/zip

### 5. Real extraction path
Use the user-proven method direction as the basis:

- read-only PnP.PowerShell
- delegated login / interactive/device-login compatible path
- list / field / view / content type / page / site inventory extraction as applicable
- no writes

### 6. Security and browser-safety
Handle these deliberately:

- HTTPS loopback
- certificate strategy
- allowed origins / CORS
- no wildcard browser exposure
- local-only bind unless explicitly configured otherwise

Do not hand-wave this part.

---

## Required design constraints

- Do not attempt to run PowerShell from inside SPFx/browser code.
- Do not use Azure services.
- Keep the contract aligned with the frontend runner client from Prompt 02.
- Keep the runner read-only for all current actions.
- Favor deterministic local file/artifact handling over clever but fragile in-memory-only behavior.

---

## Documentation required

Add a concise setup document for the local runner covering:

- prerequisites
- install/start instructions
- certificate/trust considerations
- PowerShell + PnP.PowerShell requirements
- how the SPFx webpart should point at the local runner
- troubleshooting basics

---

## Deliverables

1. Local runner implementation.
2. Real read-only extraction execution path.
3. Browser-safe local API surface.
4. Local runner setup documentation.
5. Completion report with:
   - changed files,
   - exact endpoints/contract,
   - execution model,
   - security notes,
   - validation steps performed.

---

## Acceptance criteria

- Local runner can execute at least one real extraction workflow end-to-end without Azure.
- SPFx can target the local runner via the neutral contract.
- Preflight reflects real local readiness, not placeholder checks.
- Artifact download works through the runner.
- Documentation is good enough for another developer/operator to stand it up.
