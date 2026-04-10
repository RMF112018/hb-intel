# PnP Ops — Non-Azure Refactor Prompt Package

## Objective

Refactor the PnP Operations feature so its **live extraction path no longer depends on the Azure backend/admin API seam** and instead uses:

1. a **best-fit local runner** that executes the same proven read-only PnP.PowerShell method from the operator workstation, and  
2. a **good fallback runner** using the same contract on a non-Azure internal/self-hosted service host.

This package is intentionally scoped to the **PnP Ops feature path**. Do **not** break or broadly re-platform unrelated admin-control-plane features unless required by direct dependency and explicitly documented in the change report.

---

## Why this package exists

Repo truth currently shows:

- the SPFx PnP Ops webpart is wired to call `/api/admin/*` routes,
- the current live feature path assumes backend URL / backend audience configuration,
- the backend control plane exists,
- but the current PnP extraction workflow layer is still synthetic/stubbed rather than a true live SharePoint/PnP extractor.

The user has also already proven a successful **read-only terminal-based PnP extraction method** using PnP.PowerShell with delegated login against the live SharePoint site, without using Azure-hosted extraction services.

This package instructs the refactor to align the application with that proven method.

---

## Source-of-truth scope

Use the **live repo on the current checked-out branch** as the implementation source of truth.

Primary paths expected to matter:

- `apps/hb-webparts/src/webparts/pnp/`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/config/package-solution.json`
- `backend/functions/src/functions/adminApi/index.ts`
- `backend/functions/src/services/admin-control-plane/`
- `tools/build-spfx-package.ts`

Supporting user-provided context already established in this chat includes the successful schema extraction reports and prior audit conclusions. Use that context. Do not discard it.

---

## Hard rules for the agent

- **Do not re-read files that are already in your active context or memory.**
- Do not preserve Azure coupling for the PnP Ops live extraction path just because it already exists.
- Do not make the browser attempt to execute PnP/terminal commands directly.
- Do not assume HTTP localhost from an HTTPS SharePoint page is acceptable; mixed-content, certificate, and CORS realities must be handled deliberately.
- Do not broaden this into a full-platform admin-control-plane rewrite.
- Keep the current action catalog and operator UX where practical; refactor the **execution seam** and **runtime contract** first.
- Prefer additive migration with a compatibility layer rather than destructive churn, unless removal is clearly cleaner and safer.
- Every prompt in this package expects a written completion report with:
  - changed files,
  - key design decisions,
  - risks / tradeoffs,
  - open questions,
  - and exact validation performed.

---

## Target architecture to implement

### Best fit
A **local companion runner** on the operator machine:

- runs outside the browser,
- executes the proven read-only PnP.PowerShell extraction method,
- exposes a browser-safe local HTTPS API contract for the SPFx webpart,
- returns preflight, run status, artifact manifest, and downloadable artifacts.

### Good fallback
A **remote self-hosted non-Azure runner** using the **same contract**:

- internal VM / jump box / on-prem host / other non-Azure service host,
- same JSON contract as the local runner,
- configurable from the webpart,
- usable when local installation is not available.

### Required modes after refactor
- `local-runner`
- `remote-runner`
- `mock`

The old Azure-admin API mode may remain temporarily only as a **deprecated compatibility mode** if needed for migration, but the completed refactor should no longer require it for successful live extraction.

---

## Recommended execution order

1. `Prompt-01_PnpOps-NonAzure-Architecture-Audit-and-Execution-Plan.md`
2. `Prompt-02_PnpOps-Runner-Abstraction-and-Frontend-Contract-Refactor.md`
3. `Prompt-03_PnpOps-Local-Runner-Implementation.md`
4. `Prompt-04_PnpOps-Remote-Runner-Fallback-Implementation.md`
5. `Prompt-05_PnpOps-Packaging-UX-Validation-and-Closure.md`

Use `Prompt-06_Fresh-ChatGPT-Validation-Session.md` only after the code work is complete and pushed.

---

## Prompt-01 outputs (repo truth lock)

Prompt-01 architecture and contract lock artifacts:

- `Prompt-01_PnpOps-NonAzure-Architecture-Audit-Report.md`
- `Prompt-01_PnpOps-Runner-Contract-Lock.md`
- `Prompt-01_PnpOps-NonAzure-Completion-Report.md`

---

## Expected deliverables by the end of the package

- SPFx PnP Ops UI no longer requires Azure backend config to run live extractions.
- PnP Ops uses a runner abstraction rather than a hard-coded `/api/admin/*` dependency.
- A local non-browser execution runner exists and uses the proven PnP.PowerShell pattern.
- A remote fallback runner path exists using the same API contract.
- Preflight, launch, run status, evidence, and artifact download flows still work.
- Operator messaging clearly distinguishes:
  - local runner,
  - remote runner,
  - mock mode,
  - and any deprecated legacy mode.
- `hb-webparts.sppkg` still packages the PnP Ops webpart correctly.
- Documentation exists for local runner setup and remote fallback setup.

---

## Completion standard

This package is complete only when the agent can prove all of the following:

1. the code no longer requires Azure backend services for the live PnP Ops path,
2. the local runner can execute real read-only extraction logic,
3. the fallback runner can be configured without Azure,
4. the SPFx UI can talk to those runners safely and clearly,
5. packaging still works,
6. and the final system is honest about what is live vs mock.
