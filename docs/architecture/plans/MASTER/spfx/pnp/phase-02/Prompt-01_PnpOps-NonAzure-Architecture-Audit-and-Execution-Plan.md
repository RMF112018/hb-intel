# Prompt 01 — PnP Ops Non-Azure Architecture Audit and Execution Plan

## Objective

Conduct a narrow repo-truth architecture pass focused only on the PnP Ops execution seam, then write and implement the refactor plan required to remove Azure dependency from the **live extraction path**.

This prompt is not the place to finish all implementation. It is the place to establish the final non-Azure direction and make the minimum structural decisions that the later prompts will build on.

---

## Critical instruction

**Do not re-read files that are already in your active context or memory.**

Use the current repo state and already-known PnP Ops paths. Only open additional files when necessary to resolve real ambiguity.

---

## Problem to solve

The current PnP Ops path is wired as:

- SPFx webpart UI
- token / backend URL expectations
- `/api/admin/*` backend seam
- admin control-plane orchestration
- artifact/evidence contract

The user has explicitly stated that they have already run successful extractions from the terminal using a read-only PnP.PowerShell method **without Azure services**, and they want that method to become the basis for this application.

Your task is to convert the architecture accordingly.

---

## Required design outcome

You must produce a concrete implementation plan that refactors PnP Ops to use a **runner abstraction** with these execution targets:

1. **Local Runner** — preferred live path
2. **Remote Runner** — non-Azure fallback
3. **Mock Mode** — retained for UI/dev testing
4. optional temporary **Legacy Azure Mode** — only if needed for safe migration; must be clearly deprecated

---

## Required analysis areas

### 1. Current hard Azure couplings
Identify all current Azure/backend assumptions specifically in the PnP Ops path, including but not limited to:

- backend URL expectations
- backend audience / token acquisition assumptions
- `/api/admin/*` route dependencies
- preflight checks coupled to Azure env vars
- evidence/download paths tied to backend services
- any packaging or setup copy implying Azure is required

### 2. Browser/runtime realities
Account for real constraints of an SPFx webpart running in SharePoint:

- browser cannot execute PowerShell
- browser cannot directly use local terminal sessions
- HTTPS SharePoint page → local execution requires a browser-safe bridge
- mixed content / certificate / CORS / loopback constraints must be addressed
- remote runner must also use safe HTTPS/CORS patterns

### 3. New execution abstraction
Define the interface surface that the frontend should target instead of `/api/admin/*`, including:

- `GET /actions` or equivalent metadata endpoint
- `POST /preflight`
- `POST /runs`
- `GET /runs/{id}`
- `GET /runs/{id}/evidence`
- `GET /runs/{id}/artifacts/{artifactId}/download`
- optional health/version/capabilities endpoints

Do not overcomplicate the contract. Preserve the best parts of the current UI contract where practical.

### 4. Local runner shape
Recommend the best implementation approach for the local runner.

The preferred answer is expected to be a **small local companion service** that:

- is installed/run on the operator workstation,
- executes PowerShell / `pwsh`,
- calls the proven PnP.PowerShell method,
- exposes a **local HTTPS loopback API** with explicit CORS allowlisting for the SharePoint origin,
- stores artifacts locally for retrieval by the UI.

If you conclude a different implementation is better, justify it precisely.

### 5. Remote fallback shape
Define the fallback as a **self-hosted non-Azure runner** that uses the same contract as the local runner.

Examples of acceptable direction:
- internal Windows service host
- internal Node service host on a utility VM
- job runner on a jump box
- on-prem/intranet container host

The key requirement is **same contract, different deployment target**.

---

## Required implementation tasks

1. Create a short architecture decision record or implementation note under an appropriate docs path.
2. Define the canonical execution modes and config model for PnP Ops.
3. Identify the exact frontend and backend files that must be refactored.
4. Add TODO-safe scaffolding or interface placeholders only where doing so reduces later churn.
5. Do not yet do the full runner implementation here unless it is trivial and directly useful.

---

## Deliverables

1. Written architecture note / ADR.
2. Clear implementation plan in your completion report.
3. Any initial shared types/interfaces that later prompts will build on.
4. Exact list of files to be changed in Prompts 02–05.

---

## Acceptance criteria

- The new architecture no longer treats Azure as the required live execution path.
- The runner abstraction is defined clearly enough that the UI can target local and remote runners using the same contract.
- Local runner is explicitly chosen as the preferred live path.
- Remote self-hosted runner is explicitly chosen as the fallback.
- The completion report clearly states what remains for the next prompts.
