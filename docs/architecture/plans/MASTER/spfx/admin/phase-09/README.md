# README — Admin SPFx IT Control Center Phase 9 Prompt Package (Hybrid Identity Redirect)

## Implementation status

Phase 9 core implementation is **complete** (Prompts 01–10). The following capabilities have been delivered:

### Backend (backend/functions)
- AD DS adapter (`ad-directory-service.ts`) — interface + mock for on-prem LDAPS operations
- Graph service expansion (`graph-service.ts`) — user/group lifecycle, sync visibility, authority detection
- Connection registry (`connection-registry-service.ts`) — UI-managed connector config with secure credential handling
- 13 typed error categories (`hybrid-identity-errors.ts`)
- Hybrid identity contracts, validators, and workflow router (P9-05)
- 12 user lifecycle workflow handlers with audit payloads (P9-06)
- 7 API endpoints under `/api/admin/identity/users/` (P9-06)
- 3 connection management API endpoints under `/api/admin/connections` (P9-09)
- Audit payload persistence wired to admin audit store (P9-09)

### Frontend (apps/admin)
- Hybrid Identity control lane at `/entra` with 5 tabs (P9-08, P9-09)
- Overview: live connection status, source-of-authority info, capabilities
- Users: search, create, enable/disable, delete with risk-aware execution UX
- Groups: search with info banner (group action endpoints pending P9-07 backend)
- Connections: AD DS connector config/test, Graph permission confirm/test
- History: audit trail of identity operations from admin audit store
- Connection preflight banners, risk-tier badges, preview/confirmation flows
- Double-confirmation for destructive operations, sync-pending result display

### Documentation (this directory)
- Repo-truth and hybrid gap map (P9-01)
- Hybrid identity architecture baseline and scope (P9-02)
- Action catalog, source-of-authority matrix, risk taxonomy, permission matrix (P9-03)
- Connection topology, management baseline, dependency matrix, UI configurability (P9-03)
- Backend contract notes, user workflow notes (P9-05, P9-06)
- Environment and prerequisites guide (P9-10)
- Operator runbook (P9-10)
- IT handoff and setup guide (P9-10)

### Key document cross-links

| Document | Purpose |
|----------|---------|
| [Action Catalog](admin-spfx-phase-9-identity-action-catalog.md) | 26 implement-now actions with risk, authority, and checkpoint |
| [Source-of-Authority Matrix](admin-spfx-phase-9-source-of-authority-matrix.md) | AD DS vs Entra routing rules per object type |
| [Risk Taxonomy](admin-spfx-phase-9-risk-taxonomy.md) | 5 risk tiers with confirmation and evidence requirements |
| [Permission Matrix](admin-spfx-phase-9-permission-access-role-and-consent-matrix.md) | Graph permissions and AD DS service account delegation |
| [Connection Dependency Matrix](admin-spfx-phase-9-connection-dependency-matrix.md) | Required connectors and degraded-mode behavior per action |
| [UI Configurability Matrix](admin-spfx-phase-9-ui-configurability-matrix.md) | No-code handoff gate compliance per setting |
| [Environment & Prerequisites](admin-spfx-phase-9-env-and-prerequisites.md) | External prerequisites, Graph consent, AD DS infra |
| [Operator Runbook](admin-spfx-phase-9-operator-runbook.md) | What operators can do, risk handling, sync interpretation |
| [IT Handoff & Setup Guide](admin-spfx-phase-9-it-handoff-and-setup-guide.md) | Step-by-step no-code setup after .sppkg delivery |

## What this package contains

This package is a **local-code-agent implementation set** for **Phase 9 — Hybrid Identity Administration foundation**.

It also hard-locks a **no-code IT handoff and setup requirement**: after the final `.sppkg` is delivered, IT must be able to install the app, configure it, verify it, rotate connection material, and operate the feature without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files.

It is a **redirected replacement** for the earlier Entra-only Phase 9 package.

Included files:

1. `Admin-SPFx-IT-Control-Center-Phase-9-Summary-Plan.md`
2. `README.md`
3. `Prompt-01-Phase-9-Repo-Truth-Prerequisites-and-Hybrid-Gap-Map.md`
4. `Prompt-02-Phase-9-Hybrid-Identity-Architecture-Baseline-and-Scope.md`
5. `Prompt-03-Hybrid-Identity-Action-Catalog-Source-of-Authority-Risk-Taxonomy-and-Permission-Matrix.md`
6. `Prompt-04-AD-DS-and-Graph-Service-Boundary-Expansion-and-Test-Hardening.md`
7. `Prompt-05-Hybrid-Identity-Backend-Contracts-Models-and-Workflow-Primitives.md`
8. `Prompt-06-AD-DS-User-Lifecycle-Workflows.md`
9. `Prompt-07-Hybrid-Group-and-Cloud-Access-Workflows.md`
10. `Prompt-08-Admin-SPFx-Hybrid-Identity-Control-Lane-and-Routing.md`
11. `Prompt-09-Operator-Safety-Sync-Status-Audit-and-History-UX.md`
12. `Prompt-10-Docs-Runbooks-Env-Guidance-and-README-Alignment.md`
13. `Prompt-11-Validation-Reconciliation-and-Phase-9-Exit.md`

## Hard gate

The package must be executed as though the following is a release gate:

- the developer can hand IT the final `.sppkg` and walk away,
- IT can complete operational setup and ongoing maintenance through the app UI and standard Microsoft admin pages where unavoidable,
- and no normal IT setup or use requires code edits, `.env` edits, manifest edits, deployment-template edits, or backend config-file edits.

Allowed:
- standard SharePoint / Microsoft 365 tenant-admin approval steps,
- Graph / API consent,
- existing infrastructure prerequisites that the app can only detect and validate.

Not allowed:
- “set this value in code,”
- “edit this app setting by hand in source,”
- “open the repo and add credentials,”
- or any equivalent developer-only setup dependency.


## Intended execution order

Run the prompts in numeric order.

Do not skip ahead unless a prompt explicitly says to stop because repo truth has materially changed and later prompts would become unsafe.

## What changed from the original package

The original Phase 9 package was structurally strong, but it centered the phase on **broad Entra user/group administration through Graph**.

This replacement package keeps the good parts:

- evidence-first repo truth,
- strict SPFx/frontend vs backend/control-plane separation,
- reuse of existing provisioning/orchestration patterns,
- risk-aware workflows,
- audit/evidence expectations,
- phased execution discipline.

It redirects the phase in four critical ways:

1. **Source-of-authority is now explicit.**
   - Do not assume Entra / Graph is the authority for all user lifecycle actions.
   - Determine where AD DS is authoritative and build to that reality.

2. **On-prem execution is treated as a first-class backend concern.**
   - If AD DS lifecycle actions are in scope, they must run through a secure backend execution boundary, not through SPFx.

3. **Graph is narrowed to the cloud-side role it actually owns.**
   - Graph / Entra remains important for cloud identity visibility, sync-aware operator feedback, cloud-side access, and cloud-only objects.
   - It is not assumed to replace AD DS lifecycle control in a hybrid environment.

4. **Groups and access are authority-routed.**
   - Do not treat AD-synced groups, cloud-only groups, and rollout-critical access groups as one generic domain.

## How the local code agent should use these prompts

- Treat current live repo code and `docs/architecture/blueprint/current-state-map.md` as present-truth authority.
- Use the smallest authoritative file set necessary for each prompt.
- Do **not** re-read files that are still within active context or memory unless:
  - they changed,
  - the prompt explicitly requires a fresh check,
  - the context has gone stale,
  - or the task widened materially.
- Keep the phase boundary intact: build the hybrid identity foundation without backfilling unrelated phases.
- Treat UI-managed connection setup, verification, and maintenance as a hard requirement.
- Treat standard Microsoft admin approval pages as acceptable setup surfaces where unavoidable, but do not satisfy the phase by requiring repo edits or hidden engineering steps.
- Prefer existing repo patterns over inventing a new architecture if the repo already has a sound precedent.

## Key assumptions

- Phase 9 is allowed to build real backend and frontend capability, unlike Phase 1 which was doctrine-first.
- The repo may still lack generalized admin-run contracts from earlier idealized phases. If so, implement the smallest clean phase-local substrate needed for Phase 9 without pretending the whole broader admin control plane is complete.
- Existing provisioning/orchestration patterns are seeds to extend, not discard.
- The current environment likely requires **hybrid identity administration**, not cloud-only Entra lifecycle administration.
- Sensitive values may be entered through the UI only if the backend securely stores/resolves them; SPFx must not become a secret store.
- Microsoft Graph production work should prefer stable v1.0 APIs and least-privileged permissions unless a documented exception is genuinely required.
- AD DS-backed lifecycle work should use the narrowest viable privileged execution model. Do not assume “domain admin everywhere.”

## Execution cautions

- Do not place privileged Graph execution in SPFx.
- Do not place AD DS execution in SPFx.
- Do not let `@hbc/features-admin` become the privileged control plane.
- Do not assume Graph can authoritatively create / update / disable every user object that matters in this environment.
- Do not request or depend on broader Graph permissions than the action matrix requires.
- Do not assume the repo already has an on-prem identity adapter pattern; verify it.
- Do not lump all user, group, and access actions into one unstructured endpoint or one generic UI page.
- Do not treat rollout-critical access actions and authoritative lifecycle actions as identical-risk operations.
- Do not ship destructive identity actions without corresponding audit/evidence behavior and clear guardrails.
- Do not hide sync timing or propagation realities from operators.
- Do not require IT to edit code, env files, deployment templates, or backend config files for normal setup and use once the software is deployed.

## Prerequisite validation expectation

Prompt 01 is expected to verify:

- current repo state,
- existing admin shell reality,
- existing Graph service reality,
- any existing on-prem or hybrid identity execution patterns,
- the current connection/configuration handling reality,
- any missing prerequisites that materially affect Phase 9,
- and the exact hybrid gap map that the rest of the package will close.

## Expected repository outputs

### Documentation
Phase 9 docs under:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/`

### Frontend
Primarily under:
- `apps/admin/**`

### Backend
Primarily under:
- `backend/functions/**`

### Reusable admin package
Only where necessary:
- `packages/features/admin/**`

## Validation posture

Use the smallest meaningful validation set for each prompt, but unlike pure-doc phases, this phase is expected to include real code changes and therefore real tests.

Likely validation includes:

- focused unit tests,
- route/build checks where applicable,
- TypeScript correctness,
- adapter/service-boundary tests,
- and final phase reconciliation.

## Completion standard

The package is complete when the Admin app can execute real **hybrid identity** operations through the privileged backend with:

- a dedicated Hybrid Identity control lane,
- explicit source-of-authority separation,
- explicit Graph permission and on-prem access posture,
- UI-driven setup and maintenance of required backend connections with secure backend handling,
- and audit-backed operator workflows.


## Hard-gate completion standard

The package is not complete unless the local code agent can show that the delivered implementation allows IT to install the app and complete required setup without touching code.
