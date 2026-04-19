# Expanded Findings Register

## Severity scale

- **Critical** — can directly prevent correct hosted operation or cause the repo to declare closure falsely.
- **High** — materially degrades runtime correctness, deployment truth, or operator safety.
- **Medium** — does not necessarily block the lane alone, but weakens correctness or closure rigor.

---

## Finding F-01 — First SharePoint persistence boundary still lacks hosted closure proof

- **Severity:** Critical
- **Status:** Active
- **Current condition:** `LegacyFallbackDiscoveryService.run()` calls `repository.startSyncRun()` before project-index load, folder enumeration, or registry upserts.
- **Root cause:** The first durable SharePoint write boundary is still not closed with sufficient hosted evidence.
- **Impacted seams:** discovery service, discovery repository, HBCentral sync-run list, app-only auth to SharePoint.
- **Why it matters:** If `startSyncRun()` fails, the lane cannot durably prove end-to-end hosted discovery.
- **Target state:** hosted discovery successfully creates and completes a sync-run row and proceeds into downstream boundaries.
- **Closure proof:** hosted run evidence showing sync-run row creation and completion, plus corresponding logs.

## Finding F-02 — Legacy fallback admin/review route registration is not reconciled with the default deployed entrypoint

- **Severity:** Critical
- **Status:** Active
- **Current condition:** review/override routes register through `functions/adminApi/index.ts` and the admin-control-plane host, while the default packaged host still points at `backend/functions/src/index.ts`.
- **Root cause:** host composition and route-registration truth are split across multiple entrypoints without one declared authoritative path for this lane.
- **Impacted seams:** route registration, deploy artifact, runbooks, admin validation expectations.
- **Why it matters:** the repo may document and test one legacy fallback API surface while deploying another.
- **Target state:** one explicit host/entrypoint decision, with all required legacy fallback routes registered from that host and verified after deploy.
- **Closure proof:** explicit entrypoint selection, artifact proof, and post-deploy route/function registration evidence.

## Finding F-03 — Project index provider breaks the field-resolution abstraction

- **Severity:** High
- **Status:** Active
- **Current condition:** the provider resolves field names dynamically, but row mapping still reads `field_2` / `field_3` directly.
- **Root cause:** incomplete refactor from raw field usage to mapper-driven field resolution.
- **Impacted seams:** project-index load, matching quality, schema-drift resilience.
- **Why it matters:** the discovery lane can run successfully but still make incorrect or degraded match decisions.
- **Target state:** field selection and field read logic both use the same canonical resolution contract.
- **Closure proof:** code changes, tests or diagnostics covering non-hardcoded field names, and evidence that provider logic matches mapper doctrine.

## Finding F-04 — Hosting model, IaC, and deployment method truth remain internally inconsistent

- **Severity:** High
- **Status:** Active
- **Current condition:** the repo mixes Flex-style deployment storage with dedicated-plan defaults and docs that still mention `config-zip` for a Flex closure path.
- **Root cause:** hosting evolution happened faster than the repo’s infrastructure, workflow, and runbook reconciliation.
- **Impacted seams:** provisioning, deployment, operator runbooks, cutover proof.
- **Why it matters:** operators can follow the wrong deploy path and still think they are following repo guidance.
- **Target state:** one approved hosting model and one matching deployment path reflected consistently in IaC, workflow, and docs.
- **Closure proof:** reconciled files plus explicit operator instructions that match current platform guidance.

## Finding F-05 — The deploy artifact is still broader than the real runtime objective

- **Severity:** High
- **Status:** Active
- **Current condition:** the package script validates the broad shared host entrypoint and asserts unrelated runtime packages in the staged artifact.
- **Root cause:** artifact logic still mirrors the shared backend package instead of a purpose-fit legacy fallback runtime lane.
- **Impacted seams:** deploy blast radius, runtime closure, dependency risk.
- **Why it matters:** unrelated backend surfaces remain mandatory for a lane that should be narrower.
- **Target state:** the artifact contains only the host entrypoint, code, and dependencies required for the chosen legacy fallback runtime surface.
- **Closure proof:** before/after staged inventory and entrypoint import validation for the narrowed artifact.

## Finding F-06 — Sync-run schema under-models service-level operational truth

- **Severity:** High
- **Status:** Active
- **Current condition:** the discovery service computes matched/review-required/marked-inactive counters, but the shared sync-run model and list descriptor do not persist them as first-class fields.
- **Root cause:** service behavior evolved faster than the shared operational schema.
- **Impacted seams:** reporting, troubleshooting, operator triage, alert/query design.
- **Why it matters:** important run-level truth is trapped in `SummaryJson` instead of being easy to query and compare.
- **Target state:** the sync-run contract persists the counters operators actually need.
- **Closure proof:** model/list/repository alignment and evidence of populated fields from a hosted run.

## Finding F-07 — Closure standards are still too easy to satisfy with deploy-only evidence

- **Severity:** Medium
- **Status:** Active
- **Current condition:** the workflow packages and deploys, and the runbook includes manual checks, but the repo still does not consistently require sync-run, registry, and route-surface proof before closure language is used.
- **Root cause:** closure standards are spread across audit language, runbooks, and informal operator steps.
- **Impacted seams:** release readiness, audit confidence, future regressions.
- **Why it matters:** the lane can be declared “fixed” too early.
- **Target state:** one standard hosted validation path and one reusable closure checklist/template.
- **Closure proof:** updated runbook/checklist plus a completed evidence bundle from a real hosted run.

## Finding F-08 — Prompt-phase residue still obscures current repo truth

- **Severity:** Medium
- **Status:** Active
- **Current condition:** multiple code and doc files still describe behavior as “Prompt 01 / Prompt 03 / Prompt 07” or explicitly say some implementation is deferred.
- **Root cause:** phase-driven implementation notes were never fully normalized into timeless operational language.
- **Impacted seams:** maintainability, clarity, future audits.
- **Why it matters:** it weakens the distinction between historical plan language and current production/staging truth.
- **Target state:** repo comments and runbooks describe the actual current contract, not historical prompt choreography.
- **Closure proof:** cleaned comments/docs in all touched seams.
